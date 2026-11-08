import { useState } from "react";
import { toast } from "sonner";
import type { TradeDocument } from "../types";

export function usePdfDownload() {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  async function download(doc: TradeDocument) {
    if (!doc.customerSnapshot) {
      toast.error("导出前请选择客户。单证内容已保留。");
      return false;
    }
    if (!doc.items.length) {
      toast.error("导出前请至少添加一项商品。单证内容已保留。");
      return false;
    }
    setDownloadingId(doc.id);
    try {
      const { downloadDocumentPdf } = await import("../pdf/TradePdf");
      await downloadDocumentPdf(doc);
      toast.success("PDF 已生成并开始下载。");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("PDF 生成失败，单证内容已保留，请重试。");
      return false;
    } finally {
      setDownloadingId(null);
    }
  }

  return { download, downloadingId };
}
