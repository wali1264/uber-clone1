import { query, run } from "./db";

export const SettingsService = {
  getSetting(key: string): string | null {
    const res = query("SELECT value FROM app_settings WHERE key = ?", [key]);
    if (res.length > 0) {
      return res[0].value;
    }
    return null;
  },

  async setSetting(key: string, value: string) {
    const res = query("SELECT value FROM app_settings WHERE key = ?", [key]);
    if (res.length === 0) {
      await run("INSERT INTO app_settings (key, value) VALUES (?, ?)", [key, value]);
    } else {
      await run("UPDATE app_settings SET value = ? WHERE key = ?", [value, key]);
    }
  },

  isUpdateLocked(): boolean {
    const lock = this.getSetting('update_lock');
    return lock === '1';
  },

  async unlockUpdate(code: string): Promise<boolean> {
    const correctCode = this.getSetting('update_code');
    if (code === correctCode) {
      await this.setSetting('update_lock', '0');
      return true;
    }
    return false;
  }
};
