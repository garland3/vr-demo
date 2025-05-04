
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ZoomIn, RotateCw, CameraOff } from 'lucide-react';
import { useCameraStream } from '../hooks/useCameraStream';

interface CameraPreviewProps {
  onBack: () => void;
  onEnterVR: () => void;
}

const CameraPreview: React.FC<CameraPreviewProps> = ({ onBack, onEnterVR }) => {
  const { 
    stream, 
    error, 
    hasPermission, 
    requestPermission, 
    rotation, 
    rotateCamera, 
    zoom, 
    updateZoom, 
    hasNativeZoom,
    getZoomCapabilities 
  } = useCameraStream();
  const [showZoomSlider, setShowZoomSlider] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Apply stream to video element when available
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      
      // Apply manual rotation and zoom if needed
      videoRef.current.style.transform = `rotate(${rotation}deg) ${!hasNativeZoom ? `scale(${zoom})` : ''}`;
    }
  }, [stream, rotation, zoom, hasNativeZoom]);

  const toggleZoomSlider = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowZoomSlider(!showZoomSlider);
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Camera preview */}
      <div className="flex-1 relative overflow-hidden">
        {hasPermission ? (
          <video 
            ref={videoRef}
            autoPlay 
            playsInline 
            muted 
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <button 
              onClick={requestPermission}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
            >
              Grant Camera Access
            </button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-900 p-4">
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={onBack}
            className="p-2 rounded-full bg-gray-800 text-white"
          >
            <ArrowLeft size={24} />
          </button>
          
          <div className="flex gap-3">
            <button 
              onClick={toggleZoomSlider}
              className="p-2 rounded-full bg-gray-800 text-white relative"
            >
              <ZoomIn size={24} />
              {hasNativeZoom && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" 
                      title="Native zoom available"></span>
              )}
            </button>
            <button 
              onClick={rotateCamera}
              className="p-2 rounded-full bg-gray-800 text-white"
            >
              <RotateCw size={24} />
            </button>
          </div>
        </div>
        
        {/* Zoom slider */}
        {showZoomSlider && (
          <div className="bg-gray-800 p-3 rounded-lg mb-4">
            <div className="flex flex-col">
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={zoom}
                onChange={e => updateZoom(parseFloat(e.target.value))}
                className="w-full accent-blue-500 mb-2"
              />
              <div className="flex flex-col">
                <span className="text-xs text-gray-300">
                  {hasNativeZoom ? 'Using native camera zoom' : 'Using digital zoom'}
                </span>
                {hasNativeZoom && getZoomCapabilities() && (
                  <span className="text-xs text-gray-400 mt-1">
                    Camera zoom: {getZoomCapabilities()?.min.toFixed(1)} - {getZoomCapabilities()?.max.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
        
        <button 
          onClick={onEnterVR}
          disabled={!hasPermission}
          className={`w-full py-3 rounded-lg font-semibold ${
            hasPermission 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-700 text-gray-400'
          }`}
        >
          Enter VR Mode
        </button>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-900/80 p-4 rounded-lg max-w-xs text-center">
          <CameraOff size={32} className="mx-auto mb-2" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default CameraPreview;
