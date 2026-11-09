import { AlertCircle, Check, Download, Edit3, Expand, FileJson, FilePlus2, LoaderCircle, Minus, Plus, Printer, ShieldCheck, Upload } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Badge, Button, Drawer, Field, IconButton, Input, Modal, Select, Textarea } from "../components/ui";
import { PaperPreview } from "../components/PaperPreview";
import { DOCUMENT_TYPES, getLanguage, getTheme, LANGUAGES, THEMES } from "../data";
import { createTemplatePreviewDocument } from "../template-preview";
import { isSpecialDocumentType } from "../export-forms";
import { useStore } from "../store";
import { exportTemplatePackage, parseTemplatePackage } from "../template-io";
import type { DocumentTemplate, DocumentType } from "../types";

export default function TemplatesPage({ onNew }: { onNew: (type: DocumentType) => void }) {
  const { data, importTemplates } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState<DocumentTemplate | null>(null);
  const [pending, setPending] = useState<DocumentTemplate[]>([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const readFile = async (file?: File) => {
    if (!file) return;
    setLoading(true);
    setError("");
    setPending([]);
    setFileName(file.name);
    try {
      setPending(await parseTemplatePackage(file));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "模板包读取失败，请重试。");
    } finally {
      setLoading(false);
    }
  };
  const confirmImport = () => {
    importTemplates(pending);
    toast.success(`已导入 ${pending.length} 类单证模板`, {
      description: "模板已保存到当前浏览器，将用于之后新建的单证。",
    });
    setPending([]);
    setFileName("");
  };

  return (
    <div className="page templates-page">
      <div className="page-heading">
        <div>
          <h1>单证模板</h1>
          <p>为九类单证预设语言、配色、条款和显示规则，新公司也能快速上手。</p>
        </div>
        <div className="page-heading-actions">
          <Button onClick={() => inputRef.current?.click()}>
            <Upload size={16} />
            导入模板包
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              exportTemplatePackage(data.templates);
              toast.success(`${data.templates.length} 类单证模板已导出`);
            }}
          >
            <Download size={16} />
            导出全部模板
          </Button>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".json,application/json"
        hidden
        onChange={(event) => {
          void readFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      <div className="template-local-note">
        <ShieldCheck size={19} />
        <div>
          <strong>模板与业务资料分离</strong>
          <p>模板包不包含公司、客户、商品、图片或历史单证。导入和编辑只影响之后新建的单证，已有单证不会改变。</p>
        </div>
      </div>
      {loading && (
        <div className="inline-empty">
          <LoaderCircle className="spin" size={19} />
          正在校验模板包…
        </div>
      )}
      {error && (
        <div className="notice notice-error template-import-error">
          <AlertCircle size={18} />
          <div>
            <strong>无法导入 {fileName}</strong>
            <p>{error}</p>
          </div>
          <Button size="sm" onClick={() => inputRef.current?.click()}>
            重新选择
          </Button>
        </div>
      )}
      <div className="template-library-grid">
        {DOCUMENT_TYPES.map((item) => {
          const template = data.templates.find((candidate) => candidate.type === item.id)!;
          const theme = getTheme(template.themeId);
          return (
            <article className="template-library-card" key={item.id}>
              <button type="button" className="template-card-preview" onClick={() => setEditing({ ...template })} aria-label={`预览并编辑${template.name}`}>
                <div
                  className="template-preview-paper"
                  style={
                    {
                      "--template-color": theme.color,
                      "--template-pale": theme.pale,
                    } as React.CSSProperties
                  }
                >
                  <div className="template-preview-header">
                    <span />
                    <strong>{item.en}</strong>
                  </div>
                  <div className="template-preview-parties">
                    <i />
                    <i />
                  </div>
                  <div className="template-preview-table">
                    <b />
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="template-preview-total">
                    <i />
                    <strong />
                  </div>
                  <div className="template-preview-terms">
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
                <span className="template-current-badge">
                  <Check size={12} />
                  当前使用
                </span>
              </button>
              <div className="template-card-body">
                <div className="template-card-title">
                  <div>
                    <span>
                      {item.name} · {item.short}
                    </span>
                    <h2>{template.name}</h2>
                  </div>
                  <Button variant="ghost" size="sm" aria-label={`编辑${template.name}`} onClick={() => setEditing({ ...template })}>
                    <Edit3 size={16} />
                  </Button>
                </div>
                <div className="template-card-badges">
                  <Badge tone="blue">{getLanguage(template.language).native}</Badge>
                  {!isSpecialDocumentType(template.type) && <Badge>{template.currency}</Badge>}
                  <Badge>{theme.name}</Badge>
                </div>
                <p className="template-terms-preview">{isSpecialDocumentType(template.type) ? "默认装货港、卸货港、唛头与备注" : template.paymentTerms || "未设置默认付款条款"}</p>
                <div className="template-display-rules">
                  {isSpecialDocumentType(template.type) ? <span>专用资料单</span> : <span>{template.showPrices ? "显示价格" : "隐藏价格"}</span>}
                  {!isSpecialDocumentType(template.type) && <span>{template.showBankInfo ? "显示银行信息" : "隐藏银行信息"}</span>}
                  <span>{template.showStamp ? "启用印章图像" : "不启用印章图像"}</span>
                </div>
              </div>
              <div className="template-card-actions">
                <Button onClick={() => setEditing({ ...template })}>
                  <Edit3 size={15} />
                  预览与编辑
                </Button>
                <Button variant="primary" onClick={() => onNew(item.id)}>
                  <FilePlus2 size={15} />
                  使用模板新建
                </Button>
              </div>
            </article>
          );
        })}
      </div>
      <TemplateDrawer template={editing} onOpenChange={(open) => !open && setEditing(null)} />
      <Modal
        open={pending.length > 0}
        onOpenChange={(open) => {
          if (!open) {
            setPending([]);
            setFileName("");
          }
        }}
        title="确认导入模板包"
        description="只覆盖文件中包含的单证类型，其余模板保持不变。"
      >
        <div className="import-package-file">
          <FileJson size={22} />
          <div>
            <strong>{fileName}</strong>
            <span>格式与字段校验通过</span>
          </div>
        </div>
        <div className="template-import-list">
          {pending.map((template) => (
            <div key={template.type}>
              <span>{DOCUMENT_TYPES.find((item) => item.id === template.type)?.name}</span>
              <strong>{template.name}</strong>
              <Badge tone="amber">将覆盖</Badge>
            </div>
          ))}
        </div>
        <div className="form-note warning">
          <AlertCircle size={16} />
          <p>覆盖后无法自动撤销。建议先导出当前模板作为备份；已有单证及公司、客户、商品资料不受影响。</p>
        </div>
        <div className="dialog-actions">
          <Button
            onClick={() => {
              setPending([]);
              setFileName("");
            }}
          >
            取消
          </Button>
          <Button variant="primary" onClick={confirmImport}>
            确认覆盖并导入
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function TemplateDrawer({ template, onOpenChange }: { template: DocumentTemplate | null; onOpenChange: (open: boolean) => void }) {
  const { saveTemplate } = useStore();
  if (!template) return null;
  return (
    <TemplateDrawerForm
      key={`${template.type}-${template.updatedAt}`}
      template={template}
      onOpenChange={onOpenChange}
      onSave={(next) => {
        saveTemplate(next);
        toast.success("模板已保存到当前浏览器");
        onOpenChange(false);
      }}
    />
  );
}

function TemplateDrawerForm({ template, onOpenChange, onSave }: { template: DocumentTemplate; onOpenChange: (open: boolean) => void; onSave: (template: DocumentTemplate) => void }) {
  const { data } = useStore();
  const [draft, setDraft] = useState({ ...template });
  const [zoom, setZoom] = useState(0.65);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const previewStageRef = useRef<HTMLDivElement>(null);
  const update = <K extends keyof DocumentTemplate>(key: K, value: DocumentTemplate[K]) => setDraft((prev) => ({ ...prev, [key]: value }));
  const typeName = DOCUMENT_TYPES.find((item) => item.id === draft.type)?.name;
  const currencies = ["USD", "EUR", "CNY", "GBP"];
  if (!currencies.includes(draft.currency)) currencies.push(draft.currency);
  const previewDoc = useMemo(() => createTemplatePreviewDocument(draft, data.company), [draft, data.company]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(template);
  const fitPreview = useCallback(() => {
    const width = previewStageRef.current?.clientWidth ?? 0;
    if (width < 50) return;
    setZoom(Math.min(0.9, Math.max(0.35, (width - 36) / 794)));
  }, []);
  useEffect(() => {
    const frame = window.requestAnimationFrame(fitPreview);
    window.addEventListener("resize", fitPreview);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", fitPreview);
    };
  }, [fitPreview]);
  const showMobilePreview = () => {
    setMobileTab("preview");
    window.setTimeout(fitPreview, 0);
  };

  return (
    <Drawer open wide onOpenChange={onOpenChange} title={draft.name} description={`${typeName}默认模板。左侧修改会实时反映在右侧 A4 示例中，保存后才更新当前模板。`}>
      <div className="template-editor-mobile-tabs" aria-label="模板编辑视图">
        <button type="button" className={mobileTab === "edit" ? "active" : ""} onClick={() => setMobileTab("edit")}>
          模板设置
        </button>
        <button type="button" className={mobileTab === "preview" ? "active" : ""} onClick={showMobilePreview}>
          单据预览
        </button>
      </div>
      <div className={`template-editor-layout mobile-${mobileTab}`}>
        <form
          className="drawer-form template-editor-form"
          onSubmit={(event) => {
            event.preventDefault();
            onSave({
              ...draft,
              name: draft.name.trim(),
              currency: draft.currency.toUpperCase(),
              updatedAt: new Date().toISOString(),
            });
          }}
        >
          <section>
            <h3>基础版式</h3>
            <Field label="模板名称" required>
              <Input value={draft.name} onChange={(event) => update("name", event.target.value)} required maxLength={60} />
            </Field>
            <div className="form-grid two">
              <Field label="默认单据语言">
                <Select value={draft.language} onChange={(event) => update("language", event.target.value as DocumentTemplate["language"])}>
                  {LANGUAGES.map((language) => (
                    <option key={language.code} value={language.code}>
                      {language.name} · {language.native}
                    </option>
                  ))}
                </Select>
              </Field>
              {!isSpecialDocumentType(draft.type) && (
                <Field label="默认币种">
                  <Select value={draft.currency} onChange={(event) => update("currency", event.target.value)}>
                    {currencies.map((currency) => (
                      <option key={currency}>{currency}</option>
                    ))}
                  </Select>
                </Field>
              )}
            </div>
            <Field label="纸张配色">
              <Select value={draft.themeId} onChange={(event) => update("themeId", event.target.value)}>
                {THEMES.map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    {theme.name}
                  </option>
                ))}
              </Select>
            </Field>
          </section>
          <section>
            <h3>{isSpecialDocumentType(draft.type) ? "默认船运信息" : "默认贸易信息"}</h3>
            {["quotation", "proforma", "contract"].includes(draft.type) && (
              <Field label="付款条款">
                <Textarea rows={3} value={draft.paymentTerms} onChange={(event) => update("paymentTerms", event.target.value)} />
              </Field>
            )}
            <div className="form-grid two">
              {!isSpecialDocumentType(draft.type) && (
                <Field label="贸易术语">
                  <Input value={draft.incoterm} onChange={(event) => update("incoterm", event.target.value)} />
                </Field>
              )}
              <Field label={isSpecialDocumentType(draft.type) ? "默认装货港" : "起运地"}>
                <Input value={draft.origin} onChange={(event) => update("origin", event.target.value)} />
              </Field>
              <Field label={isSpecialDocumentType(draft.type) ? "默认卸货港" : "目的地"}>
                <Input value={draft.destination} onChange={(event) => update("destination", event.target.value)} />
              </Field>
              {(draft.type === "packing" || isSpecialDocumentType(draft.type)) && (
                <Field label="默认唛头">
                  <Input value={draft.shippingMarks} onChange={(event) => update("shippingMarks", event.target.value)} placeholder="留空时预览使用示例唛头" />
                </Field>
              )}
            </div>
            {draft.type === "contract" && (
              <Field label="合同及检验条款">
                <Textarea rows={5} value={draft.contractTerms} onChange={(event) => update("contractTerms", event.target.value)} />
              </Field>
            )}
            <Field label="备注">
              <Textarea rows={3} value={draft.notes} onChange={(event) => update("notes", event.target.value)} />
            </Field>
          </section>
          <section>
            <h3>默认显示规则</h3>
            <div className="toggle-list">
              {draft.type === "packing" && <TemplateToggle label="显示商品价格" description="开启后，装箱单显示单价、金额与合计" checked={draft.showPrices} onChange={(value) => update("showPrices", value)} />}
              {!isSpecialDocumentType(draft.type) && <TemplateToggle label="显示商品图片" description="预览使用演示商品图；正式单证使用实际商品图片" checked={draft.showImages} onChange={(value) => update("showImages", value)} />}
              <TemplateToggle label="显示印章图像" description="无公司印章时使用 DEMO 示例；不等同于法律电子签名" checked={draft.showStamp} onChange={(value) => update("showStamp", value)} />
              {!isSpecialDocumentType(draft.type) && <TemplateToggle label="显示银行信息" description="在纸张条款区显示当前公司银行资料" checked={draft.showBankInfo} onChange={(value) => update("showBankInfo", value)} />}
            </div>
          </section>
          <div className="dialog-actions">
            <Button type="button" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" variant="primary" disabled={!draft.name.trim()}>
              保存模板
            </Button>
          </div>
        </form>
        <section className="template-live-preview" aria-label="模板 A4 实时预览">
          <div className="template-preview-heading">
            <div>
              <Printer size={17} />
              <span>
                <strong>A4 实时预览</strong>
                <small>当前公司资料 · 虚构客户与商品</small>
              </span>
            </div>
            <Badge tone={dirty ? "amber" : "green"}>{dirty ? "未保存更改" : "与已存模板一致"}</Badge>
          </div>
          <div className="template-preview-stage" ref={previewStageRef}>
            <PaperPreview doc={previewDoc} zoom={zoom} />
          </div>
          <div className="template-preview-controls">
            <IconButton label="缩小模板预览" onClick={() => setZoom((value) => Math.max(0.35, value - 0.1))} disabled={zoom <= 0.35}>
              <Minus size={16} />
            </IconButton>
            <span>{Math.round(zoom * 100)}%</span>
            <IconButton label="放大模板预览" onClick={() => setZoom((value) => Math.min(1.5, value + 0.1))} disabled={zoom >= 1.5}>
              <Plus size={16} />
            </IconButton>
            <Button size="sm" variant="ghost" onClick={fitPreview}>
              <Expand size={14} />
              适应宽度
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setZoom(1)}>
              实际大小
            </Button>
          </div>
        </section>
      </div>
    </Drawer>
  );
}

function TemplateToggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="toggle-row">
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <i />
    </label>
  );
}
