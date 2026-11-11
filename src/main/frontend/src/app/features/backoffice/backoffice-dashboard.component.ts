import { Component } from '@angular/core';
import { BackofficeLayoutComponent } from '../../shared/backoffice-layout.component';
import { ExecutiveSummaryContentComponent } from '../../shared/executive-summary-content.component';

/** Ringkasan rekrutmen untuk recruiter/admin: isinya identik dengan halaman ringkasan pimpinan. */
@Component({
    selector: 'app-backoffice-dashboard',
    imports: [BackofficeLayoutComponent, ExecutiveSummaryContentComponent],
    template: `
    <app-backoffice-layout active="dashboard">
      <app-executive-summary-content />
    </app-backoffice-layout>
    `
})
export class BackofficeDashboardComponent {}
