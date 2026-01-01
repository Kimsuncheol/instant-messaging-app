"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { logout } from "@/lib/authService";
import { Box } from "@mui/material";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { WelcomeView } from "@/components/dashboard/WelcomeView";
import { ChatView } from "@/components/chat/ChatView";
import { NewChatModal } from "@/components/modals/NewChatModal";
import { useChatStore } from "@/store/chatStore";


const DRAWER_WIDTH = 400;

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const selectedChatId = useChatStore((state) => state.selectedChatId);
  const setSelectedChatId = useChatStore((state) => state.setSelectedChatId);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) return null;

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
  };


  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#0B141A" }}>
      <DashboardSidebar 
        user={user} 
        onLogout={() => logout()} 
        onNewChat={() => setIsNewChatOpen(true)}
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
        <WelcomeView onNewChat={() => setIsNewChatOpen(true)} />
      )}
      
      <NewChatModal 
        open={isNewChatOpen} 
        onClose={() => setIsNewChatOpen(false)} 
      />
    </Box>
  );
}
