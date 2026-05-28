<template>
  <teleport to="body">
    <div v-if="visible" class="lightbox-overlay" @click.self="close" @keydown.esc="close">
      <button class="lightbox-close" @click="close">&times;</button>
      <img :src="src" alt="查看大图">
    </div>
  </teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const visible = ref(false);
const src = ref("");

function open(imgSrc) {
  src.value = imgSrc;
  visible.value = true;
}

function close() {
  visible.value = false;
}

function onKeydown(e) {
  if (e.key === "Escape" && visible.value) close();
}

onMounted(() => document.addEventListener("keydown", onKeydown));
onUnmounted(() => document.removeEventListener("keydown", onKeydown));

defineExpose({ open, close });
</script>
