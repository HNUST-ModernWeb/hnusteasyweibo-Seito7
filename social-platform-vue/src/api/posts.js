import api from "./index";

export function getFeed(page = 0, size = 10) {
  return api.get("/posts", { params: { page, size } });
}

export function getPost(postId) {
  return api.get(`/posts/${postId}`);
}

export function createPost(content, images, visibility) {
  return api.post("/posts", { content, images, visibility });
}

export function deletePost(postId) {
  return api.delete(`/posts/${postId}`);
}

export function getUserPosts(userId, page = 0, size = 10) {
  return api.get(`/posts/user/${userId}`, { params: { page, size } });
}