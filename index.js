require('dotenv').config();
const { App } = require('@slack/bolt');
const fetch = require('node-fetch');

const FILLOUT_BASE = 'https://api.fillout.com';
const FORM_ID = 'eNMLgBqrykus';

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

async function getSubmissionCount() {
  const url = `${FILLOUT_BASE}/v1/api/forms/${FORM_ID}/responses?status=complete&pageSize=1`;
  const resp = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.FILLOUT_API_KEY}` }
  });
  if (!resp.ok) throw new Error(`API error ${resp.status}`);
  const data = await resp.json();
  return data.totalCount || data.length || 0;
}

app.command('/daydream-count', async ({ command, ack, say }) => {
  await ack();
  try {
    const count = await getSubmissionCount();
    await say(`🎉 There are currently *${count}* completed submissions for the Daydream form.`);
  } catch (err) {
    await say(`⚠️ Error fetching count: ${err.message}`);
  }
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Bolt app is running!');
})();