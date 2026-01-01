"use client";

import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, TextField, IconButton, Avatar } from "@mui/material";

import { 
  Send as SendIcon, 
  AttachFile as AttachIcon,
  EmojiEmotions as EmojiIcon,
  Mic as MicIcon,
  ArrowBack as BackIcon,
  MoreVert as MoreIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { Message, sendMessage, subscribeToMessages, getChatById, Chat } from "@/lib/chatService";
import { Timestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

import { getUserById, UserProfile } from "@/lib/userService";

interface ChatViewProps {
  chatId: string;
  onBack?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({ chatId, onBack }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [, setChat] = useState<Chat | null>(null);

  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat and other user info
  useEffect(() => {
    const loadChat = async () => {
      const chatData = await getChatById(chatId);
      setChat(chatData);
      
      if (chatData && user) {
        const otherUserId = chatData.participants.find(p => p !== user.uid);
        if (otherUserId) {
          const userData = await getUserById(otherUserId);
          setOtherUser(userData);
        }
      }
    };
    loadChat();
  }, [chatId, user]);

  // Subscribe to messages
  useEffect(() => {
    const unsubscribe = subscribeToMessages(chatId, (msgs) => {
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [chatId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user || sending) return;
    
    setSending(true);
    try {
      await sendMessage(chatId, user.uid, newMessage.trim());
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp: Timestamp | null) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };


  return (
    <Box 
      sx={{ 
        display: "flex", 
        flexDirection: "column", 
        width: "100%",
        height: "100vh",
        bgcolor: "#0B141A",
      }}
    >
      {/* Header */}
      <Box 
        sx={{ 
          display: "flex", 
          alignItems: "center", 
          gap: 2,
          px: 2,
          py: 1,
          bgcolor: "#202C33",
          borderBottom: "1px solid #2A3942",
        }}
      >
        {onBack && (
          <IconButton onClick={onBack} sx={{ color: "#AEBAC1" }}>
            <BackIcon />
          </IconButton>
        )}
        <Avatar 
          src={otherUser?.photoURL} 
          sx={{ width: 40, height: 40, bgcolor: "#6B7C85" }}
        >
          {otherUser?.displayName?.[0]}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography sx={{ color: "#E9EDEF", fontWeight: 500, fontSize: "1rem" }}>
            {otherUser?.displayName || "Loading..."}
          </Typography>
          <Typography sx={{ color: "#8696A0", fontSize: "0.75rem" }}>
            online
          </Typography>
        </Box>
        <IconButton sx={{ color: "#AEBAC1" }}>
          <SearchIcon />
        </IconButton>
        <IconButton sx={{ color: "#AEBAC1" }}>
          <MoreIcon />
        </IconButton>
      </Box>

      {/* Messages Area */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          overflowY: "auto", 
          px: 3,
          py: 2,
          backgroundImage: "url('/chat-bg.png')",
          backgroundSize: "contain",
          bgcolor: "#0B141A",
        }}
      >
        {messages.map((msg) => {
          const isOwn = msg.senderId === user?.uid;
          return (
            <Box
              key={msg.id}
              sx={{
                display: "flex",
                justifyContent: isOwn ? "flex-end" : "flex-start",
                mb: 0.5,
              }}
            >
              <Box
                sx={{
                  maxWidth: "65%",
                  px: 1.5,
                  py: 0.75,
                  borderRadius: isOwn 
                    ? "8px 8px 0 8px" 
                    : "8px 8px 8px 0",
                  bgcolor: isOwn ? "#005C4B" : "#202C33",
                  position: "relative",
                }}
              >
                <Typography 
                  sx={{ 
                    color: "#E9EDEF", 
                    fontSize: "0.9375rem",
                    wordBreak: "break-word",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {msg.text}
                </Typography>
                <Typography 
                  sx={{ 
                    color: "rgba(255,255,255,0.6)", 
                    fontSize: "0.6875rem",
                    textAlign: "right",
                    mt: 0.25,
                  }}
                >
                  {formatTime(msg.createdAt)}
                </Typography>
              </Box>
            </Box>
          );
        })}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Box 
        sx={{ 
          display: "flex", 
          alignItems: "center", 
          gap: 1,
          px: 2,
          py: 1,
          bgcolor: "#202C33",
        }}
      >
        <IconButton sx={{ color: "#8696A0" }}>
          <EmojiIcon />
        </IconButton>
        <IconButton sx={{ color: "#8696A0" }}>
          <AttachIcon />
        </IconButton>
        <TextField
          fullWidth
          placeholder="Type a message"
          size="small"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          multiline
          maxRows={4}
          sx={{
            "& .MuiOutlinedInput-root": {
              bgcolor: "#2A3942",
              borderRadius: "8px",
              "& fieldset": { border: "none" },
              "& input, & textarea": {
                color: "#E9EDEF",
                fontSize: "0.9375rem",
                "&::placeholder": {
                  color: "#8696A0",
                  opacity: 1,
                },
              },
            },
          }}
        />
        {newMessage.trim() ? (
          <IconButton 
            onClick={handleSend} 
            disabled={sending}
            sx={{ 
              color: "#00A884",
              "&:hover": { bgcolor: "rgba(0,168,132,0.1)" },
            }}
          >
            <SendIcon />
          </IconButton>
        ) : (
          <IconButton sx={{ color: "#8696A0" }}>
            <MicIcon />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};
