import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, LoaderCircle, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { downloadProductSample, parseProductFile, type ProductImportRow } from "../product-io";
import { useStore } from "../store";
import { Badge, Button, Modal } from "./ui";

export default function ProductImportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { data, importProducts } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<ProductImportRow[]>([]);
  const [mode, setMode] = useState<"skip" | "overwrite">("skip");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setFileName("");
    setRows([]);
    setError("");
    setMode("skip");
    setLoading(false);
  };
  const changeOpen = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };
  const readFile = async (file?: File) => {
    if (!file) return;
    setLoading(true);
    setError("");
    setRows([]);
    setFileName(file.name);
    try {
      setRows(await parseProductFile(file, data.products));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "文件读取失败，请重试。");
    } finally {
      setLoading(false);
    }
  };

  const validRows = rows.filter((row) => !row.errors.length);
  const newCount = validRows.filter((row) => !row.duplicateProductId).length;
  const duplicateCount = validRows.filter((row) => row.duplicateProductId).length;
  const errorCount = rows.length - validRows.length;
  const importableCount = mode === "overwrite" ? validRows.length : newCount;

  const confirmImport = () => {
    const result = importProducts(
      validRows.map((row) => row.product),
      mode,
    );
    toast.success("产品导入完成", {
      description: `新增 ${result.added} 项，更新 ${result.updated} 项，跳过 ${result.skipped + errorCount} 项。`,
    });
    changeOpen(false);
  };

  return (
    <Modal open={open} onOpenChange={changeOpen} title="批量导入产品" description="读取首个工作表；首行必须是字段名。支持 Excel／CSV，单次最多 2000 行。" wide>
      <div className="import-toolbar">
        <Button onClick={() => void downloadProductSample()}>
          <Download size={16} />
          下载字段样例
        </Button>
        <span>必需字段：SKU、英文产品名称、默认单位、默认单价。产品图片不随表格导入。</span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        hidden
        onChange={(event) => {
          void readFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      {!rows.length && (
        <button type="button" className="file-drop-zone" onClick={() => inputRef.current?.click()} disabled={loading}>
          {loading ? <LoaderCircle className="spin" size={28} /> : <UploadCloud size={28} />}
          <strong>{loading ? "正在解析并校验…" : fileName || "选择产品文件"}</strong>
          <span>.xlsx／.xls／UTF-8 CSV，文件不超过 5 MB</span>
        </button>
      )}
      {error && (
        <div className="notice notice-error">
          <AlertCircle size={18} />
          <div>
            <strong>无法导入这个文件</strong>
            <p>{error}</p>
          </div>
        </div>
      )}
      {rows.length > 0 && (
        <>
          <div className="import-file-heading">
            <div>
              <FileSpreadsheet size={20} />
              <span>
                <strong>{fileName}</strong>
                <small>共读取 {rows.length} 行，错误行不会被写入产品库</small>
              </span>
            </div>
            <Button size="sm" onClick={() => inputRef.current?.click()}>
              重新选择
            </Button>
          </div>
          <div className="import-stat-grid">
            <div>
              <span>可新增</span>
              <strong>{newCount}</strong>
            </div>
            <div>
              <span>重复 SKU</span>
              <strong>{duplicateCount}</strong>
            </div>
            <div className={errorCount ? "has-error" : ""}>
              <span>错误行</span>
              <strong>{errorCount}</strong>
            </div>
          </div>
          {duplicateCount > 0 && (
            <fieldset className="duplicate-options">
              <legend>产品库中已有相同 SKU</legend>
              <label className={mode === "skip" ? "selected" : ""}>
                <input type="radio" name="duplicate-mode" checked={mode === "skip"} onChange={() => setMode("skip")} />
                <span>
                  <strong>跳过重复项</strong>
                  <small>保留现有产品资料，仅导入新 SKU</small>
                </span>
              </label>
              <label className={mode === "overwrite" ? "selected" : ""}>
                <input type="radio" name="duplicate-mode" checked={mode === "overwrite"} onChange={() => setMode("overwrite")} />
                <span>
                  <strong>覆盖重复项</strong>
                  <small>保留原产品 ID 与图片；历史单证快照不变</small>
                </span>
              </label>
            </fieldset>
          )}
          <div className="import-preview-table-wrap">
            <table className="data-table import-preview-table">
              <thead>
                <tr>
                  <th>行号</th>
                  <th>SKU</th>
                  <th>产品名称</th>
                  <th>单价</th>
                  <th>校验结果</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.rowNumber}>
                    <td>{row.rowNumber}</td>
                    <td className="numeric">{row.product.sku || "—"}</td>
                    <td>
                      <strong>{row.product.name || "—"}</strong>
                      <small>{row.product.nameZh}</small>
                    </td>
                    <td>
                      {row.product.defaultUnitPrice.toFixed(2)} {row.product.currency}
                    </td>
                    <td>
                      {row.errors.length ? (
                        <span className="import-row-error">
                          <AlertCircle size={14} />
                          {row.errors.join("；")}
                        </span>
                      ) : row.duplicateProductId ? (
                        <Badge tone="amber">{mode === "overwrite" ? "将覆盖" : "将跳过"}</Badge>
                      ) : (
                        <span className="import-row-ok">
                          <CheckCircle2 size={14} />
                          可新增
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <div className="dialog-actions">
        <Button onClick={() => changeOpen(false)}>取消</Button>
        <Button variant="primary" disabled={!importableCount || loading} onClick={confirmImport}>
          确认导入 {importableCount || ""} 项
        </Button>
      </div>
    </Modal>
  );
}
