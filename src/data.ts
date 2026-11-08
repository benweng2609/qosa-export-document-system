import type { AppData, Company, Customer, DocumentTemplate, DocumentType, LanguageCode, Product, TradeDocument } from "./types";
import { QOSA_LOGO } from "./branding";

export const DOCUMENT_TYPES: {
  id: DocumentType;
  name: string;
  en: string;
  short: string;
  description: string;
  prefix: string;
}[] = [
  {
    id: "quotation",
    name: "报价单",
    en: "Quotation",
    short: "QT",
    description: "向客户确认商品、价格与报价有效期",
    prefix: "QT",
  },
  {
    id: "proforma",
    name: "形式发票",
    en: "Proforma Invoice",
    short: "PI",
    description: "确认交易明细、付款与运输安排",
    prefix: "PI",
  },
  {
    id: "commercial",
    name: "商业发票",
    en: "Commercial Invoice",
    short: "CI",
    description: "用于报关与结算的正式交易单据",
    prefix: "CI",
  },
  {
    id: "packing",
    name: "装箱单",
    en: "Packing List",
    short: "PL",
    description: "列明包装、数量、重量与体积，默认隐藏价格",
    prefix: "PL",
  },
  {
    id: "contract",
    name: "销售合同",
    en: "Sales Contract",
    short: "SC",
    description: "记录交易、交付、检验与合同条款",
    prefix: "SC",
  },
];

export const LANGUAGES: {
  code: LanguageCode;
  name: string;
  native: string;
  locale: string;
}[] = [
  { code: "zh-CN", name: "简体中文", native: "简体中文", locale: "zh-CN" },
  { code: "en", name: "英语", native: "English", locale: "en-US" },
  { code: "es", name: "西班牙语", native: "Español", locale: "es-ES" },
  { code: "fr", name: "法语", native: "Français", locale: "fr-FR" },
  { code: "de", name: "德语", native: "Deutsch", locale: "de-DE" },
  { code: "ru", name: "俄语", native: "Русский", locale: "ru-RU" },
  { code: "ar", name: "阿拉伯语", native: "العربية", locale: "ar-SA" },
  { code: "pt", name: "葡萄牙语", native: "Português", locale: "pt-PT" },
  { code: "ja", name: "日语", native: "日本語", locale: "ja-JP" },
  { code: "ko", name: "韩语", native: "한국어", locale: "ko-KR" },
  { code: "vi", name: "越南语", native: "Tiếng Việt", locale: "vi-VN" },
];

export const THEMES = [
  { id: "ocean", name: "深海蓝", color: "#1D4ED8", pale: "#EFF6FF" },
  { id: "teal", name: "墨青", color: "#0F766E", pale: "#F0FDFA" },
  { id: "slate", name: "石墨", color: "#334155", pale: "#F1F5F9" },
  { id: "forest", name: "森林绿", color: "#166534", pale: "#F0FDF4" },
  { id: "indigo", name: "靛蓝", color: "#4338CA", pale: "#EEF2FF" },
  { id: "wine", name: "酒红", color: "#9F1239", pale: "#FFF1F2" },
  { id: "amber", name: "琥珀棕", color: "#92400E", pale: "#FFFBEB" },
  { id: "violet", name: "紫罗兰", color: "#6D28D9", pale: "#F5F3FF" },
  { id: "terracotta", name: "赤陶橙", color: "#C2410C", pale: "#FFF7ED" },
];

export const demoCompany: Company = {
  nameZh: "QOSA",
  nameEn: "QOSA",
  address: "",
  phone: "",
  email: "",
  website: "",
  registration: "",
  bankName: "",
  bankAccount: "",
  swift: "",
  bankAddress: "",
  logo: QOSA_LOGO,
};

const now = "2026-11-07T08:30:00.000Z";
export const demoCustomers: Customer[] = [
  {
    id: "cus-nordic",
    name: "Nordic Living S.L.",
    contact: "Elena García",
    country: "西班牙",
    email: "elena@nordicliving-example.com",
    phone: "+34 910 555 182",
    billingAddress: "Calle de Serrano 48, 28001 Madrid, Spain",
    shippingAddress: "Carrer de la Marina 16, 08005 Barcelona, Spain",
    registration: "VAT ES-B86202618",
    defaultLanguage: "en",
    updatedAt: now,
  },
  {
    id: "cus-atelier",
    name: "Atelier Maison GmbH",
    contact: "Jonas Weber",
    country: "德国",
    email: "jonas@ateliermaison-example.com",
    phone: "+49 30 5550 2718",
    billingAddress: "Torstraße 112, 10119 Berlin, Germany",
    shippingAddress: "Speicherstadt 8, 20457 Hamburg, Germany",
    registration: "DE 318 2026 881",
    defaultLanguage: "de",
    updatedAt: "2026-11-05T10:00:00.000Z",
  },
  {
    id: "cus-harbor",
    name: "Harbor & Pine Ltd.",
    contact: "Olivia Chen",
    country: "加拿大",
    email: "olivia@harborpine-example.com",
    phone: "+1 604 555 0136",
    billingAddress: "850 West Hastings St, Vancouver, BC V6C 1E1, Canada",
    shippingAddress: "850 West Hastings St, Vancouver, BC V6C 1E1, Canada",
    registration: "BN 702618820RC0001",
    defaultLanguage: "en",
    updatedAt: "2026-11-02T10:00:00.000Z",
  },
];

export const demoProducts: Product[] = [
  {
    id: "prod-b500",
    sku: "YF-B500",
    name: "500 ml Stainless Steel Insulated Bottle",
    nameZh: "500 毫升不锈钢保温杯",
    description: "Double-wall 304 stainless steel, matte finish, leak-proof lid",
    unit: "pcs",
    defaultUnitPrice: 4.85,
    currency: "USD",
    hsCode: "9617009000",
    originCountry: "China",
    netWeight: 0.32,
    grossWeight: 0.38,
    packageType: "Carton",
    dimensions: "50 × 40 × 40 cm / 24 pcs",
    updatedAt: now,
  },
  {
    id: "prod-m350",
    sku: "YF-M350",
    name: "350 ml Ceramic Travel Mug",
    nameZh: "350 毫升陶瓷随行杯",
    description: "Glazed ceramic body, silicone sleeve and splash-resistant lid",
    unit: "pcs",
    defaultUnitPrice: 3.6,
    currency: "USD",
    hsCode: "6912001000",
    originCountry: "China",
    netWeight: 0.3,
    grossWeight: 0.36,
    packageType: "Carton",
    dimensions: "45 × 35 × 40 cm / 24 pcs",
    updatedAt: now,
  },
  {
    id: "prod-c720",
    sku: "YF-C720",
    name: "720 ml Glass Food Container",
    nameZh: "720 毫升玻璃保鲜盒",
    description: "Borosilicate glass, airtight PP lid, oven-safe container body",
    unit: "pcs",
    defaultUnitPrice: 2.95,
    currency: "USD",
    hsCode: "7013420000",
    originCountry: "China",
    netWeight: 0.46,
    grossWeight: 0.52,
    packageType: "Carton",
    dimensions: "48 × 36 × 32 cm / 24 pcs",
    updatedAt: "2026-11-04T10:00:00.000Z",
  },
  {
    id: "prod-t450",
    sku: "YF-T450",
    name: "450 ml Bamboo Lid Tea Tumbler",
    nameZh: "450 毫升竹盖茶杯",
    description: "Borosilicate glass, removable stainless infuser, bamboo lid",
    unit: "pcs",
    defaultUnitPrice: 4.2,
    currency: "USD",
    hsCode: "7013990000",
    originCountry: "China",
    netWeight: 0.34,
    grossWeight: 0.41,
    packageType: "Carton",
    dimensions: "46 × 36 × 38 cm / 24 pcs",
    updatedAt: "2026-11-01T10:00:00.000Z",
  },
];

export function itemFromProduct(product: Product, quantity = 100): TradeDocument["items"][number] {
  return {
    id: `item-${crypto.randomUUID()}`,
    productId: product.id,
    sku: product.sku,
    name: product.name,
    nameZh: product.nameZh,
    description: product.description,
    quantity,
    unit: product.unit,
    unitPrice: product.defaultUnitPrice,
    packageCount: Math.ceil(quantity / 24),
    netWeight: Number((quantity * product.netWeight).toFixed(2)),
    grossWeight: Number((quantity * product.grossWeight).toFixed(2)),
    measurements: Number((Math.ceil(quantity / 24) * 0.064).toFixed(3)),
    image: product.image,
  };
}

function makeDocument(type: DocumentType, number: string, customer: Customer, products: Product[], status: TradeDocument["status"], updatedAt: string): TradeDocument {
  const quantities = type === "packing" ? [2400, 1600, 480, 720] : [1200, 800];
  return {
    id: `doc-${number.toLowerCase()}`,
    type,
    number,
    title: `${customer.name} ${DOCUMENT_TYPES.find((t) => t.id === type)?.name}`,
    issueDate: "2026-11-07",
    status,
    language: customer.defaultLanguage,
    themeId: "ocean",
    currency: "USD",
    companySnapshot: { ...demoCompany },
    customerSnapshot: { ...customer },
    items: products.map((p, i) => itemFromProduct(p, quantities[i] ?? 100)),
    validUntil: "2026-11-30",
    paymentTerms: "30% T/T deposit, 70% balance against copy of B/L",
    incoterm: "FOB Shanghai, Incoterms® 2020",
    origin: "Shanghai, China",
    destination: customer.country === "西班牙" ? "Barcelona, Spain" : customer.country === "德国" ? "Hamburg, Germany" : "Vancouver, Canada",
    shippingMarks: "NORDIC LIVING\nBARCELONA\nC/NO. 1–UP\nMADE IN CHINA",
    contractTerms: "Inspection before shipment by the seller. Claims concerning quality must be made within 30 days after arrival of the goods at destination.\nForce majeure: Neither party shall be liable for failure to perform caused by events beyond reasonable control.",
    notes: "Please quote the document number in all correspondence.",
    showPrices: type !== "packing",
    showImages: false,
    showStamp: true,
    showBankInfo: type === "proforma" || type === "contract",
    createdAt: updatedAt,
    updatedAt,
  };
}

const pi = makeDocument("proforma", "PI-2026-0018", demoCustomers[0], demoProducts.slice(0, 2), "draft", "2026-11-07T08:30:00.000Z");
const packing = makeDocument("packing", "PL-2026-0012", demoCustomers[0], demoProducts, "completed", "2026-11-06T09:20:00.000Z");
packing.items = [
  ...packing.items,
  ...packing.items.map((item, index) => ({
    ...item,
    id: `${item.id}-batch-b`,
    quantity: item.quantity / 2,
    packageCount: Math.max(1, Math.round(item.packageCount / 2)),
    netWeight: Number((item.netWeight / 2).toFixed(2)),
    grossWeight: Number((item.grossWeight / 2).toFixed(2)),
    measurements: Number((item.measurements / 2).toFixed(3)),
    description: `${item.description} · Batch B${index + 1}`,
  })),
];
const quote = makeDocument("quotation", "QT-2026-0026", demoCustomers[1], demoProducts.slice(1, 4), "draft", "2026-11-05T07:45:00.000Z");
const archived = makeDocument("commercial", "CI-2026-0009", demoCustomers[2], demoProducts.slice(0, 2), "archived", "2026-10-28T06:10:00.000Z");

export const EMPTY_DOCUMENT: Pick<TradeDocument, "paymentTerms" | "incoterm" | "contractTerms" | "notes"> = {
  paymentTerms: "30% T/T deposit, 70% balance against copy of B/L",
  incoterm: "FOB Shanghai, Incoterms® 2020",
  contractTerms: "The seller shall deliver goods conforming to the agreed specification. Inspection before shipment by the seller.\nClaims concerning quality must be made within 30 days after arrival at destination.",
  notes: "Please quote the document number in all correspondence.",
};

export function createDefaultTemplates(): DocumentTemplate[] {
  return DOCUMENT_TYPES.map((item) => ({
    type: item.id,
    name: `${item.name}标准模板`,
    language: "en",
    currency: "USD",
    themeId: "ocean",
    paymentTerms: EMPTY_DOCUMENT.paymentTerms,
    incoterm: EMPTY_DOCUMENT.incoterm,
    origin: "Shanghai, China",
    destination: "",
    shippingMarks: "",
    contractTerms: EMPTY_DOCUMENT.contractTerms,
    notes: EMPTY_DOCUMENT.notes,
    showPrices: item.id !== "packing",
    showImages: false,
    showStamp: true,
    showBankInfo: item.id === "proforma" || item.id === "contract",
    updatedAt: now,
  }));
}

export const initialData: AppData = {
  company: demoCompany,
  customers: demoCustomers,
  products: demoProducts,
  documents: [pi, packing, quote, archived],
  templates: createDefaultTemplates(),
};

export function getDocumentType(type: DocumentType) {
  return DOCUMENT_TYPES.find((t) => t.id === type) ?? DOCUMENT_TYPES[0];
}

export function getTheme(themeId: string) {
  return THEMES.find((t) => t.id === themeId) ?? THEMES[0];
}

export function getLanguage(code: LanguageCode) {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[1];
}

export function formatMoney(value: number, currency = "USD", language: LanguageCode = "en") {
  return new Intl.NumberFormat(getLanguage(language).locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatNumber(value: number, language: LanguageCode = "en", maximumFractionDigits = 2) {
  return new Intl.NumberFormat(getLanguage(language).locale, {
    maximumFractionDigits,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatDate(date: string, language: LanguageCode = "en") {
  if (!date) return "—";
  return new Intl.DateTimeFormat(getLanguage(language).locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

export function documentTotal(doc: TradeDocument) {
  return Math.round(doc.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0) * 100) / 100;
}
