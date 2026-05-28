import api from "./index";

export function toggleFollow(userId) {
  return api.post(`/user/follow/${userId}`);
}

export function checkFollow(userId) {
  return api.get(`/user/follow/${userId}`);
}