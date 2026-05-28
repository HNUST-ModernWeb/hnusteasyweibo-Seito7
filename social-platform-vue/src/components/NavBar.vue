<template>
  <nav class="navbar">
    <div class="container nav-container">
      <router-link to="/" class="nav-logo">ShareHub</router-link>
      <ul class="nav-links" :class="{ open: menuOpen }">
        <li><router-link to="/" class="nav-link" exact-active-class="active" @click="menuOpen = false">发现</router-link></li>
        <li v-if="isLoggedIn"><router-link to="/publish" class="nav-link nav-publish-btn" active-class="active" @click="menuOpen = false">发布</router-link></li>
        <li v-if="isLoggedIn"><router-link to="/profile" class="nav-link" active-class="active" @click="menuOpen = false">我的</router-link></li>
        <li v-if="isGuest"><router-link to="/login" class="nav-link" @click="menuOpen = false">登录</router-link></li>
        <li v-if="isGuest"><router-link to="/register" class="nav-link nav-publish-btn" @click="menuOpen = false">注册</router-link></li>
        <li v-if="isLoggedIn">
          <a href="#" class="nav-link" @click.prevent="handleLogout">退出</a>
        </li>
      </ul>
      <button class="nav-toggle" @click="menuOpen = !menuOpen" aria-label="Toggle menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "../stores/auth";

const router = useRouter();
const { isLoggedIn, isGuest, logout } = useAuth();
const menuOpen = ref(false);

function handleLogout() {
  logout();
  menuOpen.value = false;
  router.push("/");
}
</script>