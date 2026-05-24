# 🔥 Daily Discipline Tracker

A production-grade personal habit tracking web app — built to replace your Excel sheet with a fast, beautiful, mobile-friendly interface.

---

## 📁 File Structure

```
discipline-tracker/
├── index.html    ← Main app entry point
├── styles.css    ← All styles (dark theme, responsive)
├── app.js        ← All logic (data, charts, export)
└── README.md     ← This file
```

---

## 🚀 How to Run

### Option 1 — Open Directly (Simplest)
Just double-click `index.html` in your file manager.  
No server needed. Works in Chrome, Firefox, Safari.

### Option 2 — Local Dev Server (Recommended)
```bash
# If you have Python installed:
cd discipline-tracker
python3 -m http.server 8080

# Then open in browser:
http://localhost:8080
```

### Option 3 — VS Code Live Server
Install the "Live Server" extension in VS Code, right-click `index.html` → "Open with Live Server".

---

## 🎯 Pre-loaded Habits (from your Excel sheet)

| # | Habit | Points |
|---|-------|--------|
| 1 | 10PM–05AM Sleep + Drink 4L Water | 5 pts |
| 2 | Diet — No Junk Food | 3 pts |
| 3 | Exercise & Meditation | 5 pts |
| 4 | Only 1hr Phone (except education) | 4 pts |
| 5 | 5 Achieve Tasks | 5 pts |
| 6 | Follow Time Table | 3 pts |
| 7 | Spend 5 Hours with AI | 3 pts |

**Total possible per day: 28 points**

---

## 🖱️ How to Use

### Tracker Tab
- Click any cell to cycle: `· (none)` → `✓ Green` → `~ Amber` → `✗ Red`
- **Green** = Done (full points)
- **Amber** = Partial (half points)  
- **Red** = Skipped (0 points)
- Use **← →** arrows to navigate weeks
- Score % updates instantly for each day and the whole week

### Daily Tasks Tab
- Type your 5 specific tasks for each day
- Check the checkbox when done
- Write journal notes per day

### Analytics Tab
- **Streak counter** — consecutive days ≥50% score
- **8-week line chart** — performance trend
- **Habit bar chart** — which habits you complete most (last 30 days)
- **90-day heatmap** — visual activity overview

### Settings Tab
- Add / edit / delete habits
- Change point values
- Export CSV (this week or all data)
- Reset / clear data

---

## 💾 Data Storage

All data is saved automatically in your browser's **localStorage**.  
- ✅ Persists after closing the browser
- ✅ Works completely offline
- ✅ No account or server needed
- ⚠️ Clearing browser data will erase it — use Export CSV to back up

---

## 📤 CSV Export

Exports match your original Excel format:
- One row per habit
- Columns: Mon, Tue, Wed ... Sun
- Summary rows: Green count, Amber count, Red count, Score %

---

## 🌐 Deploy Online (Free)

To access from your phone or share with others:

### Netlify Drop (30 seconds)
1. Go to [netlify.com/drop](https://app.netlify.com/drop)
2. Drag the entire `discipline-tracker` folder onto the page
3. Get a live URL instantly — free forever

### GitHub Pages
```bash
git init
git add .
git commit -m "Initial tracker"
# Push to GitHub, enable Pages in repo settings
```

---

## 🔧 Customization

Edit `app.js` to change:
- `DEFAULT_HABITS` array — change habit names and points
- `QUOTES` array — add your own motivational quotes

Edit `styles.css` to change:
- CSS variables at `:root` — colors, fonts, spacing
- `--accent` — main purple color
- `--green`, `--amber`, `--red` — status colors

---

## 📱 Mobile Support

Fully responsive. On small screens:
- Sidebar collapses (tap ☰ to open)
- Score cards go 2×2 grid
- Tasks panel scrolls horizontally

---

Built with: HTML5 · CSS3 · Vanilla JavaScript · Chart.js
