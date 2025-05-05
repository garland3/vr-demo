import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Camera, CameraOff, RotateCw, Maximize, ZoomIn, Brain, Type } from 'lucide-react';
import { useCameraStream } from '../hooks/useCameraStream';
import { useDeviceOrientation } from '../hooks/useDeviceOrientation';
import { useImageAnalysis } from '../hooks/useImageAnalysis';

interface VRViewProps {
  onExit: () => void;
  aiQuery: string;
  aiIntervalSeconds: number;
}

const VRView: React.FC<VRViewProps> = ({ onExit, aiQuery, aiIntervalSeconds }) => {
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
    isAtMaxZoom,
    getZoomCapabilities 
  } = useCameraStream();
  const { orientation, hasPermission: hasOrientationPermission, requestPermission: requestOrientationPermission } = useDeviceOrientation();
  const [showControls, setShowControls] = useState(true);
  const [showZoomSlider, setShowZoomSlider] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [showFontSizeSlider, setShowFontSizeSlider] = useState(false);
  const [fontSize, setFontSize] = useState(12); // Default font size in pixels
  const leftVideoRef = useRef<HTMLVideoElement>(null);
  const rightVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastAnalysisTime, setLastAnalysisTime] = useState<number>(Date.now());
  const [nextAnalysisTime, setNextAnalysisTime] = useState<number>(Date.now() + aiIntervalSeconds * 1000);
  const [progress, setProgress] = useState<number>(0); // 0-100 progress until next analysis

  // Use the AI analysis hook
  const { 
    analysisResult, 
    isAnalyzing, 
    error: aiError, 
    startAnalysis, 
    stopAnalysis 
  } = useImageAnalysis(aiQuery, aiIntervalSeconds);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement !== null);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Start AI analysis when stream is available
  useEffect(() => {
    if (stream && leftVideoRef.current) {
      startAnalysis(leftVideoRef.current);
    }

    return () => {
      stopAnalysis();
    };
  }, [stream, startAnalysis, stopAnalysis]);

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

  // Add progress bar timer effect
  useEffect(() => {
    // Calculate and update progress every 50ms for smooth animation
    const progressTimer = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastAnalysisTime;
      const total = aiIntervalSeconds * 1000;
      const newProgress = Math.min(100, Math.max(0, (elapsed / total) * 100));
      setProgress(newProgress);
    }, 50);
    
    return () => clearInterval(progressTimer);
  }, [lastAnalysisTime, aiIntervalSeconds]);
  
  // Listen for analysis events
  useEffect(() => {
    const handleAnalysisStarted = (event: CustomEvent) => {
      setLastAnalysisTime(event.detail.time);
      setNextAnalysisTime(event.detail.time + aiIntervalSeconds * 1000);
    };
    
    const handleAnalysisCompleted = (event: CustomEvent) => {
      setLastAnalysisTime(event.detail.time);
      setNextAnalysisTime(event.detail.time + aiIntervalSeconds * 1000);
    };
    
    window.addEventListener('analysisStarted', handleAnalysisStarted as EventListener);
    window.addEventListener('analysisCompleted', handleAnalysisCompleted as EventListener);
    
    return () => {
      window.removeEventListener('analysisStarted', handleAnalysisStarted as EventListener);
      window.removeEventListener('analysisCompleted', handleAnalysisCompleted as EventListener);
    };
  }, [aiIntervalSeconds]);
  
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

  // No need for text color adaptation as we're using fixed colors now

  const handleScreenTap = () => {
    setShowControls(!showControls);
    setShowZoomSlider(false);
    setShowAiPanel(false);
    setShowFontSizeSlider(false);
  };

  const toggleZoomSlider = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowZoomSlider(!showZoomSlider);
    setShowAiPanel(false);
  };

  const toggleAiPanel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowAiPanel(!showAiPanel);
    setShowZoomSlider(false);
    setShowFontSizeSlider(false);
  };

  const toggleFontSizeSlider = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowFontSizeSlider(!showFontSizeSlider);
    setShowZoomSlider(false);
    setShowAiPanel(false);
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
              onClick={toggleAiPanel}
              className={`p-2 rounded-full ${isAnalyzing ? 'bg-blue-600/80' : 'bg-gray-800/80'} text-white relative`}
            >
              <Brain size={24} />
              {analysisResult && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" 
                      title="AI analysis available"></span>
              )}
            </button>
            <button 
              onClick={toggleFontSizeSlider}
              className="p-2 rounded-full bg-gray-800/80 text-white relative"
            >
              <Type size={24} />
            </button>
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
            <div className="flex flex-col items-center mt-2">
              <span className="text-xs text-gray-300">
                {hasNativeZoom ? 'Using native camera zoom' : 'Using digital zoom (native zoom not available on this device)'}
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

      {/* Font Size slider */}
      {showControls && showFontSizeSlider && (
        <div 
          className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-gray-800/80 p-4 rounded-lg"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex flex-col items-center">
            <div className="flex items-center mb-2">
              <Type size={16} className="mr-2 text-blue-400" />
              <span className="text-white text-sm">AI Text Size</span>
            </div>
            <input
              type="range"
              min="8"
              max="20"
              step="1"
              value={fontSize}
              onChange={e => setFontSize(parseInt(e.target.value))}
              className="w-48 accent-blue-500"
            />
            <div className="flex justify-between w-full mt-1">
              <span className="text-xs text-gray-300">Small</span>
              <span className="text-xs text-gray-300">{fontSize}px</span>
              <span className="text-xs text-gray-300">Large</span>
            </div>
          </div>
        </div>
      )}

      {/* AI analysis panel */}
      {showControls && showAiPanel && (
        <div 
          className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-gray-800/90 p-4 rounded-lg max-w-md w-full"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-medium flex items-center">
                <Brain size={18} className="mr-2 text-blue-400" />
                AI Analysis
              </h3>
              <div className="text-xs text-gray-400">
                Updates every {aiIntervalSeconds}s
              </div>
            </div>

            <div className="bg-black/50 rounded-md p-3 max-h-48 overflow-y-auto">
              {isAnalyzing && (
                <div className="flex items-center justify-center py-2">
                  <div className="animate-pulse text-blue-400">Analyzing...</div>
                </div>
              )}

              {!isAnalyzing && analysisResult && (
                <div className="text-sm text-white whitespace-pre-line">
                  {analysisResult}
                </div>
              )}

              {!isAnalyzing && !analysisResult && !aiError && (
                <div className="text-sm text-gray-400 italic">
                  Analysis will appear here...
                </div>
              )}

              {aiError && (
                <div className="text-sm text-red-400">
                  Error: {aiError}
                </div>
              )}
            </div>

            <div className="mt-2 text-xs text-gray-400">
              Query: "{aiQuery}"
            </div>
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

      {/* AI Analysis Results Overlay with Progress Bar - Shown on both eyes */}
      {analysisResult && (
        <>
          {/* Left eye HUD */}
          <div className="absolute top-4 left-4 bg-white/40 backdrop-blur-sm rounded-lg inline-block" style={{ maxWidth: '40%', left: 'calc(25% - 10rem)' }}>
            {/* Thin Progress Bar */}
            <div className="h-[2px] bg-gray-300/30 rounded-t-lg overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-100" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            <div className="p-2">
              <div className="flex items-start">
                <Brain size={14} className="mr-2 text-green-600 mt-1 flex-shrink-0" />
                <div 
                  className="whitespace-pre-wrap text-green-600 font-medium overflow-hidden break-words"
                  style={{ 
                    fontSize: `${fontSize}px`,
                    maxWidth: '100px',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word'
                  }}
                >
                  {analysisResult}
                </div>
              </div>
            </div>
          </div>

          {/* Right eye HUD */}
          <div className="absolute top-4 right-4 bg-white/40 backdrop-blur-sm rounded-lg inline-block" style={{ maxWidth: '40%', right: 'calc(25% - 10rem)' }}>
            {/* Thin Progress Bar */}
            <div className="h-[2px] bg-gray-300/30 rounded-t-lg overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-100" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            <div className="p-2">
              <div className="flex items-start">
                <Brain size={14} className="mr-2 text-green-600 mt-1 flex-shrink-0" />
                <div 
                  className="whitespace-pre-wrap text-green-600 font-medium overflow-hidden break-words"
                  style={{ 
                    fontSize: `${fontSize}px`,
                    maxWidth: '100px',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word'
                  }}
                >
                  {analysisResult}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Center separation line */}
      <div className="absolute top-0 left-1/2 w-px h-full bg-gray-800/30 transform -translate-x-1/2"></div>
    </div>
  );
};

export default VRView;