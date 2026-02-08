# AgriMind 🌱

AI-powered crop recommendation and yield prediction platform. Built with Vite + React frontend and Flask backend, integrating PostgreSQL for robust data storage.

[Live Demo](https://agrimind-frontend.vercel.app/) | [Crop Recommender](https://agrimind-frontend.vercel.app/crop-recommender) | [Yield Predictor](https://agrimind-frontend.vercel.app/yield-predictor) | [Settings](https://agrimind-frontend.vercel.app/settings) | [Equipment Rentals](https://agrimind-frontend.vercel.app/equipment) | [CommunityHub](https://agrimind-frontend.vercel.app/community) |

---

## Overview

AgriMind helps farmers maximize yield, profitability, and sustainability with personalized crop recommendations using real-time soil, weather, market data, and AI-powered yield/profit estimation.

---

## ✨ Features

- *Smart Crop Recommendation* using soil, weather, and market analytics.
- *Yield/Profit Prediction* supporting 30+ crops.
- *Soil Health Monitor* for real-time NPK/pH/moisture.
- *Weather & Market Trends* live updates.
- *Clean, Responsive UI* with React + Tailwind.
- *Role-based access & secure login.*

---

## 🛠 Tech Stack

- *Frontend:* Vite, React, TypeScript, Tailwind CSS
- *Backend:* Flask (Python)
- *ML:* scikit-learn, pandas, numpy
- *Database:* PostgreSQL (default), SQLite (fallback)
- *Deployment:* Vercel (FE), Render (BE)

---

## 📂 File Structure
```

AgriMind/
├── Flask/
│ ├── app/
│ │ ├── init.py
│ │ ├── database.py
│ │ ├── models.py
│ │ ├── routes.py
│ │ ├── services.py
│ │ ├── storage.py
│ │ └── templates/
│ │ └── index.html
│ ├── instance/
│ │ └── agrimind.db
│ ├── ml/
│ │ ├── crop_recommender/
│ │ │ ├── Crop_recommendation.csv
│ │ │ ├── model_training.py
│ │ │ ├── predict.py
│ │ │ └── synthetic_missing_crops.csv
│ │ └── yield_predictor/
│ │ ├── synthetic_crop_yield_dataset_full.csv
│ │ ├── yield_model_training.py
│ │ └── yield_predict.py
│ ├── app.py
│ └── requirements.txt
├── Frontend/
│ ├── public/
│ ├── src/
│ │ ├── components/
│ │ │ ├── auth/
│ │ │ ├── settings/
│ │ │ └── ui/
│ │ ├── pages/
│ │ ├── contexts/
│ │ ├── hooks/
│ │ ├── App.tsx
│ │ ├── AppRoutes.tsx
│ │ ├── index.css
│ │ ├── main.tsx
│ ├── package.json
│ ├── tailwind.config.ts
│ ├── tsconfig.json
│ └── README.md
├── .gitignore
├── README.md
└── requirements.txt


```
- (.pkl ML model files are omitted for clarity.)

---

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- Node.js & npm
- PostgreSQL

---

## Backend Setup (Flask)
```

cd Flask
python -m venv venv
```
- Windows
```
venv\Scripts\activate
```
- macOS/Linux
```
source venv/bin/activate
pip install -r requirements.txt
```
- Setup DB (optional: adjust config for PostgreSQL)
```
python app.py
```
---

##  Frontend Setup (Vite + React)
```
cd Frontend
npm install
npm run dev
```
- Visit [http://localhost:5173](http://localhost:5173) for the React UI.

---

## 🖥 Usage

- Register/login and explore crop recommendations, yield predictions, soil monitor, and farming resources.
- Toggle between modules using the navigation bar.

---

## 🤝 Contributing

1. Fork the project
2. Create your feature branch  
   git checkout -b feature/YourFeature
3. Commit your changes  
   git commit -m 'Add feature X'
4. Push to the branch  
   git push origin feature/YourFeature
5. Open a pull request

---

### Owned By:
  [Srivathsa Bhat](https://github.com/Srivathsa05) | [Niranjan C N](https://github.com/cnniranjan72) | [Shreyas S](https://github.com/shreyassridhar44) | [Yogith D](https://github.com/YOGITH-D) | [Samarth PV](https://github.com/sampv69git)
