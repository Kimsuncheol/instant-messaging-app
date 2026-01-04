import { useState, useCallback } from 'react';
import { LocationData } from '@/lib/chatService';

interface UseGpsStatusReturn {
  checkGpsStatus: (onSuccess: (location: LocationData) => void) => void;
  isGpsOff: boolean;
  permissionDenied: boolean;
  resetGpsStatus: () => void;
  isLoading: boolean;
}

export const useGpsStatus = (): UseGpsStatusReturn => {
  const [isGpsOff, setIsGpsOff] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const resetGpsStatus = useCallback(() => {
    setIsGpsOff(false);
    setPermissionDenied(false);
    setIsLoading(false);
  }, []);

  const checkGpsStatus = useCallback((onSuccess: (location: LocationData) => void) => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLoading(true);
    // Reset previous errors before new check
    setIsGpsOff(false);
    setPermissionDenied(false);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLoading(false);
        const location: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        onSuccess(location);
      },
      (error) => {
        setIsLoading(false);
        console.error("Geolocation error:", error);
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setPermissionDenied(true);
            break;
          case error.POSITION_UNAVAILABLE:
            setIsGpsOff(true);
            break;
          case error.TIMEOUT:
            // For timeout, we might also consider it as "position unavailable" or just retry
             setIsGpsOff(true); 
            break;
          default:
            setIsGpsOff(true);
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, []);

  return {
    checkGpsStatus,
    isGpsOff,
    permissionDenied,
    resetGpsStatus,
    isLoading
  };
};
