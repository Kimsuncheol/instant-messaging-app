"use client";

import React, { useState } from "react";
import { Box, Divider } from "@mui/material";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { useRouter } from "next/navigation";
import { ProfileHeader } from "./_components/ProfileHeader";
import { ProfileAvatar } from "./_components/ProfileAvatar";
import { ProfileNameSection } from "./_components/ProfileNameSection";
import { ProfileAboutSection } from "./_components/ProfileAboutSection";
import { ProfileEmailSection } from "./_components/ProfileEmailSection";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { resolvedMode } = useTheme();
  
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [about, setAbout] = useState("Hey there! I am using WhatsApp.");

  if (loading) return <LoadingScreen />;
  if (!user) {
    router.push("/login");
    return null;
  }

  const isDark = resolvedMode === "dark";
  const bgColor = isDark ? "#111B21" : "#FFFFFF";
  const headerBg = isDark ? "#202C33" : "#008069";
  const textPrimary = isDark ? "#E9EDEF" : "#111B21";
  const textSecondary = isDark ? "#8696A0" : "#667781";
  const dividerColor = isDark ? "#2A3942" : "#E9EDEF";
  const inputBg = isDark ? "#2A3942" : "#F0F2F5";

  const handleSaveName = async (newName: string) => {
    setDisplayName(newName);
    // TODO: Update in Firebase
    console.log("Saving name:", newName);
  };

  const handleSaveAbout = async (newAbout: string) => {
    setAbout(newAbout);
    // TODO: Update in Firebase
    console.log("Saving about:", newAbout);
  };

  // get email
  const email = user?.email;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: bgColor }}>
      <ProfileHeader headerBg={headerBg} />
      
      <ProfileAvatar
        photoURL={user.photoURL}
        displayName={user.displayName}
        isDark={isDark}
      />
      
      <Divider sx={{ borderColor: dividerColor }} />
      
      <ProfileNameSection
        displayName={displayName || user?.displayName || "User"}
        onSave={handleSaveName}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
        inputBg={inputBg}
      />
      
      <Divider sx={{ borderColor: dividerColor }} />
      
      <ProfileEmailSection
        email={email || ""}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
      />
      
      <Divider sx={{ borderColor: dividerColor }} />
      
      <ProfileAboutSection
        about={about}
        onSave={handleSaveAbout}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
        inputBg={inputBg}
      />
    </Box>
  );
}
