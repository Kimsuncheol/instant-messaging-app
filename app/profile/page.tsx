"use client";

import React, { useState } from "react";
import { Box, Divider } from "@mui/material";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { ProfileHeader } from "./_components/ProfileHeader";
import { ProfileAvatar } from "./_components/ProfileAvatar";
import { ProfileNameSection } from "./_components/ProfileNameSection";
import { ProfileAboutSection } from "./_components/ProfileAboutSection";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { resolvedMode } = useTheme();
  const [displayName, setDisplayName] = useState("");
  const [about, setAbout] = useState("Hey there! I am using WhatsApp.");

  const isDark = resolvedMode === "dark";
  const bgColor = isDark ? "#111B21" : "#FFFFFF";
  const headerBg = isDark ? "#202C33" : "#008069";
  const textPrimary = isDark ? "#E9EDEF" : "#111B21";
  const textSecondary = isDark ? "#8696A0" : "#667781";
  const dividerColor = isDark ? "#2A3942" : "#E9EDEF";
  const inputBg = isDark ? "#2A3942" : "#F0F2F5";

  React.useEffect(() => {
    if (user?.displayName) {
      setDisplayName(user.displayName);
    }
  }, [user]);

  const handleSaveName = (name: string) => {
    setDisplayName(name);
    // TODO: Save to database
  };

  const handleSaveAbout = (newAbout: string) => {
    setAbout(newAbout);
    // TODO: Save to database
  };

  if (loading) return <LoadingScreen />;
  if (!user) {
    router.push("/login");
    return null;
  }

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
