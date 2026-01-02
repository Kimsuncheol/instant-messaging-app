"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Close as CloseIcon, AutoAwesome as AiIcon } from "@mui/icons-material";
import { generateImage, GeneratedImage } from "@/lib/aiService";

interface AiImageModalProps {
  open: boolean;
  onClose: () => void;
  onImageGenerated?: (imageUrl: string) => void;
}

export const AiImageModal: React.FC<AiImageModalProps> = ({
  open,
  onClose,
  onImageGenerated,
}) => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError("");
    setGeneratedImage(null);

    const result = await generateImage(prompt);

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else if (result.image) {
      setGeneratedImage(result.image);
    }
  };

  const handleUseImage = () => {
    if (generatedImage) {
      const dataUrl = `data:${generatedImage.mimeType};base64,${generatedImage.data}`;
      onImageGenerated?.(dataUrl);
      handleClose();
    }
  };

  const handleClose = () => {
    setPrompt("");
    setError("");
    setGeneratedImage(null);
    setLoading(false);
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
          minHeight: 400,
        },
      }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AiIcon sx={{ color: "#00A884" }} />
          <Typography variant="h6">AI Image Generator</Typography>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: "#8696A0" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Typography sx={{ color: "#8696A0", mb: 2 }}>
          Describe the image you want to generate
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="A beautiful sunset over mountains with purple sky..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
          sx={{
            "& .MuiOutlinedInput-root": {
              bgcolor: "#2A3942",
              "& fieldset": { borderColor: "#2A3942" },
              "& textarea": { color: "#E9EDEF" },
            },
          }}
        />

        {error && (
          <Typography sx={{ color: "#F15C6D", mt: 2, fontSize: "0.875rem" }}>
            {error}
          </Typography>
        )}

        {/* Loading state */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
            <CircularProgress sx={{ color: "#00A884" }} />
            <Typography sx={{ ml: 2, color: "#8696A0" }}>Generating image...</Typography>
          </Box>
        )}

        {/* Generated image preview */}
        {generatedImage && !loading && (
          <Box sx={{ mt: 2 }}>
            <Typography sx={{ color: "#8696A0", mb: 1 }}>Generated Image:</Typography>
            <Box
              component="img"
              src={`data:${generatedImage.mimeType};base64,${generatedImage.data}`}
              alt="AI Generated"
              sx={{
                width: "100%",
                maxHeight: 300,
                objectFit: "contain",
                borderRadius: 2,
                bgcolor: "#0B141A",
              }}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} sx={{ color: "#8696A0" }} disabled={loading}>
          Cancel
        </Button>
        {generatedImage ? (
          <Button
            onClick={handleUseImage}
            variant="contained"
            sx={{ bgcolor: "#00A884", "&:hover": { bgcolor: "#008f70" } }}
          >
            Use Image
          </Button>
        ) : (
          <Button
            onClick={handleGenerate}
            variant="contained"
            disabled={!prompt.trim() || loading}
            sx={{
              bgcolor: "#00A884",
              "&:hover": { bgcolor: "#008f70" },
              "&:disabled": { bgcolor: "#2A3942" },
            }}
          >
            Generate
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
