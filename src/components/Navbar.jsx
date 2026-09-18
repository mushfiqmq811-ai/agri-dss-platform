import React from 'react';
import { translations } from '../translations';

export default function Navbar({ activeTab, setActiveTab, lang }) {
  const t = translations[lang].nav;
  const items = [
    ['dashboard',t.dashboard],['farmer',t.farmerMode],['doctor',t.doctor],['irrigation',t.irrigation],
    ['risk',t.risk],['map',t.map],['researcher',t.researcherMode],['sources',t.dataSources],['status',t.apiStatus]
  ];
  return <nav className="navbar">{items.map(([id,label]) =>
    <button key={id} className={activeTab===id?'active':''} onClick={()=>setActiveTab(id)}>{label}</button>
  )}</nav>;
}