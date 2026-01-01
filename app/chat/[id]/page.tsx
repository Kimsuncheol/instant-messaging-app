"use client";

import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ChatView } from "@/components/chat/ChatView";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { useEffect } from "react";

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const chatId = params.id as string;

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) return null;

  return (
    <ChatView 
      chatId={chatId} 
      onBack={() => router.push("/")}
    />
  );
}
