import { useState, useEffect } from 'react';

// Define the orientation type
export interface DeviceOrientation {
  alpha: number | null; // rotation around z-axis
  beta: number | null;  // rotation around x-axis
  gamma: number | null; // rotation around y-axis
}

export const useDeviceOrientation = () => {
  const [orientation, setOrientation] = useState<DeviceOrientation | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestPermission = async () => {
    try {
      // Check if DeviceOrientationEvent is available
      if (typeof DeviceOrientationEvent !== 'undefined' && 
          typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        // iOS 13+ requires permission
        const permissionState = await (DeviceOrientationEvent as any).requestPermission();
        setHasPermission(permissionState === 'granted');
        return permissionState === 'granted';
      } else {
        // No permission needed for other browsers
        setHasPermission(true);
        return true;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error requesting permission');
      setHasPermission(false);
      return false;
    }
  };

  const handleOrientation = (event: DeviceOrientationEvent) => {
    setOrientation({
      alpha: event.alpha,
      beta: event.beta,
      gamma: event.gamma
    });
  };

  useEffect(() => {
    if (hasPermission) {
      window.addEventListener('deviceorientation', handleOrientation);
      return () => {
        window.removeEventListener('deviceorientation', handleOrientation);
      };
    }
  }, [hasPermission]);

  return {
    orientation,
    hasPermission,
    requestPermission,
    error
  };
};