<template>
  <main class="auth-page">
    <div class="auth-card">
      <h2 class="auth-title">注册 ShareHub</h2>
      <p class="auth-subtitle">加入社区，开始分享你的故事</p>

      <form class="auth-form" @submit.prevent="handleRegister">
        <!-- Avatar upload -->
        <div class="form-group">
          <label class="form-label">头像</label>
          <div class="avatar-upload-center">
            <div class="register-avatar" @click="$refs.avatarInput.click()">
              <img v-if="avatarPreview" :src="avatarPreview" class="avatar-img" alt="">
              <span v-else class="register-avatar-placeholder">+</span>
            </div>
            <p class="upload-hint-text">点击上传头像（可选）</p>
            <input ref="avatarInput" type="file" accept="image/*" class="image-input-hidden" @change="onAvatarChange">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">用户名 <span class="required">*</span></label>
          <input v-model="username" class="form-input" placeholder="3-50个字符" maxlength="50" required>
        </div>

        <div class="form-group">
          <label class="form-label">昵称</label>
          <input v-model="nickname" class="form-input" placeholder="给自己起个名字" maxlength="100">
        </div>

        <div class="form-group">
          <label class="form-label">密码 <span class="required">*</span></label>
          <input v-model="password" type="password" class="form-input" placeholder="至少6个字符" minlength="6" required>
        </div>

        <p v-if="error" class="form-error auth-error">{{ error }}</p>

        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
          {{ loading ? '注册中...' : '注册' }}
        </button>
      </form>

      <p class="auth-switch">
        已有账号？<router-link to="/login">立即登录</router-link>
      </p>
    </div>
  </main>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "../stores/auth";
import api from "../api/index";

const router = useRouter();
const { register, loading, error } = useAuth();

const username = ref("");
const nickname = ref("");
const password = ref("");
const avatarPreview = ref("");
const selectedAvatarFile = ref(null);

function onAvatarChange(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { error.value = "图片不能超过5MB"; return; }
  selectedAvatarFile.value = file;
  const reader = new FileReader();
  reader.onload = (ev) => { avatarPreview.value = ev.target.result; };
  reader.readAsDataURL(file);
  e.target.value = "";
}

async function uploadAvatar() {
  if (!selectedAvatarFile.value) return;
  const formData = new FormData();
  formData.append("file", selectedAvatarFile.value);
  try {
    await api.post("/user/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } catch { /* ignore avatar upload failure */ }
}

async function handleRegister() {
  const ok = await register(
    username.value,
    password.value,
    nickname.value || username.value
  );
  if (ok) {
    if (selectedAvatarFile.value) await uploadAvatar();
    router.push("/");
  }
}
</script>