import { realtimeDb } from "./firebase";
import { ref, onDisconnect, set, onValue, serverTimestamp, off } from "firebase/database";

export interface UserPresence {
  state: 'online' | 'offline';
  lastChanged: number;
}

// Initialize presence for the current user
export const initializePresence = (userId: string) => {
  const userStatusDatabaseRef = ref(realtimeDb, '/status/' + userId);
  const isOfflineForDatabase = {
    state: 'offline',
    lastChanged: serverTimestamp(),
  };
  const isOnlineForDatabase = {
    state: 'online',
    lastChanged: serverTimestamp(),
  };

  const connectedRef = ref(realtimeDb, '.info/connected');

  onValue(connectedRef, (snapshot) => {
    if (snapshot.val() === false) {
      return;
    }

    onDisconnect(userStatusDatabaseRef)
      .set(isOfflineForDatabase)
      .then(() => {
        set(userStatusDatabaseRef, isOnlineForDatabase);
      });
  });
};

// Cleanup presence (e.g., on logout)
export const cleanupPresence = (userId: string) => {
  const userStatusDatabaseRef = ref(realtimeDb, '/status/' + userId);
  const isOfflineForDatabase = {
    state: 'offline',
    lastChanged: serverTimestamp(),
  };
  set(userStatusDatabaseRef, isOfflineForDatabase);
};

// Subscribe to a single user's presence
export const subscribeToUserPresence = (userId: string, callback: (presence: UserPresence | null) => void) => {
  const userStatusDatabaseRef = ref(realtimeDb, '/status/' + userId);
  
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const handleValue = (snapshot: any) => {
    const data = snapshot.val();
    callback(data ? (data as UserPresence) : null);
  };

  onValue(userStatusDatabaseRef, handleValue);
  
  // Return an unsubscribe function
  return () => off(userStatusDatabaseRef, 'value', handleValue);

};

// Subscribe to multiple users' presence (helper)
export const subscribeToMultiplePresences = (userIds: string[], callback: (presences: Record<string, UserPresence>) => void) => {
  const listeners: Record<string, { ref: any, listener: (snapshot: any) => void }> = {};

  const data: Record<string, UserPresence> = {};

  userIds.forEach(uid => {
    const userStatusRef = ref(realtimeDb, '/status/' + uid);
    const listener = onValue(userStatusRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        data[uid] = val;
      } else {
        delete data[uid];
      }
      callback({ ...data }); // Emit copy
    });
    listeners[uid] = { ref: userStatusRef, listener };
  });

  return () => {
    Object.values(listeners).forEach(({ ref, listener }) => {
      off(ref, 'value', listener);
    });
  };
};
