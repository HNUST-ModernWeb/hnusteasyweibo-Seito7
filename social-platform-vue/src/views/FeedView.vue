<template>
  <main class="container main-layout">
    <aside class="sidebar">
      <div class="sidebar-card quick-post-card">
        <h3>快速分享</h3>
        <p class="quick-post-hint">有什么新鲜事想告诉大家？</p>
        <router-link v-if="isLoggedIn" to="/publish" class="btn btn-primary btn-block">✏️ 发布动态</router-link>
        <router-link v-else to="/login" class="btn btn-primary btn-block">🔐 登录后发布</router-link>
      </div>

    </aside>

    <section class="feed">
      <div class="feed-header">
        <h2>📋 最新动态</h2>
        <div class="feed-filter">
          <button
            v-for="f in filters"
            :key="f.key"
            class="filter-btn"
            :class="{ active: currentFilter === f.key }"
            @click="currentFilter = f.key"
          >{{ f.label }}</button>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <span class="loading-spinner"></span>
        <p>加载中...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="loadError" class="empty-state">
        <span class="empty-icon">⚠️</span>
        <p>{{ loadError }}</p>
        <button class="btn btn-outline" @click="fetchFeed">重试</button>
      </div>

      <!-- 内容 -->
      <div v-else class="post-list">
        <PostCard
          v-for="post in filteredPosts"
          :key="post.id"
          :post="post"
          @lightbox="(src) => lightboxRef?.open(src)"
          @updated="fetchFeed"
          @deleted="onPostDeleted"
        />
        <EmptyState v-if="filteredPosts.length === 0" message="暂无动态" />
      </div>

      <div v-if="!loading && totalPages > currentPage + 1" class="load-more-container">
        <button class="btn btn-outline" @click="loadMore" :disabled="loadingMore">
          {{ loadingMore ? '加载中...' : '加载更多' }}
        </button>
      </div>
    </section>

    <LightBox ref="lightboxRef" />
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import PostCard from "../components/PostCard.vue";
import EmptyState from "../components/EmptyState.vue";
import LightBox from "../components/LightBox.vue";
import { useAuth } from "../stores/auth";
import * as postsApi from "../api/posts";

const { isLoggedIn } = useAuth();
const lightboxRef = ref(null);

const posts = ref([]);
const loading = ref(true);
const loadingMore = ref(false);
const loadError = ref("");
const currentPage = ref(0);
const totalPages = ref(0);


const filters = [
  { key: 'all', label: '全部' },
  { key: 'public', label: '公开' },
  { key: 'friends', label: '好友可见' },
];

const currentFilter = ref("all");

function onPostDeleted(postId) {
  posts.value = posts.value.filter(p => p.id !== postId);
}

const filteredPosts = computed(() => {
  if (currentFilter.value === "public") return posts.value.filter((p) => p.visibility === "public");
  if (currentFilter.value === "friends") return posts.value.filter((p) => p.visibility === "friends");
  return posts.value;
});

async function fetchFeed(page = 0) {
  if (page === 0) {
    loading.value = true;
    loadError.value = "";
  }
  try {
    const res = await postsApi.getFeed(page, 10);
    if (res.code === 200) {
      if (page === 0) {
        posts.value = res.data.content;
      } else {
        posts.value.push(...res.data.content);
      }
      currentPage.value = res.data.currentPage;
      totalPages.value = res.data.totalPages;
    }
  } catch (e) {
    loadError.value = e.message;
  } finally {
    loading.value = false;
  }
}

async function loadMore() {
  loadingMore.value = true;
  await fetchFeed(currentPage.value + 1);
  loadingMore.value = false;
}

onMounted(() => fetchFeed());
</script>