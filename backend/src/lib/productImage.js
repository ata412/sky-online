// These product packshots have transparent PNG originals. The older JPEG
// copies baked white into the image, which becomes visible on dark surfaces.
const transparentProductIds = new Set([
  9, 10, 11, 12, 13, 14, 15, 16, 20, 21, 32, 33, 34, 35, 36, 37,
]);

function withTransparentProductImage(product) {
  if (!product || !transparentProductIds.has(Number(product.id))) return product;
  if (!/^\/imported\/products\/[^/]+\.jpg$/i.test(product.image_url || '')) return product;
  return { ...product, image_url: product.image_url.replace(/\.jpg$/i, '.png') };
}

module.exports = { withTransparentProductImage };
