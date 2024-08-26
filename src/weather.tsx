import React, { useEffect, useState } from 'react';
import { fetchWeatherApi } from 'openmeteo';
import codes from "./codes.json";

interface WeatherData {
  time: Date;
  temp: string;
  precipitation: number,
  weatherCode: {description: string, image: string}
};
  

async function getWeatherData() {

    const start = new Date();
	const end = new Date();
    end.setDate(start.getDate() + 1);

    const params = {
        "latitude": 40.756491,
        "longitude": -73.985275,
        "hourly": ["temperature_2m", "precipitation_probability", "weather_code"],
        "timezone": "America/New_York",
        "start_hour": start.toISOString().substring(0, 16),
        "end_hour": end.toISOString().substring(0, 16),
    };
    const url = "https://api.open-meteo.com/v1/forecast";
    const responses = await fetchWeatherApi(url, params);
    
    // Helper function to form time ranges
    const range = (start: number, stop: number, step: number) =>
        Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);
    
    // Process first location. Add a for-loop for multiple locations or weather models
    const response = responses[0];
    
    // Attributes for timezone and location
    const utcOffsetSeconds = response.utcOffsetSeconds();
    
    const hourly = response.hourly()!;
    
    // Note: The order of weather variables in the URL query and the indices below need to match!
    const forecastData = {
    
        hourly: {
            time: range(Number(hourly.time()), Number(hourly.timeEnd()), hourly.interval()).map(
                (t) => new Date((t + utcOffsetSeconds) * 1000)
            ),
            temperature2m: hourly.variables(0)!.valuesArray()!,
            precipitationProbability: hourly.variables(1)!.valuesArray()!,
            weatherCode: hourly.variables(2)!.valuesArray()!,
        },
    
    };

    const forecast = [];
    let code = "";

    for (let i = 1; i < 7; i++) {

        code = forecastData.hourly.weatherCode[i].toFixed(0);

        forecast.push({
            time: forecastData.hourly.time[i],
            temp: forecastData.hourly.temperature2m[i].toFixed(0).toString() + "°C",
            precipitation: forecastData.hourly.precipitationProbability[i],
            weatherCode: forecastData.hourly.time[i].getHours() > 18 ? 
                codes[code as keyof typeof codes].night :
                codes[code as keyof typeof codes].day 
        });
    }
    
    return forecast;
}


const WeatherWidget: React.FC = () => {
    
    const [forecast, setForecast] = useState<WeatherData[]>([]);

    useEffect(() => {

        const updateForecast = async () => {
            const forecast = await getWeatherData();
            setForecast(forecast);
        };

        updateForecast();


        const intervalId = setInterval(updateForecast, 1000000);

        return () => clearInterval(intervalId);
    }, []);


    return (
    <div className="w-full bg-blue-600 text-white rounded-xl p-4">
        <div className="flex items-center">
        <div>
            <h2 className="text-lg">New York City</h2>
            <p className="text-6xl font-bold">{forecast?.at(0)?.temp}</p>
        </div>
        <div className="m-4">
            <p>{forecast?.at(0)?.weatherCode.description}</p>
        </div>
        </div>
        <div className="mt-4 flex justify-between">
        {forecast.map(({ time, temp, precipitation }) => (
            <div key={time.toLocaleString('en-US', {hour: 'numeric', hour12: true})} className="flex-grow text-center">
            <div className="text-sm">{time.toLocaleString('en-US', {hour: 'numeric', hour12: true})}</div>
            {precipitation <= 30 ? (
                <div className="mt-1 text-xl">☀️</div>
            ) : (
                <div className="mt-1 text-xl">🌧️</div>
            )}
            <div className="mt-1">{temp}</div>
            </div>
        ))}
        </div>
    </div>
    );
};

export { WeatherWidget } ;