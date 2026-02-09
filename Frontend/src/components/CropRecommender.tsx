import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { FaCopy, FaCheck, FaHistory, FaQuestionCircle } from 'react-icons/fa';
import { GiMoneyStack, GiWheat } from "react-icons/gi";
import { GrCycle } from "react-icons/gr";

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

// ================= Sub-components =================

const Loader = () => (
  <div className="flex justify-center items-center p-8">
    <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

interface Recommendation {
  crop: string;
  prob: number;
  yield?: string;
  profit?: number;
  sustainability?: string;
}

// Profitability mapping provided by user (values are percentages)
const crops_profitability: Record<string, number> = {
  rice: 20,
  wheat: 25,
  maize: 30,
  barley: 25,
  sorghum: 20,
  millets: 40,
  cotton: 20,
  sugarcane: 35,
  tobacco: 45,
  jute: 25,

  brinjal: 45,
  chili: 50,
  onion: 40,
  potato: 35,
  tomato: 45,

  soybean: 30,
  blackgram: 35,
  mungbean: 40,
  mothbeans: 35,
  chickpea: 40,
  lentil: 30,
  kidneybeans: 35,
  pigeonpeas: 40,

  banana: 60,
  mango: 50,
  papaya: 70,
  pomegranate: 60,
  watermelon: 50,
  muskmelon: 45,
  apple: 40,
  grapes: 60,
  orange: 45,
  coconut: 40,
  coffee: 55,
};

// Normalize crop names to keys: lowercase and remove spaces/hyphens
const normalizeCropKey = (name: string) => name.toLowerCase().replace(/\s+/g, "").replace(/[-_]/g, "");

const RecommendationCard = ({ recommendation }: { recommendation: Recommendation }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = `Recommended Crop: ${recommendation.crop}\nProbability: ${(recommendation.prob * 100).toFixed(2)}%`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-lg animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Recommended Crop</p>
          <h3 className="text-2xl font-bold text-green-500 capitalize">{recommendation.crop}</h3>
        </div>
        <button onClick={handleCopy} className="text-gray-400 hover:text-green-500">
          {copied ? <FaCheck className="text-green-500" /> : <FaCopy />}
        </button>
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
           <GiWheat className="mx-auto text-3xl text-yellow-500 mb-1"/>
           <p className="text-lg font-semibold">{(recommendation.prob * 100).toFixed(2)}%</p>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
           <GiMoneyStack className="mx-auto text-3xl text-green-500 mb-1"/>
           <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Est. Profit</p>
          <p className="text-lg font-semibold">{recommendation.profit !== undefined ? `${recommendation.profit.toFixed(2)}%` : '-'}</p>
        </div>
         <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
           <GrCycle className="mx-auto text-3xl text-blue-500 mb-1"/>
           <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Sustainability</p>
           <p className="text-lg font-semibold">{recommendation.sustainability ?? '-'}</p>
        </div>
      </div>
    </div>
  );
};

const HistoryPanel = ({ history }: { history?: any[] }) => {
  if (!history || history.length === 0) return null;
  const formatTimestamp = (isoString: string) =>
    new Date(isoString).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
  return (
    <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold mb-4 flex items-center"><FaHistory className="mr-2"/> Recommendation History</h3>
      <ul className="space-y-3 max-h-60 overflow-y-auto">
        {history.map((item) => {
          const firstRecommendation = item.recommendations?.[0];
          return (
            <li key={item._id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-2 rounded-md">
              <span className="font-medium capitalize">{firstRecommendation?.crop || 'N/A'}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{formatTimestamp(item.timestamp)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const HowItWorksTooltip = () => (
  <div className="fixed bottom-5 right-5 group">
    <FaQuestionCircle className="text-3xl text-green-500 cursor-pointer" />
    <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-gray-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
      We use a Machine Learning model and your farm data to provide crop recommendations.
      <div className="absolute bottom-[-4px] right-4 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-gray-800"></div>
    </div>
  </div>
);

const FormInput = ({
  name,
  value,
  onChange,
  placeholder
}: {
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{name}</label>
    <input
      type={name === 'location' ? 'text' : 'number'}
      name={name}
      id={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder || name}
      className="mt-1 block w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
      step="any"
      required
    />
  </div>
);

// ================= Main Component =================

function CropRecommender() {
  const [formData, setFormData] = useState({
    N: '', P: '', K: '', pH: '',
    location: '', temperature: '', humidity: '', rainfall: '',
    soil_moisture: '', sunlight_hours: '', farm_size: ''
  });
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/history`);
      setHistory(response.data?.slice().reverse() || []);
    } catch (err) {
      console.error("Error fetching history:", err);
      setHistory([]);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.N || !formData.P || !formData.K || !formData.pH ||
        !formData.location || !formData.temperature || !formData.humidity || !formData.rainfall) {
      setError("⚠️ Please fill all fields before submitting.");
      return;
    }

    setLoading(true);
    setError('');
    setRecommendations([]);

    try {
      const response = await axios.post(`${API_URL}/predict`, {
        N: parseFloat(formData.N),
        P: parseFloat(formData.P),
        K: parseFloat(formData.K),
        pH: parseFloat(formData.pH),
        location: formData.location,
        temperature: parseFloat(formData.temperature),
        humidity: parseFloat(formData.humidity),
        rainfall: parseFloat(formData.rainfall),
        soil_moisture: parseFloat(formData.soil_moisture),
        sunlight_hours: parseFloat(formData.sunlight_hours),
        farm_size: parseFloat(formData.farm_size)
      });

      const recs = (response.data || [])
        .slice(0, 3) // Only top 3 recommendations
        .map((item: any) => {
          const crop = item.crop || 'N/A';
          const key = normalizeCropKey(crop);
          const profit = crops_profitability[key];
          return {
            crop,
            prob: item.prob || 0,
            yield: "-",
            profit: profit !== undefined ? profit : undefined,
            sustainability: "-",
          } as Recommendation;
        });

      setRecommendations(recs);
      await fetchHistory();
    } catch (err) {
      console.error(err);
      setError('❌ Failed to get recommendation. Please check inputs or try again later.');
    } finally {
      setLoading(false);
    }
  };

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
    farm_size: "Farm Size (ha)",
    location: "Farm Location"
  };

  return (
    <div className="pt-24 p-4 sm:p-6 lg:p-8"> {/* Added top padding to avoid nav overlap */}
      <header className="mb-6">
        <br></br><br></br>
        <h1 className="text-3xl sm:text-4xl font-bold text-green-500">Agri-Assist</h1>
        <p className="text-gray-600 dark:text-gray-400">AI-Powered Crop Recommendations</p>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Soil Data */}
              <div>
                <h3 className="text-lg font-semibold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Soil Data</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormInput name="N" value={formData.N} onChange={handleInputChange} placeholder={placeholders.N}/>
                  <FormInput name="P" value={formData.P} onChange={handleInputChange} placeholder={placeholders.P}/>
                  <FormInput name="K" value={formData.K} onChange={handleInputChange} placeholder={placeholders.K}/>
                  <FormInput name="pH" value={formData.pH} onChange={handleInputChange} placeholder={placeholders.pH}/>
                  <FormInput name="soil_moisture" value={formData.soil_moisture} onChange={handleInputChange} placeholder={placeholders.soil_moisture}/>
                  <FormInput name="sunlight_hours" value={formData.sunlight_hours} onChange={handleInputChange} placeholder={placeholders.sunlight_hours}/>
                  <FormInput name="farm_size" value={formData.farm_size} onChange={handleInputChange} placeholder={placeholders.farm_size}/>
                </div>
              </div>

              {/* Location & Weather Data */}
              <div>
                <h3 className="text-lg font-semibold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Location & Weather Data</h3>
                <div className="space-y-4">
                  <FormInput name="location" value={formData.location} onChange={handleInputChange} placeholder={placeholders.location}/>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormInput name="temperature" value={formData.temperature} onChange={handleInputChange} placeholder={placeholders.temperature}/>
                    <FormInput name="humidity" value={formData.humidity} onChange={handleInputChange} placeholder={placeholders.humidity}/>
                    <FormInput name="rainfall" value={formData.rainfall} onChange={handleInputChange} placeholder={placeholders.rainfall}/>
                  </div>
                </div>
              </div>

              <div>
                <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400">
                  {loading ? 'Analyzing...' : 'Get Recommendation'}
                </button>
              </div>

            </form>
          </div>

          <HistoryPanel history={history}/>
        </div>

        {/* Recommendations */}
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-semibold mb-4">Top 3 Recommendations</h2>
          {loading && <Loader />}
          {error && <p className="text-red-500 bg-red-100 dark:bg-red-900/50 p-4 rounded-lg">{error}</p>}
          {!loading && recommendations.length === 0 && !error && (
            <div className="text-center py-12 px-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400">Your crop recommendations will appear here.</p>
            </div>
          )}
          <div className="space-y-4">
            {recommendations.map((rec, idx) => <RecommendationCard key={idx} recommendation={rec} />)}
          </div>
        </div>
      </main>

      <HowItWorksTooltip/>
    </div>
  );
}

export default CropRecommender;
