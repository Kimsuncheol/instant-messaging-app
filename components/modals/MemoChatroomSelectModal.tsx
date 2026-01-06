"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  Add as AddIcon,
  BookmarkAdd as SaveIcon,
  PushPin as PinIcon,
} from "@mui/icons-material";
import { useMemoChatroom } from "@/context/MemoChatroomContext";
import { MemoChatroomContextMenu } from "@/components/chat/MemoChatroomContextMenu";
import { ChatroomIcon } from "@/components/chat/ChatroomIcon";
import { MemoChatroom } from "@/lib/memoChatroomService";

interface MemoChatroomSelectModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (chatroomId: string) => void;
}

export const MemoChatroomSelectModal: React.FC<
  MemoChatroomSelectModalProps
> = ({ open, onClose, onSelect }) => {
  const { chatrooms, loading, createNewChatroom, isChatroomPinned } =
    useMemoChatroom();
  const [creatingNew, setCreatingNew] = useState(false);

  // Context menu state
  const [contextMenuAnchor, setContextMenuAnchor] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [contextMenuChatroom, setContextMenuChatroom] =
    useState<MemoChatroom | null>(null);

  const handleQuickCreate = async () => {
    setCreatingNew(true);
    try {
      const newId = await createNewChatroom();
      onSelect(newId);
    } catch (err) {
      console.error("Failed to create chatroom:", err);
    } finally {
      setCreatingNew(false);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, chatroom: MemoChatroom) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuAnchor({ top: e.clientY, left: e.clientX });
    setContextMenuChatroom(chatroom);
  };

  const handleCloseContextMenu = () => {
    setContextMenuAnchor(null);
    setContextMenuChatroom(null);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xs"
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
            <SaveIcon sx={{ color: "#00A884" }} />
            <span>Select Folder</span>
          </Box>
          <IconButton onClick={onClose} sx={{ color: "#8696A0" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {loading ? (
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
          ) : (
            <List sx={{ py: 0 }}>
              {chatrooms.map((chatroom) => {
                const isPinned = isChatroomPinned(chatroom);
                return (
                  <ListItem key={chatroom.id} disablePadding>
                    <ListItemButton
                      onClick={() => onSelect(chatroom.id)}
                      onContextMenu={(e) => handleContextMenu(e, chatroom)}
                      sx={{
                        py: 1.5,
                        "&:hover": {
                          bgcolor: "#2A3942",
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <ChatroomIcon
                          shape={chatroom.iconShape}
                          color={chatroom.iconColor}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            {chatroom.name}
                            {isPinned && (
                              <PinIcon
                                sx={{
                                  fontSize: 14,
                                  color: "#00A884",
                                  transform: "rotate(45deg)",
                                }}
                              />
                            )}
                          </Box>
                        }
                        secondary={`${chatroom.messageCount || 0} memos`}
                        primaryTypographyProps={{
                          sx: { color: "#E9EDEF" },
                        }}
                        secondaryTypographyProps={{
                          sx: { color: "#8696A0", fontSize: "0.8125rem" },
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}

              {/* Add New Option */}
              <ListItem disablePadding>
                <ListItemButton
                  onClick={handleQuickCreate}
                  disabled={creatingNew}
                  sx={{
                    py: 1.5,
                    "&:hover": {
                      bgcolor: "#2A3942",
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {creatingNew ? (
                      <CircularProgress size={20} sx={{ color: "#00A884" }} />
                    ) : (
                      <AddIcon sx={{ color: "#00A884" }} />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={creatingNew ? "Creating..." : "Create new folder"}
                    primaryTypographyProps={{
                      sx: { color: "#00A884" },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          )}
        </DialogContent>
      </Dialog>

      {/* Context Menu */}
      <MemoChatroomContextMenu
        chatroom={contextMenuChatroom}
        anchorPosition={contextMenuAnchor}
        onClose={handleCloseContextMenu}
      />
    </>
  );
};
