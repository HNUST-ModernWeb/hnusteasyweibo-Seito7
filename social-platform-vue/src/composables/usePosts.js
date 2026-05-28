import { ref, computed } from "vue";

const STORAGE_KEY = "sharehub_posts";

const SEED_POSTS = [
  {
    id: "seed_1", author: "小明同学", authorAvatar: "😊",
    content: "今天开始使用 ShareHub！这是一个全新的社交分享平台，欢迎大家一起来分享生活中的精彩瞬间 🎉",
    images: [], visibility: "public", likes: 12,
    comments: [
      { id: "c1", author: "小红", text: "欢迎欢迎！平台越来越热闹了~" },
      { id: "c2", author: "小刚", text: "界面很漂亮！期待更多功能" }
    ],
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: "seed_2", author: "旅行达人小李", authorAvatar: "🧳",
    content: "周末去了趟长城，天气特别好，拍了几张照片分享给大家 📸\n\n长城真的是人类建筑史上的奇迹，每次来都有不同的感受。",
    images: [], visibility: "public", likes: 28,
    comments: [{ id: "c3", author: "小明同学", text: "太美了！我也想去" }],
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: "seed_3", author: "美食博主阿花", authorAvatar: "🍜",
    content: "分享一个懒人版红烧肉的做法：\n\n1️⃣ 五花肉切块焯水\n2️⃣ 炒糖色，加入肉块翻炒\n3️⃣ 加生抽、老抽、料酒、八角\n4️⃣ 加水炖40分钟\n5️⃣ 大火收汁\n\n简单又好吃！",
    images: [], visibility: "public", likes: 45, comments: [],
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString()
  },
  {
    id: "seed_4", author: "健身教练大刘", authorAvatar: "💪",
    content: "今日训练打卡 💯\n\n胸肌 + 三头肌，强度拉满！\n坚持健身3个月了，体脂从22%降到16%！",
    images: [], visibility: "friends", likes: 8, comments: [],
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: "seed_5", author: "程序员老王", authorAvatar: "💻",
    content: "花了三个月时间，终于把自己的开源项目 Star 破千了！感谢大家的支持 🎉\n\n技术栈：React + TypeScript + Node.js",
    images: [], visibility: "public", likes: 36,
    comments: [
      { id: "c4", author: "小明同学", text: "大佬太强了！Star 了" },
      { id: "c5", author: "前端小张", text: "已学习，代码质量很高" }
    ],
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

function loadPosts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [...SEED_POSTS];
  } catch { return [...SEED_POSTS]; }
}

function persist(posts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

// 全局单例状态
const posts = ref(loadPosts());

export function usePosts() {

  function addPost(post) {
    posts.value.unshift(post);
    persist(posts.value);
  }

  function updatePost(postId, updater) {
    const idx = posts.value.findIndex((p) => p.id === postId);
    if (idx !== -1) {
      posts.value[idx] = updater({ ...posts.value[idx] });
      persist(posts.value);
    }
  }

  function getPost(postId) {
    return posts.value.find((p) => p.id === postId);
  }

  const allPosts = computed(() => posts.value);

  function postsByFilter(filter) {
    if (filter === "public") return posts.value.filter((p) => p.visibility === "public");
    if (filter === "friends") return posts.value.filter((p) => p.visibility === "friends");
    return posts.value;
  }

  function postsByAuthor(name) {
    return posts.value.filter((p) => p.author === name);
  }

  function postsByIds(ids) {
    return posts.value.filter((p) => ids.includes(p.id));
  }

  return { posts, addPost, updatePost, getPost, allPosts, postsByFilter, postsByAuthor, postsByIds };
}
