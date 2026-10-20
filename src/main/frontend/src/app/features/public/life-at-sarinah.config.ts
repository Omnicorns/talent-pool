/**
 * Konten section "Life at Sarinah".
 *
 * Cara mengubah:
 * - Durasi geser foto (detik): ubah LIFE_SLIDE_SECONDS untuk semua kartu, atau isi `seconds` pada satu program.
 * - Foto: taruh file di `public/assets/images/life/`, lalu tambahkan path-nya ke `images` program terkait.
 *   Foto pertama tampil lebih dulu. Program dengan satu foto tidak bergeser.
 * - Rasio foto terbaik 3:2 (mis. 1200 × 800 px), format JPG, maksimal sekitar 300 KB per foto.
 */
export const LIFE_SLIDE_SECONDS = 4;

export interface LifeProgram {
  /** Kunci tetap program; dipakai untuk mengaitkan foto dari back office. */
  key: string;
  title: string;
  description: string;
  images: string[];
  /** Durasi per foto khusus program ini. Kosongkan untuk memakai LIFE_SLIDE_SECONDS. */
  seconds?: number;
}

const PHOTO = 'assets/images/life/';

export const LIFE_HEADING = {
  eyebrow: 'Life at Sarinah',
  title: 'Sarinah in Motion',
  tagline: 'Living Culture, Creating Experiences, Growing through Learning.',
  lead: 'Celebrating the people and moments that move Sarinah forward.',
};

export const LIFE_PROGRAMS: LifeProgram[] = [
  {
    key: 'kegiatan-internal',
    title: 'Kegiatan Internal',
    description: 'Berbagai kegiatan seru dan bermakna yang memperkuat kebersamaan Insan Sarinah.',
    images: [PHOTO + 'kegiatan-internal-2.jpg', PHOTO + 'life-1.jpg'],
  },
  {
    key: 'komunitas-hobi',
    title: 'Komunitas & Hobi',
    description: 'Temukan komunitas dan ruang untuk menyalurkan minat, bakat, dan passion bersama rekan kerja.',
    images: [PHOTO + 'komunitas-hobi-2.jpg', PHOTO + 'life-2.jpg'],
  },
  {
    key: 'apresiasi-pencapaian',
    title: 'Apresiasi & Pencapaian',
    description: 'Merayakan kontribusi dan pencapaian luar biasa Insan Sarinah di berbagai bidang.',
    images: [PHOTO + 'life-3.jpg', PHOTO + 'life-4.jpg'],
  },
  {
    key: 'budaya-perusahaan',
    title: 'Budaya Perusahaan',
    description: 'Menghidupkan nilai-nilai, tradisi, dan kebersamaan yang menjadi bagian dari kita.',
    images: [PHOTO + 'life-6.jpg'],
  },
  {
    key: 'seni-kreativitas',
    title: 'Seni & Kreativitas',
    description: 'Ruang bagi ide, karya, dan kreativitas Insan Sarinah untuk terus berkembang.',
    images: [PHOTO + 'life-5.jpg'],
  },
  {
    key: 'pembelajaran',
    title: 'Pembelajaran & Pengembangan Diri',
    description: 'Meningkatkan kapabilitas dan potensi melalui berbagai program pengembangan.',
    images: [PHOTO + 'pembelajaran-2.jpg'],
  },
];
