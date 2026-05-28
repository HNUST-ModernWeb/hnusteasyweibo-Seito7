import { ref, computed } from "vue";
import * as authApi from "../api/auth";
import * as userApi from "../api/user";

const user = ref(loadUser());
const token = ref(localStorage.getItem("sharehub_token") || "");
const loading = ref(false);
const error = ref("");

function loadUser() {
  try {
    const raw = localStorage.getItem("sharehub_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveAuth(t, u) {
  token.value = t;
  user.value = u;
  localStorage.setItem("sharehub_token", t);
  localStorage.setItem("sharehub_user", JSON.stringify(u));
}

export function useAuth() {
  const isLoggedIn = computed(() => !!token.value && !!user.value);
  const isGuest = computed(() => !isLoggedIn.value);

  async function login(username, password) {
    loading.value = true;
    error.value = "";
    try {
      const res = await authApi.login(username, password);
      if (res.code === 200) {
        saveAuth(res.data.token, {
          id: res.data.userId,
          username: res.data.username,
          nickname: res.data.nickname,
          avatar: res.data.avatar,
          bio: res.data.bio,
          location: res.data.location,
          createdAt: res.data.createdAt,
        });
        return true;
      }
      error.value = res.message;
      return false;
    } catch (e) {
      error.value = e.message;
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function register(username, password, nickname) {
    loading.value = true;
    error.value = "";
    try {
      const res = await authApi.register(username, password, nickname);
      if (res.code === 200) {
        saveAuth(res.data.token, {
          id: res.data.userId,
          username: res.data.username,
          nickname: res.data.nickname,
          avatar: res.data.avatar,
          createdAt: res.data.createdAt,
        });
        return true;
      }
      error.value = res.message;
      return false;
    } catch (e) {
      error.value = e.message;
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function refreshProfile() {
    if (!token.value) return;
    try {
      const res = await userApi.getMyProfile();
      if (res.code === 200) {
        user.value = {
          id: res.data.id,
          username: res.data.username,
          nickname: res.data.nickname,
          avatar: res.data.avatar,
          bio: res.data.bio,
          location: res.data.location,
          createdAt: res.data.createdAt,
        };
        localStorage.setItem("sharehub_user", JSON.stringify(user.value));
      }
    } catch {
      // ignore
    }
  }

  function logout() {
    token.value = "";
    user.value = null;
    localStorage.removeItem("sharehub_token");
    localStorage.removeItem("sharehub_user");
  }

  return {
    user,
    token,
    loading,
    error,
    isLoggedIn,
    isGuest,
    login,
    register,
    logout,
    refreshProfile,
  };
}