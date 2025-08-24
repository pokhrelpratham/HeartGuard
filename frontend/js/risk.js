const calcRiskBtn = document.getElementById('calcRiskBtn');
const riskLoading = document.getElementById('riskLoading');
const riskResult = document.getElementById('riskResult');

// --- helper function ---
function todayISO() {
    return new Date().toISOString().slice(0, 10);
}

// --- LocalStorage get/set helpers ---
function getJSON(key, defaultVal) {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultVal;
}

// --- Get last 7 days dates ---
function getLast7DaysDates() {
    const today = new Date(todayISO());
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        return d.toISOString().slice(0, 10);
    }).reverse();
}

// --- average weekly features ---
function weeklyAverageFeatures() {
    const daily = getJSON('hg_daily_logs', []);
    const meals = getJSON('hg_meal_logs', []);
    const dates = getLast7DaysDates();

    let totalSleep = 0, totalStress = 0, totalExercise = 0, daysCount = 0;
    let totalSaltWeek = 0;

    dates.forEach(date => {
        const d = daily.find(x => x.date === date);
        if (d) {
            totalSleep += Number(d.sleep) || 0; // in hours
            totalStress += Number(d.stress) || 0; // scale 1-10
            totalExercise += Number(d.exercise) || 0; // in minutes
            daysCount++; // count days with data
        }

        const saltForDate = meals // array of meal logs
            .filter(m => m.date === date)
            .reduce((a, c) => a + (Number(c.salt) || 0), 0);

        totalSaltWeek += saltForDate;
    });

    const avgSleep = daysCount ? totalSleep / daysCount : 0; 
    const avgStress = daysCount ? totalStress / daysCount : 0;
    const avgExercise = daysCount ? totalExercise / daysCount : 0;
    const avgSaltPerDay = ( totalSaltWeek / 7 ) / 1000; // convert mg to g

    return { avgSleep, avgStress, avgExercise, avgSaltPerDay, totalSaltWeek, daysCount };
}

// --- Map frontend profile + weekly feats to backend feature format ---
function mapProfileToFeatures(profile, feats) {
    if (!profile) return null;

    // BP history mapping
    const bp_history_normal = profile.bp_history === 'normal' ? 1 : 0;
    const bp_history_prehypertension = profile.bp_history === 'prehypertension' ? 1 : 0;

    // Medication mapping
    const medication_beta_blocker = profile.medication === 'Beta Blocker' ? 1 : 0;
    const medication_diuretic = profile.medication === 'Diuretic' ? 1 : 0;
    const medication_none = profile.medication === 'none' ? 1 : 0;
    const medication_other = profile.medication === 'Other' ? 1 : 0;

    // Exercise mapping
    const exercise_level_low = feats.avgExercise < 30 ? 1 : 0;
    const exercise_level_moderate = feats.avgExercise >= 30 ? 1 : 0;

    return {
        age: Number(profile.age) || 0,
        salt_intake: feats.avgSaltPerDay || 0,
        stress_score: Number(feats.avgStress) || 0,
        sleep_duration: Number(feats.avgSleep) || 0,
        bmi: Number(profile.bmi) || 0,
        family_history: profile.family_history === 'yes' ? 1 : 0,
        smoking_status: profile.smoking_status === 'yes' ? 1 : 0,
        bp_history_normal: bp_history_normal,
        bp_history_prehypertension: bp_history_prehypertension,
        medication_beta_blocker: medication_beta_blocker,
        medication_diuretic: medication_diuretic,
        medication_none: medication_none,
        medication_other: medication_other,
        exercise_level_low: exercise_level_low,
        exercise_level_moderate: exercise_level_moderate
    };
}

// --- Send POST request to Flask backend ---
async function getRiskFromBackend(features) {
    try {
        const response = await fetch("http://127.0.0.1:5000/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(features)
        });

        const data = await response.json();
        return data;
    } catch (err) {
        console.error("Error fetching risk:", err);
        return { error: "Failed to get risk from backend" };
    }
}

// --- Render risk result ---
function renderRisk(backendResult) {
    if (backendResult.error) {
        riskResult.innerHTML = `<div class="text-danger">Error: ${backendResult.error}</div>`;
        return;
    }

    const scorePct = (backendResult.probability * 100).toFixed(1);
    const label = backendResult.risk_category === "1" ? "High Risk" : "Low/Moderate Risk";
    const klass = backendResult.risk_category === "1" ? "risk-high" : "risk-low";

    riskResult.innerHTML = `
        <div class="risk-result ${klass}">
            <h3><i class="fas fa-${label==='High Risk'?'exclamation-triangle':'check-circle'}"></i> ${label}</h3>
            <p class="lead">Risk Probability: ${scorePct}%</p>
        </div>
    `;
}

// --- Event listener for calculate risk button ---
calcRiskBtn.addEventListener('click', async () => {
    riskLoading.style.display = 'block';
    riskResult.innerHTML = '';

    const profileRaw = getJSON('hg_profile', null);
    const feats = weeklyAverageFeatures();
    const features = mapProfileToFeatures(profileRaw, feats);

    // Check for missing data
    if (!profileRaw || !feats || !features) {
        riskLoading.style.display = 'none';
        riskResult.innerHTML = `<div class="text-danger">Please complete your profile and daily logs first.</div>`;
        return;
    }

    const backendResult = await getRiskFromBackend(features);
    riskLoading.style.display = 'none';
    renderRisk(backendResult);
});
