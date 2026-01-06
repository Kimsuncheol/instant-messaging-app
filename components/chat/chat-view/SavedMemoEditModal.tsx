"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";

interface EditingMemo {
  id: string;
  title: string;
  content: string;
}

interface SavedMemoEditModalProps {
  open: boolean;
  memo: EditingMemo | null;
  saving: boolean;
  onSave: () => void;
  onClose: () => void;
  onChange: (memo: EditingMemo) => void;
}

export const SavedMemoEditModal: React.FC<SavedMemoEditModalProps> = ({
  open,
  memo,
  saving,
  onSave,
  onClose,
  onChange,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "#1F2C34",
          color: "#E9EDEF",
        },
      }}
    >
      <DialogTitle>Edit Memo</DialogTitle>
      <DialogContent>
        <TextField
          label="Title"
          fullWidth
          value={memo?.title || ""}
          onChange={(e) => memo && onChange({ ...memo, title: e.target.value })}
          sx={{
            mt: 1,
            mb: 2,
            "& .MuiOutlinedInput-root": {
              bgcolor: "#2A3942",
              "& fieldset": { borderColor: "#2A3942" },
              "& input": { color: "#E9EDEF" },
            },
            "& .MuiInputLabel-root": { color: "#8696A0" },
          }}
        />
        <TextField
          label="Content"
          fullWidth
          multiline
          rows={6}
          value={memo?.content || ""}
          onChange={(e) =>
            memo && onChange({ ...memo, content: e.target.value })
          }
          sx={{
            "& .MuiOutlinedInput-root": {
              bgcolor: "#2A3942",
              "& fieldset": { borderColor: "#2A3942" },
              "& textarea": { color: "#E9EDEF" },
            },
            "& .MuiInputLabel-root": { color: "#8696A0" },
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ color: "#8696A0" }}>
          Cancel
        </Button>
        <Button
          onClick={onSave}
          disabled={saving || !memo?.title.trim()}
          sx={{ color: "#00A884" }}
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
