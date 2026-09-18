import React,{useEffect,useRef,useState} from 'react';
import {getSatelliteData} from '../services/apiService';

export default function GisMap(){
 const ref=useRef(null),[sat,setSat]=useState(null);
 useEffect(()=>{
   if(!window.L||!ref.current)return;
   const map=window.L.map(ref.current).setView([24.095,90.325],11);
   window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
   window.L.marker([24.095,90.325]).addTo(map).bindPopup('<b>Target Field</b><br/>Kaliakair-area demo coordinate.').openPopup();
   getSatelliteData().then(setSat).catch(()=>{});
   return()=>map.remove();
 },[]);
 return <div className="page"><section className="panel"><span className="eyebrow">GIS</span><h2>🗺️ Farm Spatial Map</h2><p className="muted">OpenStreetMap base layer with a selected demonstration field coordinate.</p><div ref={ref} className="map"/></section><section className="panel"><h3>🛰️ Sentinel-2 status</h3><p>{sat?.status||'Checking satellite authentication…'}</p><small className="muted">{sat?.note||sat?.message||'Copernicus credentials are kept on the backend.'}</small></section></div>
}