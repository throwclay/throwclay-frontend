// src/lib/server/auth.ts

export function getBearerToken(req: Request): string | null {
  const authHeader =
    req.headers.get("authorization") || req.headers.get("Authorization");
  if (!authHeader) return null;
  const [scheme, value] = authHeader.split(" ");
  if (!scheme || scheme.toLowerCase() !== "bearer" || !value) return null;
  return value;
}
