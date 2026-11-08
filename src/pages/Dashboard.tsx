import { ArrowRight, ChevronRight, Clock3, FilePlus2, FileText, HardDrive, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { DOCUMENT_TYPES, documentTotal, formatMoney, getDocumentType, getLanguage } from "../data";
import { useStore } from "../store";
import type { AppView, DocumentType, TradeDocument } from "../types";
import { Badge, Button, EmptyState, Input, StatusBadge } from "../components/ui";
import { QOSA_LOGO } from "../branding";

export default function Dashboard({ onNew, onOpen, onNavigate }: { onNew: (type?: DocumentType) => void; onOpen: (doc: TradeDocument) => void; onNavigate: (view: AppView) => void }) {
  const { data, storageError } = useStore();
  const [query, setQuery] = useState("");
  const activeDocs = useMemo(() => data.documents.filter((doc) => doc.status !== "archived").sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)), [data.documents]);
  const recent = activeDocs.filter((doc) => `${doc.number}${doc.title}${doc.customerSnapshot?.name ?? ""}`.toLowerCase().includes(query.toLowerCase())).slice(0, 6);
  const latest = activeDocs[0];

  return (
    <div className="page dashboard-page">
      <div className="page-heading dashboard-heading">
        <div>
          <h1 className="dashboard-brand">
            <img src={QOSA_LOGO} alt="QOSA" />
            <span className="sr-only">工作台</span>
          </h1>
          <p>继续处理单证，或从已有资料快速新建。</p>
        </div>
        <Button variant="primary" size="lg" onClick={() => onNew()}>
          <FilePlus2 size={18} />
          新建单证
        </Button>
      </div>
      {storageError && (
        <div className="notice notice-error">
          <HardDrive size={18} />
          <div>
            <strong>保存失败</strong>
            <p>{storageError}</p>
          </div>
        </div>
      )}

      {latest ? (
        <section className="continue-panel" aria-labelledby="continue-title">
          <div className="continue-icon">
            <FileText size={24} />
          </div>
          <div className="continue-copy">
            <span className="continue-label" id="continue-title">
              继续编辑
            </span>
            <button onClick={() => onOpen(latest)}>{latest.number}</button>
            <p>
              {latest.customerSnapshot?.name ?? "未指定客户"} · {getDocumentType(latest.type).name} · {getLanguage(latest.language).native}
            </p>
          </div>
          <div className="continue-time">
            <Clock3 size={15} />
            <span>
              最近保存{" "}
              {new Date(latest.updatedAt).toLocaleString("zh-CN", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <Button variant="primary" onClick={() => onOpen(latest)}>
            继续
            <ArrowRight size={16} />
          </Button>
        </section>
      ) : (
        <EmptyState
          title="从第一份单证开始"
          description="先选择单据类型，再复用客户和商品资料。"
          action={
            <Button variant="primary" onClick={() => onNew()}>
              新建单证
            </Button>
          }
        />
      )}

      <section className="quick-section">
        <div className="section-heading">
          <div>
            <h2>快速新建</h2>
            <p>共同资料会自动带入，切换类型不需要重新录入。</p>
          </div>
        </div>
        <div className="document-type-grid">
          {DOCUMENT_TYPES.map((type) => (
            <button key={type.id} className="document-type-card" onClick={() => onNew(type.id)}>
              <div className={`type-miniature type-${type.id}`}>
                <span>{type.short}</span>
                <i />
                <i />
                <i />
              </div>
              <div>
                <strong>{type.name}</strong>
                <span>{type.en}</span>
                <p>{type.description}</p>
              </div>
              <ChevronRight size={17} />
            </button>
          ))}
        </div>
      </section>

      <section className="recent-section">
        <div className="section-heading">
          <div>
            <h2>最近单证</h2>
            <p>演示企业与交易均为虚构数据。</p>
          </div>
          <Button variant="ghost" onClick={() => onNavigate("documents")}>
            查看全部
            <ArrowRight size={15} />
          </Button>
        </div>
        <div className="table-toolbar compact">
          <div className="search-box">
            <Search size={16} />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索单证编号、名称或客户" aria-label="搜索最近单证" />
          </div>
        </div>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>单证名称</th>
                <th>类型</th>
                <th>客户</th>
                <th>金额</th>
                <th>状态</th>
                <th>
                  <span className="sr-only">操作</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {recent.map((doc) => (
                <tr key={doc.id}>
                  <td>
                    <button className="table-primary-link" onClick={() => onOpen(doc)}>
                      {doc.number}
                    </button>
                    <small>{doc.title}</small>
                  </td>
                  <td>
                    <Badge tone="blue">{getDocumentType(doc.type).name}</Badge>
                  </td>
                  <td>{doc.customerSnapshot?.name ?? "—"}</td>
                  <td className="numeric">{doc.type === "packing" ? `${doc.items.reduce((s, i) => s + i.packageCount, 0)} 箱` : formatMoney(documentTotal(doc), doc.currency)}</td>
                  <td>
                    <StatusBadge status={doc.status} />
                  </td>
                  <td className="align-right">
                    <Button size="sm" variant="ghost" onClick={() => onOpen(doc)}>
                      编辑
                      <ChevronRight size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!recent.length && <EmptyState title="没有匹配的单证" description="换一个关键词，或清除搜索后再试。" action={<Button onClick={() => setQuery("")}>清除搜索</Button>} />}
        </div>
      </section>
      <div className="local-note">
        <HardDrive size={16} />
        <span>资料仅保存在当前浏览器。清除浏览器数据会删除本地内容，请定期下载 PDF 留存。</span>
      </div>
    </div>
  );
}
