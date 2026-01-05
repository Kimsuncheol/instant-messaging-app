"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  ImageList,
  ImageListItem,
  CircularProgress,
} from "@mui/material";
import { Message } from "@/lib/chatService";
import { subscribeToMessages } from "@/lib/chatService";

interface MediaGalleryProps {
  chatId: string;
  onMediaClick?: (messageId: string) => void;
}

type MediaType = "all" | "image" | "video" | "file";

interface MediaItem {
  id: string;
  url: string;
  type: string;
  createdAt: number;
  senderId: string;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  chatId,
  onMediaClick,
}) => {
  const [activeTab, setActiveTab] = useState<MediaType>("all");
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!chatId) {
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToMessages(chatId, (messages: Message[]) => {
      // Filter messages that have media
      const mediaMessages = messages.filter((msg) => {
        // Type assertion for extended message properties
        const extendedMsg = msg as Message & { 
          image?: string; 
          fileUrl?: string; 
          type?: string; 
        };
        
        const hasImage = extendedMsg.image;
        const isImageType = extendedMsg.type === "image";
        const isVideoType = extendedMsg.type === "video";
        const isFileType = extendedMsg.type === "file";
        
        return hasImage || isImageType || isVideoType || isFileType;
      });

      // Map to media items
      const items: MediaItem[] = mediaMessages.map((msg) => {
        const extendedMsg = msg as Message & { 
          image?: string; 
          fileUrl?: string; 
          type?: string; 
          createdAt?: { toMillis: () => number };
        };
        
        return {
          id: msg.id,
          url: extendedMsg.image || extendedMsg.fileUrl || "",
          type: extendedMsg.type || "image",
          createdAt: extendedMsg.createdAt?.toMillis() || Date.now(),
          senderId: msg.senderId,
        };
      });

      setMediaItems(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chatId]);

  const filteredMedia = mediaItems.filter((item) => {
    if (activeTab === "all") return true;
    return item.type === activeTab;
  });

  const handleMediaClick = (messageId: string) => {
    onMediaClick?.(messageId);
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header */}
      <Box sx={{ px: 2, py: 2, borderTop: "1px solid #2A3942" }}>
        <Typography
          variant="subtitle2"
          sx={{
            color: "#00A884",
            fontWeight: 500,
            mb: 2,
            fontSize: "0.875rem",
          }}
        >
          SHARED MEDIA
        </Typography>

        {/* Filter Tabs */}
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{
            minHeight: 36,
            "& .MuiTabs-indicator": {
              bgcolor: "#00A884",
            },
          }}
        >
          <Tab
            label="All"
            value="all"
            sx={{
              color: "#8696A0",
              "&.Mui-selected": { color: "#00A884" },
              minHeight: 36,
              fontSize: "0.8125rem",
            }}
          />
          <Tab
            label="Images"
            value="image"
            sx={{
              color: "#8696A0",
              "&.Mui-selected": { color: "#00A884" },
              minHeight: 36,
              fontSize: "0.8125rem",
            }}
          />
          <Tab
            label="Videos"
            value="video"
            sx={{
              color: "#8696A0",
              "&.Mui-selected": { color: "#00A884" },
              minHeight: 36,
              fontSize: "0.8125rem",
            }}
          />
          <Tab
            label="Files"
            value="file"
            sx={{
              color: "#8696A0",
              "&.Mui-selected": { color: "#00A884" },
              minHeight: 36,
              fontSize: "0.8125rem",
            }}
          />
        </Tabs>
      </Box>

      {/* Media Grid */}
      <Box sx={{ px: 2, pb: 2 }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              py: 4,
            }}
          >
            <CircularProgress size={24} sx={{ color: "#00A884" }} />
          </Box>
        ) : filteredMedia.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 4,
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: "#8696A0", textAlign: "center" }}
            >
              No media shared yet
            </Typography>
          </Box>
        ) : (
          <ImageList cols={3} gap={4} sx={{ m: 0 }}>
            {filteredMedia.map((item) => (
              <ImageListItem
                key={item.id}
                onClick={() => handleMediaClick(item.id)}
                sx={{
                  cursor: "pointer",
                  borderRadius: 1,
                  overflow: "hidden",
                  "&:hover": {
                    opacity: 0.8,
                  },
                }}
              >
                <Box
                  component="img"
                  src={item.url}
                  alt="Shared media"
                  sx={{
                    width: "100%",
                    aspectRatio: "1",
                    objectFit: "cover",
                    bgcolor: "#202C33",
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%232A3942' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%238696A0' font-size='12'%3ENo Preview%3C/text%3E%3C/svg%3E";
                  }}
                />
              </ImageListItem>
            ))}
          </ImageList>
        )}
      </Box>
    </Box>
  );
};
