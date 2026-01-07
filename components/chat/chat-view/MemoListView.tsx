"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Search as SearchIcon,
  Close as CloseIcon,
  CheckBoxOutlineBlank as SelectIcon,
  SelectAll as SummarizeAllIcon,
} from "@mui/icons-material";
import { MemoListHeader } from "./MemoListHeader";
import { Message, subscribeToMessages, deleteMessage } from "@/lib/chatService";
import { MemoData } from "@/components/modals/MemoModal";
import { MemoListItem } from "./MemoListItem";
import { MemoModal } from "@/components/modals/MemoModal";
import { ForwardMessageModal } from "@/components/modals/ForwardMessageModal";
import { useAuth } from "@/context/AuthContext";
import { app } from "@/lib/firebase";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";

interface MemoListViewProps {
  chatId: string;
  onBack: () => void;
}

interface MemoItem {
  id: string;
  memo: MemoData;
  senderId: string;
  createdAt?: import("firebase/firestore").Timestamp;
}

// AI model for text
const ai = getAI(app, { backend: new GoogleAIBackend() });
const textModel = getGenerativeModel(ai, { model: "gemini-2.0-flash" });

export const MemoListView: React.FC<MemoListViewProps> = ({
  chatId,
  onBack,
}) => {
  const { user } = useAuth();
  const [memos, setMemos] = useState<MemoItem[]>([]);
  const [filteredMemos, setFilteredMemos] = useState<MemoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingMemo, setEditingMemo] = useState<{
    memo: MemoData;
    id: string;
  } | null>(null);

  // Forward modal state
  const [forwardModalOpen, setForwardModalOpen] = useState(false);
  const [forwardingMemo, setForwardingMemo] = useState<{
    memo: MemoData;
    id: string;
  } | null>(null);

  // AI Summary dialog state
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryContent, setSummaryContent] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingMemoId, setDeletingMemoId] = useState<string | null>(null);

  // Selection mode state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMemoIds, setSelectedMemoIds] = useState<Set<string>>(
    new Set()
  );

  // AI Summary choice menu state
  const [summaryChoiceAnchor, setSummaryChoiceAnchor] =
    useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!chatId) return;

    setLoading(true);
    const unsubscribe = subscribeToMessages(chatId, (messages: Message[]) => {
      // Filter messages that have memo data
      const memoMessages = messages.filter((msg) => msg.memo);

      // Map to memo items
      const items: MemoItem[] = memoMessages.map((msg) => ({
        id: msg.id,
        memo: msg.memo!,
        senderId: msg.senderId,
        createdAt: msg.createdAt,
      }));

      // Sort by createdAt descending
      items.sort(
        (a, b) =>
          (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)
      );
      setMemos(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chatId]);

  // Filter memos by search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredMemos(memos);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = memos.filter(
      (item) =>
        item.memo.title.toLowerCase().includes(term) ||
        item.memo.content.toLowerCase().includes(term)
    );
    setFilteredMemos(filtered);
  }, [memos, searchTerm]);

  const handleEdit = (memo: MemoData, id: string) => {
    setEditingMemo({ memo, id });
    setEditModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingMemoId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingMemoId) return;
    try {
      await deleteMessage(chatId, deletingMemoId);
    } catch (err) {
      console.error("Failed to delete memo:", err);
    }
    setDeleteDialogOpen(false);
    setDeletingMemoId(null);
  };

  const handleForward = (memo: MemoData) => {
    const memoItem = memos.find((m) => m.memo === memo);
    if (memoItem) {
      setForwardingMemo({ memo, id: memoItem.id });
      setForwardModalOpen(true);
    }
  };

  const handleAISummary = async (memo: MemoData) => {
    setSummaryDialogOpen(true);
    setSummaryLoading(true);
    setSummaryContent(null);
    setSummaryError(null);

    try {
      const prompt = `Please provide a concise summary of this memo:\n\nTitle: ${memo.title}\n\nContent:\n${memo.content}\n\nSummary:`;
      const result = await textModel.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      if (text) {
        setSummaryContent(text);
      } else {
        setSummaryError("No summary generated");
      }
    } catch (err) {
      console.error("AI Summary error:", err);
      setSummaryError("Failed to generate summary. Please try again.");
    } finally {
      setSummaryLoading(false);
    }
  };

  // Handle AI summary button click - show choice menu
  const handleAISummaryClick = (event: React.MouseEvent<HTMLElement>) => {
    setSummaryChoiceAnchor(event.currentTarget);
  };

  const handleCloseChoiceMenu = () => {
    setSummaryChoiceAnchor(null);
  };

  const handleChooseSelectMode = () => {
    handleCloseChoiceMenu();
    setSelectionMode(true);
  };

  const handleChooseSummarizeAll = () => {
    handleCloseChoiceMenu();
    handleSummarizeAllMemos();
  };

  // Summarize all memos
  const handleSummarizeAllMemos = async () => {
    if (memos.length === 0) return;

    setSummaryDialogOpen(true);
    setSummaryLoading(true);
    setSummaryContent(null);
    setSummaryError(null);

    try {
      // Format all memos for the prompt
      const memosText = memos
        .map(
          (item, index) =>
            `Memo ${index + 1}:\nTitle: ${item.memo.title}\nContent: ${
              item.memo.content
            }`
        )
        .join("\n\n");

      const prompt = `Please provide a comprehensive summary of all these memos. Identify common themes, key points, and any important insights across all memos:\n\n${memosText}\n\nSummary:`;
      const result = await textModel.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      if (text) {
        setSummaryContent(text);
      } else {
        setSummaryError("No summary generated");
      }
    } catch (err) {
      console.error("AI Summary error:", err);
      setSummaryError("Failed to generate summary. Please try again.");
    } finally {
      setSummaryLoading(false);
    }
  };

  // Summarize selected memos
  const handleSummarizeSelected = async () => {
    if (selectedMemoIds.size === 0) return;

    setSummaryDialogOpen(true);
    setSummaryLoading(true);
    setSummaryContent(null);
    setSummaryError(null);

    try {
      // Get selected memos
      const selectedMemos = memos.filter((item) =>
        selectedMemoIds.has(item.id)
      );

      // Format selected memos for the prompt
      const memosText = selectedMemos
        .map(
          (item, index) =>
            `Memo ${index + 1}:\nTitle: ${item.memo.title}\nContent: ${
              item.memo.content
            }`
        )
        .join("\n\n");

      const prompt = `Please provide a comprehensive summary of these selected memos. Identify common themes, key points, and any important insights:\n\n${memosText}\n\nSummary:`;
      const result = await textModel.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      if (text) {
        setSummaryContent(text);
      } else {
        setSummaryError("No summary generated");
      }
    } catch (err) {
      console.error("AI Summary error:", err);
      setSummaryError("Failed to generate summary. Please try again.");
    } finally {
      setSummaryLoading(false);
      // Exit selection mode after summarizing
      setSelectionMode(false);
      setSelectedMemoIds(new Set());
    }
  };

  // Selection mode handlers
  const handleToggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedMemoIds(new Set());
  };

  const handleToggleSelect = (memoId: string) => {
    setSelectedMemoIds((prev) => {
      const next = new Set(prev);
      if (next.has(memoId)) {
        next.delete(memoId);
      } else {
        next.add(memoId);
      }
      return next;
    });
  };

  const handleCancelSelection = () => {
    setSelectionMode(false);
    setSelectedMemoIds(new Set());
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          bgcolor: "#0B141A",
        }}
      >
        <MemoListHeader
          onBack={onBack}
          memoCount={memos.length}
          onSummarizeAll={handleAISummaryClick}
          selectionMode={selectionMode}
          selectedCount={selectedMemoIds.size}
          onToggleSelectionMode={handleToggleSelectionMode}
          onCancelSelection={handleCancelSelection}
          onSummarizeSelected={handleSummarizeSelected}
        />

        {/* Search Bar */}
        <Box sx={{ px: 2, py: 1.5, bgcolor: "#111B21" }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search memos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#8696A0" }} />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchTerm("")}
                    sx={{ color: "#8696A0" }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "#202C33",
                borderRadius: 2,
                "& fieldset": { border: "none" },
                "& input": { color: "#E9EDEF", py: 1 },
              },
            }}
          />
        </Box>

        {/* Memo List */}
        <Box sx={{ flexGrow: 1, overflowY: "auto", py: 1 }}>
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                py: 4,
              }}
            >
              <CircularProgress size={24} sx={{ color: "#00A884" }} />
            </Box>
          ) : filteredMemos.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography sx={{ color: "#8696A0" }}>
                {searchTerm
                  ? "No memos match your search"
                  : "No memos in this chat"}
              </Typography>
            </Box>
          ) : (
            filteredMemos.map((item) => (
              <MemoListItem
                key={item.id}
                id={item.id}
                memo={item.memo}
                createdAt={item.createdAt}
                isOwn={item.senderId === user?.uid}
                onEdit={selectionMode ? undefined : handleEdit}
                onDelete={selectionMode ? undefined : handleDelete}
                onForward={selectionMode ? undefined : handleForward}
                onAISummary={selectionMode ? undefined : handleAISummary}
                selectionMode={selectionMode}
                isSelected={selectedMemoIds.has(item.id)}
                onToggleSelect={() => handleToggleSelect(item.id)}
              />
            ))
          )}
        </Box>
      </Box>

      {/* AI Summary Choice Menu */}
      <Menu
        anchorEl={summaryChoiceAnchor}
        open={Boolean(summaryChoiceAnchor)}
        onClose={handleCloseChoiceMenu}
        PaperProps={{
          sx: {
            bgcolor: "#233138",
            color: "white",
            minWidth: 200,
          },
        }}
      >
        <MenuItem onClick={handleChooseSelectMode}>
          <ListItemIcon>
            <SelectIcon sx={{ color: "#7C4DFF" }} fontSize="small" />
          </ListItemIcon>
          <ListItemText>Select Memos</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleChooseSummarizeAll}>
          <ListItemIcon>
            <SummarizeAllIcon sx={{ color: "#00A884" }} fontSize="small" />
          </ListItemIcon>
          <ListItemText>Summarize All</ListItemText>
        </MenuItem>
      </Menu>

      {/* Edit Memo Modal */}
      <MemoModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingMemo(null);
        }}
        onSend={async (memo) => {
          // The editing is handled in the parent component
          // This modal is just for editing the memo content
          setEditModalOpen(false);
          setEditingMemo(null);
        }}
        initialTitle={editingMemo?.memo.title}
        initialContent={editingMemo?.memo.content}
      />

      {/* Forward Modal */}
      {forwardingMemo && (
        <ForwardMessageModal
          open={forwardModalOpen}
          onClose={() => {
            setForwardModalOpen(false);
            setForwardingMemo(null);
          }}
          messageId={forwardingMemo.id}
          chatId={chatId}
          messageText={`📝 ${forwardingMemo.memo.title}\n\n${forwardingMemo.memo.content}`}
        />
      )}

      {/* AI Summary Dialog */}
      <Dialog
        open={summaryDialogOpen}
        onClose={() => setSummaryDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { bgcolor: "#1F2C34", color: "white", borderRadius: 2 },
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: "1px solid #2A3942",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Box
            component="span"
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: "#7C4DFF",
            }}
          />
          AI Summary
        </DialogTitle>
        <DialogContent sx={{ py: 2, minHeight: 120 }}>
          {summaryLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                py: 4,
              }}
            >
              <CircularProgress size={24} sx={{ color: "#7C4DFF" }} />
              <Typography sx={{ ml: 2, color: "#8696A0" }}>
                Generating summary...
              </Typography>
            </Box>
          ) : summaryError ? (
            <Typography color="error">{summaryError}</Typography>
          ) : (
            <Typography sx={{ color: "#E9EDEF", whiteSpace: "pre-wrap" }}>
              {summaryContent}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: "1px solid #2A3942", p: 2 }}>
          <Button
            onClick={() => setSummaryDialogOpen(false)}
            sx={{ color: "#8696A0" }}
          >
            Close
          </Button>
          {summaryContent && (
            <Button
              onClick={async () => {
                await navigator.clipboard.writeText(summaryContent);
              }}
              sx={{ color: "#00A884" }}
            >
              Copy
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: { bgcolor: "#1F2C34", color: "white", borderRadius: 2 },
        }}
      >
        <DialogTitle>Delete Memo</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "#D1D7DB" }}>
            Are you sure you want to delete this memo? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ color: "#8696A0" }}
          >
            Cancel
          </Button>
          <Button onClick={confirmDelete} sx={{ color: "#F44336" }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
