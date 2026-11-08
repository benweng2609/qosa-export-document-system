import { ArrowLeft, ArrowRight, Building2, Check, CheckCircle2, FileText, Package, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import { DOCUMENT_TYPES, LANGUAGES, THEMES } from "../data";
import { suggestNumber, useStore } from "../store";
import type { DocumentType, LanguageCode, TradeDocument } from "../types";
import { Button, Field, Input, Select } from "../components/ui";

export default function NewDocument({ initialType = "quotation", onCancel, onCreated }: { initialType?: DocumentType; onCancel: () => void; onCreated: (doc: TradeDocument) => void }) {
  const { data, createDocument } = useStore();
  const initialTemplate = data.templates.find((template) => template.type === initialType)!;
  const [step, setStep] = useState(1);
  const [type, setType] = useState<DocumentType>(initialType);
  const [customerId, setCustomerId] = useState("");
  const [productIds, setProductIds] = useState<string[]>([]);
  const [number, setNumber] = useState(() => suggestNumber(initialType, data.documents));
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [currency, setCurrency] = useState(initialTemplate.currency);
  const [language, setLanguage] = useState<LanguageCode>(initialTemplate.language);
  const [themeId, setThemeId] = useState(initialTemplate.themeId);
  const [productQuery, setProductQuery] = useState("");
  const [numberError, setNumberError] = useState("");
  const selectedCustomer = data.customers.find((item) => item.id === customerId);
  const products = useMemo(() => data.products.filter((product) => `${product.name}${product.sku}`.toLowerCase().includes(productQuery.toLowerCase())), [data.products, productQuery]);

  const chooseType = (next: DocumentType) => {
    const template = data.templates.find((item) => item.type === next)!;
    setType(next);
    setNumber(suggestNumber(next, data.documents));
    setCurrency(template.currency);
    setLanguage(selectedCustomer?.defaultLanguage ?? template.language);
    setThemeId(template.themeId);
  };
  const toggleProduct = (id: string) => setProductIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  const submit = () => {
    if (!number.trim()) {
      setNumberError("请输入单证编号。");
      return;
    }
    const doc = createDocument({
      type,
      customerId: customerId || undefined,
      productIds,
      number: number.trim(),
      issueDate,
      currency,
      language,
      themeId,
    });
    onCreated(doc);
  };

  return (
    <div className="page new-document-page">
      <button className="back-link" onClick={onCancel}>
        <ArrowLeft size={16} />
        返回工作台
      </button>
      <div className="page-heading">
        <div>
          <h1>新建单证</h1>
          <p>三步开始制单。客户或商品可暂时留空，进入编辑器后再补充。</p>
        </div>
      </div>
      <ol className="stepper" aria-label="新建单证步骤">
        {["选择单据类型", "选择基础资料", "填写初始信息"].map((label, index) => {
          const n = index + 1;
          return (
            <li key={label} className={step === n ? "active" : step > n ? "done" : ""}>
              <button
                onClick={() => {
                  if (n < step) setStep(n);
                }}
                disabled={n >= step}
                aria-current={step === n ? "step" : undefined}
              >
                <span>{step > n ? <Check size={15} /> : n}</span>
                {label}
              </button>
            </li>
          );
        })}
      </ol>

      <div className="wizard-panel">
        {step === 1 && (
          <section className="wizard-section">
            <div className="wizard-title">
              <h2>要制作哪一类单证？</h2>
              <p>之后仍可切换类型，公司、客户和商品资料会保留。</p>
            </div>
            <div className="template-choice-grid">
              {DOCUMENT_TYPES.map((item) => (
                <button key={item.id} className={`template-choice ${type === item.id ? "selected" : ""}`} onClick={() => chooseType(item.id)} aria-pressed={type === item.id}>
                  <div className="template-paper">
                    <span>{item.short}</span>
                    <b>{item.en}</b>
                    <i />
                    <i />
                    <i />
                    <i />
                  </div>
                  <div>
                    <strong>{item.name}</strong>
                    <p>{item.description}</p>
                  </div>
                  {type === item.id && <CheckCircle2 className="choice-check" size={20} />}
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="wizard-section">
            <div className="wizard-title">
              <h2>选择要复用的资料</h2>
              <p>创建后保存资料快照，之后修改资料库不会影响这份单证。</p>
            </div>
            <div className="company-selection">
              <Building2 size={20} />
              <div>
                <span>公司主体</span>
                <strong>{data.company.nameZh}</strong>
                <p>{data.company.nameEn}</p>
              </div>
              <CheckCircle2 size={20} />
            </div>
            <div className="wizard-two-columns">
              <div>
                <div className="subsection-heading">
                  <UserRound size={18} />
                  <h3>客户</h3>
                  <span>可选</span>
                </div>
                <div className="record-choice-list">
                  <button
                    className={`record-choice ${!customerId ? "selected" : ""}`}
                    onClick={() => {
                      setCustomerId("");
                      setLanguage(data.templates.find((template) => template.type === type)?.language ?? "en");
                    }}
                  >
                    <div>
                      <strong>暂不选择客户</strong>
                      <span>创建草稿后补充</span>
                    </div>
                    {!customerId && <Check size={17} />}
                  </button>
                  {data.customers.map((customer) => (
                    <button
                      key={customer.id}
                      className={`record-choice ${customerId === customer.id ? "selected" : ""}`}
                      onClick={() => {
                        setCustomerId(customer.id);
                        setLanguage(customer.defaultLanguage);
                      }}
                    >
                      <div>
                        <strong>{customer.name}</strong>
                        <span>
                          {customer.contact} · {customer.country}
                        </span>
                      </div>
                      {customerId === customer.id && <Check size={17} />}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="subsection-heading">
                  <Package size={18} />
                  <h3>商品</h3>
                  <span>已选 {productIds.length} 项</span>
                </div>
                <Input value={productQuery} onChange={(e) => setProductQuery(e.target.value)} placeholder="搜索名称或 SKU" aria-label="搜索可选商品" />
                <div className="record-choice-list product-choice-list">
                  {products.map((product) => (
                    <button key={product.id} className={`record-choice ${productIds.includes(product.id) ? "selected" : ""}`} onClick={() => toggleProduct(product.id)} aria-pressed={productIds.includes(product.id)}>
                      <div>
                        <strong>{product.name}</strong>
                        <span>
                          {product.sku} · {product.defaultUnitPrice.toFixed(2)} {product.currency} / {product.unit}
                        </span>
                      </div>
                      <span className="checkbox-visual">{productIds.includes(product.id) && <Check size={14} />}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="wizard-section">
            <div className="wizard-title">
              <h2>填写初始信息</h2>
              <p>
                {DOCUMENT_TYPES.find((t) => t.id === type)?.name} · {selectedCustomer?.name ?? "暂未选择客户"} · {productIds.length} 项商品
              </p>
            </div>
            <div className="initial-form">
              <div className="form-grid two">
                <Field label="单证编号" required error={numberError} hint="编号由本地规则建议，未经过外部系统校验。">
                  <Input
                    value={number}
                    onChange={(e) => {
                      setNumber(e.target.value);
                      setNumberError("");
                    }}
                  />
                </Field>
                <Field label="签发日期" required>
                  <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} required />
                </Field>
                <Field label="币种">
                  <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                    <option value="USD">USD — 美元</option>
                    <option value="EUR">EUR — 欧元</option>
                    <option value="CNY">CNY — 人民币</option>
                    <option value="GBP">GBP — 英镑</option>
                  </Select>
                </Field>
                <Field label="单据语言">
                  <Select value={language} onChange={(e) => setLanguage(e.target.value as LanguageCode)}>
                    {LANGUAGES.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.name} · {item.native}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <Field label="纸张配色">
                <div className="theme-choice-grid">
                  {THEMES.map((theme) => (
                    <button type="button" key={theme.id} className={`theme-choice ${themeId === theme.id ? "selected" : ""}`} onClick={() => setThemeId(theme.id)} aria-pressed={themeId === theme.id}>
                      <span
                        className="theme-paper"
                        style={
                          {
                            "--theme-color": theme.color,
                            "--theme-pale": theme.pale,
                          } as React.CSSProperties
                        }
                      >
                        <b />
                        <i />
                        <i />
                        <i />
                      </span>
                      <span>{theme.name}</span>
                      {themeId === theme.id && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </Field>
              <div className="creation-summary">
                <FileText size={20} />
                <p>
                  当前使用“
                  {data.templates.find((template) => template.type === type)?.name}
                  ”，默认条款与显示规则将一并带入。商品默认数量为 100 {data.products.find((p) => productIds.includes(p.id))?.unit ?? "pcs"}
                  ，可直接修改；未选择的资料也可稍后补充。
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
      <div className="wizard-actions">
        <Button onClick={() => (step === 1 ? onCancel() : setStep(step - 1))}>
          <ArrowLeft size={16} />
          {step === 1 ? "取消" : "上一步"}
        </Button>
        <span>第 {step} 步，共 3 步</span>
        {step < 3 ? (
          <Button variant="primary" onClick={() => setStep(step + 1)}>
            下一步
            <ArrowRight size={16} />
          </Button>
        ) : (
          <Button variant="primary" size="lg" onClick={submit}>
            创建并编辑
            <ArrowRight size={16} />
          </Button>
        )}
      </div>
    </div>
  );
}
