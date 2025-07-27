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
      await say(` FIFTEEN AND COUNTING!  \n${randomResponse}\nThe daydreams keep flowing! ✨`);
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

app.command('/responses', async ({ command, ack, say }) => {
  await ack();
  try {
    await say(`Daydream responses here: https://app.fillout.com/editor/${FORM_ID}/results`);
  } catch (err) {
    console.error('Error in /responses command:', err);
    await say(`⚠️ Oops! Something went wrong getting the responses link.`);
  }
});

app.command('/github', async ({ command, ack, say }) => {
  await ack();
  try {
    await say(`Daydream Adelaide GitHub: https://github.com/olii-dev/daydream-adelaide`);
  } catch (err) {
    console.error('Error in /github command:', err);
    await say(`⚠️ Oops! Something went wrong getting the GitHub link.`);
  }
});

app.command('/days-until', async ({ command, ack, say }) => {
  await ack();
  try {
    const today = new Date();
    const targetDate = new Date(today.getFullYear(), 8, 27); // September is month 8 (0-indexed)
    
    // If we've already passed Sept 27 this year, count to next year
    if (today > targetDate) {
      targetDate.setFullYear(today.getFullYear() + 1);
    }
    
    const timeDiff = targetDate.getTime() - today.getTime();
    const daysUntil = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysUntil === 0) {
      await say(`🎉 IT'S SEPTEMBER 27TH TODAY! The day is finally here! 🎊`);
    } else if (daysUntil === 1) {
      await say(`⏰ Just *1 day* until September 27th! Tomorrow's the big day! 🚀`);
    } else {
      await say(`📅 There are *${daysUntil} days* until September 27th! ⏳✨`);
    }
  } catch (err) {
    console.error('Error in /days-until command:', err);
    await say(`⚠️ Oops! Something went wrong calculating the countdown.`);
  }
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Bolt app is running!');
})();