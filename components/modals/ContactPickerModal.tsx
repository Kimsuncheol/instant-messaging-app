"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  CircularProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Person as ContactIcon,
} from "@mui/icons-material";
import { ContactData } from "@/lib/chatService";
import { useAuth } from "@/context/AuthContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Friend {
  odId: string;
  oderId: string;
  friendId: string;
  friendName: string;
  friendPhoto: string;
  friendPhone?: string;
}

interface ContactPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (contact: ContactData) => void;
}

export const ContactPickerModal: React.FC<ContactPickerModalProps> = ({
  open,
  onClose,
  onSelect,
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  // Load friends list
  useEffect(() => {
    const loadFriends = async () => {
      if (!user) return;
      setLoading(true);

      try {
        const friendsRef = collection(db, "users", user.uid, "friends");
        const snapshot = await getDocs(query(friendsRef, where("status", "==", "accepted")));
        
        const friendsList: Friend[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          friendsList.push({
            odId: doc.id,
            oderId: data.oderId || "",
            friendId: data.oderId || doc.id,
            friendName: data.displayName || "Unknown",
            friendPhoto: data.photoURL || "",
            friendPhone: data.phoneNumber || "",
          });
        });
        
        setFriends(friendsList);
      } catch (error) {
        console.error("Error loading friends:", error);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      loadFriends();
    }
  }, [open, user]);

  const filteredFriends = friends.filter((friend) =>
    friend.friendName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectContact = (friend: Friend) => {
    const contactData: ContactData = {
      userId: friend.friendId,
      displayName: friend.friendName,
      phoneNumber: friend.friendPhone,
      photoURL: friend.friendPhoto,
    };
    onSelect(contactData);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "#1F2C34",
          color: "white",
          borderRadius: 2,
          maxHeight: "70vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #2A3942",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ContactIcon sx={{ color: "#53BDEB" }} />
          <Typography variant="h6">Share Contact</Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "#8696A0" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Search Bar */}
        <Box sx={{ p: 2, borderBottom: "1px solid #2A3942" }}>
          <TextField
            fullWidth
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: "#8696A0", mr: 1 }} />,
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "#2A3942",
                color: "white",
                "& fieldset": { borderColor: "#2A3942" },
                "&:hover fieldset": { borderColor: "#00A884" },
              },
            }}
          />
        </Box>

        {/* Friends List */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress sx={{ color: "#00A884" }} />
          </Box>
        ) : filteredFriends.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography sx={{ color: "#8696A0" }}>
              {searchTerm ? "No contacts found" : "No friends to share"}
            </Typography>
          </Box>
        ) : (
          <List sx={{ py: 0 }}>
            {filteredFriends.map((friend) => (
              <ListItem key={friend.friendId} disablePadding>
                <ListItemButton
                  onClick={() => handleSelectContact(friend)}
                  sx={{
                    "&:hover": { bgcolor: "#2A3942" },
                    py: 1.5,
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      src={friend.friendPhoto}
                      sx={{ bgcolor: "#00A884" }}
                    >
                      {friend.friendName[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={friend.friendName}
                    secondary={friend.friendPhone || "No phone"}
                    primaryTypographyProps={{ color: "#E9EDEF" }}
                    secondaryTypographyProps={{ color: "#8696A0" }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};
