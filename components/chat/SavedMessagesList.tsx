"use client";

import React, { useState } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Add as AddIcon, PushPin as PinIcon } from "@mui/icons-material";
import { useMemoChatroom } from "@/context/MemoChatroomContext";
import { MemoChatroomContextMenu } from "./MemoChatroomContextMenu";
import { ChatroomIcon } from "./ChatroomIcon";
import { MemoChatroom } from "@/lib/memoChatroomService";

interface SavedMessagesListProps {
  onSelectChatroom: (chatroomId: string) => void;
  selectedChatroomId?: string;
}

export const SavedMessagesList: React.FC<SavedMessagesListProps> = ({
  onSelectChatroom,
  selectedChatroomId,
}) => {
  const { chatrooms, loading, createNewChatroom, isChatroomPinned } =
    useMemoChatroom();

  // Context menu state
  const [contextMenuAnchor, setContextMenuAnchor] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [contextMenuChatroom, setContextMenuChatroom] =
    useState<MemoChatroom | null>(null);

  const handleCreateNew = async () => {
    try {
      const newId = await createNewChatroom();
      onSelectChatroom(newId);
    } catch (err) {
      console.error("Failed to create chatroom:", err);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, chatroom: MemoChatroom) => {
    e.preventDefault();
    setContextMenuAnchor({ top: e.clientY, left: e.clientX });
    setContextMenuChatroom(chatroom);
  };

  const handleCloseContextMenu = () => {
    setContextMenuAnchor(null);
    setContextMenuChatroom(null);
  };

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

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: "#111B21",
      }}
    >
      <List sx={{ flexGrow: 1, overflowY: "auto", py: 0 }}>
        {chatrooms.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4, px: 3 }}>
            <Typography sx={{ color: "#8696A0", fontSize: "0.9375rem" }}>
              No saved message folders yet.
              <br />
              Click below to create one.
            </Typography>
          </Box>
        ) : (
          chatrooms.map((chatroom) => {
            const isPinned = isChatroomPinned(chatroom);
            return (
              <ListItem key={chatroom.id} disablePadding>
                <ListItemButton
                  selected={selectedChatroomId === chatroom.id}
                  onClick={() => onSelectChatroom(chatroom.id)}
                  onContextMenu={(e) => handleContextMenu(e, chatroom)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    "&.Mui-selected": {
                      bgcolor: "#2A3942",
                    },
                    "&:hover": {
                      bgcolor: "#202C33",
                    },
                    borderBottom: "1px solid #222D34",
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
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
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
                      sx: { color: "#E9EDEF", fontSize: "0.9375rem" },
                    }}
                    secondaryTypographyProps={{
                      sx: { color: "#8696A0", fontSize: "0.8125rem" },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })
        )}

        {/* Add New Chatroom Button */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleCreateNew}
            sx={{
              py: 1.5,
              px: 2,
              "&:hover": {
                bgcolor: "#202C33",
              },
              borderBottom: "1px solid #222D34",
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <AddIcon sx={{ color: "#00A884" }} />
            </ListItemIcon>
            <ListItemText
              primary="Add new memo folder"
              primaryTypographyProps={{
                sx: { color: "#00A884", fontSize: "0.9375rem" },
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>

      {/* Context Menu */}
      <MemoChatroomContextMenu
        chatroom={contextMenuChatroom}
        anchorPosition={contextMenuAnchor}
        onClose={handleCloseContextMenu}
      />
    </Box>
  );
};
