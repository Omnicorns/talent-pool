import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

type Block = { kind: 'h' | 'p'; text: string } | { kind: 'ul' | 'ol'; items: string[] };

/**
 * Menampilkan teks bebas (mis. deskripsi lowongan) dengan rapi: baris baru dipertahankan,
 * baris berakhiran ":" jadi sub-judul, dan baris bernomor / berawalan "-" jadi daftar.
 */
@Component({
  selector: 'app-rich-text',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container *ngFor="let b of blocks">
      <ng-container [ngSwitch]="b.kind">
        <h3 *ngSwitchCase="'h'" class="rt-h">{{ $any(b).text }}</h3>
        <p *ngSwitchCase="'p'" class="rt-p">{{ $any(b).text }}</p>
        <ul *ngSwitchCase="'ul'" class="rt-list"><li *ngFor="let i of $any(b).items">{{ i }}</li></ul>
        <ol *ngSwitchCase="'ol'" class="rt-list"><li *ngFor="let i of $any(b).items">{{ i }}</li></ol>
      </ng-container>
    </ng-container>
  `,
  styles: [`
    :host { display: block; }
    .rt-h { margin: 18px 0 6px; font-size: 1.02em; font-weight: 700; }
    .rt-h:first-child { margin-top: 0; }
    .rt-p { margin: 0 0 10px; }
    .rt-list { margin: 0 0 12px; padding-left: 22px; }
    .rt-list li { margin: 0 0 6px; padding-left: 2px; }
  `],
})
export class RichTextComponent {
  blocks: Block[] = [];

  @Input() set text(value: string | null | undefined) { this.blocks = parse(value || ''); }
}

export function parse(raw: string): Block[] {
  const out: Block[] = [];
  const lines = raw.replace(/\r/g, '').split('\n').map((l) => l.trim());
  let list: { kind: 'ul' | 'ol'; items: string[] } | null = null;
  const flush = () => { list = null; };
  for (const line of lines) {
    if (!line) { flush(); continue; }
    const num = /^\d{1,2}[.)]\s+(.*)$/.exec(line);
    const dot = /^[-•*–]\s+(.*)$/.exec(line);
    if (num || dot) {
      const kind = num ? 'ol' : 'ul';
      if (!list || list.kind !== kind) { list = { kind, items: [] }; out.push(list); }
      list.items.push((num || dot)![1]);
      continue;
    }
    flush();
    out.push(/^[^.!?]{2,70}:$/.test(line) ? { kind: 'h', text: line.slice(0, -1) } : { kind: 'p', text: line });
  }
  return out;
}
