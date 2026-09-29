export function localizeProduct(product, translation) {
  if (!product || !translation) return product;

  return {
    ...product,
    source_category: product.category,
    name: translation.name || product.name,
    category: translation.category || product.category,
    description: translation.description || product.description,
    full_description: translation.full_description || product.full_description,
  };
}

export function localizeProducts(products, translations) {
  const byId = new Map(translations.map((item) => [Number(item.product_id), item]));
  return products.map((product) => localizeProduct(product, byId.get(Number(product.id))));
}
