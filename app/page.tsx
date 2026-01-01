"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { logout } from "@/lib/authService";
import { Box } from "@mui/material";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { WelcomeView } from "@/components/dashboard/WelcomeView";
import { NewChatModal } from "@/components/modals/NewChatModal";

const DRAWER_WIDTH = 320;

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) return null;

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
      <DashboardSidebar 
        user={user} 
        onLogout={() => logout()} 
        onNewChat={() => setIsNewChatOpen(true)}
        width={DRAWER_WIDTH} 
      />
      <WelcomeView onNewChat={() => setIsNewChatOpen(true)} />
      
      <NewChatModal 
        open={isNewChatOpen} 
        onClose={() => setIsNewChatOpen(false)} 
      />
    </Box>
  );
}




