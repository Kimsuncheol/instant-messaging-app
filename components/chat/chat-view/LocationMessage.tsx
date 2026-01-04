"use client";

import React from "react";
import { Box, Typography, Link as MuiLink } from "@mui/material";
import { LocationOn as LocationIcon } from "@mui/icons-material";
import { LocationData } from "@/lib/chatService";

interface LocationMessageProps {
  location: LocationData;
  isOwnMessage: boolean;
}

export const LocationMessage: React.FC<LocationMessageProps> = ({ location, isOwnMessage }) => {
  const { latitude, longitude, address } = location;
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  
  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=15&size=600x300&maptype=roadmap&markers=color:red%7C${latitude},${longitude}&key=${apiKey}`;
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  return (
    <Box sx={{ width: "100%", maxWidth: 300, overflow: "hidden", borderRadius: 2 }}>
      <MuiLink href={mapsLink} target="_blank" rel="noopener noreferrer" underline="none">
        <Box 
          sx={{ 
            width: "100%", 
            height: 150, 
            bgcolor: "#e0e0e0", 
            backgroundImage: `url(${mapUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {!apiKey && (
            <Typography variant="caption" color="text.secondary">
              Map Preview (API Key Required)
            </Typography>
          )}
        </Box>
        <Box 
          sx={{ 
            p: 1.5, 
            bgcolor: isOwnMessage ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            gap: 1
          }}
        >
          <LocationIcon sx={{ color: isOwnMessage ? "inherit" : "#00A884" }} />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: isOwnMessage ? "inherit" : "text.primary" }}>
              current location
            </Typography>
            {address && (
              <Typography variant="caption" sx={{ color: isOwnMessage ? "inherit" : "text.secondary", display: "block" }}>
                {address}
              </Typography>
            )}
            <Typography variant="caption" sx={{ color: isOwnMessage ? "inherit" : "text.secondary", fontSize: '0.7rem' }}>
              {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </Typography>
          </Box>
        </Box>
      </MuiLink>
    </Box>
  );
};
