import { useState, useEffect } from 'react';

export const useCameraStream = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [capabilities, setCapabilities] = useState<MediaTrackCapabilities | null>(null);

  const updateCameraZoom = async (value: number) => {
    if (!stream || !capabilities?.zoom) return;
    
    try {
      const track = stream.getVideoTracks()[0];
      if (track && capabilities.zoom) {
        const min = capabilities.zoom.min || 1;
        const max = capabilities.zoom.max || 1;
        const zoomValue = min + (value - 0.5) * (max - min) / 2.5;
        await track.applyConstraints({
          advanced: [{ zoom: zoomValue }]
        });
      }
    } catch (err) {
      console.error('Failed to adjust camera zoom:', err);
      // Fallback to digital zoom if camera zoom fails
      setZoom(value);
    }
  };

  const rotateCamera = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const updateZoom = (value: number) => {
    updateCameraZoom(value);
    // Keep digital zoom as fallback
    setZoom(value);
  };

  const requestPermission = async () => {
    try {
      setError(null);
      
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' }, // Use back camera when available
          width: { ideal: window.innerWidth },
          height: { ideal: window.innerHeight }
        }
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setHasPermission(true);
      
      // Get camera capabilities
      const track = mediaStream.getVideoTracks()[0];
      if (track) {
        const caps = track.getCapabilities();
        setCapabilities(caps);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Camera access denied. Please grant permission.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera found on this device.');
        } else {
          setError(`Camera error: ${err.message}`);
        }
      } else {
        setError('Unknown camera error occurred.');
      }
    }
  };

  useEffect(() => {
    // Automatically request camera access when component mounts
    requestPermission();
    
    // Cleanup: stop all tracks when unmounted
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return { 
    stream, 
    error, 
    hasPermission, 
    requestPermission, 
    rotation, 
    rotateCamera, 
    zoom, 
    updateZoom,
    hasNativeZoom: Boolean(capabilities?.zoom)
  };
};