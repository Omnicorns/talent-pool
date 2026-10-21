import { EN_PUBLIC } from './public';
import { EN_AUTH } from './auth';
import { EN_CANDIDATE } from './candidate';
import { EN_PORTAL } from './portal';

/** Kamus Indonesia -> English untuk situs kandidat. Kunci = teks sumber persis seperti di template. */
export const EN: Record<string, string> = {
  ...EN_PUBLIC,
  ...EN_AUTH,
  ...EN_CANDIDATE,
  ...EN_PORTAL,
};
