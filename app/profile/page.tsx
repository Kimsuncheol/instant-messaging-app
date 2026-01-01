"use client";

import React, { useState } from "react";
import { 
  Box, 
  Avatar, 
  Typography, 
  IconButton, 
  TextField,
  Button,
  Divider,
} from "@mui/material";
import { 
  ArrowBack as BackIcon,
  CameraAlt as CameraIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { LoadingScreen } from "@/components/shared/LoadingScreen";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { resolvedMode } = useTheme();
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
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

  if (loading) return <LoadingScreen />;
  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: bgColor }}>
      {/* Header */}
      <Box 
        sx={{ 
          bgcolor: headerBg,
          px: 2,
          py: 2,
          display: "flex",
          alignItems: "center",
          gap: 3,
        }}
      >
        <IconButton onClick={() => router.back()} sx={{ color: "#FFFFFF" }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ color: "#FFFFFF", fontWeight: 500 }}>
          Profile
        </Typography>
      </Box>

      {/* Avatar Section */}
      <Box 
        sx={{ 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center",
          py: 4,
        }}
      >
        <Box sx={{ position: "relative" }}>
          <Avatar
            src={user.photoURL || undefined}
            sx={{ 
              width: 200, 
              height: 200, 
              bgcolor: isDark ? "#6B7C85" : "#DFE5E7",
              fontSize: "4rem",
            }}
          >
            {user.displayName?.[0]}
          </Avatar>
          <IconButton
            sx={{
              position: "absolute",
              bottom: 8,
              right: 8,
              bgcolor: "#00A884",
              color: "#FFFFFF",
              "&:hover": { bgcolor: "#008069" },
            }}
          >
            <CameraIcon />
          </IconButton>
        </Box>
      </Box>

      <Divider sx={{ borderColor: dividerColor }} />

      {/* Name Section */}
      <Box sx={{ px: 3, py: 2 }}>
        <Typography 
          variant="overline" 
          sx={{ color: "#00A884", fontWeight: 600, fontSize: "0.75rem" }}
        >
          Your name
        </Typography>
        
        {isEditingName ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: inputBg,
                  "& input": { color: textPrimary },
                },
              }}
            />
            <IconButton 
              onClick={() => setIsEditingName(false)}
              sx={{ color: "#00A884" }}
            >
              <CheckIcon />
            </IconButton>
            <IconButton 
              onClick={() => {
                setDisplayName(user.displayName || "");
                setIsEditingName(false);
              }}
              sx={{ color: textSecondary }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1 }}>
            <Typography sx={{ color: textPrimary, fontSize: "1rem" }}>
              {displayName || user.displayName || "User"}
            </Typography>
            <IconButton 
              onClick={() => setIsEditingName(true)}
              sx={{ color: textSecondary }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
        
        <Typography sx={{ color: textSecondary, fontSize: "0.875rem", mt: 1 }}>
          This is not your username or pin. This name will be visible to your WhatsApp contacts.
        </Typography>
      </Box>

      <Divider sx={{ borderColor: dividerColor }} />

      {/* About Section */}
      <Box sx={{ px: 3, py: 2 }}>
        <Typography 
          variant="overline" 
          sx={{ color: "#00A884", fontWeight: 600, fontSize: "0.75rem" }}
        >
          About
        </Typography>
        
        {isEditingAbout ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: inputBg,
                  "& input": { color: textPrimary },
                },
              }}
            />
            <IconButton 
              onClick={() => setIsEditingAbout(false)}
              sx={{ color: "#00A884" }}
            >
              <CheckIcon />
            </IconButton>
          </Box>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1 }}>
            <Typography sx={{ color: textPrimary, fontSize: "1rem" }}>
              {about}
            </Typography>
            <IconButton 
              onClick={() => setIsEditingAbout(true)}
              sx={{ color: textSecondary }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>

      <Divider sx={{ borderColor: dividerColor }} />

      {/* Email Section */}
      <Box sx={{ px: 3, py: 2 }}>
        <Typography 
          variant="overline" 
          sx={{ color: "#00A884", fontWeight: 600, fontSize: "0.75rem" }}
        >
          Email
        </Typography>
        <Typography sx={{ color: textPrimary, fontSize: "1rem", mt: 1 }}>
          {user.email}
        </Typography>
      </Box>
    </Box>
  );
}
