import React,{useEffect,useState} from 'react';
import {getApiStatusCenter} from '../services/apiService';

export default function ResearcherMode({statusOnly=false}){
 const [status,setStatus]=useState(null);
 useEffect(()=>{getApiStatusCenter().then(setStatus).catch(()=>setStatus({error:'Backend unavailable'}))},[]);
 const rows=[['Weather Forecast','Open-Meteo','Daily + current','Live API'],['Soil Properties','ISRIC SoilGrids','Modeled global soil data','Modeled API'],['Field Telemetry','ThingSpeak public feed','Latest public feed item','External feed'],['Satellite','Copernicus Sentinel-2','10 m imagery product','Credential status'],['AI Vision','Gemini','Image-based preliminary assessment','Credential status']];
 if(statusOnly)return <div className="page"><section className="panel"><span className="eyebrow">SYSTEM</span><h2>⚡ API Health</h2>{status?<div className="status-list">{Object.entries(status).map(([k,v])=><div className="status-row" key={k}><b>{k}</b><span className={v.status?.includes('CONNECTED')||v.status==='CONFIGURED'?'ok':'pending'}>{v.status}</span></div>)}</div>:<p>Checking…</p>}</section></div>;
 return <div className="page"><section className="panel"><span className="eyebrow">RESEARCHER MODE</span><h2>🔬 Data Console & Metadata</h2><p className="muted">Every source is labeled so modeled, public-feed and live API data are not presented as the same thing.</p><div className="table-wrap"><table><thead><tr><th>Variable</th><th>Source</th><th>Resolution / Frequency</th><th>Status</th></tr></thead><tbody>{rows.map(r=><tr key={r[0]}>{r.map((x,i)=><td key={i}>{x}</td>)}</tr>)}</tbody></table></div></section></div>
}