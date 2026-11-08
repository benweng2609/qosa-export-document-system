import type { Product } from "./types";

export interface ProductImportRow {
  rowNumber: number;
  product: Product;
  errors: string[];
  duplicateProductId?: string;
}

type ProductField = keyof Pick<Product, "sku" | "name" | "nameZh" | "description" | "unit" | "defaultUnitPrice" | "currency" | "hsCode" | "originCountry" | "netWeight" | "grossWeight" | "packageType" | "dimensions">;

const columns: {
  field: ProductField;
  label: string;
  aliases: string[];
  required?: boolean;
}[] = [
  {
    field: "sku",
    label: "SKU",
    aliases: ["SKU", "货号", "产品编码", "商品编码", "产品SKU"],
    required: true,
  },
  {
    field: "name",
    label: "英文产品名称",
    aliases: ["英文产品名称", "英文名称", "产品名称（英文）", "Product Name", "English Name", "Name"],
    required: true,
  },
  {
    field: "nameZh",
    label: "中文产品名称",
    aliases: ["中文产品名称", "中文名称", "Chinese Name", "nameZh"],
  },
  {
    field: "description",
    label: "规格描述",
    aliases: ["规格描述", "产品描述", "Description"],
  },
  {
    field: "unit",
    label: "默认单位",
    aliases: ["默认单位", "单位", "Unit"],
    required: true,
  },
  {
    field: "defaultUnitPrice",
    label: "默认单价",
    aliases: ["默认单价", "单价", "Unit Price", "Default Unit Price"],
    required: true,
  },
  { field: "currency", label: "币种", aliases: ["币种", "Currency"] },
  {
    field: "hsCode",
    label: "HS 编码",
    aliases: ["HS编码", "HS 编码", "HS Code", "hsCode"],
  },
  {
    field: "originCountry",
    label: "原产国",
    aliases: ["原产国", "Origin Country"],
  },
  {
    field: "netWeight",
    label: "单件净重（kg）",
    aliases: ["单件净重（kg）", "单件净重(kg)", "净重", "Net Weight"],
  },
  {
    field: "grossWeight",
    label: "单件毛重（kg）",
    aliases: ["单件毛重（kg）", "单件毛重(kg)", "毛重", "Gross Weight"],
  },
  {
    field: "packageType",
    label: "包装方式",
    aliases: ["包装方式", "Package Type"],
  },
  {
    field: "dimensions",
    label: "包装尺寸",
    aliases: ["包装尺寸", "尺寸", "Dimensions"],
  },
];

function normalizeHeader(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_\-—–（）()/]/g, "");
}

function text(value: unknown) {
  return String(value ?? "").trim();
}

function numberValue(value: unknown, label: string, required = false) {
  const source = text(value).replace(/,/g, "");
  if (!source) {
    if (required) throw new Error(`${label}不能为空`);
    return 0;
  }
  const result = Number(source);
  if (!Number.isFinite(result) || result < 0) throw new Error(`${label}需为不小于 0 的数字`);
  return result;
}

export async function parseProductFile(file: File, existingProducts: Product[]): Promise<ProductImportRow[]> {
  if (!/\.(xlsx|xls|csv)$/i.test(file.name)) throw new Error("请选择 Excel（.xlsx／.xls）或 CSV 文件。");
  if (file.size > 5 * 1024 * 1024) throw new Error("文件超过 5 MB，请拆分后导入。");

  const XLSX = await import("xlsx");
  let rows: Record<string, unknown>[];
  try {
    const workbook = XLSX.read(await file.arrayBuffer(), {
      type: "array",
      cellDates: false,
    });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!firstSheet) throw new Error("工作簿中没有工作表。");
    rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, {
      defval: "",
      raw: false,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "工作簿中没有工作表。") throw error;
    throw new Error("无法解析文件。请使用未加密、首行为字段名的 Excel 或 UTF-8 CSV 文件。");
  }

  rows = rows.filter((row) => Object.values(row).some((value) => text(value)));
  if (!rows.length) throw new Error("文件中没有可导入的数据行。");
  if (rows.length > 2000) throw new Error("单次最多导入 2000 行，请拆分文件后重试。");

  const headerLookup = new Map<string, string>();
  Object.keys(rows[0]).forEach((header) => headerLookup.set(normalizeHeader(header), header));
  const fieldHeaders = new Map<ProductField, string>();
  columns.forEach((column) => {
    const alias = column.aliases.map(normalizeHeader).find((item) => headerLookup.has(item));
    if (alias) fieldHeaders.set(column.field, headerLookup.get(alias)!);
  });
  const missingHeaders = columns.filter((column) => column.required && !fieldHeaders.has(column.field)).map((column) => column.label);
  if (missingHeaders.length) throw new Error(`缺少必需表头：${missingHeaders.join("、")}。请下载字段样例核对。`);

  const existingBySku = new Map(existingProducts.map((product) => [product.sku.trim().toLowerCase(), product]));
  const fileRowsBySku = new Map<string, number>();
  const timestamp = new Date().toISOString();

  return rows.map((row, index) => {
    const rowNumber = index + 2;
    const get = (field: ProductField) => row[fieldHeaders.get(field) ?? ""];
    const product: Product = {
      id: `prod-${crypto.randomUUID()}`,
      sku: text(get("sku")),
      name: text(get("name")),
      nameZh: text(get("nameZh")),
      description: text(get("description")),
      unit: text(get("unit")),
      defaultUnitPrice: 0,
      currency: text(get("currency")).toUpperCase() || "USD",
      hsCode: text(get("hsCode")),
      originCountry: text(get("originCountry")) || "China",
      netWeight: 0,
      grossWeight: 0,
      packageType: text(get("packageType")) || "Carton",
      dimensions: text(get("dimensions")),
      updatedAt: timestamp,
    };
    const errors: string[] = [];
    if (!product.sku) errors.push("SKU 不能为空");
    if (!product.name) errors.push("英文产品名称不能为空");
    if (!product.unit) errors.push("默认单位不能为空");
    if (!/^[A-Z]{3}$/.test(product.currency)) errors.push("币种需为三位字母代码，例如 USD");
    try {
      product.defaultUnitPrice = numberValue(get("defaultUnitPrice"), "默认单价", true);
    } catch (error) {
      errors.push((error as Error).message);
    }
    try {
      product.netWeight = numberValue(get("netWeight"), "单件净重");
    } catch (error) {
      errors.push((error as Error).message);
    }
    try {
      product.grossWeight = numberValue(get("grossWeight"), "单件毛重");
    } catch (error) {
      errors.push((error as Error).message);
    }

    const skuKey = product.sku.toLowerCase();
    if (skuKey) {
      const firstRow = fileRowsBySku.get(skuKey);
      if (firstRow) errors.push(`与文件第 ${firstRow} 行的 SKU 重复`);
      else fileRowsBySku.set(skuKey, rowNumber);
    }
    const duplicateProductId = skuKey ? existingBySku.get(skuKey)?.id : undefined;
    return { rowNumber, product, errors, duplicateProductId };
  });
}

function productRows(products: Product[]) {
  return products.map((product) => Object.fromEntries(columns.map((column) => [column.label, product[column.field]])));
}

export async function exportProducts(products: Product[]) {
  const XLSX = await import("xlsx");
  const worksheet = XLSX.utils.json_to_sheet(productRows(products));
  worksheet["!cols"] = columns.map((column) => ({
    wch: column.field === "description" || column.field === "name" ? 36 : 18,
  }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "产品库");
  XLSX.writeFile(workbook, `产品库_${new Date().toISOString().slice(0, 10)}.xlsx`, { compression: true });
}

export async function downloadProductSample() {
  const sample: Product = {
    id: "sample",
    sku: "DEMO-001",
    name: "Sample Product Name",
    nameZh: "示例产品名称",
    description: "Material, size, color and other specifications",
    unit: "pcs",
    defaultUnitPrice: 12.5,
    currency: "USD",
    hsCode: "0000000000",
    originCountry: "China",
    netWeight: 0.5,
    grossWeight: 0.6,
    packageType: "Carton",
    dimensions: "40 × 30 × 30 cm / 24 pcs",
    updatedAt: "",
  };
  const XLSX = await import("xlsx");
  const worksheet = XLSX.utils.json_to_sheet(productRows([sample]));
  worksheet["!cols"] = columns.map((column) => ({
    wch: column.field === "description" || column.field === "name" ? 36 : 18,
  }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "产品导入样例");
  XLSX.writeFile(workbook, "产品导入字段样例.xlsx", { compression: true });
}
