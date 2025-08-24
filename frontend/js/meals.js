const mealForm = document.getElementById('mealForm');
const mealTableBody = document.querySelector('#mealTable tbody');
const todaySaltEl = document.getElementById('todaySalt');
const weeklySaltEl = document.getElementById('weeklySalt');
const clearMealsBtn = document.getElementById('clearMealsBtn');

const NIX_APP_ID = '5b872af6';
const NIX_APP_KEY = '57762c5bd5785a52d0bca208869e95a6';


function loadMeals() {
  const meals = getJSON(KEYS.MEALS, []);
  mealTableBody.innerHTML = '';
  meals.sort((a,b)=> a.date.localeCompare(b.date) || a.id - b.id);
  meals.forEach((m, idx)=>{
    addMealRowToTable(m, idx);
  });
  updateSaltSummaries();
}

function addMealRowToTable(m, idx) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${m.date}</td>
    <td>${m.food}</td>
    <td>${(m.salt / 1000).toFixed(2)}</td> <!-- salt in grams -->
    <td class="text-end">
      <button class="btn btn-sm btn-outline-danger" data-index="${idx}">
        <i class="fas fa-trash"></i>
      </button>
    </td>
  `;
  tr.querySelector('button').addEventListener('click', (e)=>{
    const i = Number(e.currentTarget.getAttribute('data-index'));
    const meals = getJSON(KEYS.MEALS, []);
    meals.splice(i,1);
    setJSON(KEYS.MEALS, meals);
    loadMeals();
  });
  mealTableBody.appendChild(tr);
}

function sumSaltForDate(date) {
  const meals = getJSON(KEYS.MEALS, []);
  return meals.filter(m=>m.date===date).reduce((a,c)=>a+(Number(c.salt)||0),0) / 1000; // grams
}
function sumSaltLast7Days() {
  const meals = getJSON(KEYS.MEALS, []);
  const now = new Date(todayISO());
  const from = new Date(now); from.setDate(now.getDate()-6); // 7-day window
  return meals
    .filter(m=>{
      const d = new Date(m.date);
      return d>=from && d<=now;
    })
    .reduce((a,c)=>a+(Number(c.salt)||0),0) / 1000; // grams
}

function updateSaltSummaries() {
  todaySaltEl.textContent = sumSaltForDate(todayISO()).toFixed(2);
  weeklySaltEl.textContent = sumSaltLast7Days().toFixed(2);
}

// Nutritionix call (returns sodium, convert to salt in mg)
async function fetchSaltFromNutritionix(food) {
  const body = {
    query: `${food}`
  };

  const res = await fetch('https://trackapi.nutritionix.com/v2/natural/nutrients', {
    method: 'POST',
    headers: {
      'Content-Type':'application/json',
      'x-app-id': NIX_APP_ID,
      'x-app-key': NIX_APP_KEY
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) throw new Error('Nutritionix error');
  const data = await res.json();
  const first = data.foods && data.foods[0];
  return first && typeof first.nf_sodium === 'number' ? first.nf_sodium * 2.5 : 0;
}

mealForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const date = document.getElementById('meal_date').value;
  const food = document.getElementById('food').value.trim();

  if (!date || !food) {
    alert('Please fill all meal fields.');
    return;
  }

  let salt = 0;
  const btn = mealForm.querySelector('button[type="submit"]');
  const original = btn.innerHTML;
  btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Fetching…';

  try {
    salt = await fetchSaltFromNutritionix(food); // You can adjust qty/unit if needed
  } catch (err) {
    console.error(err);
    alert('Could not fetch salt. Using 0 mg.');
  } finally {
    btn.disabled = false; btn.innerHTML = original;
  }

  const meals = getJSON(KEYS.MEALS, []);
  const id = meals.length ? meals[meals.length-1].id + 1 : 1;
  meals.push({ id, date, food, salt });
  setJSON(KEYS.MEALS, meals);

  mealForm.reset();
  document.getElementById('meal_date').value = todayISO();
  loadMeals();
});

clearMealsBtn.addEventListener('click', ()=>{
  if (confirm('Clear all meal logs?')) {
    setJSON(KEYS.MEALS, []);
    loadMeals();
  }
});

// Initial render
document.addEventListener('DOMContentLoaded', loadMeals);
