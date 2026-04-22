import os
import sys
import requests

sys.stdout.reconfigure(encoding='utf-8')

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")
REPO = os.environ.get("BUILD_REPOSITORY_NAME", "expertsandy/test1")
PR_NUMBER = os.environ.get("SYSTEM_PULLREQUEST_PULLREQUESTNUMBER")

GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key={GEMINI_API_KEY}"

import time

def call_gemini(prompt, retries=5):
    for attempt in range(retries):
        response = requests.post(GEMINI_URL, json={
            "contents": [{"parts": [{"text": prompt}]}]
        })
        data = response.json()
        if response.ok:
            return data["candidates"][0]["content"]["parts"][0]["text"]
        if response.status_code == 503:
            wait = (attempt + 1) * 20
            print(f"Gemini 503 - retrying in {wait}s (attempt {attempt+1}/{retries})")
            time.sleep(wait)
        else:
            raise Exception(f"Gemini error: {data}")
    raise Exception("Gemini unavailable after 5 retries")


def get_pr_diff():
    print(f"PR_NUMBER: {PR_NUMBER}")
    print(f"REPO: {REPO}")
    print(f"Token present: {bool(GITHUB_TOKEN)}")
    print(f"Token length: {len(GITHUB_TOKEN) if GITHUB_TOKEN else 0}")
    if not PR_NUMBER:
        print("No PR number found - skipping analysis")
        return None
    headers = {"Authorization": f"token {GITHUB_TOKEN}"}
    url = f"https://api.github.com/repos/{REPO}/pulls/{PR_NUMBER}/files"
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    files = response.json()
    diff = ""
    for f in files[:10]:
        diff += f"\nFile: {f['filename']} (+{f['additions']} -{f['deletions']})\n"
        diff += (f.get("patch") or "")[:1500]
    return diff


def post_pr_comment(body):
    if not PR_NUMBER:
        print("No PR - printing report to console only")
        print(body)
        return
    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Content-Type": "application/json"
    }
    url = f"https://api.github.com/repos/{REPO}/issues/{PR_NUMBER}/comments"
    response = requests.post(url, headers=headers, json={"body": body})
    if response.ok:
        print(f"Agent report posted to PR #{PR_NUMBER}")
    else:
        print(f"Failed to post comment: {response.text}")


def qa_agent(diff):
    print("QA Agent running...")
    prompt = f"""You are a QA engineer reviewing code changes.
Analyse this diff and provide:
1. Code quality issues (complexity, readability, duplication)
2. Missing error handling
3. Performance concerns
4. Best practice violations

Keep it concise - max 5 bullet points total.

Diff:
{diff}"""
    return call_gemini(prompt)


def security_agent(diff):
    print("Security Agent running...")
    prompt = f"""You are a security engineer reviewing code changes.
Analyse this diff and check for:
1. Hardcoded secrets, API keys, passwords
2. SQL injection or XSS vulnerabilities
3. Insecure dependencies or imports
4. Missing input validation
5. Exposed sensitive data

Keep it concise - max 5 bullet points. If nothing found, say CLEAR.

Diff:
{diff}"""
    return call_gemini(prompt)


def test_agent(diff):
    print("Test Agent running...")
    prompt = f"""You are a senior developer writing unit tests.
Based on this diff, suggest the most important unit tests that should be written.
Provide 2-3 specific test cases with:
- Test name
- What it tests
- Expected behaviour

Keep it concise and actionable.

Diff:
{diff}"""
    return call_gemini(prompt)


def coordinator(qa_report, security_report, test_report):
    print("Coordinator compiling final report...")
    report = f"""## AI Multi-Agent Code Analysis

> Powered by 3 specialized AI agents via JaiShanidev Pipeline

---

### QA Agent Report
{qa_report}

---

### Security Agent Report
{security_report}

---

### Test Agent Suggestions
{test_report}

---
*Agents: QA Agent | Security Agent | Test Agent | Coordinator*
*Model: Gemini 2.5 Flash | Triggered by: Azure DevOps Pipeline*"""
    return report


def main():
    print("JaiShanidev Multi-Agent Crew starting...")

    diff = get_pr_diff()
    if not diff:
        print("No diff available - skipping analysis")
        sys.exit(0)

    print(f"Analysing {len(diff)} chars of diff...")

    qa_report = qa_agent(diff)
    security_report = security_agent(diff)
    test_report = test_agent(diff)

    final_report = coordinator(qa_report, security_report, test_report)
    post_pr_comment(final_report)

    print("All agents completed successfully!")


if __name__ == "__main__":
    main()