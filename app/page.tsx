"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { logout } from "@/lib/authService";
import { markAllChatsAsRead } from "@/lib/chatService";
import { subscribeToFriendRequests, FriendRequest } from "@/lib/friendService";
import { Box } from "@mui/material";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { WelcomeView } from "@/components/dashboard/WelcomeView";
import { ChatView } from "@/components/chat/ChatView";
import { AddFriendModal } from "@/components/modals/AddFriendModal";
import { CreateGroupModal } from "@/components/modals/CreateGroupModal";
import { useChatStore } from "@/store/chatStore";


const DRAWER_WIDTH = 400;

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [pendingFriendRequests, setPendingFriendRequests] = useState<FriendRequest[]>([]);
  const selectedChatId = useChatStore((state) => state.selectedChatId);
  const setSelectedChatId = useChatStore((state) => state.setSelectedChatId);

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
    setSelectedChatId(chatId);
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    try {
      await markAllChatsAsRead(user.uid);
    } catch (error) {
      console.error("Error marking all chats as read", error);
    }
  };

  // New Chat now opens Add Friend modal (users can start a chat after adding a friend)
  const handleNewChat = () => {
    setIsAddFriendOpen(true);
  };


  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#0B141A" }}>
      <DashboardSidebar 
        user={user} 
        onLogout={() => logout()} 
        onNewChat={handleNewChat}
        onAddFriend={() => setIsAddFriendOpen(true)}
        onMarkAllAsRead={handleMarkAllAsRead}
        onCreateGroup={() => setIsCreateGroupOpen(true)}
        pendingFriendRequestCount={pendingFriendRequests.length}
        width={DRAWER_WIDTH}
        onSelectChat={handleSelectChat}
        selectedChatId={selectedChatId || undefined}
      />
      
      {selectedChatId ? (
        <ChatView 
          chatId={selectedChatId} 
          onBack={() => setSelectedChatId(null)}
        />
      ) : (
        <WelcomeView onNewChat={handleNewChat} />
      )}
      
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
