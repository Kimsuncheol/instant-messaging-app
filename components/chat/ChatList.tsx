"use client";

import React, { useEffect, useState, useRef } from "react";
import { 
  Box, 
  List, 
  ListItemButton, 
  ListItemAvatar, 
  ListItemText, 
  Avatar, 
  Typography,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { Chat, subscribeToChats, getUnreadCount, renameChat } from "@/lib/chatService";
import { Timestamp } from "firebase/firestore";
import { getUserById, UserProfile } from "@/lib/userService";

import { useAuth } from "@/context/AuthContext";
import { ActiveStatusBadge } from "@/components/shared/ActiveStatusBadge";
import { subscribeToMultiplePresences, UserPresence } from "@/lib/presenceService";
import { subscribeToFriends, Friend } from "@/lib/friendService";
import { ChatContextMenu } from "./ChatContextMenu";

type TabFilter = "all" | "unread" | "friends" | "groups";

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
  const [friends, setFriends] = useState<Friend[]>([]);
  
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

  // Subscribe to friends list
  useEffect(() => {
    if (!user) return;
    return subscribeToFriends(user.uid, setFriends);
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

  const formatTime = (timestamp: Timestamp | null) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  // Get friend user IDs for filtering
  const friendUserIds = friends.map(f => f.odUserId);

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
      case "friends": {
        // Show only chats with friends
        const otherUserId = chat.participants.find(p => p !== user?.uid);
        return otherUserId && friendUserIds.includes(otherUserId);
      }
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

  const getTabStyle = (tab: TabFilter) => ({
    px: 2,
    py: 0.5,
    bgcolor: activeTab === tab ? "#00A884" : "#202C33",
    color: activeTab === tab ? "#111B21" : "#8696A0",
    borderRadius: "16px",
    fontSize: "0.8125rem",
    fontWeight: activeTab === tab ? 500 : 400,
    cursor: "pointer",
    "&:hover": activeTab === tab ? {} : { bgcolor: "#2A3942" },
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: "#111B21" }}>
      {/* Search Bar */}
      <Box sx={{ px: 1.5, py: 1 }}>
        <TextField
          fullWidth
          placeholder="Search or start new chat"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#8696A0", fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              bgcolor: "#202C33",
              borderRadius: "8px",
              "& fieldset": { border: "none" },
              "& input": {
                color: "#E9EDEF",
                fontSize: "0.875rem",
                py: 1,
                "&::placeholder": {
                  color: "#8696A0",
                  opacity: 1,
                },
              },
            },
          }}
        />
      </Box>

      {/* Filter Tabs */}
      <Box sx={{ px: 2, py: 1, display: "flex", gap: 1 }}>
        <Box sx={getTabStyle("all")} onClick={() => setActiveTab("all")}>
          All
        </Box>
        <Box sx={getTabStyle("unread")} onClick={() => setActiveTab("unread")}>
          Unread
        </Box>
        <Box sx={getTabStyle("friends")} onClick={() => setActiveTab("friends")}>
          Friends
        </Box>
        <Box sx={getTabStyle("groups")} onClick={() => setActiveTab("groups")}>
          Groups
        </Box>
      </Box>


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
            const otherUser = !isGroup ? getOtherUser(chat) : undefined;
            const otherUserId = !isGroup ? chat.participants.find(p => p !== user?.uid) : undefined;
            
            // For groups, display group info
            const displayName = isGroup 
              ? (chat.groupName || "Unnamed Group") 
              : (otherUser?.displayName || "Unknown User");
            const displayPhoto = isGroup 
              ? chat.groupPhotoURL 
              : otherUser?.photoURL;
            const displayInitial = isGroup 
              ? (chat.groupName?.[0] || "G") 
              : otherUser?.displayName?.[0];
            
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

            // Show pin icon if chat is pinned (for future UI enhancement)
            
            return (
              <ListItemButton
                key={chat.id}
                selected={selectedChatId === chat.id}
                onClick={() => onSelectChat(chat.id)}
                onContextMenu={handleContextMenu}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                sx={{
                  px: 2,
                  py: 1.5,
                  borderBottom: "1px solid #222D34",
                  "&:hover": { bgcolor: "#202C33" },
                  "&.Mui-selected": { 
                    bgcolor: "#2A3942",
                    "&:hover": { bgcolor: "#2A3942" },
                  },
                }}
              >
                <ListItemAvatar>
                  {isGroup ? (
                    <Avatar
                      src={displayPhoto}
                      sx={{ width: 50, height: 50, bgcolor: "#00A884" }}
                    >
                      {displayInitial}
                    </Avatar>
                  ) : (
                    <ActiveStatusBadge presence={otherUserId ? presences[otherUserId] : undefined}>
                      <Avatar
                        src={displayPhoto}
                        sx={{ width: 50, height: 50, bgcolor: "#6B7C85" }}
                      >
                        {displayInitial}
                      </Avatar>
                    </ActiveStatusBadge>
                  )}
                </ListItemAvatar>
                <ListItemText
                  sx={{ ml: 1 }}
                  primary={
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography sx={{ color: "#E9EDEF", fontWeight: 400, fontSize: "1rem" }}>
                        {displayName}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography sx={{ color: user && getUnreadCount(chat, user.uid) > 0 ? "#00A884" : "#8696A0", fontSize: "0.75rem" }}>
                          {formatTime(chat.lastMessageAt)}
                        </Typography>
                      </Box>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography
                        component="span"
                        sx={{
                          color: "#8696A0",
                          fontSize: "0.875rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          flex: 1,
                        }}
                      >
                        {isGroup && chat.participants.length > 0 
                          ? `${chat.participants.length} members` 
                          : ""} {chat.lastMessage || (isGroup ? "" : "No messages yet")}
                      </Typography>
                      {user && getUnreadCount(chat, user.uid) > 0 && (
                        <Box
                          sx={{
                            minWidth: 20,
                            height: 20,
                            borderRadius: "10px",
                            bgcolor: "#00A884",
                            color: "#111B21",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            px: 0.5,
                            ml: 1,
                          }}
                        >
                          {getUnreadCount(chat, user.uid)}
                        </Box>
                      )}
                    </Box>
                  }
                />
              </ListItemButton>
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
