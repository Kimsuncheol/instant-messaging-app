"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
} from "@mui/material";
import {
  Folder as FolderIcon,
  Star as StarIcon,
  Bookmark as BookmarkIcon,
  Favorite as HeartIcon,
  Lightbulb as LightbulbIcon,
} from "@mui/icons-material";
import { IconShape } from "@/lib/memoChatroomService";

interface IconPickerDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (color: string, shape: IconShape) => void;
  currentColor?: string;
  currentShape?: IconShape;
}

const PRESET_COLORS = [
  { name: "Orange", value: "#FFA726" },
  { name: "Blue", value: "#42A5F5" },
  { name: "Green", value: "#66BB6A" },
  { name: "Red", value: "#EF5350" },
  { name: "Purple", value: "#AB47BC" },
  { name: "Pink", value: "#EC407A" },
  { name: "Teal", value: "#26A69A" },
  { name: "Yellow", value: "#FFEE58" },
];

const SHAPES: Array<{
  value: IconShape;
  icon: React.ReactNode;
  label: string;
}> = [
  { value: "folder", icon: <FolderIcon />, label: "Folder" },
  { value: "star", icon: <StarIcon />, label: "Star" },
  { value: "bookmark", icon: <BookmarkIcon />, label: "Bookmark" },
  { value: "heart", icon: <HeartIcon />, label: "Heart" },
  { value: "lightbulb", icon: <LightbulbIcon />, label: "Lightbulb" },
];

export const IconPickerDialog: React.FC<IconPickerDialogProps> = ({
  open,
  onClose,
  onSave,
  currentColor = "#FFA726",
  currentShape = "folder",
}) => {
  const [selectedColor, setSelectedColor] = useState(currentColor);
  const [selectedShape, setSelectedShape] = useState<IconShape>(currentShape);

  React.useEffect(() => {
    if (open) {
      setSelectedColor(currentColor);
      setSelectedShape(currentShape);
    }
  }, [open, currentColor, currentShape]);

  const handleSave = () => {
    onSave(selectedColor, selectedShape);
    onClose();
  };

  const getIconComponent = (shape: IconShape) => {
    const shapeData = SHAPES.find((s) => s.value === shape);
    return shapeData?.icon || <FolderIcon />;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "#1F2C34",
          color: "#E9EDEF",
        },
      }}
    >
      <DialogTitle>Customize Icon</DialogTitle>
      <DialogContent>
        {/* Preview */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            py: 3,
            mb: 3,
            borderRadius: 2,
            bgcolor: "#2A3942",
          }}
        >
          <Box sx={{ color: selectedColor, fontSize: 64 }}>
            {getIconComponent(selectedShape)}
          </Box>
        </Box>

        {/* Color Picker */}
        <Typography sx={{ mb: 1, color: "#8696A0", fontSize: "0.875rem" }}>
          Color
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 1,
            mb: 3,
          }}
        >
          {PRESET_COLORS.map((color) => (
            <Box
              key={color.value}
              onClick={() => setSelectedColor(color.value)}
              sx={{
                width: "100%",
                aspectRatio: "1",
                borderRadius: 1,
                bgcolor: color.value,
                cursor: "pointer",
                border:
                  selectedColor === color.value
                    ? "3px solid #00A884"
                    : "2px solid transparent",
                transition: "all 0.2s",
                "&:hover": {
                  transform: "scale(1.1)",
                },
              }}
              title={color.name}
            />
          ))}
        </Box>

        {/* Shape Picker */}
        <Typography sx={{ mb: 1, color: "#8696A0", fontSize: "0.875rem" }}>
          Shape
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 1,
          }}
        >
          {SHAPES.map((shape) => (
            <Box
              key={shape.value}
              onClick={() => setSelectedShape(shape.value)}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0.5,
                p: 1,
                borderRadius: 1,
                cursor: "pointer",
                bgcolor:
                  selectedShape === shape.value ? "#2A3942" : "transparent",
                border:
                  selectedShape === shape.value
                    ? "2px solid #00A884"
                    : "2px solid transparent",
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: "#2A3942",
                },
              }}
            >
              <Box sx={{ color: "#8696A0", fontSize: 32 }}>{shape.icon}</Box>
              <Typography sx={{ fontSize: "0.625rem", color: "#8696A0" }}>
                {shape.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ color: "#8696A0" }}>
          Cancel
        </Button>
        <Button onClick={handleSave} sx={{ color: "#00A884" }}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
