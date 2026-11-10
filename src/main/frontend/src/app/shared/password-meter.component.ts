
import { Component, Input } from '@angular/core';
import { IconComponent } from './icon.component';
import { checkPassword } from './password-policy';

/** Indikator kekuatan + daftar syarat password yang terpenuhi secara langsung. */
@Component({
    selector: 'app-password-meter',
    imports: [IconComponent],
    template: `
    @if (password) {
      <div class="pw-meter" aria-live="polite">
        <div class="pw-bar" [attr.data-score]="report.score" role="img" [attr.aria-label]="'Kekuatan password: ' + label">
          <span></span><span></span><span></span><span></span>
        </div>
        <p class="pw-label">Kekuatan: <strong>{{ label }}</strong></p>
      </div>
    }
    <ul class="pw-rules" aria-label="Syarat password">
      @for (c of report.checks; track c) {
        <li [class.ok]="password && c.ok">
          <app-icon [name]="password && c.ok ? 'check' : 'circle'" [size]="14"></app-icon> {{ c.label }}
        </li>
      }
    </ul>
    `
})
export class PasswordMeterComponent {
  @Input() password = '';
  @Input() email = '';
  @Input() fullName = '';

  get report() { return checkPassword(this.password || '', this.email, this.fullName); }
  get label(): string { return ['Terlalu lemah', 'Lemah', 'Cukup', 'Kuat', 'Sangat kuat'][this.report.score]; }
}
