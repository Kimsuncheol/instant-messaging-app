import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initializePresence, cleanupPresence, subscribeToUserPresence, subscribeToMultiplePresences } from './presenceService';

const mockRef = vi.fn().mockReturnValue('mock-ref');

const mockSet = vi.fn().mockResolvedValue(undefined);
const mockOnValue = vi.fn();
const mockOff = vi.fn();
const mockOnDisconnect = vi.fn().mockReturnValue({ set: mockSet });

// Mock Firebase Realtime Database
vi.mock('firebase/database', () => ({
  getDatabase: vi.fn(),
  ref: (...args: any[]) => mockRef(...args),
  onDisconnect: (...args: any[]) => mockOnDisconnect(...args),
  set: (...args: any[]) => mockSet(...args),
  onValue: (...args: any[]) => mockOnValue(...args),
  serverTimestamp: vi.fn(() => 1234567890), // Fixed timestamp for testing
  off: (...args: any[]) => mockOff(...args),
}));

// Mock the local firebase app initialization
vi.mock('./firebase', () => ({
  realtimeDb: {},
}));

describe('presenceService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initializePresence', () => {
    it('sets up offline/online handlers', async () => {
      mockOnValue.mockImplementation((ref, callback) => {
        // Simulate connection established
        callback({ val: () => true });
      });

      initializePresence('user123');
      
      // Wait for promises to resolve
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockOnDisconnect).toHaveBeenCalled();
      // Expect offline to be set on disconnect
      expect(mockSet).toHaveBeenCalledWith({ state: 'offline', lastChanged: 1234567890 });
      // Expect online to be set immediately

      expect(mockSet).toHaveBeenCalledWith(expect.anything(), { state: 'online', lastChanged: 1234567890 });
    });
  });

  describe('subscribeToUserPresence', () => {
    it('subscribes to updates', () => {
      let callbackRef: any;
      mockOnValue.mockImplementation((ref, cb) => {
        callbackRef = cb;
        return vi.fn(); // unsubscribe function
      });

      const callback = vi.fn();
      const unsubscribe = subscribeToUserPresence('user123', callback);

      // Simulate an update
      callbackRef({ val: () => ({ state: 'online', lastChanged: 100 }) });

      expect(callback).toHaveBeenCalledWith({ state: 'online', lastChanged: 100 });
      
      unsubscribe();
      expect(mockOff).toHaveBeenCalled();
    });
  });

  describe('subscribeToMultiplePresences', () => {
    it('tracks multiple users', () => {
      // Mock onValue to capture subscriptions
      const listeners: Record<string, any> = {};
      mockOnValue.mockImplementation((ref: any, cb: any) => {
        // ref is a mock call, we can't easily extract the path string from the mock call args in this setup without more complex mocking.
        // Simplified: just store the callback. 
        // In reality, we'd map "ref" to user ID.
        // For this test, let's assume sequential calls match the input array order.
        return vi.fn();
      });

      const callback = vi.fn();
      subscribeToMultiplePresences(['u1', 'u2'], callback);

      expect(mockOnValue).toHaveBeenCalledTimes(2);
    });
  });
});
