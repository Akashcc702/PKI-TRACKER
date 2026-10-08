/**
 * PKI-TRACKER — Unified Smart Notification Engine (OneSignal Web Push + Telegram Bot)
 * 
 * Rules:
 *  1) 09:00 AM – 10:00 AM IST: Remind user to open website every 10 min until opened.
 *  2) 09:00 PM – 11:59 PM IST: Check if today's activity is empty/unfilled. If so, remind every 10 min until filled.
 * 
 * Channels:
 *  - Channel A: Direct Browser Web Push (OneSignal REST API)
 *  - Channel B: Telegram Bot Chat Alerts (Telegram Bot API)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  // Telegram Credentials
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID || '',

  // OneSignal Credentials
  ONESIGNAL_APP_ID: process.env.ONESIGNAL_APP_ID || '8b464609-3bac-45ac-ab5d-f0f98ea93f32',
  ONESIGNAL_REST_API_KEY: process.env.ONESIGNAL_REST_API_KEY || '',

  // App URL
  WEB_APP_URL: process.env.WEB_APP_URL || 'https://ccfocusboard.netlify.app',
  STATE_FILE: path.join(__dirname, 'tracker-state.json')
};

// Try loading local config if env vars are missing
try {
  const localConfigPath = path.join(__dirname, 'notification-config.json');
  if (fs.existsSync(localConfigPath)) {
    const localCfg = JSON.parse(fs.readFileSync(localConfigPath, 'utf8'));
    CONFIG.TELEGRAM_BOT_TOKEN = CONFIG.TELEGRAM_BOT_TOKEN || localCfg.telegram_bot_token;
    CONFIG.TELEGRAM_CHAT_ID = CONFIG.TELEGRAM_CHAT_ID || localCfg.telegram_chat_id;
    CONFIG.ONESIGNAL_APP_ID = CONFIG.ONESIGNAL_APP_ID || localCfg.onesignal_app_id;
    CONFIG.ONESIGNAL_REST_API_KEY = CONFIG.ONESIGNAL_REST_API_KEY || localCfg.onesignal_rest_api_key;
    CONFIG.WEB_APP_URL = CONFIG.WEB_APP_URL || localCfg.web_app_url;
  }
} catch (e) {
  // ignore
}

/**
 * Get current time in IST (UTC+5:30)
 */
function getNowInTimezone() {
  const date = new Date();
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  const istOffset = 5.5 * 60 * 60 * 1000;
  return new Date(utc + istOffset);
}

function getTodayStr() {
  const d = getNowInTimezone();
  return d.toISOString().split('T')[0];
}

/**
 * State Management
 */
function loadState() {
  const today = getTodayStr();
  const defaultState = {
    date: today,
    lastOpenedDate: '',
    lastOpenedAt: '',
    unfilledCount: 7,
    isAllFilled: false,
    lastMorningNotifAt: '',
    lastNightNotifAt: ''
  };

  try {
    if (fs.existsSync(CONFIG.STATE_FILE)) {
      const data = JSON.parse(fs.readFileSync(CONFIG.STATE_FILE, 'utf8'));
      if (data.date === today) {
        return data;
      }
    }
  } catch (err) {
    console.error('Failed reading state file:', err.message);
  }
  return defaultState;
}

function saveState(state) {
  try {
    fs.writeFileSync(CONFIG.STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed saving state file:', err.message);
  }
}

/**
 * Send Direct Browser Web Push via OneSignal REST API
 */
function sendOneSignalPush(title, message, url) {
  return new Promise((resolve, reject) => {
    if (!CONFIG.ONESIGNAL_APP_ID || !CONFIG.ONESIGNAL_REST_API_KEY) {
      console.log('ℹ️ OneSignal credentials not set, skipping OneSignal push.');
      return resolve({ skipped: true });
    }

    const payload = {
      app_id: CONFIG.ONESIGNAL_APP_ID,
      included_segments: ['Total Subscriptions'],
      headings: { en: title },
      contents: { en: message },
      url: url || CONFIG.WEB_APP_URL
    };

    const dataString = JSON.stringify(payload);
    const authHeader = CONFIG.ONESIGNAL_REST_API_KEY.startsWith('Key ') || CONFIG.ONESIGNAL_REST_API_KEY.startsWith('Basic ')
      ? CONFIG.ONESIGNAL_REST_API_KEY
      : `Key ${CONFIG.ONESIGNAL_REST_API_KEY}`;

    const options = {
      hostname: 'onesignal.com',
      port: 443,
      path: '/api/v1/notifications',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'Content-Length': Buffer.byteLength(dataString)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            console.error('OneSignal Error Response:', body);
            resolve({ error: parsed });
          }
        } catch (e) {
          resolve({ error: body });
        }
      });
    });

    req.on('error', (err) => {
      console.error('OneSignal Request Error:', err.message);
      resolve({ error: err.message });
    });

    req.write(dataString);
    req.end();
  });
}

/**
 * Send Telegram Message via Telegram Bot API
 */
function sendTelegramMessage(text, buttonText, buttonUrl) {
  return new Promise((resolve, reject) => {
    if (!CONFIG.TELEGRAM_BOT_TOKEN || !CONFIG.TELEGRAM_CHAT_ID) {
      console.log('ℹ️ Telegram credentials not set, skipping Telegram notification.');
      return resolve({ skipped: true });
    }

    const payload = {
      chat_id: CONFIG.TELEGRAM_CHAT_ID,
      text: text,
      parse_mode: 'HTML'
    };

    if (buttonText && buttonUrl) {
      payload.reply_markup = {
        inline_keyboard: [
          [{ text: buttonText, url: buttonUrl }]
        ]
      };
    }

    const dataString = JSON.stringify(payload);

    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${CONFIG.TELEGRAM_BOT_TOKEN}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(dataString)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.ok) {
            resolve(parsed);
          } else {
            console.error('Telegram API error:', parsed.description);
            resolve({ error: parsed });
          }
        } catch (e) {
          resolve({ error: body });
        }
      });
    });

    req.on('error', (err) => {
      console.error('Telegram Request Error:', err.message);
      resolve({ error: err.message });
    });

    req.write(dataString);
    req.end();
  });
}

/**
 * Send to BOTH OneSignal and Telegram simultaneously
 */
async function dispatchDualNotification(title, plainMessage, formattedTelegramHtml, buttonText, targetUrl) {
  const promises = [];

  // 1. OneSignal Direct Browser Push
  promises.push(sendOneSignalPush(title, plainMessage, targetUrl));

  // 2. Telegram Messenger Alert
  promises.push(sendTelegramMessage(formattedTelegramHtml, buttonText, targetUrl));

  const results = await Promise.allSettled(promises);
  console.log('📢 Dispatched notification to OneSignal & Telegram.');
  return results;
}

/**
 * Main Check Logic
 */
async function runCheck() {
  const now = getNowInTimezone();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const today = getTodayStr();
  const state = loadState();

  console.log(`[${now.toISOString()}] Running check... Time: ${hours}:${String(minutes).padStart(2, '0')} IST | Date: ${today}`);

  // ── 1. MORNING WINDOW: 09:00 AM – 10:00 AM IST ───────────
  const isMorningWindow = (hours === 9) || (hours === 10 && minutes === 0);

  if (isMorningWindow) {
    const isAppOpenedToday = (state.lastOpenedDate === today);

    if (!isAppOpenedToday) {
      console.log('🌅 Morning check: Web app NOT opened today. Sending Dual Notification...');
      const title = '🌅 Good Morning! PKI Tracker Reminder';
      const plainMsg = 'ಇಂದಿನ PKI Tracker ವೆಬ್‌ಸೈಟ್ ಅನ್ನು ನೀವು ಇನ್ನೂ ಓಪನ್ ಮಾಡಿಲ್ಲ! ತಕ್ಷಣ ಓಪನ್ ಮಾಡಿ ಪರಿಶೀಲಿಸಿ.';
      const tgMsg = `🌅 <b>Good Morning! Discipline Tracker Reminder</b>\n\n` +
        `⚠️ <b>ಇಂದಿನ PKI Tracker ವೆಬ್‌ಸೈಟ್ ಅನ್ನು ನೀವು ಇನ್ನೂ ಓಪನ್ ಮಾಡಿಲ್ಲ!</b>\n` +
        `ದಯವಿಟ್ಟು ತಕ್ಷಣ ಓಪನ್ ಮಾಡಿ ಇಂದಿನ ಗುರಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.\n\n` +
        `⏰ <i>(ವೆಬ್‌ಸೈಟ್ ಓಪನ್ ಮಾಡುವವರೆಗೂ ಪ್ರತಿ 10 ನಿಮಿಷಕ್ಕೆ ನೋಟಿಫಿಕೇಶನ್ ಬರುತ್ತದೆ - 10:00 AM ವರೆಗೆ)</i>`;

      try {
        await dispatchDualNotification(title, plainMsg, tgMsg, '🚀 Open PKI Tracker', CONFIG.WEB_APP_URL);
        state.lastMorningNotifAt = now.toISOString();
        saveState(state);
        console.log('✅ Morning reminder sent successfully to all channels.');
      } catch (err) {
        console.error('❌ Failed sending morning reminder:', err.message);
      }
    } else {
      console.log('✅ Morning check: Web app was already opened today. No reminder needed.');
    }
  }

  // ── 2. NIGHT WINDOW: 09:00 PM – 11:59 PM IST ─────────────
  const isNightWindow = (hours >= 21 && hours <= 23);

  if (isNightWindow) {
    const hasUnfilledActivities = !state.isAllFilled && (state.unfilledCount > 0);

    if (hasUnfilledActivities) {
      console.log(`🌙 Night check: ${state.unfilledCount} activities still empty. Sending reminder...`);
      const title = '🌙 Daily Habit Activity Reminder';
      const plainMsg = `ಇಂದಿನ ${state.unfilledCount} ಚಟುವಟಿಕೆಗಳು ಇನ್ನೂ ಖಾಲಿ ಇವೆ! streak ಉಳಿಸಲು ತಕ್ಷಣ ಭರ್ತಿ ಮಾಡಿ.`;
      const tgMsg = `🌙 <b>Daily Activity Reminder (ರಾತ್ರಿ ರಿಮೈಂಡರ್)</b>\n\n` +
        `⚠️ <b>ಇಂದಿನ ${state.unfilledCount} ಚಟುವಟಿಕೆಗಳು (Activities) ಇನ್ನೂ ಖಾಲಿ ಇವೆ!</b>\n` +
        `ನಿಮ್ಮ Streak ಕಾಯ್ದುಕೊಳ್ಳಲು ದಯವಿಟ್ಟು ಎಲ್ಲ ಹ್ಯಾಬಿಟ್‌ಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ (Done / Not Done).\n\n` +
        `⏰ <i>(ಎಲ್ಲಾ ಆಕ್ಟಿವಿಟಿ ಭರ್ತಿ ಮಾಡುವವರೆಗೂ ಪ್ರತಿ 10 ನಿಮಿಷಕ್ಕೆ ರಿಮೈಂಡರ್ ಬರುತ್ತದೆ)</i>`;

      try {
        await dispatchDualNotification(title, plainMsg, tgMsg, '📝 Fill Activities Now', CONFIG.WEB_APP_URL);
        state.lastNightNotifAt = now.toISOString();
        saveState(state);
        console.log('✅ Night reminder sent successfully to all channels.');
      } catch (err) {
        console.error('❌ Failed sending night reminder:', err.message);
      }
    } else {
      console.log('✅ Night check: All today\'s activities are filled! No reminder needed.');
    }
  }

  if (!isMorningWindow && !isNightWindow) {
    console.log('ℹ️ Outside active notification windows (9-10 AM & 9-11:59 PM IST). Idle.');
  }
}

/**
 * CLI Handler
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--test')) {
    console.log('🧪 Testing Dual Notification (OneSignal + Telegram)...');
    const title = '🔥 PKI Discipline Tracker — Test Alert';
    const plainMsg = '✅ OneSignal Web Push & Telegram Connection Successful! Smart notifications are active.';
    const tgMsg = `🔥 <b>PKI Discipline Tracker — Test Alert</b>\n\n` +
      `✅ <b>OneSignal Web Push & Telegram Connected!</b>\n` +
      `🕒 <b>Time:</b> ${getNowInTimezone().toLocaleTimeString('en-IN')}\n\n` +
      `Smart 10-Minute Notification Engine is ready.`;

    await dispatchDualNotification(title, plainMsg, tgMsg, '🚀 Open Tracker', CONFIG.WEB_APP_URL);
    console.log('✅ Test dispatch complete!');
    return;
  }

  if (args.includes('--daemon')) {
    console.log('🚀 Starting Unified Notification Engine in continuous daemon mode (every 10 min)...');
    runCheck();
    setInterval(runCheck, 10 * 60 * 1000);
    return;
  }

  await runCheck();
}

if (require.main === module) {
  main().catch(err => console.error(err));
}

module.exports = {
  runCheck,
  sendOneSignalPush,
  sendTelegramMessage,
  dispatchDualNotification,
  loadState,
  saveState,
  CONFIG
};
