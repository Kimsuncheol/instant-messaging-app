"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
} from "@mui/material";

interface LeaveGroupDialogProps {
  open: boolean;
  groupName: string;
  isLeaving: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const LeaveGroupDialog: React.FC<LeaveGroupDialogProps> = ({
  open,
  groupName,
  isLeaving,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog
      open={open}
      onClose={() => !isLeaving && onClose()}
      PaperProps={{
        sx: {
          bgcolor: "#202C33",
          color: "#E9EDEF",
        },
      }}
    >
      <DialogTitle sx={{ color: "#E9EDEF" }}>Leave Group?</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: "#8696A0" }}>
          Are you sure you want to leave &quot;{groupName}&quot;? You will no longer receive messages from this group.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          disabled={isLeaving}
          sx={{ color: "#8696A0" }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isLeaving}
          sx={{
            color: "#F15C6D",
            "&:hover": { bgcolor: "rgba(241, 92, 109, 0.08)" },
          }}
        >
          {isLeaving ? "Leaving..." : "Leave"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
