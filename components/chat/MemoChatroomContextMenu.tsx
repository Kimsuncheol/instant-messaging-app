"use client";

import React, { useState } from "react";
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PushPin as PinIcon,
  PushPinOutlined as UnpinIcon,
  Palette as PaletteIcon,
} from "@mui/icons-material";
import { MemoChatroom, IconShape } from "@/lib/memoChatroomService";
import { useMemoChatroom } from "@/context/MemoChatroomContext";
import { IconPickerDialog } from "./IconPickerDialog";

interface MemoChatroomContextMenuProps {
  chatroom: MemoChatroom | null;
  anchorPosition: { top: number; left: number } | null;
  onClose: () => void;
}

export const MemoChatroomContextMenu: React.FC<
  MemoChatroomContextMenuProps
> = ({ chatroom, anchorPosition, onClose }) => {
  const {
    deleteChatroom,
    renameChatroom,
    pinChatroom,
    unpinChatroom,
    isChatroomPinned,
    updateChatroomIcon,
  } = useMemoChatroom();

  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  if (!chatroom) return null;

  const isPinned = isChatroomPinned(chatroom);

  const handlePin = async () => {
    try {
      if (isPinned) {
        await unpinChatroom(chatroom.id);
      } else {
        await pinChatroom(chatroom.id);
      }
    } catch (error) {
      console.error("Error toggling pin:", error);
    }
    onClose();
  };

  const handleRenameClick = () => {
    setNewName(chatroom.name);
    setRenameDialogOpen(true);
    onClose();
  };

  const handleRenameSubmit = async () => {
    if (newName.trim() && chatroom) {
      try {
        await renameChatroom(chatroom.id, newName.trim());
      } catch (error) {
        console.error("Error renaming chatroom:", error);
      }
    }
    setRenameDialogOpen(false);
    setNewName("");
  };

  const handleDelete = async () => {
    try {
      await deleteChatroom(chatroom.id);
    } catch (error) {
      console.error("Error deleting chatroom:", error);
    }
    onClose();
  };

  const handleChangeIconClick = () => {
    setIconPickerOpen(true);
    onClose();
  };

  const handleIconSave = async (color: string, shape: IconShape) => {
    if (!chatroom) return;
    try {
      await updateChatroomIcon(chatroom.id, {
        iconColor: color,
        iconShape: shape,
      });
    } catch (error) {
      console.error("Error updating icon:", error);
    }
  };

  return (
    <>
      <Menu
        open={Boolean(anchorPosition)}
        onClose={onClose}
        anchorReference="anchorPosition"
        anchorPosition={anchorPosition || undefined}
        PaperProps={{
          sx: {
            bgcolor: "#233138",
            color: "#E9EDEF",
            minWidth: 180,
            "& .MuiMenuItem-root": {
              py: 1.5,
              "&:hover": {
                bgcolor: "#182229",
              },
            },
          },
        }}
      >
        <MenuItem onClick={handlePin}>
          <ListItemIcon>
            {isPinned ? (
              <UnpinIcon sx={{ color: "#AEBAC1" }} />
            ) : (
              <PinIcon sx={{ color: "#AEBAC1" }} />
            )}
          </ListItemIcon>
          <ListItemText>{isPinned ? "Unpin" : "Pin to top"}</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleRenameClick}>
          <ListItemIcon>
            <EditIcon sx={{ color: "#AEBAC1" }} />
          </ListItemIcon>
          <ListItemText>Rename</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleChangeIconClick}>
          <ListItemIcon>
            <PaletteIcon sx={{ color: "#AEBAC1" }} />
          </ListItemIcon>
          <ListItemText>Change Icon</ListItemText>
        </MenuItem>

        <Divider sx={{ bgcolor: "#2A3942" }} />

        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon sx={{ color: "#F15C6D" }} />
          </ListItemIcon>
          <ListItemText sx={{ color: "#F15C6D" }}>Delete folder</ListItemText>
        </MenuItem>
      </Menu>

      {/* Rename Dialog */}
      <Dialog
        open={renameDialogOpen}
        onClose={() => setRenameDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: "#233138",
            color: "#E9EDEF",
            minWidth: 300,
          },
        }}
      >
        <DialogTitle>Rename Folder</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleRenameSubmit();
              }
            }}
            placeholder="Enter folder name"
            autoFocus
            sx={{
              mt: 1,
              "& .MuiOutlinedInput-root": {
                bgcolor: "#2A3942",
                "& fieldset": { borderColor: "#2A3942" },
                "& input": { color: "#E9EDEF" },
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setRenameDialogOpen(false)}
            sx={{ color: "#8696A0" }}
          >
            Cancel
          </Button>
          <Button onClick={handleRenameSubmit} sx={{ color: "#00A884" }}>
            Rename
          </Button>
        </DialogActions>
      </Dialog>

      {/* Icon Picker Dialog */}
      <IconPickerDialog
        open={iconPickerOpen}
        onClose={() => setIconPickerOpen(false)}
        onSave={handleIconSave}
        currentColor={chatroom?.iconColor}
        currentShape={chatroom?.iconShape}
      />
    </>
  );
};
