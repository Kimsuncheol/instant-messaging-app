"use client";

import React, { useEffect, useState, useRef } from "react";
import { 
  Box, 
  List, 
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField
} from "@mui/material";
import { Chat, subscribeToChats, getUnreadCount, renameChat } from "@/lib/chatService";
import { getUserById, UserProfile } from "@/lib/userService";
import { useAuth } from "@/context/AuthContext";
import { subscribeToMultiplePresences, UserPresence } from "@/lib/presenceService";
import { ChatContextMenu } from "./ChatContextMenu";

// Sub-components
import { ChatSearchBar } from "./ChatSearchBar";
import { ChatFilterTabs, TabFilter } from "./ChatFilterTabs";
import { ChatListItem } from "./ChatListItem";

interface ChatListProps {
  onSelectChat: (chatId: string) => void;
  selectedChatId?: string;
}

export const ChatList: React.FC<ChatListProps> = ({ onSelectChat, selectedChatId }) => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [chatUsers, setChatUsers] = useState<Record<string, UserProfile>>({});
  const [presences, setPresences] = useState<Record<string, UserPresence>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  
  // Context menu state
  const [contextMenuAnchor, setContextMenuAnchor] = useState<{ top: number; left: number } | null>(null);
  const [contextMenuChat, setContextMenuChat] = useState<Chat | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Rename dialog state
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  // Subscribe to chats
  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = subscribeToChats(user.uid, (chatList) => {
      setChats(chatList);
    });
    
    return () => unsubscribe();
  }, [user]);

  // Load user profiles for each chat
  useEffect(() => {
    if (!user || chats.length === 0) return;

    const loadUsers = async () => {
      const userIds = chats
        .flatMap(chat => chat.participants)
        .filter(id => id !== user.uid);
      
      const uniqueIds = [...new Set(userIds)];
      const users: Record<string, UserProfile> = {};
      
      await Promise.all(
        uniqueIds.map(async (id) => {
          const userData = await getUserById(id);
          if (userData) users[id] = userData;
        })
      );
      
      setChatUsers(users);
    };
    
    loadUsers();
  }, [chats, user]);

  // Subscribe to presences
  useEffect(() => {
    const userIds = Object.keys(chatUsers);
    if (userIds.length === 0) return;

    return subscribeToMultiplePresences(userIds, setPresences);
  }, [chatUsers]);

  const getOtherUser = (chat: Chat): UserProfile | undefined => {
    if (!user) return undefined;
    const otherUserId = chat.participants.find(p => p !== user.uid);
    return otherUserId ? chatUsers[otherUserId] : undefined;
  };

  // Filter chats based on search term and active tab
  const filteredChats = chats.filter(chat => {
    // Search filter
    if (searchTerm.trim()) {
      const otherUser = getOtherUser(chat);
      const matchesSearch = otherUser?.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             otherUser?.email.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;
    }

    // Tab filter
    switch (activeTab) {
      case "groups":
        return chat.type === "group";
      case "unread": {
        // Show only chats with unread messages
        const unreadCount = user ? getUnreadCount(chat, user.uid) : 0;
        return unreadCount > 0;
      }
      case "all":
      default:
        return true;
    }
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: "#111B21" }}>
      {/* Search Bar */}
      <ChatSearchBar 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
      />

      {/* Filter Tabs */}
      <ChatFilterTabs 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {/* Chat List */}
      <List sx={{ flexGrow: 1, overflowY: "auto", py: 0 }}>
        {filteredChats.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4, px: 3 }}>
            <Typography sx={{ color: "#8696A0", fontSize: "0.9375rem" }}>
              No conversations yet.
              <br />
              Start a new chat to begin messaging.
            </Typography>
          </Box>
        ) : (
          filteredChats.map((chat) => {
            const isGroup = chat.type === "group";
            const otherUserId = !isGroup ? chat.participants.find(p => p !== user?.uid) : undefined;
            
            const handleContextMenu = (e: React.MouseEvent) => {
              e.preventDefault();
              setContextMenuAnchor({ top: e.clientY, left: e.clientX });
              setContextMenuChat(chat);
            };

            const handleTouchStart = () => {
              longPressTimer.current = setTimeout(() => {
                setContextMenuChat(chat);
                setContextMenuAnchor({ top: 200, left: 100 });
              }, 500);
            };

            const handleTouchEnd = () => {
              if (longPressTimer.current) {
                clearTimeout(longPressTimer.current);
              }
            };

            return (
              <ChatListItem
                key={chat.id}
                chat={chat}
                selected={selectedChatId === chat.id}
                onSelect={onSelectChat}
                user={user}
                getOtherUser={getOtherUser}
                presence={otherUserId ? presences[otherUserId] : undefined}
                onContextMenu={handleContextMenu}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              />
            );
          })
        )}
      </List>

      {/* Context Menu */}
      <ChatContextMenu
        chat={contextMenuChat}
        anchorPosition={contextMenuAnchor}
        onClose={() => {
          setContextMenuAnchor(null);
          setContextMenuChat(null);
        }}
        userId={user?.uid || ""}
        onRenameClick={() => {
          if (contextMenuChat) {
            setNewGroupName(contextMenuChat.groupName || "");
            setRenameDialogOpen(true);
          }
        }}
        onLeaveSuccess={() => {
          // Chat removed, no action needed
        }}
      />

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
        <DialogTitle>Rename Group</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Enter group name"
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
          <Button
            onClick={async () => {
              if (contextMenuChat && newGroupName.trim()) {
                await renameChat(contextMenuChat.id, newGroupName.trim());
                setRenameDialogOpen(false);
                setContextMenuChat(null);
              }
            }}
            sx={{ color: "#00A884" }}
          >
            Rename
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
