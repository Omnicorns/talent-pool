import { LIFE_HEADING, LIFE_PROGRAMS, LifeProgram } from './life-at-sarinah.config';

/** Isi bawaan landing page. Dipakai bila belum ada isi yang disimpan dari back office. */
export const DEFAULT_HERO = {
  title: 'Be Part of Indonesia’s Creative Retail Legacy',
  subtitle: 'Discover opportunities to grow, create impact, and champion local excellence.',
  primaryCta: 'Jelajahi Talent Pool',
  secondaryCta: 'Gabung Talent Pool',
};
export const DEFAULT_HERO_IMAGE = 'assets/images/hero-sarinah.jpg';

export const DEFAULT_VALUES = [
  { icon: 'users', title: 'Bergabung dalam Talent Pool', text: 'Kesempatan untuk menjadi bagian dari jaringan talenta Sarinah.' },
  { icon: 'sprout', title: 'Peluang berkembang', text: 'Dapatkan kesempatan karier yang sesuai dengan kompetensi dan minat Anda.' },
  { icon: 'building', title: 'Berkontribusi untuk Indonesia', text: 'Bersama Sarinah, hadirkan nilai dan inspirasi bagi masyarakat Indonesia.' },
  { icon: 'shield', title: 'Keamanan data', text: 'Data Anda dikelola sesuai UU Perlindungan Data Pribadi dan hanya digunakan untuk rekrutmen.' },
];

export const DEFAULT_LIFE_HEADING = { ...LIFE_HEADING };
export const DEFAULT_LIFE_PROGRAMS: Array<Pick<LifeProgram, 'key' | 'title' | 'description'>> =
  LIFE_PROGRAMS.map(({ key, title, description }) => ({ key, title, description }));
export const DEFAULT_LIFE_IMAGES: Record<string, string[]> =
  Object.fromEntries(LIFE_PROGRAMS.map((p) => [p.key, p.images]));

export const DEFAULT_FAQ = [
  { q: 'Apa itu Talent Pool?', a: 'Talent Pool adalah basis data profil kandidat Sarinah. Profil Anda akan dipertimbangkan saat ada kebutuhan posisi yang relevan, meskipun Anda belum melamar lowongan tertentu.' },
  { q: 'Apakah saya harus melamar posisi tertentu?', a: 'Tidak. Anda dapat bergabung ke Talent Pool terlebih dahulu, lalu melamar lowongan yang sedang dibuka kapan saja dari akun yang sama.' },
  { q: 'Bagaimana proses setelah saya mendaftar?', a: 'Tim Human Capital meninjau profil dan CV Anda. Jika ada posisi yang sesuai, kami menghubungi Anda melalui email atau WhatsApp untuk tahap berikutnya.' },
  { q: 'Bagaimana saya memantau status lamaran?', a: 'Masuk ke akun Anda, lalu buka Profil saya. Status setiap lamaran tampil di bagian Lamaran saya, lengkap dengan riwayat prosesnya.' },
];

export const DEFAULT_CONTENT: Record<string, any> = {
  HERO: DEFAULT_HERO,
  VALUES: DEFAULT_VALUES,
  LIFE_HEADING: DEFAULT_LIFE_HEADING,
  LIFE_PROGRAMS: DEFAULT_LIFE_PROGRAMS,
  FAQ: DEFAULT_FAQ,
};
