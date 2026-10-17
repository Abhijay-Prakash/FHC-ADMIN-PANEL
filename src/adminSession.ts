interface AdminTokenPayload {
  role?: string;
  exp?: number;
}

export function getAdminTokenPayload(): AdminTokenPayload | null {
  const token = localStorage.getItem('authToken');
  if (!token) return null;

  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return null;
    const normalizedPayload = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, '=');
    const payload = JSON.parse(window.atob(paddedPayload)) as AdminTokenPayload;
    if (payload.role !== 'admin' || typeof payload.exp !== 'number' || payload.exp * 1000 <= Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function hasAdminSession(): boolean {
  return getAdminTokenPayload() !== null;
}

export function clearAdminSession(): void {
  localStorage.removeItem('authToken');
}
