# File: Flask/app/services.py (UPDATED to include SoilGrids)

import requests
import json
import os # Needed for environment variables (if we were using SoilGrids with a key)

# --- API Endpoints ---
OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"
# SoilGrids REST API v2.0 endpoint for property queries
SOILGRIDS_URL = "https://rest.isric.org/soilgrids/v2.0/properties/query"


# --- SoilGrids Helper Function ---

def _fetch_single_soil_property(latitude: float, longitude: float, property_name: str, depth_interval: str = '0-5cm'):
    """
    Fetches a single soil property (e.g., phh2o, nitrogen) at a specific depth and returns the mean prediction.
    """
    params = {
        "lon": longitude,
        "lat": latitude,
        "property": [property_name],
        "depth": [depth_interval],
        # Mean (Q0.50) is the most common prediction to use
        "value": ["mean"], 
        "spatialres": "250m" # Resolution
    }
    
    try:
        response = requests.get(SOILGRIDS_URL, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # Parse the JSON structure to get the value
        # Data is stored as an array of properties -> depth -> values
        layers = data.get('properties', {}).get('layers', [])
        if layers:
            mean_value_raw = layers[0].get('depths', [{}])[0].get('values', {}).get('mean')
            
            if property_name == 'phh2o':
                # SoilGrids stores pH * 10 (e.g., pH 6.5 is stored as 65). We divide by 10.
                return mean_value_raw / 10 if mean_value_raw is not None else None
            elif property_name == 'nitrogen':
                # Nitrogen is stored in cg/kg * 100. Let's return the raw value for now.
                return mean_value_raw
            else:
                return mean_value_raw
        
        return None

    except requests.exceptions.RequestException as e:
        print(f"Error fetching SoilGrids property {property_name}: {e}")
        return None


# --- Main Soil Data Fetcher ---

def fetch_soil_data(latitude: float, longitude: float):
    """
    Fetches all required soil properties (N, P, K, pH) using SoilGrids and mocks missing data.
    """
    
    # 1. Fetch data from SoilGrids (N and pH are directly available)
    
    # pH (phh2o) and Nitrogen (nitrogen) at 0-5cm depth
    soil_ph = _fetch_single_soil_property(latitude, longitude, 'phh2o', '0-5cm')
    soil_nitrogen = _fetch_single_soil_property(latitude, longitude, 'nitrogen', '0-5cm')
    
    # 2. Mock missing data (P and K are usually obtained via lab tests or statistical models)
    # Since SoilGrids doesn't provide them, we mock them for the ML model input.
    MOCK_PHOSPHORUS = 45 # kg/ha
    MOCK_POTASSIUM = 190 # kg/ha
    
    # 3. Handle successful fetch vs. API failure
    if soil_ph is None or soil_nitrogen is None:
         # If any critical API call fails, return full mock set
         return {
            "N": 100, # Mock Nitrogen value
            "P": MOCK_PHOSPHORUS,
            "K": MOCK_POTASSIUM,
            "pH": 6.5, # Mock pH value
            "source": "MOCK_FALLBACK"
        }
        
    # 4. Return the combined real/mock data
    return {
        "N": soil_nitrogen,
        "P": MOCK_PHOSPHORUS,
        "K": MOCK_POTASSIUM,
        "pH": soil_ph,
        "source": "SOILGRIDS"
    }


# --- Existing Weather Data Fetcher (Included for completeness) ---

def fetch_weather_data(latitude: float, longitude: float):
    # This is the weather function from the previous step, ensuring the file remains whole.
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": ["temperature_2m", "relative_humidity_2m", "precipitation", "wind_speed_10m"],
        "daily": ["temperature_2m_max", "temperature_2m_min", "precipitation_sum", "wind_speed_10m_max"],
        "forecast_days": 5, 
        "timezone": "auto" 
    }
    
    try:
        response = requests.get(OPEN_METEO_URL, params=params)
        response.raise_for_status() 
        
        data = response.json()
        current = data.get('current', {})
        daily = data.get('daily', {})
        
        weather_output = {
            "current": {
                "Temperature": current.get('temperature_2m'), 
                "Humidity": current.get('relative_humidity_2m'), 
                "Rainfall": current.get('precipitation'), 
                "WindSpeed": current.get('wind_speed_10m')
            },
            "forecast_5day": {
                "Time": daily.get('time', []),
                "Temp_Max": daily.get('temperature_2m_max', []),
                "Temp_Min": daily.get('temperature_2m_min', []),
                "Rainfall_Sum": daily.get('precipitation_sum', []),
                "WindSpeed_Max": daily.get('wind_speed_10m_max', [])
            }
        }
        return weather_output

    except requests.exceptions.RequestException as e:
        print(f"Error fetching weather data from Open-Meteo: {e}")
        return {
            "current": {
                "Temperature": 25.0,
                "Humidity": 75.0,
                "Rainfall": 50.0,
                "WindSpeed": 10.0
            },
            "forecast_5day": {
                "Time": ["2025-10-04", "2025-10-05", "2025-10-06", "2025-10-07", "2025-10-08"],
                "Temp_Max": [30.0, 31.0, 29.5, 30.5, 31.5],
                "Temp_Min": [18.0, 19.0, 17.5, 18.5, 19.5],
                "Rainfall_Sum": [10.0, 5.0, 0.0, 2.0, 8.0],
                "WindSpeed_Max": [15.0, 18.0, 12.0, 14.0, 16.0]
            }
        }
