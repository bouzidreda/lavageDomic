type Tokens = { accessToken: string; refreshToken: string };

class AuthStore {
  private accessToken: string | null = localStorage.getItem("accessToken");
  private refreshToken: string | null = localStorage.getItem("refreshToken");

  getAccessToken() { return this.accessToken; }
  getRefreshToken() { return this.refreshToken; }

  setTokens(t: Tokens) {
    this.accessToken = t.accessToken;
    this.refreshToken = t.refreshToken;
    localStorage.setItem("accessToken", t.accessToken);
    localStorage.setItem("refreshToken", t.refreshToken);
  }

  clear() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }

  isAuthed() { return !!this.accessToken; }
}

export const authStore = new AuthStore();
