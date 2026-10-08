# 🤖 PKI Tracker — Telegram Smart Notification Setup Guide
*(ಕನ್ನಡ ಮತ್ತು English ನಲ್ಲಿ ಸಂಪೂರ್ಣ ಮಾರ್ಗದರ್ಶಿ)*

This guide helps you set up the **100% Free Telegram Smart Notifications** for your Daily Discipline Tracker.

---

## ⏰ Notification Rules (ನಿಯಮಗಳು)

1. **🌅 Morning (09:00 AM – 10:00 AM IST):**
   - Reminds you to open the web app.
   - Repeats **every 10 minutes** until you open the website.
   - Stops automatically once the website is opened.

2. **🌙 Night (09:00 PM – 11:59 PM IST):**
   - Checks if any habit/activity today is empty (`none`).
   - If empty, reminds you **every 10 minutes** until all 7 habits are filled (Done / Partial / Missed).
   - Stops automatically once all today's activities are filled.

---

## 🛠️ 1-Minute Setup (ಹಂತ-ಹಂತದ ವಿವರ)

### ಹಂತ 1: Telegram Bot Token ಪಡೆಯುವುದು
1. ನಿಮ್ಮ Telegram App ನಲ್ಲಿ **`@BotFather`** ಅನ್ನು ಹುಡುಕಿ (Search ಮಾಡಿ).
2. Start ಕ್ಲಿಕ್ ಮಾಡಿ `/newbot` ಎಂದು ಟೈಪ್ ಮಾಡಿ ಕಳುಹಿಸಿ.
3. ಬಾಟ್‌ಗೆ ಒಂದು ಹೆಸರು ನೀಡಿ (ಉದಾ: `My PKI Tracker`).
4. ಬಾಟ್‌ಗೆ ಒಂದು Username ನೀಡಿ (ಉದಾ: `my_pki_tracker_bot` — ಕೊನೆಯಲ್ಲಿ `bot` ಇರಬೇಕು).
5. BotFather ನಿಮಗೆ ಒಂದು **HTTP API Token** ನೀಡುತ್ತದೆ (ಉದಾ: `7123456789:AAFn...`). ಇದನ್ನು ಕಾಪಿ ಮಾಡಿಕೊಳ್ಳಿ.

### ಹಂತ 2: ನಿಮ್ಮ Telegram Chat ID ಪಡೆಯುವುದು
1. ಟೆಲಿಗ್ರಾಮ್‌ನಲ್ಲಿ **`@userinfobot`** ಹುಡುಕಿ `/start` ಕೊಡಿ.
2. ಅದು ನಿಮ್ಮ **Id** (ಉದಾ: `123456789`) ಅನ್ನು ನೀಡುತ್ತದೆ. ಇದನ್ನು ಕಾಪಿ ಮಾಡಿಕೊಳ್ಳಿ.
3. ನೀವು ರಚಿಸಿದ ಹೊಸ ಬಾಟ್‌ಗೆ ಹೋಗಿ ಒಮ್ಮೆ **`/start`** ಒತ್ತಿ (ಇದು ಬಾಟ್‌ಗೆ ನಿಮಗೆ ಮೆಸೇಜ್ ಕಳುಹಿಸಲು ಅನುಮತಿ ನೀಡುತ್ತದೆ).

### ಹಂತ 3: ವೆಬ್‌ಸೈಟ್‌ನಲ್ಲಿ Configure ಮಾಡುವುದು
1. ನಿಮ್ಮ **PKI Tracker** ವೆಬ್‌ಸೈಟ್ ತೆರೆಯಿರಿ.
2. **Settings** ಟ್ಯಾಬ್‌ಗೆ ಹೋಗಿ.
3. **Telegram Smart Notifications** ಕಾರ್ಡ್‌ನಲ್ಲಿ:
   - **Bot Token** ಪೇಸ್ಟ್ ಮಾಡಿ.
   - **Chat ID** ಪೇಸ್ಟ್ ಮಾಡಿ.
   - **Website URL** ಹಾಕಿ.
4. **"Send Test Notification"** ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ. ನಿಮ್ಮ ಟೆಲಿಗ್ರಾಮ್‌ಗೆ ತಕ್ಷಣವೇ ಟೆಸ್ಟ್ ಮೆಸೇಜ್ ಬರುತ್ತದೆ!

---

## ☁️ GitHub Actions ನಲ್ಲಿ 24/7 Automated Free Cron Setup ಮಾಡುವುದು

1. ನಿಮ್ಮ GitHub Repository (`PKI-TRACKER`) ಗೆ ಹೋಗಿ.
2. **Settings** → **Secrets and variables** → **Actions** ಕ್ಲಿಕ್ ಮಾಡಿ.
3. **New repository secret** ಕ್ಲಿಕ್ ಮಾಡಿ ಈ ಕೆಳಗಿನ Secrets ಸೇರಿಸಿ:
   - `TELEGRAM_BOT_TOKEN` = ನಿಮ್ಮ ಬಾಟ್ ಟೋಕನ್
   - `TELEGRAM_CHAT_ID` = ನಿಮ್ಮ ಚಾಟ್ ಐಡಿ
   - `WEB_APP_URL` = ನಿಮ್ಮ ಲೈವ್ ವೆಬ್‌ಸೈಟ್ ಲಿಂಕ್ (ಉದಾ: `https://yourusername.github.io/PKI-TRACKER/`)
4. ಈಗ ಗಿಟ್‌ಹಬ್ ಆಕ್ಷನ್ಸ್ ಸಂಪೂರ್ಣ ಉಚಿತವಾಗಿ ಪ್ರತಿ 10 ನಿಮಿಷಕ್ಕೆ ಚೆಕ್ ಮಾಡಿ ನೋಟಿಫಿಕೇಶನ್ ಕಳುಹಿಸುತ್ತದೆ!

---

## 💻 ಸ್ಥಳೀಯವಾಗಿ (Local PC) ನಲ್ಲಿ ರನ್ ಮಾಡಲು

ನಿಮ್ಮ ಕಂಪ್ಯೂಟರ್‌ನಲ್ಲಿ ನೇರವಾಗಿ ರನ್ ಮಾಡಲು:
```bash
# Test connection
node notify-engine.js --test

# Run background checker
node notify-engine.js --daemon
```
