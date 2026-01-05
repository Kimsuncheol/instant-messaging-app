"use client";

import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { sendMessage, subscribeToMessages, getChatById, Chat, markMessagesAsRead, Message, Poll, voteOnPoll, rsvpToEvent } from "@/lib/chatService";
import { useAuth } from "@/context/AuthContext";
import { useCall } from "@/context/CallContext";
import { getUserById, UserProfile } from "@/lib/userService";
import { handleTyping, subscribeToTyping, clearTyping } from "@/lib/typingService";
import { ChatHeader } from "./chat-view/ChatHeader";
import { MessageList } from "./chat-view/MessageList";
import { MessageInput } from "./chat-view/MessageInput";
import { TypingIndicator } from "./chat-view/TypingIndicator";
import { UserProfileModal } from "@/components/modals/UserProfileModal";
import { MessageContextMenu } from "./MessageContextMenu";
import { ForwardMessageModal } from "@/components/modals/ForwardMessageModal";
import { PollCreationModal } from "@/components/modals/PollCreationModal";
import { EventCreationModal } from "@/components/modals/EventCreationModal";
import { CameraModal } from "@/components/modals/CameraModal";
import { LocationModal, LocationData } from "@/components/modals/LocationModal";
import { ContactPickerModal } from "@/components/modals/ContactPickerModal";
import { MemoModal, MemoData } from "@/components/modals/MemoModal";
import { Event, ContactData } from "@/lib/chatService";
import { useChatSearch } from "@/lib/hooks/useChatSearch";
import { ChatSearchBar } from "./ChatSearchBar";

interface ChatViewProps {
  chatId: string;
  onBack?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({ chatId, onBack }) => {
  const { user } = useAuth();
  const { startCall } = useCall();
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
  
  // Poll modal state
  const [pollModalOpen, setPollModalOpen] = useState(false);
  // Event modal state
  const [eventModalOpen, setEventModalOpen] = useState(false);
  // Camera modal state
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  // Location modal state
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  // Contact modal state
  const [contactModalOpen, setContactModalOpen] = useState(false);
  // Memo modal state
  const [memoModalOpen, setMemoModalOpen] = useState(false);
  // Save to memo state
  const [saveToMemoContent, setSaveToMemoContent] = useState<string | null>(null);

  const { 
    searchTerm, 
    handleSearch, 
    matches, 
    currentMatchIndex, 
    navigate, 
    clearSearch,
    currentMatchId 
  } = useChatSearch(messages);
  const [showSearch, setShowSearch] = useState(false);

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

  // Unified sendMessage handler supporting text, poll, event, file, and location
  const handleSendMessage = async (
    text: string, 
    poll?: Omit<Poll, "id" | "totalVotes" | "createdAt">, 
    event?: Omit<Event, "id" | "createdAt">,
    file?: File,
    location?: LocationData,
    contact?: ContactData,
    memo?: MemoData
  ) => {
    if (!user) return;
    
    // Handle file upload if present
    if (file) {
       try {
         await sendMessage(chatId, user.uid, text, poll, event, file);
       } catch (err) {
         console.error("Error sending captured image:", err);
       }
       return;
    }
    
    // Handle location if present
    if (location) {
      await sendMessage(chatId, user.uid, text, poll, event, undefined, location);
      return;
    }
    
    // Handle contact if present
    if (contact) {
      await sendMessage(chatId, user.uid, text, poll, event, undefined, undefined, contact);
      return;
    }

    // Handle memo if present
    if (memo) {
      await sendMessage(chatId, user.uid, text, poll, event, undefined, undefined, undefined, memo);
      return;
    }
    
    // Handle standard message
    await sendMessage(chatId, user.uid, text, poll, event);
  };



  const handlePollVote = async (messageId: string, optionId: string) => {
    if (!user) return;
    try {
      await voteOnPoll(chatId, messageId, optionId, user.uid, false); 
    } catch (error) {
      console.error("Error voting on poll:", error);
    }
  };

  const handleEventRSVP = async (messageId: string, status: 'going' | 'maybe' | 'declined') => {
    if (!user) return;
    try {
      await rsvpToEvent(chatId, messageId, user.uid, status);
    } catch (error) {
      console.error("Error responding to event:", error);
    }
  };

  const handleCameraCapture = (file: File) => {
    handleSendMessage("", undefined, undefined, file);
  };

  const handleLocationSend = (locationData: LocationData) => {
    handleSendMessage("", undefined, undefined, undefined, locationData);
  };

  const handleContactSend = (contact: ContactData) => {
    handleSendMessage("", undefined, undefined, undefined, undefined, contact);
  };

  const handleMemoSend = (memo: MemoData, forwardToSelf?: boolean) => {
    handleSendMessage("", undefined, undefined, undefined, undefined, undefined, memo);
    // TODO: If forwardToSelf is true, also send to self-chat
    if (forwardToSelf) {
      console.log("Forward to self-chat:", memo);
    }
    setSaveToMemoContent(null);
  };

  const handleSaveToMemo = (content: string) => {
    setSaveToMemoContent(content);
    setMemoModalOpen(true);
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

  // Call handlers
  const handleVoiceCall = () => {
    if (chat?.type === "private" && user && otherUser) {
      const otherUserId = chat.participants.find((p) => p !== user.uid);
      if (otherUserId) {
        startCall(chatId, otherUserId, otherUser.displayName || "User", "voice");
      }
    }
  };

  const handleVideoCall = () => {
    if (chat?.type === "private" && user && otherUser) {
      const otherUserId = chat.participants.find((p) => p !== user.uid);
      if (otherUserId) {
        startCall(chatId, otherUserId, otherUser.displayName || "User", "video");
      }
    }
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
        onSearchClick={() => setShowSearch(true)}
      />

      {showSearch && (
        <ChatSearchBar 
          searchTerm={searchTerm}
          onSearch={handleSearch}
          currentMatchIndex={currentMatchIndex}
          totalMatches={matches.length}
          onNext={() => navigate('next')}
          onPrev={() => navigate('prev')}
          onClose={() => {
            setShowSearch(false);
            clearSearch();
          }}
        />
      )}

      {typingUsers.length > 0 && <TypingIndicator typingUsers={typingUsers} />}

      <MessageList
        messages={messages}
        currentUserId={user?.uid || ""}
        onMessageLongPress={handleMessageLongPress}
        onPollVote={handlePollVote}
        onEventRSVP={handleEventRSVP}
        onSaveToMemo={handleSaveToMemo}
        searchTerm={searchTerm}
        currentMatchId={currentMatchId}
      />

      <MessageInput
        onSend={handleSendMessage}
        onTypingStart={handleTypingStart}
        onTypingEnd={handleTypingEnd}
        onVoiceCall={handleVoiceCall}
        onVideoCall={handleVideoCall}
        onPollCreate={() => setPollModalOpen(true)}
        onEventCreate={() => setEventModalOpen(true)}
        onCameraClick={() => setCameraModalOpen(true)}
        onLocationClick={() => setLocationModalOpen(true)}
        onContactClick={() => setContactModalOpen(true)}
        onMemoClick={() => setMemoModalOpen(true)}
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
        onSaveToMemo={handleSaveToMemo}
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
      
      {/* Poll Creation Modal */}
      <PollCreationModal
        open={pollModalOpen}
        onClose={() => setPollModalOpen(false)}
        onCreatePoll={(poll) => handleSendMessage("", poll)}
        userId={user?.uid || ""}
      />

      {/* Event Creation Modal */}
      <EventCreationModal
        open={eventModalOpen}
        onClose={() => setEventModalOpen(false)}
        onCreateEvent={(event) => handleSendMessage("", undefined, event)}
        userId={user?.uid || ""}
      />

      {/* Camera Modal */}
      <CameraModal
        open={cameraModalOpen}
        onClose={() => setCameraModalOpen(false)}
        onCapture={handleCameraCapture}
      />

      {/* Location Modal */}
      <LocationModal
        open={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        onSend={handleLocationSend}
      />

      {/* Contact Picker Modal */}
      <ContactPickerModal
        open={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        onSelect={handleContactSend}
      />

      {/* Memo Modal */}
      <MemoModal
        open={memoModalOpen}
        onClose={() => {
          setMemoModalOpen(false);
          setSaveToMemoContent(null);
        }}
        onSend={handleMemoSend}
        initialContent={saveToMemoContent || ""}
      />
    </Box>
  );
};
