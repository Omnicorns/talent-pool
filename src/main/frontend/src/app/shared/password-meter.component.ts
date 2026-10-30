import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IconComponent } from './icon.component';
import { checkPassword } from './password-policy';

/** Indikator kekuatan + daftar syarat password yang terpenuhi secara langsung. */
@Component({
  selector: 'app-password-meter',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="pw-meter" *ngIf="password" aria-live="polite">
      <div class="pw-bar" [attr.data-score]="report.score" role="img" [attr.aria-label]="'Kekuatan password: ' + label">
        <span></span><span></span><span></span><span></span>
      </div>
      <p class="pw-label">Kekuatan: <strong>{{ label }}</strong></p>
    </div>
    <ul class="pw-rules" aria-label="Syarat password">
      <li *ngFor="let c of report.checks" [class.ok]="password && c.ok">
        <app-icon [name]="password && c.ok ? 'check' : 'circle'" [size]="14"></app-icon> {{ c.label }}
      </li>
    </ul>
  `,
})
export class PasswordMeterComponent {
  @Input() password = '';
  @Input() email = '';
  @Input() fullName = '';

  get report() { return checkPassword(this.password || '', this.email, this.fullName); }
  get label(): string { return ['Terlalu lemah', 'Lemah', 'Cukup', 'Kuat', 'Sangat kuat'][this.report.score]; }
}
