import api from "./index";

export function toggleLike(postId) {
  return api.post(`/posts/${postId}/like`);
}