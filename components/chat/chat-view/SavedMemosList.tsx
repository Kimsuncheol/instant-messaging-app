"use client";

import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  CircularProgress,
  Checkbox,
} from "@mui/material";
import { MemoMessage } from "./MemoMessage";
import { MemoData } from "@/components/modals/MemoModal";
import { SavedMemo } from "@/lib/memoChatroomService";

interface SavedMemosListProps {
  loading: boolean;
  memos: SavedMemo[];
  onEdit: (memo: MemoData, memoId: string) => void;
  onDelete: (memoId: string) => void;
  onForward?: (memo: MemoData) => void;
  selectionMode?: boolean;
  selectedMemoIds?: Set<string>;
  onToggleSelect?: (memoId: string) => void;
}

export const SavedMemosList: React.FC<SavedMemosListProps> = ({
  loading,
  memos,
  onEdit,
  onDelete,
  onForward,
  selectionMode = false,
  selectedMemoIds = new Set(),
  onToggleSelect,
}) => {
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          py: 4,
        }}
      >
        <CircularProgress size={24} sx={{ color: "#00A884" }} />
      </Box>
    );
  }

  if (memos.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography sx={{ color: "#8696A0" }}>
          No saved memos yet.
          <br />
          Save a memo from any chat to see it here.
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ py: 0 }}>
      {memos.map((memo) => (
        <ListItem
          key={memo.id}
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "flex-end",
            py: 1,
            gap: 1,
          }}
        >
          {selectionMode && (
            <Checkbox
              checked={selectedMemoIds.has(memo.id)}
              onChange={() => onToggleSelect?.(memo.id)}
              sx={{
                color: "#8696A0",
                "&.Mui-checked": { color: "#00A884" },
                mt: 0.5,
              }}
            />
          )}
          <MemoMessage
            memo={{ title: memo.title, content: memo.content }}
            messageId={memo.id}
            isOwn={true}
            onEdit={(memoData) => onEdit(memoData, memo.id)}
            onDelete={() => onDelete(memo.id)}
            onForward={onForward}
            createdAt={memo.savedAt}
          />
        </ListItem>
      ))}
    </List>
  );
};
