"use client";

export const useNoteURL = (): { id: string; key: string } => {
  const searchParams = new URLSearchParams(window?.location?.search || '');
  const id = searchParams.get('id') || '';
  const key = searchParams.get('key') || '';

  return { key, id };
};
