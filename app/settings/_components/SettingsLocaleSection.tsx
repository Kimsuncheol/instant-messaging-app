"use client";

import React from "react";
import { 
  Box, 
  Typography, 
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { CalendarMonth as CalendarIcon } from "@mui/icons-material";
import { useDateFormat } from "@/context/DateFormatContext";

interface SettingsLocaleSectionProps {
  textPrimary: string;
  textSecondary: string;
  sectionTitle: string;
}

export const SettingsLocaleSection: React.FC<SettingsLocaleSectionProps> = ({
  textPrimary,
  textSecondary,
  sectionTitle,
}) => {
  const { dateFormat, timeFormat, setDateFormat, setTimeFormat } = useDateFormat();

  return (
    <Box sx={{ px: 3, py: 2 }}>
      <Typography 
        variant="overline" 
        sx={{ color: "#00A884", fontWeight: 600, fontSize: "0.75rem", mb: 1.5 }}
      >
        {sectionTitle}
      </Typography>
      
      {/* Date Format Selector */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel sx={{ color: textSecondary }}>Date Format</InputLabel>
        <Select
          value={dateFormat}
          onChange={(e) => setDateFormat(e.target.value as any)}
          label="Date Format"
          startAdornment={
            <CalendarIcon sx={{ color: textSecondary, mr: 1 }} />
          }
          sx={{
            bgcolor: textPrimary === "#E9EDEF" ? "#2A3942" : "#F0F2F5",
            color: textPrimary,
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: textSecondary,
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#00A884",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#00A884",
            },
            "& .MuiSvgIcon-root": {
              color: textSecondary,
            },
          }}
        >
          <MenuItem value="MM/DD/YYYY">
            <Typography sx={{ color: textPrimary }}>MM/DD/YYYY</Typography>
          </MenuItem>
          <MenuItem value="DD/MM/YYYY">
            <Typography sx={{ color: textPrimary }}>DD/MM/YYYY</Typography>
          </MenuItem>
          <MenuItem value="YYYY-MM-DD">
            <Typography sx={{ color: textPrimary }}>YYYY-MM-DD</Typography>
          </MenuItem>
        </Select>
      </FormControl>

      {/* Time Format Selector */}
      <FormControl fullWidth>
        <InputLabel sx={{ color: textSecondary }}>Time Format</InputLabel>
        <Select
          value={timeFormat}
          onChange={(e) => setTimeFormat(e.target.value as any)}
          label="Time Format"
          sx={{
            bgcolor: textPrimary === "#E9EDEF" ? "#2A3942" : "#F0F2F5",
            color: textPrimary,
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: textSecondary,
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#00A884",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#00A884",
            },
            "& .MuiSvgIcon-root": {
              color: textSecondary,
            },
          }}
        >
          <MenuItem value="12h">
            <Typography sx={{ color: textPrimary }}>12-hour (3:45 PM)</Typography>
          </MenuItem>
          <MenuItem value="24h">
            <Typography sx={{ color: textPrimary }}>24-hour (15:45)</Typography>
          </MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};
