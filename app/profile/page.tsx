"use client";

import React, { useState } from "react";
import { Box, Divider, Button, Typography, Alert } from "@mui/material";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { useRouter } from "next/navigation";
import { ProfileHeader } from "./_components/ProfileHeader";
import { ProfileAvatar } from "./_components/ProfileAvatar";
import { ProfileNameSection } from "./_components/ProfileNameSection";
import { ProfileAboutSection } from "./_components/ProfileAboutSection";
import { ProfileEmailSection } from "./_components/ProfileEmailSection";
import { ProfileContactSection } from "./_components/ProfileContactSection";
import { ConfirmPasswordModal } from "@/components/modals/ConfirmPasswordModal";
import { EmailAuthProvider, reauthenticateWithCredential, deleteUser } from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DeleteForever as DeleteIcon, Logout as LogoutIcon } from "@mui/icons-material";
import { logout } from "@/lib/authService";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { resolvedMode } = useTheme();
  
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [about, setAbout] = useState("Hey there! I am using WhatsApp.");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState("");

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

  const handleSavePhone = async (newPhone: string) => {
    setPhoneNumber(newPhone);
    // TODO: Update in Firebase
    console.log("Saving phone:", newPhone);
  };

  // get email
  const email = user?.email;

  const handleDeleteAccount = async (password: string) => {
    if (!user || !user.email) {
      throw new Error("User not authenticated");
    }

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);

      // Delete user document from Firestore
      const userDocRef = doc(db, "users", user.uid);
      await deleteDoc(userDocRef);

      // Delete user from Firebase Auth
      await deleteUser(user);

      // Redirect to signup
      router.push("/signup?deleted=true");
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes("wrong-password") || error.message.includes("invalid-credential")) {
          throw new Error("Incorrect password");
        }
        throw new Error(error.message || "Failed to delete account");
      }
      throw new Error("Failed to delete account");
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

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
      
      <ProfileContactSection
        phoneNumber={phoneNumber}
        onSave={handleSavePhone}
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

      <Divider sx={{ borderColor: dividerColor }} />

      {/* Sign Out Section */}
      <Box sx={{ px: 3, py: 3 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<LogoutIcon />}
          onClick={handleSignOut}
          sx={{
            color: "#00A884",
            borderColor: "#00A884",
            "&:hover": {
              borderColor: "#00A884",
              bgcolor: isDark ? "rgba(0, 168, 132, 0.1)" : "rgba(0, 168, 132, 0.05)",
            },
          }}
        >
          Sign Out
        </Button>
      </Box>

      {/* Delete Account Section */}
      <Box sx={{ px: 3, py: 3 }}>
        <Typography
          variant="overline"
          sx={{ color: "#F15C6D", fontWeight: 600, fontSize: "0.75rem", mb: 1.5 }}
        >
          DANGER ZONE
        </Typography>
        
        {deleteError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {deleteError}
          </Alert>
        )}

        <Typography sx={{ color: textSecondary, fontSize: "0.875rem", mb: 2 }}>
          Once you delete your account, there is no going back. Please be certain.
        </Typography>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<DeleteIcon />}
          onClick={() => setShowDeleteModal(true)}
          sx={{
            color: "#F15C6D",
            borderColor: "#F15C6D",
            "&:hover": {
              borderColor: "#F15C6D",
              bgcolor: isDark ? "rgba(241, 92, 109, 0.1)" : "rgba(241, 92, 109, 0.05)",
            },
          }}
        >
          Delete Account
        </Button>
      </Box>

      {/* Password Confirmation Modal */}
      <ConfirmPasswordModal
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteError("");
        }}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        description="This action cannot be undone. Please enter your password to confirm account deletion."
      />
    </Box>
  );
}
