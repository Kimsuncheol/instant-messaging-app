"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { logout } from "@/lib/authService";
import { Box } from "@mui/material";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { WelcomeView } from "@/components/dashboard/WelcomeView";

const DRAWER_WIDTH = 320;

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

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
        width={DRAWER_WIDTH} 
      />
      <WelcomeView />
    </Box>
  );
}



