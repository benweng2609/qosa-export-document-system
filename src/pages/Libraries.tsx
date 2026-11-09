import { Building2, Download, Edit3, LoaderCircle, PackagePlus, Plus, Search, Trash2, Upload, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { LANGUAGES, formatMoney } from "../data";
import { blankCustomer, blankProduct, useStore } from "../store";
import type { Customer, Product } from "../types";
import { Button, ConfirmDialog, Drawer, EmptyState, Field, ImageUpload, Input, Select, Textarea } from "../components/ui";
import ProductImportDialog from "../components/ProductImportDialog";
import { exportProducts } from "../product-io";

export function ProductsPage() {
  const { data, saveProduct, deleteProduct } = useStore();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const filtered = useMemo(() => data.products.filter((product) => `${product.name}${product.nameZh}${product.sku}`.toLowerCase().includes(query.toLowerCase())), [data.products, query]);
  const handleExport = async () => {
    setExporting(true);
    try {
      await exportProducts(data.products);
      toast.success(`已导出 ${data.products.length} 项产品`);
    } catch {
      toast.error("产品导出失败，请重试。");
    } finally {
      setExporting(false);
    }
  };
  const referenced = deleting ? data.documents.filter((doc) => doc.items.some((item) => item.productId === deleting.id)).length : 0;

  return (
    <div className="page products-page">
      <div className="page-heading">
        <div>
          <h1>产品库</h1>
          <p>维护一次商品资料，新建贸易单证或船运资料单时直接复用。</p>
        </div>
        <div className="page-heading-actions">
          <Button onClick={() => setImportOpen(true)}>
            <Upload size={16} />
            导入产品
          </Button>
          <Button onClick={() => void handleExport()} disabled={!data.products.length || exporting}>
            {exporting ? <LoaderCircle className="spin" size={16} /> : <Download size={16} />}
            导出 Excel
          </Button>
          <Button variant="primary" onClick={() => setEditing(blankProduct())}>
            <Plus size={17} />
            新增产品
          </Button>
        </div>
      </div>
      <div className="filter-bar">
        <div className="search-box">
          <Search size={16} />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索产品名称或 SKU" aria-label="搜索产品" />
        </div>
        <span className="filter-count">{data.products.length} 项产品</span>
      </div>
      <div className="data-table-wrap">
        <table className="data-table product-table">
          <thead>
            <tr>
              <th>产品</th>
              <th>SKU</th>
              <th>规格描述</th>
              <th>默认单位</th>
              <th>默认单价</th>
              <th>最近更新</th>
              <th>
                <span className="sr-only">操作</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <tr key={product.id}>
                <td>
                  <div className="product-cell">
                    {product.image ? (
                      <img src={product.image} alt="" />
                    ) : (
                      <span className="product-placeholder">
                        <PackagePlus size={19} />
                      </span>
                    )}
                    <div>
                      <strong>{product.name}</strong>
                      <small>{product.nameZh}</small>
                    </div>
                  </div>
                </td>
                <td className="numeric">{product.sku}</td>
                <td className="description-cell">{product.description}</td>
                <td>{product.unit}</td>
                <td className="numeric">{formatMoney(product.defaultUnitPrice, product.currency)}</td>
                <td>{new Date(product.updatedAt).toLocaleDateString("zh-CN")}</td>
                <td>
                  <div className="row-actions">
                    <Button variant="ghost" size="sm" onClick={() => setEditing({ ...product })}>
                      <Edit3 size={15} />
                      编辑
                    </Button>
                    <Button variant="ghost" size="sm" aria-label={`删除 ${product.name}`} onClick={() => setDeleting(product)}>
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mobile-product-list">
        {filtered.map((product) => (
          <article className="mobile-document-card" key={product.id}>
            <div className="product-cell">
              {product.image ? (
                <img src={product.image} alt="" />
              ) : (
                <span className="product-placeholder">
                  <PackagePlus size={19} />
                </span>
              )}
              <div>
                <strong>{product.name}</strong>
                <small>
                  {product.sku} · {product.nameZh}
                </small>
              </div>
            </div>
            <p>{product.description}</p>
            <div className="mobile-doc-meta">
              <strong>
                {formatMoney(product.defaultUnitPrice, product.currency)} / {product.unit}
              </strong>
              <span>{new Date(product.updatedAt).toLocaleDateString("zh-CN")}</span>
            </div>
            <div className="row-actions">
              <Button size="sm" onClick={() => setEditing({ ...product })}>
                <Edit3 size={15} />
                编辑
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setDeleting(product)}>
                <Trash2 size={15} />
                删除
              </Button>
            </div>
          </article>
        ))}
      </div>
      {!filtered.length && (
        <EmptyState
          title="没有匹配的产品"
          description="更换关键词，或新增一项可复用产品。"
          action={
            <Button variant="primary" onClick={() => setEditing(blankProduct())}>
              新增产品
            </Button>
          }
        />
      )}
      <ProductImportDialog open={importOpen} onOpenChange={setImportOpen} />
      <ProductDrawer
        product={editing}
        onChange={setEditing}
        onOpenChange={(open) => !open && setEditing(null)}
        onSave={(product) => {
          saveProduct({ ...product, updatedAt: new Date().toISOString() });
          setEditing(null);
          toast.success("产品资料已保存到当前浏览器");
        }}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="删除产品资料？"
        description={referenced ? `该产品已被 ${referenced} 份单证引用。删除产品库资料不会修改这些历史单证中的商品快照。` : "删除后，新建单证将无法再选择该产品。"}
        confirmLabel="删除产品"
        danger
        onConfirm={() => {
          if (deleting) {
            deleteProduct(deleting.id);
            toast.success("产品已删除，历史单证快照未改变");
          }
        }}
      />
    </div>
  );
}

function ProductDrawer({ product, onChange, onOpenChange, onSave }: { product: Product | null; onChange: (product: Product) => void; onOpenChange: (open: boolean) => void; onSave: (product: Product) => void }) {
  if (!product) return null;
  const update = (key: keyof Product, value: unknown) => onChange({ ...product, [key]: value });
  return (
    <Drawer open={Boolean(product)} onOpenChange={onOpenChange} title={dataProductTitle(product)} description="保存后可在新建单证时直接选择。">
      <form
        className="drawer-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSave(product);
        }}
      >
        <section>
          <h3>基础资料</h3>
          <div className="form-grid two">
            <Field label="英文产品名称" required>
              <Input value={product.name} onChange={(e) => update("name", e.target.value)} required />
            </Field>
            <Field label="中文产品名称">
              <Input value={product.nameZh} onChange={(e) => update("nameZh", e.target.value)} />
            </Field>
            <Field label="SKU" required>
              <Input value={product.sku} onChange={(e) => update("sku", e.target.value)} required />
            </Field>
            <Field label="默认单位" required>
              <Input value={product.unit} onChange={(e) => update("unit", e.target.value)} required />
            </Field>
            <Field label="默认单价" required>
              <Input type="number" min="0" step="0.01" value={product.defaultUnitPrice} onChange={(e) => update("defaultUnitPrice", Number(e.target.value))} required />
            </Field>
            <Field label="币种">
              <Select value={product.currency} onChange={(e) => update("currency", e.target.value)}>
                <option>USD</option>
                <option>EUR</option>
                <option>CNY</option>
                <option>GBP</option>
              </Select>
            </Field>
          </div>
          <Field label="规格描述">
            <Textarea rows={3} value={product.description} onChange={(e) => update("description", e.target.value)} />
          </Field>
        </section>
        <section>
          <h3>贸易资料</h3>
          <div className="form-grid two">
            <Field label="HS 编码">
              <Input value={product.hsCode} onChange={(e) => update("hsCode", e.target.value)} />
            </Field>
            <Field label="原产国">
              <Input value={product.originCountry} onChange={(e) => update("originCountry", e.target.value)} />
            </Field>
            <Field label="单件净重（kg）">
              <Input type="number" min="0" step="0.01" value={product.netWeight} onChange={(e) => update("netWeight", Number(e.target.value))} />
            </Field>
            <Field label="单件毛重（kg）">
              <Input type="number" min="0" step="0.01" value={product.grossWeight} onChange={(e) => update("grossWeight", Number(e.target.value))} />
            </Field>
            <Field label="包装方式">
              <Input value={product.packageType} onChange={(e) => update("packageType", e.target.value)} />
            </Field>
            <Field label="包装尺寸">
              <Input value={product.dimensions} onChange={(e) => update("dimensions", e.target.value)} />
            </Field>
          </div>
        </section>
        <section>
          <h3>产品图片</h3>
          <ImageUpload value={product.image} onChange={(value) => update("image", value)} label="上传产品主图" hint="PNG、JPG 或 WebP，不超过 400 KB；图片仅保存在当前浏览器。" />
        </section>
        <div className="dialog-actions">
          <Button type="button" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button type="submit" variant="primary" disabled={!product.name.trim() || !product.sku.trim()}>
            保存产品
          </Button>
        </div>
      </form>
    </Drawer>
  );
}

function dataProductTitle(product: Product) {
  return product.name ? "编辑产品" : "新增产品";
}

export function CustomersPage() {
  const { data, saveCustomer, deleteCustomer } = useStore();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState<Customer | null>(null);
  const filtered = useMemo(() => data.customers.filter((customer) => `${customer.name}${customer.contact}${customer.country}`.toLowerCase().includes(query.toLowerCase())), [data.customers, query]);
  const linked = (id: string) => data.documents.filter((doc) => doc.customerSnapshot?.id === id).length;

  return (
    <div className="page customers-page">
      <div className="page-heading">
        <div>
          <h1>客户管理</h1>
          <p>保存客户、地址和默认语言，新建单证时自动带入快照。</p>
        </div>
        <Button variant="primary" onClick={() => setEditing(blankCustomer())}>
          <UserPlus size={17} />
          新增客户
        </Button>
      </div>
      <div className="filter-bar">
        <div className="search-box">
          <Search size={16} />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索客户、联系人或国家" aria-label="搜索客户" />
        </div>
        <span className="filter-count">{data.customers.length} 个客户</span>
      </div>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>客户名称</th>
              <th>联系人</th>
              <th>国家 / 地区</th>
              <th>邮箱</th>
              <th>默认语言</th>
              <th>关联单证</th>
              <th>
                <span className="sr-only">操作</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((customer) => (
              <tr key={customer.id}>
                <td>
                  <strong>{customer.name}</strong>
                  <small>{customer.registration}</small>
                </td>
                <td>{customer.contact}</td>
                <td>{customer.country}</td>
                <td>{customer.email}</td>
                <td>{LANGUAGES.find((l) => l.code === customer.defaultLanguage)?.native}</td>
                <td>{linked(customer.id)} 份</td>
                <td>
                  <div className="row-actions">
                    <Button variant="ghost" size="sm" onClick={() => setEditing({ ...customer })}>
                      <Edit3 size={15} />
                      编辑
                    </Button>
                    <Button variant="ghost" size="sm" aria-label={`删除 ${customer.name}`} onClick={() => setDeleting(customer)}>
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mobile-document-list">
        {filtered.map((customer) => (
          <article className="mobile-document-card" key={customer.id}>
            <div className="mobile-doc-top">
              <strong>{customer.name}</strong>
              <span>{customer.country}</span>
            </div>
            <p>
              {customer.contact} · {customer.email}
            </p>
            <div className="mobile-doc-meta">
              <span>默认 {LANGUAGES.find((l) => l.code === customer.defaultLanguage)?.native}</span>
              <span>{linked(customer.id)} 份关联单证</span>
            </div>
            <div className="row-actions">
              <Button size="sm" onClick={() => setEditing({ ...customer })}>
                <Edit3 size={15} />
                编辑
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setDeleting(customer)}>
                <Trash2 size={15} />
                删除
              </Button>
            </div>
          </article>
        ))}
      </div>
      {!filtered.length && (
        <EmptyState
          title="没有匹配的客户"
          description="更换关键词，或新增一个可复用客户。"
          action={
            <Button variant="primary" onClick={() => setEditing(blankCustomer())}>
              新增客户
            </Button>
          }
        />
      )}
      <CustomerDrawer
        customer={editing}
        onChange={setEditing}
        onOpenChange={(open) => !open && setEditing(null)}
        onSave={(customer) => {
          saveCustomer({ ...customer, updatedAt: new Date().toISOString() });
          setEditing(null);
          toast.success("客户资料已保存到当前浏览器");
        }}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="删除客户资料？"
        description={deleting && linked(deleting.id) ? `该客户有 ${linked(deleting.id)} 份关联单证。删除客户库资料不会修改历史单证中的客户快照。` : "删除后，新建单证将无法再选择该客户。"}
        confirmLabel="删除客户"
        danger
        onConfirm={() => {
          if (deleting) {
            deleteCustomer(deleting.id);
            toast.success("客户已删除，历史单证快照未改变");
          }
        }}
      />
    </div>
  );
}

function CustomerDrawer({ customer, onChange, onOpenChange, onSave }: { customer: Customer | null; onChange: (customer: Customer) => void; onOpenChange: (open: boolean) => void; onSave: (customer: Customer) => void }) {
  if (!customer) return null;
  const update = (key: keyof Customer, value: unknown) => onChange({ ...customer, [key]: value });
  return (
    <Drawer open={Boolean(customer)} onOpenChange={onOpenChange} title={customer.name ? "编辑客户" : "新增客户"} description="默认语言仅用于新建单证建议，之后仍可修改。">
      <form
        className="drawer-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSave(customer);
        }}
      >
        <section>
          <h3>基础信息</h3>
          <div className="form-grid two">
            <Field label="客户名称" required>
              <Input value={customer.name} onChange={(e) => update("name", e.target.value)} required />
            </Field>
            <Field label="联系人" required>
              <Input value={customer.contact} onChange={(e) => update("contact", e.target.value)} required />
            </Field>
            <Field label="国家 / 地区" required>
              <Input value={customer.country} onChange={(e) => update("country", e.target.value)} required placeholder="例如：西班牙" />
            </Field>
            <Field label="默认单据语言">
              <Select value={customer.defaultLanguage} onChange={(e) => update("defaultLanguage", e.target.value)}>
                {LANGUAGES.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.native}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="邮箱">
              <Input type="email" value={customer.email} onChange={(e) => update("email", e.target.value)} />
            </Field>
            <Field label="电话">
              <Input value={customer.phone} onChange={(e) => update("phone", e.target.value)} />
            </Field>
          </div>
          <Field label="税务或登记信息">
            <Input value={customer.registration} onChange={(e) => update("registration", e.target.value)} />
          </Field>
        </section>
        <section>
          <h3>国际地址</h3>
          <Field label="账单地址">
            <Textarea rows={3} value={customer.billingAddress} onChange={(e) => update("billingAddress", e.target.value)} />
          </Field>
          <Field label="收货地址">
            <Textarea rows={3} value={customer.shippingAddress} onChange={(e) => update("shippingAddress", e.target.value)} />
          </Field>
        </section>
        <div className="dialog-actions">
          <Button type="button" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button type="submit" variant="primary" disabled={!customer.name.trim() || !customer.contact.trim() || !customer.country.trim()}>
            保存客户
          </Button>
        </div>
      </form>
    </Drawer>
  );
}

export function CompanyDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { data, updateCompany } = useStore();
  const [company, setCompany] = useState(data.company);
  const [saved, setSaved] = useState(false);
  const update = (key: keyof typeof company, value: unknown) => {
    setCompany((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };
  return (
    <Drawer open={open} onOpenChange={onOpenChange} title="公司与签署资料" description="新建单证会保存当前公司资料快照；已有单证不会被静默修改。">
      <form
        className="drawer-form"
        onSubmit={(e) => {
          e.preventDefault();
          updateCompany(company);
          setSaved(true);
          toast.success("公司资料已保存，将用于之后新建的单证");
        }}
      >
        <section>
          <h3>
            <Building2 size={17} />
            基本信息
          </h3>
          <Field label="公司中文名称" required>
            <Input value={company.nameZh} onChange={(e) => update("nameZh", e.target.value)} required />
          </Field>
          <Field label="公司英文名称" required>
            <Input value={company.nameEn} onChange={(e) => update("nameEn", e.target.value)} required />
          </Field>
          <Field label="公司地址">
            <Textarea rows={3} value={company.address} onChange={(e) => update("address", e.target.value)} />
          </Field>
          <div className="form-grid two">
            <Field label="电话">
              <Input value={company.phone} onChange={(e) => update("phone", e.target.value)} />
            </Field>
            <Field label="邮箱">
              <Input type="email" value={company.email} onChange={(e) => update("email", e.target.value)} />
            </Field>
            <Field label="网站">
              <Input value={company.website} onChange={(e) => update("website", e.target.value)} />
            </Field>
            <Field label="登记信息">
              <Input value={company.registration} onChange={(e) => update("registration", e.target.value)} />
            </Field>
          </div>
        </section>
        <section>
          <h3>LOGO 与电子印章</h3>
          <Field label="公司 LOGO">
            <ImageUpload value={company.logo} onChange={(value) => update("logo", value)} label="上传公司 LOGO" />
          </Field>
          <Field label="电子印章" hint="印章仅用于单证图像，不等同于法律电子签名。">
            <ImageUpload value={company.stamp} onChange={(value) => update("stamp", value)} label="上传电子印章" />
          </Field>
        </section>
        <section>
          <h3>银行信息</h3>
          <Field label="银行名称">
            <Input value={company.bankName} onChange={(e) => update("bankName", e.target.value)} />
          </Field>
          <div className="form-grid two">
            <Field label="银行账号">
              <Input value={company.bankAccount} onChange={(e) => update("bankAccount", e.target.value)} />
            </Field>
            <Field label="SWIFT">
              <Input value={company.swift} onChange={(e) => update("swift", e.target.value)} />
            </Field>
          </div>
          <Field label="银行地址">
            <Textarea rows={2} value={company.bankAddress} onChange={(e) => update("bankAddress", e.target.value)} />
          </Field>
        </section>
        <div className="dialog-actions">
          <span className="save-inline">{saved ? "已保存" : "仅保存在当前浏览器"}</span>
          <Button type="submit" variant="primary" disabled={!company.nameZh.trim() || !company.nameEn.trim()}>
            保存公司资料
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
