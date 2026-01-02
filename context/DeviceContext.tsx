"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  isMobile,
  isTablet,
  isDesktop,
  isBrowser,
  browserName,
  osName,
  deviceType,
} from "react-device-detect";

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isBrowser: boolean;
  browserName: string;
  osName: string;
  deviceType: string;
}

interface DeviceContextType {
  deviceInfo: DeviceInfo;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export const useDevice = () => {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error("useDevice must be used within DeviceProvider");
  }
  return context;
};

interface DeviceProviderProps {
  children: ReactNode;
}

export const DeviceProvider: React.FC<DeviceProviderProps> = ({ children }) => {
  const [deviceInfo] = useState<DeviceInfo>({
    isMobile,
    isTablet,
    isDesktop,
    isBrowser,
    browserName,
    osName,
    deviceType,
  });

  return (
    <DeviceContext.Provider value={{ deviceInfo }}>
      {children}
    </DeviceContext.Provider>
  );
};
