
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TalentProfileDetails } from '../core/models/talent.models';
import { ChoiceFieldComponent } from './choice-field.component';
import { IconComponent } from './icon.component';
import { MAX_EXTRA_SOCIAL } from './social-accounts';
import { TALENT_OPTIONS } from './talent-options';

/** Media sosial: satu wajib dan hingga dua tambahan opsional. */
@Component({
    selector: 'app-social-accounts-field',
    imports: [FormsModule, ChoiceFieldComponent, IconComponent],
    template: `
    <div class="form-stack">
      <div class="form-grid">
        <label class="field">Platform *<app-choice-field [options]="options.socialPlatforms" label="Platform" [(value)]="details.socialPlatform"></app-choice-field></label>
        <label class="field">Username *<input [(ngModel)]="details.socialUsername" name="socialUsername" maxlength="100" placeholder="@username"></label>
      </div>
    
      @for (account of extras; track account; let i = $index) {
        <div class="form-grid social-extra">
          <label class="field">Platform <span class="opt">(opsional)</span><app-choice-field [options]="platformsFor(i)" [allowOther]="false" label="Platform tambahan" [(value)]="account.platform"></app-choice-field></label>
          <label class="field">Username
            <span class="social-row">
              <input [(ngModel)]="account.username" [name]="'socialExtra' + i" maxlength="100" placeholder="@username">
              <button type="button" class="icon-btn" (click)="remove(i)" [attr.aria-label]="'Hapus media sosial tambahan ' + (i + 1)"><app-icon name="trash" [size]="16"></app-icon></button>
            </span>
          </label>
        </div>
      }
    
      <div>
        @if (extras.length < max) {
          <button type="button" class="btn btn-ghost btn-sm" (click)="add()"><app-icon name="plus" [size]="16"></app-icon> Tambah media sosial</button>
        }
        <small class="field-hint" style="display: block; margin-top: 4px">Satu media sosial wajib diisi, maksimal {{ max }} tambahan (opsional).</small>
      </div>
    </div>
    `
})
export class SocialAccountsFieldComponent {
  @Input({ required: true }) details!: TalentProfileDetails;
  readonly options = TALENT_OPTIONS;
  readonly max = MAX_EXTRA_SOCIAL;

  get extras() {
    return (this.details.socialAccounts ||= []);
  }

  add(): void {
    this.extras.push({ platform: '', username: '' });
  }

  remove(index: number): void {
    this.extras.splice(index, 1);
  }

  /** Platform yang belum dipakai baris lain, tetapi tetap menyertakan pilihan baris ini. */
  platformsFor(index: number): string[] {
    const used = new Set([this.details.socialPlatform, ...this.extras.filter((_, i) => i !== index).map((item) => item.platform)]
      .map((item) => (item || '').toLowerCase()));
    return this.options.socialPlatforms.filter((item) => !used.has(item.toLowerCase()));
  }
}
