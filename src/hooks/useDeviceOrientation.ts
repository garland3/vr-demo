
import { useState, useEffect } from 'react';

// Define the device orientation interface
export interface DeviceOrientation {
  alpha: number | null; // Z-axis rotation [0, 360)
  beta: number | null;  // X-axis rotation [-180, 180)
  gamma: number | null; // Y-axis rotation [-90, 90)
}

export const useDeviceOrientation = () => {
  const [orientation, setOrientation] = useState<DeviceOrientation | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    // Check if DeviceOrientationEvent is supported
    if (!window.DeviceOrientationEvent) {
      setIsSupported(false);
      return;
    }

    // Request permission for iOS 13+
    const requestPermission = async () => {
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
          const permissionState = await DeviceOrientationEvent.requestPermission();
          setHasPermission(permissionState === 'granted');
        } catch (error) {
          console.error('Error requesting device orientation permission:', error);
          setHasPermission(false);
        }
      } else {
        // Permission not required (non-iOS or older iOS)
        setHasPermission(true);
      }
    };

    const handleOrientation = (event: DeviceOrientationEvent) => {
      setOrientation({
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma
      });
    };

    // Set up the listener if we have permission
    if (hasPermission) {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    // Request permission on mount
    requestPermission();

    // Clean up listener
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [hasPermission]);

  const requestAccess = async () => {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const permissionState = await DeviceOrientationEvent.requestPermission();
        setHasPermission(permissionState === 'granted');
        return permissionState === 'granted';
      } catch (error) {
        console.error('Error requesting device orientation permission:', error);
        return false;
      }
    } else {
      // Permission not required (non-iOS or older iOS)
      setHasPermission(true);
      return true;
    }
  };

  return {
    orientation,
    hasPermission,
    isSupported,
    requestAccess
  };
};
