"use client";

import React, { useState, useRef } from "react";
import {
  Box,
  TextField,
  IconButton,
  Popover,
  InputAdornment,
} from "@mui/material";
import {
  Send as SendIcon,
  EmojiEmotions as EmojiIcon,
  Mic as MicIcon,
} from "@mui/icons-material";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { AiImageModal } from "@/components/modals/AiImageModal";
import { TranslateModal } from "@/components/modals/TranslateModal";
import {
  AttachmentPanel,
  AttachmentTriggerButton,
  AttachmentType,
} from "@/components/chat/chat-input";
import { Poll } from "@/lib/chatService";
import { useUiStore } from "@/store/uiStore";

interface MessageInputProps {
  onSend: (
    text: string,
    poll?: Omit<Poll, "id" | "totalVotes" | "createdAt">
  ) => Promise<void>;
  disabled?: boolean;
  onTypingStart?: () => void;
  onTypingEnd?: () => void;
  onVoiceCall?: () => void;
  onVideoCall?: () => void;
  onPollCreate?: () => void;
  onEventCreate?: () => void;
  onCameraClick?: () => void;
  onLocationClick?: () => void;
  onContactClick?: () => void;
  onMemoClick?: () => void;
  onCaptureClick?: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  disabled = false,
  onTypingStart,
  onTypingEnd,
  onVoiceCall,
  onVideoCall,
  onPollCreate,
  onEventCreate,
  onCameraClick,
  onLocationClick,
  onContactClick,
  onMemoClick,
  onCaptureClick,
}) => {
  const footerHeightB = useUiStore((state) => state.footerHeightB);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [emojiAnchor, setEmojiAnchor] = useState<HTMLElement | null>(null);
  const [attachPanelOpen, setAttachPanelOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [translateModalOpen, setTranslateModalOpen] = useState(false);

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

  // Handle attachment selection
  const handleAttachmentSelect = (type: AttachmentType) => {
    switch (type) {
      case "gallery":
        imageInputRef.current?.click();
        break;
      case "voice_call":
        onVoiceCall?.();
        setAttachPanelOpen(false);
        break;
      case "video_call":
        onVideoCall?.();
        setAttachPanelOpen(false);
        break;
      case "camera":
        onCameraClick?.();
        setAttachPanelOpen(false);
        break;
      case "location":
        onLocationClick?.();
        setAttachPanelOpen(false);
        break;
      case "contact":
        onContactClick?.();
        setAttachPanelOpen(false);
        break;
      case "document":
        fileInputRef.current?.click();
        break;
      case "audio":
        audioInputRef.current?.click();
        break;
      case "poll":
        onPollCreate?.();
        setAttachPanelOpen(false);
        break;
      case "event":
        onEventCreate?.();
        setAttachPanelOpen(false);
        break;
      case "memo":
        onMemoClick?.();
        setAttachPanelOpen(false);
        break;
      case "capture":
        onCaptureClick?.();
        setAttachPanelOpen(false);
        break;
    }
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "file" | "audio"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const attachmentText =
      type === "image"
        ? `📷 ${file.name}`
        : type === "audio"
        ? `🎵 ${file.name}`
        : `📎 ${file.name}`;

    setMessage((prev) => prev + (prev ? " " : "") + attachmentText);

    // Reset input
    e.target.value = "";
  };

  const paddingY = 1.5;

  return (
    <Box
      sx={{
        minHeight: footerHeightB,
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 2,
        py: paddingY,
        bgcolor: "#202C33",
      }}
    >
      {/* Attachment Panel */}
      <AttachmentPanel
        open={attachPanelOpen}
        onClose={() => setAttachPanelOpen(false)}
        onSelect={handleAttachmentSelect}
      />

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
      <input
        type="file"
        ref={audioInputRef}
        hidden
        accept="audio/*"
        onChange={(e) => handleFileChange(e, "audio")}
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
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <AttachmentTriggerButton
                isOpen={attachPanelOpen}
                onClick={() => setAttachPanelOpen(!attachPanelOpen)}
              />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                sx={{ color: "#8696A0" }}
                onClick={(e) => setEmojiAnchor(e.currentTarget)}
                aria-label="Open emoji picker"
              >
                <EmojiIcon />
              </IconButton>
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

              {/* Send or Mic button */}
              {message.trim() ? (
                <IconButton
                  onClick={handleSend}
                  disabled={sending || disabled}
                  aria-label="Send message"
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
                  aria-label="Voice message"
                  sx={{
                    color: "#8696A0",
                    "&:hover": { color: "#00A884" },
                  }}
                >
                  <MicIcon />
                </IconButton>
              )}
            </InputAdornment>
          ),
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            height: footerHeightB - paddingY * 16,
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

      {/* AI Image Generation Modal */}
      <AiImageModal
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onImageGenerated={() => {
          setMessage(
            (prev) => prev + (prev ? " " : "") + `🎨 [AI Generated Image]`
          );
        }}
      />

      {/* Translate Modal */}
      <TranslateModal
        open={translateModalOpen}
        onClose={() => setTranslateModalOpen(false)}
        originalText={message}
        onTranslate={(translatedText) => {
          setMessage(translatedText);
        }}
      />
    </Box>
  );
};
