from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

app = Flask(__name__)
CORS(app)

# trained model
model = joblib.load("rf_model.pkl")

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()

    try:
        # features from request
        features = [
            data["age"],
            data["salt_intake"],       
            data["stress_score"],      
            data["sleep_duration"],    
            data["bmi"],              
            data["family_history"],    
            data["smoking_status"],    
            data["bp_history_normal"],
            data["bp_history_prehypertension"],     
            data["medication_beta_blocker"],    
            data["medication_diuretic"],     
            data["medication_none"],       
            data["medication_other"],      
            data["exercise_level_low"],
            data["exercise_level_moderate"],
        ]

        features = np.array(features).reshape(1, -1)

        prediction = model.predict(features)[0]
        probability = (
            model.predict_proba(features)[0, 1]
            if hasattr(model, "predict_proba")
            else float(prediction)
        )

        return jsonify({
            "risk_category": str(prediction),
            "probability": float(probability)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    app.run(debug=True)
