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
import { useState, useEffect } from 'react';

interface DeviceOrientation {
  alpha: number | null; // Z-axis rotation (0-360)
  beta: number | null;  // X-axis rotation (-180-180)
  gamma: number | null; // Y-axis rotation (-90-90)
}

export const useDeviceOrientation = () => {
  const [orientation, setOrientation] = useState<DeviceOrientation | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  const handleOrientationEvent = (event: DeviceOrientationEvent) => {
    setOrientation({
      alpha: event.alpha,
      beta: event.beta,
      gamma: event.gamma
    });
  };

  const requestPermission = async () => {
    try {
      // Check if the browser supports the DeviceOrientationEvent
      if (typeof DeviceOrientationEvent !== 'undefined' && 
          typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        // For iOS 13+ devices
        const permissionState = await (DeviceOrientationEvent as any).requestPermission();
        
        if (permissionState === 'granted') {
          window.addEventListener('deviceorientation', handleOrientationEvent);
          setHasPermission(true);
        } else {
          console.error('Device orientation permission denied');
        }
      } else {
        // For non-iOS devices or older iOS, just try to add the listener
        window.addEventListener('deviceorientation', handleOrientationEvent);
        setHasPermission(true);
      }
    } catch (error) {
      console.error('Error requesting device orientation permission:', error);
    }
  };

  useEffect(() => {
    // Check if the browser supports the DeviceOrientationEvent
    if (typeof DeviceOrientationEvent !== 'undefined') {
      // Try to add event listener without permission request for non-iOS devices
      if (typeof (DeviceOrientationEvent as any).requestPermission !== 'function') {
        window.addEventListener('deviceorientation', handleOrientationEvent);
        setHasPermission(true);
      }
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientationEvent);
    };
  }, []);

  return { orientation, hasPermission, requestPermission };
};
