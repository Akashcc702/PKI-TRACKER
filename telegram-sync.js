/**
 * PKI-TRACKER — Telegram Smart Sync & Notification Client
 * Handles:
 *  - Telegram Bot Token & Chat ID storage (localStorage)
 *  - Tracking daily app opens (9 AM verification)
 *  - Tracking today's unfilled activities count (9 PM verification)
 *  - Direct Telegram Bot API communication & Test alerts
 *  - UI Form bindings for the Settings tab
 */

const TelegramSync = {
  STORAGE_KEYS: {
    TOKEN: 'pki_tg_bot_token',
    CHAT_ID: 'pki_tg_chat_id',
    ENABLED: 'pki_tg_enabled',
    WEB_URL: 'pki_tg_web_url',
    LAST_OPENED: 'pki_tg_last_opened_date',
    LAST_SYNC: 'pki_tg_last_sync_time'
  },

  getConfig() {
    return {
      token: localStorage.getItem(this.STORAGE_KEYS.TOKEN) || '',
      chatId: localStorage.getItem(this.STORAGE_KEYS.CHAT_ID) || '',
      enabled: localStorage.getItem(this.STORAGE_KEYS.ENABLED) !== 'false',
      webUrl: localStorage.getItem(this.STORAGE_KEYS.WEB_URL) || window.location.href.split('#')[0]
    };
  },

  saveConfig(token, chatId, enabled = true, webUrl = '') {
    localStorage.setItem(this.STORAGE_KEYS.TOKEN, (token || '').trim());
    localStorage.setItem(this.STORAGE_KEYS.CHAT_ID, (chatId || '').trim());
    localStorage.setItem(this.STORAGE_KEYS.ENABLED, enabled ? 'true' : 'false');
    if (webUrl) {
      localStorage.setItem(this.STORAGE_KEYS.WEB_URL, webUrl.trim());
    }
  },

  getTodayDateStr() {
    const d = new Date();
    return d.toISOString().split('T')[0];
  },

  /**
   * Called automatically when the web app is loaded/opened
   */
  onAppOpened() {
    const today = this.getTodayDateStr();
    localStorage.setItem(this.STORAGE_KEYS.LAST_OPENED, today);
    localStorage.setItem(this.STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    this.syncDailyState();
  },

  /**
   * Calculates today's unfilled activities (habits with 'none' status)
   */
  getTodayPendingStats() {
    const today = this.getTodayDateStr();
    const habitList = (typeof habits !== 'undefined' && Array.isArray(habits)) ? habits : 
                      ((typeof DEFAULT_HABITS !== 'undefined') ? DEFAULT_HABITS : []);
    const cells = (typeof cellData !== 'undefined') ? cellData : {};

    let total = habitList.length;
    let filled = 0;
    let pending = 0;
    let pendingList = [];

    habitList.forEach(h => {
      const status = cells[`${today}_${h.id}`] || 'none';
      if (status !== 'none') {
        filled++;
      } else {
        pending++;
        pendingList.push(h.name);
      }
    });

    return {
      date: today,
      total,
      filled,
      pending,
      pendingList,
      isAllFilled: (pending === 0 && total > 0)
    };
  },

  /**
   * Called whenever user updates a habit or task
   */
  onHabitUpdated() {
    this.syncDailyState();
  },

  syncDailyState() {
    const stats = this.getTodayPendingStats();
    const config = this.getConfig();

    const state = {
      date: stats.date,
      lastOpenedDate: localStorage.getItem(this.STORAGE_KEYS.LAST_OPENED) || stats.date,
      lastOpenedAt: new Date().toISOString(),
      unfilledCount: stats.pending,
      filledCount: stats.filled,
      totalCount: stats.total,
      pendingHabits: stats.pendingList,
      isAllFilled: stats.isAllFilled,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem('pki_tracker_live_state', JSON.stringify(state));
    this.updateUIStatusBanner();
    return state;
  },

  /**
   * Sends a message via Telegram Bot API
   */
  async sendTelegramMessage(text, buttonText, buttonUrl) {
    const config = this.getConfig();
    if (!config.token || !config.chatId) {
      throw new Error('Telegram Bot Token or Chat ID is missing. Please configure in Settings.');
    }

    const payload = {
      chat_id: config.chatId,
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

    const url = `https://api.telegram.org/bot${config.token}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!data.ok) {
      throw new Error(data.description || 'Failed to send Telegram message');
    }
    return data;
  },

  /**
   * 1-Click test notification from Settings tab
   */
  async testNotification() {
    const config = this.getConfig();
    if (!config.token || !config.chatId) {
      alert('⚠️ Please enter and save both Bot Token and Chat ID first!');
      return false;
    }

    const stats = this.getTodayPendingStats();
    const message = `🔥 <b>PKI Discipline Tracker — Test Alert</b>\n\n` +
      `✅ <b>Telegram Connection Successful!</b>\n` +
      `📅 <b>Date:</b> ${stats.date}\n` +
      `📊 <b>Today's Status:</b> ${stats.filled}/${stats.total} Activities Filled (${stats.pending} pending)\n\n` +
      `⏰ <b>Smart Rules:</b>\n` +
      `• <b>09:00 AM – 10:00 AM:</b> Website open reminder (every 10m)\n` +
      `• <b>09:00 PM onwards:</b> Unfilled activity reminder (every 10m)`;

    try {
      await this.sendTelegramMessage(message, '🚀 Open PKI Tracker', config.webUrl || window.location.href);
      if (typeof showToast === 'function') {
        showToast('✅ Telegram Test Alert Sent!');
      } else {
        alert('✅ Telegram Test Alert Sent! Check your Telegram.');
      }
      return true;
    } catch (err) {
      console.error('Telegram Test Failed:', err);
      alert('❌ Error sending notification: ' + err.message);
      return false;
    }
  },

  /**
   * UI Binding Helpers
   */
  loadIntoUI() {
    const config = this.getConfig();
    const tokenInput = document.getElementById('tg-bot-token');
    const chatIdInput = document.getElementById('tg-chat-id');
    const urlInput = document.getElementById('tg-web-url');

    if (tokenInput && !tokenInput.value) tokenInput.value = config.token;
    if (chatIdInput && !chatIdInput.value) chatIdInput.value = config.chatId;
    if (urlInput && !urlInput.value) urlInput.value = config.webUrl;

    this.updateUIStatusBanner();
  },

  updateUIStatusBanner() {
    const banner = document.getElementById('tg-status-banner');
    if (!banner) return;

    const config = this.getConfig();
    const stats = this.getTodayPendingStats();

    if (config.token && config.chatId) {
      banner.innerHTML = `🟢 <b>Connected to Telegram</b> · Today: ${stats.filled}/${stats.total} filled (${stats.pending} left)`;
      banner.style.color = '#22c55e';
    } else {
      banner.innerHTML = `⚪ <i>Enter Bot Token & Chat ID to activate 10-minute smart notifications</i>`;
      banner.style.color = 'var(--text3)';
    }
  }
};

// Global UI helper functions
window.saveTelegramSettings = function() {
  const token = document.getElementById('tg-bot-token')?.value || '';
  const chatId = document.getElementById('tg-chat-id')?.value || '';
  const webUrl = document.getElementById('tg-web-url')?.value || window.location.href;

  TelegramSync.saveConfig(token, chatId, true, webUrl);
  TelegramSync.updateUIStatusBanner();
  if (typeof showToast === 'function') {
    showToast('💾 Telegram settings saved!');
  } else {
    alert('Telegram settings saved!');
  }
};

window.testTelegramAlert = function() {
  TelegramSync.testNotification();
};

window.testBrowserNotification = function() {
  if (!("Notification" in window)) {
    alert("⚠️ This browser does not support HTML5 desktop notifications.");
    return;
  }
  if (Notification.permission === "granted") {
    try {
      new Notification("🔥 PKI Discipline Tracker", {
        body: "✅ Browser Notification Pop-Up is Working!",
        icon: "favicon.ico"
      });
      if (typeof showToast === 'function') showToast('✅ Pop-up notification sent!');
    } catch(e) {
      alert("⚠️ Notification created but couldn't show: " + e.message);
    }
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(function (permission) {
      if (permission === "granted") {
        new Notification("🔥 PKI Discipline Tracker", {
          body: "✅ Notifications Allowed! Pop-Up is active.",
          icon: "favicon.ico"
        });
        if (typeof showToast === 'function') showToast('✅ Permission granted! Notification sent.');
      } else {
        alert("⚠️ Notification permission was not granted.");
      }
    });
  } else {
    alert("⚠️ Notifications are currently blocked in your browser. Click the lock/tune icon near your browser address bar and enable Notifications.");
  }
};

// Auto-initialize when window loads
if (typeof window !== 'undefined') {
  window.TelegramSync = TelegramSync;
  window.addEventListener('DOMContentLoaded', () => {
    TelegramSync.onAppOpened();
    TelegramSync.loadIntoUI();
  });
}
