"use client";

import React, { useState } from "react";
import { Box, TextField, IconButton } from "@mui/material";
import {
  Send as SendIcon,
  AttachFile as AttachIcon,
  EmojiEmotions as EmojiIcon,
  Mic as MicIcon,
} from "@mui/icons-material";

interface MessageInputProps {
  onSend: (text: string) => Promise<void>;
  disabled?: boolean;
  onTypingStart?: () => void;
  onTypingEnd?: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  disabled = false,
  onTypingStart,
  onTypingEnd,
}) => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

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
      <IconButton sx={{ color: "#8696A0" }}>
        <EmojiIcon />
      </IconButton>
      <IconButton sx={{ color: "#8696A0" }}>
        <AttachIcon />
      </IconButton>
      <TextField
        fullWidth
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
        <IconButton sx={{ color: "#8696A0" }}>
          <MicIcon />
        </IconButton>
      )}
    </Box>
  );
};
