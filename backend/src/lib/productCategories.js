const PRODUCT_CATEGORY_BY_ID = Object.freeze({
  9: 'ไฟเบอร์',
  10: 'กาแฟ',
  11: 'โปรตีน',
  12: 'โปรตีน',
  13: 'อาหารเสริม',
  14: 'อาหารเสริม',
  15: 'อาหารเสริม',
  16: 'อาหารเสริม',
  17: 'กาแฟ',
  18: 'คอลลาเจน',
  19: 'ไฟเบอร์',
  20: 'กาแฟ',
  21: 'กาแฟ',
  22: 'คอลลาเจน',
  23: 'คอลลาเจน',
  24: 'คอลลาเจน',
  25: 'คอลลาเจน',
  26: 'ไฟเบอร์',
  27: 'ชงดื่มสำเร็จรูป',
  28: 'ชงดื่มสำเร็จรูป',
  29: 'ชงดื่มสำเร็จรูป',
  30: 'กาแฟ',
  31: 'กาแฟ',
  32: 'อาหารเสริม',
  33: 'อาหารเสริม',
  34: 'อาหารเสริม',
  35: 'กาแฟ',
  36: 'อาหารเสริม',
  37: 'อาหารเสริม',
  38: 'อาหารเสริม',
});

const EXPECTED_PRODUCT_NAMES = Object.freeze({
  9: 'Luck Fiber Pineapple',
  10: 'Luck Coffee Plus',
  11: 'Dark Chocolate Flavour',
  12: 'Corn Milk Flavour',
  13: 'Stamp Choice',
  14: 'Sky Wonder',
  15: 'Sky Tok',
  16: 'Sky S',
  17: 'SD Coffee',
  18: 'SD Collagen Gluta VitC',
  19: 'SD Fiber Vegetables Mixed Fruit',
  20: 'Luck Black Coffee 30',
  21: 'Luck Instant Coffee Mix',
  22: 'Orange Collagen',
  23: 'Blue Hawaii Collagen',
  24: 'Lychee Collagen',
  25: 'Apple Collagen',
  26: 'Luck Veggie Mixed',
  27: 'Luck Cocoa',
  28: 'Luck Thai Tea',
  29: 'Matcha Green Tea',
  30: 'Luck Coffee',
  31: 'Luck Black Coffee',
  32: 'Weeda-F',
  33: 'Maya Plus',
  34: 'Ploy Deang',
  35: 'Max Man Coffee',
  36: 'Sky 6 Mix Oil',
  37: 'Sky Lutein',
  38: 'Houluk Seam',
});

const CATEGORY_TRANSLATIONS = Object.freeze({
  en: {
    'กาแฟ': 'Coffee', 'อาหารเสริม': 'Dietary Supplements', 'โปรตีน': 'Protein',
    'ไฟเบอร์': 'Fiber', 'ชงดื่มสำเร็จรูป': 'Instant Drinks', 'คอลลาเจน': 'Collagen',
  },
  zh: {
    'กาแฟ': '咖啡', 'อาหารเสริม': '膳食补充剂', 'โปรตีน': '蛋白质',
    'ไฟเบอร์': '膳食纤维', 'ชงดื่มสำเร็จรูป': '即冲饮品', 'คอลลาเจน': '胶原蛋白',
  },
  lo: {
    'กาแฟ': 'ກາເຟ', 'อาหารเสริม': 'ອາຫານເສີມ', 'โปรตีน': 'ໂປຣຕີນ',
    'ไฟเบอร์': 'ໃຍອາຫານ', 'ชงดื่มสำเร็จรูป': 'ເຄື່ອງດື່ມສຳເລັດຮູບ', 'คอลลาเจน': 'ຄໍລາເຈນ',
  },
  my: {
    'กาแฟ': 'ကော်ဖီ', 'อาหารเสริม': 'ဖြည့်စွက်အစားအစာ', 'โปรตีน': 'ပရိုတင်း',
    'ไฟเบอร์': 'အမျှင်ဓာတ်', 'ชงดื่มสำเร็จรูป': 'အသင့်ဖျော်သောက်စရာ', 'คอลลาเจน': 'ကော်လာဂျင်',
  },
  vi: {
    'กาแฟ': 'Cà phê', 'อาหารเสริม': 'Thực phẩm bổ sung', 'โปรตีน': 'Protein',
    'ไฟเบอร์': 'Chất xơ', 'ชงดื่มสำเร็จรูป': 'Đồ uống hòa tan', 'คอลลาเจน': 'Collagen',
  },
});

function categoryForProduct(product) {
  return PRODUCT_CATEGORY_BY_ID[Number(product.id)] || product.category;
}

module.exports = {
  CATEGORY_TRANSLATIONS,
  EXPECTED_PRODUCT_NAMES,
  PRODUCT_CATEGORY_BY_ID,
  categoryForProduct,
};
