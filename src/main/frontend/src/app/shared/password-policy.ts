/** Aturan password kandidat. Cerminan dari PasswordPolicy.java di backend (server tetap memeriksa ulang). */
export const PASSWORD_MIN_LENGTH = 10;

const COMMON = new Set([
  'password', 'password1', 'password12', 'password123', 'password1234', 'passw0rd', 'p@ssw0rd', 'p@ssword', 'pa55word',
  'qwerty', 'qwerty123', 'qwertyuiop', 'qwerty12345', 'asdfghjkl', 'zxcvbnm', '1q2w3e4r', '1qaz2wsx', 'abc123', 'abcd1234',
  '123456', '1234567', '12345678', '123456789', '1234567890', '0123456789', '111111', '000000', '123123', '123321',
  'iloveyou', 'admin', 'admin123', 'administrator', 'welcome', 'welcome1', 'welcome123', 'letmein', 'monkey', 'dragon',
  'sarinah', 'sarinah123', 'sarinah1234', 'sarinah2024', 'sarinah2025', 'sarinah2026', 'talentpool', 'talentpool123',
  'indonesia', 'indonesia123', 'bismillah', 'bismillah123', 'rahasia', 'rahasia123', 'kucing123', 'sayangku', 'sayang123',
  'jakarta123', 'bandung123', 'surabaya123', 'malang123', 'bali123',
]);

const compactOf = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

export interface PasswordCheck { id: string; label: string; ok: boolean; }

export interface PasswordReport {
  checks: PasswordCheck[];
  /** Pesan masalah pertama yang belum terpenuhi (null bila semua syarat terpenuhi). */
  problem: string | null;
  /** 0–4 untuk indikator kekuatan. */
  score: number;
}

export function checkPassword(password: string, email = '', fullName = ''): PasswordReport {
  const compact = compactOf(password);
  const local = compactOf((email.split('@')[0] || ''));
  const nameTokens = fullName.toLowerCase().split(/\s+/).map(compactOf).filter((t) => t.length >= 5);
  const checks: PasswordCheck[] = [
    { id: 'length', label: `Minimal ${PASSWORD_MIN_LENGTH} karakter`, ok: password.length >= PASSWORD_MIN_LENGTH },
    { id: 'case', label: 'Huruf besar dan huruf kecil', ok: /[A-Z]/.test(password) && /[a-z]/.test(password) },
    { id: 'digit', label: 'Minimal satu angka', ok: /\d/.test(password) },
    { id: 'unique', label: 'Bukan password umum atau urutan mudah (123456, qwerty)', ok: !!password && !COMMON.has(compact) && new Set(password).size >= 5 && !/123456|qwerty|abcdef/.test(compact) },
    { id: 'personal', label: 'Tidak memuat nama atau email Anda', ok: !!password && !(local.length >= 4 && compact.includes(local)) && !nameTokens.some((t) => compact.includes(t)) },
  ];
  const firstBad = checks.find((c) => !c.ok);
  const problems: Record<string, string> = {
    length: `Password minimal ${PASSWORD_MIN_LENGTH} karakter.`,
    case: 'Password harus mengandung huruf besar dan huruf kecil.',
    digit: 'Password harus mengandung angka.',
    unique: 'Password terlalu umum atau mudah ditebak. Gunakan kombinasi yang unik.',
    personal: 'Password tidak boleh memuat nama atau email Anda.',
  };
  let score = 0;
  if (!firstBad) {
    score = 2;
    if (password.length >= 14) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
  } else if (password.length >= 6) {
    score = 1;
  }
  return { checks, problem: firstBad ? problems[firstBad.id] : null, score: password ? score : 0 };
}

/** Membuat password acak yang kuat (16 karakter) memakai crypto.getRandomValues. */
export function generatePassword(length = 16): string {
  const sets = ['ABCDEFGHJKLMNPQRSTUVWXYZ', 'abcdefghijkmnopqrstuvwxyz', '23456789', '!@#$%^&*?-_'];
  const all = sets.join('');
  const rand = (max: number) => {
    const buf = new Uint32Array(1);
    const limit = Math.floor(0x100000000 / max) * max;
    do { crypto.getRandomValues(buf); } while (buf[0] >= limit);
    return buf[0] % max;
  };
  const chars = sets.map((s) => s[rand(s.length)]);
  while (chars.length < length) chars.push(all[rand(all.length)]);
  for (let i = chars.length - 1; i > 0; i--) { const j = rand(i + 1); [chars[i], chars[j]] = [chars[j], chars[i]]; }
  return chars.join('');
}
