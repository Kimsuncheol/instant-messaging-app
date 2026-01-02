"use client";

import React, { useState, useRef } from "react";
import { Box, TextField, IconButton, Popover, Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import {
  Send as SendIcon,
  AttachFile as AttachIcon,
  EmojiEmotions as EmojiIcon,
  Mic as MicIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
  AutoAwesome as AiIcon,
} from "@mui/icons-material";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { AiImageModal } from "@/components/modals/AiImageModal";

interface MessageInputProps {
  onSend: (text: string, attachment?: { url: string; type: string; name: string }) => Promise<void>;
  disabled?: boolean;
  onTypingStart?: () => void;
  onTypingEnd?: () => void;
  onVoiceCall?: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  disabled = false,
  onTypingStart,
  onTypingEnd,
  onVoiceCall,
}) => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [emojiAnchor, setEmojiAnchor] = useState<HTMLElement | null>(null);
  const [attachAnchor, setAttachAnchor] = useState<HTMLElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || sending || disabled) return;

    setSending(true);
    try {
      await onSend(message.trim());
      setMessage("");
      onTypingEnd?.();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const wasEmpty = message.trim() === "";
    const isEmpty = value.trim() === "";

    setMessage(value);

    if (wasEmpty && !isEmpty) {
      onTypingStart?.();
    } else if (!wasEmpty && isEmpty) {
      onTypingEnd?.();
    }
  };

  // Emoji picker handlers
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage((prev) => prev + emojiData.emoji);
    setEmojiAnchor(null);
    inputRef.current?.focus();
  };

  // Attachment handlers
  const handleAttachClick = (e: React.MouseEvent<HTMLElement>) => {
    setAttachAnchor(e.currentTarget);
  };

  const handleFileSelect = (type: "image" | "file") => {
    setAttachAnchor(null);
    if (type === "image") {
      imageInputRef.current?.click();
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "file") => {
    const file = e.target.files?.[0];
    if (!file) return;

    // For now just show file name in message
    // In production, upload to Firebase Storage first
    const attachmentText = type === "image" 
      ? `📷 ${file.name}`
      : `📎 ${file.name}`;
    
    setMessage((prev) => prev + (prev ? " " : "") + attachmentText);
    
    // Reset input
    e.target.value = "";
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 2,
        py: 1,
        bgcolor: "#202C33",
      }}
    >
      {/* Emoji Button */}
      <IconButton 
        sx={{ color: "#8696A0" }}
        onClick={(e) => setEmojiAnchor(e.currentTarget)}
      >
        <EmojiIcon />
      </IconButton>

      {/* Emoji Picker Popover */}
      <Popover
        open={Boolean(emojiAnchor)}
        anchorEl={emojiAnchor}
        onClose={() => setEmojiAnchor(null)}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
        transformOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <EmojiPicker 
          onEmojiClick={handleEmojiClick}
          theme={Theme.DARK}
          width={350}
          height={400}
        />
      </Popover>

      {/* Attachment Button */}
      <IconButton sx={{ color: "#8696A0" }} onClick={handleAttachClick}>
        <AttachIcon />
      </IconButton>

      {/* Attachment Menu */}
      <Menu
        anchorEl={attachAnchor}
        open={Boolean(attachAnchor)}
        onClose={() => setAttachAnchor(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        transformOrigin={{ vertical: "bottom", horizontal: "center" }}
        PaperProps={{
          sx: { bgcolor: "#233138", color: "#E9EDEF" }
        }}
      >
        <MenuItem onClick={() => handleFileSelect("image")}>
          <ListItemIcon><ImageIcon sx={{ color: "#00A884" }} /></ListItemIcon>
          <ListItemText>Photo</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleFileSelect("file")}>
          <ListItemIcon><FileIcon sx={{ color: "#7F66FF" }} /></ListItemIcon>
          <ListItemText>Document</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setAttachAnchor(null); setAiModalOpen(true); }}>
          <ListItemIcon><AiIcon sx={{ color: "#FFD700" }} /></ListItemIcon>
          <ListItemText>AI Generate</ListItemText>
        </MenuItem>
      </Menu>

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={imageInputRef}
        hidden
        accept="image/*"
        onChange={(e) => handleFileChange(e, "image")}
      />
      <input
        type="file"
        ref={fileInputRef}
        hidden
        accept="*/*"
        onChange={(e) => handleFileChange(e, "file")}
      />

      {/* Message Input */}
      <TextField
        fullWidth
        inputRef={inputRef}
        placeholder="Type a message"
        size="small"
        value={message}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        disabled={disabled}
        multiline
        maxRows={4}
        sx={{
          "& .MuiOutlinedInput-root": {
            bgcolor: "#2A3942",
            borderRadius: "8px",
            "& fieldset": { border: "none" },
            "& input, & textarea": {
              color: "#E9EDEF",
              fontSize: "0.9375rem",
              "&::placeholder": {
                color: "#8696A0",
                opacity: 1,
              },
            },
          },
        }}
      />

      {/* Send or Mic button */}
      {message.trim() ? (
        <IconButton
          onClick={handleSend}
          disabled={sending || disabled}
          sx={{
            color: "#00A884",
            "&:hover": { bgcolor: "rgba(0,168,132,0.1)" },
          }}
        >
          <SendIcon />
        </IconButton>
      ) : (
        <IconButton 
          onClick={onVoiceCall}
          sx={{ 
            color: "#8696A0",
            "&:hover": { color: "#00A884" },
          }}
        >
          <MicIcon />
        </IconButton>
      )}

      {/* AI Image Generation Modal */}
      <AiImageModal
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onImageGenerated={(imageUrl) => {
          setMessage((prev) => prev + (prev ? " " : "") + `🎨 [AI Generated Image]`);
        }}
      />
    </Box>
  );
};
