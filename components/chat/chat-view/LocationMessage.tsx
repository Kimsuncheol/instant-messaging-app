"use client";

import React from "react";
import { Box, Typography, IconButton, Link } from "@mui/material";
import { OpenInNew as OpenInNewIcon } from "@mui/icons-material";
import { LocationData } from "@/lib/chatService";

interface LocationMessageProps {
  location: LocationData;
}

export const LocationMessage: React.FC<LocationMessageProps> = ({ location }) => {
  const { latitude, longitude, address } = location;

  const getStaticMapUrl = () => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (apiKey) {
      return `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=15&size=280x150&markers=color:red%7C${latitude},${longitude}&key=${apiKey}`;
    }
    // Fallback to OpenStreetMap if no API key
    return `https://staticmap.openstreetmap.de/staticmap.php?center=${latitude},${longitude}&zoom=15&size=280x150&markers=${latitude},${longitude},red`;
  };

  const getMapsUrl = () => {
    return `https://www.google.com/maps?q=${latitude},${longitude}`;
  };

  return (
    <Box
      sx={{
        width: 280,
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: "#1F2C34",
      }}
    >
      {/* Map Preview */}
      <Box sx={{ position: "relative" }}>
        <Box
          component="img"
          src={getStaticMapUrl()}
          alt="Location"
          sx={{
            width: "100%",
            height: 150,
            objectFit: "cover",
            display: "block",
          }}
        />
        <IconButton
          component={Link}
          href={getMapsUrl()}
          target="_blank"
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            bgcolor: "rgba(0,0,0,0.5)",
            color: "white",
            "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
          }}
          size="small"
        >
          <OpenInNewIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Location Info */}
      <Box sx={{ p: 1.5 }}>
        <Typography
          variant="body2"
          sx={{ color: "#E9EDEF", fontWeight: 500, mb: 0.5 }}
        >
          📍 Shared Location
        </Typography>
        {address && (
          <Typography variant="caption" sx={{ color: "#8696A0", display: "block" }}>
            {address}
          </Typography>
        )}
        <Typography variant="caption" sx={{ color: "#667781" }}>
          {latitude.toFixed(5)}, {longitude.toFixed(5)}
        </Typography>
      </Box>
    </Box>
  );
};
