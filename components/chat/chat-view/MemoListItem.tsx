"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Checkbox,
} from "@mui/material";
import {
  Note as NoteIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Forward as ForwardIcon,
  AutoAwesome as AIIcon,
  ContentCopy as CopyIcon,
} from "@mui/icons-material";
import { MemoData } from "@/components/modals/MemoModal";
import { useDateFormat } from "@/context/DateFormatContext";
import { Timestamp } from "firebase/firestore";

interface MemoListItemProps {
  id: string;
  memo: MemoData;
  createdAt?: Timestamp;
  isOwn?: boolean;
  onEdit?: (memo: MemoData, id: string) => void;
  onDelete?: (id: string) => void;
  onForward?: (memo: MemoData) => void;
  onAISummary?: (memo: MemoData) => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

export const MemoListItem: React.FC<MemoListItemProps> = ({
  id,
  memo,
  createdAt,
  isOwn = false,
  onEdit,
  onDelete,
  onForward,
  onAISummary,
  selectionMode = false,
  isSelected = false,
  onToggleSelect,
}) => {
  const { formatTime, formatDate } = useDateFormat();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const handleContextMenu = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setMenuAnchor(e.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${memo.title}\n\n${memo.content}`);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
    handleCloseMenu();
  };

  const handleEdit = () => {
    onEdit?.(memo, id);
    handleCloseMenu();
  };

  const handleDelete = () => {
    onDelete?.(id);
    handleCloseMenu();
  };

  const handleForward = () => {
    onForward?.(memo);
    handleCloseMenu();
  };

  const handleAISummary = async () => {
    setAiLoading(true);
    handleCloseMenu();
    try {
      await onAISummary?.(memo);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <>
      <Box
        onContextMenu={selectionMode ? undefined : handleContextMenu}
        onClick={selectionMode ? onToggleSelect : handleContextMenu}
        sx={{
          p: 2,
          mx: 1,
          mb: 1,
          borderRadius: 2,
          bgcolor: isSelected ? "rgba(124, 77, 255, 0.15)" : "#202C33",
          cursor: "pointer",
          transition: "background-color 0.2s",
          "&:hover": {
            bgcolor: isSelected ? "rgba(124, 77, 255, 0.25)" : "#2A3942",
          },
          position: "relative",
          display: "flex",
          gap: selectionMode ? 2 : 0,
        }}
      >
        {/* Checkbox in selection mode */}
        {selectionMode && (
          <Checkbox
            checked={isSelected}
            onChange={onToggleSelect}
            sx={{
              color: "#8696A0",
              "&.Mui-checked": { color: "#7C4DFF" },
              alignSelf: "flex-start",
              mt: 0.5,
            }}
          />
        )}

        <Box sx={{ flex: 1 }}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 1,
            }}
          >
            <NoteIcon
              sx={{
                fontSize: 18,
                color: "#FFA726",
              }}
            />
            <Typography
              sx={{
                color: "#FFA726",
                fontSize: "0.75rem",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Memo
            </Typography>
            {aiLoading && (
              <CircularProgress
                size={14}
                sx={{ color: "#7C4DFF", ml: "auto" }}
              />
            )}
          </Box>

          {/* Title */}
          <Typography
            sx={{
              color: "#E9EDEF",
              fontWeight: 600,
              fontSize: "0.9375rem",
              mb: 0.5,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {memo.title}
          </Typography>

          {/* Content Preview */}
          <Typography
            sx={{
              color: "#D1D7DB",
              fontSize: "0.8125rem",
              lineHeight: 1.4,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {memo.content}
          </Typography>

          {/* Timestamp */}
          {createdAt && (
            <Typography
              sx={{
                color: "#8696A0",
                fontSize: "0.6875rem",
                mt: 1,
                textAlign: "right",
              }}
            >
              {formatDate(createdAt)} · {formatTime(createdAt)}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: {
            bgcolor: "#233138",
            color: "white",
            minWidth: 180,
          },
        }}
      >
        <MenuItem onClick={handleCopy}>
          <ListItemIcon>
            <CopyIcon sx={{ color: "#AEBAC1" }} fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copy</ListItemText>
        </MenuItem>

        {isOwn && onEdit && (
          <MenuItem onClick={handleEdit}>
            <ListItemIcon>
              <EditIcon sx={{ color: "#00A884" }} fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
        )}

        {onForward && (
          <MenuItem onClick={handleForward}>
            <ListItemIcon>
              <ForwardIcon sx={{ color: "#53BDEB" }} fontSize="small" />
            </ListItemIcon>
            <ListItemText>Forward</ListItemText>
          </MenuItem>
        )}

        {onAISummary && (
          <MenuItem onClick={handleAISummary}>
            <ListItemIcon>
              <AIIcon sx={{ color: "#7C4DFF" }} fontSize="small" />
            </ListItemIcon>
            <ListItemText>AI Summary</ListItemText>
          </MenuItem>
        )}

        {isOwn && onDelete && (
          <MenuItem onClick={handleDelete}>
            <ListItemIcon>
              <DeleteIcon sx={{ color: "#F44336" }} fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};
