/** Human-readable Indonesian labels for backend enum values. */
const LABELS: Record<string, string> = {
  // candidate status
  AVAILABLE: 'Tersedia', SCREENED: 'Sudah disaring', POTENTIAL: 'Potensial', ARCHIVED: 'Diarsipkan',
  REJECTED: 'Tidak lanjut', SPAM: 'Spam', BLOCKED: 'Diblokir', WITHDRAWN: 'Mengundurkan diri', HIRED: 'Diterima',
  // hiring stage
  NEW_CANDIDATE: 'Baru', SCREENING: 'Screening', INTERVIEW: 'Interview', OFFER: 'Penawaran',
  // application status
  ACTIVE: 'Diproses',
  // job listing status
  DRAFT: 'Draf', PUBLISHED: 'Dibuka', CLOSED: 'Ditutup',
  // employment type
  FULL_TIME: 'Penuh waktu', PART_TIME: 'Paruh waktu', CONTRACT: 'Kontrak', INTERNSHIP: 'Magang', TEMPORARY: 'Sementara',
  // interview
  SCHEDULED: 'Terjadwal', RESCHEDULED: 'Dijadwal ulang', COMPLETED: 'Selesai', CANCELLED: 'Dibatalkan',
  PENDING: 'Menunggu', PASSED: 'Lolos', FAILED: 'Tidak lolos', HOLD: 'Ditahan',
  ONLINE: 'Online', ONSITE: 'Tatap muka', PHONE: 'Telepon',
};

export function label(value: string | null | undefined): string {
  if (!value) return '-';
  return LABELS[value] ?? value;
}

/** Tone used by the .tag component: positive, warning, negative, neutral, info. */
export function tone(value: string | null | undefined): string {
  switch (value) {
    case 'AVAILABLE': case 'HIRED': case 'PUBLISHED': case 'PASSED': case 'COMPLETED': return 'positive';
    case 'POTENTIAL': case 'OFFER': case 'HOLD': case 'RESCHEDULED': case 'DRAFT': return 'warning';
    case 'REJECTED': case 'SPAM': case 'BLOCKED': case 'FAILED': case 'CANCELLED': return 'negative';
    case 'SCREENED': case 'SCREENING': case 'INTERVIEW': case 'SCHEDULED': case 'ACTIVE': return 'info';
    default: return 'neutral';
  }
}

const monthFmt = new Intl.DateTimeFormat('id-ID', { month: 'short', year: 'numeric' });
const dayFmt = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
const timeFmt = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' });

function parse(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}
export function monthYear(value: string | null | undefined): string { const d = parse(value); return d ? monthFmt.format(d) : (value || '-'); }
export function fullDate(value: string | null | undefined): string { const d = parse(value); return d ? dayFmt.format(d) : (value || '-'); }
export function time(value: string | null | undefined): string { const d = parse(value); return d ? timeFmt.format(d).replace('.', ':') : '-'; }

export function rupiah(value: number | null | undefined): string {
  if (value == null) return '-';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
}
export function salaryRange(min: number | null | undefined, max: number | null | undefined): string {
  if (min == null && max == null) return '-';
  if (min != null && max != null && min !== max) return `${rupiah(min)} – ${rupiah(max)}`;
  return rupiah((min ?? max) as number);
}
export function initials(name: string | null | undefined): string {
  return String(name || 'T').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}
export function experience(months: number | null | undefined): string {
  if (!months) return '-';
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (!years) return `${rest} bln`;
  return rest ? `${years} th ${rest} bln` : `${years} th`;
}

/** Bundle of helpers exposed to templates as `fmt`. */
export const FMT = { label, tone, monthYear, fullDate, time, rupiah, salaryRange, initials, experience };
