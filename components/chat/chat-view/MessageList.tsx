"use client";

import React, { useRef, useEffect, useMemo, forwardRef } from "react";
import { Box, Chip } from "@mui/material";
import { Message } from "@/lib/chatService";
import { MessageBubble } from "./MessageBubble";
import { SystemIndicator } from "./SystemIndicator";
import { Timestamp } from "firebase/firestore";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  onMessageLongPress?: (message: Message, e?: React.MouseEvent) => void;
  onMessageClick?: (message: Message) => void;
  onPollVote?: (messageId: string, optionId: string) => void;
  onEventRSVP?: (
    messageId: string,
    status: "going" | "maybe" | "declined"
  ) => void;
  onSaveToMemo?: (content: string) => void;
  searchTerm?: string;
  currentMatchId?: string | null;
  // Selection mode props
  selectionMode?: boolean;
  selectedMessageIds?: Set<string>;
  onToggleSelect?: (messageId: string) => void;
}

// Helper to get date key from timestamp
const getDateKey = (timestamp: Timestamp | null): string => {
  if (!timestamp) return "unknown";
  const date = timestamp.toDate();
  return date.toDateString();
};

const DateSeparator: React.FC<{ dateKey: string }> = ({ dateKey }) => {
  const date = new Date(dateKey);

  const now = new Date();
  const isToday = dateKey === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = dateKey === yesterday.toDateString();

  let label: string;
  if (isToday) {
    label = "Today";
  } else if (isYesterday) {
    label = "Yesterday";
  } else {
    // Format date nicely
    label = date.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }

  return (
    <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
      <Chip
        label={label}
        size="small"
        sx={{
          bgcolor: "#182229",
          color: "#8696A0",
          fontSize: "0.75rem",
          fontWeight: 500,
          px: 1,
        }}
      />
    </Box>
  );
};

export const MessageList = forwardRef<HTMLDivElement, MessageListProps>(
  (
    {
      messages,
      currentUserId,
      onMessageLongPress,
      onMessageClick,
      onPollVote,
      onEventRSVP,
      onSaveToMemo,
      searchTerm = "",
      currentMatchId = null,
      selectionMode = false,
      selectedMessageIds = new Set(),
      onToggleSelect,
    },
    ref
  ) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const matchRef = useRef<HTMLDivElement>(null);

    // Group messages by date
    const messagesWithSeparators = useMemo(() => {
      const result: {
        type: "separator" | "message";
        data: string | Message;
      }[] = [];
      let lastDateKey = "";

      // Filter out messages deleted by current user
      const visibleMessages = messages.filter(
        (msg) => !msg.deletedFor?.includes(currentUserId)
      );

      visibleMessages.forEach((msg) => {
        const dateKey = getDateKey(msg.createdAt);

        if (dateKey !== lastDateKey) {
          result.push({ type: "separator", data: dateKey });
          lastDateKey = dateKey;
        }

        result.push({ type: "message", data: msg });
      });

      return result;
    }, [messages, currentUserId]);

    // Auto-scroll to bottom when new messages arrive, BUT only if not searching
    useEffect(() => {
      if (!searchTerm) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }, [messages, searchTerm]);

    // Scroll to current match
    useEffect(() => {
      if (currentMatchId && matchRef.current) {
        matchRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, [currentMatchId]);

    return (
      <Box
        ref={ref}
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
        {messagesWithSeparators.map((item) => {
          if (item.type === "separator") {
            return (
              <DateSeparator
                key={`sep-${item.data}`}
                dateKey={item.data as string}
              />
            );
          }

          const msg = item.data as Message;
          const isMatch = msg.id === currentMatchId;

          return (
            <Box key={msg.id} ref={isMatch ? matchRef : null}>
              {msg.type === "system" ? (
                <SystemIndicator text={msg.text} />
              ) : (
                <MessageBubble
                  message={msg}
                  isOwn={msg.senderId === currentUserId}
                  onLongPress={onMessageLongPress}
                  onClick={onMessageClick}
                  onPollVote={onPollVote}
                  onEventRSVP={onEventRSVP}
                  currentUserId={currentUserId}
                  searchTerm={searchTerm}
                  isCurrentMatch={isMatch}
                  selectionMode={selectionMode}
                  isSelected={selectedMessageIds.has(msg.id)}
                  onToggleSelect={onToggleSelect}
                />
              )}
            </Box>
          );
        })}
        <div ref={messagesEndRef} />
      </Box>
    );
  }
);

MessageList.displayName = "MessageList";
