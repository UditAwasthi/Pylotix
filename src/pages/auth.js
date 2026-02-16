const API_BASE = "http://localhost:5500";

const auth = {
  getHeaders: () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  }),

  setSession: (data) => {
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("user", JSON.stringify(data.user));
  },

  logout: async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: { "x-refresh-token": refreshToken },
      });
    } finally {
      localStorage.clear();
      window.location.href = "signin.html";
    }
  },

  refreshToken: async () => {
    const refresh = localStorage.getItem("refreshToken");
    if (!refresh) return null;

    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "x-refresh-token": refresh },
    });

    if (!res.ok) {
      await auth.logout();
      return null;
    }

    const data = await res.json();
    localStorage.setItem("accessToken", data.accessToken);
    return data.accessToken;
  },

  /* ================================
     🔐 CENTRALIZED AUTH FETCH
  ================================ */
  authFetch: async (url, options = {}) => {
    const accessToken = localStorage.getItem("accessToken");

    let res = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // 🔁 Token expired → refresh
    if (res.status === 401) {
      const newAccessToken = await auth.refreshToken();
      if (!newAccessToken) throw new Error("Session expired");

      res = await fetch(url, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${newAccessToken}`,
        },
      });
    }

    return res;
  },
};

export default auth;
