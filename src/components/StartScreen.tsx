import React, { useRef, useEffect, useState } from 'react';
import { Camera as Camera3d, Smartphone, Eye, Brain } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface StartScreenProps {
  onStartVR: () => void;
  onStartPreview: () => void;
  onAISettingsChange: (query: string, intervalSeconds: number) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStartVR, onStartPreview, onAISettingsChange }) => {
  const currentUrl = window.location.href;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [aiQuery, setAiQuery] = useState<string>(import.meta.env.VITE_DEFAULT_AI_PROMPT || "Are there people and what are they doing?");
  const [intervalSeconds, setIntervalSeconds] = useState<number>(10);

  useEffect(() => {
    // Ensure button is visible on mount
    buttonRef.current?.scrollIntoView({ behavior: 'auto', block: 'start' });
  }, []);
  
  useEffect(() => {
    // Update parent component with AI settings
    onAISettingsChange(aiQuery, intervalSeconds);
  }, [aiQuery, intervalSeconds, onAISettingsChange]);

  return (
    <div className="flex flex-col items-center w-full min-h-screen p-4 sm:p-6 bg-gradient-to-b from-gray-900 to-black overflow-y-auto">
      <div className="max-w-md w-full">
        <div className="sticky top-0 z-10 space-y-3 bg-gradient-to-b from-gray-900 to-gray-900/90 pt-2 pb-4">
          <button 
            onClick={onStartPreview}
            className="w-full py-3 px-6 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-semibold transition-colors duration-200 flex items-center justify-center"
          >
            <Camera3d size={20} className="mr-2" />
            <span>Test Camera & Zoom</span>
          </button>
          
          <button 
            ref={buttonRef}
            onClick={onStartVR}
            className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-colors duration-200 flex items-center justify-center"
          >
            <Eye size={20} className="mr-2" />
            <span>Enter VR Mode</span>
          </button>
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-4 sm:p-5 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center">
            <Brain className="mr-3 text-blue-400" size={24} />
            AI Image Analysis Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="aiQuery" className="block text-sm font-medium text-gray-300 mb-1">
                Ask AI about what it sees:
              </label>
              <textarea
                id="aiQuery"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="E.g., Are there people and what are they doing?"
              />
            </div>
            <div>
              <label htmlFor="intervalSeconds" className="block text-sm font-medium text-gray-300 mb-1">
                Analysis interval (seconds):
              </label>
              <div className="flex items-center">
                <input
                  id="intervalSeconds"
                  type="range"
                  min="2"
                  max="30"
                  value={intervalSeconds}
                  onChange={(e) => setIntervalSeconds(parseInt(e.target.value))}
                  className="w-full mr-3 accent-blue-500"
                />
                <span className="text-white font-medium w-8 text-center">{intervalSeconds}s</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-lg mb-6 sm:mb-8 flex justify-center">
          <QRCodeSVG value={currentUrl} size={200} />
        </div>
        
        <div className="flex justify-center mb-6 sm:mb-8">
          <Camera3d size={72} className="text-blue-400" />
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6">VR Camera Viewer</h1>
        
        <p className="text-gray-400 text-center mb-6 sm:mb-8 text-sm sm:text-base">
          Experience your surroundings in virtual reality. Place your phone in a cardboard VR headset after starting.
        </p>
        
        <div className="bg-gray-800/50 rounded-lg p-4 sm:p-5 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Before you start:</h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <Smartphone className="mr-3 text-blue-400 mt-1 flex-shrink-0" size={20} />
              <span className="text-sm sm:text-base">Ensure your device is in portrait orientation</span>
            </li>
            <li className="flex items-start">
              <Eye className="mr-3 text-blue-400 mt-1 flex-shrink-0" size={20} />
              <span className="text-sm sm:text-base">You'll need to grant camera and orientation permissions</span>
            </li>
            <li className="flex items-start">
              <Camera3d className="mr-3 text-blue-400 mt-1 flex-shrink-0" size={20} />
              <span className="text-sm sm:text-base">Have your cardboard VR headset ready</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;