const ADMIN_AUTH_KEY = "internarea_admin_authenticated";

export const isAdminAuthenticated = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return localStorage.getItem(ADMIN_AUTH_KEY) === "true";
};

export const setAdminAuthenticated = () => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(ADMIN_AUTH_KEY, "true");
  window.dispatchEvent(new Event("admin-auth-change"));
};

export const clearAdminAuthenticated = () => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(ADMIN_AUTH_KEY);
  window.dispatchEvent(new Event("admin-auth-change"));
};
