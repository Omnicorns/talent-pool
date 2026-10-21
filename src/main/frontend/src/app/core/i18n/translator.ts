/**
 * Penerjemah tampilan situs kandidat (Indonesia -> English) saat bahasa situs diset "en" di back office.
 *
 * Teks sumber di template tetap Bahasa Indonesia. Saat mode English aktif, teks, placeholder, aria-label, title,
 * dan alt yang cocok dengan kamus EN diganti di DOM. Teks yang tidak ada di kamus tampil apa adanya (Indonesia).
 * Entri kamus boleh memakai {0}, {1}, ... untuk bagian dinamis, mis. 'Langkah {#0} dari 6' ({#n} hanya cocok dengan angka).
 * Halaman back office tidak diterjemahkan.
 */
export type SiteLanguage = 'id' | 'en';

const ATTRIBUTES = ['placeholder', 'aria-label', 'title', 'alt'];
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'CODE', 'PRE']);

let exact = new Map<string, string>();
let patterns: Array<{ regex: RegExp; target: string }> = [];
let active = false;
let observer: MutationObserver | null = null;
const textState = new WeakMap<Node, { shown: string }>();
const attrState = new WeakMap<Element, Record<string, string>>();

function normalize(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export function setDictionary(dictionary: Record<string, string>): void {
  exact = new Map();
  patterns = [];
  for (const [source, target] of Object.entries(dictionary)) {
    const key = normalize(source);
    if (/\{#?\d+\}/.test(key)) {
      // {0} = teks apa saja, {#0} = hanya angka.
      const body = key.split(/(\{#?\d+\})/).map((part) => (/^\{#\d+\}$/.test(part) ? '(\\d+)' : /^\{\d+\}$/.test(part) ? '(.+?)' : part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))).join('');
      patterns.push({ regex: new RegExp('^' + body + '$'), target });
    } else {
      exact.set(key, target);
    }
  }
}

/** Terjemahkan satu teks; mengembalikan teks asli bila bahasa bukan English atau tidak ada di kamus. */
export function translate(text: string | null | undefined, depth = 0): string {
  if (!text || !active) return text ?? '';
  const key = normalize(text);
  if (!key) return text;
  let result = exact.get(key);
  if (result === undefined && depth < 2) {
    for (const { regex, target } of patterns) {
      const match = regex.exec(key);
      if (match) {
        result = target.replace(/\{(\d+)\}/g, (_, index) => translate(match[Number(index) + 1], depth + 1));
        break;
      }
    }
  }
  if (result === undefined) return text;
  // Pertahankan spasi di awal/akhir teks asli agar tata letak inline tidak berubah.
  const lead = text.match(/^\s*/)?.[0] ?? '';
  const trail = text.match(/\s*$/)?.[0] ?? '';
  return lead + result + trail;
}

function inBackoffice(): boolean {
  return location.pathname.includes('/backoffice');
}

function translateTextNode(node: Node): void {
  const parent = node.parentElement;
  if (!parent || SKIP_TAGS.has(parent.tagName) || parent.closest('[data-no-translate]')) return;
  const state = textState.get(node);
  const value = node.nodeValue || '';
  if (state && state.shown === value) return;
  const translated = translate(value);
  if (translated !== value) {
    node.nodeValue = translated;
    textState.set(node, { shown: translated });
  } else if (state) {
    textState.delete(node);
  }
}

function translateAttributes(element: Element): void {
  if (element.closest('[data-no-translate]')) return;
  let shownMap = attrState.get(element);
  for (const name of ATTRIBUTES) {
    const value = element.getAttribute(name);
    if (!value) continue;
    if (shownMap && shownMap[name] === value) continue;
    const translated = translate(value);
    if (translated !== value) {
      element.setAttribute(name, translated);
      shownMap ||= {};
      shownMap[name] = translated;
      attrState.set(element, shownMap);
    } else if (shownMap) {
      delete shownMap[name];
    }
  }
}

function translateTree(root: Node): void {
  if (root.nodeType === Node.TEXT_NODE) { translateTextNode(root); return; }
  if (root.nodeType !== Node.ELEMENT_NODE) return;
  const element = root as Element;
  if (SKIP_TAGS.has(element.tagName)) return;
  translateAttributes(element);
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  let node = walker.nextNode();
  while (node) {
    if (node.nodeType === Node.TEXT_NODE) translateTextNode(node);
    else translateAttributes(node as Element);
    node = walker.nextNode();
  }
}

/** Aktifkan atau matikan penerjemah. Mode "id" tidak mengubah apa pun. */
export function startTranslator(language: SiteLanguage): void {
  active = language === 'en';
  document.documentElement.lang = language;
  observer?.disconnect();
  observer = null;
  if (!active) return;
  const run = (fn: () => void) => { if (!inBackoffice()) fn(); };
  run(() => translateTree(document.body));
  observer = new MutationObserver((records) => {
    run(() => {
      for (const record of records) {
        if (record.type === 'childList') record.addedNodes.forEach((node) => translateTree(node));
        else if (record.type === 'characterData' && record.target.nodeType === Node.TEXT_NODE) translateTextNode(record.target);
        else if (record.type === 'attributes') translateAttributes(record.target as Element);
      }
    });
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRIBUTES });
  // Judul halaman dan deskripsi tidak berada di body.
  document.title = translate(document.title);
}
