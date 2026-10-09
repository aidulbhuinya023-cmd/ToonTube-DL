import {
  collection,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { DownloadJob, CliPreset } from '../types';
import { User } from 'firebase/auth';

export async function syncUserProfile(user: User): Promise<void> {
  const path = `users/${user.uid}`;
  try {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email || 'anonymous@user.com',
        displayName: (user.displayName || 'yt-dlp User').slice(0, 100),
        photoURL: (user.photoURL || '').slice(0, 500),
        createdAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeUserDownloads(
  userId: string,
  onData: (jobs: DownloadJob[]) => void,
  onError?: (err: any) => void
) {
  const path = `users/${userId}/downloads`;
  try {
    const q = query(collection(db, 'users', userId, 'downloads'), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const jobs: DownloadJob[] = [];
        snapshot.forEach((docSnap) => {
          jobs.push(docSnap.data() as DownloadJob);
        });
        onData(jobs);
      },
      (error) => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function addDownloadJob(userId: string, job: DownloadJob): Promise<void> {
  const path = `users/${userId}/downloads/${job.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'downloads', job.id);
    await setDoc(docRef, job);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateDownloadJobStatus(
  userId: string,
  jobId: string,
  updates: Partial<DownloadJob>
): Promise<void> {
  const path = `users/${userId}/downloads/${jobId}`;
  try {
    const docRef = doc(db, 'users', userId, 'downloads', jobId);
    const existing = await getDoc(docRef);
    if (existing.exists()) {
      const data = existing.data() as DownloadJob;
      await setDoc(docRef, {
        ...data,
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function removeDownloadJob(userId: string, jobId: string): Promise<void> {
  const path = `users/${userId}/downloads/${jobId}`;
  try {
    const docRef = doc(db, 'users', userId, 'downloads', jobId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeUserPresets(
  userId: string,
  onData: (presets: CliPreset[]) => void,
  onError?: (err: any) => void
) {
  const path = `users/${userId}/presets`;
  try {
    const q = query(collection(db, 'users', userId, 'presets'), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const presets: CliPreset[] = [];
        snapshot.forEach((docSnap) => {
          presets.push(docSnap.data() as CliPreset);
        });
        onData(presets);
      },
      (error) => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function addPreset(userId: string, preset: CliPreset): Promise<void> {
  const path = `users/${userId}/presets/${preset.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'presets', preset.id);
    await setDoc(docRef, preset);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function removePreset(userId: string, presetId: string): Promise<void> {
  const path = `users/${userId}/presets/${presetId}`;
  try {
    const docRef = doc(db, 'users', userId, 'presets', presetId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
