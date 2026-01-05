import { describe, it, expect } from "vitest";
import { Timestamp } from "firebase/firestore";

// Types matching chatService
interface Chat {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageAt: Timestamp;
  type: 'private' | 'group';
  pinnedAt?: Record<string, number>;
}

// Pure functions for testing (same logic as chatService)
const isPinned = (chat: Chat, userId: string): boolean => {
  return chat.pinnedAt?.[userId] !== undefined;
};

const getPinnedAt = (chat: Chat, userId: string): number | undefined => {
  return chat.pinnedAt?.[userId];
};

// Sorting function (same logic as ChatList.tsx)
const sortChats = (chats: Chat[], userId: string): Chat[] => {
  return [...chats].sort((a, b) => {
    const aIsPinned = isPinned(a, userId);
    const bIsPinned = isPinned(b, userId);
    
    // Both pinned: sort by pinnedAt descending
    if (aIsPinned && bIsPinned) {
      const aPinnedAt = getPinnedAt(a, userId) || 0;
      const bPinnedAt = getPinnedAt(b, userId) || 0;
      return bPinnedAt - aPinnedAt;
    }
    
    // One pinned, one not: pinned comes first
    if (aIsPinned && !bIsPinned) return -1;
    if (!aIsPinned && bIsPinned) return 1;
    
    // Both not pinned: sort by lastMessageAt descending
    const aTime = a.lastMessageAt?.toMillis?.() || 0;
    const bTime = b.lastMessageAt?.toMillis?.() || 0;
    return bTime - aTime;
  });
};

// Helper to create mock Timestamp
const mockTimestamp = (ms: number): Timestamp => ({
  toMillis: () => ms,
  toDate: () => new Date(ms),
  seconds: Math.floor(ms / 1000),
  nanoseconds: (ms % 1000) * 1000000,
  isEqual: () => false,
  valueOf: () => ms.toString(),
}) as unknown as Timestamp;

describe("Chat Sorting with Pinned Reordering", () => {
  const userId = "user1";
  
  // Create base chats ordered by lastMessageAt: A, B, C, D, E
  const createChats = () => [
    { id: "A", participants: [], lastMessage: "", lastMessageAt: mockTimestamp(5000), type: "private" as const },
    { id: "B", participants: [], lastMessage: "", lastMessageAt: mockTimestamp(4000), type: "private" as const },
    { id: "C", participants: [], lastMessage: "", lastMessageAt: mockTimestamp(3000), type: "private" as const },
    { id: "D", participants: [], lastMessage: "", lastMessageAt: mockTimestamp(2000), type: "private" as const },
    { id: "E", participants: [], lastMessage: "", lastMessageAt: mockTimestamp(1000), type: "private" as const },
  ];

  // ===== BASIC TESTS =====
  describe("Basic Ordering", () => {
    it("should return chats in lastMessageAt order when none are pinned", () => {
      const chats = createChats();
      const sorted = sortChats(chats, userId);
      expect(sorted.map(c => c.id)).toEqual(["A", "B", "C", "D", "E"]);
    });

    it("when pinning A -> A pinned, B, C, D, E", () => {
      const chats = createChats();
      chats[0].pinnedAt = { [userId]: 100 };
      const sorted = sortChats(chats, userId);
      expect(sorted.map(c => c.id)).toEqual(["A", "B", "C", "D", "E"]);
    });

    it("after pinning A, when pinning B -> B pinned, A pinned, C, D, E", () => {
      const chats = createChats();
      chats[0].pinnedAt = { [userId]: 100 }; // A pinned earlier
      chats[1].pinnedAt = { [userId]: 200 }; // B pinned later
      const sorted = sortChats(chats, userId);
      expect(sorted.map(c => c.id)).toEqual(["B", "A", "C", "D", "E"]);
    });

    it("after pinning B, when pinning C -> C pinned, B pinned, A pinned, D, E", () => {
      const chats = createChats();
      chats[0].pinnedAt = { [userId]: 100 }; // A
      chats[1].pinnedAt = { [userId]: 200 }; // B
      chats[2].pinnedAt = { [userId]: 300 }; // C pinned latest
      const sorted = sortChats(chats, userId);
      expect(sorted.map(c => c.id)).toEqual(["C", "B", "A", "D", "E"]);
    });
  });

  // ===== RE-PINNING TESTS =====
  describe("Re-pinning Behavior", () => {
    it("re-pinning B after C is pinned -> B pinned, C pinned, A pinned, D, E", () => {
      const chats = createChats();
      chats[0].pinnedAt = { [userId]: 100 }; // A
      chats[1].pinnedAt = { [userId]: 400 }; // B re-pinned latest
      chats[2].pinnedAt = { [userId]: 300 }; // C
      const sorted = sortChats(chats, userId);
      expect(sorted.map(c => c.id)).toEqual(["B", "C", "A", "D", "E"]);
    });

    it("re-pinning A after B is pinned -> A pinned, B pinned, C pinned, D, E", () => {
      const chats = createChats();
      chats[0].pinnedAt = { [userId]: 500 }; // A re-pinned latest
      chats[1].pinnedAt = { [userId]: 400 }; // B
      chats[2].pinnedAt = { [userId]: 300 }; // C
      const sorted = sortChats(chats, userId);
      expect(sorted.map(c => c.id)).toEqual(["A", "B", "C", "D", "E"]);
    });

    it("pinning E after A, B, C are pinned -> E pinned, A pinned, B pinned, C pinned, D", () => {
      const chats = createChats();
      chats[0].pinnedAt = { [userId]: 500 }; // A
      chats[1].pinnedAt = { [userId]: 400 }; // B
      chats[2].pinnedAt = { [userId]: 300 }; // C
      chats[4].pinnedAt = { [userId]: 600 }; // E pinned latest
      const sorted = sortChats(chats, userId);
      expect(sorted.map(c => c.id)).toEqual(["E", "A", "B", "C", "D"]);
    });

    it("re-pinning B after E is pinned -> B pinned, E pinned, A pinned, C pinned, D", () => {
      const chats = createChats();
      chats[0].pinnedAt = { [userId]: 500 }; // A
      chats[1].pinnedAt = { [userId]: 700 }; // B re-pinned latest
      chats[2].pinnedAt = { [userId]: 300 }; // C
      chats[4].pinnedAt = { [userId]: 600 }; // E
      const sorted = sortChats(chats, userId);
      expect(sorted.map(c => c.id)).toEqual(["B", "E", "A", "C", "D"]);
    });

    it("re-pinning C after B is pinned -> C pinned, B pinned, E pinned, A pinned, D", () => {
      const chats = createChats();
      chats[0].pinnedAt = { [userId]: 500 }; // A
      chats[1].pinnedAt = { [userId]: 700 }; // B
      chats[2].pinnedAt = { [userId]: 800 }; // C re-pinned latest
      chats[4].pinnedAt = { [userId]: 600 }; // E
      const sorted = sortChats(chats, userId);
      expect(sorted.map(c => c.id)).toEqual(["C", "B", "E", "A", "D"]);
    });
  });

  // ===== UNPINNING TESTS =====
  describe("Unpinning Behavior", () => {
    it("unpinning E -> C pinned, B pinned, A pinned, D, E (E returns to lastMessageAt order)", () => {
      const chats = createChats();
      chats[0].pinnedAt = { [userId]: 500 }; // A
      chats[1].pinnedAt = { [userId]: 700 }; // B
      chats[2].pinnedAt = { [userId]: 800 }; // C
      // E is not pinned
      const sorted = sortChats(chats, userId);
      expect(sorted.map(c => c.id)).toEqual(["C", "B", "A", "D", "E"]);
    });

    it("unpinning A -> C pinned, B pinned, A, D, E (A returns to lastMessageAt order)", () => {
      const chats = createChats();
      // A is not pinned
      chats[1].pinnedAt = { [userId]: 700 }; // B
      chats[2].pinnedAt = { [userId]: 800 }; // C
      const sorted = sortChats(chats, userId);
      expect(sorted.map(c => c.id)).toEqual(["C", "B", "A", "D", "E"]);
    });

    it("pinning D after unpinning A -> D pinned, C pinned, B pinned, A, E", () => {
      const chats = createChats();
      // A is not pinned
      chats[1].pinnedAt = { [userId]: 700 }; // B
      chats[2].pinnedAt = { [userId]: 800 }; // C
      chats[3].pinnedAt = { [userId]: 900 }; // D pinned latest
      const sorted = sortChats(chats, userId);
      expect(sorted.map(c => c.id)).toEqual(["D", "C", "B", "A", "E"]);
    });

    it("unpinning B -> D pinned, C pinned, A, B, E (B returns to lastMessageAt order)", () => {
      const chats = createChats();
      // A, B not pinned
      chats[2].pinnedAt = { [userId]: 800 }; // C
      chats[3].pinnedAt = { [userId]: 900 }; // D
      const sorted = sortChats(chats, userId);
      expect(sorted.map(c => c.id)).toEqual(["D", "C", "A", "B", "E"]);
    });
  });

  // ===== EDGE CASES =====
  describe("Edge Cases", () => {
    it("single chat - not pinned", () => {
      const chats = [createChats()[0]];
      const sorted = sortChats(chats, userId);
      expect(sorted.map(c => c.id)).toEqual(["A"]);
    });

    it("single chat - pinned", () => {
      const chats = [createChats()[0]];
      chats[0].pinnedAt = { [userId]: 100 };
      const sorted = sortChats(chats, userId);
      expect(sorted.map(c => c.id)).toEqual(["A"]);
    });

    it("empty chat list", () => {
      const chats: Chat[] = [];
      const sorted = sortChats(chats, userId);
      expect(sorted).toEqual([]);
    });

    it("all chats pinned should be sorted by pinnedAt descending", () => {
      const chats = createChats();
      chats[0].pinnedAt = { [userId]: 500 }; // A
      chats[1].pinnedAt = { [userId]: 400 }; // B
      chats[2].pinnedAt = { [userId]: 300 }; // C
      chats[3].pinnedAt = { [userId]: 200 }; // D
      chats[4].pinnedAt = { [userId]: 100 }; // E
      const sorted = sortChats(chats, userId);
      expect(sorted.map(c => c.id)).toEqual(["A", "B", "C", "D", "E"]);
    });

    it("all chats pinned in reverse order", () => {
      const chats = createChats();
      chats[0].pinnedAt = { [userId]: 100 }; // A pinned first
      chats[1].pinnedAt = { [userId]: 200 }; // B
      chats[2].pinnedAt = { [userId]: 300 }; // C
      chats[3].pinnedAt = { [userId]: 400 }; // D
      chats[4].pinnedAt = { [userId]: 500 }; // E pinned last
      const sorted = sortChats(chats, userId);
      expect(sorted.map(c => c.id)).toEqual(["E", "D", "C", "B", "A"]);
    });

    it("same pinnedAt timestamp - should maintain relative order", () => {
      const chats = createChats();
      chats[0].pinnedAt = { [userId]: 100 };
      chats[1].pinnedAt = { [userId]: 100 };
      const sorted = sortChats(chats, userId);
      // Both pinned at same time, should be pinned but order depends on sort stability
      expect(sorted.slice(0, 2).map(c => c.id).sort()).toEqual(["A", "B"]);
      expect(sorted.slice(2).map(c => c.id)).toEqual(["C", "D", "E"]);
    });

    it("same lastMessageAt - pinned should still come first", () => {
      const chats = [
        { id: "A", participants: [], lastMessage: "", lastMessageAt: mockTimestamp(1000), type: "private" as const },
        { id: "B", participants: [], lastMessage: "", lastMessageAt: mockTimestamp(1000), type: "private" as const },
      ];
      chats[1].pinnedAt = { [userId]: 100 };
      const sorted = sortChats(chats, userId);
      expect(sorted[0].id).toBe("B"); // pinned first
      expect(sorted[1].id).toBe("A");
    });

    it("null/undefined lastMessageAt - should handle gracefully", () => {
      const chats = [
        { id: "A", participants: [], lastMessage: "", lastMessageAt: mockTimestamp(1000), type: "private" as const },
        { id: "B", participants: [], lastMessage: "", lastMessageAt: undefined as unknown as Timestamp, type: "private" as const },
      ];
      const sorted = sortChats(chats, userId);
      expect(sorted[0].id).toBe("A"); // has timestamp, comes first
      expect(sorted[1].id).toBe("B");
    });

    it("chat pinned by different user should not affect current user's view", () => {
      const chats = createChats();
      chats[4].pinnedAt = { "otherUser": 1000 }; // E pinned by someone else
      const sorted = sortChats(chats, userId);
      expect(sorted.map(c => c.id)).toEqual(["A", "B", "C", "D", "E"]); // E not at top for userId
    });

    it("mixed pins by different users", () => {
      const chats = createChats();
      chats[0].pinnedAt = { [userId]: 100, "otherUser": 500 }; // A pinned by both
      chats[4].pinnedAt = { [userId]: 200 }; // E pinned only by userId
      const sorted = sortChats(chats, userId);
      expect(sorted[0].id).toBe("E"); // E pinned latest by userId
      expect(sorted[1].id).toBe("A"); // A pinned earlier by userId
    });
  });

  // ===== COMPLEX SCENARIOS =====
  describe("Complex Scenarios", () => {
    it("interleaved pin/unpin sequence: pin C, pin A, unpin C, pin B", () => {
      // End state: B pinned latest, A pinned, C not pinned
      const chats = createChats();
      chats[0].pinnedAt = { [userId]: 200 }; // A pinned second
      chats[1].pinnedAt = { [userId]: 400 }; // B pinned last
      // C was unpinned
      const sorted = sortChats(chats, userId);
      expect(sorted.map(c => c.id)).toEqual(["B", "A", "C", "D", "E"]);
    });

    it("rapid re-pin: click pin on A 5 times (final state: A pinned latest)", () => {
      const chats = createChats();
      chats[1].pinnedAt = { [userId]: 100 }; // B pinned
      chats[0].pinnedAt = { [userId]: 500 }; // A re-pinned last (5th click)
      const sorted = sortChats(chats, userId);
      expect(sorted.map(c => c.id)).toEqual(["A", "B", "C", "D", "E"]);
    });

    it("pin last chat in list (E) - should move to top", () => {
      const chats = createChats();
      chats[4].pinnedAt = { [userId]: 100 };
      const sorted = sortChats(chats, userId);
      expect(sorted[0].id).toBe("E");
      expect(sorted.slice(1).map(c => c.id)).toEqual(["A", "B", "C", "D"]);
    });

    it("unpin only pinned chat - all back to lastMessageAt order", () => {
      const chats = createChats();
      // No pins
      const sorted = sortChats(chats, userId);
      expect(sorted.map(c => c.id)).toEqual(["A", "B", "C", "D", "E"]);
    });

    it("alternating pattern: A, C, E pinned", () => {
      const chats = createChats();
      chats[0].pinnedAt = { [userId]: 100 }; // A
      chats[2].pinnedAt = { [userId]: 200 }; // C
      chats[4].pinnedAt = { [userId]: 300 }; // E
      const sorted = sortChats(chats, userId);
      expect(sorted.map(c => c.id)).toEqual(["E", "C", "A", "B", "D"]);
    });

    it("pin middle chats only: B, C, D pinned", () => {
      const chats = createChats();
      chats[1].pinnedAt = { [userId]: 100 }; // B
      chats[2].pinnedAt = { [userId]: 200 }; // C
      chats[3].pinnedAt = { [userId]: 300 }; // D
      const sorted = sortChats(chats, userId);
      expect(sorted.map(c => c.id)).toEqual(["D", "C", "B", "A", "E"]);
    });

    it("large number of chats - performance sanity check", () => {
      const chats: Chat[] = [];
      for (let i = 0; i < 100; i++) {
        chats.push({
          id: `chat${i}`,
          participants: [],
          lastMessage: "",
          lastMessageAt: mockTimestamp(100 - i), // descending
          type: "private",
        });
      }
      // Pin every 10th chat
      for (let i = 0; i < 100; i += 10) {
        chats[i].pinnedAt = { [userId]: i * 10 };
      }
      const sorted = sortChats(chats, userId);
      // First 10 should be pinned (in reverse pinnedAt order)
      const pinnedIds = sorted.slice(0, 10).map(c => c.id);
      expect(pinnedIds).toEqual(["chat90", "chat80", "chat70", "chat60", "chat50", "chat40", "chat30", "chat20", "chat10", "chat0"]);
    });

    it("very old message but recently pinned should be at top", () => {
      const chats = [
        { id: "old", participants: [], lastMessage: "", lastMessageAt: mockTimestamp(1), type: "private" as const, pinnedAt: { [userId]: 9999 } },
        { id: "new", participants: [], lastMessage: "", lastMessageAt: mockTimestamp(9999), type: "private" as const },
      ];
      const sorted = sortChats(chats, userId);
      expect(sorted[0].id).toBe("old"); // pinned takes priority
      expect(sorted[1].id).toBe("new");
    });

    it("newest message but earliest pinned should be below later pins", () => {
      const chats = [
        { id: "A", participants: [], lastMessage: "", lastMessageAt: mockTimestamp(9999), type: "private" as const, pinnedAt: { [userId]: 100 } },
        { id: "B", participants: [], lastMessage: "", lastMessageAt: mockTimestamp(1), type: "private" as const, pinnedAt: { [userId]: 200 } },
      ];
      const sorted = sortChats(chats, userId);
      expect(sorted[0].id).toBe("B"); // pinned later
      expect(sorted[1].id).toBe("A"); // pinned earlier (even with newer message)
    });
  });
});

