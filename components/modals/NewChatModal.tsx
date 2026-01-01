"use client";

import React, { useState, useEffect } from "react";
import { Modal, Box, Slide } from "@mui/material";
import { UserProfile, searchUsers } from "@/lib/userService";
import { createPrivateChat } from "@/lib/chatService";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { NewChatHeader } from "./new-chat/NewChatHeader";
import { NewChatSearch } from "./new-chat/NewChatSearch";
import { NewChatResults } from "./new-chat/NewChatResults";

interface NewChatModalProps {
  open: boolean;
  onClose: () => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({ open, onClose }) => {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!searchTerm.trim() || searchTerm.length < 3) {
      setUsers([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchUsers(searchTerm);
        setUsers(results.filter(u => u.uid !== currentUser?.uid));
      } catch (error) {
        console.error("Search error", error);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, currentUser]);

  const handleStartChat = async (otherUserId: string) => {
    if (!currentUser) return;
    try {
      const chatId = await createPrivateChat(currentUser.uid, otherUserId);
      onClose();
      router.push(`/chat/${chatId}`);
    } catch (error) {
      console.error("Error starting chat", error);
    }
  };

  const handleClose = () => {
    setSearchTerm("");
    setUsers([]);
    onClose();
  };

  return (
    <Modal 
      open={open} 
      onClose={handleClose}
      sx={{
        '& .MuiBackdrop-root': {
          bgcolor: 'rgba(0, 0, 0, 0.6)',
        },
      }}
    >
      <Slide direction="left" in={open} mountOnEnter unmountOnExit>
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 400,
            height: '100vh',
            bgcolor: '#111B21',
            outline: 'none',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 0 30px rgba(0,0,0,0.3)',
          }}
        >
          <NewChatHeader onClose={handleClose} />
          <NewChatSearch value={searchTerm} onChange={setSearchTerm} />
          <NewChatResults 
            loading={loading} 
            users={users} 
            searchTerm={searchTerm} 
            onSelectUser={handleStartChat} 
          />
        </Box>
      </Slide>
    </Modal>
  );
};
