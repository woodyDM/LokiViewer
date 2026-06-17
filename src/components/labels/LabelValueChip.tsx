import { useQueryStore } from "../../stores/queryStore";

interface LabelValueChipProps {
  labelName: string;
  labelValue: string;
}

/**
 * Extract label matchers from `{...}` as a map of name → { type, values[] }.
 */
type Matchers = Record<string, { op: "=" | "=~"; values: string[] }>;

function parseMatchers(query: string): Matchers {
  const result: Matchers = {};
  const m = query.match(/\{(.+?)\}/);
  if (!m) return result;
  for (const part of m[1].split(",")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    // Try =~ first, then =
    let eq = trimmed.match(/^(\w+)\s*=\~"(.+)"$/);
    if (eq) {
      const [_, name, vals] = eq;
      if (!result[name]) result[name] = { op: "=~", values: [] };
      result[name].values.push(...vals.split("|"));
      continue;
    }
    eq = trimmed.match(/^(\w+)\s*=\s*"(.+)"$/);
    if (eq) {
      const [_, name, val] = eq;
      if (!result[name]) result[name] = { op: "=", values: [] };
      result[name].values.push(val);
    }
  }
  return result;
}

function rebuildMatchers(matchers: Matchers): string {
  const parts: string[] = [];
  for (const [name, m] of Object.entries(matchers)) {
    if (m.values.length === 0) continue;
    if (m.values.length === 1 || m.op === "=") {
      parts.push(`${name}="${m.values[0]}"`);
    } else {
      parts.push(`${name}=~"${m.values.join("|")}"`);
    }
  }
  if (parts.length === 0) return "";
  return `{${parts.join(", ")}}`;
}

/**
 * Merge label matcher into the query between the {braces}.
 * If the label already has values, switch to =~ (regex OR).
 */
function toggleLabel(query: string, name: string, value: string): string {
  const matchers = parseMatchers(query);

  const current = matchers[name];
  const idx = current ? current.values.indexOf(value) : -1;

  if (idx !== -1) {
    // Remove this value
    current!.values.splice(idx, 1);
    if (current!.values.length === 0) {
      delete matchers[name];
    }
  } else {
    // Add this value
    if (current) {
      // Already has values → switch to regex
      current.op = "=~";
      current.values.push(value);
    } else {
      matchers[name] = { op: "=", values: [value] };
    }
  }

  const rebuilt = rebuildMatchers(matchers);

  // Preserve anything after the braces (pipeline, etc.)
  const after = query.replace(/^.*?\}($|.*)/, "$1").trim();

  if (!rebuilt) return after || "";
  return after ? `${rebuilt} ${after}` : rebuilt;
}

/**
 * Check if a label value is active (in equality `=` or regex `=~` match).
 */
function isLabelInQuery(query: string, name: string, value: string): boolean {
  const matchers = parseMatchers(query);
  const m = matchers[name];
  if (!m) return false;
  return m.values.includes(value);
}

export function LabelValueChip({ labelName, labelValue }: LabelValueChipProps) {
  const currentQuery = useQueryStore((s) => s.currentQuery);
  const setQuery = useQueryStore((s) => s.setQuery);

  const isActive = isLabelInQuery(currentQuery, labelName, labelValue);

  const handleClick = () => {
    setQuery(toggleLabel(currentQuery, labelName, labelValue));
  };

  return (
    <button
      onClick={handleClick}
      className={isActive ? "chip-active" : "chip"}
      title={`${isActive ? "移除" : "添加"} ${labelName}="${labelValue}"`}
    >
      <span className="text-text-muted">{labelName}=</span>
      <span className={isActive ? "text-accent" : "text-text-primary"}>&quot;{labelValue}&quot;</span>
    </button>
  );
}
