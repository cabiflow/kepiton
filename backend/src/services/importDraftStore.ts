import type { ParsedTask } from './claudeParser.js';

export interface ImportDraft {
  id: string;
  userId: string;
  projectId: string;
  tasks: ParsedTask[];
  createdAt: Date;
}

const drafts = new Map<string, ImportDraft>();
const ttlMs = 30 * 60 * 1000;

export function saveImportDraft(draft: ImportDraft) {
  cleanupImportDrafts();
  drafts.set(draft.id, draft);
}

export function takeImportDraft(id: string, userId: string) {
  cleanupImportDrafts();
  const draft = drafts.get(id);

  if (!draft || draft.userId !== userId) {
    return null;
  }

  drafts.delete(id);
  return draft;
}

function cleanupImportDrafts() {
  const now = Date.now();
  for (const [id, draft] of drafts.entries()) {
    if (now - draft.createdAt.getTime() > ttlMs) {
      drafts.delete(id);
    }
  }
}
