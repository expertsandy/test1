import os
import sys
import json
import base64
import requests

sys.stdout.reconfigure(encoding='utf-8')

ADO_PAT = os.environ.get("ADO_PAT")
ADO_ORG = os.environ.get("ADO_ORG", "karmadhipatishanidev")
ADO_PROJECT = os.environ.get("ADO_PROJECT", "JaiShanidev")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
PR_NUMBER = os.environ.get("SYSTEM_PULLREQUEST_PULLREQUESTNUMBER")
BUILD_ID = os.environ.get("BUILD_BUILDID", "unknown")

GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"

def ado_headers():
    token = base64.b64encode(f":{ADO_PAT}".encode()).decode()
    return {
        "Authorization": f"Basic {token}",
        "Content-Type": "application/json"
    }

def call_gemini(prompt):
    response = requests.post(GEMINI_URL, json={
        "contents": [{"parts": [{"text": prompt}]}]
    })
    data = response.json()
    if response.ok:
        return data["candidates"][0]["content"]["parts"][0]["text"]
    return f"Gemini unavailable: {response.status_code}"

def get_pr_diff():
    GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")
    REPO = os.environ.get("BUILD_REPOSITORY_NAME", "expertsandy/test1")
    if not PR_NUMBER:
        print("No PR number - skipping diff fetch")
        return None
    headers = {"Authorization": f"token {GITHUB_TOKEN}"}
    url = f"https://api.github.com/repos/{REPO}/pulls/{PR_NUMBER}/files"
    response = requests.get(url, headers=headers)
    if not response.ok:
        print(f"Failed to fetch diff: {response.status_code}")
        return None
    files = response.json()
    diff = ""
    for f in files[:10]:
        diff += f"\nFile: {f['filename']} (+{f['additions']} -{f['deletions']})\n"
        diff += (f.get("patch") or "")[:1000]
    return diff

def extract_issues(diff):
    print("Extracting issues from diff...")
    prompt = f"""Analyse this code diff and identify specific actionable issues that should become work items.

For each issue found, output EXACTLY in this format (one per line, pipe-separated):
TYPE|TITLE|DESCRIPTION

Where TYPE is either Bug or Task.
TITLE is max 10 words.
DESCRIPTION is max 30 words.

Find max 3 issues. If no real issues found, output: NONE

Diff:
{diff}"""
    result = call_gemini(prompt)
    print(f"Gemini response: {result[:200]}")
    return result

def create_work_item(item_type, title, description):
    url = f"https://dev.azure.com/{ADO_ORG}/{ADO_PROJECT}/_apis/wit/workitems/${item_type}?api-version=7.0"
    body = [
        {"op": "add", "path": "/fields/System.Title", "value": title},
        {"op": "add", "path": "/fields/System.Description", "value": description},
        {"op": "add", "path": "/fields/System.Tags", "value": "ai-agent; auto-created"},
        {"op": "add", "path": "/fields/Microsoft.VSTS.Common.Priority", "value": 2},
    ]
    headers = ado_headers()
    headers["Content-Type"] = "application/json-patch+json"
    response = requests.patch(url, json=body, headers=headers)
    if response.ok:
        item = response.json()
        print(f"Created {item_type}: #{item['id']} - {title}")
        return item['id']
    else:
        print(f"Failed to create work item: {response.status_code} - {response.text}")
        return None

def parse_and_create_items(gemini_output):
    if not gemini_output or "NONE" in gemini_output.upper():
        print("No issues found to create as work items")
        return 0

    created = 0
    for line in gemini_output.strip().split("\n"):
        line = line.strip()
        if "|" not in line:
            continue
        parts = line.split("|")
        if len(parts) < 3:
            continue
        item_type = parts[0].strip()
        title = parts[1].strip()[:128]
        description = parts[2].strip()[:512]

        if item_type not in ["Bug", "Task"]:
            item_type = "Task"

        description_full = f"{description}<br><br><i>Auto-created by AI Agent from PR #{PR_NUMBER} (Build #{BUILD_ID})</i>"
        item_id = create_work_item(item_type, title, description_full)
        if item_id:
            created += 1

    return created

def main():
    print("Boards Agent starting...")
    print(f"ADO Org: {ADO_ORG}, Project: {ADO_PROJECT}")
    print(f"PR Number: {PR_NUMBER}, Build: {BUILD_ID}")

    if not ADO_PAT:
        print("ADO_PAT not set - skipping boards automation")
        sys.exit(0)

    diff = get_pr_diff()
    if not diff:
        print("No diff available - skipping")
        sys.exit(0)

    gemini_output = extract_issues(diff)
    count = parse_and_create_items(gemini_output)
    print(f"Boards Agent complete - created {count} work items")

if __name__ == "__main__":
    main()