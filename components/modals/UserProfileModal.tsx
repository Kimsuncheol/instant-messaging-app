"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Avatar,
  Typography,
  IconButton,
  Button,
  Divider,
  CircularProgress,
  ImageList,
  ImageListItem,
  Backdrop,
} from "@mui/material";
import {
  Close as CloseIcon,
  Chat as ChatIcon,
  Block as BlockIcon,
  PersonRemove as RemoveIcon,
  PersonAdd as AddIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Collections as GalleryIcon,
} from "@mui/icons-material";
import { UserProfile, getUserById } from "@/lib/userService";
import {
  blockUser,
  unblockUser,
  isBlocked,
  removeFriend,
  getFriendshipByUsers,
  areFriends,
} from "@/lib/friendService";
import { createPrivateChat } from "@/lib/chatService";
import { useAuth } from "@/context/AuthContext";
import { useChatStore } from "@/store/chatStore";

interface UserProfileModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
}

// Mock gallery images for demo purposes
const generateMockGalleryImages = (photoURL: string | undefined, displayName: string | undefined) => {
  const baseUrl = photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'User')}&background=random&size=400`;
  // Generate 4 gallery images with variations
  return [
    baseUrl,
    `https://picsum.photos/seed/${displayName || 'user'}1/400/400`,
    `https://picsum.photos/seed/${displayName || 'user'}2/400/400`,
    `https://picsum.photos/seed/${displayName || 'user'}3/400/400`,
  ];
};

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  open,
  onClose,
  userId,
}) => {
  const { user } = useAuth();
  const setSelectedChatId = useChatStore((state) => state.setSelectedChatId);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [friendshipId, setFriendshipId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Gallery state
  const [showGallery, setShowGallery] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  useEffect(() => {
    if (!open || !userId || !user) return;

    const loadProfile = async () => {
      setLoading(true);
      try {
        const [userData, blockedStatus, friendStatus, friendship] = await Promise.all([
          getUserById(userId),
          isBlocked(user.uid, userId),
          areFriends(user.uid, userId),
          getFriendshipByUsers(user.uid, userId),
        ]);
        setProfile(userData);
        setBlocked(blockedStatus);
        setIsFriend(friendStatus);
        setFriendshipId(friendship?.id || null);
        
        // Generate mock gallery images
        if (userData) {
          setGalleryImages(generateMockGalleryImages(userData.photoURL, userData.displayName));
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [open, userId, user]);

  const handleStartChat = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      const chatId = await createPrivateChat(user.uid, userId);
      setSelectedChatId(chatId);
      onClose();
    } catch (error) {
      console.error("Error starting chat:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlock = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      if (blocked) {
        await unblockUser(user.uid, userId);
        setBlocked(false);
      } else {
        await blockUser(user.uid, userId);
        setBlocked(true);
      }
    } catch (error) {
      console.error("Error toggling block:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!friendshipId) return;
    setActionLoading(true);
    try {
      await removeFriend(friendshipId);
      setIsFriend(false);
      setFriendshipId(null);
    } catch (error) {
      console.error("Error removing friend:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAvatarClick = () => {
    setShowGallery(!showGallery);
  };

  const handleImageClick = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleLightboxNav = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setLightboxIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
    } else {
      setLightboxIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "#111B21",
            color: "#E9EDEF",
            borderRadius: 2,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            p: 1,
          }}
        >
          <IconButton onClick={onClose} sx={{ color: "#AEBAC1" }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent sx={{ pt: 0 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress sx={{ color: "#00A884" }} />
            </Box>
          ) : (
            <Box sx={{ textAlign: "center" }}>
              {/* Clickable Main Avatar */}
              <Box 
                sx={{ 
                  position: "relative", 
                  display: "inline-block",
                  cursor: "pointer",
                  "&:hover .gallery-icon": {
                    opacity: 1,
                  },
                }}
                onClick={handleAvatarClick}
              >
                <Avatar
                  src={profile?.photoURL}
                  sx={{
                    width: 120,
                    height: 120,
                    mx: "auto",
                    mb: 2,
                    bgcolor: "#00A884",
                    fontSize: "3rem",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "scale(1.05)",
                      boxShadow: "0 0 20px rgba(0, 168, 132, 0.4)",
                    },
                  }}
                >
                  {profile?.displayName?.[0]}
                </Avatar>
                <Box
                  className="gallery-icon"
                  sx={{
                    position: "absolute",
                    bottom: 16,
                    right: -8,
                    bgcolor: "#00A884",
                    borderRadius: "50%",
                    p: 0.5,
                    opacity: 0.7,
                    transition: "opacity 0.2s",
                  }}
                >
                  <GalleryIcon sx={{ fontSize: 16, color: "#fff" }} />
                </Box>
              </Box>

              <Typography variant="h5" sx={{ color: "#E9EDEF", fontWeight: 500 }}>
                {profile?.displayName || "Unknown User"}
              </Typography>

              <Typography sx={{ color: "#8696A0", fontSize: "0.875rem", mt: 0.5 }}>
                {profile?.email}
              </Typography>

              {/* Image Gallery Grid */}
              {showGallery && galleryImages.length > 0 && (
                <Box sx={{ mt: 2, mb: 2 }}>
                  <Typography 
                    sx={{ 
                      color: "#8696A0", 
                      fontSize: "0.75rem", 
                      mb: 1,
                      textAlign: "left",
                    }}
                  >
                    Profile Photos
                  </Typography>
                  <ImageList 
                    cols={4} 
                    gap={8}
                    sx={{
                      m: 0,
                      "& .MuiImageListItem-root": {
                        overflow: "hidden",
                        borderRadius: 1,
                      },
                    }}
                  >
                    {galleryImages.map((img, index) => (
                      <ImageListItem 
                        key={index}
                        onClick={() => handleImageClick(index)}
                        sx={{
                          cursor: "pointer",
                          transition: "transform 0.2s, opacity 0.2s",
                          "&:hover": {
                            transform: "scale(1.05)",
                            opacity: 0.8,
                          },
                        }}
                      >
                        <Box
                          component="img"
                          src={img}
                          alt={`Gallery ${index + 1}`}
                          sx={{
                            width: "100%",
                            aspectRatio: "1",
                            objectFit: "cover",
                            borderRadius: 1,
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://ui-avatars.com/api/?name=${profile?.displayName || 'U'}&background=2A3942&color=fff&size=100`;
                          }}
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                </Box>
              )}

              <Divider sx={{ my: 3, bgcolor: "#2A3942" }} />

              {/* Actions */}
              <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                {!blocked && (
                  <Button
                    variant="contained"
                    startIcon={<ChatIcon />}
                    onClick={handleStartChat}
                    disabled={actionLoading}
                    sx={{
                      bgcolor: "#00A884",
                      "&:hover": { bgcolor: "#008f70" },
                    }}
                  >
                    Message
                  </Button>
                )}

                <Button
                  variant="outlined"
                  startIcon={blocked ? <AddIcon /> : <BlockIcon />}
                  onClick={handleBlock}
                  disabled={actionLoading}
                  sx={{
                    color: blocked ? "#00A884" : "#F15C6D",
                    borderColor: blocked ? "#00A884" : "#F15C6D",
                    "&:hover": {
                      borderColor: blocked ? "#008f70" : "#d14a5a",
                      bgcolor: "transparent",
                    },
                  }}
                >
                  {blocked ? "Unblock" : "Block"}
                </Button>

                {isFriend && (
                  <Button
                    variant="outlined"
                    startIcon={<RemoveIcon />}
                    onClick={handleRemoveFriend}
                    disabled={actionLoading}
                    sx={{
                      color: "#F15C6D",
                      borderColor: "#F15C6D",
                      "&:hover": {
                        borderColor: "#d14a5a",
                        bgcolor: "transparent",
                      },
                    }}
                  >
                    Remove
                  </Button>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Lightbox for enlarged image viewing */}
      <Backdrop
        open={lightboxOpen}
        onClick={() => setLightboxOpen(false)}
        sx={{
          zIndex: (theme) => theme.zIndex.modal + 1,
          bgcolor: "rgba(0, 0, 0, 0.9)",
        }}
      >
        <Box
          onClick={(e) => e.stopPropagation()}
          sx={{
            position: "relative",
            maxWidth: "90vw",
            maxHeight: "90vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Close button */}
          <IconButton
            onClick={() => setLightboxOpen(false)}
            sx={{
              position: "absolute",
              top: -48,
              right: 0,
              color: "#fff",
            }}
          >
            <CloseIcon />
          </IconButton>

          {/* Previous button */}
          <IconButton
            onClick={() => handleLightboxNav('prev')}
            sx={{
              position: "absolute",
              left: -60,
              color: "#fff",
              bgcolor: "rgba(255,255,255,0.1)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
            }}
          >
            <ChevronLeftIcon />
          </IconButton>

          {/* Main image */}
          <Box
            component="img"
            src={galleryImages[lightboxIndex]}
            alt={`Profile ${lightboxIndex + 1}`}
            sx={{
              maxWidth: "80vw",
              maxHeight: "80vh",
              objectFit: "contain",
              borderRadius: 2,
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://ui-avatars.com/api/?name=${profile?.displayName || 'U'}&background=2A3942&color=fff&size=400`;
            }}
          />

          {/* Next button */}
          <IconButton
            onClick={() => handleLightboxNav('next')}
            sx={{
              position: "absolute",
              right: -60,
              color: "#fff",
              bgcolor: "rgba(255,255,255,0.1)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
            }}
          >
            <ChevronRightIcon />
          </IconButton>

          {/* Image counter */}
          <Typography
            sx={{
              position: "absolute",
              bottom: -36,
              color: "#8696A0",
              fontSize: "0.875rem",
            }}
          >
            {lightboxIndex + 1} / {galleryImages.length}
          </Typography>
        </Box>
      </Backdrop>
    </>
  );
};
