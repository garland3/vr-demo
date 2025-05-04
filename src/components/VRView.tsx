import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Camera, CameraOff, RotateCw, Maximize, ZoomIn } from 'lucide-react';
import { useCameraStream } from '../hooks/useCameraStream';
import { useDeviceOrientation } from '../hooks/useDeviceOrientation';

interface VRViewProps {
  onExit: () => void;
}

const VRView: React.FC<VRViewProps> = ({ onExit }) => {
  const { stream, error, hasPermission, requestPermission, rotation, rotateCamera, zoom, updateZoom, hasNativeZoom } = useCameraStream();
  const { orientation, hasPermission: hasOrientationPermission, requestPermission: requestOrientationPermission } = useDeviceOrientation();
  const [showControls, setShowControls] = useState(true);
  const [showZoomSlider, setShowZoomSlider] = useState(false);
  const leftVideoRef = useRef<HTMLVideoElement>(null);
  const rightVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement !== null);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const requestFullscreen = async () => {
    try {
      if (containerRef.current) {
        await containerRef.current.requestFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen request failed:', err);
    }
  };

  useEffect(() => {
    // Apply stream to video elements when available
    if (stream && leftVideoRef.current && rightVideoRef.current) {
      leftVideoRef.current.srcObject = stream;
      rightVideoRef.current.srcObject = stream;
      
      [leftVideoRef.current, rightVideoRef.current].forEach(video => {
        if (video) {
          // Apply manual rotation
          video.style.transform = `rotate(${rotation}deg) ${!hasNativeZoom ? `scale(${zoom})` : ''}`;
        }
      });
    }
  }, [stream, rotation, zoom, hasNativeZoom]);

  // Apply device orientation effect to the view
  useEffect(() => {
    if (orientation && hasOrientationPermission) {
      const rotationY = orientation.gamma / 10;
      const rotationX = orientation.beta / 10;
      
      const applyRotation = (element: HTMLVideoElement | null) => {
        if (!element) return;
        element.style.transform = `rotate(${rotation}deg) rotateY(${rotationY}deg) rotateX(${rotationX}deg) ${!hasNativeZoom ? `scale(${zoom})` : ''}`;
      };
      
      applyRotation(leftVideoRef.current);
      applyRotation(rightVideoRef.current);
    }
  }, [orientation, hasOrientationPermission, rotation, zoom, hasNativeZoom]);

  const handleScreenTap = () => {
    setShowControls(!showControls);
    setShowZoomSlider(false);
  };

  const toggleZoomSlider = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowZoomSlider(!showZoomSlider);
  };

  return (
    <div ref={containerRef} className="fixed inset-0 bg-black" onClick={handleScreenTap}>
      {/* Split screen for VR */}
      <div className="flex h-full">
        {/* Left eye */}
        <div className="w-1/2 h-full overflow-hidden border-r border-gray-800">
          <video 
            ref={leftVideoRef}
            autoPlay 
            playsInline 
            muted 
            className="object-cover w-full h-full"
          />
        </div>
        
        {/* Right eye */}
        <div className="w-1/2 h-full overflow-hidden">
          <video 
            ref={rightVideoRef}
            autoPlay 
            playsInline 
            muted 
            className="object-cover w-full h-full"
          />
        </div>
      </div>

      {/* Overlay controls */}
      {showControls && (
        <div className="fixed top-0 left-0 w-full p-4 flex justify-between items-center bg-gradient-to-b from-black/70 to-transparent">
          <button 
            onClick={(e) => { e.stopPropagation(); onExit(); }}
            className="p-2 rounded-full bg-gray-800/80 text-white"
          >
            <ArrowLeft size={24} />
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={toggleZoomSlider}
              className="p-2 rounded-full bg-gray-800/80 text-white relative"
            >
              <ZoomIn size={24} />
              {hasNativeZoom && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" 
                      title="Native zoom available"></span>
              )}
            </button>
            {!isFullscreen && (
              <button 
                onClick={(e) => { e.stopPropagation(); requestFullscreen(); }}
                className="p-2 rounded-full bg-gray-800/80 text-white"
              >
                <Maximize size={24} />
              </button>
            )}
            <button 
              onClick={(e) => { e.stopPropagation(); rotateCamera(); }}
              className="p-2 rounded-full bg-gray-800/80 text-white"
            >
              <RotateCw size={24} />
            </button>
            {!hasPermission && (
              <button 
                onClick={(e) => { e.stopPropagation(); requestPermission(); }}
                className="p-2 rounded-full bg-gray-800/80 text-white"
              >
                <Camera size={24} />
              </button>
            )}
            
            {!hasOrientationPermission && (
              <button 
                onClick={(e) => { e.stopPropagation(); requestOrientationPermission(); }}
                className="p-2 rounded-full bg-gray-800/80 text-white"
              >
                <span className="transform rotate-90 inline-block">⟳</span>
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Zoom slider */}
      {showControls && showZoomSlider && (
        <div 
          className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-gray-800/80 p-4 rounded-lg"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex flex-col items-center">
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={zoom}
              onChange={e => updateZoom(parseFloat(e.target.value))}
              className="w-48 accent-blue-500"
            />
            <span className="text-xs mt-2 text-gray-300">
              {hasNativeZoom ? 'Using native camera zoom' : 'Using digital zoom'}
            </span>
          </div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-900/80 p-4 rounded-lg max-w-xs text-center">
          <CameraOff size={32} className="mx-auto mb-2" />
          <p>{error}</p>
        </div>
      )}
      
      {/* Center separation line */}
      <div className="absolute top-0 left-1/2 w-px h-full bg-gray-800/30 transform -translate-x-1/2"></div>
    </div>
  );
};

export default VRView;