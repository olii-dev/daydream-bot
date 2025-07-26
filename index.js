require('dotenv').config();
const { App } = require('@slack/bolt');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const FILLOUT_BASE = 'https://api.fillout.com';
const FORM_ID = 'eNMLgBqrykus';

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

async function getSubmissionCount() {
  const fetchFunc = await fetch;
  const url = `${FILLOUT_BASE}/v1/api/forms/${FORM_ID}/submissions?status=finished&pageSize=1`;
  const resp = await fetchFunc(url, {
    headers: { Authorization: `Bearer ${process.env.FILLOUT_API_KEY}` }
  });
  const text = await resp.text();
  if (!resp.ok) {
    throw new Error(`API error ${resp.status}: ${text}`);
  }
  const data = JSON.parse(text);
  return data.totalResponses || data.length || 0;
}

app.command('/daydream-count', async ({ command, ack, say }) => {
  await ack();
  try {
    const count = await getSubmissionCount();
    
    // Fun random responses
    const responses = [
      `🎉 Woohoo! There are currently *${count}* dreamers who've filled out our form!`,
      `✨ Amazing! *${count}* people have submitted their wildest daydreams through the form!`,
      `🌟 Incredible! We've collected *${count}* fantastic form submissions!`,
      `🚀 Blast off! *${count}* form submissions have landed in our daydream database!`,
      `💫 Mind-blowing! *${count}* creative souls have completed our daydream form!`,
      `🎪 Step right up! We've got *${count}* spectacular form responses!`,
      `🌈 Rainbow power! *${count}* colorful daydreams have been submitted via our form!`,
      `⚡ Electric! *${count}* high-voltage form submissions are in the books!`
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    // Add extra flair for milestone numbers
    if (count === 20) {
      await say(`🎊 TWENTY SUBMISSIONS! 🎊\n${randomResponse}\nWe're really gaining momentum now! 🚀`);
    } else if (count === 15) {
      await say(`� FIFTEEN AND COUNTING! �\n${randomResponse}\nThe daydreams keep flowing! ✨`);
    } else if (count === 10) {
      await say(`🎉 DOUBLE DIGITS! 🎉\n${randomResponse}\nWe've hit the big 1-0! 🥳`);
    } else if (count === 5) {
      await say(`FIRST FIVE SUBMISSIONS!\n${randomResponse}\nWhat a great start! 🎯`);
    } else {
      await say(randomResponse);
    }
  } catch (err) {
    await say(`⚠️ Oops! Our daydream counter hit a snag: ${err.message}`);
  }
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Bolt app is running!');
})();