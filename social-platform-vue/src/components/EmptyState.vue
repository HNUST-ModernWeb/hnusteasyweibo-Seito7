<template>
  <div class="empty-state">
    <span class="empty-icon">{{ icon }}</span>
    <p>{{ message }}</p>
    <slot></slot>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, default: "📭" },
  message: { type: String, default: "暂无内容" }
});
</script>
