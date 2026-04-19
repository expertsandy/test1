const { app } = require('@azure/functions');
const { Octokit } = require('@octokit/rest');
const crypto = require('crypto');

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

function verifySignature(body, signature) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(body).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

async function callGemini(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(data));
  return data.candidates[0].content.parts[0].text;
}

app.http('prReview', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const body = await request.text();
      const signature = request.headers.get('x-hub-signature-256');
      if (!signature || !verifySignature(body, signature)) {
        return { status: 401, body: 'Invalid signature' };
      }
      const event = request.headers.get('x-github-event');
      if (event !== 'pull_request') {
        return { status: 200, body: 'Not a PR event, skipping' };
      }
      const payload = JSON.parse(body);
      if (!['opened', 'synchronize'].includes(payload.action)) {
        return { status: 200, body: `Action '${payload.action}' ignored` };
      }
      const owner = payload.repository.owner.login;
      const repo = payload.repository.name;
      const pullNumber = payload.pull_request.number;
      const prTitle = payload.pull_request.title;
      const prBody = payload.pull_request.body || 'No description';
      context.log(`Reviewing PR #${pullNumber}: ${prTitle}`);
      const { data: files } = await octokit.pulls.listFiles({
        owner, repo, pull_number: pullNumber
      });
      const diffSummary = files.slice(0, 10).map(f =>
        `File: ${f.filename} (+${f.additions} -${f.deletions})\n${(f.patch || '').slice(0, 1500)}`
      ).join('\n\n---\n\n');
      const prompt = `You are an expert code reviewer. Review this pull request.

PR Title: ${prTitle}
PR Description: ${prBody}
Changed files (${files.length} total):
${diffSummary}

Provide a structured review with:
1. **Summary** - What this PR does
2. **Strengths** - What is done well
3. **Issues** - Any bugs or concerns
4. **Suggestions** - Improvements
5. **Verdict** - APPROVE / REQUEST_CHANGES / COMMENT`;

      const review = await callGemini(prompt);
      const comment = `## 🤖 AI Code Review\n\n${review}\n\n---\n*Reviewed by Gemini 2.5 Flash via JaiShanidev PR Bot*`;
      await octokit.issues.createComm