import React, { useState } from 'react';
import VRView from './components/VRView';
import StartScreen from './components/StartScreen';

function App() {
  const [isVRMode, setIsVRMode] = useState(false);

  const handleStartVR = () => {
    setIsVRMode(true);
  };

  const handleExitVR = () => {
    setIsVRMode(false);
  };

  return (
    <div className="w-full min-h-screen bg-black text-white">
      {isVRMode ? (
        <VRView onExit={handleExitVR} />
      ) : (
        <StartScreen onStartVR={handleStartVR} />
      )}
    </div>
  );
}

export default App;