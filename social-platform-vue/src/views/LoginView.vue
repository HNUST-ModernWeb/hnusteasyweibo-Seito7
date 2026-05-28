<template>
  <main class="auth-page">
    <div class="auth-card">
      <h2 class="auth-title">登录 ShareHub</h2>
      <p class="auth-subtitle">欢迎回来，继续分享精彩</p>

      <form class="auth-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label">用户名</label>
          <input v-model="username" class="form-input" placeholder="请输入用户名" autocomplete="username" required>
        </div>

        <div class="form-group">
          <label class="form-label">密码</label>
          <input v-model="password" type="password" class="form-input" placeholder="请输入密码" autocomplete="current-password" required>
        </div>

        <p v-if="error" class="form-error auth-error">{{ error }}</p>

        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>

      <p class="auth-switch">
        还没有账号？<router-link to="/register">立即注册</router-link>
      </p>
    </div>
  </main>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "../stores/auth";

const router = useRouter();
const { login, loading, error } = useAuth();

const username = ref("");
const password = ref("");

async function handleLogin() {
  const ok = await login(username.value, password.value);
  if (ok) {
    router.push("/");
  }
}
</script>