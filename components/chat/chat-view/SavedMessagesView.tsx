"use client";

import React, { useState } from "react";
import { Box } from "@mui/material";
import { useMemoChatroom } from "@/context/MemoChatroomContext";
import { MemoData } from "@/components/modals/MemoModal";
import { SavedMessagesHeader } from "./SavedMessagesHeader";
import { SavedMemosList } from "./SavedMemosList";
import { SavedMemoEditModal } from "./SavedMemoEditModal";
import { MessageInput } from "./MessageInput";
import { ForwardMessageModal } from "@/components/modals/ForwardMessageModal";
import { AISummaryDialog } from "./AISummaryDialog";
import { AIGenerateDialog } from "./AIGenerateDialog";
import { sendMessage } from "@/lib/chatService";
import { useAuth } from "@/context/AuthContext";
import {
  summarizeSavedMessages,
  generateNewContent,
  SummaryOutput,
  GenerationOutput,
} from "@/lib/ai";

interface SavedMessagesViewProps {
  chatroomId: string;
  onBack: () => void;
}

interface EditingMemo {
  id: string;
  title: string;
  content: string;
}

export const SavedMessagesView: React.FC<SavedMessagesViewProps> = ({
  chatroomId,
  onBack,
}) => {
  const { user } = useAuth();
  const {
    chatrooms,
    currentMemos,
    memosLoading,
    selectChatroom,
    deleteMemo,
    editMemo,
    saveMemoToChatroom,
  } = useMemoChatroom();

  // Edit modal state
  const [editingMemo, setEditingMemo] = useState<EditingMemo | null>(null);
  const [saving, setSaving] = useState(false);

  // Forward modal state
  const [forwardingMemo, setForwardingMemo] = useState<MemoData | null>(null);

  // AI state
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [summaryResult, setSummaryResult] = useState<SummaryOutput | null>(
    null
  );
  const [generateResult, setGenerateResult] = useState<GenerationOutput | null>(
    null
  );
  const [aiError, setAiError] = useState<string | undefined>();

  // Find the chatroom name
  const chatroom = chatrooms.find((c) => c.id === chatroomId);

  // Subscribe to this chatroom's memos
  React.useEffect(() => {
    selectChatroom(chatroomId);
    return () => selectChatroom(null);
  }, [chatroomId, selectChatroom]);

  const handleDeleteMemo = async (memoId: string) => {
    try {
      await deleteMemo(chatroomId, memoId);
    } catch (err) {
      console.error("Failed to delete memo:", err);
    }
  };

  const handleEditClick = (memo: MemoData, memoId: string) => {
    setEditingMemo({
      id: memoId,
      title: memo.title,
      content: memo.content,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingMemo) return;

    setSaving(true);
    try {
      await editMemo(chatroomId, editingMemo.id, {
        title: editingMemo.title.trim(),
        content: editingMemo.content.trim(),
      });
      setEditingMemo(null);
    } catch (err) {
      console.error("Failed to save memo:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCloseEdit = () => {
    setEditingMemo(null);
  };

  const handleMemoChange = (memo: EditingMemo) => {
    setEditingMemo(memo);
  };

  // Handle creating new memo from MessageInput
  const handleCreateMemo = async (text: string) => {
    if (!text.trim()) return;

    try {
      // Use first line as title, rest as content
      const lines = text.split("\n");
      const title = lines[0].trim() || "Quick Memo";
      const content = lines.slice(1).join("\n").trim() || lines[0].trim();

      await saveMemoToChatroom(chatroomId, {
        title,
        content,
      });
    } catch (err) {
      console.error("Failed to create memo:", err);
    }
  };

  // Handle forward memo
  const handleForwardMemo = (memo: MemoData) => {
    setForwardingMemo(memo);
  };

  // Handle memo forward to chat
  const handleMemoForwardToChat = async (
    targetChatId: string,
    memo: MemoData
  ) => {
    if (!user) return;
    try {
      // Send memo as a message to the chat
      await sendMessage(
        targetChatId,
        user.uid,
        `📝 ${memo.title}\n\n${memo.content}`,
        undefined, // poll
        undefined, // event
        undefined, // file
        undefined, // location
        undefined, // contact
        { title: memo.title, content: memo.content } // memo
      );
    } catch (err) {
      console.error("Failed to forward memo:", err);
    }
  };

  // AI Handlers
  const handleSummarize = async () => {
    setSummaryDialogOpen(true);
    setSummaryLoading(true);
    setAiError(undefined);
    setSummaryResult(null);

    try {
      const result = await summarizeSavedMessages(
        currentMemos.map((m) => ({ title: m.title, content: m.content }))
      );
      setSummaryResult(result);
    } catch (err) {
      console.error("Summarization failed:", err);
      setAiError("Failed to summarize. Please check your API key.");
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleGenerate = async (intent: string) => {
    setGenerateLoading(true);
    setAiError(undefined);
    setGenerateResult(null);

    try {
      const result = await generateNewContent(
        currentMemos.map((m) => ({ title: m.title, content: m.content })),
        intent
      );
      setGenerateResult(result);
    } catch (err) {
      console.error("Generation failed:", err);
      setAiError("Failed to generate. Please check your API key.");
    } finally {
      setGenerateLoading(false);
    }
  };

  const handleSaveGenerated = async (memo: {
    title: string;
    content: string;
  }) => {
    try {
      await saveMemoToChatroom(chatroomId, memo);
      setGenerateResult(null);
    } catch (err) {
      console.error("Failed to save generated memo:", err);
    }
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          bgcolor: "#111B21",
        }}
      >
        <SavedMessagesHeader
          chatroomName={chatroom?.name || "Saved Messages"}
          onBack={onBack}
          onSummarize={handleSummarize}
          onGenerate={() => {
            setGenerateDialogOpen(true);
            setGenerateResult(null);
            setAiError(undefined);
          }}
        />

        <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
          <SavedMemosList
            loading={memosLoading}
            memos={currentMemos}
            onEdit={handleEditClick}
            onDelete={handleDeleteMemo}
            onForward={handleForwardMemo}
          />
        </Box>

        {/* Message Input for creating new memos */}
        <MessageInput onSend={handleCreateMemo} disabled={false} />
      </Box>

      <SavedMemoEditModal
        open={Boolean(editingMemo)}
        memo={editingMemo}
        saving={saving}
        onSave={handleSaveEdit}
        onClose={handleCloseEdit}
        onChange={handleMemoChange}
      />

      {/* Forward Modal */}
      <ForwardMessageModal
        open={Boolean(forwardingMemo)}
        onClose={() => setForwardingMemo(null)}
        messageText={
          forwardingMemo
            ? `📝 ${forwardingMemo.title}\n\n${forwardingMemo.content}`
            : ""
        }
        memoData={forwardingMemo || undefined}
        onMemoForward={handleMemoForwardToChat}
      />

      {/* AI Dialogs */}
      <AISummaryDialog
        open={summaryDialogOpen}
        onClose={() => setSummaryDialogOpen(false)}
        loading={summaryLoading}
        summary={summaryResult}
        error={aiError}
        onRetry={handleSummarize}
      />

      <AIGenerateDialog
        open={generateDialogOpen}
        onClose={() => setGenerateDialogOpen(false)}
        loading={generateLoading}
        result={generateResult}
        error={aiError}
        onGenerate={handleGenerate}
        onSaveGenerated={handleSaveGenerated}
      />
    </>
  );
};
