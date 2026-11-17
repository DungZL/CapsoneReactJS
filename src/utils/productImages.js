// Fallback images when the API image is broken or missing
export const FALLBACK_SHOE_IMAGES = [
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_C-lMDmpA13KFIf8-G_juBVEiYrTDrU_qkw6Vp_THDQ&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5lSklTlK2RG_YOSpagNjAj3KwFshWJ6_CWr6eLsRutg&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQH28T8NI2MSk409gMlmb9g-H6iiFVpowyA7xctIL7zkA&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4ns2vNync-xu0vo5c2VFLqpMt7-X6N6ckbFJDODYdaQ&s=10',
];

export const DEFAULT_IMAGE = FALLBACK_SHOE_IMAGES[0];

/**
 * Get the product image URL from API data (result.data.content.image).
 * Some records have the domain prepended twice ("https://shop.cyberlearn.vn/images/https://...")
 * so take the last http URL in the string.
 */
export function resolveImage(item, fallbackIndex = 0) {
  const raw = String(item?.image || '').trim();
  const lastHttp = raw.lastIndexOf('http');
  if (lastHttp !== -1) {
    return raw.slice(lastHttp);
  }
  return FALLBACK_SHOE_IMAGES[Math.abs(Number(fallbackIndex) || 0) % FALLBACK_SHOE_IMAGES.length];
}

// For <img> onError: swap the image only once to avoid an infinite loop
export function handleImageError(e) {
  e.currentTarget.onerror = null;
  e.currentTarget.src = DEFAULT_IMAGE;
}
