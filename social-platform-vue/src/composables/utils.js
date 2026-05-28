export function timeAgo(dateStr) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "刚刚";
  if (minutes < 60) return minutes + " 分钟前";
  if (hours < 24) return hours + " 小时前";
  if (days < 7) return days + " 天前";
  const d = new Date(dateStr);
  return (d.getMonth() + 1) + "月" + d.getDate() + "日";
}

export function generateId() {
  return "post_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
}

export function truncate(text, maxLen) {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + "...";
}
