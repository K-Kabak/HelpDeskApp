export function parseMultiParam(value?: string | string[] | null) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function appendMultiParam(params: URLSearchParams, key: string, values: string[]) {
  params.delete(key);
  values.filter(Boolean).forEach((value) => params.append(key, value));
}
