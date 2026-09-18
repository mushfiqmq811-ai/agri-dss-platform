import React, { useEffect, useState } from 'react';
import { getWeatherData, getSoilData, getIotData } from '../services/apiService';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const demoWeather = {
  current:{temperature:28.5,humidity:78,windSpeed:12.4,precipitation:0},
  dailyForecast:[1,2,3,4,5,6,7].map((d,i)=>({date:`Day ${d}`,maxTemp:31+(i%3),minTemp:23+(i%2),precipitationSum:[0,2.1,15.4,8,.5,3,1.2][i]}))
};

export default function Dashboard({ demoMode }) {
  const [data,setData]=useState({weather:null,soil:null,iot:null});
  const [loading,setLoading]=useState(true), [error,setError]=useState('');
  useEffect(()=>{
    let cancelled=false;
    (async()=>{
      setLoading(true);setError('');
      try {
        const result = demoMode ? {
          weather:demoWeather, soil:{properties:{ph:"6.50",organicCarbon:"14.20",clayContent:"28.5"}},
          iot:{telemetry:{soilMoisture:42.1,temperature:27.8,humidity:75}}
        } : await Promise.all([getWeatherData(),getSoilData(),getIotData()]).then(([weather,soil,iot])=>({weather,soil,iot}));
        if(!cancelled)setData(result);
      } catch(e){if(!cancelled)setError(e.message)}
      finally{if(!cancelled)setLoading(false)}
    })();
    return ()=>{cancelled=true};
  },[demoMode]);

  if(loading)return <div className="state">⏳ Loading environmental data…</div>;
  if(error)return <div className="error">⚠️ <b>Telemetry Error:</b> {error}<br/><small>Make sure the backend is running on port 5000.</small></div>;
  const {weather,soil,iot}=data;
  return <div className="page">
    <div className="hero-card">
      <div><span className="eyebrow">DECISION SUPPORT</span><h2>Field Intelligence Dashboard</h2><p>Weather, soil and sensor signals normalized into one view.</p></div>
      <span className="status-badge">{demoMode?'SIMULATION':'LIVE API'}</span>
    </div>
    <div className="grid4">
      <Metric title="WEATHER • OPEN-METEO" value={`${weather?.current?.temperature ?? '--'}°C`} detail={`Humidity ${weather?.current?.humidity ?? '--'}% • Wind ${weather?.current?.windSpeed ?? '--'} km/h`} icon="🌦️"/>
      <Metric title="SOIL MOISTURE • THINGSPEAK" value={`${iot?.telemetry?.soilMoisture ?? '--'}%`} detail={iot?.telemetry?.soilMoisture<35?'⚠️ Deficit':'✅ Above advisory threshold'} icon="💧"/>
      <Metric title="SOIL PROFILE • SOILGRIDS" value={`pH ${soil?.properties?.ph ?? '--'}`} detail={`SOC ${soil?.properties?.organicCarbon ?? '--'} g/kg • Clay ${soil?.properties?.clayContent ?? '--'}%`} icon="🌱"/>
      <Metric title="SYSTEM MODE" value={demoMode?'SIMULATION':'LIVE API'} detail="Data-source labels remain visible for transparency." icon="⚡"/>
    </div>
    <section className="panel">
      <div className="panel-head"><div><h3>📈 Forecast Trend</h3><p>7-day temperature and precipitation from the normalized weather service.</p></div></div>
      <div style={{width:'100%',height:300}}>
        <ResponsiveContainer><LineChart data={weather?.dailyForecast||[]}><CartesianGrid strokeDasharray="3 3" stroke="#334155"/><XAxis dataKey="date" stroke="#94a3b8"/><YAxis stroke="#94a3b8"/><Tooltip contentStyle={{background:'#0f172a',border:'1px solid #334155'}}/><Line type="monotone" dataKey="maxTemp" name="Max °C" stroke="#ef4444" strokeWidth={2}/><Line type="monotone" dataKey="minTemp" name="Min °C" stroke="#38bdf8" strokeWidth={2}/><Line type="monotone" dataKey="precipitationSum" name="Rain mm" stroke="#34d399" strokeWidth={2}/></LineChart></ResponsiveContainer>
      </div>
    </section>
  </div>;
}
function Metric({title,value,detail,icon}){return <div className="metric"><div className="metric-icon">{icon}</div><span className="eyebrow">{title}</span><strong>{value}</strong><p>{detail}</p></div>}