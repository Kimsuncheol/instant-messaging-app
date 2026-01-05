"use client";

import React, { useState } from "react";
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  IconButton,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Reply as ForwardIcon,
  ContentCopy as CopyIcon,
} from "@mui/icons-material";
import { MemoData } from "@/components/modals/MemoModal";

// Common emoji reactions
const MEMO_REACTIONS = ["👍", "❤️", "📌", "⭐", "✅", "💡"];

interface MemoActionsMenuProps {
  memo: MemoData | null;
  messageId?: string;
  anchorPosition: { top: number; left: number } | null;
  onClose: () => void;
  onEdit?: (memo: MemoData) => void;
  onDelete?: (messageId: string) => void;
  onForward?: (memo: MemoData) => void;
  onReaction?: (emoji: string) => void;
  onCopy?: (content: string) => void;
}

export const MemoActionsMenu: React.FC<MemoActionsMenuProps> = ({
  memo,
  messageId,
  anchorPosition,
  onClose,
  onEdit,
  onDelete,
  onForward,
  onReaction,
  onCopy,
}) => {
  const [showReactions, setShowReactions] = useState(true);

  if (!memo) return null;

  const handleCopy = () => {
    const text = `${memo.title}\n\n${memo.content}`;
    navigator.clipboard.writeText(text);
    onCopy?.(text);
    onClose();
  };

  const handleEdit = () => {
    onEdit?.(memo);
    onClose();
  };

  const handleDelete = () => {
    if (messageId) {
      onDelete?.(messageId);
    }
    onClose();
  };

  const handleForward = () => {
    onForward?.(memo);
    onClose();
  };

  const handleReaction = (emoji: string) => {
    onReaction?.(emoji);
    setShowReactions(false);
    onClose();
  };

  return (
    <Menu
      open={Boolean(anchorPosition)}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={anchorPosition || undefined}
      PaperProps={{
        sx: {
          bgcolor: "#233138",
          color: "#E9EDEF",
          minWidth: 180,
        },
      }}
    >
      {/* Reaction Bar */}
      {showReactions && (
        <>
          <Box sx={{ display: "flex", justifyContent: "center", px: 1, py: 0.5 }}>
            {MEMO_REACTIONS.map((emoji) => (
              <IconButton
                key={emoji}
                onClick={() => handleReaction(emoji)}
                sx={{
                  fontSize: "1.25rem",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                }}
              >
                {emoji}
              </IconButton>
            ))}
          </Box>
          <Divider sx={{ bgcolor: "#2A3942" }} />
        </>
      )}

      {/* Copy */}
      <MenuItem
        onClick={handleCopy}
        sx={{ py: 1.5, "&:hover": { bgcolor: "#182229" } }}
      >
        <ListItemIcon>
          <CopyIcon sx={{ color: "#AEBAC1" }} />
        </ListItemIcon>
        <ListItemText>Copy</ListItemText>
      </MenuItem>

      {/* Edit */}
      {onEdit && (
        <MenuItem
          onClick={handleEdit}
          sx={{ py: 1.5, "&:hover": { bgcolor: "#182229" } }}
        >
          <ListItemIcon>
            <EditIcon sx={{ color: "#AEBAC1" }} />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
      )}

      {/* Forward */}
      {onForward && (
        <MenuItem
          onClick={handleForward}
          sx={{ py: 1.5, "&:hover": { bgcolor: "#182229" } }}
        >
          <ListItemIcon>
            <ForwardIcon sx={{ color: "#AEBAC1" }} />
          </ListItemIcon>
          <ListItemText>Forward</ListItemText>
        </MenuItem>
      )}

      {/* Delete */}
      {onDelete && messageId && (
        <>
          <Divider sx={{ bgcolor: "#2A3942" }} />
          <MenuItem
            onClick={handleDelete}
            sx={{ py: 1.5, "&:hover": { bgcolor: "#182229" } }}
          >
            <ListItemIcon>
              <DeleteIcon sx={{ color: "#F15C6D" }} />
            </ListItemIcon>
            <ListItemText sx={{ color: "#F15C6D" }}>Delete</ListItemText>
          </MenuItem>
        </>
      )}
    </Menu>
  );
};
