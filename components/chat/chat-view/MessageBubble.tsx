"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import { Done as SingleCheckIcon, DoneAll as DoubleCheckIcon, Reply as ForwardedIcon } from "@mui/icons-material";
import { Message } from "@/lib/chatService";
import { Timestamp } from "firebase/firestore";
import { useDateFormat } from "@/context/DateFormatContext";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  totalParticipants?: number;
  onLongPress?: (message: Message, e?: React.MouseEvent) => void;
  onClick?: (message: Message) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  totalParticipants = 2,
  onLongPress,
  onClick,
}) => {
  const { formatTime } = useDateFormat();

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onLongPress?.(message, e);
  };

  // Determine read status for own messages
  const getReadStatus = () => {
    if (!isOwn) return null;
    
    const readCount = message.readBy?.length || 0;
    const isReadByAll = readCount >= totalParticipants;
    
    if (isReadByAll) {
      // Blue double check - read by all
      return <DoubleCheckIcon sx={{ fontSize: "1rem", color: "#53BDEB" }} />;
    } else if (readCount > 1) {
      // Grey double check - delivered to some
      return <DoubleCheckIcon sx={{ fontSize: "1rem", color: "rgba(255,255,255,0.5)" }} />;
    } else {
      // Single check - sent
      return <SingleCheckIcon sx={{ fontSize: "1rem", color: "rgba(255,255,255,0.5)" }} />;
    }
  };

  // Get reactions display
  const getReactionsDisplay = () => {
    if (!message.reactions || Object.keys(message.reactions).length === 0) return null;
    
    return (
      <Box
        sx={{
          display: "flex",
          gap: 0.5,
          mt: 0.5,
          flexWrap: "wrap",
        }}
      >
        {Object.entries(message.reactions).map(([emoji, users]) => (
          <Box
            key={emoji}
            sx={{
              bgcolor: "rgba(255,255,255,0.1)",
              borderRadius: "12px",
              px: 0.75,
              py: 0.25,
              fontSize: "0.75rem",
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <span>{emoji}</span>
            {users.length > 1 && (
              <span style={{ color: "rgba(255,255,255,0.7)" }}>{users.length}</span>
            )}
          </Box>
        ))}
      </Box>
    );
  };

  // Handle deleted messages
  if (message.deleted) {
    return (
      <Box sx={{ display: "flex", justifyContent: isOwn ? "flex-end" : "flex-start", mb: 0.5 }}>
        <Typography
          sx={{
            color: "rgba(255,255,255,0.4)",
            fontSize: "0.875rem",
            fontStyle: "italic",
            px: 1.5,
            py: 0.75,
          }}
        >
          This message was deleted
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isOwn ? "flex-end" : "flex-start",
        mb: 0.5,
      }}
    >
      <Box
        onClick={() => onClick?.(message)}
        onContextMenu={handleContextMenu}
        sx={{
          maxWidth: "65%",
          px: 1.5,
          py: 0.75,
          borderRadius: isOwn ? "8px 8px 0 8px" : "8px 8px 8px 0",
          bgcolor: isOwn ? "#005C4B" : "#202C33",
          position: "relative",
          cursor: onLongPress || onClick ? "pointer" : "default",
          "&:hover": onLongPress || onClick ? { opacity: 0.9 } : {},
        }}
      >
        {/* Forwarded indicator */}
        {message.forwardedFrom && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
            <ForwardedIcon sx={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }} />
            <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", fontStyle: "italic" }}>
              Forwarded
            </Typography>
          </Box>
        )}
        
        <Typography
          sx={{
            color: "#E9EDEF",
            fontSize: "0.9375rem",
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
          }}
        >
          {message.text}
        </Typography>
        
        {/* Reactions */}
        {getReactionsDisplay()}
        
        {/* Time, edited, and read status */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.5, mt: 0.25 }}>
          {message.editedAt && (
            <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.6875rem" }}>
              edited
            </Typography>
          )}
          <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.6875rem" }}>
            {formatTime(message.createdAt)}
          </Typography>
          {getReadStatus()}
        </Box>
      </Box>
    </Box>
  );
};
