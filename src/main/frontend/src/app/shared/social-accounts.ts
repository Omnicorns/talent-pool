import { TalentProfileDetails } from '../core/models/talent.models';

export const MAX_EXTRA_SOCIAL = 2;

/** Semua media sosial yang terisi (utama lebih dulu), mis. ["Instagram: @aloy", "TikTok: @aloy"]. */
export function socialList(details: TalentProfileDetails | null | undefined): string[] {
  if (!details) return [];
  const all = [{ platform: details.socialPlatform, username: details.socialUsername }, ...(details.socialAccounts || [])];
  return all
    .filter((item) => (item.platform || '').trim() && (item.username || '').trim())
    .map((item) => `${item.platform.trim()}: ${item.username.trim()}`);
}

/** Buang baris tambahan yang kosong sebelum validasi/simpan. */
export function cleanSocial(details: TalentProfileDetails): void {
  details.socialAccounts = (details.socialAccounts || [])
    .map((item) => ({ platform: (item.platform || '').trim(), username: (item.username || '').trim() }))
    .filter((item) => item.platform || item.username)
    .slice(0, MAX_EXTRA_SOCIAL);
}

/** Pesan galat untuk media sosial tambahan, atau '' bila valid. Media sosial utama divalidasi terpisah. */
export function socialError(details: TalentProfileDetails): string {
  const seen = new Set([(details.socialPlatform || '').trim().toLowerCase()]);
  for (const item of details.socialAccounts || []) {
    if (!item.platform || !item.username) return 'Media sosial tambahan harus berisi platform dan username.';
    const key = item.platform.toLowerCase();
    if (seen.has(key)) return 'Platform media sosial tidak boleh sama.';
    seen.add(key);
  }
  return '';
}
