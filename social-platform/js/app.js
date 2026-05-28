/* ============================================================
   ShareHub - 社交分享平台 核心脚本
   数据管理 / 渲染 / 交互 / 验证 / 工具
   ============================================================ */

// ==================== 工具函数 ====================

function generateId() {
  return "post_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
}

function timeAgo(dateStr) {
  var now = Date.now();
  var then = new Date(dateStr).getTime();
  var diff = now - then;
  var minutes = Math.floor(diff / 60000);
  var hours = Math.floor(diff / 3600000);
  var days = Math.floor(diff / 86400000);
  if (minutes < 1) return "刚刚";
  if (minutes < 60) return minutes + " 分钟前";
  if (hours < 24) return hours + " 小时前";
  if (days < 7) return days + " 天前";
  var d = new Date(dateStr);
  return (d.getMonth() + 1) + "月" + d.getDate() + "日";
}

function truncate(text, maxLen) {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + "...";
}

function escapeHTML(str) {
  var div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ==================== 数据层 ====================

var STORAGE_KEY_POSTS = "sharehub_posts";
var STORAGE_KEY_DRAFTS = "sharehub_drafts";
var STORAGE_KEY_PROFILE = "sharehub_profile";
var STORAGE_KEY_LIKED = "sharehub_liked";

var DEFAULT_PROFILE = {
  name: "小明同学",
  bio: "热爱生活，分享美好 🌟",
  location: "北京",
  joinDate: "2024-01-15",
  avatar: "😊"
};

var SEED_POSTS = [
  {
    id: "seed_1",
    author: "小明同学",
    authorAvatar: "😊",
    content: "今天开始使用 ShareHub！这是一个全新的社交分享平台，欢迎大家一起来分享生活中的精彩瞬间 🎉",
    images: [],
    visibility: "public",
    likes: 12,
    comments: [
      { id: "c1", author: "小红", text: "欢迎欢迎！平台越来越热闹了~" },
      { id: "c2", author: "小刚", text: "界面很漂亮！期待更多功能" }
    ],
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: "seed_2",
    author: "旅行达人小李",
    authorAvatar: "🧳",
    content: "周末去了趟长城，天气特别好，拍了几张照片分享给大家 📸\n\n长城真的是人类建筑史上的奇迹，每次来都有不同的感受。推荐大家错峰出行，人少的时候体验感翻倍！",
    images: [],
    visibility: "public",
    likes: 28,
    comments: [
      { id: "c3", author: "小明同学", text: "太美了！我也想去" }
    ],
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: "seed_3",
    author: "美食博主阿花",
    authorAvatar: "🍜",
    content: "分享一个懒人版红烧肉的做法：\n\n1️⃣ 五花肉切块焯水\n2️⃣ 炒糖色，加入肉块翻炒\n3️⃣ 加生抽、老抽、料酒、八角\n4️⃣ 加水炖40分钟\n5️⃣ 大火收汁\n\n简单又好吃，大家可以试试！",
    images: [],
    visibility: "public",
    likes: 45,
    comments: [],
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString()
  },
  {
    id: "seed_4",
    author: "健身教练大刘",
    authorAvatar: "💪",
    content: "今日训练打卡 💯\n\n胸肌 + 三头肌，强度拉满！\n坚持健身3个月了，体脂从22%降到16%，继续加油！",
    images: [],
    visibility: "friends",
    likes: 8,
    comments: [],
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: "seed_5",
    author: "程序员老王",
    authorAvatar: "💻",
    content: "花了三个月时间，终于把自己的开源项目 Star 破千了！感谢大家的支持 🎉\n\n技术栈：React + TypeScript + Node.js\n\n项目地址会放在评论区，感兴趣的朋友可以去看看~",
    images: [],
    visibility: "public",
    likes: 36,
    comments: [
      { id: "c4", author: "小明同学", text: "大佬太强了！Star 了" },
      { id: "c5", author: "前端小张", text: "已学习，代码质量很高" },
      { id: "c6", author: "后端老李", text: "Node.js 的架构设计很赞" }
    ],
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

function initStorage() {
  if (!localStorage.getItem(STORAGE_KEY_POSTS)) {
    localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(SEED_POSTS));
  }
  if (!localStorage.getItem(STORAGE_KEY_DRAFTS)) {
    localStorage.setItem(STORAGE_KEY_DRAFTS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEY_PROFILE)) {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(DEFAULT_PROFILE));
  }
  if (!localStorage.getItem(STORAGE_KEY_LIKED)) {
    localStorage.setItem(STORAGE_KEY_LIKED, JSON.stringify([]));
  }
}

function getPosts() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY_POSTS)) || []; } catch(e) { return []; }
}

function savePosts(posts) {
  localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(posts));
}

function getDrafts() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY_DRAFTS)) || []; } catch(e) { return []; }
}

function saveDrafts(drafts) {
  localStorage.setItem(STORAGE_KEY_DRAFTS, JSON.stringify(drafts));
}

function getProfile() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY_PROFILE)) || DEFAULT_PROFILE; } catch(e) { return DEFAULT_PROFILE; }
}

function saveProfile(profile) {
  localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
}

function getLikedIds() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY_LIKED)) || []; } catch(e) { return []; }
}

function saveLikedIds(ids) {
  localStorage.setItem(STORAGE_KEY_LIKED, JSON.stringify(ids));
}

function addPost(post) {
  var posts = getPosts();
  posts.unshift(post);
  savePosts(posts);
}

function updatePost(postId, updater) {
  var posts = getPosts();
  for (var i = 0; i < posts.length; i++) {
    if (posts[i].id === postId) {
      posts[i] = updater(posts[i]);
      savePosts(posts);
      return;
    }
  }
}

// ==================== Toast 通知 ====================

function showToast(message, type) {
  type = type || "info";
  var container = document.getElementById("toastContainer");
  if (!container) return;

  var toast = document.createElement("div");
  toast.className = "toast " + type;
  var icons = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };
  toast.innerHTML = "<span>" + (icons[type] || "ℹ️") + "</span> " + message;
  container.appendChild(toast);

  setTimeout(function() {
    toast.classList.add("toast-removing");
    setTimeout(function() { toast.remove(); }, 300);
  }, 2500);
}

// ==================== 图片上传预览 ====================

function initImageUpload() {
  var uploadZone = document.getElementById("uploadZone");
  var imageInput = document.getElementById("imageInput");
  var previewGrid = document.getElementById("imagePreviewGrid");
  if (!uploadZone || !imageInput || !previewGrid) return null;

  var selectedFiles = [];

  function updatePreview() {
    previewGrid.innerHTML = "";
    selectedFiles.forEach(function(file, index) {
      var reader = new FileReader();
      reader.onload = function(e) {
        var item = document.createElement("div");
        item.className = "preview-item";
        item.innerHTML = '<img src="' + e.target.result + '" alt="预览图"><button type="button" class="preview-remove" data-index="' + index + '">&times;</button>';
        previewGrid.appendChild(item);
      };
      reader.readAsDataURL(file);
    });
  }

  uploadZone.addEventListener("click", function() { imageInput.click(); });

  uploadZone.addEventListener("dragover", function(e) {
    e.preventDefault();
    uploadZone.classList.add("drag-over");
  });

  uploadZone.addEventListener("dragleave", function() {
    uploadZone.classList.remove("drag-over");
  });

  uploadZone.addEventListener("drop", function(e) {
    e.preventDefault();
    uploadZone.classList.remove("drag-over");
    var files = Array.prototype.filter.call(e.dataTransfer.files, function(f) { return f.type.startsWith("image/"); });
    if (files.length === 0) {
      showToast("请上传图片文件", "warning");
      return;
    }
    var valid = files.filter(function(f) { return f.size <= 10 * 1024 * 1024; });
    if (valid.length < files.length) showToast("部分图片超过 10MB 限制，已被跳过", "warning");
    selectedFiles = selectedFiles.concat(valid).slice(0, 9);
    updatePreview();
  });

  imageInput.addEventListener("change", function() {
    var files = Array.prototype.filter.call(imageInput.files, function(f) { return f.type.startsWith("image/"); });
    var valid = files.filter(function(f) { return f.size <= 10 * 1024 * 1024; });
    if (valid.length < files.length) showToast("部分图片超过 10MB 限制，已被跳过", "warning");
    selectedFiles = selectedFiles.concat(valid).slice(0, 9);
    updatePreview();
    imageInput.value = "";
  });

  previewGrid.addEventListener("click", function(e) {
    var btn = e.target.closest ? e.target.closest(".preview-remove") : null;
    if (!btn) return;
    var index = parseInt(btn.dataset.index, 10);
    selectedFiles.splice(index, 1);
    updatePreview();
  });

  return {
    getFiles: function() { return selectedFiles; },
    clearFiles: function() { selectedFiles = []; updatePreview(); }
  };
}

function filesToBase64(files) {
  return Promise.all(
    Array.prototype.map.call(files, function(file) {
      return new Promise(function(resolve, reject) {
        var reader = new FileReader();
        reader.onload = function(e) { resolve(e.target.result); };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    })
  );
}

// ==================== 渲染 ====================

function renderPostCard(post, container) {
  var likedIds = getLikedIds();
  var isLiked = likedIds.indexOf(post.id) !== -1;

  var visibilityLabels = {
    public: "🌍 公开",
    friends: "👥 好友可见",
    private: "🔒 私密"
  };

  var imagesHTML = "";
  if (post.images && post.images.length > 0) {
    var imgTags = post.images.map(function(img, i) {
      return '<img src="' + img + '" class="post-image" alt="图片 ' + (i + 1) + '" data-lightbox="' + post.id + '">';
    }).join("");
    imagesHTML = '<div class="post-image-grid">' + imgTags + '</div>';
  }

  var commentsHTML = "";
  if (post.comments && post.comments.length > 0) {
    var commentItems = post.comments.map(function(c) {
      return '<div class="comment-item"><div class="comment-avatar">' + c.author[0] + '</div><div class="comment-body"><span class="comment-author">' + escapeHTML(c.author) + '</span><p class="comment-text">' + escapeHTML(c.text) + '</p></div></div>';
    }).join("");
    commentsHTML = '<div class="comments-list">' + commentItems + '</div>';
  }

  var card = document.createElement("div");
  card.className = "post-card";
  card.setAttribute("data-post-id", post.id);

  card.innerHTML =
    '<div class="post-header">' +
    '<div class="post-avatar">' + (post.authorAvatar || post.author[0]) + '</div>' +
    '<div class="post-author-info">' +
    '<span class="post-author-name">' + escapeHTML(post.author) + '</span>' +
    '<div class="post-meta"><span>' + timeAgo(post.createdAt) + '</span><span class="post-visibility-badge">' + (visibilityLabels[post.visibility] || "") + '</span></div>' +
    '</div></div>' +
    '<div class="post-body"><p class="post-text">' + escapeHTML(post.content) + '</p>' + imagesHTML + '</div>' +
    '<div class="post-actions">' +
    '<button class="action-btn like-btn' + (isLiked ? " liked" : "") + '" data-action="like" data-id="' + post.id + '">' + (isLiked ? "❤️" : "🤍") + ' <span class="action-count">' + (post.likes || 0) + '</span></button>' +
    '<button class="action-btn comment-toggle-btn" data-action="toggle-comment" data-id="' + post.id + '">💬 <span class="action-count">' + ((post.comments || []).length) + '</span></button>' +
    '</div>' +
    '<div class="comments-section" id="comments-' + post.id + '" style="display:none;">' + commentsHTML +
    '<div class="comment-form"><input type="text" class="comment-input" placeholder="写下你的评论..." data-id="' + post.id + '" maxlength="200"><button class="comment-submit" data-id="' + post.id + '">发送</button></div></div>';

  container.appendChild(card);
}

function renderFeed(posts, containerId, filter) {
  filter = filter || "all";
  var container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  var filtered = posts;
  if (filter === "public") {
    filtered = posts.filter(function(p) { return p.visibility === "public"; });
  } else if (filter === "friends") {
    filtered = posts.filter(function(p) { return p.visibility === "friends"; });
  }

  if (filtered.length === 0) {
    container.innerHTML = '<div class="empty-state"><span class="empty-icon">📭</span><p>暂无动态</p></div>';
    return;
  }

  filtered.forEach(function(post) { renderPostCard(post, container); });
}

// ==================== 图片灯箱 ====================

function initLightbox() {
  document.addEventListener("click", function(e) {
    var img = e.target.closest ? e.target.closest("[data-lightbox]") : null;
    if (!img) return;

    var overlay = document.createElement("div");
    overlay.className = "lightbox-overlay";
    overlay.innerHTML = '<button class="lightbox-close">&times;</button><img src="' + img.src + '" alt="' + img.alt + '">';

    overlay.addEventListener("click", function(ev) {
      if (ev.target === overlay || (ev.target.classList && ev.target.classList.contains("lightbox-close"))) {
        overlay.remove();
      }
    });

    function onEsc(ev) {
      if (ev.key === "Escape") {
        overlay.remove();
        document.removeEventListener("keydown", onEsc);
      }
    }
    document.addEventListener("keydown", onEsc);

    document.body.appendChild(overlay);
  });
}

// ==================== 事件委托：点赞 & 评论 ====================

function initPostInteractions() {
  document.addEventListener("click", function(e) {
    // 点赞
    var likeBtn = e.target.closest ? e.target.closest("[data-action='like']") : null;
    if (likeBtn) {
      toggleLike(likeBtn.dataset.id, likeBtn);
      return;
    }

    // 展开评论
    var commentToggle = e.target.closest ? e.target.closest("[data-action='toggle-comment']") : null;
    if (commentToggle) {
      var section = document.getElementById("comments-" + commentToggle.dataset.id);
      if (section) {
        section.style.display = section.style.display === "none" ? "block" : "none";
      }
      return;
    }

    // 发送评论
    var submitBtn = e.target.closest ? e.target.closest(".comment-submit") : null;
    if (submitBtn) {
      var postId = submitBtn.dataset.id;
      var input = document.querySelector('.comment-input[data-id="' + postId + '"]');
      if (input && input.value.trim()) {
        addComment(postId, input.value.trim());
        input.value = "";
      }
      return;
    }
  });

  document.addEventListener("keydown", function(e) {
    if (e.key === "Enter" && e.target.classList && e.target.classList.contains("comment-input")) {
      e.preventDefault();
      var postId = e.target.dataset.id;
      var submitBtn = document.querySelector('.comment-submit[data-id="' + postId + '"]');
      if (submitBtn && e.target.value.trim()) submitBtn.click();
    }
  });
}

function toggleLike(postId, btnElement) {
  var likedIds = getLikedIds();
  var index = likedIds.indexOf(postId);

  if (index === -1) {
    likedIds.push(postId);
    updatePost(postId, function(post) { post.likes = (post.likes || 0) + 1; return post; });
    if (btnElement) {
      btnElement.classList.add("liked");
      var count = (parseInt(btnElement.querySelector(".action-count").textContent) || 0) + 1;
      btnElement.innerHTML = '❤️ <span class="action-count">' + count + '</span>';
    }
  } else {
    likedIds.splice(index, 1);
    updatePost(postId, function(post) { post.likes = Math.max(0, (post.likes || 1) - 1); return post; });
    if (btnElement) {
      btnElement.classList.remove("liked");
      var count = Math.max(0, (parseInt(btnElement.querySelector(".action-count").textContent) || 1) - 1);
      btnElement.innerHTML = '🤍 <span class="action-count">' + count + '</span>';
    }
  }
  saveLikedIds(likedIds);
}

function addComment(postId, text) {
  var profile = getProfile();
  var comment = { id: "c_" + Date.now(), author: profile.name, text: text };

  updatePost(postId, function(post) {
    post.comments = (post.comments || []).concat([comment]);
    return post;
  });

  var section = document.getElementById("comments-" + postId);
  if (!section) return;

  var list = section.querySelector(".comments-list");
  var newComment = document.createElement("div");
  newComment.className = "comment-item";
  newComment.innerHTML = '<div class="comment-avatar">' + comment.author[0] + '</div><div class="comment-body"><span class="comment-author">' + escapeHTML(comment.author) + '</span><p class="comment-text">' + escapeHTML(comment.text) + '</p></div>';

  if (list) {
    list.appendChild(newComment);
    list.scrollTop = list.scrollHeight;
  } else {
    var newList = document.createElement("div");
    newList.className = "comments-list";
    newList.appendChild(newComment);
    var form = section.querySelector(".comment-form");
    section.insertBefore(newList, form);
  }

  var toggleBtn = document.querySelector("[data-action='toggle-comment'][data-id='" + postId + "'] .action-count");
  if (toggleBtn) {
    var post = getPosts().find(function(p) { return p.id === postId; });
    if (post) toggleBtn.textContent = post.comments.length;
  }

  showToast("评论发送成功", "success");
}

// ==================== 导航栏 ====================

function initNavbar() {
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (!toggle || !links) return;
  toggle.addEventListener("click", function() { links.classList.toggle("open"); });
  var navLinks = links.querySelectorAll(".nav-link");
  for (var i = 0; i < navLinks.length; i++) {
    navLinks[i].addEventListener("click", function() { links.classList.remove("open"); });
  }
}

// ==================== 信息流筛选 ====================

function initFeedFilter() {
  var filterBtns = document.querySelectorAll(".filter-btn");
  if (filterBtns.length === 0) return;
  var posts = getPosts();
  for (var i = 0; i < filterBtns.length; i++) {
    filterBtns[i].addEventListener("click", function() {
      for (var j = 0; j < filterBtns.length; j++) filterBtns[j].classList.remove("active");
      this.classList.add("active");
      renderFeed(posts, "postList", this.dataset.filter);
    });
  }
}

// ==================== 加载更多 ====================

function initLoadMore() {
  var btn = document.getElementById("loadMoreBtn");
  if (!btn) return;
  btn.addEventListener("click", function() { showToast("已加载全部内容", "info"); });
}

// ==================== 发布页 ====================

function initPublishPage() {
  var form = document.getElementById("publishForm");
  if (!form) return;

  var contentTextarea = document.getElementById("postContent");
  var charCounter = document.getElementById("charCounter");
  var contentError = document.getElementById("contentError");
  var imageError = document.getElementById("imageError");
  var uploadManager = initImageUpload();

  if (contentTextarea && charCounter) {
    contentTextarea.addEventListener("input", function() {
      var len = contentTextarea.value.length;
      charCounter.textContent = len + " / 2000";
      charCounter.className = "char-counter";
      if (len > 1800) charCounter.classList.add("warning");
      if (len > 1950) charCounter.classList.add("danger");
    });
  }

  form.addEventListener("submit", function(e) {
    e.preventDefault();
    var valid = true;
    var content = contentTextarea.value.trim();

    if (!content) {
      contentError.textContent = "请输入分享内容";
      contentTextarea.classList.add("error");
      valid = false;
    } else if (content.length < 2) {
      contentError.textContent = "内容至少需要2个字符";
      contentTextarea.classList.add("error");
      valid = false;
    } else {
      contentError.textContent = "";
      contentTextarea.classList.remove("error");
    }

    var files = uploadManager ? uploadManager.getFiles() : [];
    if (files.length > 9) {
      imageError.textContent = "最多上传 9 张图片";
      valid = false;
    } else {
      imageError.textContent = "";
    }

    if (!valid) return;

    var submitBtn = document.getElementById("submitBtn");
    submitBtn.disabled = true;
    submitBtn.textContent = "⏳ 发布中...";

    filesToBase64(files).then(function(imageBase64s) {
      var profile = getProfile();
      var visibilityEl = document.querySelector('input[name="visibility"]:checked');
      var visibility = visibilityEl ? visibilityEl.value : "public";

      addPost({
        id: generateId(),
        author: profile.name,
        authorAvatar: profile.avatar,
        content: content,
        images: imageBase64s,
        visibility: visibility,
        likes: 0,
        comments: [],
        createdAt: new Date().toISOString()
      });

      contentTextarea.value = "";
      charCounter.textContent = "0 / 2000";
      charCounter.className = "char-counter";
      if (uploadManager) uploadManager.clearFiles();
      submitBtn.disabled = false;
      submitBtn.textContent = "🚀 发布动态";

      showToast("发布成功！🎉", "success");

      setTimeout(function() { window.location.href = "index.html"; }, 1500);
    }).catch(function() {
      showToast("图片处理失败，请重试", "error");
      submitBtn.disabled = false;
      submitBtn.textContent = "🚀 发布动态";
    });
  });

  // 存草稿
  var draftBtn = document.getElementById("draftBtn");
  if (draftBtn) {
    draftBtn.addEventListener("click", function() {
      var content = contentTextarea.value.trim();
      if (!content) { showToast("草稿内容不能为空", "warning"); return; }
      var drafts = getDrafts();
      var visibilityEl = document.querySelector('input[name="visibility"]:checked');
      drafts.push({ id: "draft_" + Date.now(), content: content, visibility: visibilityEl ? visibilityEl.value : "public", savedAt: new Date().toISOString() });
      saveDrafts(drafts);
      contentTextarea.value = "";
      charCounter.textContent = "0 / 2000";
      charCounter.className = "char-counter";
      if (uploadManager) uploadManager.clearFiles();
      showToast("已保存到草稿箱 📝", "success");
      renderDrafts();
    });
  }

  renderDrafts();
}

function renderDrafts() {
  var section = document.getElementById("draftsSection");
  var list = document.getElementById("draftsList");
  if (!section || !list) return;

  var drafts = getDrafts();
  if (drafts.length === 0) { section.style.display = "none"; return; }
  section.style.display = "block";

  list.innerHTML = drafts.map(function(d) {
    return '<div class="draft-item"><span class="draft-preview" title="' + escapeHTML(d.content) + '">' + escapeHTML(truncate(d.content, 40)) + '</span><div class="draft-actions"><button class="btn btn-sm btn-outline use-draft-btn" data-id="' + d.id + '">使用</button><button class="btn btn-sm btn-danger delete-draft-btn" data-id="' + d.id + '">删除</button></div></div>';
  }).join("");

  list.querySelectorAll(".use-draft-btn").forEach(function(btn) {
    btn.addEventListener("click", function() {
      var draftId = btn.dataset.id;
      var draft = getDrafts().find(function(d) { return d.id === draftId; });
      if (!draft) return;
      document.getElementById("postContent").value = draft.content;
      document.getElementById("charCounter").textContent = draft.content.length + " / 2000";
      var radio = document.querySelector('input[name="visibility"][value="' + draft.visibility + '"]');
      if (radio) radio.checked = true;
      saveDrafts(getDrafts().filter(function(d) { return d.id !== draftId; }));
      renderDrafts();
    });
  });

  list.querySelectorAll(".delete-draft-btn").forEach(function(btn) {
    btn.addEventListener("click", function() {
      var draftId = btn.dataset.id;
      saveDrafts(getDrafts().filter(function(d) { return d.id !== draftId; }));
      renderDrafts();
      showToast("草稿已删除", "info");
    });
  });
}

// ==================== 个人主页 ====================

function initProfilePage() {
  var profileHeader = document.querySelector(".profile-header-card");
  if (!profileHeader) return;
  renderProfile();
  renderProfilePosts("posts");
  initProfileTabs();
  initEditProfileModal();
}

function renderProfile() {
  var profile = getProfile();
  var avatarEl = document.getElementById("profileAvatar");
  if (avatarEl) avatarEl.querySelector(".avatar-emoji").textContent = profile.avatar;

  var nameEl = document.getElementById("profileName");
  if (nameEl) nameEl.textContent = profile.name;

  var bioEl = document.getElementById("profileBio");
  if (bioEl) bioEl.textContent = profile.bio || "这个人很懒，什么都没写...";

  var statPosts = document.getElementById("statPosts");
  if (statPosts) {
    var posts = getPosts().filter(function(p) { return p.author === profile.name; });
    statPosts.textContent = posts.length;
  }

  var statLikes = document.getElementById("statLikes");
  if (statLikes) {
    var posts = getPosts().filter(function(p) { return p.author === profile.name; });
    var total = posts.reduce(function(sum, p) { return sum + (p.likes || 0); }, 0);
    statLikes.textContent = total;
  }
}

function renderProfilePosts(tab) {
  var container = document.getElementById("profilePostList");
  var emptyState = document.getElementById("profileEmpty");
  if (!container) return;

  var profile = getProfile();
  var posts = getPosts();
  var filtered;

  if (tab === "posts") {
    filtered = posts.filter(function(p) { return p.author === profile.name; });
  } else if (tab === "liked") {
    var likedIds = getLikedIds();
    filtered = posts.filter(function(p) { return likedIds.indexOf(p.id) !== -1; });
  }

  container.innerHTML = "";
  if (!filtered || filtered.length === 0) {
    if (emptyState) emptyState.style.display = "block";
    return;
  }
  if (emptyState) emptyState.style.display = "none";
  filtered.forEach(function(post) { renderPostCard(post, container); });
}

function initProfileTabs() {
  var tabs = document.querySelectorAll(".profile-tab");
  tabs.forEach(function(tab) {
    tab.addEventListener("click", function() {
      tabs.forEach(function(t) { t.classList.remove("active"); });
      tab.classList.add("active");
      renderProfilePosts(tab.dataset.tab);
    });
  });
}

function initEditProfileModal() {
  var modal = document.getElementById("editProfileModal");
  var openBtn = document.getElementById("editProfileBtn");
  var closeBtn = document.getElementById("closeEditModal");
  var cancelBtn = document.getElementById("cancelEditBtn");
  var form = document.getElementById("editProfileForm");
  if (!modal || !openBtn) return;

  function openModal() {
    var profile = getProfile();
    document.getElementById("editName").value = profile.name;
    document.getElementById("editBio").value = profile.bio || "";
    document.getElementById("editLocation").value = profile.location || "";
    document.getElementById("editBioCounter").textContent = (profile.bio || "").length + " / 200";
    document.getElementById("editNameError").textContent = "";
    modal.style.display = "flex";
  }

  function closeModal() { modal.style.display = "none"; }

  openBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", function(e) { if (e.target === modal) closeModal(); });

  var bioTextarea = document.getElementById("editBio");
  var bioCounter = document.getElementById("editBioCounter");
  if (bioTextarea && bioCounter) {
    bioTextarea.addEventListener("input", function() {
      bioCounter.textContent = bioTextarea.value.length + " / 200";
    });
  }

  form.addEventListener("submit", function(e) {
    e.preventDefault();
    var name = document.getElementById("editName").value.trim();
    var nameError = document.getElementById("editNameError");
    if (!name) { nameError.textContent = "昵称不能为空"; return; }
    if (name.length < 2) { nameError.textContent = "昵称至少2个字符"; return; }

    var profile = getProfile();
    profile.name = name;
    profile.bio = document.getElementById("editBio").value.trim();
    profile.location = document.getElementById("editLocation").value.trim();
    saveProfile(profile);
    renderProfile();
    closeModal();
    showToast("个人资料已更新 ✅", "success");
  });
}

// ==================== 初始化 ====================

function init() {
  initStorage();
  initNavbar();
  initLightbox();
  initPostInteractions();

  var path = window.location.pathname.replace(/\\/g, "/").toLowerCase();

  // 首页 / 信息流
  if (path.endsWith("index.html") || path === "/" || path.endsWith("/") || path.indexOf("index.html") === -1 && path.indexOf("publish.html") === -1 && path.indexOf("profile.html") === -1) {
    var posts = getPosts();
    renderFeed(posts, "postList", "all");
    initFeedFilter();
    initLoadMore();
  }

  // 发布页
  if (path.indexOf("publish.html") !== -1) {
    initPublishPage();
  }

  // 个人主页
  if (path.indexOf("profile.html") !== -1) {
    initProfilePage();
  }
}

document.addEventListener("DOMContentLoaded", init);
