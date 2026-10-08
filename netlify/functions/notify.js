/**
 * PKI-TRACKER — 24/7 Smart Notification Serverless Function
 * Runs on Netlify (100% Free / $0 Cost)
 * Endpoint: /.netlify/functions/notify or /api/notify
 */
const https = require('https');

const KV_BUCKET = process.env.KV_BUCKET || 'LJofqkL8XmtecR6kh3uqmA';

function httpRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    });
    req.on('error', (err) => reject(err));
    if (postData) req.write(postData);
    req.end();
  });
}

function getISTDate() {
  const d = new Date();
  const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  return new Date(utc + (5.5 * 3600000));
}

function getTodayStr() {
  return getISTDate().toISOString().split('T')[0];
}

async function getKV(key, fallback = {}) {
  try {
    const res = await httpRequest({
      hostname: 'kvdb.io',
      path: `/${KV_BUCKET}/${key}`,
      method: 'GET'
    });
    if (res.statusCode === 200 && res.body) {
      return JSON.parse(res.body);
    }
  } catch (e) {}
  return fallback;
}

async function setKV(key, val) {
  try {
    const body = JSON.stringify(val);
    await httpRequest({
      hostname: 'kvdb.io',
      path: `/${KV_BUCKET}/${key}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, body);
  } catch (e) {}
}

async function sendTelegram(botToken, chatId, text, buttonText, buttonUrl) {
  if (!botToken || !chatId) return { skipped: true, reason: 'missing_credentials' };
  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML'
  };
  if (buttonText && buttonUrl) {
    payload.reply_markup = {
      inline_keyboard: [[{ text: buttonText, url: buttonUrl }]]
    };
  }
  const body = JSON.stringify(payload);
  const res = await httpRequest({
    hostname: 'api.telegram.org',
    path: `/bot${botToken}/sendMessage`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    }
  }, body);
  try {
    return JSON.parse(res.body);
  } catch (e) {
    return { statusCode: res.statusCode, body: res.body };
  }
}

async function sendOneSignal(appId, restKey, title, message, url) {
  if (!appId || !restKey) return { skipped: true, reason: 'missing_credentials' };
  const payload = {
    app_id: appId,
    included_segments: ['Total Subscriptions'],
    headings: { en: title },
    contents: { en: message },
    url: url
  };
  const body = JSON.stringify(payload);
  const res = await httpRequest({
    hostname: 'onesignal.com',
    path: '/api/v1/notifications',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Key ${restKey}`,
      'Content-Length': Buffer.byteLength(body)
    }
  }, body);
  try {
    return JSON.parse(res.body);
  } catch (e) {
    return { statusCode: res.statusCode, body: res.body };
  }
}

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const query = event.queryStringParameters || {};
  let bodyData = {};
  if (event.body) {
    try { bodyData = JSON.parse(event.body); } catch (e) {}
  }
  const params = { ...query, ...bodyData };
  const action = params.action || 'check';

  const config = await getKV('config', {});
  const TELEGRAM_BOT_TOKEN = params.token || process.env.TELEGRAM_BOT_TOKEN || config.token || '';
  const TELEGRAM_CHAT_ID = params.chat_id || process.env.TELEGRAM_CHAT_ID || config.chatId || '';
  const ONESIGNAL_APP_ID = params.onesignal_app_id || process.env.ONESIGNAL_APP_ID || config.onesignalAppId || '8b464609-3bac-45ac-ab5d-f0f98ea93f32';
  const ONESIGNAL_REST_API_KEY = params.onesignal_key || process.env.ONESIGNAL_REST_API_KEY || config.onesignalKey || '';
  const WEB_APP_URL = params.web_url || process.env.WEB_APP_URL || config.webUrl || 'https://ccfocusboard.netlify.app';

  const today = getTodayStr();
  const now = getISTDate();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  // 1. SAVE CONFIG (From settings in Web App)
  if (action === 'save_config') {
    if (params.token || params.chat_id) {
      const newConfig = {
        token: TELEGRAM_BOT_TOKEN,
        chatId: TELEGRAM_CHAT_ID,
        onesignalAppId: ONESIGNAL_APP_ID,
        onesignalKey: ONESIGNAL_REST_API_KEY,
        webUrl: WEB_APP_URL,
        updatedAt: now.toISOString()
      };
      await setKV('config', newConfig);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ok: true, message: 'Settings saved to cloud KV storage!' })
      };
    }
  }

  // 2. MARK APP OPENED (When user visits tracker)
  if (action === 'open') {
    let state = await getKV('state', {});
    state.lastOpenedDate = today;
    state.lastOpenedAt = now.toISOString();
    await setKV('state', state);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, message: `Tracker marked opened for date: ${today}` })
    };
  }

  // 3. SYNC LIVE HABITS STATE (When habits are marked)
  if (action === 'sync') {
    let state = await getKV('state', {});
    const pending = parseInt(params.pending, 10);
    const filled = parseInt(params.filled, 10);
    state.date = today;
    state.unfilledCount = isNaN(pending) ? (state.unfilledCount ?? 7) : pending;
    state.filledCount = isNaN(filled) ? (state.filledCount ?? 0) : filled;
    state.isAllFilled = (state.unfilledCount === 0);
    state.lastSyncAt = now.toISOString();
    await setKV('state', state);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, state })
    };
  }

  // 4. TEST NOTIFICATION
  if (action === 'test') {
    const tgMsg = `🔥 <b>PKI Discipline Tracker — Cloud Test Alert</b>\n\n` +
      `✅ <b>Netlify Serverless Function & Telegram Connected!</b>\n` +
      `🕒 <b>Time:</b> ${now.toLocaleTimeString('en-IN')} IST\n\n` +
      `24/7 Smart Notification Engine is active and ready.`;

    const tgRes = await sendTelegram(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, tgMsg, '🚀 Open PKI Tracker', WEB_APP_URL);
    const oneRes = await sendOneSignal(ONESIGNAL_APP_ID, ONESIGNAL_REST_API_KEY, '🔥 PKI Discipline Tracker', 'Cloud Test Alert from Netlify Function!', WEB_APP_URL);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        ist_time: now.toLocaleTimeString('en-IN'),
        telegram: tgRes,
        onesignal: oneRes
      })
    };
  }

  // 5. PERIODIC CHECK (Called by Cron-job.org every 10-15 minutes)
  let state = await getKV('state', { date: today, unfilledCount: 7, isAllFilled: false });
  let actionTaken = 'none';
  let messageSent = null;

  // Morning Window: 09:00 AM – 10:00 AM IST
  const isMorningWindow = (hours === 9) || (hours === 10 && minutes === 0);
  if (isMorningWindow) {
    const isAppOpenedToday = (state.lastOpenedDate === today);
    if (!isAppOpenedToday) {
      actionTaken = 'morning_reminder_sent';
      const tgMsg = `🌅 <b>Good Morning! PKI Discipline Tracker</b>\n\n` +
        `⚠️ <b>ಇಂದಿನ PKI Tracker ವೆಬ್‌ಸೈಟ್ ಅನ್ನು ನೀವು ಇನ್ನೂ ಓಪನ್ ಮಾಡಿಲ್ಲ!</b>\n` +
        `ದಯವಿಟ್ಟು ತಕ್ಷಣ ಓಪನ್ ಮಾಡಿ ಇಂದಿನ ಗುರಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.\n\n` +
        `⏰ <i>(ವೆಬ್‌ಸೈಟ್ ಓಪನ್ ಮಾಡುವವರೆಗೂ ಪ್ರತಿ 10-15 ನಿಮಿಷಕ್ಕೆ ರಿಮೈಂಡರ್ ಬರುತ್ತದೆ)</i>`;
      const pushTitle = '🌅 Good Morning! PKI Tracker Reminder';
      const pushMsg = 'ಇಂದಿನ PKI Tracker ವೆಬ್‌ಸೈಟ್ ಅನ್ನು ನೀವು ಇನ್ನೂ ಓಪನ್ ಮಾಡಿಲ್ಲ! ತಕ್ಷಣ ಓಪನ್ ಮಾಡಿ.';

      await sendTelegram(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, tgMsg, '🚀 Open PKI Tracker', WEB_APP_URL);
      await sendOneSignal(ONESIGNAL_APP_ID, ONESIGNAL_REST_API_KEY, pushTitle, pushMsg, WEB_APP_URL);
      messageSent = 'Morning reminder dispatched';
    } else {
      actionTaken = 'morning_already_opened';
    }
  }

  // Night Window: 09:00 PM – 11:59 PM IST
  const isNightWindow = (hours >= 21 && hours <= 23);
  if (isNightWindow) {
    const hasUnfilled = !state.isAllFilled && (state.unfilledCount > 0);
    if (hasUnfilled) {
      actionTaken = 'night_reminder_sent';
      const count = state.unfilledCount || 7;
      const tgMsg = `🌙 <b>Daily Activity Reminder (ರಾತ್ರಿ ರಿಮೈಂಡರ್)</b>\n\n` +
        `⚠️ <b>ಇಂದಿನ ${count} ಚಟುವಟಿಕೆಗಳು (Activities) ಇನ್ನೂ ಖಾಲಿ ಇವೆ!</b>\n` +
        `ನಿಮ್ಮ Streak ಕಾಯ್ದುಕೊಳ್ಳಲು ದಯವಿಟ್ಟು ಎಲ್ಲ ಹ್ಯಾಬಿಟ್‌ಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ (Done / Not Done).\n\n` +
        `⏰ <i>(ಎಲ್ಲಾ ಆಕ್ಟಿವಿಟಿ ಭರ್ತಿ ಮಾಡುವವರೆಗೂ ಪ್ರತಿ 10-15 ನಿಮಿಷಕ್ಕೆ ರಿಮೈಂಡರ್ ಬರುತ್ತದೆ)</i>`;
      const pushTitle = '🌙 Daily Habit Activity Reminder';
      const pushMsg = `ಇಂದಿನ ${count} ಚಟುವಟಿಕೆಗಳು ಇನ್ನೂ ಖಾಲಿ ಇವೆ! streak ಉಳಿಸಲು ತಕ್ಷಣ ಭರ್ತಿ ಮಾಡಿ.`;

      await sendTelegram(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, tgMsg, '📝 Fill Activities Now', WEB_APP_URL);
      await sendOneSignal(ONESIGNAL_APP_ID, ONESIGNAL_REST_API_KEY, pushTitle, pushMsg, WEB_APP_URL);
      messageSent = 'Night reminder dispatched';
    } else {
      actionTaken = 'night_all_filled';
    }
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      ok: true,
      time_ist: `${hours}:${String(minutes).padStart(2, '0')}`,
      date: today,
      window: isMorningWindow ? 'morning' : (isNightWindow ? 'night' : 'idle'),
      actionTaken,
      messageSent,
      state
    })
  };
};
