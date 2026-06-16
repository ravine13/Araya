import { useSyncExternalStore } from "react";
import { fetchSavedJobIds, saveJob as apiSave, unsaveJob as apiUnsave } from "@/lib/savedJobs";

type Listener = () => void;
const listeners = new Set<Listener>();

let cachedIds: string[] = [];
let loaded = false;
let loading = false;

function emit() {
  for (const l of listeners) l();
}

function getSnapshot(): string[] {
  return cachedIds;
}

export function useSavedJobIds(): string[] {
  return useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange);
      return () => listeners.delete(onStoreChange);
    },
    getSnapshot,
    () => [],
  );
}

export function isJobSaved(jobId: string): boolean {
  return cachedIds.includes(jobId);
}

export async function hydrateSavedJobIds(): Promise<void> {
  if (loading) return;
  loading = true;
  try {
    cachedIds = await fetchSavedJobIds();
    loaded = true;
    emit();
  } finally {
    loading = false;
  }
}

export async function toggleSavedJob(jobId: string): Promise<boolean> {
  const wasSaved = cachedIds.includes(jobId);
  if (wasSaved) {
    await apiUnsave(jobId);
    cachedIds = cachedIds.filter((id) => id !== jobId);
  } else {
    await apiSave(jobId);
    cachedIds = [...cachedIds, jobId];
  }
  emit();
  return !wasSaved;
}

export function setSavedIds(ids: string[]) {
  cachedIds = ids;
  loaded = true;
  emit();
}
