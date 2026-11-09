import * as Dialog from "@radix-ui/react-dialog";
import { X, UploadCloud, FileImage, AlertCircle } from "lucide-react";
import { useRef, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

export function Button({
  variant = "secondary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}) {
  return (
    <button className={`btn btn-${variant} btn-${size} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function IconButton({
  label,
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  children: ReactNode;
}) {
  return (
    <button className={`icon-btn ${className}`} aria-label={label} title={label} {...props}>
      {children}
    </button>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "blue" | "green" | "amber" | "red" }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function Field({ label, hint, error, required, children, className = "" }: { label: string; hint?: string; error?: string; required?: boolean; children: ReactNode; className?: string }) {
  return (
    <label className={`field ${className}`}>
      <span className="field-label">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </span>
      {children}
      {error ? (
        <span className="field-error">
          <AlertCircle size={13} />
          {error}
        </span>
      ) : hint ? (
        <span className="field-hint">{hint}</span>
      ) : null}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="input" {...props} />;
}
export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="input textarea" {...props} />;
}
export function Select({ children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className="input select" {...props}>
      {children}
    </select>
  );
}

export function Modal({ open, onOpenChange, title, description, children, wide = false }: { open: boolean; onOpenChange: (open: boolean) => void; title: string; description?: string; children: ReactNode; wide?: boolean }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className={`dialog-content ${wide ? "dialog-wide" : ""}`}>
          <div className="dialog-heading">
            <div>
              <Dialog.Title>{title}</Dialog.Title>
              {description && <Dialog.Description>{description}</Dialog.Description>}
            </div>
            <Dialog.Close asChild>
              <IconButton label="关闭">
                <X size={19} />
              </IconButton>
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function Drawer({ open, onOpenChange, title, description, children, wide = false }: { open: boolean; onOpenChange: (open: boolean) => void; title: string; description?: string; children: ReactNode; wide?: boolean }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className={`drawer-content ${wide ? "drawer-wide" : ""}`}>
          <div className="dialog-heading">
            <div>
              <Dialog.Title>{title}</Dialog.Title>
              {description && <Dialog.Description>{description}</Dialog.Description>}
            </div>
            <Dialog.Close asChild>
              <IconButton label="关闭">
                <X size={19} />
              </IconButton>
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel = "确认", onConfirm, danger = false }: { open: boolean; onOpenChange: (open: boolean) => void; title: string; description: string; confirmLabel?: string; onConfirm: () => void; danger?: boolean }) {
  return (
    <Modal open={open} onOpenChange={onOpenChange} title={title} description={description}>
      <div className="dialog-actions">
        <Button onClick={() => onOpenChange(false)}>取消</Button>
        <Button
          variant={danger ? "danger" : "primary"}
          onClick={() => {
            onConfirm();
            onOpenChange(false);
          }}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

export function ImageUpload({ value, onChange, label = "上传图片", hint = "PNG 或 JPG，建议透明背景，不超过 400 KB" }: { value?: string; onChange: (value?: string) => void; label?: string; hint?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const read = (file?: File) => {
    if (!file) return;
    setError("");
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError("文件格式不支持，请选择 PNG、JPG 或 WebP 图片。");
      return;
    }
    if (file.size > 400 * 1024) {
      setError("图片超过 400 KB，请压缩后重试，以免占满浏览器本地空间。");
      return;
    }
    setLoading(true);
    const reader = new FileReader();
    reader.onload = () => {
      onChange(String(reader.result));
      setLoading(false);
    };
    reader.onerror = () => {
      setError(`无法读取 ${file.name}，请重新选择文件。`);
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };
  return (
    <div className="upload-wrap">
      {value ? (
        <div className="upload-preview">
          <img src={value} alt="已上传图片预览" />
          <div>
            <Button size="sm" onClick={() => inputRef.current?.click()}>
              替换图片
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onChange(undefined)}>
              移除
            </Button>
          </div>
        </div>
      ) : (
        <button type="button" className="upload-drop" onClick={() => inputRef.current?.click()} disabled={loading}>
          <UploadCloud size={22} />
          <strong>{loading ? "正在读取图片…" : label}</strong>
          <span>{hint}</span>
        </button>
      )}
      {error && (
        <p className="field-error">
          <AlertCircle size={14} />
          {error}
        </p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        hidden
        onChange={(event) => {
          read(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
    </div>
  );
}

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="empty-state">
      {icon ?? <FileImage size={28} />}
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function StatusBadge({ status, ready = false }: { status: "draft" | "completed" | "archived"; ready?: boolean }) {
  const map = {
    draft: ["草稿", "amber"],
    completed: [ready ? "资料已备齐" : "已完成", "green"],
    archived: ["已归档", "neutral"],
  } as const;
  return <Badge tone={map[status][1]}>{map[status][0]}</Badge>;
}
