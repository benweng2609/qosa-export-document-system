import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Archive, ArchiveRestore, Copy, Download, FilePenLine, FilePlus2, MoreHorizontal, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DOCUMENT_TYPES, documentTotal, formatMoney, getDocumentType, getLanguage } from "../data";
import { useStore } from "../store";
import type { TradeDocument } from "../types";
import { Button, ConfirmDialog, EmptyState, Field, Input, Modal, Select, StatusBadge } from "../components/ui";
import { usePdfDownload } from "../hooks/use-pdf-download";
import { isSpecialDocumentType } from "../export-forms";

export default function Documents({ onNew, onOpen }: { onNew: () => void; onOpen: (doc: TradeDocument) => void }) {
  const { data, duplicateDocument, archiveDocument, deleteDocument, updateDocument } = useStore();
  const { download, downloadingId } = usePdfDownload();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [customer, setCustomer] = useState("all");
  const [renameDoc, setRenameDoc] = useState<TradeDocument | null>(null);
  const [deleteDoc, setDeleteDoc] = useState<TradeDocument | null>(null);
  const [title, setTitle] = useState("");

  const filtered = useMemo(
    () =>
      data.documents
        .filter((doc) => {
          const matchesQuery = `${doc.number}${doc.title}${doc.customerSnapshot?.name ?? ""}`.toLowerCase().includes(query.toLowerCase());
          return matchesQuery && (type === "all" || doc.type === type) && (status === "all" || doc.status === status) && (customer === "all" || doc.customerSnapshot?.id === customer);
        })
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [data.documents, query, type, status, customer],
  );
  const hasFilters = Boolean(query || type !== "all" || status !== "all" || customer !== "all");
  const clear = () => {
    setQuery("");
    setType("all");
    setStatus("all");
    setCustomer("all");
  };

  const actions = (doc: TradeDocument) => (
    <div className="row-actions">
      <Button size="sm" variant="ghost" onClick={() => onOpen(doc)}>
        <FilePenLine size={15} />
        编辑
      </Button>
      <Button size="sm" variant="ghost" disabled={downloadingId === doc.id} onClick={() => download(doc)}>
        <Download size={15} />
        {downloadingId === doc.id ? "生成中" : "下载"}
      </Button>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button size="sm" variant="ghost" aria-label={`${doc.number} 更多操作`}>
            <MoreHorizontal size={17} />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className="dropdown-content" align="end">
            <DropdownMenu.Item
              onSelect={() => {
                const copy = duplicateDocument(doc.id);
                if (copy) toast.success(`已复制为 ${copy.number}`);
              }}
            >
              <Copy size={15} />
              复制为新单证
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onSelect={() => {
                setRenameDoc(doc);
                setTitle(doc.title);
              }}
            >
              <FilePenLine size={15} />
              重命名
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onSelect={() => {
                archiveDocument(doc.id);
                toast.success(doc.status === "archived" ? "已恢复为草稿" : "单证已归档");
              }}
            >
              {doc.status === "archived" ? <ArchiveRestore size={15} /> : <Archive size={15} />}
              {doc.status === "archived" ? "恢复为草稿" : "归档"}
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item className="danger-item" onSelect={() => setDeleteDoc(doc)}>
              <Trash2 size={15} />
              删除单证
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );

  return (
    <div className="page documents-page">
      <div className="page-heading">
        <div>
          <h1>单证管理</h1>
          <p>查找、继续编辑或下载已有单证。历史单证保存独立资料快照。</p>
        </div>
        <Button variant="primary" onClick={onNew}>
          <FilePlus2 size={17} />
          新建单证
        </Button>
      </div>
      <div className="filter-bar">
        <div className="search-box">
          <Search size={16} />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索编号、名称或客户" aria-label="搜索全部单证" />
        </div>
        <Select value={type} onChange={(e) => setType(e.target.value)} aria-label="按单据类型筛选">
          <option value="all">全部类型</option>
          {DOCUMENT_TYPES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="按状态筛选">
          <option value="all">全部状态</option>
          <option value="draft">草稿</option>
          <option value="completed">已完成 / 资料已备齐</option>
          <option value="archived">已归档</option>
        </Select>
        <Select value={customer} onChange={(e) => setCustomer(e.target.value)} aria-label="按客户筛选">
          <option value="all">全部客户</option>
          {data.customers.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </Select>
        {hasFilters && (
          <Button variant="ghost" onClick={clear}>
            清除筛选
          </Button>
        )}
      </div>
      <div className="list-summary">
        <span>共 {filtered.length} 份单证</span>
        <span>数据保存在当前浏览器</span>
      </div>
      <div className="data-table-wrap document-table">
        <table className="data-table">
          <thead>
            <tr>
              <th>单证编号</th>
              <th>类型</th>
              <th>客户</th>
              <th>语言</th>
              <th>金额 / 件数</th>
              <th>更新时间</th>
              <th>状态</th>
              <th>
                <span className="sr-only">操作</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((doc) => (
              <tr key={doc.id}>
                <td>
                  <button className="table-primary-link" onClick={() => onOpen(doc)}>
                    {doc.number}
                  </button>
                  <small>{doc.title}</small>
                </td>
                <td>{getDocumentType(doc.type).name}</td>
                <td>{doc.customerSnapshot?.name ?? "—"}</td>
                <td>{getLanguage(doc.language).native}</td>
                <td className="numeric">{isSpecialDocumentType(doc.type) ? "—" : doc.type === "packing" ? `${doc.items.reduce((s, i) => s + i.packageCount, 0)} 箱` : formatMoney(documentTotal(doc), doc.currency)}</td>
                <td>{new Date(doc.updatedAt).toLocaleDateString("zh-CN")}</td>
                <td>
                  <StatusBadge status={doc.status} ready={isSpecialDocumentType(doc.type)} />
                </td>
                <td>{actions(doc)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mobile-document-list">
        {filtered.map((doc) => (
          <article className="mobile-document-card" key={doc.id}>
            <div className="mobile-doc-top">
              <button onClick={() => onOpen(doc)}>{doc.number}</button>
              <StatusBadge status={doc.status} ready={isSpecialDocumentType(doc.type)} />
            </div>
            <p>
              {doc.customerSnapshot?.name ?? "未指定客户"} · {getDocumentType(doc.type).name}
            </p>
            <div className="mobile-doc-meta">
              <strong>{isSpecialDocumentType(doc.type) ? "专用资料单" : doc.type === "packing" ? `${doc.items.reduce((s, i) => s + i.packageCount, 0)} 箱` : formatMoney(documentTotal(doc), doc.currency)}</strong>
              <span>
                {getLanguage(doc.language).native} · {new Date(doc.updatedAt).toLocaleDateString("zh-CN")}
              </span>
            </div>
            {actions(doc)}
          </article>
        ))}
      </div>
      {!filtered.length && (
        <EmptyState
          title={hasFilters ? "没有符合条件的单证" : "还没有单证"}
          description={hasFilters ? "调整关键词或筛选条件后再试。" : "从已有客户和商品资料创建第一份单证。"}
          action={
            hasFilters ? (
              <Button onClick={clear}>清除筛选</Button>
            ) : (
              <Button variant="primary" onClick={onNew}>
                新建单证
              </Button>
            )
          }
        />
      )}

      <Modal open={Boolean(renameDoc)} onOpenChange={(open) => !open && setRenameDoc(null)} title="重命名单证" description={renameDoc?.number}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!renameDoc || !title.trim()) return;
            updateDocument({ ...renameDoc, title: title.trim() });
            setRenameDoc(null);
            toast.success("单证名称已更新");
          }}
        >
          <Field label="单证名称" required>
            <Input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={100} />
          </Field>
          <div className="dialog-actions">
            <Button type="button" onClick={() => setRenameDoc(null)}>
              取消
            </Button>
            <Button type="submit" variant="primary" disabled={!title.trim()}>
              保存名称
            </Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog
        open={Boolean(deleteDoc)}
        onOpenChange={(open) => !open && setDeleteDoc(null)}
        title="删除这份单证？"
        description={`${deleteDoc?.number ?? ""} 将从当前浏览器中永久删除，已下载的 PDF 不受影响。`}
        confirmLabel="永久删除"
        danger
        onConfirm={() => {
          if (deleteDoc) {
            deleteDocument(deleteDoc.id);
            toast.success("单证已删除");
          }
        }}
      />
    </div>
  );
}
