export type Locale = "en" | "ar";
export type Copy = { en: string; ar: string };

export const solutions = [
  {
    id: "dc",
    number: "01",
    title: { en: "Enterprise Data Centre", ar: "مراكز البيانات المؤسسية" },
    description: {
      en: "High-density fibre, Cat8 copper, intelligent power and precision rack systems—engineered as one critical layer.",
      ar: "ألياف عالية الكثافة، ونحاس Cat8، وطاقة ذكية، وأنظمة رفوف دقيقة — مصممة كطبقة حرجة واحدة.",
    },
    meta: "800G / MPO · MTP / Smart PDU",
  },
  {
    id: "enterprise",
    number: "02",
    title: { en: "Enterprise Networks", ar: "شبكات المؤسسات" },
    description: {
      en: "Standards-led copper and fibre infrastructure built for uptime, PoE density and decades of change.",
      ar: "بنية تحتية نحاسية وألياف وفق المعايير، مصممة للاستمرارية وكثافة PoE وعقود من التطور.",
    },
    meta: "Cat6A / OM5 / Wi-Fi 7 ready",
  },
  {
    id: "gpon",
    number: "03",
    title: { en: "GPON & FTTx", ar: "حلول GPON وFTTx" },
    description: {
      en: "Approved fibre pathways from the provider handoff to every floor, room and connected endpoint.",
      ar: "مسارات ألياف معتمدة من نقطة تسليم المزود إلى كل طابق وغرفة ونقطة اتصال.",
    },
    meta: "FTTH / Splitters / ODF",
  },
  {
    id: "osp",
    number: "04",
    title: { en: "Outside Plant", ar: "البنية التحتية الخارجية" },
    description: {
      en: "Resilient cabinets, closures, ducts and cables for the harshest routes between buildings and cities.",
      ar: "خزائن ووصلات وقنوات وكابلات متينة لأقسى المسارات بين المباني والمدن.",
    },
    meta: "IP65 / Armoured / Aerial",
  },
];

export const products = [
  { code: "DC-RK-DCS-42U", name: { en: "DCS Series Data Centre Cabinet", ar: "خزانة مركز بيانات DCS" }, family: "Racks", spec: "42U · 800 × 1200 mm", badge: "Data Centre" },
  { code: "DC-FO-MPO-1U", name: { en: "Ultra High Density MPO Chassis", ar: "هيكل MPO فائق الكثافة" }, family: "Fibre", spec: "144F · 1U · OM4/OM5", badge: "800G Ready" },
  { code: "DC-CU-C8-SFTP", name: { en: "Cat8 S/FTP Copper System", ar: "نظام نحاسي Cat8 S/FTP" }, family: "Copper", spec: "2000 MHz · 40G", badge: "DC Grade" },
  { code: "DC-PDU-SM-32A", name: { en: "Intelligent Metered PDU", ar: "وحدة توزيع طاقة ذكية" }, family: "Power", spec: "32A · 36 × C13 / 6 × C19", badge: "Remote Metering" },
  { code: "DC-FO-OS2-24C", name: { en: "OS2 Loose Tube Fibre Cable", ar: "كابل ألياف OS2 أنبوبي" }, family: "Fibre", spec: "24 Core · LSZH · Dca", badge: "Telco Approved" },
  { code: "DC-CU-C6A-UFTP", name: { en: "Cat6A U/FTP Cable", ar: "كابل Cat6A U/FTP" }, family: "Copper", spec: "500 MHz · 23 AWG · LSZH", badge: "PoE++" },
];

export const trustProof = [
  { value: "25", suffix: { en: "YEAR", ar: "عاماً" }, label: { en: "System warranty", ar: "ضمان النظام" } },
  { value: "45", suffix: { en: "COUNTRIES", ar: "دولة" }, label: { en: "Group reach", ar: "انتشار المجموعة" } },
  { value: "2006", suffix: { en: "SINCE", ar: "منذ" }, label: { en: "Built on engineering", ar: "هندسة موثوقة" } },
  { value: "RCDD", suffix: { en: "ENGINEERING", ar: "هندسة" }, label: { en: "Specification expertise", ar: "خبرة في المواصفات" } },
];

export const faqs = [
  {
    q: { en: "What does Datacom manufacture?", ar: "ما الذي تصنعه داتاكوم؟" },
    a: {
      en: "Datacom manufactures end-to-end passive ICT infrastructure for data centres, enterprise networks, GPON/FTTx, PoE and outside plant applications, including copper, fibre, racks and power systems.",
      ar: "تصنع داتاكوم بنية تحتية سلبية متكاملة لتقنية المعلومات والاتصالات لمراكز البيانات وشبكات المؤسسات وGPON/FTTx وPoE والبنية الخارجية، بما يشمل النحاس والألياف والرفوف وأنظمة الطاقة.",
    },
  },
  {
    q: { en: "Can Datacom support data centre specifications?", ar: "هل تدعم داتاكوم مواصفات مراكز البيانات؟" },
    a: {
      en: "Yes. Datacom provides high-density MPO/MTP fibre, Cat8 copper, data centre cabinets, containment and intelligent PDU systems with engineering support from design through deployment.",
      ar: "نعم. توفر داتاكوم ألياف MPO/MTP عالية الكثافة ونحاس Cat8 وخزائن مراكز البيانات وأنظمة الاحتواء ووحدات الطاقة الذكية، مع دعم هندسي من التصميم حتى التنفيذ.",
    },
  },
  {
    q: { en: "Where is Datacom based?", ar: "أين يقع مقر داتاكوم؟" },
    a: {
      en: "Datacom was established in Zurich in 2006 and has been headquartered in Dubai since 2018, with a regional office in Riyadh and reach through Sharafi Holding.",
      ar: "تأسست داتاكوم في زيورخ عام 2006، ويقع مقرها الرئيسي في دبي منذ 2018، مع مكتب إقليمي في الرياض وانتشار عبر مجموعة شرفي.",
    },
  },
];

export const t = (value: Copy, locale: Locale) => value[locale];
