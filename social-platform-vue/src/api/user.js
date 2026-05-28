import api from "./index";

export function getMyProfile() {
  return api.get("/user/profile");
}

export function getUserProfile(userId) {
  return api.get(`/user/profile/${userId}`);
}

export function updateProfile(updates) {
  return api.put("/user/profile", updates);
}