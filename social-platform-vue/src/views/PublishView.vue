<template>
  <main class="container publish-page">
    <div class="publish-card">
      <h2 class="publish-title">✏️ 发布新动态</h2>
      <p class="publish-subtitle">分享你的想法、照片和精彩瞬间</p>

      <form class="publish-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label class="form-label">说点什么吧 <span class="required">*</span></label>
          <div class="textarea-wrapper">
            <textarea
              v-model="content"
              class="form-textarea"
              :class="{ error: contentError }"
              rows="5"
              maxlength="2000"
              placeholder="分享你的新鲜事..."
            ></textarea>
            <span class="char-counter" :class="{ warning: charLen > 1800, danger: charLen > 1950 }">{{ charLen }} / 2000</span>
          </div>
          <p class="form-error">{{ contentError }}</p>
        </div>

        <div class="form-group">
          <label class="form-label">添加图片</label>
          <div class="image-upload-area">
            <div
              class="upload-zone"
              :class="{ 'drag-over': dragOver }"
              @click="$refs.fileInput.click()"
              @dragover.prevent="dragOver = true"
              @dragleave="dragOver = false"
              @drop.prevent="onDrop"
            >
              <span class="upload-icon">🖼️</span>
              <p>点击或拖拽图片到此处</p>
              <p class="upload-hint">支持 JPG、PNG、GIF，单张不超过 10MB</p>
              <input
                ref="fileInput"
                type="file"
                class="image-input-hidden"
                accept="image/jpeg,image/png,image/gif"
                multiple
                @change="onFileChange"
              >
            </div>
            <div v-if="previews.length" class="image-preview-grid">
              <div v-for="(p, i) in previews" :key="i" class="preview-item">
                <img :src="p" :alt="'Preview ' + (i + 1)">
                <button type="button" class="preview-remove" @click="removeImage(i)">&times;</button>
              </div>
            </div>
            <p v-if="uploading" class="upload-status">⏳ 上传图片中...</p>
          </div>
          <p class="form-error">{{ imageError }}</p>
        </div>

        <div class="form-group">
          <label class="form-label">可见范围</label>
          <div class="visibility-options">
            <label v-for="v in visibilities" :key="v.value" class="visibility-option">
              <input type="radio" name="visibility" :value="v.value" v-model="visibility">
              <span class="visibility-card">
                <span class="visibility-icon">{{ v.icon }}</span>
                <span class="visibility-label">{{ v.label }}</span>
                <span class="visibility-desc">{{ v.desc }}</span>
              </span>
            </label>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-outline" @click="saveDraft">💾 存草稿</button>
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            {{ submitting ? '⏳ 发布中...' : '🚀 发布动态' }}
          </button>
        </div>
      </form>
    </div>

    <div v-if="drafts.length" class="drafts-section">
      <h3>📝 草稿箱</h3>
      <div class="drafts-list">
        <div v-for="d in drafts" :key="d.id" class="draft-item">
          <span class="draft-preview" :title="d.content">{{ truncate(d.content, 40) }}</span>
          <div class="draft-actions">
            <button class="btn btn-sm btn-outline" @click="useDraft(d)">使用</button>
            <button class="btn btn-sm btn-danger" @click="deleteDraft(d.id)">删除</button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "../composables/useToast";
import { truncate } from "../composables/utils";
import * as postsApi from "../api/posts";
import * as filesApi from "../api/files";

const router = useRouter();
const { show: showToast } = useToast();

const content = ref("");
const contentError = ref("");
const imageError = ref("");
const visibility = ref("public");
const previews = ref([]);
const selectedFiles = ref([]);
const dragOver = ref(false);
const submitting = ref(false);
const uploading = ref(false);

const drafts = ref(loadDrafts());
const charLen = computed(() => content.value.length);

const visibilities = [
  { value: "public", icon: "🌍", label: "公开", desc: "所有人可见" },
  { value: "friends", icon: "👥", label: "好友可见", desc: "仅好友" },
  { value: "private", icon: "🔒", label: "私密", desc: "仅自己" },
];

function loadDrafts() {
  try { return JSON.parse(localStorage.getItem("sharehub_drafts")) || []; }
  catch { return []; }
}

function saveDraftsToDisk() {
  localStorage.setItem("sharehub_drafts", JSON.stringify(drafts.value));
}

function validate() {
  let valid = true;
  contentError.value = "";
  imageError.value = "";
  if (!content.value.trim()) { contentError.value = "请输入分享内容"; valid = false; }
  else if (content.value.trim().length < 2) { contentError.value = "内容至少需要2个字符"; valid = false; }
  return valid;
}

async function uploadImages() {
  if (selectedFiles.value.length === 0) return [];
  uploading.value = true;
  try {
    const res = await filesApi.uploadImages(selectedFiles.value);
    if (res.code === 200) {
      return res.data.urls || [];
    }
    if (res.data?.errors?.length) {
      showToast(res.data.errors.join("; "), "warning");
    }
    return res.data?.urls || [];
  } catch (e) {
    showToast("图片上传失败: " + e.message, "error");
    return [];
  } finally {
    uploading.value = false;
  }
}

async function handleSubmit() {
  if (!validate()) return;
  submitting.value = true;

  try {
    const imageUrls = await uploadImages();
    const res = await postsApi.createPost(content.value.trim(), imageUrls, visibility.value);

    if (res.code === 200) {
      showToast("发布成功！🎉", "success");
      content.value = "";
      previews.value = [];
      selectedFiles.value = [];
      setTimeout(() => router.push("/"), 1000);
    } else {
      showToast(res.message, "error");
    }
  } catch (e) {
    showToast(e.message, "error");
  } finally {
    submitting.value = false;
  }
}

function addFiles(files) {
  const valid = Array.from(files).filter((f) => {
    if (!f.type.startsWith("image/")) return false;
    if (f.size > 10 * 1024 * 1024) { showToast("部分图片超过10MB限制", "warning"); return false; }
    return true;
  });
  selectedFiles.value = [...selectedFiles.value, ...valid].slice(0, 9);
  updatePreviews();
}

function updatePreviews() {
  previews.value = [];
  selectedFiles.value.forEach((f, i) => {
    const reader = new FileReader();
    reader.onload = (e) => { previews.value[i] = e.target.result; };
    reader.readAsDataURL(f);
  });
}

function removeImage(index) {
  selectedFiles.value.splice(index, 1);
  previews.value.splice(index, 1);
}

function onFileChange(e) { if (e.target.files.length) addFiles(e.target.files); e.target.value = ""; }
function onDrop(e) { dragOver.value = false; if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files); }

function saveDraft() {
  if (!content.value.trim()) { showToast("草稿不能为空", "warning"); return; }
  drafts.value.push({ id: "draft_" + Date.now(), content: content.value.trim(), visibility: visibility.value });
  saveDraftsToDisk();
  content.value = "";
  previews.value = [];
  selectedFiles.value = [];
  showToast("已保存到草稿箱 📝", "success");
}

function useDraft(d) { content.value = d.content; visibility.value = d.visibility; deleteDraft(d.id); }
function deleteDraft(id) { drafts.value = drafts.value.filter((d) => d.id !== id); saveDraftsToDisk(); }
</script>