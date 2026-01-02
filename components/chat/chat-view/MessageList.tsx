"use client";

import React, { useRef, useEffect } from "react";
import { Box } from "@mui/material";
import { Message } from "@/lib/chatService";
import { MessageBubble } from "./MessageBubble";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  onMessageLongPress?: (message: Message) => void;
  onMessageClick?: (message: Message) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  onMessageLongPress,
  onMessageClick,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Box
      sx={{
        flexGrow: 1,
        overflowY: "auto",
        px: 3,
        py: 2,
        backgroundImage: "url('/chat-bg.png')",
        backgroundSize: "contain",
        bgcolor: "#0B141A",
      }}
    >
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          isOwn={msg.senderId === currentUserId}
          onLongPress={onMessageLongPress}
          onClick={onMessageClick}
        />
      ))}
      <div ref={messagesEndRef} />
    </Box>
  );
};
