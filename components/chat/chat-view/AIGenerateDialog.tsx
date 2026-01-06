"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import {
  Close as CloseIcon,
  AutoAwesome as GenerateIcon,
} from "@mui/icons-material";
import { GenerationOutput } from "@/lib/ai";

import { IntentInput } from "./ai-generate/IntentInput";
import { LoadingState } from "./ai-generate/LoadingState";
import { ResultView } from "./ai-generate/ResultView";

interface AIGenerateDialogProps {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  result: GenerationOutput | null;
  error?: string;
  onGenerate: (intent: string) => void;
  onSaveGenerated?: (message: { title: string; content: string }) => void;
}

export const AIGenerateDialog: React.FC<AIGenerateDialogProps> = ({
  open,
  onClose,
  loading,
  result,
  error,
  onGenerate,
  onSaveGenerated,
}) => {
  const [intent, setIntent] = useState("");

  const handleGenerate = () => {
    if (intent.trim()) {
      onGenerate(intent.trim());
    }
  };

  const handleSave = () => {
    if (result && onSaveGenerated) {
      onSaveGenerated({
        title: "AI Generated",
        content: result.generatedMessage,
      });
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "#111B21",
          color: "#E9EDEF",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <GenerateIcon sx={{ color: "#FFA726" }} />
          <Typography fontWeight={600}>AI Content Generator</Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "#AEBAC1" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        {/* Intent Input */}
        {!result && !loading && (
          <IntentInput intent={intent} setIntent={setIntent} />
        )}

        {loading && <LoadingState />}

        {error && (
          <Box sx={{ bgcolor: "#F15C6D20", p: 2, borderRadius: 1, mb: 2 }}>
            <Typography sx={{ color: "#F15C6D" }}>{error}</Typography>
          </Box>
        )}

        {result && !loading && <ResultView result={result} />}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ color: "#AEBAC1" }}>
          Cancel
        </Button>
        {!result ? (
          <Button
            onClick={handleGenerate}
            disabled={loading || !intent.trim()}
            variant="contained"
            sx={{
              bgcolor: error ? "#F15C6D" : "#FFA726",
              color: "#111B21",
              "&:hover": { bgcolor: error ? "#D32F2F" : "#FF9800" },
              "&:disabled": { bgcolor: "#3B4A54", color: "#8696A0" },
            }}
          >
            {error ? "Retry" : "Generate"}
          </Button>
        ) : (
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{
              bgcolor: "#00A884",
              "&:hover": { bgcolor: "#008f6f" },
            }}
          >
            Save as Memo
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
