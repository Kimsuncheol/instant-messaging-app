import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveMemo, getMemos, updateMemo, deleteMemo } from '@/lib/memoService';
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';

// Mock dependencies are already defined in setupTests.ts
// but we need to control their behavior for specific tests

describe('memoService', () => {
  const userId = 'test-user-id';
  const memoData = { title: 'Test Title', content: 'Test Content' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveMemo', () => {
    it('should call addDoc with correct parameters', async () => {
      const mockDocRef = { id: 'memo-id' };
      vi.mocked(addDoc).mockResolvedValueOnce(mockDocRef as never);

      const id = await saveMemo(userId, memoData);

      expect(collection).toHaveBeenCalledWith(expect.anything(), 'users', userId, 'memos');
      expect(addDoc).toHaveBeenCalled();
      expect(id).toBe('memo-id');
    });
  });

  describe('getMemos', () => {
    it('should return a list of memos', async () => {
      const mockSnapshot = {
        docs: [
          {
            id: 'id1',
            data: () => ({ title: 'Memo 1', content: 'Content 1' }),
          },
          {
            id: 'id2',
            data: () => ({ title: 'Memo 2', content: 'Content 2' }),
          },
        ],
      };
      vi.mocked(getDocs).mockResolvedValueOnce(mockSnapshot as never);

      const memos = await getMemos(userId);

      expect(query).toHaveBeenCalled();
      expect(orderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(memos).toHaveLength(2);
      expect(memos[0].id).toBe('id1');
      expect(memos[1].title).toBe('Memo 2');
    });
  });

  describe('updateMemo', () => {
    it('should call updateDoc with partial data', async () => {
      const memoId = 'memo-id';
      const updateData = { content: 'New Content' };

      await updateMemo(userId, memoId, updateData);

      expect(updateDoc).toHaveBeenCalled();
    });
  });

  describe('deleteMemo', () => {
    it('should call deleteDoc', async () => {
      const memoId = 'memo-id';

      await deleteMemo(userId, memoId);

      expect(deleteDoc).toHaveBeenCalled();
    });
  });
});
