<template>
  <main class="container profile-page">
    <section class="profile-header-card">
      <div class="profile-cover"></div>
      <div class="profile-info">
        <div class="profile-avatar" @click="triggerAvatarUpload">
          <img v-if="userAvatar" :src="userAvatar" class="avatar-img" alt="avatar">
          <span v-else class="avatar-emoji">{{ user?.nickname?.[0] || '?' }}</span>
          <div class="avatar-overlay">换头像</div>
        </div>
        <input ref="avatarInput" type="file" accept="image/*" class="image-input-hidden" @change="onAvatarChange">
        <div class="profile-details">
          <h1 class="profile-name">{{ user?.nickname || user?.username || 'Unknown' }}</h1>
          <p class="profile-bio">{{ user?.bio || '这个人很懒，什么都没写...' }}</p>
          <div class="profile-meta">
            <span v-if="user?.location">📍 {{ user.location }}</span>
            <span>📅 {{ (user?.createdAt || '').slice(0, 4) }}年加入</span>
          </div>
          <div class="profile-stats">
            <div class="stat-item">
              <span class="stat-value">{{ myPosts.length }}</span>
              <span class="stat-label">动态</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ totalLikes }}</span>
              <span class="stat-label">获赞</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ followerCount }}</span>
              <span class="stat-label">粉丝</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ followingCount }}</span>
              <span class="stat-label">关注</span>
            </div>
          </div>
        </div>
        <button class="btn btn-outline edit-profile-btn" @click="openEditModal">编辑资料</button>
      </div>
    </section>

    <!-- Edit Profile Modal -->
    <teleport to="body">
      <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
        <div class="modal-card">
          <div class="modal-header">
            <h3>编辑个人资料</h3>
            <button class="modal-close" @click="showEditModal = false">&times;</button>
          </div>
          <form class="modal-form" @submit.prevent="saveProfile">
            <div class="form-group">
              <label class="form-label">头像</label>
              <div class="avatar-upload-row">
                <img v-if="avatarPreview" :src="avatarPreview" class="avatar-preview-sm">
                <span v-else class="avatar-placeholder">?</span>
                <button type="button" class="btn btn-sm btn-outline" @click="triggerModalAvatar">上传头像</button>
                <input ref="modalAvatarInput" type="file" accept="image/*" class="image-input-hidden" @change="onModalAvatarChange">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">昵称 <span class="required">*</span></label>
              <input v-model="editForm.nickname" class="form-input" maxlength="50" required>
              <p class="form-error">{{ editErrors.nickname }}</p>
            </div>
            <div class="form-group">
              <label class="form-label">个人简介</label>
              <textarea v-model="editForm.bio" class="form-textarea" rows="3" maxlength="200"></textarea>
              <span class="char-counter">{{ (editForm.bio || '').length }} / 200</span>
            </div>
            <div class="form-group">
              <label class="form-label">所在地</label>
              <input v-model="editForm.location" class="form-input" maxlength="30">
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-outline" @click="showEditModal = false">取消</button>
              <button type="submit" class="btn btn-primary" :disabled="savingProfile">
                {{ savingProfile ? '保存中...' : '保存' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </teleport>

    <section class="profile-tabs">
      <button class="profile-tab" :class="{ active: activeTab === 'posts' }" @click="activeTab = 'posts'">我的动态</button>
    </section>

    <section class="profile-content">
      <div v-if="postLoading" class="loading-state">
        <span class="loading-spinner"></span>
        <p>加载中...</p>
      </div>
      <div v-else-if="postError" class="empty-state">
        <span class="empty-icon">⚠️</span>
        <p>{{ postError }}</p>
        <button class="btn btn-outline" @click="fetchMyPosts">重试</button>
      </div>
      <div v-else class="post-list">
        <PostCard
          v-for="post in myPosts"
          :key="post.id"
          :post="post"
          @lightbox="(src) => lightboxRef?.open(src)"
          @updated="fetchMyPosts"
          @deleted="onPostDeleted"
        />
      </div>
      <EmptyState v-if="!postLoading && !postError && myPosts.length === 0" message="还没有发布过动态" icon="📭">
        <router-link to="/publish" class="btn btn-primary">去发布第一条</router-link>
      </EmptyState>
    </section>

    <LightBox ref="lightboxRef" />
  </main>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import PostCard from "../components/PostCard.vue";
import EmptyState from "../components/EmptyState.vue";
import LightBox from "../components/LightBox.vue";
import { useAuth } from "../stores/auth";
import { useToast } from "../composables/useToast";
import * as userApi from "../api/user";
import * as postsApi from "../api/posts";
import api from "../api/index";
import * as followApi from "../api/follow";

const { user, refreshProfile } = useAuth();
const { show: showToast } = useToast();

const lightboxRef = ref(null);
const activeTab = ref("posts");
const showEditModal = ref(false);
const savingProfile = ref(false);
const postLoading = ref(true);
const postError = ref("");
const myPosts = ref([]);
const avatarInput = ref(null);
const modalAvatarInput = ref(null);
const avatarPreview = ref("");
const selectedAvatarFile = ref(null);

const editForm = reactive({ nickname: "", bio: "", location: "" });
const editErrors = reactive({ nickname: "" });

const followerCount = ref(0);
const followingCount = ref(0);
const totalLikes = computed(() => myPosts.value.reduce((s, p) => s + (p.likeCount || 0), 0));

const userAvatar = computed(() => {
  const a = user.value?.avatar;
  if (!a || a.length <= 2) return null; // emoji, not a URL
  return a.startsWith("/api") ? "http://localhost:8080" + a : a;
});

function triggerAvatarUpload() { avatarInput.value?.click(); }

async function onAvatarChange(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  await uploadAvatar(file);
  e.target.value = "";
}

function triggerModalAvatar() { modalAvatarInput.value?.click(); }

function onModalAvatarChange(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  selectedAvatarFile.value = file;
  const reader = new FileReader();
  reader.onload = (ev) => { avatarPreview.value = ev.target.result; };
  reader.readAsDataURL(file);
  e.target.value = "";
}

async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const res = await api.post("/user/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (res.code === 200) {
      await refreshProfile();
      showToast("头像已更新", "success");
    }
  } catch (e) {
    showToast(e.message || "上传失败", "error");
  }
}

function openEditModal() {
  editForm.nickname = user.value?.nickname || "";
  editForm.bio = user.value?.bio || "";
  editForm.location = user.value?.location || "";
  editErrors.nickname = "";
  avatarPreview.value = userAvatar.value || "";
  selectedAvatarFile.value = null;
  showEditModal.value = true;
}

async function saveProfile() {
  const name = editForm.nickname.trim();
  if (!name) { editErrors.nickname = "昵称不能为空"; return; }
  savingProfile.value = true;
  try {
    if (selectedAvatarFile.value) {
      await uploadAvatar(selectedAvatarFile.value);
    }
    const res = await userApi.updateProfile({
      nickname: name,
      bio: editForm.bio.trim(),
      location: editForm.location.trim(),
    });
    if (res.code === 200) {
      await refreshProfile();
      showEditModal.value = false;
      showToast("个人资料已更新", "success");
    }
  } catch (e) {
    showToast(e.message, "error");
  } finally {
    savingProfile.value = false;
  }
}

function onPostDeleted(postId) {
  myPosts.value = myPosts.value.filter(p => p.id !== postId);
}

async function fetchMyPosts() {
  postLoading.value = true;
  postError.value = "";
  try {
    const res = await postsApi.getUserPosts(user.value.id);
    if (res.code === 200) {
      myPosts.value = res.data.content;
    }
  } catch (e) {
    postError.value = e.message;
  } finally {
    postLoading.value = false;
  }
}

async function fetchFollowStats() {
  try {
    const res = await followApi.checkFollow(user.value.id);
    if (res.code === 200) {
      followerCount.value = res.data.followerCount;
      followingCount.value = res.data.followingCount;
    }
  } catch { }
}

onMounted(() => {
  refreshProfile();
  fetchMyPosts();
  fetchFollowStats();
});
</script>