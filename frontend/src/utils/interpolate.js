/**
 * Replace {{var}} placeholders. Repeats until stable for nested patterns.
 */
export function interpolateString(str, variables) {
  if (str == null) return str;
  let out = String(str);
  const maxPasses = 10;
  for (let i = 0; i < maxPasses; i++) {
    const next = out.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, rawKey) => {
      const key = String(rawKey).trim();
      if (Object.prototype.hasOwnProperty.call(variables, key) && variables[key] != null) {
        return String(variables[key]);
      }
      return `{{${key}}}`;
    });
    if (next === out) break;
    out = next;
  }
  return out;
}

export function interpolateValue(value, variables) {
  if (typeof value === 'string') return interpolateString(value, variables);
  if (Array.isArray(value)) {
    return value.map((v) => interpolateValue(v, variables));
  }
  if (value && typeof value === 'object') {
    const o = {};
    for (const [k, v] of Object.entries(value)) {
      o[k] = interpolateValue(v, variables);
    }
    return o;
  }
  return value;
}

export function buildVariableMap(environments, activeId) {
  const env =
    environments.find((e) => String(e._id) === String(activeId)) || environments.find((e) => e.isActive);
  const map = {};
  if (env?.variables) {
    for (const v of env.variables) {
      if (v.enabled !== false && v.key) map[v.key] = v.value ?? '';
    }
  }
  return map;
}
