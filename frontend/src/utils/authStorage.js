export const AUTH_SCOPES = {
  USER: "user",
  ADMIN: "admin",
};

const AUTH_STORAGE_KEYS = {
  [AUTH_SCOPES.USER]: {
    token: "user.token",
    role: "user.role",
    userId: "user.userId",
    email: "user.email",
  },
  [AUTH_SCOPES.ADMIN]: {
    token: "admin.token",
    role: "admin.role",
    userId: "admin.userId",
    email: "admin.email",
  },
};

const resolveScope = (scope) => AUTH_STORAGE_KEYS[scope] ? scope : AUTH_SCOPES.USER;

export const getAuthStorageScopeFromPath = (pathname = "") =>
  pathname.startsWith("/admin") ? AUTH_SCOPES.ADMIN : AUTH_SCOPES.USER;

export const getAuthSession = (scope = AUTH_SCOPES.USER) => {
  const currentScope = resolveScope(scope);
  const keys = AUTH_STORAGE_KEYS[currentScope];

  return {
    token: sessionStorage.getItem(keys.token),
    role: sessionStorage.getItem(keys.role),
    userId: sessionStorage.getItem(keys.userId),
    email: sessionStorage.getItem(keys.email),
  };
};

export const setAuthSession = (scope = AUTH_SCOPES.USER, session = {}) => {
  const currentScope = resolveScope(scope);
  const keys = AUTH_STORAGE_KEYS[currentScope];

  if (session.token) {
    sessionStorage.setItem(keys.token, session.token);
  }
  if (session.role) {
    sessionStorage.setItem(keys.role, session.role);
  }
  if (session.userId !== undefined && session.userId !== null) {
    sessionStorage.setItem(keys.userId, String(session.userId));
  }
  if (session.email) {
    sessionStorage.setItem(keys.email, session.email);
  }
};

export const clearAuthSession = (scope = AUTH_SCOPES.USER) => {
  const currentScope = resolveScope(scope);
  const keys = AUTH_STORAGE_KEYS[currentScope];

  Object.values(keys).forEach((key) => sessionStorage.removeItem(key));
};
