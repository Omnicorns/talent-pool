import { Directive, DoCheck, ElementRef, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';

export const WORD_LIMITS = { address: 40, about: 150, duties: 120, resign: 50, note: 80 } as const;

export function wordCount(text: string | null | undefined): number {
  const t = (text || '').trim();
  return t ? t.split(/\s+/).length : 0;
}

/** Memotong teks lebih dari {max} kata. Spasi/baris baru di antara kata tetap dipertahankan. */
export function limitWords(text: string, max: number): string {
  let count = 0;
  const re = /\S+/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text))) {
    if (++count > max) return text.slice(0, match.index).trimEnd();
  }
  return text;
}

/**
 * Batas jumlah kata pada textarea, dengan penghitung "n / max kata" di bawah kolom.
 * Pemakaian: <textarea [(ngModel)]="..." [wordLimit]="150">
 */
@Directive({ selector: 'textarea[wordLimit]', standalone: true })
export class WordLimitDirective implements OnInit, DoCheck, OnDestroy {
  @Input('wordLimit') max = 100;
  private counter!: HTMLElement;
  private last = '';
  private off: (() => void) | null = null;

  constructor(private host: ElementRef<HTMLTextAreaElement>, private renderer: Renderer2) {}

  ngOnInit(): void {
    const el = this.host.nativeElement;
    this.counter = this.renderer.createElement('small');
    this.renderer.addClass(this.counter, 'word-count');
    this.renderer.setAttribute(this.counter, 'aria-live', 'polite');
    this.renderer.insertBefore(el.parentNode, this.counter, el.nextSibling);
    this.off = this.renderer.listen(el, 'input', () => {
      const trimmed = limitWords(el.value, this.max);
      if (trimmed !== el.value) {
        el.value = trimmed;
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    this.render();
  }

  ngDoCheck(): void {
    if (this.host.nativeElement.value !== this.last) this.render();
  }

  ngOnDestroy(): void {
    this.off?.();
    this.counter?.remove();
  }

  private render(): void {
    this.last = this.host.nativeElement.value;
    const n = wordCount(this.last);
    this.counter.textContent = `${n} / ${this.max} kata`;
    this.counter.classList.toggle('over', n > this.max);
  }
}
