import api from "./index";

export function getComments(postId) {
  return api.get(`/posts/${postId}/comments`);
}

export function addComment(postId, content) {
  return api.post(`/posts/${postId}/comments`, { content });
}
export function deleteComment(postId, commentId) {
  return api.delete(`/posts/${postId}/comments/${commentId}`);
}