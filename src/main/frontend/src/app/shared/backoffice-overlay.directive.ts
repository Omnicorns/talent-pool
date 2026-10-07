import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Directive, ElementRef, EventEmitter, HostBinding, HostListener, Inject, Injectable, Input, OnChanges, OnDestroy, Output } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BackofficeScrollLock {
  private count = 0;
  private previousOverflow = '';
  constructor(@Inject(DOCUMENT) private document: Document) {}

  lock(): void {
    if (this.count++ === 0) {
      this.previousOverflow = this.document.body.style.overflow;
      this.document.body.style.overflow = 'hidden';
    }
  }

  unlock(): void {
    if (this.count > 0 && --this.count === 0) this.document.body.style.overflow = this.previousOverflow;
  }
}

/** Shared keyboard and scroll behavior for Back Office menus and drawers. */
@Directive({ selector: '[boOverlay]', standalone: true })
export class BackofficeOverlayDirective implements AfterViewInit, OnChanges, OnDestroy {
  @Input() boOverlay = true;
  @Output() overlayClose = new EventEmitter<void>();
  @HostBinding('attr.role') get role() { return this.boOverlay ? 'dialog' : null; }
  @HostBinding('attr.aria-modal') get modal() { return this.boOverlay ? 'true' : null; }
  @HostBinding('attr.tabindex') tabindex = -1;
  private ready = false;
  private locked = false;
  private previousFocus: HTMLElement | null = null;

  constructor(private element: ElementRef<HTMLElement>, private scroll: BackofficeScrollLock,
    @Inject(DOCUMENT) private document: Document) {}

  ngAfterViewInit(): void { this.ready = true; this.sync(); }
  ngOnChanges(): void { if (this.ready) this.sync(); }
  ngOnDestroy(): void { this.release(); }

  private sync(): void {
    if (this.boOverlay && !this.locked) {
      this.previousFocus = this.document.activeElement as HTMLElement;
      this.locked = true;
      this.scroll.lock();
      queueMicrotask(() => {
        if (this.locked) (this.focusable()[0] || this.element.nativeElement).focus({ preventScroll: true });
      });
    } else if (!this.boOverlay) this.release();
  }

  private release(): void {
    if (!this.locked) return;
    this.locked = false;
    this.scroll.unlock();
    if (this.previousFocus?.isConnected) this.previousFocus.focus({ preventScroll: true });
  }

  private focusable(): HTMLElement[] {
    return Array.from(this.element.nativeElement.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]'
    )).filter(element => element.getClientRects().length > 0);
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.locked) return;
    if (event.key === 'Escape') { event.preventDefault(); this.overlayClose.emit(); }
    if (event.key !== 'Tab') return;
    const items = this.focusable();
    const first = items[0] || this.element.nativeElement;
    const last = items[items.length - 1] || first;
    const active = this.document.activeElement;
    if (!this.element.nativeElement.contains(active) || (event.shiftKey ? active === first : active === last)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    }
  }
}
