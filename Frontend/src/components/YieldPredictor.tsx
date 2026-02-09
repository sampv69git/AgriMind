import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import axios from "axios";
import Select from "react-select";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

interface YieldPrediction {
  crop: string;
  predicted_yield: number;
}

const cropOptions = [
  "barley", "brinjal", "chili", "millets", "onion", "potato", "sorghum", "soybean",
  "sugarcane", "tobacco", "tomato", "wheat", "apple", "banana", "blackgram", "chickpea",
  "coconut", "coffee", "cotton", "grapes", "jute", "kidneybeans", "lentil", "maize",
  "mango", "mothbeans", "mungbean", "muskmelon", "orange", "papaya", "pigeonpeas",
  "pomegranate", "rice", "watermelon"
].map(crop => ({ value: crop, label: crop }));

function YieldPredictor() {
  const [formData, setFormData] = useState({
    N: "", P: "", K: "", pH: "",
    temperature: "", humidity: "", rainfall: "",
    soil_moisture: "", sunlight_hours: "", farm_size: "",
  });
  const [selectedCrop, setSelectedCrop] = useState<{ value: string; label: string } | null>(null);
  const [predictions, setPredictions] = useState<YieldPrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPredictions([]);

    if (!selectedCrop) {
      setError("Please select a crop.");
      setLoading(false);
      return;
    }

    try {
      const numeric_features = [
        parseFloat(formData.N),
        parseFloat(formData.P),
        parseFloat(formData.K),
        parseFloat(formData.temperature),
        parseFloat(formData.humidity),
        parseFloat(formData.pH),
        parseFloat(formData.rainfall),
        parseFloat(formData.soil_moisture),
        parseFloat(formData.sunlight_hours),
        parseFloat(formData.farm_size),
      ];

      const response = await axios.post(`${API_URL}/predict_yield`, {
        numeric_features,
        crops: [selectedCrop.value]
      });

      const preds = response.data.yield_predictions;
      if (preds && typeof preds === "object") {
        setPredictions(Object.entries(preds).map(([crop, predicted_yield]) => ({
          crop,
          predicted_yield: predicted_yield as number
        })));
      } else {
        setError("Unexpected response format from server.");
      }

    } catch (err) {
      console.error(err);
      setError("❌ Failed to get yield prediction. Please check inputs or try again later.");
    } finally {
      setLoading(false);
    }
  };

  const isDark = document.documentElement.classList.contains("dark");

  const placeholders: Record<string, string> = {
    N: "Nitrogen (kg/ha)",
    P: "Phosphorus (kg/ha)",
    K: "Potassium (kg/ha)",
    pH: "Soil pH",
    temperature: "Temperature (°C)",
    humidity: "Humidity (%)",
    rainfall: "Rainfall (mm)",
    soil_moisture: "Soil Moisture (%)",
    sunlight_hours: "Sunlight Hours/day",
    farm_size: "Farm Size (ha)"
  };

  return (
    <div className="pt-16 pb-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <h2 className="text-3xl font-extrabold mb-8 text-green-600 text-center">
        🌾 Yield Predictor
      </h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl space-y-6 backdrop-blur-lg border border-green-100 dark:border-gray-700"
      >
        {/* Searchable Crop Dropdown */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
            Select Crop
          </label>
          <Select
            options={cropOptions}
            value={selectedCrop}
            onChange={setSelectedCrop}
            placeholder="Choose a crop..."
            classNamePrefix="react-select"
            isSearchable
            styles={{
              control: (base) => ({
                ...base,
                minHeight: 48,
                backgroundColor: isDark ? "#1F2937" : "#F9FAFB",
                borderColor: isDark ? "#374151" : "#D1D5DB",
                color: isDark ? "#F9FAFB" : "#111827",
                boxShadow: "0 0 0 2px transparent",
                "&:hover": {
                  borderColor: "#22C55E"
                }
              }),
              menu: (base) => ({
                ...base,
                backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
                color: isDark ? "#F9FAFB" : "#111827",
                zIndex: 9999
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isFocused
                  ? isDark ? "#374151" : "#DCFCE7"
                  : "transparent",
                color: isDark ? "#F9FAFB" : "#111827",
              }),
              singleValue: (base) => ({
                ...base,
                color: isDark ? "#F9FAFB" : "#111827"
              }),
              placeholder: (base) => ({
                ...base,
                color: isDark ? "#9CA3AF" : "#6B7280"
              })
            }}
          />
        </div>

        {/* Numeric Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(formData).map(([key, value]) => (
            <div key={key} className="flex flex-col">
              <label className="text-sm font-medium mb-1 capitalize text-gray-700 dark:text-gray-200">
                {key.replace("_", " ")}
              </label>
              <input
                name={key}
                value={value}
                onChange={handleChange}
                placeholder={placeholders[key]}
                required
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:outline-none transition"
                type="number"
                step="any"
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-600 disabled:bg-gray-400 transition"
        >
          {loading ? "Predicting..." : "Predict Yield"}
        </button>
      </form>

      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

      {/* Results Section */}
      {predictions.length > 0 && (
        <div className="mt-10 flex flex-col items-center space-y-6">
          {predictions.map((pred, idx) => (
            <div
              key={idx}
              className="w-full sm:w-3/4 p-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <p className="text-center text-xl md:text-2xl font-semibold text-gray-800 dark:text-white">
                🌱 <strong>Crop:</strong> {pred.crop}
              </p>
              <p className="mt-3 text-center text-2xl font-bold text-green-700 dark:text-green-400">
                🌾 Predicted Yield: {pred.predicted_yield.toFixed(2)} tonnes/ha
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default YieldPredictor;
