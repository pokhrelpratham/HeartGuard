const dailyForm = document.getElementById('dailyForm');
const dailyTableBody = document.querySelector('#dailyTable tbody');
const clearDailyBtn = document.getElementById('clearDailyBtn');

function loadDailyLogs() {
  const logs = getJSON(KEYS.DAILY, []);
  dailyTableBody.innerHTML = '';
  logs.sort((a,b)=>a.date.localeCompare(b.date)); // ascending
  logs.forEach((row, idx) => {
    addDailyRowToTable(row, idx);
  });
}

function addDailyRowToTable(row, idx) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${row.date}</td>
    <td>${row.sleep}</td>
    <td>${row.stress}</td>
    <td>${row.exercise}</td>
    <td class="text-end">
      <button class="btn btn-sm btn-outline-danger" data-index="${idx}">
        <i class="fas fa-trash"></i>
      </button>
    </td>
  `;
  tr.querySelector('button').addEventListener('click', (e)=>{
    const i = Number(e.currentTarget.getAttribute('data-index'));
    const logs = getJSON(KEYS.DAILY, []);
    logs.splice(i,1);
    setJSON(KEYS.DAILY, logs);
    loadDailyLogs();
  });
  dailyTableBody.appendChild(tr);
}

dailyForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const date = document.getElementById('daily_date').value;
  const sleep = Number(document.getElementById('sleep_hours').value);
  const stress = Number(document.getElementById('stress_level').value);
  const exercise = Number(document.getElementById('exercise_minutes').value);

  if (!date || isNaN(sleep) || isNaN(stress) || isNaN(exercise)) {
    alert('Please fill all fields.');
    return;
  }

  const logs = getJSON(KEYS.DAILY, []);
  // replace existing entry for the same date (keep latest)
  const existingIdx = logs.findIndex(x=>x.date===date);
  const entry = {date, sleep, stress, exercise};
  if (existingIdx>=0) logs[existingIdx] = entry; else logs.push(entry);
  setJSON(KEYS.DAILY, logs);

  dailyForm.reset();
  document.getElementById('daily_date').value = todayISO();
  loadDailyLogs();
});

clearDailyBtn.addEventListener('click', ()=>{
  if (confirm('Clear all daily logs?')) {
    setJSON(KEYS.DAILY, []);
    loadDailyLogs();
  }
});

// initial render
document.addEventListener('DOMContentLoaded', loadDailyLogs);
