import { ref } from "vue";

const STORAGE_KEY = "sharehub_liked";

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

const likedIds = ref(load());

export function useLikes() {
  function isLiked(postId) {
    return likedIds.value.includes(postId);
  }

  function toggleLike(postId) {
    const idx = likedIds.value.indexOf(postId);
    if (idx === -1) {
      likedIds.value.push(postId);
    } else {
      likedIds.value.splice(idx, 1);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(likedIds.value));
    return idx === -1; // true = liked, false = unliked
  }

  return { likedIds, isLiked, toggleLike };
}
