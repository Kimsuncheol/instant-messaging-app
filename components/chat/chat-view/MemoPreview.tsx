"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import { Note as NoteIcon } from "@mui/icons-material";
import { Message, subscribeToMessages } from "@/lib/chatService";

interface MemoPreviewProps {
  chatId: string;
  maxItems?: number;
}

interface MemoItem {
  id: string;
  title: string;
  content: string;
  createdAt: number;
}

export const MemoPreview: React.FC<MemoPreviewProps> = ({
  chatId,
  maxItems = 3,
}) => {
  const [memos, setMemos] = useState<MemoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chatId) return;

    setLoading(true);
    const unsubscribe = subscribeToMessages(chatId, (messages: Message[]) => {
      // Filter messages that have memo data
      const memoMessages = messages.filter((msg) => msg.memo);

      // Map to memo items
      const items: MemoItem[] = memoMessages.map((msg) => ({
        id: msg.id,
        title: msg.memo?.title || "Untitled",
        content: msg.memo?.content || "",
        createdAt: msg.createdAt?.toMillis() || Date.now(),
      }));

      // Sort by createdAt descending and limit
      items.sort((a, b) => b.createdAt - a.createdAt);
      setMemos(items.slice(0, maxItems));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chatId, maxItems]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          py: 2,
        }}
      >
        <CircularProgress size={20} sx={{ color: "#00A884" }} />
      </Box>
    );
  }

  if (memos.length === 0) {
    return (
      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography
          variant="body2"
          sx={{ color: "#8696A0", textAlign: "center" }}
        >
          No memos in this chat
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ py: 0, px: 1 }}>
      {memos.map((memo) => (
        <ListItem
          key={memo.id}
          sx={{
            py: 0.75,
            px: 1,
            borderRadius: 1,
            "&:hover": { bgcolor: "rgba(255, 255, 255, 0.05)" },
          }}
        >
          <NoteIcon
            sx={{
              fontSize: 18,
              color: "#FFA726",
              mr: 1.5,
              flexShrink: 0,
            }}
          />
          <ListItemText
            primary={memo.title}
            secondary={
              memo.content.length > 50
                ? memo.content.substring(0, 50) + "..."
                : memo.content
            }
            primaryTypographyProps={{
              sx: {
                color: "#E9EDEF",
                fontSize: "0.875rem",
                fontWeight: 500,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              },
            }}
            secondaryTypographyProps={{
              sx: {
                color: "#8696A0",
                fontSize: "0.75rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              },
            }}
          />
        </ListItem>
      ))}
    </List>
  );
};
