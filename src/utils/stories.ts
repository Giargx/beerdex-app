// Helper utility to track viewed vs unviewed Instagram-style stories

export const getSeenStories = (): Set<string> => {
  try {
    const raw = localStorage.getItem('beerdex_seen_stories');
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
};

export const markStorySeen = (storyId: string) => {
  if (!storyId) return;
  try {
    const seen = getSeenStories();
    if (!seen.has(storyId)) {
      seen.add(storyId);
      localStorage.setItem('beerdex_seen_stories', JSON.stringify(Array.from(seen)));
      window.dispatchEvent(new Event('beerdex_stories_updated'));
    }
  } catch {}
};

export const isUserStoryUnseen = (userStories: any[], seenSet?: Set<string>): boolean => {
  if (!userStories || userStories.length === 0) return false;
  const set = seenSet || getSeenStories();
  return userStories.some((s) => {
    const id = s?.postId || s?.id || s?.time;
    return id ? !set.has(String(id)) : false;
  });
};
