import { useState } from "react";
import { Building2, ChevronRight, CircleHelp, FilePlus2, Files, HardDrive, LayoutDashboard, LayoutTemplate, Menu, Package, PanelLeftClose, PanelLeftOpen, UsersRound, X } from "lucide-react";
import { Toaster } from "sonner";
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import NewDocument from "./pages/NewDocument";
import Editor from "./pages/Editor";
import TemplatesPage from "./pages/Templates";
import { CompanyDrawer, CustomersPage, ProductsPage } from "./pages/Libraries";
import type { AppView, DocumentType, TradeDocument } from "./types";
import { Button, IconButton, Modal } from "./components/ui";
import { useStore } from "./store";

const navigation = [
  { id: "dashboard" as const, label: "工作台", icon: LayoutDashboard },
  { id: "documents" as const, label: "单证管理", icon: Files },
  { id: "products" as const, label: "产品库", icon: Package },
  { id: "customers" as const, label: "客户管理", icon: UsersRound },
  { id: "templates" as const, label: "单证模板", icon: LayoutTemplate },
];

const viewNames: Record<AppView, string> = {
  dashboard: "工作台",
  documents: "单证管理",
  products: "产品库",
  customers: "客户管理",
  templates: "单证模板",
  new: "新建单证",
  editor: "单证编辑器",
};

export default function App() {
  const [view, setView] = useState<AppView>("dashboard");
  const [documentId, setDocumentId] = useState("");
  const [newType, setNewType] = useState<DocumentType>("quotation");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const { storageError } = useStore();

  const navigate = (next: AppView) => {
    setView(next);
    setMobileNav(false);
  };
  const startNew = (type: DocumentType = "quotation") => {
    setNewType(type);
    navigate("new");
  };
  const openDocument = (doc: TradeDocument) => {
    setDocumentId(doc.id);
    navigate("editor");
  };

  if (view === "editor")
    return (
      <>
        <Editor key={documentId} docId={documentId} onBack={() => navigate("documents")} />
        {companyOpen && <CompanyDrawer open={companyOpen} onOpenChange={setCompanyOpen} />}
        <Toaster position="top-center" richColors closeButton />
      </>
    );

  return (
    <div className={`app-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
      {mobileNav && <button className="mobile-nav-backdrop" aria-label="关闭导航" onClick={() => setMobileNav(false)} />}
      <aside className={`app-sidebar ${mobileNav ? "mobile-open" : ""}`}>
        <div className="brand">
          <span className="brand-mark">
            <Files size={22} />
          </span>
          <div>
            <strong>外贸单证系统</strong>
            <small>Trade Documents</small>
          </div>
          <IconButton label="关闭导航" className="mobile-nav-close" onClick={() => setMobileNav(false)}>
            <X size={19} />
          </IconButton>
        </div>
        <div className="sidebar-new">
          <Button variant="primary" onClick={() => startNew()}>
            <FilePlus2 size={17} />
            <span>新建单证</span>
          </Button>
        </div>
        <nav className="main-nav" aria-label="主导航">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => navigate(item.id)} title={collapsed ? item.label : undefined}>
                <Icon size={19} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <button onClick={() => setCompanyOpen(true)} title={collapsed ? "公司资料" : undefined}>
            <Building2 size={19} />
            <span>公司资料</span>
          </button>
          <button className="collapse-button" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            <span>{collapsed ? "" : "折叠导航"}</span>
          </button>
        </div>
      </aside>
      <div className="app-main">
        <header className="app-topbar">
          <div className="topbar-left">
            <IconButton label="打开导航" className="mobile-menu" onClick={() => setMobileNav(true)}>
              <Menu size={20} />
            </IconButton>
            <div className="breadcrumb">
              <span>外贸单证系统</span>
              <ChevronRight size={14} />
              <strong>{viewNames[view]}</strong>
            </div>
          </div>
          <div className="topbar-actions">
            <span className={`local-storage-badge ${storageError ? "error" : ""}`}>
              <HardDrive size={14} />
              {storageError ? "本地保存失败" : "本地保存"}
            </span>
            <IconButton label="使用帮助" onClick={() => setHelpOpen(true)}>
              <CircleHelp size={19} />
            </IconButton>
          </div>
        </header>
        <main className="app-content">
          {view === "dashboard" && <Dashboard onNew={startNew} onOpen={openDocument} onNavigate={navigate} />}
          {view === "documents" && <Documents onNew={() => startNew()} onOpen={openDocument} />}
          {view === "products" && <ProductsPage />}
          {view === "customers" && <CustomersPage />}
          {view === "templates" && <TemplatesPage onNew={startNew} />}
          {view === "new" && <NewDocument key={newType} initialType={newType} onCancel={() => navigate("dashboard")} onCreated={openDocument} />}
        </main>
      </div>
      {companyOpen && <CompanyDrawer open={companyOpen} onOpenChange={setCompanyOpen} />}
      <Modal open={helpOpen} onOpenChange={setHelpOpen} title="核心制单流程" description="首版聚焦资料复用、实时预览和 PDF 下载。">
        <ol className="help-steps">
          <li>
            <span>1</span>
            <div>
              <strong>完善可复用资料</strong>
              <p>维护公司、客户和商品信息；产品可用 Excel／CSV 批量导入，模板包可在单证模板中导入。</p>
            </div>
          </li>
          <li>
            <span>2</span>
            <div>
              <strong>三步新建单证</strong>
              <p>选择九类单据之一，按需带入客户、货物与船运资料，再确认编号、语言和配色。</p>
            </div>
          </li>
          <li>
            <span>3</span>
            <div>
              <strong>编辑、预览并下载</strong>
              <p>切换类型不会清空共同资料；PDF 与 A4 预览使用同一份数据。</p>
            </div>
          </li>
        </ol>
        <div className="form-note">
          <HardDrive size={16} />
          <p>所有资料仅保存在当前浏览器，不会同步到其他设备。清除浏览器数据前，请导出产品和模板，并下载需要保留的 PDF；历史单证暂无整包备份。</p>
        </div>
        <div className="dialog-actions">
          <Button variant="primary" onClick={() => setHelpOpen(false)}>
            开始使用
          </Button>
        </div>
      </Modal>
      <Toaster position="top-center" richColors closeButton />
    </div>
  );
}
