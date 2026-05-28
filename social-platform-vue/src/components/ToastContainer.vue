<template>
  <div class="toast-container">
    <TransitionGroup name="toast">
      <div v-for="t in toasts" :key="t.id" :class="['toast', t.type]">
        <span>{{ icon(t.type) }}</span> {{ t.message }}
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useToast } from "../composables/useToast";
const { toasts } = useToast();

function icon(type) {
  const icons = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };
  return icons[type] || "ℹ️";
}
</script>
