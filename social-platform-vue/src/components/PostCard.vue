<template>
  <div class="post-card">
    <div class="post-header">
      <div class="post-avatar">
        <img v-if="authorAvatar" :src="authorAvatar" class="avatar-img" alt="">
        <span v-else>{{ post.author?.nickname?.[0] || '?' }}</span>
      </div>
      <div class="post-author-info">
        <span class="post-author-name">{{ post.author?.nickname || post.author?.username }}</span>
        <button
          v-if="isLoggedIn && !isOwner && post.author?.id"
          class="follow-btn"
          :class="{ following: isFollowing }"
          @click.stop="handleFollow"
          :disabled="followLoading"
        >{{ isFollowing ? '已关注' : '+ 关注' }}</button>
        <div class="post-meta">
          <span :title="post.createdAt">{{ timeAgo(post.createdAt) }}</span>
          <span class="post-visibility-badge">{{ visibilityLabel }}</span>
        </div>
      </div>
      <button v-if="isOwner" class="delete-post-btn" title="删除帖子" @click="handleDelete">&times;</button>
    </div>

    <div class="post-body">
      <p class="post-text">{{ post.content }}</p>
      <div v-if="post.images && post.images.length" class="post-image-grid">
        <img v-for="(img, i) in post.images" :key="i" :src="getImageUrl(img)" class="post-image" :alt="'Image ' + (i + 1)" @click="$emit('lightbox', getImageUrl(img))">
      </div>
    </div>

    <div class="post-actions">
      <button class="action-btn" :class="{ liked: localLiked }" @click="handleLike">
        {{ localLiked ? '已赞' : '点赞' }}
        <span class="action-count">{{ localLikeCount }}</span>
      </button>
      <button class="action-btn" @click="toggleComments">
        评论 <span class="action-count">{{ localCommentCount }}</span>
      </button>
    </div>

    <div v-show="showComments" class="comments-section">
      <div v-if="commentsLoading" class="loading-inline">加载评论中...</div>
      <div v-else-if="comments.length" class="comments-list">
        <div v-for="c in comments" :key="c.id" class="comment-item">
          <div class="comment-avatar">
            <img v-if="getCommentAvatar(c)" :src="getCommentAvatar(c)" class="avatar-img" alt="">
            <span v-else>{{ c.author?.nickname?.[0] || c.author?.username?.[0] || '?' }}</span>
          </div>
          <div class="comment-body">
            <span class="comment-author">{{ c.author?.nickname || c.author?.username }}</span>
            <p class="comment-text">{{ c.content }}</p>
            <span class="comment-time">{{ timeAgo(c.createdAt) }}</span>
          </div>
          <button v-if="isMyComment(c)" class="comment-delete-btn" title="删除评论" @click="handleDeleteComment(c.id)">&times;</button>
        </div>
      </div>
      <div v-if="isLoggedIn" class="comment-form">
        <input v-model="commentText" type="text" class="comment-input" placeholder="写下你的评论..." maxlength="200" @keydown.enter="submitComment">
        <button class="comment-submit" @click="submitComment" :disabled="commentSubmitting">{{ commentSubmitting ? '...' : '发送' }}</button>
      </div>
      <p v-else class="comment-login-hint"><router-link to="/login">登录</router-link>后参与评论</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuth } from "../stores/auth";
import { useToast } from "../composables/useToast";
import { timeAgo } from "../composables/utils";
import * as likesApi from "../api/likes";
import * as commentsApi from "../api/comments";
import * as postsApi from "../api/posts";
import * as followApi from "../api/follow";

const props = defineProps({ post: { type: Object, required: true } });
const emit = defineEmits(["lightbox", "updated", "deleted"]);

const { isLoggedIn, user } = useAuth();
const { show: showToast } = useToast();

const showComments = ref(false);
const commentText = ref("");
const commentSubmitting = ref(false);
const commentsLoading = ref(false);
const comments = ref([]);
const commentsLoaded = ref(false);
const deleting = ref(false);
const followLoading = ref(false);
const isFollowing = ref(false);

async function checkFollowState() {
  if (!isLoggedIn.value || !props.post.author?.id) return;
  try {
    const res = await followApi.checkFollow(props.post.author.id);
    if (res.code === 200) isFollowing.value = res.data.following;
  } catch {}
}

const localLikeCount = ref(props.post.likeCount);
const localCommentCount = ref(props.post.commentCount);
const localLiked = ref(!!props.post.liked);

const isOwner = computed(() => isLoggedIn.value && user.value && user.value.id === props.post.author?.id);

function isUrlAvatar(a) { return a && a.length > 2 && (a.startsWith("/api") || a.startsWith("http")); }

const authorAvatar = computed(() => {
  const a = props.post.author?.avatar;
  return isUrlAvatar(a) ? (a.startsWith("/api") ? "http://localhost:8080" + a : a) : null;
});

function getCommentAvatar(c) {
  const a = c.author?.avatar;
  return isUrlAvatar(a) ? (a.startsWith("/api") ? "http://localhost:8080" + a : a) : null;
}

function isMyComment(c) {
  return isLoggedIn.value && user.value && user.value.id === c.author?.id;
}

const visibilityLabel = computed(() => {
  const labels = { public: "公开", friends: "好友可见", private: "私密" };
  return labels[props.post.visibility] || "";
});

function getImageUrl(img) {
  if (img.startsWith("http") || img.startsWith("data:")) return img;
  return "http://localhost:8080" + img;
}

async function handleFollow() {
  if (!props.post.author?.id) return;
  followLoading.value = true;
  try {
    const res = await followApi.toggleFollow(props.post.author.id);
    if (res.code === 200) isFollowing.value = res.data.following;
  } catch (e) { showToast(e.message, "error"); }
  finally { followLoading.value = false; }
}

async function handleLike() {
  if (!isLoggedIn.value) { showToast("请先登录", "warning"); return; }
  try {
    const res = await likesApi.toggleLike(props.post.id);
    if (res.code === 200) { localLiked.value = res.data.liked; localLikeCount.value = res.data.likeCount; }
  } catch (e) { showToast(e.message, "error"); }
}

async function handleDelete() {
  if (!confirm("确定要删除这条帖子吗？")) return;
  try {
    const res = await postsApi.deletePost(props.post.id);
    if (res.code === 200) { showToast("帖子已删除", "success"); emit("deleted", props.post.id); }
    else showToast(res.message, "error");
  } catch (e) { showToast(e.message, "error"); }
}

async function handleDeleteComment(commentId) {
  if (!confirm("确定要删除这条评论吗？")) return;
  try {
    const res = await commentsApi.deleteComment(props.post.id, commentId);
    if (res.code === 200) {
      comments.value = comments.value.filter(c => c.id !== commentId);
      localCommentCount.value = Math.max(0, localCommentCount.value - 1);
      showToast("评论已删除", "success");
    } else showToast(res.message, "error");
  } catch (e) { showToast(e.message, "error"); }
}

async function toggleComments() {
  showComments.value = !showComments.value;
  if (showComments.value && !commentsLoaded.value) await loadComments();
}

async function loadComments() {
  commentsLoading.value = true;
  try {
    const res = await commentsApi.getComments(props.post.id);
    if (res.code === 200) { comments.value = res.data; commentsLoaded.value = true; }
  } catch (e) { showToast(e.message, "error"); }
  finally { commentsLoading.value = false; }
}

async function submitComment() {
  const text = commentText.value.trim();
  if (!text || commentSubmitting.value) return;
  if (!isLoggedIn.value) { showToast("请先登录", "warning"); return; }
  commentSubmitting.value = true;
  try {
    const res = await commentsApi.addComment(props.post.id, text);
    if (res.code === 200) { comments.value.push(res.data); localCommentCount.value++; commentText.value = ""; }
  } catch (e) { showToast(e.message, "error"); }
  finally { commentSubmitting.value = false; }
}

onMounted(() => { checkFollowState(); });
</script>