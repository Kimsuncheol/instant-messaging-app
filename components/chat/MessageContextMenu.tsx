"use client";

import React, { useState } from "react";
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Reply as ForwardIcon,
  ContentCopy as CopyIcon,
} from "@mui/icons-material";
import { Message, editMessage, deleteMessage, addReaction } from "@/lib/chatService";

// Common emoji reactions
const REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

interface MessageContextMenuProps {
  message: Message | null;
  anchorPosition: { top: number; left: number } | null;
  onClose: () => void;
  chatId: string;
  userId: string;
  onForward?: (message: Message) => void;
}

export const MessageContextMenu: React.FC<MessageContextMenuProps> = ({
  message,
  anchorPosition,
  onClose,
  chatId,
  userId,
  onForward,
}) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editText, setEditText] = useState("");

  if (!message) return null;

  const isOwnMessage = message.senderId === userId;
  const canEdit = isOwnMessage && !message.deleted;
  const canDelete = isOwnMessage && !message.deleted;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.text);
    onClose();
  };

  const handleEditClick = () => {
    setEditText(message.text);
    setEditDialogOpen(true);
    onClose();
  };

  const handleEditSave = async () => {
    if (editText.trim() && editText !== message.text) {
      await editMessage(chatId, message.id, editText.trim());
    }
    setEditDialogOpen(false);
    setEditText("");
  };

  const handleDelete = async () => {
    await deleteMessage(chatId, message.id);
    onClose();
  };

  const handleReaction = async (emoji: string) => {
    await addReaction(chatId, message.id, userId, emoji);
    onClose();
  };

  const handleForward = () => {
    onForward?.(message);
    onClose();
  };

  return (
    <>
      <Menu
        open={Boolean(anchorPosition)}
        onClose={onClose}
        anchorReference="anchorPosition"
        anchorPosition={anchorPosition || undefined}
        PaperProps={{
          sx: {
            bgcolor: "#233138",
            color: "#E9EDEF",
            minWidth: 200,
          },
        }}
      >
        {/* Reaction Bar */}
        <Box sx={{ display: "flex", justifyContent: "center", px: 1, py: 0.5 }}>
          {REACTIONS.map((emoji) => (
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

        {/* Forward */}
        <MenuItem 
          onClick={handleForward}
          sx={{ py: 1.5, "&:hover": { bgcolor: "#182229" } }}
        >
          <ListItemIcon>
            <ForwardIcon sx={{ color: "#AEBAC1" }} />
          </ListItemIcon>
          <ListItemText>Forward</ListItemText>
        </MenuItem>

        {/* Edit (own messages only) */}
        {canEdit && (
          <MenuItem 
            onClick={handleEditClick}
            sx={{ py: 1.5, "&:hover": { bgcolor: "#182229" } }}
          >
            <ListItemIcon>
              <EditIcon sx={{ color: "#AEBAC1" }} />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
        )}

        {/* Delete (own messages only) */}
        {canDelete && (
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

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "#233138",
            color: "#E9EDEF",
          },
        }}
      >
        <DialogTitle>Edit Message</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            autoFocus
            sx={{
              mt: 1,
              "& .MuiOutlinedInput-root": {
                bgcolor: "#2A3942",
                "& fieldset": { borderColor: "#2A3942" },
                "& textarea": { color: "#E9EDEF" },
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setEditDialogOpen(false)}
            sx={{ color: "#8696A0" }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleEditSave}
            sx={{ color: "#00A884" }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
