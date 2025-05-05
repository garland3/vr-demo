
import React, { useState, useCallback } from 'react';
import VRView from './components/VRView';
import StartScreen from './components/StartScreen';
import CameraPreview from './components/CameraPreview';

function App() {
  const [mode, setMode] = useState<'start' | 'preview' | 'vr'>('start');
  const [aiSettings, setAiSettings] = useState({
    query: "Are there people and what are they doing?",
    intervalSeconds: 10
  });

  const handleStartPreview = () => {
    setMode('preview');
  };

  const handleStartVR = () => {
    setMode('vr');
  };

  const handleBack = () => {
    setMode('start');
  };
  
  const handleAISettingsChange = useCallback((query: string, intervalSeconds: number) => {
    setAiSettings({ query, intervalSeconds });
  }, []);

  return (
    <div className="w-full min-h-screen bg-black text-white">
      {mode === 'start' && (
        <StartScreen 
          onStartVR={handleStartVR} 
          onStartPreview={handleStartPreview} 
          onAISettingsChange={handleAISettingsChange}
        />
      )}
      {mode === 'preview' && (
        <CameraPreview onBack={handleBack} onEnterVR={handleStartVR} />
      )}
      {mode === 'vr' && (
        <VRView 
          onExit={handleBack} 
          aiQuery={aiSettings.query}
          aiIntervalSeconds={aiSettings.intervalSeconds}
        />
      )}
    </div>
  );
}

export default App;
