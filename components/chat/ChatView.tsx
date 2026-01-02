"use client";

import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { sendMessage, subscribeToMessages, getChatById, Chat, markMessagesAsRead, Message } from "@/lib/chatService";
import { useAuth } from "@/context/AuthContext";
import { getUserById, UserProfile } from "@/lib/userService";
import { handleTyping, subscribeToTyping, clearTyping } from "@/lib/typingService";
import { ChatHeader } from "./chat-view/ChatHeader";
import { MessageList } from "./chat-view/MessageList";
import { MessageInput } from "./chat-view/MessageInput";
import { TypingIndicator } from "./chat-view/TypingIndicator";
import { UserProfileModal } from "@/components/modals/UserProfileModal";
import { MessageContextMenu } from "./MessageContextMenu";
import { ForwardMessageModal } from "@/components/modals/ForwardMessageModal";

interface ChatViewProps {
  chatId: string;
  onBack?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({ chatId, onBack }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chat, setChat] = useState<Chat | null>(null);
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  
  // Message context menu state
  const [contextMenuAnchor, setContextMenuAnchor] = useState<{ top: number; left: number } | null>(null);
  const [contextMenuMessage, setContextMenuMessage] = useState<Message | null>(null);
  
  // Forward modal state
  const [forwardModalOpen, setForwardModalOpen] = useState(false);
  const [forwardMessage, setForwardMessageState] = useState<Message | null>(null);

  // Load chat and other user info
  useEffect(() => {
    const loadChat = async () => {
      const chatData = await getChatById(chatId);
      setChat(chatData);

      if (chatData && user && chatData.type === "private") {
        const otherUserId = chatData.participants.find((p) => p !== user.uid);
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

  // Subscribe to typing indicator
  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = subscribeToTyping(chatId, user.uid, (typing) => {
      setTypingUsers(typing);
    });
    
    // Clear typing on unmount
    return () => {
      unsubscribe();
      clearTyping(chatId, user.uid);
    };
  }, [chatId, user]);

  // Mark messages as read when chat is opened or receives new messages
  useEffect(() => {
    if (!user || !chatId) return;

    const markAsRead = async () => {
      try {
        await markMessagesAsRead(chatId, user.uid);
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    };

    markAsRead();
  }, [chatId, user, messages.length]);

  const handleSendMessage = async (text: string) => {
    if (!user) return;
    await sendMessage(chatId, user.uid, text);
  };

  const handleAvatarClick = () => {
    if (chat?.type === "private" && user) {
      const otherUserId = chat.participants.find((p) => p !== user.uid);
      if (otherUserId) {
        setProfileUserId(otherUserId);
        setProfileModalOpen(true);
      }
    }
  };

  const handleMessageLongPress = (message: Message, event?: React.MouseEvent) => {
    const position = event 
      ? { top: event.clientY, left: event.clientX }
      : { top: 200, left: 100 };
    setContextMenuAnchor(position);
    setContextMenuMessage(message);
  };

  const handleForward = (message: Message) => {
    setForwardMessageState(message);
    setForwardModalOpen(true);
  };

  const handleTypingStart = () => {
    if (!user) return;
    handleTyping(chatId, user.uid, user.displayName || "User", true);
  };

  const handleTypingEnd = () => {
    if (!user) return;
    handleTyping(chatId, user.uid, user.displayName || "User", false);
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
      <ChatHeader
        chat={chat}
        otherUser={otherUser}
        onBack={onBack}
        onAvatarClick={handleAvatarClick}
      />

      {typingUsers.length > 0 && <TypingIndicator typingUsers={typingUsers} />}

      <MessageList
        messages={messages}
        currentUserId={user?.uid || ""}
        onMessageLongPress={handleMessageLongPress}
      />

      <MessageInput
        onSend={handleSendMessage}
        onTypingStart={handleTypingStart}
        onTypingEnd={handleTypingEnd}
      />

      {/* Profile Modal */}
      {profileUserId && (
        <UserProfileModal
          open={profileModalOpen}
          onClose={() => {
            setProfileModalOpen(false);
            setProfileUserId(null);
          }}
          userId={profileUserId}
        />
      )}

      {/* Message Context Menu */}
      <MessageContextMenu
        message={contextMenuMessage}
        anchorPosition={contextMenuAnchor}
        onClose={() => {
          setContextMenuAnchor(null);
          setContextMenuMessage(null);
        }}
        chatId={chatId}
        userId={user?.uid || ""}
        onForward={handleForward}
      />

      {/* Forward Message Modal */}
      {forwardMessage && (
        <ForwardMessageModal
          open={forwardModalOpen}
          onClose={() => {
            setForwardModalOpen(false);
            setForwardMessageState(null);
          }}
          messageId={forwardMessage.id}
          chatId={chatId}
          messageText={forwardMessage.text}
        />
      )}
    </Box>
  );
};
