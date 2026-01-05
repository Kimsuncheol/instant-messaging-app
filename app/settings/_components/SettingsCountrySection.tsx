"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Public as CountryIcon } from "@mui/icons-material";

interface SettingsCountrySectionProps {
  textPrimary: string;
  textSecondary: string;
  sectionTitle: string;
}

interface LocationData {
  country: string;
  countryCode: string;
  languageCode: string;
  languageName: string;
}

export const SettingsCountrySection: React.FC<SettingsCountrySectionProps> = ({
  textPrimary,
  textSecondary,
  sectionTitle,
}) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const res = await fetch("/api/get-location");
        if (!res.ok) throw new Error("Failed to detect location");
        const data = await res.json();
        setLocation(data);
      } catch (err) {
        console.error("Error fetching location:", err);
        setError("Unable to detect location");
      } finally {
        setLoading(false);
      }
    };
    fetchLocation();
  }, []);

  return (
    <Box sx={{ px: 3, py: 3 }}>
      <Typography
        variant="overline"
        sx={{ color: textSecondary, fontWeight: 600, fontSize: "0.75rem", mb: 1.5 }}
      >
        {sectionTitle}
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
        <CountryIcon sx={{ color: "#00A884", mr: 2 }} />
        <Box>
          {loading ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={16} sx={{ color: "#00A884" }} />
              <Typography sx={{ color: textSecondary, fontSize: "0.875rem" }}>
                Detecting location...
              </Typography>
            </Box>
          ) : error ? (
            <Typography sx={{ color: "#F15C6D", fontSize: "0.875rem" }}>
              {error}
            </Typography>
          ) : (
            <>
              <Typography sx={{ color: textPrimary, fontSize: "1rem", fontWeight: 500 }}>
                {location?.country || "Unknown"}
              </Typography>
              <Typography sx={{ color: textSecondary, fontSize: "0.75rem" }}>
                Detected via IP • {location?.countryCode}
              </Typography>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};
