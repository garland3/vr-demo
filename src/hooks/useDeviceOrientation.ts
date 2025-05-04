import { useState, useEffect } from 'react';

interface DeviceOrientation {
  alpha: number | null; // rotation around z-axis
  beta: number | null;  // rotation around x-axis
  gamma: number | null; // rotation around y-axis
}

export const useDeviceOrientation = () => {
  const [orientation, setOrientation] = useState<DeviceOrientation>({
    alpha: null,
    beta: null,
    gamma: null
  });
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOrientationChange = (event: DeviceOrientationEvent) => {
    setOrientation({
      alpha: event.alpha,
      beta: event.beta,
      gamma: event.gamma
    });
  };

  const requestPermission = async () => {
    try {
      setError(null);
      
      // For iOS 13+ which requires permission
      if (typeof DeviceOrientationEvent !== 'undefined' && 
          typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        const permissionState = await (DeviceOrientationEvent as any).requestPermission();
        if (permissionState === 'granted') {
          setHasPermission(true);
          window.addEventListener('deviceorientation', handleOrientationChange);
        } else {
          setError('Device orientation permission denied.');
        }
      } else {
        // For other browsers that don't require permission
        setHasPermission(true);
        window.addEventListener('deviceorientation', handleOrientationChange);
      }
    } catch (err) {
      console.error('Error requesting device orientation permission:', err);
      setError('Could not access device orientation.');
    }
  };

  useEffect(() => {
    // Automatically request orientation permission
    requestPermission();
    
    return () => {
      window.removeEventListener('deviceorientation', handleOrientationChange);
    };
  }, []);

  return { orientation, hasPermission, error, requestPermission };
};