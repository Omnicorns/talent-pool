import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/** Stroke icons drawn on a 24px grid. Keep the set small and consistent. */
const ICONS: Record<string, string> = {
  dashboard: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="4.5" rx="1.5"/><rect x="13.5" y="11" width="7" height="9.5" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.3c2.1.7 3.5 2.8 3.5 5.7"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8.5 7V5.5A1.5 1.5 0 0 1 10 4h4a1.5 1.5 0 0 1 1.5 1.5V7M3 12.5h18"/>',
  clipboard: '<rect x="5" y="4.5" width="14" height="16" rx="2"/><path d="M9 4.5V3.8c0-.4.3-.8.8-.8h4.4c.5 0 .8.4.8.8v.7M8.5 12.5l2.3 2.3 4.7-4.8"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  logout: '<path d="M9.5 20.5H6A2.5 2.5 0 0 1 3.5 18V6A2.5 2.5 0 0 1 6 3.5h3.5M15 16.5 19.5 12 15 7.5M19.5 12H9"/>',
  'arrow-left': '<path d="M19.5 12h-15M10.5 6l-6 6 6 6"/>',
  'arrow-up-right': '<path d="M7 17 17 7M8.5 7H17v8.5"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  'chevron-right': '<path d="m9 6 6 6-6 6"/>',
  'chevron-left': '<path d="m15 6-6 6 6 6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  edit: '<path d="M4 20h4.2L19 9.2a2.1 2.1 0 0 0-3-3L5.3 17v3Z"/><path d="m14.5 7.5 3 3"/>',
  trash: '<path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v5.5M14 11v5.5"/>',
  download: '<path d="M12 3.5v11M7.5 10.5 12 15l4.5-4.5M4.5 19.5h15"/>',
  upload: '<path d="M12 15.5v-11M7.5 9 12 4.5 16.5 9M4.5 19.5h15"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/>',
  phone: '<path d="M5 3.5h3.3l1.6 4.3-2.2 1.4a11 11 0 0 0 5.1 5.1l1.4-2.2 4.3 1.6V17a2.5 2.5 0 0 1-2.7 2.5A15.5 15.5 0 0 1 2.5 6.2 2.5 2.5 0 0 1 5 3.5Z"/>',
  pin: '<path d="M12 21s-6.5-5.8-6.5-11a6.5 6.5 0 0 1 13 0c0 5.2-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.3"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3.3-3.3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0L5 13.3A4 4 0 0 0 10.7 19l1-1"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.8"/>',
  'eye-off': '<path d="M3 3l18 18M10.6 6.1A9 9 0 0 1 12 6c6 0 9.5 6 9.5 6a16 16 0 0 1-2.4 3.1M6.5 6.8C4 8.5 2.5 12 2.5 12S6 18.5 12 18.5c1.3 0 2.5-.3 3.5-.7M10 10a2.8 2.8 0 0 0 4 4"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.3v.2"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.7v.2"/>',
  file: '<path d="M14 3.5H7A2 2 0 0 0 5 5.5v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5Z"/><path d="M14 3.5v5h5M8.5 13h7M8.5 16.5h5"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  video: '<rect x="3" y="6" width="12.5" height="12" rx="2"/><path d="m15.5 10.5 5.5-3v9l-5.5-3"/>',
  building: '<path d="M4.5 20.5V5a1.5 1.5 0 0 1 1.5-1.5h8A1.5 1.5 0 0 1 15.5 5v15.5M15.5 9.5H18a1.5 1.5 0 0 1 1.5 1.5v9.5M3 20.5h18M8 8h4M8 12h4M8 16h4"/>',
  grad: '<path d="m2.5 9.5 9.5-5 9.5 5-9.5 5-9.5-5Z"/><path d="M6.5 11.6V16c0 1.4 2.5 3 5.5 3s5.5-1.6 5.5-3v-4.4M21.5 9.5v5"/>',
  award: '<circle cx="12" cy="9" r="5.5"/><path d="m8.6 13.3-1.6 7.2 5-2.5 5 2.5-1.6-7.2"/>',
  shield: '<path d="M12 3c2.8 2 5.6 3 8.5 3.3v6c0 4.8-3.5 8-8.5 9.7-5-1.7-8.5-4.9-8.5-9.7v-6C6.4 6 9.2 5 12 3Z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  sprout: '<path d="M12 20.5V11M12 11c0-4-3-6.5-7.5-6.5 0 4.5 3 6.5 7.5 6.5ZM12 14c0-3.5 2.5-6 7.5-6 0 4-2.5 6-7.5 6Z"/>',
  heart: '<path d="M12 20s-8-4.6-8-10.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5C20 15.4 12 20 12 20Z"/>',
  globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.5 3.5 5.3 3.5 8.5s-1.1 6-3.5 8.5c-2.4-2.5-3.5-5.3-3.5-8.5s1.1-6 3.5-8.5Z"/>',
  history: '<path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5M4 4v4.5h4.5M12 8v4.5l3 1.5"/>',
  undo: '<path d="M9 14.5 4 9.5l5-5"/><path d="M4.5 9.5H15a5 5 0 0 1 0 10h-3"/>',
};

@Component({
  selector: 'app-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'icon', 'aria-hidden': 'true' },
  template: `<svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    [attr.stroke-width]="stroke" stroke-linecap="round" stroke-linejoin="round" focusable="false" [innerHTML]="path"></svg>`,
})
export class IconComponent {
  @Input({ required: true }) name = '';
  @Input() size = 18;
  @Input() stroke = 1.75;
  constructor(private sanitizer: DomSanitizer) {}
  // The markup comes only from the constant ICONS table above, never from user input.
  get path(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(ICONS[this.name] || '');
  }
}
