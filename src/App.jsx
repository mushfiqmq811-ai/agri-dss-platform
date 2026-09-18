import React,{useState} from 'react';
import Header from './components/Header';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import FarmerMode from './components/FarmerMode';
import CropDoctor from './components/CropDoctor';
import GisMap from './components/GisMap';
import RiskOutlook from './components/RiskOutlook';
import ResearcherMode from './components/ResearcherMode';

export default function App(){
 const [activeTab,setActiveTab]=useState('dashboard'),[lang,setLang]=useState('bn'),[demoMode,setDemoMode]=useState(false);
 const content={
 dashboard:<Dashboard demoMode={demoMode}/>, farmer:<FarmerMode/>, doctor:<CropDoctor/>, irrigation:<FarmerMode/>,
 risk:<RiskOutlook/>, map:<GisMap/>, researcher:<ResearcherMode/>, sources:<ResearcherMode/>, status:<ResearcherMode statusOnly/>
 };
 return <div className="app"><Header {...{lang,setLang,demoMode,setDemoMode}}/><Navbar {...{activeTab,setActiveTab,lang}}/><main>{content[activeTab]}</main><footer>AGRI-VISION DSS • Transparent data-source architecture • Bangladesh-focused agricultural decision support</footer></div>
}