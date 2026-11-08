import { ArrowDown, ArrowLeft, ArrowUp, Check, CheckCircle2, Copy, Download, Expand, FileText, Info, Languages, LoaderCircle, Minus, PackagePlus, Palette, Plus, Redo2, Save, Trash2, Truck, UserRound } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { DOCUMENT_TYPES, LANGUAGES, THEMES, documentTotal, formatMoney, getDocumentType } from "../data";
import { useStore } from "../store";
import type { DocumentItem, DocumentType, EditorSection, LanguageCode, TradeDocument } from "../types";
import { Badge, Button, Field, IconButton, ImageUpload, Input, Modal, Select, Textarea } from "../components/ui";
import { PaperPreview } from "../components/PaperPreview";
import { usePdfDownload } from "../hooks/use-pdf-download";

const sections: { id: EditorSection; label: string; icon: typeof FileText }[] = [
  { id: "basic", label: "基础信息", icon: FileText },
  { id: "parties", label: "公司与客户", icon: UserRound },
  { id: "items", label: "商品明细", icon: PackagePlus },
  { id: "terms", label: "贸易与运输条款", icon: Truck },
  { id: "layout", label: "版式、语言与印章", icon: Palette },
];

export default function Editor({ docId, onBack }: { docId: string; onBack: () => void }) {
  const { data, updateDocument, storageError } = useStore();
  const source = data.documents.find((doc) => doc.id === docId);
  const [draft, setDraft] = useState<TradeDocument | null>(source ? structuredClone(source) : null);
  const [history, setHistory] = useState<TradeDocument[]>([]);
  const [active, setActive] = useState<EditorSection>("basic");
  const [saveState, setSaveState] = useState<"saving" | "saved" | "error">("saved");
  const [zoom, setZoom] = useState(0.72);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const [fullPreview, setFullPreview] = useState(false);
  const [typeTarget, setTypeTarget] = useState<DocumentType | null>(null);
  const [selectedProductId, setSelectedProductId] = useState("");
  const stageRef = useRef<HTMLDivElement>(null);
  const { download, downloadingId } = usePdfDownload();

  useEffect(() => {
    const doc = data.documents.find((item) => item.id === docId);
    setDraft(doc ? structuredClone(doc) : null);
    setHistory([]);
    // Reload only when entering another document; autosave updates must not reset the editor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docId]);

  useEffect(() => {
    if (!draft) return;
    setSaveState("saving");
    const timer = window.setTimeout(() => {
      updateDocument(draft);
      setSaveState(storageError ? "error" : "saved");
    }, 450);
    return () => window.clearTimeout(timer);
    // updateDocument and storageError are stable enough for this local-only store; draft is the save trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (saveState === "saving") {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [saveState]);

  const fitPreview = useCallback(() => {
    const width = stageRef.current?.clientWidth ?? 800;
    setZoom(Math.min(1.2, Math.max(0.35, (width - 48) / 794)));
  }, []);
  useEffect(() => {
    fitPreview();
    window.addEventListener("resize", fitPreview);
    return () => window.removeEventListener("resize", fitPreview);
  }, [fitPreview]);

  if (!draft)
    return (
      <div className="editor-missing">
        <FileText size={32} />
        <h1>找不到这份单证</h1>
        <p>它可能已从当前浏览器删除。</p>
        <Button variant="primary" onClick={onBack}>
          返回单证管理
        </Button>
      </div>
    );

  const change = (recipe: (previous: TradeDocument) => TradeDocument) => {
    setHistory((prev) => [...prev.slice(-29), structuredClone(draft)]);
    setDraft(recipe(draft));
  };
  const update = <K extends keyof TradeDocument>(key: K, value: TradeDocument[K]) => change((prev) => ({ ...prev, [key]: value }));
  const undo = () => {
    if (!history.length) return;
    const previous = history[history.length - 1];
    setHistory(history.slice(0, -1));
    setDraft(previous);
    toast("已撤销最近编辑");
  };
  const manualSave = () => {
    updateDocument(draft);
    setSaveState("saved");
    toast.success("草稿已保存到当前浏览器");
  };
  const handleBack = () => {
    updateDocument(draft);
    onBack();
  };
  const changeType = () => {
    if (!typeTarget) return;
    change((prev) => ({
      ...prev,
      type: typeTarget,
      showPrices: typeTarget === "packing" ? false : true,
      showBankInfo: typeTarget === "proforma" || typeTarget === "contract",
    }));
    toast.success(`已切换为${getDocumentType(typeTarget).name}，公司、客户和 ${draft.items.length} 项商品已保留。`);
    setTypeTarget(null);
  };
  const missingCount = (section: EditorSection) => {
    if (section === "basic") return [draft.number, draft.issueDate].filter((value) => !value).length;
    if (section === "parties") return draft.customerSnapshot ? 0 : 1;
    if (section === "items") return draft.items.length ? 0 : 1;
    if (section === "terms") return ["proforma", "commercial", "packing", "contract"].includes(draft.type) && (!draft.origin || !draft.destination) ? 1 : 0;
    return 0;
  };

  return (
    <div className="editor-shell">
      <header className="editor-toolbar">
        <div className="editor-toolbar-left">
          <IconButton label="返回并保存" onClick={handleBack}>
            <ArrowLeft size={19} />
          </IconButton>
          <div className="editor-doc-title">
            <strong>{draft.number}</strong>
            <span className={`save-state ${saveState}`}>
              {saveState === "saving" ? (
                <>
                  <LoaderCircle size={13} className="spin" />
                  保存中…
                </>
              ) : saveState === "error" ? (
                <>保存失败，请重试</>
              ) : (
                <>
                  <Check size={13} />
                  已保存到本机
                </>
              )}
            </span>
          </div>
        </div>
        <div className="editor-toolbar-center">
          <Select value={draft.language} onChange={(e) => update("language", e.target.value as LanguageCode)} aria-label="单据语言">
            {LANGUAGES.map((item) => (
              <option key={item.code} value={item.code}>
                {item.native}
              </option>
            ))}
          </Select>
          <Select value={draft.themeId} onChange={(e) => update("themeId", e.target.value)} aria-label="纸张配色">
            {THEMES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="editor-toolbar-actions">
          <Button variant="ghost" className="toolbar-secondary" onClick={undo} disabled={!history.length}>
            <Redo2 size={16} />
            撤销
          </Button>
          <Button variant="ghost" className="toolbar-secondary" onClick={manualSave}>
            <Save size={16} />
            保存草稿
          </Button>
          <Button variant="ghost" className="toolbar-secondary" onClick={() => setFullPreview(true)}>
            <Expand size={16} />
            全屏预览
          </Button>
          <Button variant="primary" onClick={() => download(draft)} disabled={downloadingId === draft.id}>
            {downloadingId === draft.id ? <LoaderCircle size={16} className="spin" /> : <Download size={16} />}
            {downloadingId === draft.id ? "正在生成 PDF" : "下载 PDF"}
          </Button>
        </div>
      </header>
      {storageError && (
        <div className="editor-storage-error">
          {storageError}
          <Button size="sm" onClick={manualSave}>
            重试
          </Button>
        </div>
      )}
      <div className="editor-mobile-tabs">
        <button className={mobileTab === "edit" ? "active" : ""} onClick={() => setMobileTab("edit")}>
          编辑
        </button>
        <button
          className={mobileTab === "preview" ? "active" : ""}
          onClick={() => {
            setMobileTab("preview");
            setTimeout(fitPreview, 0);
          }}
        >
          预览
        </button>
      </div>
      <div className={`editor-body mobile-${mobileTab}`}>
        <nav className="editor-steps" aria-label="单证编辑区块">
          {sections.map((section) => {
            const missing = missingCount(section.id);
            const Icon = section.icon;
            return (
              <button key={section.id} className={active === section.id ? "active" : ""} onClick={() => setActive(section.id)} title={section.label}>
                <Icon size={18} />
                <span>{section.label}</span>
                {missing ? <b>{missing}</b> : <CheckCircle2 size={15} className="section-complete" />}
              </button>
            );
          })}
        </nav>
        <main className="editor-form-panel">
          <div className="document-type-control">
            <Field label="单据类型">
              <Select value={draft.type} onChange={(e) => setTypeTarget(e.target.value as DocumentType)}>
                {DOCUMENT_TYPES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} · {item.en}
                  </option>
                ))}
              </Select>
            </Field>
            <button
              className="text-button"
              onClick={() =>
                toast("共同资料会保留；目标类型特有字段需要补充。", {
                  icon: <Info size={16} />,
                })
              }
            >
              切换说明
            </button>
          </div>
          {active === "basic" && <BasicSection draft={draft} update={update} />}
          {active === "parties" && <PartiesSection draft={draft} update={update} />}
          {active === "items" && <ItemsSection draft={draft} change={change} selectedProductId={selectedProductId} setSelectedProductId={setSelectedProductId} undo={undo} />}
          {active === "terms" && <TermsSection draft={draft} update={update} />}
          {active === "layout" && <LayoutSection draft={draft} update={update} change={change} />}
        </main>
        <section className="preview-panel" aria-label="A4 实时预览">
          <div className="preview-stage" ref={stageRef}>
            <PaperPreview
              doc={draft}
              zoom={zoom}
              onSection={(section) => {
                setActive(section);
                setMobileTab("edit");
              }}
            />
          </div>
          <div className="preview-controls">
            <IconButton label="缩小" onClick={() => setZoom((value) => Math.max(0.35, value - 0.1))} disabled={zoom <= 0.35}>
              <Minus size={16} />
            </IconButton>
            <span>{Math.round(zoom * 100)}%</span>
            <IconButton label="放大" onClick={() => setZoom((value) => Math.min(1.5, value + 0.1))} disabled={zoom >= 1.5}>
              <Plus size={16} />
            </IconButton>
            <Button size="sm" variant="ghost" onClick={fitPreview}>
              适应宽度
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setZoom(1)}>
              实际大小
            </Button>
          </div>
        </section>
      </div>
      <Modal open={Boolean(typeTarget)} onOpenChange={(open) => !open && setTypeTarget(null)} title={`切换为${typeTarget ? getDocumentType(typeTarget).name : ""}？`} description="共同资料将保留，只需补充目标单据字段。切回当前类型时，已填写的补充字段仍会保留。">
        <div className="type-switch-summary">
          <CheckCircle2 size={20} />
          <p>
            公司、客户和 {draft.items.length} 项商品不会丢失。
            {typeTarget === "packing" && "装箱单默认隐藏价格，你可在版式设置中开启。"}
          </p>
        </div>
        <div className="dialog-actions">
          <Button onClick={() => setTypeTarget(null)}>取消</Button>
          <Button variant="primary" onClick={changeType}>
            确认切换
          </Button>
        </div>
      </Modal>
      <Modal open={fullPreview} onOpenChange={setFullPreview} title={`${draft.number} · A4 预览`} description="预览与 PDF 使用同一份结构化数据和分页规则。" wide>
        <div className="full-preview-stage">
          <PaperPreview doc={draft} zoom={0.8} />
        </div>
      </Modal>
    </div>
  );
}

type UpdateDocumentField = <K extends keyof TradeDocument>(key: K, value: TradeDocument[K]) => void;

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="editor-section-heading">
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

function BasicSection({ draft, update }: { draft: TradeDocument; update: UpdateDocumentField }) {
  return (
    <section className="editor-section">
      <SectionHeading title="基础信息" description="编号、日期和状态仅属于当前单证。" />
      <Field label="单证编号" required>
        <Input value={draft.number} onChange={(e) => update("number", e.target.value)} />
      </Field>
      <Field label="单证名称">
        <Input value={draft.title} onChange={(e) => update("title", e.target.value)} />
      </Field>
      <div className="form-grid two">
        <Field label="签发日期" required>
          <Input type="date" value={draft.issueDate} onChange={(e) => update("issueDate", e.target.value)} />
        </Field>
        <Field label="状态">
          <Select value={draft.status} onChange={(e) => update("status", e.target.value as TradeDocument["status"])}>
            <option value="draft">草稿</option>
            <option value="completed">已完成</option>
            <option value="archived">已归档</option>
          </Select>
        </Field>
        <Field label="币种">
          <Select value={draft.currency} onChange={(e) => update("currency", e.target.value)}>
            <option>USD</option>
            <option>EUR</option>
            <option>CNY</option>
            <option>GBP</option>
          </Select>
        </Field>
        {draft.type === "quotation" && (
          <Field label="报价有效期" required>
            <Input type="date" value={draft.validUntil} onChange={(e) => update("validUntil", e.target.value)} />
          </Field>
        )}
      </div>
      <div className="form-note">
        <Info size={16} />
        <p>金额由商品数量与单价计算，不需要在这里重复填写。</p>
      </div>
    </section>
  );
}

function PartiesSection({ draft, update }: { draft: TradeDocument; update: UpdateDocumentField }) {
  const { data } = useStore();
  const company = draft.companySnapshot;
  const customer = draft.customerSnapshot;
  const updateCompany = (key: keyof typeof company, value: string) => update("companySnapshot", { ...company, [key]: value });
  const updateCustomer = (key: keyof NonNullable<typeof customer>, value: string) => customer && update("customerSnapshot", { ...customer, [key]: value });
  return (
    <section className="editor-section">
      <SectionHeading title="公司与客户" description="此处修改只影响当前单证快照，不改写资料库。" />
      <div className="subsection-heading">
        <h3>公司信息</h3>
        <Button size="sm" variant="ghost" onClick={() => update("companySnapshot", { ...data.company })}>
          使用公司库最新资料
        </Button>
      </div>
      <Field label={draft.language === "zh-CN" ? "公司中文名称" : "公司英文名称"} required>
        <Input value={draft.language === "zh-CN" ? company.nameZh : company.nameEn} onChange={(e) => updateCompany(draft.language === "zh-CN" ? "nameZh" : "nameEn", e.target.value)} />
      </Field>
      <Field label="公司地址">
        <Textarea rows={3} value={company.address} onChange={(e) => updateCompany("address", e.target.value)} />
      </Field>
      <div className="form-grid two">
        <Field label="电话">
          <Input value={company.phone} onChange={(e) => updateCompany("phone", e.target.value)} />
        </Field>
        <Field label="邮箱">
          <Input value={company.email} onChange={(e) => updateCompany("email", e.target.value)} />
        </Field>
      </div>
      <div className="section-divider" />
      <div className="subsection-heading">
        <h3>客户信息</h3>
        {!customer && <Badge tone="amber">导出前必需</Badge>}
      </div>
      <Field label="从客户库选择">
        <Select value={customer?.id ?? ""} onChange={(e) => update("customerSnapshot", data.customers.find((item) => item.id === e.target.value) ?? null)}>
          <option value="">暂不选择客户</option>
          {data.customers.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} · {item.country}
            </option>
          ))}
        </Select>
      </Field>
      {customer ? (
        <>
          <Field label="客户名称" required>
            <Input value={customer.name} onChange={(e) => updateCustomer("name", e.target.value)} />
          </Field>
          <div className="form-grid two">
            <Field label="联系人">
              <Input value={customer.contact} onChange={(e) => updateCustomer("contact", e.target.value)} />
            </Field>
            <Field label="国家 / 地区">
              <Input value={customer.country} onChange={(e) => updateCustomer("country", e.target.value)} />
            </Field>
          </div>
          <Field label="邮箱">
            <Input value={customer.email} onChange={(e) => updateCustomer("email", e.target.value)} />
          </Field>
          <Field label="账单地址">
            <Textarea rows={3} value={customer.billingAddress} onChange={(e) => updateCustomer("billingAddress", e.target.value)} />
          </Field>
          <Field label="收货地址">
            <Textarea rows={3} value={customer.shippingAddress} onChange={(e) => updateCustomer("shippingAddress", e.target.value)} />
          </Field>
        </>
      ) : (
        <div className="inline-empty">
          <UserRound size={22} />
          <p>可以先保存草稿。导出 PDF 前需要选择客户。</p>
        </div>
      )}
    </section>
  );
}

function TermsSection({ draft, update }: { draft: TradeDocument; update: UpdateDocumentField }) {
  return (
    <section className="editor-section">
      <SectionHeading title="贸易与运输条款" description="只显示当前单证需要的字段；隐藏字段的数据仍会保留。" />
      <Field label="贸易术语" required={draft.type !== "quotation"}>
        <Input value={draft.incoterm} onChange={(e) => update("incoterm", e.target.value)} placeholder="例如：FOB Shanghai, Incoterms® 2020" />
      </Field>
      <div className="form-grid two">
        <Field label="起运地" required={draft.type !== "quotation"}>
          <Input value={draft.origin} onChange={(e) => update("origin", e.target.value)} />
        </Field>
        <Field label="目的地" required={draft.type !== "quotation"}>
          <Input value={draft.destination} onChange={(e) => update("destination", e.target.value)} />
        </Field>
      </div>
      {draft.type !== "packing" && draft.type !== "commercial" && (
        <Field label="付款方式" required={draft.type === "proforma" || draft.type === "contract"}>
          <Textarea rows={3} value={draft.paymentTerms} onChange={(e) => update("paymentTerms", e.target.value)} />
        </Field>
      )}
      {(draft.type === "packing" || draft.type === "commercial") && (
        <Field label="唛头">
          <Textarea rows={4} value={draft.shippingMarks} onChange={(e) => update("shippingMarks", e.target.value)} />
        </Field>
      )}
      {draft.type === "contract" && (
        <Field label="合同条款、交付与检验约定" required>
          <Textarea rows={8} value={draft.contractTerms} onChange={(e) => update("contractTerms", e.target.value)} />
        </Field>
      )}
      <Field label="备注">
        <Textarea rows={3} value={draft.notes} onChange={(e) => update("notes", e.target.value)} />
      </Field>
    </section>
  );
}

function LayoutSection({ draft, update, change }: { draft: TradeDocument; update: UpdateDocumentField; change: (recipe: (previous: TradeDocument) => TradeDocument) => void }) {
  const company = draft.companySnapshot;
  return (
    <section className="editor-section">
      <SectionHeading title="版式、语言与印章" description="配色只改变纸张标题、表头和重点线条。" />
      <Field label="单据语言">
        <Select value={draft.language} onChange={(e) => update("language", e.target.value as LanguageCode)}>
          {LANGUAGES.map((item) => (
            <option key={item.code} value={item.code}>
              {item.name} · {item.native}
            </option>
          ))}
        </Select>
      </Field>
      {!["en", "zh-CN"].includes(draft.language) && (
        <div className="form-note warning">
          <Languages size={16} />
          <p>当前语言缺少部分商品名称翻译，将暂时使用英语。单据标签已切换为所选语言。</p>
        </div>
      )}
      {draft.language === "ar" && (
        <div className="form-note">
          <Languages size={16} />
          <p>阿拉伯语预览与 PDF 使用从右到左排版。</p>
        </div>
      )}
      <Field label="纸张配色">
        <div className="editor-theme-grid">
          {THEMES.map((theme) => (
            <button type="button" key={theme.id} className={draft.themeId === theme.id ? "selected" : ""} onClick={() => update("themeId", theme.id)}>
              <span style={{ background: theme.color }} />
              <em style={{ background: theme.pale }} />
              <strong>{theme.name}</strong>
              {draft.themeId === theme.id && <Check size={14} />}
            </button>
          ))}
        </div>
      </Field>
      <div className="toggle-list">
        {draft.type === "packing" && <Toggle label="显示商品价格" description={draft.type === "packing" ? "装箱单默认隐藏，开启后会显示单价与总金额。" : "在商品表中显示单价、金额与合计。"} checked={draft.showPrices} onChange={(value) => update("showPrices", value)} />}
        <Toggle label="显示商品图片" description="仅显示已上传图片的商品。" checked={draft.showImages} onChange={(value) => update("showImages", value)} />
        <Toggle label="显示银行信息" description="在纸张条款区显示当前公司银行快照。" checked={draft.showBankInfo} onChange={(value) => update("showBankInfo", value)} />
        <Toggle label="显示电子印章" description="印章仅用于单证图像，不等同于法律电子签名。" checked={draft.showStamp} onChange={(value) => update("showStamp", value)} />
      </div>
      <Field label="公司 LOGO">
        <ImageUpload
          value={company.logo}
          onChange={(value) =>
            change((prev) => ({
              ...prev,
              companySnapshot: { ...prev.companySnapshot, logo: value },
            }))
          }
        />
      </Field>
      <Field label="电子印章">
        <ImageUpload
          value={company.stamp}
          onChange={(value) =>
            change((prev) => ({
              ...prev,
              companySnapshot: { ...prev.companySnapshot, stamp: value },
            }))
          }
          label="上传印章"
        />
      </Field>
    </section>
  );
}

function Toggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="toggle-row">
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <i aria-hidden="true" />
    </label>
  );
}

function ItemsSection({ draft, change, selectedProductId, setSelectedProductId, undo }: { draft: TradeDocument; change: (recipe: (previous: TradeDocument) => TradeDocument) => void; selectedProductId: string; setSelectedProductId: (id: string) => void; undo: () => void }) {
  const { data } = useStore();
  const updateItem = (id: string, key: keyof DocumentItem, value: string | number) =>
    change((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id !== id) return item;
        if (key === "quantity") {
          const quantity = Math.max(0, Number(value));
          const ratio = item.quantity > 0 ? quantity / item.quantity : 0;
          return {
            ...item,
            quantity,
            netWeight: Number((item.netWeight * ratio).toFixed(2)),
            grossWeight: Number((item.grossWeight * ratio).toFixed(2)),
          };
        }
        return {
          ...item,
          [key]: typeof item[key] === "number" ? Number(value) : value,
        };
      }),
    }));
  const addProduct = () => {
    const product = data.products.find((item) => item.id === selectedProductId);
    if (!product) return;
    const item: DocumentItem = {
      id: `item-${crypto.randomUUID()}`,
      productId: product.id,
      sku: product.sku,
      name: product.name,
      nameZh: product.nameZh,
      description: product.description,
      quantity: 100,
      unit: product.unit,
      unitPrice: product.defaultUnitPrice,
      packageCount: 5,
      netWeight: Number((100 * product.netWeight).toFixed(2)),
      grossWeight: Number((100 * product.grossWeight).toFixed(2)),
      measurements: 0.32,
      image: product.image,
    };
    change((prev) => ({ ...prev, items: [...prev.items, item] }));
    setSelectedProductId("");
    toast.success(`已添加 ${product.name}`);
  };
  const addTemporary = () => {
    const item: DocumentItem = {
      id: `item-${crypto.randomUUID()}`,
      sku: "TEMP-SKU",
      name: "Temporary product",
      nameZh: "临时商品",
      description: "",
      quantity: 1,
      unit: "pcs",
      unitPrice: 0,
      packageCount: 1,
      netWeight: 0,
      grossWeight: 0,
      measurements: 0,
    };
    change((prev) => ({ ...prev, items: [...prev.items, item] }));
  };
  const remove = (id: string) => {
    change((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
    toast("已移除商品", { action: { label: "撤销", onClick: undo } });
  };
  const duplicate = (id: string) =>
    change((prev) => {
      const index = prev.items.findIndex((item) => item.id === id);
      if (index < 0) return prev;
      const items = [...prev.items];
      items.splice(index + 1, 0, {
        ...prev.items[index],
        id: `item-${crypto.randomUUID()}`,
      });
      return { ...prev, items };
    });
  const move = (index: number, direction: -1 | 1) =>
    change((prev) => {
      const items = [...prev.items];
      const target = index + direction;
      if (target < 0 || target >= items.length) return prev;
      [items[index], items[target]] = [items[target], items[index]];
      return { ...prev, items };
    });

  return (
    <section className="editor-section items-section">
      <SectionHeading title="商品明细" description="修改数量或单价后，金额、合计和 A4 预览立即更新。" />
      <div className="add-product-row">
        <Select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} aria-label="从产品库选择">
          <option value="">从产品库选择…</option>
          {data.products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.sku} · {product.name}
            </option>
          ))}
        </Select>
        <Button onClick={addProduct} disabled={!selectedProductId}>
          <Plus size={16} />
          添加
        </Button>
      </div>
      <Button variant="ghost" className="temporary-product" onClick={addTemporary}>
        <PackagePlus size={15} />
        新增临时商品
      </Button>
      <div className="item-editor-list">
        {draft.items.map((item, index) => (
          <article className="item-editor" key={item.id}>
            <div className="item-editor-heading">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <Input value={draft.language === "zh-CN" ? item.nameZh : item.name} onChange={(e) => updateItem(item.id, draft.language === "zh-CN" ? "nameZh" : "name", e.target.value)} aria-label={`第 ${index + 1} 项商品名称`} />
                <small>{item.sku}</small>
              </div>
              <div className="item-actions">
                <IconButton label="上移商品" onClick={() => move(index, -1)} disabled={index === 0}>
                  <ArrowUp size={15} />
                </IconButton>
                <IconButton label="下移商品" onClick={() => move(index, 1)} disabled={index === draft.items.length - 1}>
                  <ArrowDown size={15} />
                </IconButton>
                <IconButton label="复制商品" onClick={() => duplicate(item.id)}>
                  <Copy size={15} />
                </IconButton>
                <IconButton label="删除商品" onClick={() => remove(item.id)}>
                  <Trash2 size={15} />
                </IconButton>
              </div>
            </div>
            <div className="form-grid three">
              <Field label="数量">
                <Input type="number" min="0" step="1" value={item.quantity} onChange={(e) => updateItem(item.id, "quantity", e.target.value)} />
              </Field>
              <Field label="单位">
                <Input value={item.unit} onChange={(e) => updateItem(item.id, "unit", e.target.value)} />
              </Field>
              {draft.showPrices && (
                <Field label={`单价（${draft.currency}）`}>
                  <Input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(e) => updateItem(item.id, "unitPrice", e.target.value)} />
                </Field>
              )}
              {draft.type === "packing" && (
                <>
                  <Field label="箱数">
                    <Input type="number" min="0" step="1" value={item.packageCount} onChange={(e) => updateItem(item.id, "packageCount", e.target.value)} />
                  </Field>
                  <Field label="净重（kg）">
                    <Input type="number" min="0" step="0.01" value={item.netWeight} onChange={(e) => updateItem(item.id, "netWeight", e.target.value)} />
                  </Field>
                  <Field label="毛重（kg）">
                    <Input type="number" min="0" step="0.01" value={item.grossWeight} onChange={(e) => updateItem(item.id, "grossWeight", e.target.value)} />
                  </Field>
                  <Field label="体积（m³）">
                    <Input type="number" min="0" step="0.001" value={item.measurements} onChange={(e) => updateItem(item.id, "measurements", e.target.value)} />
                  </Field>
                </>
              )}
            </div>
            {draft.showPrices && (
              <div className="item-amount">
                <span>金额</span>
                <strong>{formatMoney(item.quantity * item.unitPrice, draft.currency)}</strong>
              </div>
            )}
          </article>
        ))}
      </div>
      {!draft.items.length && (
        <div className="inline-empty">
          <PackagePlus size={24} />
          <p>还没有商品。可从产品库添加，或新增临时商品。</p>
        </div>
      )}
      <div className="editor-total">
        <span>
          {draft.type === "packing" ? "总箱数 / 总毛重" : "合计"}
          <small>{draft.items.length} 项商品</small>
        </span>
        <strong>{draft.type === "packing" ? `${draft.items.reduce((s, i) => s + i.packageCount, 0)} 箱 · ${draft.items.reduce((s, i) => s + i.grossWeight, 0).toFixed(2)} kg` : formatMoney(documentTotal(draft), draft.currency)}</strong>
      </div>
    </section>
  );
}
