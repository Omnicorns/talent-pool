import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, Input, NgZone, OnChanges, OnDestroy, OnInit } from '@angular/core';

/** Slider foto otomatis untuk satu kartu Life at Sarinah. */
@Component({
  selector: 'app-life-slider',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="slider" (mouseenter)="hover = true" (mouseleave)="hover = false"
      (focusin)="hover = true" (focusout)="hover = false">
      <img *ngFor="let src of images; let i = index" [src]="src" [alt]="i === index ? alt : ''"
        [attr.aria-hidden]="i === index ? null : 'true'" [class.on]="i === index"
        [attr.loading]="i === 0 ? 'eager' : 'lazy'" decoding="async">
      <div class="slider-dots" *ngIf="images.length > 1" role="group" [attr.aria-label]="'Foto ' + alt">
        <button type="button" *ngFor="let src of images; let i = index" [class.on]="i === index"
          [attr.aria-label]="'Tampilkan foto ' + (i + 1) + ' dari ' + images.length"
          [attr.aria-current]="i === index ? 'true' : null" (click)="go(i)"></button>
      </div>
    </div>
  `,
})
export class LifeSliderComponent implements OnInit, OnChanges, OnDestroy {
  @Input() images: string[] = [];
  @Input() alt = '';
  /** Durasi tiap foto dalam detik. */
  @Input() seconds = 4;
  index = 0;
  hover = false;
  private timer: ReturnType<typeof setInterval> | null = null;
  private visible = true;
  private observer: IntersectionObserver | null = null;
  private readonly reduceMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  constructor(private zone: NgZone, private cdr: ChangeDetectorRef, private host: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    if (typeof IntersectionObserver === 'function') {
      this.observer = new IntersectionObserver(([entry]) => { this.visible = entry.isIntersecting; });
      this.observer.observe(this.host.nativeElement);
    }
    this.restart();
  }

  ngOnChanges(): void {
    if (this.index >= this.images.length) this.index = 0;
    this.restart();
  }

  ngOnDestroy(): void {
    this.stop();
    this.observer?.disconnect();
  }

  go(i: number): void {
    this.index = i;
    this.restart();
  }

  private restart(): void {
    this.stop();
    if (this.images.length < 2 || this.reduceMotion) return;
    const ms = Math.max(1, Number(this.seconds) || 4) * 1000;
    // Interval dijalankan di luar zone agar tidak memicu change detection saat foto tidak berganti.
    this.zone.runOutsideAngular(() => {
      this.timer = setInterval(() => {
        if (this.hover || !this.visible || document.hidden) return;
        this.zone.run(() => {
          this.index = (this.index + 1) % this.images.length;
          this.cdr.markForCheck();
        });
      }, ms);
    });
  }

  private stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
}
