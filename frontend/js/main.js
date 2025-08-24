// ---- Storage keys
const KEYS = {
  PROFILE: 'hg_profile',
  DAILY: 'hg_daily_logs',    // array of {date, sleep, stress, exercise}
  MEALS: 'hg_meal_logs'      // array of {id, date, food, qty, unit, sodium}
};

// ---- Helpers
function getJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function setJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function todayISO() {
  const d = new Date();
  const tzOffset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - tzOffset*60000);
  return local.toISOString().slice(0,10); // YYYY-MM-DD
}

// ---- Profile save/load
const saveProfileBtn = document.getElementById('saveProfileBtn');
const welcomeName = document.getElementById('welcomeName');

function loadProfile() {
  const p = getJSON(KEYS.PROFILE, {});
  if (p.name) document.getElementById('name').value = p.name;
  if (p.age) document.getElementById('age').value = p.age;
  if (p.bmi) document.getElementById('bmi').value = p.bmi;
  if (p.smoking_status) document.getElementById('smoking_status').value = p.smoking_status;
  if (p.bp_history) document.getElementById('bp_history').value = p.bp_history;
  if (p.family_history) document.getElementById('family_history').value = p.family_history;
  if (p.medication) document.getElementById('medication').value = p.medication;
  welcomeName.textContent = p.name ? `Hi, ${p.name}` : 'Welcome';
}

function saveProfile() {
  const profile = {
    name: document.getElementById('name').value.trim(),
    age: Number(document.getElementById('age').value),
    bmi: Number(document.getElementById('bmi').value),
    smoking_status: document.getElementById('smoking_status').value,
    bp_history: document.getElementById('bp_history').value,
    family_history: document.getElementById('family_history').value,
    medication: document.getElementById('medication').value.trim()
  };
  if (!profile.name || !profile.age || !profile.bmi) {
    alert('Please fill Name, Age, and BMI.');
    return;
  }
  setJSON(KEYS.PROFILE, profile);
  loadProfile();
  alert('Profile saved!');
}

saveProfileBtn.addEventListener('click', saveProfile);

// Pre-fill default dates on load
document.addEventListener('DOMContentLoaded', () => {
  loadProfile();
  const dailyDate = document.getElementById('daily_date');
  const mealDate = document.getElementById('meal_date');
  if (dailyDate && !dailyDate.value) dailyDate.value = todayISO();
  if (mealDate && !mealDate.value) mealDate.value = todayISO();
});
