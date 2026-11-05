// Danh sách URL hình ảnh trực tiếp từ Google Images (encrypted-tbn*.gstatic.com)
export const GOOGLE_SHOE_IMAGES = [
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_C-lMDmpA13KFIf8-G_juBVEiYrTDrU_qkw6Vp_THDQ&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5lSklTlK2RG_YOSpagNjAj3KwFshWJ6_CWr6eLsRutg&s=10',
  'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTU9a1miLW3xZUn-fRB9WNfNh-BDQMUm07LwmB5o6wMdzvZUlChis_sTAlnXwJojQzYxnNUS40Pb3s5lw8mZ-5QD1X-s9d7xGWovygibfrY17k872_Yh5_W&usqp=CAc',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQH28T8NI2MSk409gMlmb9g-H6iiFVpowyA7xctIL7zkA&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4ns2vNync-xu0vo5c2VFLqpMt7-X6N6ckbFJDODYdaQ&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCyuXtLbVmch-VuD1gCPxeCdo8N2134j_D_5c9niVuJg&s=10',
];

export const GOOGLE_PRODUCT_IMAGE_BY_ID = {
  1: GOOGLE_SHOE_IMAGES[2], // vans black
  2: GOOGLE_SHOE_IMAGES[2], // vans old school
  3: GOOGLE_SHOE_IMAGES[3], // converse chuck taylor
  4: GOOGLE_SHOE_IMAGES[0], // nike adapt bb
  5: GOOGLE_SHOE_IMAGES[1], // nike air max 270
  6: GOOGLE_SHOE_IMAGES[0], // nike air max 97
  7: GOOGLE_SHOE_IMAGES[1], // nike air max 97 blue
  8: GOOGLE_SHOE_IMAGES[3], // nike flyknit
  9: GOOGLE_SHOE_IMAGES[0], // nike react element
  10: GOOGLE_SHOE_IMAGES[1], // nike shox tl
  11: GOOGLE_SHOE_IMAGES[3], // nike sp dunk
  12: GOOGLE_SHOE_IMAGES[4], // adidas prophere
  13: GOOGLE_SHOE_IMAGES[4], // adidas prophere black white
  14: GOOGLE_SHOE_IMAGES[5], // adidas prophere customize
  15: GOOGLE_SHOE_IMAGES[4], // adidas super star red
  16: GOOGLE_SHOE_IMAGES[5], // adidas swift run
  17: GOOGLE_SHOE_IMAGES[4], // adidas tenisky super star
  18: GOOGLE_SHOE_IMAGES[5], // adidas ultraboost 4
  19: GOOGLE_SHOE_IMAGES[4], // adidas yeezy 350
};

/**
 * Chuẩn hóa và gán URL hình ảnh trực tiếp của Google cho sản phẩm:
 * 1. Nếu chuỗi image của sản phẩm chứa sẵn URL trực tiếp của Google (`encrypted-tbn*.gstatic.com`), trích xuất URL đó.
 * 2. Nếu chuỗi image là link Google imgres (`www.google.com/imgres?...&imgurl=...`), giải mã `imgurl` hoặc gán URL Google tương ứng.
 * 3. Gán trực tiếp URL Google Images (`encrypted-tbn*.gstatic.com`) theo ID/tên sản phẩm cho toàn bộ sản phẩm.
 */
export function resolveGoogleProductImage(product) {
  if (!product) return GOOGLE_SHOE_IMAGES[0];

  const rawImage = String(product.image || '');

  // Trích xuất nếu có sẵn link trực tiếp Google Images (encrypted-tbn)
  const gstaticMatch = rawImage.match(
    /https?:\/\/encrypted-tbn[0-9]\.gstatic\.com\/[^\s"']+/i
  );
  if (gstaticMatch) {
    return gstaticMatch[0];
  }

  // Nếu có sẵn trong bảng map theo ID chuẩn (1 -> 19)
  const idNum = Number(product.id);
  if (GOOGLE_PRODUCT_IMAGE_BY_ID[idNum]) {
    return GOOGLE_PRODUCT_IMAGE_BY_ID[idNum];
  }

  // Phân loại theo tên sản phẩm hoặc chọn theo ID
  const nameLower = String(product.name || '').toLowerCase();
  if (nameLower.includes('messi')) return GOOGLE_SHOE_IMAGES[5];
  if (nameLower.includes('adidas') || nameLower.includes('ultraboost') || nameLower.includes('yeezy')) {
    return GOOGLE_SHOE_IMAGES[4];
  }
  if (nameLower.includes('vans') || nameLower.includes('converse')) {
    return GOOGLE_SHOE_IMAGES[2];
  }
  if (nameLower.includes('nike') || nameLower.includes('jordan')) {
    return GOOGLE_SHOE_IMAGES[0];
  }

  const index = Math.abs(idNum || 0) % GOOGLE_SHOE_IMAGES.length;
  return GOOGLE_SHOE_IMAGES[index];
}

export function normalizeProductWithGoogleImage(product) {
  if (!product || typeof product !== 'object') return product;

  const updated = {
    ...product,
    image: resolveGoogleProductImage(product),
  };

  if (Array.isArray(product.relatedProducts)) {
    updated.relatedProducts = product.relatedProducts.map((rel) =>
      typeof rel === 'object' ? normalizeProductWithGoogleImage(rel) : rel
    );
  }

  return updated;
}

export function normalizeProductListWithGoogleImage(list) {
  if (!Array.isArray(list)) return [];
  return list.map(normalizeProductWithGoogleImage);
}
