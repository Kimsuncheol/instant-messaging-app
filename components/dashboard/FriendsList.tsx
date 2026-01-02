"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import {
  MoreVert as MoreIcon,
  PushPin as PinIcon,
  PersonRemove as RemoveIcon,
} from "@mui/icons-material";
import { subscribeToFriends, Friend, removeFriend, pinFriend, unpinFriend } from "@/lib/friendService";
import { getUserById, UserProfile } from "@/lib/userService";
import { useAuth } from "@/context/AuthContext";
import { createPrivateChat } from "@/lib/chatService";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface FriendsListProps {
  onSelectChat: (chatId: string) => void;
  onSwitchToChats?: () => void;
}

export const FriendsList: React.FC<FriendsListProps> = ({ onSelectChat, onSwitchToChats }) => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendProfiles, setFriendProfiles] = useState<Record<string, UserProfile>>({});
  const [pinnedFriendships, setPinnedFriendships] = useState<Set<string>>(new Set());
  const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement; friendId: string } | null>(null);

  // Subscribe to friends
  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = subscribeToFriends(user.uid, async (friendsList) => {
      // Load pinned status for each friendship
      const pinned = new Set<string>();
      
      await Promise.all(
        friendsList.map(async (friend) => {
          const friendshipDoc = await getDoc(doc(db, "friendships", friend.friendshipId));
          const data = friendshipDoc.data();
          if (data?.pinnedBy?.includes(user.uid)) {
            pinned.add(friend.id);
          }
        })
      );
      
      setPinnedFriendships(pinned);
      
      // Sort: pinned first, then alphabetically
      const sorted = [...friendsList].sort((a, b) => {
        const aIsPinned = pinned.has(a.id);
        const bIsPinned = pinned.has(b.id);
        
        if (aIsPinned && !bIsPinned) return -1;
        if (!aIsPinned && bIsPinned) return 1;
        
        const nameA = friendProfiles[a.odUserId]?.displayName || "";
        const nameB = friendProfiles[b.odUserId]?.displayName || "";
        return nameA.localeCompare(nameB);
      });
      
      setFriends(sorted);
    });

    return () => unsubscribe();
  }, [user, friendProfiles]);

  // Load friend profiles
  useEffect(() => {
    const loadProfiles = async () => {
      const profiles: Record<string, UserProfile> = {};
      
      await Promise.all(
        friends.map(async (friend) => {
          const profile = await getUserById(friend.odUserId);
          if (profile) {
            profiles[friend.odUserId] = profile;
          }
        })
      );

      setFriendProfiles(profiles);
    };

    if (friends.length > 0) {
      loadProfiles();
    }
  }, [friends.length]);

  const handleFriendClick = async (friendUserId: string) => {
    if (!user) return;
    
    try {
      const chatId = await createPrivateChat(user.uid, friendUserId);
      onSelectChat(chatId);
      onSwitchToChats?.();
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, friendId: string) => {
    event.stopPropagation();
    setMenuAnchor({ el: event.currentTarget, friendId });
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handlePinToggle = async () => {
    if (!user || !menuAnchor) return;
    
    const friend = friends.find(f => f.id === menuAnchor.friendId);
    if (!friend) return;
    
    try {
      const isPinned = pinnedFriendships.has(friend.id);
      
      if (isPinned) {
        await unpinFriend(friend.friendshipId, user.uid);
      } else {
        await pinFriend(friend.friendshipId, user.uid);
      }
    } catch (error) {
      console.error("Error toggling pin:", error);
    }
    
    handleMenuClose();
  };

  const handleRemoveFriend = async () => {
    if (!menuAnchor) return;
    
    const friend = friends.find(f => f.id === menuAnchor.friendId);
    if (!friend) return;
    
    handleMenuClose();
    
    if (!window.confirm("Are you sure you want to remove this friend?")) return;
    
    try {
      await removeFriend(friend.friendshipId);
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };

  if (friends.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          px: 3,
          textAlign: "center",
        }}
      >
        <Typography sx={{ color: "#8696A0", mb: 2 }}>
          No friends yet
        </Typography>
        <Typography sx={{ color: "#667781", fontSize: "0.875rem" }}>
          Add friends to start chatting
        </Typography>
      </Box>
    );
  }

  const currentMenuFriend = menuAnchor ? friends.find(f => f.id === menuAnchor.friendId) : null;
  const isCurrentFriendPinned = currentMenuFriend ? pinnedFriendships.has(currentMenuFriend.id) : false;

  return (
    <>
      <List sx={{ flex: 1, overflow: "auto", py: 0 }}>
        {friends.map((friend) => {
          const profile = friendProfiles[friend.odUserId];
          const isPinned = pinnedFriendships.has(friend.id);
          
          return (
            <ListItemButton
              key={friend.id}
              onClick={() => handleFriendClick(friend.odUserId)}
              sx={{
                px: 2,
                py: 1.5,
                borderBottom: "1px solid #2A3942",
                "&:hover": { bgcolor: "#202C33" },
              }}
            >
              <ListItemAvatar>
                <Avatar
                  src={profile?.photoURL || undefined}
                  sx={{ bgcolor: "#6B7C85" }}
                >
                  {profile?.displayName?.[0] || "?"}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    {profile?.displayName || "Loading..."}
                    {isPinned && (
                      <PinIcon sx={{ fontSize: "1rem", color: "#8696A0" }} />
                    )}
                  </Box>
                }
                secondary={profile?.email}
                primaryTypographyProps={{
                  sx: { color: "#E9EDEF", fontWeight: 500 },
                }}
                secondaryTypographyProps={{
                  sx: { color: "#8696A0", fontSize: "0.875rem" },
                }}
              />
              <IconButton
                size="small"
                onClick={(e) => handleMenuOpen(e, friend.id)}
                sx={{ color: "#8696A0" }}
              >
                <MoreIcon />
              </IconButton>
            </ListItemButton>
          );
        })}
      </List>

      {/* Friend Menu */}
      <Menu
        anchorEl={menuAnchor?.el}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            bgcolor: "#233138",
            color: "#E9EDEF",
            minWidth: 180,
          },
        }}
      >
        <MenuItem onClick={handlePinToggle} sx={{ py: 1.5, "&:hover": { bgcolor: "#182229" } }}>
          <ListItemIcon>
            <PinIcon sx={{ color: isCurrentFriendPinned ? "#00A884" : "#AEBAC1" }} />
          </ListItemIcon>
          <ListItemText>{isCurrentFriendPinned ? "Unpin" : "Pin"}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleRemoveFriend} sx={{ py: 1.5, "&:hover": { bgcolor: "#182229" } }}>
          <ListItemIcon>
            <RemoveIcon sx={{ color: "#F15C6D" }} />
          </ListItemIcon>
          <ListItemText>Remove Friend</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};
