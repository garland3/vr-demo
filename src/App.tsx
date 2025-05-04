
import React, { useState } from 'react';
import VRView from './components/VRView';
import StartScreen from './components/StartScreen';
import CameraPreview from './components/CameraPreview';

function App() {
  const [mode, setMode] = useState<'start' | 'preview' | 'vr'>('start');

  const handleStartPreview = () => {
    setMode('preview');
  };

  const handleStartVR = () => {
    setMode('vr');
  };

  const handleBack = () => {
    setMode('start');
  };

  return (
    <div className="w-full min-h-screen bg-black text-white">
      {mode === 'start' && (
        <StartScreen onStartVR={handleStartVR} onStartPreview={handleStartPreview} />
      )}
      {mode === 'preview' && (
        <CameraPreview onBack={handleBack} onEnterVR={handleStartVR} />
      )}
      {mode === 'vr' && (
        <VRView onExit={handleBack} />
      )}
    </div>
  );
}

export default App;
