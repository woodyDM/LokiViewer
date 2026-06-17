import { useState } from "react";
import { Dialog } from "../shared/Dialog";
import { useSourcesStore } from "../../stores/sourcesStore";

interface SourceFormProps {
  open: boolean;
  onClose: () => void;
}

export function SourceForm({ open, onClose }: SourceFormProps) {
  const addSource = useSourcesStore((s) => s.addSource);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;

    setSaving(true);
    setError(null);
    try {
      await addSource(
        name.trim(),
        url.trim(),
        tenantId.trim() || undefined,
        username.trim() || undefined,
        password || undefined,
      );
      setName("");
      setUrl("");
      setTenantId("");
      setUsername("");
      setPassword("");
      onClose();
    } catch (e) {
      setError(String(e));
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onClose={onClose} title="添加 Loki 数据源">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs text-text-secondary mb-1">名称 *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如: 生产环境 Loki"
            className="w-full"
            required
          />
        </div>

        <div>
          <label className="block text-xs text-text-secondary mb-1">URL *</label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="例如: http://loki:3100"
            className="w-full"
            required
          />
        </div>

        <div>
          <label className="block text-xs text-text-secondary mb-1">
            Tenant ID (可选)
          </label>
          <input
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            placeholder="X-Scope-OrgID"
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-text-secondary mb-1">
              用户名 (可选)
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Basic Auth"
              className="w-full"
              autoComplete="off"
            />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1">
              密码 (可选)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="密码"
              className="w-full"
              autoComplete="off"
            />
          </div>
        </div>

        {error && (
          <div className="text-xs text-log-error bg-log-error/10 rounded px-2 py-1">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs rounded text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={saving || !name.trim() || !url.trim()}
            className="px-3 py-1.5 text-xs font-medium rounded bg-accent/20 text-accent hover:bg-accent/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "保存中..." : "保存"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
