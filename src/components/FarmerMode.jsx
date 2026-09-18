import React, {useState} from 'react';
import {getIrrigationDecision} from '../services/apiService';

export default function FarmerMode(){
 const [soilMoisture,setSoilMoisture]=useState(30),[rainProb,setRainProb]=useState(60),[precip,setPrecip]=useState(12),[decision,setDecision]=useState(null),[loading,setLoading]=useState(false);
 const check=async()=>{setLoading(true);try{setDecision(await getIrrigationDecision({soilMoisture:Number(soilMoisture),rainProbability:Number(rainProb),forecastPrecip:Number(precip),cropType:'Boro Rice',stage:'Vegetative'}))}catch(e){setDecision({error:e.message})}finally{setLoading(false)}};
 return <div className="page">
   <div className="hero-card green"><div><span className="eyebrow">FARMER MODE</span><h2>👨‍🌾 সহজ কৃষক সহায়িকা</h2><p>জটিল ডাটা ছাড়া মাঠের সেচ সিদ্ধান্তকে সহজভাবে দেখুন।</p></div></div>
   <section className="panel"><h3>💧 আজ জমিতে সেচ দেবেন কি?</h3><p className="muted">এটি একটি configurable decision-support rule; স্থানীয় মাটি, ফসল ও মাঠের তথ্য দিয়ে threshold যাচাই করা উচিত।</p>
   <div className="form-grid">{[['মাটির আর্দ্রতা (%)',soilMoisture,setSoilMoisture],['বৃষ্টির সম্ভাবনা (%)',rainProb,setRainProb],['সম্ভাব্য বৃষ্টিপাত (mm)',precip,setPrecip]].map(([label,val,set])=><label key={label}>{label}<input type="number" value={val} onChange={e=>set(e.target.value)}/></label>)}</div>
   <button className="primary-btn" onClick={check} disabled={loading}>{loading?'অপেক্ষা করুন…':'🔍 সেচ নির্দেশিকা দেখুন'}</button>
   {decision&&<div className={`decision ${decision.recommendation==='IRRIGATION_DELAYED'?'warn':''}`}>{decision.error?<b>⚠️ {decision.error}</b>:<><h3>{decision.recommendation==='IRRIGATION_DELAYED'?'⏸️ সেচ আপাতত স্থগিত রাখুন':decision.recommendation==='IRRIGATION_RECOMMENDED'?'💧 সেচ বিবেচনা করুন':'✅ সেচ আপাতত প্রয়োজন নেই'}</h3><ul>{decision.factors.map((x,i)=><li key={i}>{x}</li>)}</ul></>}</div>}
   </section>
 </div>
}