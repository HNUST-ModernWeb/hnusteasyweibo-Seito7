import api from "./index";

export function uploadImages(files) {
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));
  return api.post("/files/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export function getFileUrl(filename) {
  return api.defaults.baseURL + `/files/${filename}`;
}