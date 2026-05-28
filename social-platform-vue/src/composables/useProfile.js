import { ref } from "vue";

const STORAGE_KEY = "sharehub_profile";

const DEFAULT = {
  name: "小明同学",
  bio: "热爱生活，分享美好 🌟",
  location: "北京",
  joinDate: "2024-01-15",
  avatar: "😊"
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { ...DEFAULT };
  } catch { return { ...DEFAULT }; }
}

const profile = ref(load());

export function useProfile() {
  function updateProfile(data) {
    Object.assign(profile.value, data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile.value));
  }

  function resetProfile() {
    Object.assign(profile.value, DEFAULT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile.value));
  }

  return { profile, updateProfile, resetProfile };
}
