"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  CircularProgress,
  Divider,
  Menu,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import {
  Close as CloseIcon,
  Note as NoteIcon,
  Send as SendIcon,
  AutoAwesome as AIIcon,
  Summarize as SummarizeIcon,
  Edit as ImproveIcon,
  Expand as ExpandIcon,
  BookmarkAdd as SaveIcon,
} from "@mui/icons-material";
import { app } from "@/lib/firebase";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import { MemoChatroomSelectModal } from "./MemoChatroomSelectModal";

export interface MemoData {
  title: string;
  content: string;
}

interface MemoModalProps {
  open: boolean;
  onClose: () => void;
  onSend: (
    memo: MemoData,
    forwardToSelf?: boolean,
    chatroomId?: string
  ) => void;
  initialTitle?: string;
  initialContent?: string;
}

// AI model for text
const ai = getAI(app, { backend: new GoogleAIBackend() });
const textModel = getGenerativeModel(ai, { model: "gemini-2.0-flash" });

export const MemoModal: React.FC<MemoModalProps> = ({
  open,
  onClose,
  onSend,
  initialTitle = "",
  initialContent = "",
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [forwardToSelf, setForwardToSelf] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnchor, setAiAnchor] = useState<HTMLElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chatroomSelectorOpen, setChatroomSelectorOpen] = useState(false);

  // Update content when initialContent/initialTitle changes (for Save to Memo)
  useEffect(() => {
    if (open) {
      setTitle(initialTitle);
      setContent(initialContent);
    }
  }, [open, initialTitle, initialContent]);

  const handleSend = () => {
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }

    if (forwardToSelf) {
      // Open chatroom selector instead of sending directly
      setChatroomSelectorOpen(true);
    } else {
      // Send to current chat without saving to my messages
      onSend({ title: title.trim(), content: content.trim() }, false);
      handleClose();
    }
  };

  const handleChatroomSelect = (chatroomId: string) => {
    // User selected a chatroom to save the memo
    onSend({ title: title.trim(), content: content.trim() }, true, chatroomId);
    setChatroomSelectorOpen(false);
    handleClose();
  };

  const handleClose = () => {
    setTitle("");
    setContent("");
    setForwardToSelf(false);
    setError(null);
    setChatroomSelectorOpen(false);
    onClose();
  };

  const handleAIAction = async (action: "summarize" | "improve" | "expand") => {
    setAiAnchor(null);
    if (!content.trim()) {
      setError("Please write some content first");
      return;
    }

    setAiLoading(true);
    setError(null);

    try {
      let prompt = "";
      switch (action) {
        case "summarize":
          prompt = `Summarize the following text concisely:\n\n${content}`;
          break;
        case "improve":
          prompt = `Improve the following text by fixing grammar, enhancing clarity, and making it more professional. Keep the same meaning:\n\n${content}`;
          break;
        case "expand":
          prompt = `Expand the following text with more details and explanations while keeping the core message:\n\n${content}`;
          break;
      }

      const result = await textModel.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      if (text) {
        setContent(text);
      }
    } catch (err) {
      console.error("AI error:", err);
      setError("Failed to process with AI. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "#1F2C34",
            color: "white",
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #2A3942",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <NoteIcon sx={{ color: "#FFA726" }} />
            <Typography variant="h6">Write Memo</Typography>
          </Box>
          <IconButton onClick={handleClose} sx={{ color: "#8696A0" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ py: 2 }}>
          {/* Title Input */}
          <TextField
            fullWidth
            label="Title"
            placeholder="Memo title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                bgcolor: "#2A3942",
                color: "white",
                "& fieldset": { borderColor: "#2A3942" },
                "&:hover fieldset": { borderColor: "#FFA726" },
              },
              "& .MuiInputLabel-root": { color: "#8696A0" },
            }}
          />

          {/* Content Input */}
          <TextField
            fullWidth
            label="Content"
            placeholder="Write your memo..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            multiline
            rows={6}
            sx={{
              mb: 1,
              "& .MuiOutlinedInput-root": {
                bgcolor: "#2A3942",
                color: "white",
                "& fieldset": { borderColor: "#2A3942" },
                "&:hover fieldset": { borderColor: "#FFA726" },
              },
              "& .MuiInputLabel-root": { color: "#8696A0" },
            }}
          />

          {/* Character Count */}
          <Typography
            variant="caption"
            sx={{ color: "#8696A0", display: "block", textAlign: "right" }}
          >
            {content.length} characters
          </Typography>

          {/* Error Message */}
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}

          <Divider sx={{ my: 2, borderColor: "#2A3942" }} />

          {/* AI Assist */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Button
              onClick={(e) => setAiAnchor(e.currentTarget)}
              disabled={aiLoading}
              startIcon={
                aiLoading ? <CircularProgress size={16} /> : <AIIcon />
              }
              sx={{
                color: "#7C4DFF",
                "&:hover": { bgcolor: "rgba(124,77,255,0.1)" },
              }}
            >
              {aiLoading ? "Processing..." : "AI Assist"}
            </Button>

            <Menu
              anchorEl={aiAnchor}
              open={Boolean(aiAnchor)}
              onClose={() => setAiAnchor(null)}
              PaperProps={{
                sx: { bgcolor: "#2A3942", color: "white" },
              }}
            >
              <MenuItem onClick={() => handleAIAction("summarize")}>
                <SummarizeIcon sx={{ mr: 1, color: "#00BCD4" }} /> Summarize
              </MenuItem>
              <MenuItem onClick={() => handleAIAction("improve")}>
                <ImproveIcon sx={{ mr: 1, color: "#4CAF50" }} /> Improve
              </MenuItem>
              <MenuItem onClick={() => handleAIAction("expand")}>
                <ExpandIcon sx={{ mr: 1, color: "#FF9800" }} /> Expand
              </MenuItem>
            </Menu>

            <FormControlLabel
              control={
                <Checkbox
                  checked={forwardToSelf}
                  onChange={(e) => setForwardToSelf(e.target.checked)}
                  sx={{
                    color: "#8696A0",
                    "&.Mui-checked": { color: "#00A884" },
                  }}
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <SaveIcon fontSize="small" sx={{ color: "#00A884" }} />
                  <Typography variant="body2" sx={{ color: "#8696A0" }}>
                    Save to My Messages
                  </Typography>
                </Box>
              }
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, borderTop: "1px solid #2A3942" }}>
          <Button onClick={handleClose} sx={{ color: "#8696A0" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSend}
            disabled={!title.trim() || !content.trim()}
            startIcon={<SendIcon />}
            sx={{
              bgcolor: "#FFA726",
              "&:hover": { bgcolor: "#FB8C00" },
              "&:disabled": { bgcolor: "#2A3942", color: "#8696A0" },
            }}
          >
            {forwardToSelf ? "Save to Folder" : "Send Memo"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Chatroom Selector Modal */}
      <MemoChatroomSelectModal
        open={chatroomSelectorOpen}
        onClose={() => setChatroomSelectorOpen(false)}
        onSelect={handleChatroomSelect}
      />
    </>
  );
};
