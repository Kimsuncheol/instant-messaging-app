"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { logout } from "@/lib/authService";
import { subscribeToFriendRequests, FriendRequest } from "@/lib/friendService";
import { Box } from "@mui/material";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { FriendsPanel } from "@/components/dashboard/FriendsPanel";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { AddFriendModal } from "@/components/modals/AddFriendModal";
import { CreateGroupModal } from "@/components/modals/CreateGroupModal";
import { useChatStore } from "@/store/chatStore";
import { useUiStore } from "@/store/uiStore";
import { useDevice } from "@/context/DeviceContext";

const FRIENDS_PANEL_WIDTH = 300;

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [pendingFriendRequests, setPendingFriendRequests] = useState<FriendRequest[]>([]);
  const selectedChatId = useChatStore((state) => state.selectedChatId);
  const setSelectedChatId = useChatStore((state) => state.setSelectedChatId);
  const { deviceInfo } = useDevice();
  const activeMobileTab = useUiStore((state) => state.activeMobileTab);
  const setActiveMobileTab = useUiStore((state) => state.setActiveMobileTab);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Subscribe to friend requests
  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = subscribeToFriendRequests(user.uid, (requests) => {
      setPendingFriendRequests(requests);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) return null;

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId || null);
    if (chatId) {
      setActiveMobileTab('chats');
    }
  };

  // Determine visibility
  const showFriendsPanel = !deviceInfo.isMobile || (!selectedChatId && activeMobileTab === 'friends');
  const showChatPanel = !deviceInfo.isMobile || selectedChatId || activeMobileTab === 'chats';

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#0B141A" }}>
      {/* Left Panel: Friends */}
      {showFriendsPanel && (
        <FriendsPanel
          user={user}
          width={deviceInfo.isMobile ? "100%" : FRIENDS_PANEL_WIDTH}
          onAddFriend={() => setIsAddFriendOpen(true)}
          onCreateGroup={() => setIsCreateGroupOpen(true)}
          onSelectChat={handleSelectChat}
          pendingFriendRequestCount={pendingFriendRequests.length}
        />
      )}
      
      {/* Right Panel: ChatList or ChatView */}
      {showChatPanel && (
        <ChatPanel
          selectedChatId={selectedChatId}
          onSelectChat={handleSelectChat}
        />
      )}
      
      {/* Modals */}
      <AddFriendModal
        open={isAddFriendOpen}
        onClose={() => setIsAddFriendOpen(false)}
      />
      
      <CreateGroupModal
        open={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
      />
    </Box>
  );
}
