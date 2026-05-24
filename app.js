/* =====================================================
   Daily Discipline Tracker — app.js
   All logic: state, rendering, persistence, export
   ===================================================== */

// ── DEFAULT DATA ──────────────────────────────────────
const DEFAULT_HABITS = [
  { id: 1, name: "10PM–05AM Sleep + Drink 4L Water",    pts: 5 },
  { id: 2, name: "Diet — No Junk Food",                 pts: 3 },
  { id: 3, name: "Exercise & Meditation",               pts: 5 },
  { id: 4, name: "Only 1hr Phone (except education)",   pts: 4 },
  { id: 5, name: "5 Achieve Tasks",                     pts: 5 },
  { id: 6, name: "Follow Time Table",                   pts: 3 },
  { id: 7, name: "Spend 5 Hours with AI",               pts: 3 }
];

const QUOTES = [
  "Discipline is the bridge between goals and accomplishment.",
  "Small daily improvements are the key to staggering long-term results.",
  "You don't rise to your goals, you fall to your systems.",
  "Every action you take is a vote for the person you wish to become.",
  "The secret of getting ahead is getting started.",
  "Success is the sum of small efforts repeated day in and day out.",
  "Motivation gets you started. Habit keeps you going.",
  "Do not wait for the perfect moment — make the moment perfect.",
  "Hard work beats talent when talent doesn't work hard.",
  "Be consistent. Results will follow.",
  "One day or day one — you decide.",
  "Push yourself because no one else is going to do it for you.",
  "Great things never come from comfort zones.",
  "The pain of discipline is far less than the pain of regret.",
  "Winners are not people who never fail, but people who never quit.",
  "Wake up with determination. Go to bed with satisfaction.",
  "What you do today can improve all your tomorrows.",
  "First master the fundamentals, then worry about everything else.",
  "Believe in yourself and all that you are.",
  "Your future is created by what you do today, not tomorrow."
];

const DAY_NAMES  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const STATUS_CYCLE = ['none','green','amber','red'];
const STATUS_ICONS = { none:'·', green:'✓', amber:'~', red:'✗' };

// ── STATE ─────────────────────────────────────────────
let habits    = load('ddt_habits', DEFAULT_HABITS);
let cellData  = load('ddt_data',   {});
let taskData  = load('ddt_tasks',  {});
let noteData  = load('ddt_notes',  {});
let weekOffset = 0;
let activeTab  = 'tracker';
let chartInstances = {};

// ── PERSISTENCE ───────────────────────────────────────
function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ── DATE HELPERS ──────────────────────────────────────
function getWeekDates(offset = 0) {
  const now  = new Date();
  const day  = now.getDay();
  const sun  = new Date(now);
  sun.setDate(now.getDate() - day + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sun);
    d.setDate(sun.getDate() + i);
    return d;
  });
}

function isoDate(d)  { return d.toISOString().split('T')[0]; }
function isToday(d)  { return isoDate(d) === isoDate(new Date()); }

function fmtShort(d) {
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

// ── STATUS HELPERS ────────────────────────────────────
function getStatus(habitId, date) {
  return cellData[`${isoDate(date)}_${habitId}`] || 'none';
}

function cycleStatus(habitId, dateStr) {
  const key = `${dateStr}_${habitId}`;
  const cur  = cellData[key] || 'none';
  const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(cur) + 1) % STATUS_CYCLE.length];
  cellData[key] = next;
  save('ddt_data', cellData);
  renderAll();
}

// ── STATS CALCULATIONS ────────────────────────────────
function dayStats(date) {
  let g = 0, a = 0, r = 0, earned = 0, total = 0;
  habits.forEach(h => {
    const s = getStatus(h.id, date);
    total += h.pts;
    if (s === 'green')      { g++; earned += h.pts; }
    else if (s === 'amber') { a++; earned += Math.floor(h.pts * 0.5); }
    else if (s === 'red')   { r++; }
  });
  const pct = total > 0 ? Math.round(earned / total * 100) : 0;
  return { g, a, r, pct, earned, total };
}

function weekStats(dates) {
  let tg=0, ta=0, tr=0, earned=0, total=0;
  dates.forEach(d => {
    const s = dayStats(d);
    tg += s.g; ta += s.a; tr += s.r;
    earned += s.earned; total += s.total;
  });
  const pct = total > 0 ? Math.round(earned / total * 100) : 0;
  return { tg, ta, tr, pct };
}

function calcStreak() {
  let streak = 0, max = 0, cur = 0;
  const today = new Date();
  for (let i = 0; i < 90; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const s = dayStats(d);
    if (s.pct >= 50) { cur++; }
    else { if (i === 0) { streak = 0; } max = Math.max(max, cur); cur = 0; }
  }
  if (cur > 0) { streak = cur; max = Math.max(max, cur); }
  return { streak, max };
}

// ── RENDER ROUTER ─────────────────────────────────────
function renderAll() {
  const dates = getWeekDates(weekOffset);
  updateWeekLabel(dates);
  updateStreakWidget();

  if (activeTab === 'tracker')  renderTracker(dates);
  if (activeTab === 'tasks')    renderTasks(dates);
  if (activeTab === 'stats')    renderStats(dates);
  if (activeTab === 'settings') renderSettings();
}

// ── WEEK LABEL ────────────────────────────────────────
function updateWeekLabel(dates) {
  const label = weekOffset === 0 ? 'This Week'
              : weekOffset === -1 ? 'Last Week'
              : weekOffset === 1  ? 'Next Week'
              : `${weekOffset > 0 ? '+' : ''}${weekOffset}w`;
  document.getElementById('week-range').textContent =
    `${fmtShort(dates[0])} – ${fmtShort(dates[6])}  ·  ${label}`;
}

// ── STREAK WIDGET ─────────────────────────────────────
function updateStreakWidget() {
  const { streak } = calcStreak();
  document.getElementById('streak-num').textContent = streak;
}

// ── QUOTE ─────────────────────────────────────────────
function setQuote() {
  const q = QUOTES[new Date().getDate() % QUOTES.length];
  document.getElementById('quote-ticker').textContent = `"${q}"`;
}

// ── TRACKER TAB ───────────────────────────────────────
function renderTracker(dates) {
  renderScoreStrip(dates);
  renderHabitTable(dates);
}

function renderScoreStrip(dates) {
  const ws = weekStats(dates);
  const pctColor = ws.pct >= 70 ? 'var(--green)' : ws.pct >= 40 ? 'var(--amber)' : 'var(--red)';
  document.getElementById('score-strip').innerHTML = `
    <div class="score-card green-card">
      <div class="val">${ws.tg}</div>
      <div class="lbl">✓ COMPLETED</div>
      <div class="sub">Green cells this week</div>
    </div>
    <div class="score-card amber-card">
      <div class="val">${ws.ta}</div>
      <div class="lbl">~ PARTIAL</div>
      <div class="sub">Half-point cells</div>
    </div>
    <div class="score-card red-card">
      <div class="val">${ws.tr}</div>
      <div class="lbl">✗ SKIPPED</div>
      <div class="sub">Missed this week</div>
    </div>
    <div class="score-card pct-card">
      <div class="val" style="color:${pctColor}">${ws.pct}%</div>
      <div class="lbl">WEEK SCORE</div>
      <div class="sub">Earned / possible pts</div>
    </div>
  `;
}

function renderHabitTable(dates) {
  const ds = dates.map(d => dayStats(d));

  let head = `<thead><tr>
    <th class="habit-name-th">HABIT / POINTS</th>
    ${dates.map((d, i) => {
      const pct = ds[i].pct;
      const col = pct >= 70 ? 'var(--green)' : pct >= 40 ? 'var(--amber)' : pct > 0 ? 'var(--red)' : 'var(--text3)';
      const today = isToday(d);
      return `<th class="day-th ${today ? 'today-col' : ''}">
        <div class="day-th-inner">
          ${today ? '<span class="today-dot"></span>' : ''}
          <span class="day-name-lbl">${DAY_NAMES[d.getDay()]}</span>
          <span class="day-date-lbl">${fmtShort(d)}</span>
          <span class="day-pct-lbl" style="color:${col}">${pct}%</span>
          <div class="pct-bar-wrap">
            <div class="pct-bar-fill" style="width:${pct}%;background:${col}"></div>
          </div>
        </div>
      </th>`;
    }).join('')}
  </tr></thead>`;

  let body = '<tbody>';
  habits.forEach(h => {
    body += `<tr>
      <td class="name-cell">
        <div class="habit-name-text">${h.name}</div>
        <div class="habit-pts-badge">◈ ${h.pts} pts</div>
      </td>
      ${dates.map(d => {
        const s = getStatus(h.id, d);
        const cls = `cell-${s}`;
        const icon = STATUS_ICONS[s];
        const today = isToday(d);
        return `<td class="${today ? 'today-cell' : ''}">
          <button class="cell-btn ${cls}"
            onclick="cycleStatus(${h.id},'${isoDate(d)}')"
            title="${h.name} · ${fmtShort(d)} · ${s}"
            aria-label="${h.name} ${fmtShort(d)}: ${s}">${icon}</button>
        </td>`;
      }).join('')}
    </tr>`;
  });
  body += '</tbody>';

  document.getElementById('habit-table').innerHTML = head + body;
}

// ── TASKS TAB ─────────────────────────────────────────
function renderTasks(dates) {
  renderTasksGrid(dates);
  renderNotesGrid(dates);
}

function getTasksForDay(dk) {
  return taskData[dk] || Array.from({ length: 5 }, () => ({ text: '', done: false }));
}

function renderTasksGrid(dates) {
  document.getElementById('tasks-week-grid').innerHTML = dates.map(d => {
    const dk = isoDate(d);
    const dayTasks = getTasksForDay(dk);
    const doneCount = dayTasks.filter(t => t.done).length;
    const today = isToday(d);
    return `<div class="task-day-card ${today ? 'today-card' : ''}">
      <div class="task-day-header ${today ? 'today-hdr' : ''}">
        <span>${DAY_NAMES[d.getDay()]} ${fmtShort(d)}</span>
        <span class="task-done-count">${doneCount}/5</span>
      </div>
      ${dayTasks.map((t, j) => `
        <div class="task-item">
          <input type="checkbox" class="task-cb" ${t.done ? 'checked' : ''}
            onchange="toggleTask('${dk}',${j},this.checked)"
            aria-label="Task ${j+1}">
          <input class="task-text ${t.done ? 'done-text' : ''}"
            value="${(t.text || '').replace(/"/g, '&quot;')}"
            placeholder="Task ${j+1}..."
            oninput="updateTaskText('${dk}',${j},this.value)">
        </div>`).join('')}
    </div>`;
  }).join('');
}

function renderNotesGrid(dates) {
  document.getElementById('notes-grid').innerHTML = dates.map(d => {
    const dk = isoDate(d);
    return `<div class="note-wrap">
      <div class="note-day-lbl">${DAY_NAMES[d.getDay()]}</div>
      <textarea class="note-textarea" rows="4"
        placeholder="Daily notes..."
        oninput="updateNote('${dk}',this.value)">${noteData[dk] || ''}</textarea>
    </div>`;
  }).join('');
}

function toggleTask(dk, j, checked) {
  if (!taskData[dk]) taskData[dk] = Array.from({ length: 5 }, () => ({ text: '', done: false }));
  taskData[dk][j].done = checked;
  save('ddt_tasks', taskData);
  renderTasks(getWeekDates(weekOffset));
}

function updateTaskText(dk, j, val) {
  if (!taskData[dk]) taskData[dk] = Array.from({ length: 5 }, () => ({ text: '', done: false }));
  taskData[dk][j].text = val;
  save('ddt_tasks', taskData);
}

function updateNote(dk, val) {
  noteData[dk] = val;
  save('ddt_notes', noteData);
}

// ── STATS TAB ─────────────────────────────────────────
function renderStats(dates) {
  renderStatsTopCards(dates);
  renderLineChart();
  renderDoughnutChart(dates);
  renderBarChart();
  renderHeatmap();
}

function renderStatsTopCards(dates) {
  const ws = weekStats(dates);
  const { streak, max } = calcStreak();

  // Total habits tracked (all time)
  const allKeys = Object.keys(cellData);
  const totalTracked = allKeys.filter(k => cellData[k] !== 'none').length;
  const totalGreen   = allKeys.filter(k => cellData[k] === 'green').length;
  const overallPct   = totalTracked > 0 ? Math.round(totalGreen / totalTracked * 100) : 0;

  document.getElementById('stats-top-cards').innerHTML = `
    <div class="stat-card"><div class="stat-val" style="color:var(--amber)">${streak}</div>
      <div class="stat-lbl">Current Streak</div><div class="stat-sub">days ≥50% score</div></div>
    <div class="stat-card"><div class="stat-val" style="color:var(--accent2)">${max}</div>
      <div class="stat-lbl">Best Streak</div><div class="stat-sub">last 90 days</div></div>
    <div class="stat-card"><div class="stat-val" style="color:var(--green)">${ws.pct}%</div>
      <div class="stat-lbl">This Week Score</div><div class="stat-sub">earned / possible</div></div>
    <div class="stat-card"><div class="stat-val" style="color:var(--text)">${overallPct}%</div>
      <div class="stat-lbl">All-Time Green</div><div class="stat-sub">${totalTracked} cells marked</div></div>
  `;
}

function destroyChart(id) {
  if (chartInstances[id]) { chartInstances[id].destroy(); delete chartInstances[id]; }
}

function chartDefaults() {
  return {
    color: '#9090b0',
    borderColor: 'rgba(255,255,255,0.07)',
    plugins: { legend: { display: false } }
  };
}

function renderLineChart() {
  destroyChart('line');
  const labels = [], pcts = [];
  for (let w = 7; w >= 0; w--) {
    const dates = getWeekDates(-w);
    labels.push(fmtShort(dates[0]));
    pcts.push(weekStats(dates).pct);
  }
  const ctx = document.getElementById('line-chart');
  if (!ctx) return;
  chartInstances['line'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data: pcts,
        borderColor: '#6e56ff',
        backgroundColor: 'rgba(110,86,255,0.12)',
        borderWidth: 2.5,
        pointBackgroundColor: '#6e56ff',
        pointRadius: 4,
        tension: 0.38,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false }, tooltip: {
        callbacks: { label: ctx => ` ${ctx.raw}%` }
      }},
      scales: {
        y: { min: 0, max: 100,
          ticks: { color: '#5a5a7a', font: { size: 11 }, callback: v => v + '%' },
          grid: { color: 'rgba(255,255,255,0.05)' }
        },
        x: { ticks: { color: '#5a5a7a', font: { size: 10 } }, grid: { display: false } }
      }
    }
  });
}

function renderDoughnutChart(dates) {
  destroyChart('doughnut');
  const ws = weekStats(dates);
  const ctx = document.getElementById('doughnut-chart');
  if (!ctx) return;
  const total = ws.tg + ws.ta + ws.tr;
  if (total === 0) return;
  chartInstances['doughnut'] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Green', 'Amber', 'Red'],
      datasets: [{
        data: [ws.tg, ws.ta, ws.tr],
        backgroundColor: ['rgba(5,245,142,0.75)', 'rgba(255,190,61,0.75)', 'rgba(255,77,106,0.75)'],
        borderColor: ['#05f58e', '#ffbe3d', '#ff4d6a'],
        borderWidth: 1.5
      }]
    },
    options: {
      responsive: true,
      cutout: '65%',
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: { color: '#9090b0', font: { size: 11 }, padding: 12, boxWidth: 10 }
        },
        tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw}` } }
      }
    }
  });
}

function renderBarChart() {
  destroyChart('bar');
  const today = new Date();
  const pcts = habits.map(h => {
    let g = 0, tot = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date(today); d.setDate(today.getDate() - i);
      const s = getStatus(h.id, d);
      tot++;
      if (s === 'green') g++;
      else if (s === 'amber') g += 0.5;
    }
    return Math.round(g / tot * 100);
  });
  const ctx = document.getElementById('bar-chart');
  if (!ctx) return;
  chartInstances['bar'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: habits.map(h => h.name.length > 20 ? h.name.slice(0, 20) + '…' : h.name),
      datasets: [{
        data: pcts,
        backgroundColor: pcts.map(p =>
          p >= 70 ? 'rgba(5,245,142,0.65)' :
          p >= 40 ? 'rgba(255,190,61,0.65)' :
                    'rgba(255,77,106,0.65)'
        ),
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false }, tooltip: {
        callbacks: { label: ctx => ` ${ctx.raw}%` }
      }},
      scales: {
        y: { min: 0, max: 100,
          ticks: { color: '#5a5a7a', font: { size: 11 }, callback: v => v + '%' },
          grid: { color: 'rgba(255,255,255,0.05)' }
        },
        x: { ticks: { color: '#5a5a7a', font: { size: 10 }, maxRotation: 28 }, grid: { display: false } }
      }
    }
  });
}

function renderHeatmap() {
  const today = new Date();
  const days  = [];
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    days.push({ date: d, pct: dayStats(d).pct });
  }
  // Split into rows of 7
  const rows = [];
  for (let r = 0; r < Math.ceil(days.length / 7); r++) {
    rows.push(days.slice(r * 7, r * 7 + 7));
  }
  const getColor = pct =>
    pct >= 80 ? 'var(--green)' :
    pct >= 55 ? 'rgba(5,245,142,0.45)' :
    pct >= 30 ? 'var(--amber)' :
    pct >  0  ? 'rgba(255,77,106,0.55)' :
                'rgba(255,255,255,0.05)';

  const html = `
    <div class="heatmap-grid">
      ${rows.map(row => `
        <div class="heatmap-row-wrap">
          <span class="heatmap-week-lbl">${fmtShort(row[0])}</span>
          ${row.map(cell => `
            <div class="heatmap-cell" style="background:${getColor(cell.pct)}"
              title="${fmtShort(cell.date)} — ${cell.pct}%"></div>
          `).join('')}
        </div>`).join('')}
    </div>
    <div class="heatmap-legend">
      <span><span class="hl-dot" style="background:var(--green)"></span>80%+</span>
      <span><span class="hl-dot" style="background:rgba(5,245,142,0.45)"></span>55–79%</span>
      <span><span class="hl-dot" style="background:var(--amber)"></span>30–54%</span>
      <span><span class="hl-dot" style="background:rgba(255,77,106,0.55)"></span>1–29%</span>
      <span><span class="hl-dot" style="background:rgba(255,255,255,0.05)"></span>No data</span>
    </div>`;
  document.getElementById('heatmap-container').innerHTML = html;
}

// ── SETTINGS TAB ──────────────────────────────────────
function renderSettings() {
  const list = document.getElementById('habits-edit-list');
  list.innerHTML = habits.map((h, i) => `
    <div class="habit-edit-row">
      <input class="s-input" style="flex:1;min-width:100px"
        value="${h.name}" oninput="updateHabitField(${i},'name',this.value)"
        aria-label="Habit name">
      <input class="s-input pts-input" type="number" value="${h.pts}"
        min="1" max="10" oninput="updateHabitField(${i},'pts',+this.value)"
        aria-label="Points">
      <button class="s-btn danger icon-btn" onclick="deleteHabit(${i})"
        aria-label="Delete habit" title="Delete">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>`).join('');

  // Data info
  const totalKeys = Object.keys(cellData).length;
  const greenCount = Object.values(cellData).filter(v => v === 'green').length;
  document.getElementById('data-info').innerHTML =
    `Total cells tracked: ${totalKeys}<br>Green: ${greenCount} · Amber: ${Object.values(cellData).filter(v=>v==='amber').length} · Red: ${Object.values(cellData).filter(v=>v==='red').length}<br>Task entries: ${Object.keys(taskData).length} days`;
}

function updateHabitField(i, field, val) {
  habits[i][field] = val;
  save('ddt_habits', habits);
}

function deleteHabit(i) {
  if (habits.length <= 1) return alert('Keep at least 1 habit.');
  if (!confirm(`Delete "${habits[i].name}"?`)) return;
  habits.splice(i, 1);
  save('ddt_habits', habits);
  renderAll();
}

function addHabit() {
  const name = document.getElementById('new-habit-name').value.trim();
  const pts  = parseInt(document.getElementById('new-habit-pts').value) || 3;
  if (!name) return;
  habits.push({ id: Date.now(), name, pts });
  save('ddt_habits', habits);
  document.getElementById('new-habit-name').value = '';
  renderAll();
}

// ── EXPORTS ───────────────────────────────────────────
function buildCSV(dates) {
  const cols = dates.map(d => `${DAY_NAMES[d.getDay()]} ${fmtShort(d)}`);
  let csv = 'Habit,Points,' + cols.join(',') + '\n';
  habits.forEach(h => {
    const row = dates.map(d => getStatus(h.id, d));
    csv += `"${h.name}",${h.pts},${row.join(',')}\n`;
  });
  csv += '\n';
  csv += 'Day Score %,,' + dates.map(d => dayStats(d).pct + '%').join(',') + '\n';
  csv += 'Green,,'       + dates.map(d => dayStats(d).g).join(',') + '\n';
  csv += 'Amber,,'       + dates.map(d => dayStats(d).a).join(',') + '\n';
  csv += 'Red,,'         + dates.map(d => dayStats(d).r).join(',') + '\n';
  return csv;
}

function exportCSV() {
  const dates = getWeekDates(weekOffset);
  downloadCSV(buildCSV(dates), `discipline_week_${isoDate(dates[0])}.csv`);
}

function exportAllCSV() {
  // Gather all unique week start dates from data
  const keys = Object.keys(cellData);
  if (!keys.length) return alert('No data to export.');
  // Build 12 weeks of data
  let allCSV = 'DAILY DISCIPLINE TRACKER — ALL DATA\n\n';
  for (let w = 11; w >= 0; w--) {
    const dates = getWeekDates(-w);
    allCSV += `Week of ${fmtShort(dates[0])}\n`;
    allCSV += buildCSV(dates);
    allCSV += '\n';
  }
  downloadCSV(allCSV, `discipline_all_${isoDate(new Date())}.csv`);
}

function downloadCSV(content, filename) {
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(content);
  a.download = filename;
  a.click();
}

// ── DATA ACTIONS ──────────────────────────────────────
function resetWeek() {
  if (!confirm('Reset ALL habit data for this week?')) return;
  const dates = getWeekDates(weekOffset);
  dates.forEach(d => {
    habits.forEach(h => {
      delete cellData[`${isoDate(d)}_${h.id}`];
    });
  });
  save('ddt_data', cellData);
  renderAll();
}

function clearAllData() {
  if (!confirm('Delete ALL tracker data permanently? This cannot be undone.')) return;
  cellData = {}; taskData = {}; noteData = {};
  save('ddt_data', cellData); save('ddt_tasks', taskData); save('ddt_notes', noteData);
  renderAll();
}

// ── NAVIGATION ────────────────────────────────────────
function changeWeek(dir) { weekOffset += dir; renderAll(); }
function goToday()       { weekOffset = 0;    renderAll(); }

function switchTab(tab, el) {
  activeTab = tab;
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  el.classList.add('active');

  const titles = { tracker: 'Weekly Tracker', tasks: 'Daily Tasks', stats: 'Analytics', settings: 'Settings' };
  document.getElementById('page-title').textContent = titles[tab];

  // Destroy charts before re-render to avoid canvas reuse error
  if (tab === 'stats') {
    ['line','doughnut','bar'].forEach(destroyChart);
  }
  renderAll();
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ── INIT ─────────────────────────────────────────────
setQuote();
renderAll();
