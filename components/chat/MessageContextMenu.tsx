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
  Typography,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Reply as ForwardIcon,
  ContentCopy as CopyIcon,
  Translate as TranslateIcon,
} from "@mui/icons-material";
import { Message, editMessage, deleteMessage, addReaction } from "@/lib/chatService";
import { useLocale } from "@/context/LocaleContext";

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
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const { locale } = useLocale();

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

  // Translation using free API
  const handleTranslate = async () => {
    if (translating) return;
    
    setTranslating(true);
    try {
      // Use MyMemory API (free, no API key needed)
      const langMap: Record<string, string> = {
        en: "en", ko: "ko", es: "es", fr: "fr",
        zh: "zh-CN", ja: "ja", hi: "hi", de: "de", it: "it", ru: "ru"
      };
      const targetLang = langMap[locale] || "en";
      
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(message.text)}&langpair=auto|${targetLang}`
      );
      const data = await response.json();
      
      if (data.responseData?.translatedText) {
        setTranslatedText(data.responseData.translatedText);
      } else {
        setTranslatedText("Translation unavailable");
      }
    } catch (error) {
      console.error("Translation error:", error);
      setTranslatedText("Translation failed");
    } finally {
      setTranslating(false);
    }
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

        {/* Translate */}
        <MenuItem 
          onClick={handleTranslate}
          disabled={translating}
          sx={{ py: 1.5, "&:hover": { bgcolor: "#182229" } }}
        >
          <ListItemIcon>
            <TranslateIcon sx={{ color: "#AEBAC1" }} />
          </ListItemIcon>
          <ListItemText>{translating ? "Translating..." : "Translate"}</ListItemText>
        </MenuItem>

        {/* Show Translated Text */}
        {translatedText && (
          <Box sx={{ px: 2, py: 1.5, bgcolor: "#182229", mx: 1, borderRadius: 1, mb: 1 }}>
            <Typography variant="caption" sx={{ color: "#8696A0" }}>Translation:</Typography>
            <Typography sx={{ color: "#E9EDEF", fontSize: "0.875rem" }}>
              {translatedText}
            </Typography>
          </Box>
        )}

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
        {/* Delete (own messages only) */}
        {canDelete && [
          <Divider key="delete-divider" sx={{ bgcolor: "#2A3942" }} />,
          <MenuItem 
            key="delete-item"
            onClick={handleDelete}
            sx={{ py: 1.5, "&:hover": { bgcolor: "#182229" } }}
          >
            <ListItemIcon>
              <DeleteIcon sx={{ color: "#F15C6D" }} />
            </ListItemIcon>
            <ListItemText sx={{ color: "#F15C6D" }}>Delete</ListItemText>
          </MenuItem>
        ]}
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
