import { useState, useEffect, useRef } from 'react';
import { ref, get, set, remove, onValue, off, push, type DatabaseReference } from 'firebase/database';
import { type User } from 'firebase/auth';
import { db } from '../firebase/config';
import type { Household, Entry, Member } from '../types';

const MEMBER_COLORS = ['#E07A5F', '#3D8B8F', '#6B4E71', '#E9C46A', '#2A9D8F', '#E76F51'];

export function useHousehold(user: User | null) {
  const [household, setHousehold] = useState<Household | null>(null);
  const [entries, setEntries]     = useState<Entry[]>([]);
  const [loading, setLoading]     = useState(false);
  const entriesRefObj             = useRef<DatabaseReference | null>(null);

  useEffect(() => {
    if (!user) { setHousehold(null); setEntries([]); return; }
    setLoading(true);
    get(ref(db, `userHouseholds/${user.uid}`)).then(snap => {
      if (snap.exists()) loadHousehold(snap.val());
      else setLoading(false);
    });
    return () => {
      if (entriesRefObj.current) off(entriesRefObj.current);
    };
  }, [user]);

  async function loadHousehold(hid: string) {
    const snap = await get(ref(db, `households/${hid}`));
    if (!snap.exists()) {
      if (user) await remove(ref(db, `userHouseholds/${user.uid}`));
      setLoading(false);
      return;
    }
    const data: Household = { id: hid, ...snap.val() };
    setHousehold(data);

    if (entriesRefObj.current) off(entriesRefObj.current);
    entriesRefObj.current = ref(db, `households/${hid}/entries`);
    onValue(entriesRefObj.current, s => {
      const val = s.val();
      setEntries(val ? Object.values<Entry>(val).sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()) : []);
      setLoading(false);
    });
  }

  async function createBoard(boardName: string, displayName: string) {
    if (!user) return;
    const uid  = user.uid;
    const code = Math.random().toString(36).substr(2, 6).toUpperCase();
    const hid  = push(ref(db, 'households')).key!;
    await set(ref(db, `households/${hid}`), {
      name: boardName, inviteCode: code, createdAt: new Date().toISOString(), createdBy: uid,
      members: { [uid]: { displayName, email: user.email, color: MEMBER_COLORS[0], joinedAt: new Date().toISOString(), role: 'admin' } },
    });
    await set(ref(db, `userHouseholds/${uid}`), hid);
    await set(ref(db, `inviteCodes/${code}`), hid);
    await loadHousehold(hid);
  }

  async function joinBoard(code: string, displayName: string) {
    if (!user) return;
    const codeSnap = await get(ref(db, `inviteCodes/${code.toUpperCase()}`));
    if (!codeSnap.exists()) throw new Error('Invalid invite code. Check and try again.');
    const hid      = codeSnap.val();
    const uid      = user.uid;
    const colorIdx = Math.floor(Math.random() * (MEMBER_COLORS.length - 1)) + 1;
    await set(ref(db, `households/${hid}/members/${uid}`), {
      displayName, email: user.email, color: MEMBER_COLORS[colorIdx], joinedAt: new Date().toISOString(), role: 'member',
    });
    await set(ref(db, `userHouseholds/${uid}`), hid);
    await loadHousehold(hid);
  }

  async function leaveBoard() {
    if (!user || !household) return;
    await remove(ref(db, `households/${household.id}/members/${user.uid}`));
    await remove(ref(db, `userHouseholds/${user.uid}`));
    if (entriesRefObj.current) { off(entriesRefObj.current); entriesRefObj.current = null; }
    setHousehold(null); setEntries([]);
  }

  async function deleteBoard() {
    if (!user || !household) return;
    await remove(ref(db, `households/${household.id}`));
    await remove(ref(db, `inviteCodes/${household.inviteCode}`));
    await remove(ref(db, `userHouseholds/${user.uid}`));
    if (entriesRefObj.current) { off(entriesRefObj.current); entriesRefObj.current = null; }
    setHousehold(null); setEntries([]);
  }

  async function promoteToAdmin(uid: string) {
    if (!household) return;
    await set(ref(db, `households/${household.id}/members/${uid}/role`), 'admin');
    setHousehold(prev => prev ? { ...prev, members: { ...prev.members, [uid]: { ...prev.members[uid], role: 'admin' } } } : null);
  }

  function saveEntries(updated: Entry[]) {
    if (!household) return;
    const obj: Record<string, Entry> = {};
    updated.forEach(e => { obj[e.id] = e; });
    set(ref(db, `households/${household.id}/entries`), obj);
  }

  function addEntry(text: string, category: string, author: string): Entry {
    const e: Entry = {
      id: Date.now().toString(), text: text.trim(), author, category,
      ts: new Date().toISOString(), acked: false, ackedBy: null,
      completed: false, completedBy: null, completedAt: null, dueDate: null, notes: '',
    };
    const updated = [e, ...entries];
    setEntries(updated);
    saveEntries(updated);
    return e;
  }

  function updateEntry(id: string, changes: Partial<Entry>) {
    const updated = entries.map(e => e.id === id ? { ...e, ...changes } : e);
    setEntries(updated);
    saveEntries(updated);
  }

  function deleteEntry(id: string) {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    saveEntries(updated);
  }

  function getMyRole(): 'admin' | 'member' {
    if (!household || !user) return 'member';
    const role = household.members?.[user.uid]?.role;
    if (role) return role;
    return household.createdBy === user.uid ? 'admin' : 'member';
  }

  function getMemberColor(displayName: string): string {
    if (!household?.members) return '#888';
    const m = Object.values(household.members).find((m: Member) => m.displayName === displayName);
    return m?.color || '#888';
  }

  function repairInviteCode() {
    if (!household?.inviteCode || !household?.id) return;
    set(ref(db, `inviteCodes/${household.inviteCode}`), household.id).catch(() => {});
  }

  return {
    household, entries, loading,
    createBoard, joinBoard, leaveBoard, deleteBoard, promoteToAdmin,
    addEntry, updateEntry, deleteEntry,
    getMyRole, getMemberColor, repairInviteCode,
  };
}
