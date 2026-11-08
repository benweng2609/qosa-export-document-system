import { createDefaultTemplates, DOCUMENT_TYPES, LANGUAGES, THEMES } from "./data";
import type { DocumentTemplate, DocumentType } from "./types";

const PACKAGE_FORMAT = "waimao-document-templates";
const PACKAGE_VERSION = 1;

interface TemplatePackage {
  format: typeof PACKAGE_FORMAT;
  version: typeof PACKAGE_VERSION;
  exportedAt: string;
  templates: DocumentTemplate[];
}

export async function parseTemplatePackage(file: File): Promise<DocumentTemplate[]> {
  if (!file.name.toLowerCase().endsWith(".json")) throw new Error("请选择系统导出的 JSON 模板包。");
  if (file.size > 1024 * 1024) throw new Error("模板包超过 1 MB，请核对文件内容。");
  let value: unknown;
  try {
    value = JSON.parse(await file.text());
  } catch {
    throw new Error("JSON 格式无法解析，请使用系统导出的模板包。");
  }
  if (!value || typeof value !== "object") throw new Error("模板包结构无效。");
  const pack = value as Partial<TemplatePackage>;
  if (pack.format !== PACKAGE_FORMAT || pack.version !== PACKAGE_VERSION) throw new Error("这不是受支持的外贸单证系统模板包，或模板包版本不兼容。");
  if (!Array.isArray(pack.templates) || !pack.templates.length) throw new Error("模板包中没有可导入的单证模板。");
  if (pack.templates.length > DOCUMENT_TYPES.length) throw new Error("模板包包含过多模板，请核对文件。");

  const seen = new Set<DocumentType>();
  const defaults = createDefaultTemplates();
  return pack.templates.map((candidate, index) => {
    if (!candidate || typeof candidate !== "object") throw new Error(`第 ${index + 1} 个模板结构无效。`);
    const source = candidate as Partial<DocumentTemplate>;
    const type = source.type;
    if (!type || !DOCUMENT_TYPES.some((item) => item.id === type)) throw new Error(`第 ${index + 1} 个模板的单证类型无效。`);
    if (seen.has(type)) throw new Error(`模板包中重复的${DOCUMENT_TYPES.find((item) => item.id === type)?.name}模板。`);
    seen.add(type);
    const fallback = defaults.find((item) => item.type === type)!;
    const stringFields: (keyof Pick<DocumentTemplate, "name" | "paymentTerms" | "incoterm" | "origin" | "destination" | "shippingMarks" | "contractTerms" | "notes">)[] = ["name", "paymentTerms", "incoterm", "origin", "destination", "shippingMarks", "contractTerms", "notes"];
    stringFields.forEach((field) => {
      if (source[field] !== undefined && typeof source[field] !== "string") throw new Error(`${fallback.name}的“${field}”字段格式无效。`);
    });
    if (source.language !== undefined && !LANGUAGES.some((item) => item.code === source.language)) throw new Error(`${fallback.name}的单据语言不受支持。`);
    if (source.themeId !== undefined && !THEMES.some((item) => item.id === source.themeId)) throw new Error(`${fallback.name}的纸张配色不受支持。`);
    if (source.currency !== undefined && (typeof source.currency !== "string" || !/^[A-Z]{3}$/.test(source.currency))) throw new Error(`${fallback.name}的币种需为三位大写字母代码。`);
    const booleanFields: (keyof Pick<DocumentTemplate, "showPrices" | "showImages" | "showStamp" | "showBankInfo">)[] = ["showPrices", "showImages", "showStamp", "showBankInfo"];
    booleanFields.forEach((field) => {
      if (source[field] !== undefined && typeof source[field] !== "boolean") throw new Error(`${fallback.name}的“${field}”字段格式无效。`);
    });
    const name = source.name?.trim();
    if (!name) throw new Error(`${fallback.name}缺少模板名称。`);
    return {
      ...fallback,
      ...source,
      type,
      name,
      language: source.language ?? fallback.language,
      currency: source.currency ?? fallback.currency,
      themeId: source.themeId ?? fallback.themeId,
      updatedAt: new Date().toISOString(),
    };
  });
}

export function exportTemplatePackage(templates: DocumentTemplate[]) {
  const pack: TemplatePackage = {
    format: PACKAGE_FORMAT,
    version: PACKAGE_VERSION,
    exportedAt: new Date().toISOString(),
    templates,
  };
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(pack, null, 2)], {
      type: "application/json;charset=utf-8",
    }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `外贸单证模板包_${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
