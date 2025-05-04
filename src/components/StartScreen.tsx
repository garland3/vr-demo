import React, { useRef, useEffect } from 'react';
import { Camera as Camera3d, Smartphone, Eye } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface StartScreenProps {
  onStartVR: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStartVR }) => {
  const currentUrl = window.location.href;
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Ensure button is visible on mount
    buttonRef.current?.scrollIntoView({ behavior: 'auto', block: 'start' });
  }, []);

  return (
    <div className="flex flex-col items-center w-full min-h-screen p-4 sm:p-6 bg-gradient-to-b from-gray-900 to-black overflow-y-auto">
      <div className="max-w-md w-full">
        <button 
          ref={buttonRef}
          onClick={onStartVR}
          className="w-full py-4 px-6 mb-6 sm:mb-8 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-colors duration-200 flex items-center justify-center sticky top-0 z-10"
        >
          <span>Enter VR Mode</span>
        </button>
        
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