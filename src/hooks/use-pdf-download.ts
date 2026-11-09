import { useState } from "react";
import { toast } from "sonner";
import type { TradeDocument } from "../types";
import { getContainerVgmKg, isSpecialDocumentType } from "../export-forms";

export function usePdfDownload() {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  async function download(doc: TradeDocument) {
    if (isSpecialDocumentType(doc.type)) {
      if (!doc.shippingParties?.shipper.name) {
        toast.error("导出前请填写托运人。单证内容已保留。");
        return false;
      }
      if (doc.type !== "vgm" && !doc.shippingParties.consignee.name) {
        toast.error("导出前请填写收货人。单证内容已保留。");
        return false;
      }
      if (doc.type !== "vgm" && !doc.items.length) {
        toast.error("导出前请至少添加一项货物。单证内容已保留。");
        return false;
      }
      if (doc.type === "vgm" && (!(doc.containers ?? []).length || (doc.containers ?? []).some((container) => !container.containerNumber || getContainerVgmKg(container) <= 0))) {
        toast.error("导出前请填写箱号，并确保每个集装箱的核实总重大于 0。");
        return false;
      }
    } else {
      if (!doc.customerSnapshot) {
        toast.error("导出前请选择客户。单证内容已保留。");
        return false;
      }
      if (!doc.items.length) {
        toast.error("导出前请至少添加一项商品。单证内容已保留。");
        return false;
      }
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
