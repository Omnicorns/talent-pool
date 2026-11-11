
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
@Component({
    selector: 'app-tag-select', imports: [FormsModule], template: `
  <select [attr.aria-label]="label" (change)="select($event)" [disabled]="value.length >= limit">
    <option value="">{{ value.length >= limit ? 'Sudah ' + limit + ' pilihan' : 'Pilih' + (limit < 20 ? ' (maks. ' + limit + ')' : '') }}</option>
    @for (item of options; track item) {
      <option [value]="item" [disabled]="value.includes(item)">{{ item }}</option>
    }
    @if (allowOther) {
      <option value="__other">Lainnya…</option>
    }
  </select>
  @if (other) {
    <div class="inline-add"><input [(ngModel)]="custom" [attr.aria-label]="label + ' lainnya'" placeholder="Tulis pilihan Anda" (keydown.enter)="addCustom(); $event.preventDefault()"><button type="button" class="btn btn-secondary" (click)="addCustom()">Tambah</button></div>
  }
  <div class="tag-list">@for (item of value; track item) {
    <button type="button" class="tag-remove" (click)="remove(item)" [attr.aria-label]="'Hapus ' + item">{{ item }} <span aria-hidden="true">×</span></button>
  }</div>
  @if (message) {
    <small class="field-error" role="alert">{{ message }}</small>
  }
  `
})
export class TagSelectComponent {
  @Input() options:string[]=[]; @Input() value:string[]=[]; @Input() label='Pilihan';
  @Input() limit=20; @Input() allowOther=true;
  @Output() valueChange=new EventEmitter<string[]>();
  other=false; custom=''; message='';
  select(event:Event):void {const input=event.target as HTMLSelectElement; if(input.value==='__other') this.other=true; else this.add(input.value); input.value='';}
  addCustom():void {if(this.add(this.custom.trim())) {this.custom='';this.other=false;}}
  add(value:string):boolean {this.message='';if(!value || this.value.includes(value)) return false; if(value.length>150) {this.message='Maksimal 150 karakter.';return false;} if(this.value.length>=this.limit) {this.message='Maksimal '+this.limit+' pilihan.';return false;} this.valueChange.emit([...this.value,value]);return true;}
  remove(item:string):void {this.message='';this.valueChange.emit(this.value.filter(v=>v!==item));}
}
