/** Call the backend JSON API, throwing an Error with the server's detail on failure. */
export async function api<T>(path: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const { json, ...rest } = init ?? {};
  const res = await fetch(path, {
    ...rest,
    credentials: "same-origin",
    headers: json === undefined ? rest.headers : { "Content-Type": "application/json", ...rest.headers },
    body: json === undefined ? rest.body : JSON.stringify(json),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const detail = typeof body.detail === "string" ? body.detail : "Request failed";
    throw new Error(detail);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}
