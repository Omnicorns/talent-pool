import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, Input, NgZone, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { IconComponent } from '../../shared/icon.component';

export interface CarouselProgram { key: string; title: string; description: string; images: string[]; }

/**
 * Carousel "Life at Sarinah": foto besar di kiri, panel info program dan thumbnail foto di kanan.
 * Otomatis berganti foto, lalu pindah ke program berikutnya setelah foto terakhir.
 */
@Component({
  selector: 'app-life-carousel',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="lc" role="region" aria-roledescription="carousel" aria-label="Life at Sarinah"
      (mouseenter)="hover = true" (mouseleave)="hover = false" (focusin)="hover = true" (focusout)="hover = false"
      (keydown.arrowLeft)="step(-1)" (keydown.arrowRight)="step(1)">
      <div class="lc-stage" *ngIf="current as p">
        <div class="lc-main">
          <img *ngFor="let src of p.images; let i = index" [src]="src" [alt]="i === photo ? p.title : ''"
            [attr.aria-hidden]="i === photo ? null : 'true'" [class.on]="i === photo" decoding="async">
          <div class="lc-empty" *ngIf="!p.images.length" aria-hidden="true">Sarinah</div>
          <button type="button" class="lc-arrow prev" (click)="step(-1)" aria-label="Program sebelumnya"><app-icon name="chevron-left" [size]="26"></app-icon></button>
          <button type="button" class="lc-arrow next" (click)="step(1)" aria-label="Program berikutnya"><app-icon name="chevron-right" [size]="26"></app-icon></button>
        </div>
        <aside class="lc-side" aria-live="polite">
          <p class="lc-count">Program {{ index + 1 }} dari {{ programs.length }}</p>
          <h3>{{ p.title }}</h3>
          <p class="lc-desc">{{ p.description }}</p>
          <div class="lc-thumbs" *ngIf="p.images.length > 1" role="group" [attr.aria-label]="'Foto ' + p.title">
            <button type="button" *ngFor="let src of p.images.slice(0, 4); let i = index" [class.on]="i === photo"
              (click)="pick(i)" (mouseenter)="pick(i)" [attr.aria-label]="'Tampilkan foto ' + (i + 1) + ' dari ' + p.images.length"
              [attr.aria-current]="i === photo ? 'true' : null">
              <img [src]="src" alt="" loading="lazy" decoding="async">
            </button>
          </div>
        </aside>
      </div>
      <div class="lc-dots" role="group" aria-label="Pilih program">
        <button type="button" *ngFor="let program of programs; let i = index" [class.on]="i === index" (click)="go(i)"
          [attr.aria-label]="program.title" [attr.aria-current]="i === index ? 'true' : null"></button>
      </div>
    </div>
  `,
})
export class LifeCarouselComponent implements OnInit, OnChanges, OnDestroy {
  @Input() programs: CarouselProgram[] = [];
  /** Durasi tiap foto dalam detik. */
  @Input() seconds = 4;
  index = 0;
  photo = 0;
  hover = false;
  private timer: ReturnType<typeof setInterval> | null = null;
  private visible = true;
  private observer: IntersectionObserver | null = null;
  private readonly reduceMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  constructor(private zone: NgZone, private cdr: ChangeDetectorRef, private host: ElementRef<HTMLElement>) {}

  get current(): CarouselProgram | null {
    return this.programs[this.index] || null;
  }

  ngOnInit(): void {
    if (typeof IntersectionObserver === 'function') {
      this.observer = new IntersectionObserver(([entry]) => { this.visible = entry.isIntersecting; });
      this.observer.observe(this.host.nativeElement);
    }
    this.restart();
  }

  ngOnChanges(): void {
    if (this.index >= this.programs.length) this.index = 0;
    this.restart();
  }

  ngOnDestroy(): void {
    this.stop();
    this.observer?.disconnect();
  }

  go(i: number): void {
    this.index = i;
    this.photo = 0;
    this.restart();
  }

  step(delta: number): void {
    if (!this.programs.length) return;
    this.go((this.index + delta + this.programs.length) % this.programs.length);
  }

  pick(i: number): void {
    this.photo = i;
  }

  private advance(): void {
    const count = this.current?.images.length || 0;
    if (this.photo + 1 < count) {
      this.photo++;
    } else {
      this.index = (this.index + 1) % this.programs.length;
      this.photo = 0;
      this.programs[this.index]?.images.slice(0, 1).forEach((src) => { new Image().src = src; });
    }
  }

  private restart(): void {
    this.stop();
    if (this.programs.length < 2 && (this.current?.images.length || 0) < 2) return;
    if (this.reduceMotion) return;
    const ms = Math.max(1, Number(this.seconds) || 4) * 1000;
    this.zone.runOutsideAngular(() => {
      this.timer = setInterval(() => {
        if (this.hover || !this.visible || document.hidden) return;
        this.zone.run(() => { this.advance(); this.cdr.markForCheck(); });
      }, ms);
    });
  }

  private stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
}
