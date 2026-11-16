// Ảnh dự phòng khi ảnh từ API bị lỗi hoặc không có
export const FALLBACK_SHOE_IMAGES = [
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_C-lMDmpA13KFIf8-G_juBVEiYrTDrU_qkw6Vp_THDQ&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5lSklTlK2RG_YOSpagNjAj3KwFshWJ6_CWr6eLsRutg&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQH28T8NI2MSk409gMlmb9g-H6iiFVpowyA7xctIL7zkA&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4ns2vNync-xu0vo5c2VFLqpMt7-X6N6ckbFJDODYdaQ&s=10',
];

export const DEFAULT_IMAGE = FALLBACK_SHOE_IMAGES[0];

/**
 * Lấy URL ảnh sản phẩm từ dữ liệu API (result.data.content.image).
 * Một số bản ghi bị nối domain 2 lần ("https://shop.cyberlearn.vn/images/https://...")
 * nên lấy URL http cuối cùng trong chuỗi.
 */
export function resolveImage(item, fallbackIndex = 0) {
  const raw = String(item?.image || '').trim();
  const lastHttp = raw.lastIndexOf('http');
  if (lastHttp !== -1) {
    return raw.slice(lastHttp);
  }
  return FALLBACK_SHOE_IMAGES[Math.abs(Number(fallbackIndex) || 0) % FALLBACK_SHOE_IMAGES.length];
}

// Dùng cho onError của thẻ <img>: chỉ đổi ảnh 1 lần để tránh lặp vô hạn
export function handleImageError(e) {
  e.currentTarget.onerror = null;
  e.currentTarget.src = DEFAULT_IMAGE;
}
