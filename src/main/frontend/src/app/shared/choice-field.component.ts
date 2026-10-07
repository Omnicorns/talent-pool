import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
@Component({selector:'app-choice-field',standalone:true,imports:[CommonModule,FormsModule],template:`
  <select [ngModel]="selection" (ngModelChange)="choose($event)" [attr.aria-label]="label">
    <option value="">Pilih</option>
    <option *ngFor="let item of options" [value]="item">{{ item }}</option>
    <option *ngIf="allowOther" value="__other">Lainnya</option>
  </select>
  <input *ngIf="otherSelected" [ngModel]="value" (ngModelChange)="valueChange.emit($event)" [attr.aria-label]="label + ' lainnya'" placeholder="Tulis pilihan Anda">
`})
export class ChoiceFieldComponent implements OnChanges {
  @Input() options: string[]=[];
  @Input() value: string|null|undefined='';
  @Input() label='Pilihan';
  @Input() allowOther=true;
  @Output() valueChange=new EventEmitter<string>();
  otherSelected=false;
  get selection(): string { return this.otherSelected ? '__other' : this.value || ''; }
  ngOnChanges(): void { if(this.value) this.otherSelected=!this.options.includes(this.value); }
  choose(value:string):void { this.otherSelected=value==='__other'; this.valueChange.emit(this.otherSelected ? '' : value); }
}
