import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { createDefaultTemplates, getDocumentType, initialData, itemFromProduct } from "./data";
import { QOSA_LOGO } from "./branding";
import { createSpecialDocumentData, ensureSpecialDocumentData, isSpecialDocumentType } from "./export-forms";
import type { AppData, Company, Customer, DocumentTemplate, DocumentType, LanguageCode, Product, TradeDocument } from "./types";

const STORAGE_KEY = "yuanfan-document-studio-v1";

interface NewDocumentInput {
  type: DocumentType;
  customerId?: string;
  productIds: string[];
  number: string;
  issueDate: string;
  currency: string;
  language: LanguageCode;
  themeId: string;
}

interface StoreValue {
  data: AppData;
  storageError: string;
  updateCompany: (company: Company) => void;
  saveCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;
  saveProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  importProducts: (products: Product[], mode: "skip" | "overwrite") => { added: number; updated: number; skipped: number };
  saveTemplate: (template: DocumentTemplate) => void;
  importTemplates: (templates: DocumentTemplate[]) => void;
  createDocument: (input: NewDocumentInput) => TradeDocument;
  updateDocument: (doc: TradeDocument) => void;
  duplicateDocument: (id: string) => TradeDocument | undefined;
  archiveDocument: (id: string) => void;
  deleteDocument: (id: string) => void;
  resetDemo: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

const LEGACY_DEMO_COMPANY: Omit<Company, "logo" | "stamp"> = {
  nameZh: "杭州远帆家居用品有限公司",
  nameEn: "Hangzhou Yuanfan Homeware Co., Ltd.",
  address: "中国浙江省杭州市滨江区江虹路 1750 号\nNo. 1750 Jianghong Road, Binjiang District, Hangzhou, Zhejiang, China",
  phone: "+86 571 8888 2160",
  email: "export@yuanfan-example.com",
  website: "www.yuanfan-example.com",
  registration: "统一社会信用代码：91330100MA2YF2026X",
  bankName: "Bank of China, Hangzhou Binjiang Sub-branch",
  bankAccount: "3721 8820 6601 8890",
  swift: "BKCHCNBJ910",
  bankAddress: "No. 388 Jiangnan Avenue, Hangzhou, China",
};

function normalizeData(value: Partial<AppData>): AppData {
  const savedTemplates = Array.isArray(value.templates) ? value.templates : [];
  const isLegacyDemoCompany = value.company && Object.entries(LEGACY_DEMO_COMPANY).every(([key, fieldValue]) => value.company?.[key as keyof Company] === fieldValue);
  return {
    company: isLegacyDemoCompany
      ? structuredClone(initialData.company)
      : value.company
        ? {
            ...value.company,
            ...(value.company.logo === undefined ? { logo: QOSA_LOGO } : {}),
          }
        : structuredClone(initialData.company),
    customers: Array.isArray(value.customers) ? value.customers : structuredClone(initialData.customers),
    products: Array.isArray(value.products) ? value.products : structuredClone(initialData.products),
    documents: Array.isArray(value.documents)
      ? value.documents.map((doc) => ({ ...doc, ...ensureSpecialDocumentData(doc) }))
      : structuredClone(initialData.documents),
    templates: createDefaultTemplates().map((fallback) => ({
      ...fallback,
      ...savedTemplates.find((template) => template.type === fallback.type),
    })),
  };
}

function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return normalizeData(JSON.parse(raw) as Partial<AppData>);
  } catch {
    // The interface exposes a visible storage warning through storageError after the first write.
  }
  return structuredClone(initialData);
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(loadData);
  const [storageError, setStorageError] = useState("");

  /* eslint-disable react-hooks/set-state-in-effect -- 本地写入结果需要同步反馈为可见的保存错误。 */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setStorageError("");
    } catch {
      setStorageError("本地存储空间不足。请删除较大的图片后重试；当前页面内的编辑仍然保留。");
    }
  }, [data]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const value = useMemo<StoreValue>(
    () => ({
      data,
      storageError,
      updateCompany: (company) => setData((prev) => ({ ...prev, company })),
      saveCustomer: (customer) =>
        setData((prev) => {
          const exists = prev.customers.some((item) => item.id === customer.id);
          return {
            ...prev,
            customers: exists ? prev.customers.map((item) => (item.id === customer.id ? customer : item)) : [customer, ...prev.customers],
          };
        }),
      deleteCustomer: (id) =>
        setData((prev) => ({
          ...prev,
          customers: prev.customers.filter((item) => item.id !== id),
        })),
      saveProduct: (product) =>
        setData((prev) => {
          const exists = prev.products.some((item) => item.id === product.id);
          return {
            ...prev,
            products: exists ? prev.products.map((item) => (item.id === product.id ? product : item)) : [product, ...prev.products],
          };
        }),
      deleteProduct: (id) =>
        setData((prev) => ({
          ...prev,
          products: prev.products.filter((item) => item.id !== id),
        })),
      importProducts: (products, mode) => {
        let added = 0;
        let updated = 0;
        let skipped = 0;
        const timestamp = new Date().toISOString();
        const productsBySku = new Map(data.products.map((product) => [product.sku.trim().toLowerCase(), product]));
        const additions: Product[] = [];
        const replacements = new Map<string, Product>();
        products.forEach((incoming) => {
          const existing = productsBySku.get(incoming.sku.trim().toLowerCase());
          if (existing && mode === "skip") {
            skipped += 1;
            return;
          }
          if (existing) {
            const replacement = {
              ...incoming,
              id: existing.id,
              image: existing.image,
              updatedAt: timestamp,
            };
            replacements.set(existing.id, replacement);
            productsBySku.set(incoming.sku.trim().toLowerCase(), replacement);
            updated += 1;
          } else {
            const addition = { ...incoming, updatedAt: timestamp };
            additions.push(addition);
            productsBySku.set(incoming.sku.trim().toLowerCase(), addition);
            added += 1;
          }
        });
        setData((prev) => ({
          ...prev,
          products: [...additions, ...prev.products.map((product) => replacements.get(product.id) ?? product)],
        }));
        return { added, updated, skipped };
      },
      saveTemplate: (template) =>
        setData((prev) => ({
          ...prev,
          templates: prev.templates.map((item) => (item.type === template.type ? template : item)),
        })),
      importTemplates: (templates) =>
        setData((prev) => ({
          ...prev,
          templates: prev.templates.map((item) => templates.find((template) => template.type === item.type) ?? item),
        })),
      createDocument: (input) => {
        const customer = data.customers.find((item) => item.id === input.customerId) ?? null;
        const template = data.templates.find((item) => item.type === input.type) ?? createDefaultTemplates().find((item) => item.type === input.type)!;
        const items = input.productIds
          .map((id) => data.products.find((item) => item.id === id))
          .filter(Boolean)
          .map((product) => itemFromProduct(product!, 100));
        const specialData = createSpecialDocumentData(input.type, data.company, customer);
        if (specialData.shipping) {
          specialData.shipping.portOfLoading = template.origin;
          specialData.shipping.portOfDischarge = template.destination;
        }
        const doc: TradeDocument = {
          id: `doc-${crypto.randomUUID()}`,
          type: input.type,
          number: input.number,
          title: isSpecialDocumentType(input.type)
            ? getDocumentType(input.type).name
            : `${customer?.name ?? "未指定客户"} ${getDocumentType(input.type).name}`,
          issueDate: input.issueDate,
          status: "draft",
          language: input.language,
          themeId: input.themeId,
          currency: input.currency,
          companySnapshot: { ...data.company },
          customerSnapshot: customer ? { ...customer } : null,
          items,
          validUntil: input.issueDate,
          paymentTerms: template.paymentTerms,
          incoterm: template.incoterm,
          origin: template.origin,
          destination: template.destination,
          shippingMarks: template.shippingMarks,
          contractTerms: template.contractTerms,
          notes: template.notes,
          showPrices: template.showPrices,
          showImages: template.showImages,
          showStamp: template.showStamp,
          showBankInfo: template.showBankInfo,
          ...specialData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setData((prev) => ({ ...prev, documents: [doc, ...prev.documents] }));
        return doc;
      },
      updateDocument: (doc) =>
        setData((prev) => ({
          ...prev,
          documents: prev.documents.map((item) => (item.id === doc.id ? { ...doc, updatedAt: new Date().toISOString() } : item)),
        })),
      duplicateDocument: (id) => {
        const source = data.documents.find((item) => item.id === id);
        if (!source) return undefined;
        const copy: TradeDocument = {
          ...structuredClone(source),
          id: `doc-${crypto.randomUUID()}`,
          number: `${source.number}-COPY`,
          title: `${source.title}（副本）`,
          status: "draft",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setData((prev) => ({ ...prev, documents: [copy, ...prev.documents] }));
        return copy;
      },
      archiveDocument: (id) =>
        setData((prev) => ({
          ...prev,
          documents: prev.documents.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: item.status === "archived" ? "draft" : "archived",
                  updatedAt: new Date().toISOString(),
                }
              : item,
          ),
        })),
      deleteDocument: (id) =>
        setData((prev) => ({
          ...prev,
          documents: prev.documents.filter((item) => item.id !== id),
        })),
      resetDemo: () => setData(structuredClone(initialData)),
    }),
    [data, storageError],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
}

export function suggestNumber(type: DocumentType, documents: TradeDocument[]) {
  const prefix = getDocumentType(type).prefix;
  const year = new Date().getFullYear();
  const count = documents.filter((doc) => doc.type === type).length + 1;
  return `${prefix}-${year}-${String(count).padStart(4, "0")}`;
}

export function blankCustomer(): Customer {
  return {
    id: `cus-${crypto.randomUUID()}`,
    name: "",
    contact: "",
    country: "",
    email: "",
    phone: "",
    billingAddress: "",
    shippingAddress: "",
    registration: "",
    defaultLanguage: "en",
    updatedAt: new Date().toISOString(),
  };
}

export function blankProduct(): Product {
  return {
    id: `prod-${crypto.randomUUID()}`,
    sku: "",
    name: "",
    nameZh: "",
    description: "",
    unit: "pcs",
    defaultUnitPrice: 0,
    currency: "USD",
    hsCode: "",
    originCountry: "China",
    netWeight: 0,
    grossWeight: 0,
    packageType: "Carton",
    dimensions: "",
    updatedAt: new Date().toISOString(),
  };
}
