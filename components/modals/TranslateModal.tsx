"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  Typography,
  Box,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Translate as TranslateIcon } from "@mui/icons-material";
import { translateText, SUPPORTED_LANGUAGES, getLanguageName } from "@/lib/translateService";

interface TranslateModalProps {
  open: boolean;
  onClose: () => void;
  originalText: string;
  onTranslate: (translatedText: string) => void;
}

export const TranslateModal: React.FC<TranslateModalProps> = ({
  open,
  onClose,
  originalText,
  onTranslate,
}) => {
  const [targetLanguage, setTargetLanguage] = useState("ko");
  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [detectedLanguage, setDetectedLanguage] = useState("");

  const handleTranslate = async () => {
    if (!originalText.trim()) {
      setError("Please enter text to translate");
      return;
    }

    setLoading(true);
    setError("");
    setTranslatedText("");

    try {
      const result = await translateText(originalText, targetLanguage);
      setTranslatedText(result.translatedText);
      if (result.detectedSourceLanguage) {
        setDetectedLanguage(result.detectedSourceLanguage);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Translation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUseTranslation = () => {
    if (translatedText) {
      onTranslate(translatedText);
      handleClose();
    }
  };

  const handleClose = () => {
    setTranslatedText("");
    setError("");
    setDetectedLanguage("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "#111B21",
          color: "#E9EDEF",
        },
      }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <TranslateIcon sx={{ color: "#00A884" }} />
        <Typography variant="h6">Translate Message</Typography>
      </DialogTitle>

      <DialogContent>
        {/* Original Text */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="caption" sx={{ color: "#8696A0", mb: 1, display: "block" }}>
            Original Text
            {detectedLanguage && (
              <span style={{ marginLeft: 8 }}>
                ({getLanguageName(detectedLanguage)})
              </span>
            )}
          </Typography>
          <Box
            sx={{
              bgcolor: "#2A3942",
              borderRadius: "8px",
              p: 2,
              maxHeight: "120px",
              overflowY: "auto",
            }}
          >
            <Typography sx={{ color: "#E9EDEF", whiteSpace: "pre-wrap" }}>
              {originalText}
            </Typography>
          </Box>
        </Box>

        {/* Target Language Selector */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel sx={{ color: "#8696A0" }}>Translate to</InputLabel>
          <Select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            label="Translate to"
            sx={{
              bgcolor: "#2A3942",
              color: "#E9EDEF",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#8696A0",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#00A884",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#00A884",
              },
              "& .MuiSvgIcon-root": {
                color: "#8696A0",
              },
            }}
            MenuProps={{
              PaperProps: {
                sx: { bgcolor: "#233138", color: "#E9EDEF" },
              },
            }}
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <MenuItem key={lang.value} value={lang.value}>
                {lang.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Translate Button */}
        <Button
          fullWidth
          variant="contained"
          onClick={handleTranslate}
          disabled={loading || !originalText.trim()}
          sx={{
            bgcolor: "#00A884",
            color: "#111B21",
            mb: 2,
            "&:hover": { bgcolor: "#06CF9C" },
            "&:disabled": { bgcolor: "#2A3942", color: "#8696A0" },
          }}
        >
          {loading ? <CircularProgress size={24} /> : "Translate"}
        </Button>

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Translated Text */}
        {translatedText && (
          <Box>
            <Typography variant="caption" sx={{ color: "#8696A0", mb: 1, display: "block" }}>
              Translation ({getLanguageName(targetLanguage)})
            </Typography>
            <Box
              sx={{
                bgcolor: "#2A3942",
                borderRadius: "8px",
                p: 2,
                maxHeight: "120px",
                overflowY: "auto",
              }}
            >
              <Typography sx={{ color: "#E9EDEF", whiteSpace: "pre-wrap" }}>
                {translatedText}
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} sx={{ color: "#8696A0" }}>
          Cancel
        </Button>
        <Button
          onClick={handleUseTranslation}
          variant="contained"
          disabled={!translatedText}
          sx={{
            bgcolor: "#00A884",
            color: "#111B21",
            "&:hover": { bgcolor: "#06CF9C" },
            "&:disabled": { bgcolor: "#2A3942", color: "#8696A0" },
          }}
        >
          Use Translation
        </Button>
      </DialogActions>
    </Dialog>
  );
};
