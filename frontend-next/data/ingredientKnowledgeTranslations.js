import { ingredientKnowledge as thaiKnowledge } from './ingredientKnowledge';

const en = {
  collagen: {
    title: 'Collagen',
    summary: 'A structural protein found in skin, bone, cartilage, tendons, and connective tissue.',
    benefits: [
      'Helps provide structure, strength, and elasticity to body tissues.',
      'Some studies suggest hydrolyzed collagen may support skin hydration and elasticity, but results vary with study quality.',
      'It has also been studied for joint comfort; it should not replace medical assessment or treatment.',
      'Vitamin C is required for the body’s natural collagen production.',
    ],
    sources: 'Naturally present in fish skin, chicken skin, bones, and animal connective tissue. The body digests collagen into amino acids before use.',
    caution: 'Check the source if you are allergic to fish, seafood, beef, or pork. Evidence for skin benefits has limitations, and collagen is not a treatment for disease.',
    keywords: ['collagen', 'collagen peptide', 'tripeptide'],
  },
  inulin: {
    title: 'Inulin',
    summary: 'A soluble prebiotic fiber that reaches the large intestine and feeds certain beneficial microorganisms.',
    benefits: [
      'Adds dietary fiber and may support regular bowel movements.',
      'Acts as a prebiotic that can encourage the growth of certain beneficial gut bacteria.',
      'The FDA recognizes inulin and inulin-type fructans as dietary fiber based on physiological evidence.',
    ],
    sources: 'Chicory root, onions, garlic, asparagus, bananas, and Jerusalem artichokes.',
    caution: 'Start with a small amount and drink enough water. It may cause gas or bloating, especially in people sensitive to FODMAPs.',
    keywords: ['inulin', 'prebiotic', 'fiber', 'chicory'],
  },
  fiber: {
    title: 'Dietary fiber',
    summary: 'Plant carbohydrates the body cannot fully digest, including soluble and insoluble forms.',
    benefits: [
      'Adds stool bulk and supports regular bowel movements.',
      'Some soluble fibers slow absorption and feed microorganisms in the gut.',
      'High-fiber foods can support fullness and form part of a healthy eating pattern.',
    ],
    sources: 'Vegetables, fruit, legumes, seeds, oats, and whole grains.',
    caution: 'Increase fiber gradually and drink adequate water. A rapid increase may cause gas or abdominal discomfort.',
    keywords: ['fiber', 'dietary fiber', 'vegetables', 'pineapple', 'whole grain'],
  },
  probiotics: {
    title: 'Probiotics',
    summary: 'Live microorganisms that may provide a health benefit when the strain and amount are appropriate.',
    benefits: [
      'May help support a healthy community of microorganisms in the digestive tract.',
      'Effects are strain-specific and cannot be generalized to every probiotic product.',
      'Some evidence exists for antibiotic-associated diarrhea, while many other uses remain uncertain.',
    ],
    sources: 'Certain yogurts and fermented foods, plus supplements that clearly identify their strains.',
    caution: 'People with weakened immunity, serious illness, or premature infants should seek medical advice before use.',
    keywords: ['probiotic', 'lactobacillus', 'bifidobacterium', 'microbiome'],
  },
  'vitamin-c': {
    title: 'Vitamin C',
    summary: 'A water-soluble vitamin involved in collagen formation, immune function, and antioxidant activity.',
    benefits: [
      'Required for the body to make collagen and connective tissue.',
      'Supports normal immune function and acts as a physiological antioxidant.',
      'Improves absorption of non-heme iron from plant foods.',
    ],
    sources: 'Guava, oranges, kiwi, bell peppers, broccoli, tomatoes, and citrus fruit.',
    caution: 'High doses may cause diarrhea, nausea, or cramps. People with kidney-stone history or iron overload should consult a professional.',
    keywords: ['vitamin c', 'ascorbic acid', 'ascorbate'],
  },
  'omega-3': {
    title: 'Omega-3',
    summary: 'A family of polyunsaturated fats. ALA is essential, while EPA and DHA are abundant in fish and algae.',
    benefits: [
      'Forms part of cell membranes throughout the body.',
      'DHA is concentrated in the brain and retina, while EPA helps form several signaling compounds.',
      'High-dose omega-3 products used for triglycerides should be taken under medical guidance.',
    ],
    sources: 'Salmon, sardines, mackerel, flaxseed, chia seeds, walnuts, and algae oil.',
    caution: 'Supplements may cause a fishy taste or digestive discomfort. High doses can interact with anticoagulant medication.',
    keywords: ['omega-3', 'fish oil', 'dha', 'epa', 'ala'],
  },
  lutein: {
    title: 'Lutein and zeaxanthin',
    summary: 'Carotenoids concentrated in the retina and lens, where they are involved in filtering light and antioxidant protection.',
    benefits: [
      'Components of the macular pigment in the central retina.',
      'Help absorb some high-energy light and act as antioxidants in the eye.',
      'AREDS2 benefits apply to particular groups with intermediate or late AMD under eye-care guidance.',
    ],
    sources: 'Kale, spinach, broccoli, corn, egg yolk, and dark-green leafy vegetables.',
    caution: 'A general lutein supplement is not the same as AREDS2 and has not been proven to prevent eye disease in everyone.',
    keywords: ['lutein', 'zeaxanthin', 'eye', 'vision', 'areds2'],
  },
  'calcium-vitamin-d': {
    title: 'Calcium and vitamin D',
    summary: 'Calcium is a major mineral in bones and teeth; vitamin D helps the body absorb calcium normally.',
    benefits: [
      'Calcium supports bone structure, muscle contraction, and nerve signaling.',
      'Vitamin D supports calcium absorption and normal muscle and immune function.',
      'Weight-bearing activity, adequate protein, and a balanced diet also matter for bone health.',
    ],
    sources: 'Milk, yogurt, small fish eaten with bones, calcium-set tofu, egg yolk, and oily fish.',
    caution: 'Calcium can interfere with some medicines. People with kidney disease should consult a clinician before supplementing.',
    keywords: ['calcium', 'vitamin d', 'd3', 'k2', 'bone'],
  },
  magnesium: {
    title: 'Magnesium',
    summary: 'A mineral that assists many enzymes involved in energy, muscle, nerves, and protein production.',
    benefits: [
      'Supports normal muscle and nerve function.',
      'Participates in energy production and the synthesis of protein and DNA.',
      'Also contributes to bone structure and normal heart rhythm.',
    ],
    sources: 'Nuts, seeds, whole grains, leafy greens, and legumes.',
    caution: 'High supplemental amounts can cause diarrhea and interact with some antibiotics. Kidney disease requires special caution.',
    keywords: ['magnesium', 'mineral', 'muscle'],
  },
  protein: {
    title: 'Protein and amino acids',
    summary: 'A macronutrient used to build and repair muscle, tissue, enzymes, hormones, and immune proteins.',
    benefits: [
      'Provides amino acids for tissue maintenance and recovery after activity.',
      'Adequate protein spread across meals can support the maintenance of muscle mass.',
      'Supplements are optional when food intake is inconvenient and are not necessary for everyone.',
    ],
    sources: 'Eggs, milk, fish, lean meat, tofu, legumes, and protein products.',
    caution: 'Check allergens. People with kidney or liver disease, or a prescribed protein limit, should seek professional advice.',
    keywords: ['protein', 'whey', 'amino acid', 'glutamine', 'muscle'],
  },
  biotin: {
    title: 'Biotin',
    summary: 'A water-soluble B vitamin that works with enzymes involved in carbohydrate, fat, and protein metabolism.',
    benefits: [
      'Required by enzymes that help metabolize nutrients.',
      'Deficiency can be associated with rash and hair thinning, but deficiency is uncommon.',
      'Evidence for high-dose supplements improving hair, skin, or nails without deficiency is limited.',
    ],
    sources: 'Cooked eggs, fish, meat, sunflower seeds, nuts, and some vegetables.',
    caution: 'High-dose biotin can distort several blood tests, including thyroid and cardiac markers. Inform clinicians before testing.',
    keywords: ['biotin', 'vitamin b7', 'hair', 'nails'],
  },
  antioxidants: {
    title: 'Antioxidants',
    summary: 'Substances that help manage oxidation. Glutathione is an antioxidant made naturally inside cells.',
    benefits: [
      'Help balance reactive molecules with the body’s natural protective systems.',
      'Vitamin C, vitamin E, carotenoids, and plant compounds have different roles and are not interchangeable.',
      'Eating varied colorful produce supplies multiple antioxidants together with fiber.',
    ],
    sources: 'Vegetables, fruit, nuts, seeds, tea, cocoa, and protein foods that provide amino acids.',
    caution: '“Antioxidant” does not mean a product treats disease or that more is always better. Evidence for oral glutathione varies by formulation.',
    keywords: ['antioxidant', 'glutathione', 'cocoa', 'oxidation'],
  },
};

const zh = {
  collagen: {
    title: '胶原蛋白', summary: '存在于皮肤、骨骼、软骨、肌腱和结缔组织中的结构蛋白。',
    benefits: ['帮助维持组织的结构、强度和弹性。', '部分研究提示水解胶原蛋白可能有助于皮肤保湿和弹性，但结果受研究质量影响。', '维生素C是人体自然合成胶原蛋白所必需的。'],
    sources: '鱼皮、鸡皮、骨骼和动物结缔组织；人体会先将胶原蛋白消化为氨基酸。',
    caution: '对鱼、海鲜、牛肉或猪肉过敏者须检查来源。胶原蛋白不能用于治疗疾病。', keywords: ['胶原蛋白', '胶原肽', 'collagen'],
  },
  inulin: {
    title: '菊粉', summary: '一种可溶性益生元纤维，可到达大肠并被部分有益微生物利用。',
    benefits: ['增加膳食纤维摄入并支持规律排便。', '作为益生元，可促进某些有益肠道细菌生长。', 'FDA根据生理作用证据将菊粉类果聚糖认可为膳食纤维。'],
    sources: '菊苣根、洋葱、大蒜、芦笋、香蕉和菊芋。',
    caution: '应从少量开始并充分饮水；可能引起胀气，FODMAP敏感者尤其需要注意。', keywords: ['菊粉', '益生元', '膳食纤维', 'inulin'],
  },
  fiber: {
    title: '膳食纤维', summary: '人体不能完全消化的植物碳水化合物，包括可溶性和不溶性纤维。',
    benefits: ['增加粪便体积并支持规律排便。', '部分可溶性纤维可减缓吸收并为肠道微生物提供养分。', '高纤维食物有助于增加饱腹感，是健康饮食的一部分。'],
    sources: '蔬菜、水果、豆类、种子、燕麦和全谷物。',
    caution: '应逐渐增加并充分饮水，增加过快可能导致胀气或腹部不适。', keywords: ['膳食纤维', '纤维', '蔬菜', '全谷物'],
  },
  probiotics: {
    title: '益生菌', summary: '在菌株和数量适当时可能带来健康益处的活微生物。',
    benefits: ['可能帮助维持消化道微生物群的健康。', '效果取决于具体菌株，不能套用于所有产品。', '对抗生素相关腹泻有部分证据，但许多其他用途仍不确定。'],
    sources: '部分酸奶、发酵食品及明确标注菌株的补充剂。',
    caution: '免疫力低下、病情严重者或早产儿使用前应咨询医生。', keywords: ['益生菌', '乳酸杆菌', '双歧杆菌', 'probiotic'],
  },
  'vitamin-c': {
    title: '维生素C', summary: '参与胶原蛋白形成、免疫功能和抗氧化作用的水溶性维生素。',
    benefits: ['人体制造胶原蛋白和结缔组织所必需。', '支持正常免疫功能并具有生理抗氧化作用。', '促进植物性食物中非血红素铁的吸收。'],
    sources: '番石榴、橙子、猕猴桃、甜椒、西兰花和番茄。',
    caution: '大剂量可能导致腹泻或腹痛；有肾结石史或铁过载者应咨询专业人员。', keywords: ['维生素C', '抗坏血酸', 'vitamin c'],
  },
  'omega-3': {
    title: 'Omega-3脂肪酸', summary: '一类多不饱和脂肪；ALA是必需脂肪酸，EPA和DHA多见于鱼类和藻类。',
    benefits: ['是全身细胞膜的组成部分。', 'DHA在大脑和视网膜中含量较高，EPA参与多种信号物质形成。', '用于降低甘油三酯的高剂量产品应在医生指导下使用。'],
    sources: '三文鱼、沙丁鱼、鲭鱼、亚麻籽、奇亚籽、核桃和藻油。',
    caution: '可能产生鱼腥味或胃肠不适；高剂量可能与抗凝药相互作用。', keywords: ['omega-3', '鱼油', 'DHA', 'EPA'],
  },
  lutein: {
    title: '叶黄素与玉米黄质', summary: '集中于视网膜和晶状体的类胡萝卜素，参与滤光和抗氧化保护。',
    benefits: ['是黄斑色素的组成部分。', '帮助吸收部分高能光并在眼内发挥抗氧化作用。', 'AREDS2的获益仅适用于眼科医生评估后的特定中晚期AMD人群。'],
    sources: '羽衣甘蓝、菠菜、西兰花、玉米、蛋黄和深绿色叶菜。',
    caution: '普通叶黄素补充剂不等同于AREDS2，也未证明能为所有人预防眼病。', keywords: ['叶黄素', '玉米黄质', '眼睛', 'lutein'],
  },
  'calcium-vitamin-d': {
    title: '钙与维生素D', summary: '钙是骨骼和牙齿的重要矿物质；维生素D帮助人体正常吸收钙。',
    benefits: ['钙支持骨骼结构、肌肉收缩和神经传导。', '维生素D支持钙吸收以及正常肌肉和免疫功能。', '负重运动、充足蛋白质和均衡饮食同样重要。'],
    sources: '牛奶、酸奶、连骨小鱼、含钙豆腐、蛋黄和富脂鱼。',
    caution: '钙可能影响某些药物；肾病患者补充前应咨询医生。', keywords: ['钙', '维生素D', '骨骼', 'calcium'],
  },
  magnesium: {
    title: '镁', summary: '协助多种酶参与能量、肌肉、神经和蛋白质生成的矿物质。',
    benefits: ['支持正常肌肉和神经功能。', '参与能量生成以及蛋白质和DNA合成。', '也有助于骨骼结构和正常心律。'],
    sources: '坚果、种子、全谷物、绿叶蔬菜和豆类。',
    caution: '补充剂过量可能导致腹泻并影响部分抗生素；肾病患者应特别谨慎。', keywords: ['镁', '肌肉', 'magnesium'],
  },
  protein: {
    title: '蛋白质与氨基酸', summary: '用于构建和修复肌肉、组织、酶、激素和免疫蛋白的主要营养素。',
    benefits: ['为组织维护和运动后恢复提供氨基酸。', '每餐摄入充足蛋白质有助于维持肌肉量。', '补充剂只是在食物摄入不便时的选择，并非人人需要。'],
    sources: '鸡蛋、牛奶、鱼、瘦肉、豆腐、豆类和蛋白质产品。',
    caution: '注意过敏原；肾病、肝病或需限制蛋白者应咨询专业人员。', keywords: ['蛋白质', '乳清', '氨基酸', 'protein'],
  },
  biotin: {
    title: '生物素', summary: '参与碳水化合物、脂肪和蛋白质代谢的水溶性B族维生素。',
    benefits: ['是多种营养代谢酶所必需的。', '缺乏可能与皮疹和头发稀疏有关，但一般人缺乏较少见。', '无缺乏者使用大剂量改善头发、皮肤或指甲的证据有限。'],
    sources: '熟鸡蛋、鱼、肉、葵花籽、坚果和部分蔬菜。',
    caution: '大剂量生物素会干扰甲状腺和心脏指标等血液检查，检测前须告知医务人员。', keywords: ['生物素', '维生素B7', '头发', '指甲'],
  },
  antioxidants: {
    title: '抗氧化物', summary: '帮助调节氧化反应的物质；谷胱甘肽是细胞自然合成的抗氧化物。',
    benefits: ['帮助平衡活性分子与人体天然防御系统。', '维生素C、维生素E、类胡萝卜素和植物化合物作用不同。', '多吃不同颜色蔬果可同时获得多种抗氧化物和纤维。'],
    sources: '蔬菜、水果、坚果、种子、茶、可可和富含氨基酸的蛋白质食物。',
    caution: '“抗氧化”不代表能够治疗疾病，也并非越多越好；口服谷胱甘肽证据因配方而异。', keywords: ['抗氧化', '谷胱甘肽', '可可', 'antioxidant'],
  },
};

const lo = {
  collagen: {
    title: 'ຄໍລາເຈນ', summary: 'ໂປຣຕີນໂຄງສ້າງທີ່ພົບໃນຜິວໜັງ ກະດູກ ກະດູກອ່ອນ ເອັນ ແລະ ເນື້ອເຍື່ອ.',
    benefits: ['ຊ່ວຍຄົງໂຄງສ້າງ ຄວາມແຂງແຮງ ແລະ ຄວາມຍືດຫຍຸ່ນ.', 'ບາງການສຶກສາພົບວ່າ hydrolyzed collagen ອາດຊ່ວຍຄວາມຊຸ່ມຊື່ນຂອງຜິວ ແຕ່ຫຼັກຖານຍັງມີຂໍ້ຈຳກັດ.', 'ວິຕາມິນ C ຈຳເປັນຕໍ່ການສ້າງຄໍລາເຈນຕາມທຳມະຊາດ.'],
    sources: 'ໜັງປາ ໜັງໄກ່ ກະດູກ ແລະ ເນື້ອເຍື່ອສັດ.', caution: 'ຜູ້ແພ້ປາ ອາຫານທະເລ ງົວ ຫຼື ໝູ ຄວນກວດແຫຼ່ງທີ່ມາ. ບໍ່ແມ່ນຢາຮັກສາໂລກ.', keywords: ['ຄໍລາເຈນ', 'collagen'],
  },
  inulin: {
    title: 'ອິນູລິນ', summary: 'ໃຍອາຫານລະລາຍນ້ຳແລະພຣີໄບໂອຕິກ ທີ່ເປັນອາຫານໃຫ້ຈຸລິນຊີບາງຊະນິດ.',
    benefits: ['ເພີ່ມໃຍອາຫານ ແລະ ສະໜັບສະໜູນການຂັບຖ່າຍ.', 'ເປັນພຣີໄບໂອຕິກທີ່ຊ່ວຍຈຸລິນຊີທີ່ເປັນປະໂຫຍດບາງຊະນິດ.', 'FDA ຍອມຮັບ inulin-type fructans ເປັນໃຍອາຫານ.'],
    sources: 'ຮາກ chicory ຫົວຫອມ ກະທຽມ ໜໍ່ໄມ້ຝຣັ່ງ ແລະ ກ້ວຍ.', caution: 'ເລີ່ມຈາກປະລິມານນ້ອຍ ແລະ ດື່ມນ້ຳພຽງພໍ ເພາະອາດເຮັດໃຫ້ທ້ອງອືດ.', keywords: ['ອິນູລິນ', 'ພຣີໄບໂອຕິກ', 'ໃຍອາຫານ'],
  },
  fiber: {
    title: 'ໃຍອາຫານ', summary: 'ຄາໂບໄຮເດຣດຈາກພືດທີ່ຮ່າງກາຍຍ່ອຍບໍ່ໝົດ.',
    benefits: ['ເພີ່ມມວນອາຈົມ ແລະ ຊ່ວຍໃຫ້ຂັບຖ່າຍສະໝ່ຳສະເໝີ.', 'ໃຍລະລາຍນ້ຳບາງຊະນິດເປັນອາຫານໃຫ້ຈຸລິນຊີ.', 'ອາຫານໃຍສູງຊ່ວຍອີ່ມດົນ.'],
    sources: 'ຜັກ ໝາກໄມ້ ຖົ່ວ ເມັດພືດ ແລະ ທັນຍາພືດບໍ່ຂັດສີ.', caution: 'ເພີ່ມທີລະນ້ອຍ ແລະ ດື່ມນ້ຳພຽງພໍ.', keywords: ['ໃຍອາຫານ', 'fiber', 'ຜັກ'],
  },
  probiotics: {
    title: 'ໂພຣໄບໂອຕິກ', summary: 'ຈຸລິນຊີມີຊີວິດທີ່ອາດໃຫ້ປະໂຫຍດເມື່ອສາຍພັນແລະປະລິມານເໝາະສົມ.',
    benefits: ['ອາດຊ່ວຍສົມດຸນຈຸລິນຊີໃນລະບົບຍ່ອຍ.', 'ຜົນຂຶ້ນກັບສາຍພັນ ບໍ່ສາມາດເໝົາລວມທຸກຜະລິດຕະພັນ.', 'ຄວນເບິ່ງຊື່ສາຍພັນ ແລະ CFU ໃນສະຫຼາກ.'],
    sources: 'ນົມສົ້ມ ອາຫານໝັກບາງຊະນິດ ແລະ ອາຫານເສີມ.', caution: 'ຜູ້ມີພູມຄຸ້ມກັນອ່ອນແອ ຫຼື ປ່ວຍໜັກຄວນປຶກສາແພດ.', keywords: ['ໂພຣໄບໂອຕິກ', 'probiotic'],
  },
  'vitamin-c': {
    title: 'ວິຕາມິນ C', summary: 'ວິຕາມິນລະລາຍນ້ຳທີ່ກ່ຽວກັບການສ້າງຄໍລາເຈນ ພູມຄຸ້ມກັນ ແລະ ການຕ້ານອະນຸມູນອິດສະຫຼະ.',
    benefits: ['ຈຳເປັນຕໍ່ການສ້າງຄໍລາເຈນ.', 'ຊ່ວຍການທຳງານປົກກະຕິຂອງພູມຄຸ້ມກັນ.', 'ຊ່ວຍດູດຊຶມທາດເຫຼັກຈາກພືດ.'],
    sources: 'ຝຣັ່ງ ສົ້ມ ກີວີ ໝາກເຜັດຫວານ ແລະ ບຣອກໂຄລີ.', caution: 'ປະລິມານສູງອາດເຮັດໃຫ້ຖອກທ້ອງ ຫຼື ປວດທ້ອງ.', keywords: ['ວິຕາມິນ C', 'vitamin c'],
  },
  'omega-3': {
    title: 'ໂອເມກາ-3', summary: 'ກຸ່ມໄຂມັນບໍ່ອີ່ມຕົວ ໂດຍ EPA ແລະ DHA ພົບຫຼາຍໃນປາແລະສາຫຼ່າຍ.',
    benefits: ['ເປັນສ່ວນຂອງເຢື່ອຫຸ້ມເຊວ.', 'DHA ພົບຫຼາຍໃນສະໝອງແລະຈໍປະສາດຕາ.', 'ປະລິມານສູງເພື່ອຫຼຸດ triglyceride ຄວນຢູ່ໃຕ້ຄຳແນະນຳແພດ.'],
    sources: 'ປາແຊລມອນ ຊາດີນ ແມັກເຄີເຣວ ເມັດເຈຍ ແລະ ນ້ຳມັນສາຫຼ່າຍ.', caution: 'ອາດມີລົດຄາວ ແລະ ປະຕິສຳພັນກັບຢາຕ້ານການແຂງຕົວຂອງເລືອດ.', keywords: ['ໂອເມກາ', 'ນ້ຳມັນປາ', 'DHA', 'EPA'],
  },
  lutein: {
    title: 'ລູທີນແລະຊີແຊນທີນ', summary: 'ສານ carotenoid ທີ່ສະສົມໃນຈໍປະສາດຕາແລະເລນຕາ.',
    benefits: ['ເປັນສ່ວນຂອງເມັດສີ macula.', 'ຊ່ວຍດູດຊັບແສງພະລັງງານສູງບາງສ່ວນ.', 'ປະໂຫຍດຂອງ AREDS2 ຈຳກັດໃນຄົນເປັນ AMD ບາງກຸ່ມ.'],
    sources: 'ຄະນ້າ ປວຍເລັ້ງ ບຣອກໂຄລີ ສາລີ ແລະ ໄຂ່ແດງ.', caution: 'ອາຫານເສີມລູທີນທົ່ວໄປບໍ່ຄືສູດ AREDS2.', keywords: ['ລູທີນ', 'ຕາ', 'lutein'],
  },
  'calcium-vitamin-d': {
    title: 'ແຄລຊຽມແລະວິຕາມິນ D', summary: 'ແຄລຊຽມເປັນແຮ່ທາດຫຼັກຂອງກະດູກ ແລະ ວິຕາມິນ D ຊ່ວຍການດູດຊຶມ.',
    benefits: ['ຊ່ວຍໂຄງສ້າງກະດູກ ກ້າມຊີ້ນ ແລະ ປະສາດ.', 'ວິຕາມິນ D ຊ່ວຍດູດຊຶມແຄລຊຽມ.', 'ການອອກກຳລັງກາຍແບບລົງນ້ຳໜັກກໍສຳຄັນ.'],
    sources: 'ນົມ ນົມສົ້ມ ປານ້ອຍກິນທັງກະດູກ ເຕົ້າຫູ້ ແລະ ໄຂ່ແດງ.', caution: 'ອາດລົບກວນຢາບາງຊະນິດ; ຜູ້ເປັນໂລກໄຕຄວນປຶກສາແພດ.', keywords: ['ແຄລຊຽມ', 'ວິຕາມິນ D', 'ກະດູກ'],
  },
  magnesium: {
    title: 'ແມັກນີຊຽມ', summary: 'ແຮ່ທາດທີ່ຊ່ວຍ enzyme ດ້ານພະລັງງານ ກ້າມຊີ້ນ ປະສາດ ແລະ ໂປຣຕີນ.',
    benefits: ['ຊ່ວຍການທຳງານປົກກະຕິຂອງກ້າມຊີ້ນແລະປະສາດ.', 'ກ່ຽວຂ້ອງກັບການສ້າງພະລັງງານແລະ DNA.', 'ມີສ່ວນຕໍ່ໂຄງສ້າງກະດູກ.'],
    sources: 'ຖົ່ວ ເມັດພືດ ທັນຍາພືດ ແລະ ຜັກໃບຂຽວ.', caution: 'ປະລິມານສູງຈາກອາຫານເສີມອາດເຮັດໃຫ້ຖອກທ້ອງ.', keywords: ['ແມັກນີຊຽມ', 'magnesium'],
  },
  protein: {
    title: 'ໂປຣຕີນແລະກົດອະມິໂນ', summary: 'ສານອາຫານຫຼັກທີ່ໃຊ້ສ້າງແລະສ້ອມແປງກ້າມຊີ້ນ ເນື້ອເຍື່ອ enzyme ແລະ hormone.',
    benefits: ['ໃຫ້ກົດອະມິໂນສຳລັບສ້ອມແປງເນື້ອເຍື່ອ.', 'ໂປຣຕີນພຽງພໍໃນແຕ່ລະມື້ຊ່ວຍຮັກສາມວນກ້າມຊີ້ນ.', 'ອາຫານເສີມເປັນພຽງທາງເລືອກ.'],
    sources: 'ໄຂ່ ນົມ ປາ ຊີ້ນບໍ່ຕິດມັນ ເຕົ້າຫູ້ ແລະ ຖົ່ວ.', caution: 'ຜູ້ເປັນໂລກໄຕ ຫຼື ຕັບຄວນປຶກສາຜູ້ຊ່ຽວຊານ.', keywords: ['ໂປຣຕີນ', 'whey', 'ກົດອະມິໂນ'],
  },
  biotin: {
    title: 'ໄບໂອຕິນ', summary: 'ວິຕາມິນ B ລະລາຍນ້ຳທີ່ກ່ຽວກັບການເຜົາຜານຄາໂບໄຮເດຣດ ໄຂມັນ ແລະ ໂປຣຕີນ.',
    benefits: ['ຈຳເປັນຕໍ່ enzyme ທີ່ເຜົາຜານສານອາຫານ.', 'ການຂາດອາດກ່ຽວກັບຜື່ນແລະຜົມບາງ ແຕ່ພົບໄດ້ໜ້ອຍ.', 'ຫຼັກຖານຕໍ່ຜົມ ຜິວ ແລະ ເລັບໃນຄົນບໍ່ຂາດຍັງຈຳກັດ.'],
    sources: 'ໄຂ່ສຸກ ປາ ຊີ້ນ ເມັດຕາເວັນ ແລະ ຖົ່ວ.', caution: 'ປະລິມານສູງອາດລົບກວນຜົນກວດເລືອດ ຕ້ອງແຈ້ງແພດກ່ອນກວດ.', keywords: ['ໄບໂອຕິນ', 'ຜົມ', 'ເລັບ'],
  },
  antioxidants: {
    title: 'ສານຕ້ານອະນຸມູນອິດສະຫຼະ', summary: 'ສານທີ່ຊ່ວຍຄວບຄຸມ oxidation; glutathione ແມ່ນສານທີ່ເຊວສ້າງໄດ້.',
    benefits: ['ຊ່ວຍສົມດຸນໂມເລກຸນທີ່ໄວຕໍ່ປະຕິກິລິຍາ.', 'ວິຕາມິນ C, E ແລະ carotenoid ມີໜ້າທີ່ຕ່າງກັນ.', 'ການກິນຜັກໝາກໄມ້ຫຼາຍສີໃຫ້ສານຫຼາຍຊະນິດ.'],
    sources: 'ຜັກ ໝາກໄມ້ ຖົ່ວ ເມັດພືດ ຊາ ແລະ ໂກໂກ້.', caution: 'ຄຳວ່າ “ຕ້ານອະນຸມູນອິດສະຫຼະ” ບໍ່ໝາຍຄວາມວ່າຮັກສາໂລກໄດ້.', keywords: ['ຕ້ານອະນຸມູນ', 'glutathione', 'ໂກໂກ້'],
  },
};

const my = {
  collagen: {
    title: 'ကော်လာဂျင်', summary: 'အရေပြား၊ အရိုး၊ အရိုးနု၊ အရွတ်နှင့် တွယ်ဆက်တစ်ရှူးများတွင်ရှိသော ဖွဲ့စည်းပုံပရိုတိန်း။',
    benefits: ['တစ်ရှူးများ၏ ဖွဲ့စည်းပုံ၊ ခိုင်မာမှုနှင့် ပျော့ပျောင်းမှုကို ထောက်ပံ့သည်။', 'အချို့သုတေသနတွင် hydrolyzed collagen သည် အရေပြားစိုထိုင်းမှုကို အထောက်အကူပြုနိုင်သော်လည်း အထောက်အထားတွင် ကန့်သတ်ချက်ရှိသည်။', 'ဗီတာမင် C သည် ခန္ဓာကိုယ်၏ သဘာဝကော်လာဂျင်ဖွဲ့စည်းမှုအတွက် လိုအပ်သည်။'],
    sources: 'ငါးအရေပြား၊ ကြက်အရေပြား၊ အရိုးနှင့် တိရစ္ဆာန်တွယ်ဆက်တစ်ရှူးများ။', caution: 'ငါး၊ ပင်လယ်စာ၊ အမဲ သို့မဟုတ် ဝက်သားဓာတ်မတည့်သူများ အရင်းအမြစ်ကိုစစ်ဆေးပါ။ ရောဂါကုသဆေးမဟုတ်ပါ။', keywords: ['ကော်လာဂျင်', 'collagen'],
  },
  inulin: {
    title: 'အင်နူလင်', summary: 'အူမကြီးရှိ အကျိုးပြုအဏုဇီဝအချို့အတွက် အစာဖြစ်သော ပျော်ဝင်နိုင်သည့် prebiotic အမျှင်ဓာတ်။',
    benefits: ['အမျှင်ဓာတ်တိုးစေပြီး ပုံမှန်ဝမ်းသွားမှုကို ထောက်ပံ့သည်။', 'အကျိုးပြုအူလမ်းကြောင်းဘက်တီးရီးယားအချို့ကို ထောက်ပံ့သည့် prebiotic ဖြစ်သည်။', 'FDA က inulin-type fructans ကို အမျှင်ဓာတ်အဖြစ် အသိအမှတ်ပြုထားသည်။'],
    sources: 'Chicory အမြစ်၊ ကြက်သွန်နီ၊ ကြက်သွန်ဖြူ၊ asparagus နှင့် ငှက်ပျောသီး။', caution: 'အနည်းငယ်မှစပြီး ရေပြည့်ဝစွာသောက်ပါ။ လေပွခြင်း သို့မဟုတ် ဝမ်းဗိုက်မအီမသာ ဖြစ်နိုင်သည်။', keywords: ['အင်နူလင်', 'prebiotic', 'အမျှင်ဓာတ်'],
  },
  fiber: {
    title: 'အမျှင်ဓာတ်', summary: 'ခန္ဓာကိုယ်က အပြည့်အဝမချေဖျက်နိုင်သော အပင်မှ ကာဗိုဟိုက်ဒရိတ်။',
    benefits: ['ဝမ်းပမာဏတိုးစေပြီး ပုံမှန်ဝမ်းသွားမှုကို ထောက်ပံ့သည်။', 'ပျော်ဝင်နိုင်သည့် အမျှင်အချို့သည် အူလမ်းကြောင်းအဏုဇီဝများအတွက် အစာဖြစ်သည်။', 'အမျှင်ဓာတ်များသောအစားအစာသည် ပြည့်ဝမှုကို အထောက်အကူပြုသည်။'],
    sources: 'ဟင်းသီးဟင်းရွက်၊ သစ်သီး၊ ပဲ၊ အစေ့များ၊ oats နှင့် whole grains။', caution: 'ဖြည်းဖြည်းတိုးပြီး ရေလုံလောက်စွာသောက်ပါ။ မြန်လွန်းလျှင် လေပွနိုင်သည်။', keywords: ['အမျှင်ဓာတ်', 'fiber', 'ဟင်းသီးဟင်းရွက်'],
  },
  probiotics: {
    title: 'ပရိုဘိုင်အိုတစ်', summary: 'သင့်တော်သောမျိုးစိတ်နှင့် ပမာဏတွင် ကျန်းမာရေးအကျိုးရှိနိုင်သော အသက်ရှင်အဏုဇီဝများ။',
    benefits: ['အစာခြေလမ်းကြောင်းအဏုဇီဝအသိုင်းအဝိုင်းကို ထောက်ပံ့နိုင်သည်။', 'အကျိုးသက်ရောက်မှုသည် မျိုးစိတ်ပေါ်မူတည်၍ ထုတ်ကုန်တိုင်းကို မတူညီနိုင်သည်။', 'Label ပေါ်ရှိ မျိုးစိတ်အမည်နှင့် CFU ကိုကြည့်သင့်သည်။'],
    sources: 'Yogurt၊ fermented foods အချို့နှင့် မျိုးစိတ်ဖော်ပြထားသော supplements။', caution: 'ကိုယ်ခံအားနည်းသူ၊ ပြင်းထန်စွာနာမကျန်းသူများ အသုံးမပြုမီ ဆရာဝန်နှင့်တိုင်ပင်ပါ။', keywords: ['ပရိုဘိုင်အိုတစ်', 'probiotic'],
  },
  'vitamin-c': {
    title: 'ဗီတာမင် C', summary: 'ကော်လာဂျင်ဖွဲ့စည်းမှု၊ ကိုယ်ခံအားနှင့် antioxidant လုပ်ဆောင်မှုတွင် ပါဝင်သော ရေပျော်ဗီတာမင်။',
    benefits: ['ကော်လာဂျင်နှင့် တွယ်ဆက်တစ်ရှူးဖွဲ့စည်းရန် လိုအပ်သည်။', 'ပုံမှန်ကိုယ်ခံအားလုပ်ဆောင်မှုကို ထောက်ပံ့သည်။', 'အပင်အစားအစာမှ non-heme iron စုပ်ယူမှုကို တိုးစေသည်။'],
    sources: 'မာလကာ၊ လိမ္မော်၊ kiwi၊ ငရုတ်ပွ၊ broccoli နှင့် ခရမ်းချဉ်သီး။', caution: 'ပမာဏများလွန်းလျှင် ဝမ်းလျှော သို့မဟုတ် ဗိုက်နာနိုင်သည်။', keywords: ['ဗီတာမင် C', 'vitamin c'],
  },
  'omega-3': {
    title: 'အိုမီဂါ-3', summary: 'ALA၊ EPA နှင့် DHA ပါဝင်သည့် polyunsaturated fatty acids အုပ်စု။',
    benefits: ['ခန္ဓာကိုယ်တစ်လျှောက် cell membrane များ၏ အစိတ်အပိုင်းဖြစ်သည်။', 'DHA သည် ဦးနှောက်နှင့် retina တွင် များစွာရှိသည်။', 'Triglyceride အတွက် high-dose ထုတ်ကုန်များကို ဆရာဝန်ညွှန်ကြားမှုဖြင့် သုံးသင့်သည်။'],
    sources: 'Salmon၊ sardine၊ mackerel၊ flaxseed၊ chia seed၊ walnut နှင့် algae oil။', caution: 'ငါးနံ့ သို့မဟုတ် အစာခြေမအီမသာ ဖြစ်နိုင်ပြီး high dose သည် anticoagulant ဆေးနှင့် အပြန်အလှန်သက်ရောက်နိုင်သည်။', keywords: ['အိုမီဂါ', 'ငါးဆီ', 'DHA', 'EPA'],
  },
  lutein: {
    title: 'လူတိန်းနှင့် ဇီအာဇန်သင်း', summary: 'Retina နှင့် မျက်လုံးမှန်ဘီလူးတွင်စုဝေးကာ အလင်းစစ်ထုတ်ခြင်းနှင့် antioxidant ကာကွယ်မှုတွင် ပါဝင်သော carotenoids။',
    benefits: ['Macular pigment ၏ အစိတ်အပိုင်းဖြစ်သည်။', 'စွမ်းအင်မြင့်အလင်းအချို့ကို စုပ်ယူကာ မျက်လုံးတွင် antioxidant အဖြစ်လုပ်ဆောင်သည်။', 'AREDS2 အကျိုးကျေးဇူးသည် သတ်မှတ် AMD လူနာအုပ်စုများအတွက်သာ ဖြစ်သည်။'],
    sources: 'Kale၊ spinach၊ broccoli၊ ပြောင်းဖူး၊ ကြက်ဥအနှစ်နှင့် အစိမ်းရောင်အရွက်များ။', caution: 'သာမန် lutein supplement သည် AREDS2 နှင့် မတူဘဲ လူတိုင်းတွင် မျက်စိရောဂါကာကွယ်ကြောင်း မသက်သေပြထားပါ။', keywords: ['လူတိန်း', 'မျက်လုံး', 'lutein'],
  },
  'calcium-vitamin-d': {
    title: 'ကယ်လ်စီယမ်နှင့် ဗီတာမင် D', summary: 'ကယ်လ်စီယမ်သည် အရိုးနှင့်သွား၏ အဓိကသတ္တုဓာတ်ဖြစ်ပြီး ဗီတာမင် D က စုပ်ယူမှုကိုကူညီသည်။',
    benefits: ['အရိုးဖွဲ့စည်းပုံ၊ ကြွက်သားကျုံ့ခြင်းနှင့် အာရုံကြော signal များကို ထောက်ပံ့သည်။', 'ဗီတာမင် D သည် ကယ်လ်စီယမ်စုပ်ယူမှုကို ထောက်ပံ့သည်။', 'Weight-bearing exercise နှင့် အာဟာရညီမျှမှုလည်း အရေးကြီးသည်။'],
    sources: 'နို့၊ yogurt၊ အရိုးပါငါးသေး၊ calcium tofu၊ ကြက်ဥအနှစ်နှင့် အဆီများသောငါး။', caution: 'ဆေးအချို့နှင့် အပြန်အလှန်သက်ရောက်နိုင်သည်။ ကျောက်ကပ်ရောဂါရှိသူ ဆရာဝန်နှင့်တိုင်ပင်ပါ။', keywords: ['ကယ်လ်စီယမ်', 'ဗီတာမင် D', 'အရိုး'],
  },
  magnesium: {
    title: 'မဂ္ဂနီစီယမ်', summary: 'စွမ်းအင်၊ ကြွက်သား၊ အာရုံကြောနှင့် ပရိုတိန်းထုတ်လုပ်မှု enzyme များကို ကူညီသော သတ္တုဓာတ်။',
    benefits: ['ပုံမှန်ကြွက်သားနှင့် အာရုံကြောလုပ်ဆောင်မှုကို ထောက်ပံ့သည်။', 'စွမ်းအင်၊ ပရိုတိန်းနှင့် DNA ထုတ်လုပ်မှုတွင် ပါဝင်သည်။', 'အရိုးဖွဲ့စည်းပုံနှင့် ပုံမှန်နှလုံးခုန်နှုန်းကိုလည်း ထောက်ပံ့သည်။'],
    sources: 'အခွံမာသီး၊ အစေ့၊ whole grains၊ အစိမ်းရောင်အရွက်နှင့် ပဲမျိုးစုံ။', caution: 'Supplement ပမာဏများလွန်းလျှင် ဝမ်းလျှောနိုင်ပြီး antibiotics အချို့နှင့် အပြန်အလှန်သက်ရောက်နိုင်သည်။', keywords: ['မဂ္ဂနီစီယမ်', 'magnesium'],
  },
  protein: {
    title: 'ပရိုတိန်းနှင့် အမိုင်နိုအက်ဆစ်', summary: 'ကြွက်သား၊ တစ်ရှူး၊ enzyme၊ hormone နှင့် immune proteins တည်ဆောက်ပြုပြင်ရန် အသုံးပြုသော အဓိကအာဟာရ။',
    benefits: ['တစ်ရှူးထိန်းသိမ်းမှုနှင့် လှုပ်ရှားပြီးနောက် ပြန်လည်ပြုပြင်ရန် amino acids ပေးသည်။', 'တစ်နေ့တာပရိုတိန်းလုံလောက်မှုသည် ကြွက်သားထုထည်ထိန်းသိမ်းရန် ကူညီသည်။', 'Supplement သည် အစားအစာမလွယ်ကူသည့်အခါ ရွေးချယ်စရာသာဖြစ်သည်။'],
    sources: 'ကြက်ဥ၊ နို့၊ ငါး၊ အဆီနည်းအသား၊ tofu၊ ပဲနှင့် protein products။', caution: 'ကျောက်ကပ် သို့မဟုတ် အသည်းရောဂါရှိသူများ ကျွမ်းကျင်သူနှင့်တိုင်ပင်ပါ။', keywords: ['ပရိုတိန်း', 'whey', 'အမိုင်နိုအက်ဆစ်'],
  },
  biotin: {
    title: 'ဘိုင်အိုတင်', summary: 'ကာဗိုဟိုက်ဒရိတ်၊ အဆီနှင့် ပရိုတိန်း metabolism တွင် ပါဝင်သော ရေပျော် B ဗီတာမင်။',
    benefits: ['အာဟာရ metabolism enzyme များအတွက် လိုအပ်သည်။', 'ချို့တဲ့မှုသည် အဖုနှင့် ဆံပင်ပါးခြင်းနှင့် ဆက်စပ်နိုင်သော်လည်း ရှားပါးသည်။', 'မချို့တဲ့သူတွင် ဆံပင်၊ အရေပြား၊ လက်သည်းအတွက် high-dose အထောက်အထားကန့်သတ်ထားသည်။'],
    sources: 'ချက်ပြီးကြက်ဥ၊ ငါး၊ အသား၊ နေကြာစေ့၊ အခွံမာသီးနှင့် ဟင်းသီးဟင်းရွက်အချို့။', caution: 'High-dose biotin သည် thyroid နှင့် cardiac blood tests များကို လွဲမှားစေနိုင်သည်။ စမ်းသပ်မီ ဆရာဝန်ကိုပြောပါ။', keywords: ['ဘိုင်အိုတင်', 'ဆံပင်', 'လက်သည်း'],
  },
  antioxidants: {
    title: 'အန်တီအောက်စီဒန့်', summary: 'Oxidation ကို စီမံရာတွင်ကူညီသည့် အရာများ; glutathione ကို cell များက သဘာဝအတိုင်း ထုတ်လုပ်သည်။',
    benefits: ['Reactive molecules နှင့် ခန္ဓာကိုယ်ကာကွယ်ရေးစနစ်အကြား မျှတမှုကို ကူညီသည်။', 'ဗီတာမင် C၊ E၊ carotenoids နှင့် plant compounds တို့၏ အခန်းကဏ္ဍမတူပါ။', 'အရောင်စုံဟင်းသီးဟင်းရွက်နှင့်သစ်သီးစားခြင်းက antioxidants နှင့် fiber များပေးသည်။'],
    sources: 'ဟင်းသီးဟင်းရွက်၊ သစ်သီး၊ အခွံမာသီး၊ အစေ့၊ လက်ဖက်ရည်၊ cocoa နှင့် protein foods။', caution: '“Antioxidant” သည် ရောဂါကုသနိုင်သည်ဟု မဆိုလိုသလို များလေကောင်းလေ မဟုတ်ပါ။', keywords: ['အန်တီအောက်စီဒန့်', 'glutathione', 'cocoa'],
  },
};

const translations = { en, zh, lo, my };
const sourceLabels = {
  en: 'Scientific reference',
  zh: '科学资料来源',
  lo: 'ແຫຼ່ງຂໍ້ມູນວິທະຍາສາດ',
  my: 'သိပ္ပံအချက်အလက်ရင်းမြစ်',
};

export function getIngredientKnowledge(locale) {
  if (locale === 'th' || !translations[locale]) return thaiKnowledge;
  const localized = translations[locale];

  return thaiKnowledge.map((article) => ({
    ...article,
    ...localized[article.id],
    alias: article.alias,
    keywords: [...article.keywords, ...(localized[article.id]?.keywords || [])],
    sourceLabel: sourceLabels[locale],
  }));
}
