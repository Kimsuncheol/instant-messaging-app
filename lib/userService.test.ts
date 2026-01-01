import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchUsers } from './userService';
import { getDocs } from 'firebase/firestore';

// Mock getDocs specifically for this test
vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    getDocs: vi.fn(),
    collection: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    limit: vi.fn(),
  };
});


describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('searches users by email and name and merges results', async () => {
    const mockEmailDocs = [
      { id: '1', data: () => ({ uid: '1', email: 'test@example.com', displayName: 'Test User', photoURL: '' }) }
    ];
    const mockNameDocs = [
      { id: '2', data: () => ({ uid: '2', email: 'other@example.com', displayName: 'tester', photoURL: '' }) }
    ];

    vi.mocked(getDocs)
      .mockResolvedValueOnce({ forEach: (cb: (doc: any) => void) => mockEmailDocs.forEach(cb) } as any)
      .mockResolvedValueOnce({ forEach: (cb: (doc: any) => void) => mockNameDocs.forEach(cb) } as any);


    const results = await searchUsers('test');

    expect(results).toHaveLength(2);
    expect(results[0].uid).toBe('1');
    expect(results[1].uid).toBe('2');
    expect(getDocs).toHaveBeenCalledTimes(2);
  });

  it('removes duplicates when searching', async () => {
    const mockDocs = [
      { id: '1', data: () => ({ uid: '1', email: 'test@example.com', displayName: 'test', photoURL: '' }) }
    ];

    vi.mocked(getDocs)
      .mockResolvedValueOnce({ forEach: (cb: (doc: any) => void) => mockDocs.forEach(cb) } as any)
      .mockResolvedValueOnce({ forEach: (cb: (doc: any) => void) => mockDocs.forEach(cb) } as any);


    const results = await searchUsers('test');

    expect(results).toHaveLength(1);
    expect(results[0].uid).toBe('1');
  });
});
