# Hypertension Risk Prediction App

## Project Description

This project addresses health risks associated with sedentary lifestyle, poor diet, and other lifestyle factors.

We built a **machine learning model** (Random Forest and Logistic Regression) to predict the weekly risk of hypertension based on diet, activity level, sleep, stress, and medical history.

The predictions are exposed via a **Flask API**, which can be connected to a frontend app for interactive use.
 
For food data, we integrated the **Nutritionix API** to calculate salt intake from meals.


---

## Dataset

We used the **Hypertension Risk Prediction dataset** from Kaggle.

**Key Features**:  
- Age  
- Salt intake  
- Stress score  
- Sleep duration  
- BMI  
- Family History of hypertension  
- Exercise level  
- Smoking status  
- Medication type  
- BP/Hypertension history  

**Target Variable**: Has_Hypertension (Yes/No)  

**Dataset Link**: [Kaggle - Hypertension Risk Prediction Dataset](https://www.kaggle.com/datasets/miadul/hypertension-risk-prediction-dataset?fbclid=IwY2xjawMW-ZhleHRuA2FlbQIxMQABHg0T4Su4l-JzISU05sAixhthTwMJeVACO6ptSgrLf9NC87RVlm4ErcggPU8O_aem_vWxAKd8P-Qsb2Pk-n7TFcg)

---

## Preprocessing

- **Missing values**: Treated “None” in Medication as a valid category; no other missing data.  
- **Encoding categorical variables**:  
  - Binary features (Family_History, Smoking_Status, Has_Hypertension) → 0/1  
  - Multi-class features (BP_History, Exercise_Level, Medication) → one-hot encoding  
- **Feature scaling**: Standardized numeric features (Age, Salt_Intake, Stress_Score, Sleep_Duration, BMI)  
- **Data splitting**: Training and test sets for model training and evaluation  

---

## Modeling

- **Logistic Regression**: baseline binary classification model  
- **Random Forest**: main predictive model  
- **Evaluation**: Accuracy, confusion matrix, and classification report  
- **Performance**: Random Forest achieved 96.7% accuracy on test data  

---

## API / Frontend Integration

- Trained model saved as `rf_model.pkl`  
- **Flask API endpoint**: `/predict`  
- Frontend sends user input (diet, activity, etc.) to API  
- API returns **predicted risk category** and **probability**  

## Nutritionix API Integration

To calculate **salt intake in grams** from food entries, the app uses the [Nutritionix API](https://developer.nutritionix.com/).

### Setup
1. Sign up at [Nutritionix Developer Portal](https://developer.nutritionix.com/) and generate your **App ID** and **API Key**.

Replace App ID and API Key in - [meals.js](frontend/js/meals.js)




## How to Run

### Dependencies
- flask
- flask-cors
- scikit-learn
- pandas
- numpy
- joblib


### Prerequisites
- Python 3.11   
- Pip installed  

### Setup

#### 1. Clone the repository:

```bash
git clone https://github.com/pokhrelpratham/HeartGuard.git

cd HeartGuard
```

#### 2. Install Dependencies:

```pip install -r requirements.txt ```

## Running the backend

``` 
cd backend

python server.py

```

Flask API will run on http://127.0.0.1:5000/

## Running the Frontend
1. Open index.html in a browser
2. Fill in profile, daily tracking, and meal information
3. Click Calculate Risk to get your predicted hypertension risk



## Future Improvements
 - Use real-world datasets instead of synthetic data for better accuracy

 - Add additional lifestyle features: alcohol, caffeine, activity

 - Explore advanced models like XGBoost or deep learning

- Develop a full-featured, user-friendly app for public use

- Implement food recognition via images for automated nutrient estimation

- Integrate with wearable devices to track activity, sleep, heart rate

- Extend predictions to additional health risks like diabetes, obesity, cardiovascular disease 







