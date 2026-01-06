"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, Box, Tabs, Tab } from "@mui/material";
import {
  Chat,
  subscribeToChats,
  forwardMessage,
  createPrivateChat,
} from "@/lib/chatService";
import { getUserById, UserProfile } from "@/lib/userService";
import { getFriends, Friend } from "@/lib/friendService";
import { useAuth } from "@/context/AuthContext";
import { MemoData } from "@/components/modals/MemoModal";
import {
  ForwardModalHeader,
  ForwardModalSearch,
  ForwardChatList,
  ForwardFriendList,
} from "./forward";

type ForwardTab = "chats" | "friends";

interface ForwardMessageModalProps {
  open: boolean;
  onClose: () => void;
  messageId?: string;
  chatId?: string;
  messageText?: string;
  // For memo forwarding
  memoData?: MemoData;
  onMemoForward?: (chatId: string, memo: MemoData) => Promise<void>;
}

export const ForwardMessageModal: React.FC<ForwardMessageModalProps> = ({
  open,
  onClose,
  messageId,
  chatId,
  messageText,
  memoData,
  onMemoForward,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ForwardTab>("chats");
  const [chats, setChats] = useState<Chat[]>([]);
  const [friendProfiles, setFriendProfiles] = useState<UserProfile[]>([]);
  const [chatUsers, setChatUsers] = useState<Record<string, UserProfile>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [forwarding, setForwarding] = useState(false);
  const [loading, setLoading] = useState(false);

  // Get preview text
  const previewText = memoData
    ? `📝 ${memoData.title}: ${memoData.content}`
    : messageText;

  // Subscribe to chats
  useEffect(() => {
    if (!user || !open) return;

    const unsubscribe = subscribeToChats(user.uid, (chatList) => {
      // Exclude current chat if provided
      setChats(chatId ? chatList.filter((c) => c.id !== chatId) : chatList);
    });

    return () => unsubscribe();
  }, [user, open, chatId]);

  // Load friends and their profiles
  useEffect(() => {
    if (!user || !open) return;

    const loadFriends = async () => {
      setLoading(true);
      try {
        const friendsList = await getFriends(user.uid);
        // Load UserProfile for each friend
        const profiles = await Promise.all(
          friendsList.map(async (friend: Friend) => {
            const profile = await getUserById(friend.odUserId);
            return profile;
          })
        );
        setFriendProfiles(profiles.filter((p): p is UserProfile => p !== null));
      } catch (error) {
        console.error("Error loading friends:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFriends();
  }, [user, open]);

  // Load user profiles for chats
  useEffect(() => {
    if (!user || chats.length === 0) return;

    const loadUsers = async () => {
      const userIds = chats
        .filter((c) => c.type === "private")
        .flatMap((chat) => chat.participants)
        .filter((id) => id !== user.uid);

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

  // Filter chats
  const filteredChats = chats.filter((chat) => {
    const displayName =
      chat.type === "group"
        ? chat.groupName || "Unnamed Group"
        : chatUsers[chat.participants.find((p) => p !== user?.uid) || ""]
            ?.displayName || "";
    return displayName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Filter friends
  const filteredFriends = friendProfiles.filter(
    (friend) =>
      friend.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      friend.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleForwardToChat = async (destinationChatId: string) => {
    if (!user) return;
    setForwarding(true);
    try {
      if (memoData && onMemoForward) {
        await onMemoForward(destinationChatId, memoData);
      } else if (messageId && chatId) {
        await forwardMessage(chatId, messageId, destinationChatId, user.uid);
      }
      onClose();
    } catch (error) {
      console.error("Error forwarding message:", error);
    } finally {
      setForwarding(false);
    }
  };

  const handleForwardToFriend = async (friendId: string) => {
    if (!user) return;
    setForwarding(true);
    try {
      // Check if private chat exists with this friend
      const existingChat = chats.find(
        (c) =>
          c.type === "private" &&
          c.participants.includes(friendId) &&
          c.participants.includes(user.uid)
      );

      let targetChatId: string;
      if (existingChat) {
        targetChatId = existingChat.id;
      } else {
        // Create new private chat
        targetChatId = await createPrivateChat(user.uid, friendId);
      }

      await handleForwardToChat(targetChatId);
    } catch (error) {
      console.error("Error forwarding to friend:", error);
      setForwarding(false);
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: ForwardTab) => {
    setActiveTab(newValue);
    setSearchTerm("");
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "#111B21",
          color: "#E9EDEF",
          height: "70vh",
        },
      }}
    >
      <ForwardModalHeader title="Forward message" onClose={onClose} />

      <ForwardModalSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        previewText={previewText}
      />

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "#2A3942" }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            "& .MuiTab-root": {
              color: "#8696A0",
              textTransform: "none",
              fontWeight: 500,
              "&.Mui-selected": {
                color: "#00A884",
              },
            },
            "& .MuiTabs-indicator": {
              bgcolor: "#00A884",
            },
          }}
        >
          <Tab label="Chats" value="chats" />
          <Tab label="Friends" value="friends" />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        {activeTab === "chats" ? (
          <ForwardChatList
            chats={filteredChats}
            chatUsers={chatUsers}
            currentUserId={user?.uid}
            loading={forwarding}
            onSelect={handleForwardToChat}
          />
        ) : (
          <ForwardFriendList
            friends={filteredFriends}
            loading={loading || forwarding}
            onSelect={handleForwardToFriend}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
