import type { DocumentItem, TradeDocument } from "./types";

export function paginateItems(doc: TradeDocument): DocumentItem[][] {
  const pageSize = doc.type === "packing" ? 6 : 5;
  if (!doc.items.length) return [[]];
  return Array.from({ length: Math.ceil(doc.items.length / pageSize) }, (_, index) => doc.items.slice(index * pageSize, index * pageSize + pageSize));
}
