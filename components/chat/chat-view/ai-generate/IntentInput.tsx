"use client";

import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, TextField } from "@mui/material";

interface IntentInputProps {
  intent: string;
  setIntent: (value: string) => void;
  onGenerate?: () => void;
}

// Example prompts list
const EXAMPLE_PROMPTS = [
  "Write a professional email to schedule a meeting",
  "Create a summary of today's discussion points",
  "Generate a creative story about space exploration",
  "Draft a birthday message for a colleague",
  "Compose a thank you note for a gift",
  "Write a product description for a smartwatch",
  "Create a motivational quote for Monday morning",
  "Draft a project status update for the team",
];

export const IntentInput: React.FC<IntentInputProps> = ({
  intent,
  setIntent,
  onGenerate,
}) => {
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const textFieldRef = useRef<HTMLDivElement>(null);

  // Show carousel only when input is empty
  const showCarousel = !intent.trim();
  const timeInterval = 5000;

  useEffect(() => {
    if (!showCarousel) return;

    const interval = setInterval(() => {
      setIsAnimating(true);

      // After animation completes, update the index
      setTimeout(() => {
        setCurrentPromptIndex((prev) => (prev + 1) % EXAMPLE_PROMPTS.length);
        setIsAnimating(false);
      }, 500); // Match the animation duration
    }, timeInterval);

    return () => clearInterval(interval);
  }, [showCarousel]);

  // Handle Tab key press to fill in the current prompt
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab" && showCarousel && textFieldRef.current) {
        e.preventDefault();
        setIntent(EXAMPLE_PROMPTS[currentPromptIndex]);
      }
    };

    const textField = textFieldRef.current;
    if (textField) {
      textField.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      if (textField) {
        textField.removeEventListener("keydown", handleKeyDown);
      }
    };
  }, [showCarousel, currentPromptIndex, setIntent]);

  return (
    <Box sx={{ mb: 3 }}>
      <Typography sx={{ color: "#8696A0", mb: 1.5, fontSize: "0.875rem" }}>
        Describe what kind of content you want to generate:
      </Typography>

      <Box sx={{ position: "relative" }}>
        <TextField
          ref={textFieldRef}
          fullWidth
          multiline
          rows={3}
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey &&
              intent.trim() &&
              onGenerate
            ) {
              e.preventDefault();
              onGenerate();
            }
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              bgcolor: "#2A3942",
              color: "#E9EDEF",
              "& fieldset": { borderColor: "#3B4A54" },
              "&:hover fieldset": { borderColor: "#00A884" },
              "&.Mui-focused fieldset": { borderColor: "#00A884" },
            },
          }}
        />

        {/* Carousel overlay - only shown when input is empty */}
        {showCarousel && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: "none",
              overflow: "hidden",
              padding: "14px",
              display: "flex",
              alignItems: "flex-start",
            }}
          >
            <Typography
              sx={{
                color: "#8696A080",
                fontSize: "1rem",
                lineHeight: "1.5",
                animation: isAnimating
                  ? "slideOut 0.3s ease-out forwards"
                  : "slideIn 0.3s ease-out forwards",
                "@keyframes slideOut": {
                  "0%": {
                    transform: "translateY(0)",
                    opacity: 1,
                  },
                  "100%": {
                    transform: "translateY(-20px)",
                    opacity: 0,
                  },
                },
                "@keyframes slideIn": {
                  "0%": {
                    transform: "translateY(20px)",
                    opacity: 0,
                  },
                  "100%": {
                    transform: "translateY(0)",
                    opacity: 1,
                  },
                },
              }}
            >
              {EXAMPLE_PROMPTS[currentPromptIndex]}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Hint text */}
      {showCarousel && (
        <Typography
          sx={{
            color: "#8696A060",
            fontSize: "0.75rem",
            mt: 0.5,
            fontStyle: "italic",
          }}
        >
          Press Tab to use the suggested prompt
        </Typography>
      )}
    </Box>
  );
};
