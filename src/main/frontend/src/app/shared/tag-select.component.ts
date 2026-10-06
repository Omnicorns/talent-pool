import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
@Component({selector:'app-tag-select',standalone:true,imports:[CommonModule,FormsModule],template:`
  <select [attr.aria-label]="label" (change)="select($event)">
    <option value="">Pilih {{ label.toLowerCase() }} (maks. {{ limit }})</option>
    <option *ngFor="let item of options" [value]="item" [disabled]="value.includes(item)">{{ item }}</option>
    <option *ngIf="allowOther" value="__other">Lainnya</option>
  </select>
  <div class="talent-other-choice" *ngIf="other"><input [(ngModel)]="custom" [attr.aria-label]="label + ' lainnya'" placeholder="Tuliskan pilihan lainnya" (keydown.enter)="addCustom(); $event.preventDefault()"><button type="button" (click)="addCustom()">Tambah</button></div>
  <div class="talent-tags"><button type="button" *ngFor="let item of value" (click)="remove(item)" [attr.aria-label]="'Hapus ' + item">{{ item }} ×</button></div>
  <small *ngIf="message" class="field-error" role="alert">{{ message }}</small>
`})
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
