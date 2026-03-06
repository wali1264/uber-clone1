import { query, run } from "./db";

export const MASTER_PASSWORD = "M0796606605";

export const AuthService = {
  async login(password: string): Promise<boolean> {
    if (password === MASTER_PASSWORD) return true;
    
    const res = query("SELECT admin_password FROM settings WHERE id = 1");
    if (res.length > 0 && res[0].admin_password === password) {
      return true;
    }
    
    // If no password set yet, and it's not master, fail? 
    // Or maybe allow setup? For now, strict check.
    return false;
  },

  async setPassword(newPassword: string) {
    const res = query("SELECT id FROM settings WHERE id = 1");
    if (res.length === 0) {
      await run("INSERT INTO settings (id, admin_password) VALUES (1, ?)", [newPassword]);
    } else {
      await run("UPDATE settings SET admin_password = ? WHERE id = 1", [newPassword]);
    }
  },

  async hasUserPassword(): Promise<boolean> {
    const res = query("SELECT admin_password FROM settings WHERE id = 1");
    return res.length > 0 && !!res[0].admin_password;
  }
};
