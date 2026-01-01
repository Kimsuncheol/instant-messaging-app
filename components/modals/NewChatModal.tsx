"use client";

import React, { useState, useEffect } from "react";
import { Modal, Box } from "@mui/material";
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

const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '16px',
  boxShadow: 24,
  p: 4,
  outline: 'none',
  backdropFilter: 'blur(10px)',
};

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

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <NewChatHeader onClose={onClose} />
        <NewChatSearch value={searchTerm} onChange={setSearchTerm} />
        <NewChatResults 
          loading={loading} 
          users={users} 
          searchTerm={searchTerm} 
          onSelectUser={handleStartChat} 
        />
      </Box>
    </Modal>
  );
};

