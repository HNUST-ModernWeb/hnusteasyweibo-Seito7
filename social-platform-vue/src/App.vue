<template>
  <NavBar />
  <router-view />
  <ToastContainer />
</template>

<script setup>
import NavBar from "./components/NavBar.vue";
import ToastContainer from "./components/ToastContainer.vue";
</script>
