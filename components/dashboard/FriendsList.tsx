"use client";

import React, { useEffect, useState, useMemo } from "react";
import { List, Box } from "@mui/material";
import { subscribeToFriends, Friend, removeFriend, favouriteFriend, unfavouriteFriend } from "@/lib/friendService";
import { getUserById, UserProfile } from "@/lib/userService";
import { useAuth } from "@/context/AuthContext";
import { createPrivateChat } from "@/lib/chatService";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { subscribeToMultiplePresences, UserPresence } from "@/lib/presenceService";
import { FriendListItem, FriendMenu, EmptyFriendsState, FriendFilterTabs, FriendFilter } from "./friends";

interface FriendsListProps {
  onSelectChat: (chatId: string) => void;
  onSwitchToChats?: () => void;
}

export const FriendsList: React.FC<FriendsListProps> = ({ onSelectChat, onSwitchToChats }) => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendProfiles, setFriendProfiles] = useState<Record<string, UserProfile>>({});
  const [favouritedFriendships, setFavouritedFriendships] = useState<Set<string>>(new Set());
  const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement; friendId: string } | null>(null);
  const [presences, setPresences] = useState<Record<string, UserPresence>>({});
  const [activeTab, setActiveTab] = useState<FriendFilter>("all");

  // Subscribe to presence changes for all friends
  useEffect(() => {
    if (friends.length === 0) return;
    
    const friendUserIds = friends.map(f => f.odUserId);
    const unsubscribe = subscribeToMultiplePresences(friendUserIds, setPresences);
    
    return () => unsubscribe();
  }, [friends]);

  // Subscribe to friends
  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = subscribeToFriends(user.uid, async (friendsList) => {
      const favourited = new Set<string>();
      
      await Promise.all(
        friendsList.map(async (friend) => {
          const friendshipDoc = await getDoc(doc(db, "friendships", friend.friendshipId));
          const data = friendshipDoc.data();
          if (data?.favouritedBy?.includes(user.uid)) {
            favourited.add(friend.id);
          }
        })
      );
      
      setFavouritedFriendships(favourited);
      setFriends(friendsList);
    });

    return () => unsubscribe();
  }, [user]);

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
  }, [friends]);

  // Sort friends: favourites first, then alphabetically
  const sortedFriends = useMemo(() => {
    return [...friends].sort((a, b) => {
      const aIsFavourite = favouritedFriendships.has(a.id);
      const bIsFavourite = favouritedFriendships.has(b.id);
      
      if (aIsFavourite && !bIsFavourite) return -1;
      if (!aIsFavourite && bIsFavourite) return 1;
      
      const nameA = friendProfiles[a.odUserId]?.displayName || "";
      const nameB = friendProfiles[b.odUserId]?.displayName || "";
      return nameA.localeCompare(nameB);
    });
  }, [friends, favouritedFriendships, friendProfiles]);

  // Filter friends based on active tab
  const filteredFriends = useMemo(() => {
    if (activeTab === "favourites") {
      return sortedFriends.filter(friend => favouritedFriendships.has(friend.id));
    }
    return sortedFriends;
  }, [sortedFriends, activeTab, favouritedFriendships]);

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

  const handleMenuOpen = (anchorEl: HTMLElement, friendId: string) => {
    setMenuAnchor({ el: anchorEl, friendId });
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleFavouriteToggle = async () => {
    if (!user || !menuAnchor) return;
    
    const friend = friends.find(f => f.id === menuAnchor.friendId);
    if (!friend) return;
    
    try {
      const isFavourited = favouritedFriendships.has(friend.id);
      
      if (isFavourited) {
        await unfavouriteFriend(friend.friendshipId, user.uid);
      } else {
        await favouriteFriend(friend.friendshipId, user.uid);
      }
    } catch (error) {
      console.error("Error toggling favourite:", error);
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
    return <EmptyFriendsState />;
  }

  const currentMenuFriend = menuAnchor ? friends.find(f => f.id === menuAnchor.friendId) : null;
  const isCurrentFriendFavourited = currentMenuFriend ? favouritedFriendships.has(currentMenuFriend.id) : false;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Filter Tabs */}
      <FriendFilterTabs 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Friends List */}
      {filteredFriends.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            px: 3,
            textAlign: "center",
          }}
        >
          <Box sx={{ color: "#8696A0", fontSize: "0.9375rem" }}>
            {activeTab === "favourites" ? "No favourites yet" : "No friends yet"}
          </Box>
          <Box sx={{ color: "#667781", fontSize: "0.875rem", mt: 1 }}>
            {activeTab === "favourites" 
              ? "Star your favorite friends to see them here" 
              : "Add friends to start chatting"}
          </Box>
        </Box>
      ) : (
        <List sx={{ flex: 1, overflow: "auto", py: 0 }}>
          {filteredFriends.map((friend) => (
            <FriendListItem
              key={friend.id}
              friend={friend}
              profile={friendProfiles[friend.odUserId]}
              presence={presences[friend.odUserId]}
              isFavourite={favouritedFriendships.has(friend.id)}
              onClick={() => handleFriendClick(friend.odUserId)}
              onContextMenu={(e) => {
                e.preventDefault();
                handleMenuOpen(e.currentTarget, friend.id);
              }}
              onLongPress={(target) => handleMenuOpen(target, friend.id)}
            />
          ))}
        </List>
      )}

      <FriendMenu
        anchorEl={menuAnchor?.el || null}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        isFavourited={isCurrentFriendFavourited}
        onFavouriteToggle={handleFavouriteToggle}
        onRemoveFriend={handleRemoveFriend}
      />
    </Box>
  );
};
