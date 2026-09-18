import React,{useState} from 'react';
import {analyzeCropVision} from '../services/apiService';

export default function CropDoctor(){
 const [image,setImage]=useState(null),[base64,setBase64]=useState(''),[mime,setMime]=useState(''),[crop,setCrop]=useState('Boro Rice'),[result,setResult]=useState(null),[loading,setLoading]=useState(false);
 const upload=e=>{const f=e.target.files?.[0];if(!f)return;setMime(f.type);const r=new FileReader();r.onload=()=>{setImage(r.result);setBase64(String(r.result).split(',')[1]||'')};r.readAsDataURL(f)};
 const diagnose=async()=>{if(!base64)return;setLoading(true);setResult(null);try{setResult(await analyzeCropVision(base64,mime,crop))}catch(e){setResult({status:'ERROR',message:e.message})}finally{setLoading(false)}};
 return <div className="page"><section className="panel"><span className="eyebrow">VISION ANALYSIS</span><h2>🔬 AI Crop Doctor</h2><p className="muted">পাতার ছবি থেকে সম্ভাব্য সমস্যা ও পর্যবেক্ষণ। এটি preliminary visual assessment—নিশ্চিত রোগ নির্ণয় নয়।</p>
 <div className="doctor-grid"><div><label>ফসল<select value={crop} onChange={e=>setCrop(e.target.value)}><option>Boro Rice</option><option>Wheat</option><option>Potato</option><option>Maize</option><option>Tomato</option></select></label><label className="upload">পাতার ছবি<input type="file" accept="image/*" onChange={upload}/></label><button className="primary-btn" disabled={!base64||loading} onClick={diagnose}>{loading?'🤖 বিশ্লেষণ চলছে…':'🔍 রোগ/সমস্যা বিশ্লেষণ করুন'}</button></div><div className="preview">{image?<img src={image} alt="Crop leaf preview"/>:<span>📷 ছবি প্রিভিউ</span>}</div></div>
 </section>
 {result&&<section className="panel"><div className="result-head"><h3>📋 Diagnostic Report</h3><span className="status-badge">{result.confidence||result.status}</span></div>{result.message&&<p className="error">{result.message}</p>}{result.possibleIssues&&<><h4>সম্ভাব্য সমস্যা</h4><ul>{result.possibleIssues.map((x,i)=><li key={i}>{x}</li>)}</ul><h4>পর্যবেক্ষণ</h4><ul>{result.observations?.map((x,i)=><li key={i}>{x}</li>)}</ul><h4>প্রস্তাবিত পদক্ষেপ</h4><ul>{result.recommendedActions?.map((x,i)=><li key={i}>{x}</li>)}</ul><p className="notice">ℹ️ {result.limitations?.[0]}</p></>}</section>}
 </div>
}
