import { doc, getDoc, serverTimestamp, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from '../config/firebase';
import { Role, UserProfile } from '../types/auth';

const toDate = (v: unknown): Date | null => (v instanceof Timestamp ? v.toDate() : null);

/** Creates the profile on first login (role is always "user"), otherwise refreshes lastLoginAt. */
export async function upsertUserProfile(user: User): Promise<UserProfile> {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  const base = {
    displayName: user.displayName ?? '',
    photoURL: user.photoURL ?? null,
    lastLoginAt: serverTimestamp(),
  };
  if (!snap.exists()) {
    await setDoc(ref, { uid: user.uid, email: user.email, role: 'user', createdAt: serverTimestamp(), ...base });
  } else {
    await updateDoc(ref, base);
  }
  const d = (await getDoc(ref)).data()!;
  return {
    uid: user.uid,
    displayName: d.displayName,
    email: d.email,
    photoURL: d.photoURL ?? null,
    role: (d.role as Role) ?? 'user',
    createdAt: toDate(d.createdAt),
    lastLoginAt: toDate(d.lastLoginAt),
  };
}
