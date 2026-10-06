import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CandidateProfile, EducationItem, WorkExperienceItem, WorkDetails, TalentProfileDetails, SupportingUpload } from '../../core/models/talent.models';
import { TalentAuthService } from '../../core/service/api/talent-auth.service';
import { TalentPortalService } from '../../core/service/api/talent-portal.service';
import { ChoiceFieldComponent } from '../../shared/choice-field.component';
import { TagSelectComponent } from '../../shared/tag-select.component';
import { TALENT_OPTIONS } from '../../shared/talent-options';
@Component({selector:'app-talent-onboarding',standalone:true,imports:[CommonModule,FormsModule,RouterLink,ChoiceFieldComponent,TagSelectComponent],templateUrl:'./talent-onboarding.component.html'})
export class TalentOnboardingComponent implements OnInit {
  profile!:CandidateProfile; details!:TalentProfileDetails; options=TALENT_OPTIONS;
  step=1; saving=false; editing=false; error=''; returnUrl='/portal';
  today=new Date().toLocaleDateString('en-CA'); currentYear=new Date().getFullYear();
  cvFile:File|null=null; profilePicture:File|null=null; portfolioFiles:File[]=[]; supportingUploads:SupportingUpload[]=[];
  portfolioLinks=[{title:'Portfolio',url:''}]; postalRegions:string[]=[]; postalLoading=false; postalError='';
  steps=['Upload CV','Informasi Pribadi','Pendidikan','Pengalaman Kerja','Kompensasi','Portofolio','Additional Info'];
  constructor(private portal:TalentPortalService,private auth:TalentAuthService,private router:Router,private route:ActivatedRoute) {
    const requested=route.snapshot.queryParamMap.get('returnUrl');
    if(requested?.startsWith('/') && !requested.startsWith('//')) this.returnUrl=requested;
    this.editing=route.snapshot.queryParamMap.get('edit')==='true';
  }
  ngOnInit():void {
    this.error='';
    if(this.auth.session?.onboardingCompleted!==false && !this.editing){this.router.navigateByUrl(this.returnUrl);return;}
    this.portal.profile().subscribe({next:profile=>{
      this.profile={...profile,educations:profile.educations||[],workExperiences:profile.workExperiences||[],portfolios:profile.portfolios||[],relatedIndustries:profile.relatedIndustries||[],relatedJobPositions:profile.relatedJobPositions||[],tools:profile.tools||[],jobInterests:profile.jobInterests||[],preferredLocations:profile.preferredLocations||[]};
      this.details={gender:'',postalCode:'',region:'',linkedinUrl:'',socialPlatform:'',socialUsername:'',expectedSalaryMax:null,noExperience:false,languageSkills:[],...profile.profileDetails};this.details.languageSkills ||= [];this.profile.profileDetails=this.details;
      if(['Talent Portal','Website'].includes(this.profile.source||'')) this.profile.source='';
      this.formalEducations.forEach(edu=>edu.clientKey ||= crypto.randomUUID());this.profile.workExperiences.forEach(exp=>this.workDetails(exp));
      if(!this.formalEducations.length)this.addEducation();if(!this.details.noExperience && !this.profile.workExperiences.length)this.addExperience();if(!this.details.languageSkills.length)this.addLanguage();
      if(this.details.postalCode)this.loadPostalRegions(this.details.postalCode,false);
      const links=this.profile.portfolios.filter(p=>p.type==='LINK' && p.url).map(p=>({title:p.title||'Portfolio',url:p.url||''}));if(links.length)this.portfolioLinks=links;
    },error:()=>this.error='Profil kandidat gagal dimuat. Silakan coba lagi.'});
  }
  get progress():number{return this.step/7*100;}
  get stepLabel():string{return String(this.step).padStart(2,'0');}
  get formalEducations():EducationItem[]{return this.profile?.educations.filter(e=>e.type==='FORMAL')||[];}
  get stepTitle():string{return ['Upload CV','Informasi Pribadi','Pendidikan','Pengalaman Kerja','Kompensasi','Profil & Portofolio','Additional Information'][this.step-1];}
  get stepDescription():string{return ['Upload CV terbaru untuk membantu proses screening.','Lengkapi identitas, alamat, dan kontak yang dapat dihubungi.','Isi pendidikan terakhir beserta ijazah dan transkrip.','Ceritakan pengalaman, keahlian, dan pencapaian Anda.','Isi gaji terakhir dan rentang ekspektasi gaji per bulan.','Tambahkan foto dan portofolio jika tersedia.','Pilih fungsi, lokasi, sumber informasi, serta kemampuan bahasa.'][this.step-1];}
  get age():number|null {
    if(!this.profile?.birthDate)return null;const date=new Date(this.profile.birthDate+'T00:00:00'),now=new Date();if(isNaN(date.getTime()) || date>now)return null;
    let age=now.getFullYear()-date.getFullYear();if(now.getMonth()<date.getMonth() || now.getMonth()===date.getMonth() && now.getDate()<date.getDate())age--;return age;
  }
  addEducation():void{this.profile.educations.push({clientKey:crypto.randomUUID(),type:'FORMAL',level:'',institution:'',major:'',startYear:null,endYear:null,ipk:null,description:''});}
  removeEducation(i:number):void{const edu=this.formalEducations[i];this.profile.educations=this.profile.educations.filter(e=>e!==edu);this.removeUploads('education:'+edu.clientKey+':');}
  workDetails(exp:WorkExperienceItem):WorkDetails{return exp.details ||= {employmentType:'',industry:'',skills:[],tools:[],resignReason:''};}
  addExperience():void{this.profile.workExperiences.push({companyName:'',position:'',startDate:'',endDate:null,currentJob:false,description:'',details:{employmentType:'',industry:'',skills:[],tools:[],resignReason:''}});}
  toggleNoExperience():void{if(this.details.noExperience)this.profile.workExperiences=[];else if(!this.profile.workExperiences.length)this.addExperience();}
  addLanguage():void{this.details.languageSkills.push({key:crypto.randomUUID(),name:'',proficiency:''});}
  removeLanguage(i:number):void{const [language]=this.details.languageSkills.splice(i,1);this.removeUploads('language:'+language.key+':');}
  private removeUploads(prefix:string):void{this.supportingUploads=this.supportingUploads.filter(u=>!u.key.startsWith(prefix));}
  educationKey(edu:EducationItem,kind:string):string{return 'education:'+edu.clientKey+':'+kind;}
  documentName(key:string):string{return this.supportingUploads.find(u=>u.key===key)?.file.name || this.profile.supportingDocuments?.find(d=>d.key===key)?.originalName || '';}
  postalCodeChanged(code:string):void{this.details.postalCode=code;this.details.region='';this.postalRegions=[];this.postalError='';if(/^\d{5}$/.test(code))this.loadPostalRegions(code,true);else this.postalLoading=false;}
  private loadPostalRegions(code:string,changed:boolean):void {
    this.postalLoading=true;this.portal.postalCodes(code).subscribe({next:regions=>{
      if(this.details.postalCode!==code)return;this.postalLoading=false;this.postalRegions=regions;this.postalError=regions.length ? '' : 'Kode pos tidak ditemukan. Periksa kembali kode pos KTP Anda.';
      if(!changed && this.details.region && !regions.includes(this.details.region))this.details.region='';if(regions.length===1)this.details.region=regions[0];
    },error:()=>{if(this.details.postalCode===code){this.postalLoading=false;this.postalError='Wilayah gagal dimuat. Ketik kembali kode pos untuk mencoba lagi.';}}});
  }
  private selected(event:Event,extensions:string[],maxMb:number):File|null{const input=event.target as HTMLInputElement,file=input.files?.[0];if(!file)return null;this.error='';if(!this.validFile(file,extensions,maxMb)){input.value='';return null;}return file;}
  private validFile(file:File,extensions:string[],maxMb:number):boolean{if(!extensions.includes(file.name.split('.').pop()?.toLowerCase()||'') || !file.size || file.size>maxMb*1024*1024){this.error='File '+file.name+' harus berformat '+extensions.join(', ').toUpperCase()+' dan maksimal '+maxMb+' MB.';return false;}return true;}
  selectCv(event:Event):void{const file=this.selected(event,['pdf','doc','docx'],10);if(file)this.cvFile=file;}
  selectProfilePicture(event:Event):void{const file=this.selected(event,['jpg','jpeg','png'],10);if(file)this.profilePicture=file;}
  selectPortfolioFiles(event:Event):void{const input=event.target as HTMLInputElement,files=Array.from(input.files||[]);this.error='';if(files.length>10){this.error='Maksimal 10 file portofolio.';input.value='';return;}if(files.every(f=>this.validFile(f,['pdf','jpg','jpeg','png','doc','docx','zip'],10)))this.portfolioFiles=files;else input.value='';}
  selectDocument(event:Event,key:string):void{const file=this.selected(event,['pdf'],2);if(file){this.supportingUploads=this.supportingUploads.filter(u=>u.key!==key);this.supportingUploads.push({key,file});}}
  goToCompletedStep(target:number):void{if(target<this.step){this.step=target;this.error='';}}
  previous():void{this.error='';this.step=Math.max(1,this.step-1);}
  next():void{this.error=this.validateStep(this.step);if(!this.error)this.step=Math.min(7,this.step+1);}
  private text(value:unknown):boolean{return typeof value==='string' && !!value.trim();}
  private number(value:unknown):boolean{return value!==null && value!==undefined && value!=='' && Number.isFinite(Number(value)) && Number(value)>=0;}
  private url(value:string):boolean{try{return ['http:','https:'].includes(new URL(value).protocol);}catch{return false;}}
  validateStep(step:number):string {
    const p=this.profile,d=this.details;
    if(step===1 && !this.cvFile && !p.cvOriginalName)return 'Upload CV terlebih dahulu.';
    if(step===2){
      if(!this.text(p.fullName) || !this.text(p.email) || !/^\d{8,15}$/.test(p.phone||''))return 'Nama lengkap, email, dan WhatsApp wajib diisi. WhatsApp harus 8–15 digit angka.';
      if(p.identityNumber && !/^\d+$/.test(p.identityNumber))return 'Nomor KTP hanya boleh berisi angka.';
      if(!d.gender || !p.religion || this.age===null || this.age>=120)return 'Jenis kelamin, agama, dan tanggal lahir yang valid wajib diisi.';
      if(!this.text(p.citizenIdAddress) || !/^\d{5}$/.test(d.postalCode) || !this.text(d.region) || !this.postalRegions.includes(d.region))return 'Lengkapi alamat KTP, kode pos, dan pilihan wilayah.';
      if(!p.sameAsCitizenIdAddress && !this.text(p.residentialAddress))return 'Alamat domisili wajib diisi.';
      if(!this.text(d.socialPlatform) || !this.text(d.socialUsername))return 'Media sosial dan username wajib diisi.';
      if(d.linkedinUrl && !this.url(d.linkedinUrl))return 'URL LinkedIn harus diawali https:// atau http://.';
    }
    if(step===3){if(!this.formalEducations.length)return 'Tambahkan pendidikan terakhir.';for(const e of this.formalEducations){
      if(!e.level || !this.text(e.institution) || !this.text(e.major) || !this.number(e.ipk))return 'Jenjang, institusi, jurusan, dan IPK / nilai wajib diisi.';
      if(!Number.isInteger(e.startYear) || !Number.isInteger(e.endYear) || Number(e.startYear)<1900 || Number(e.endYear)<Number(e.startYear) || Number(e.endYear)>this.currentYear)return 'Tahun pendidikan harus valid dan tahun selesai tidak boleh sebelum tahun mulai.';
      if(!this.documentName(this.educationKey(e,'diploma')) || !this.documentName(this.educationKey(e,'transcript')))return 'Ijazah dan transkrip wajib diunggah untuk setiap pendidikan (PDF, maks. 2 MB).';
    }}
    if(step===4 && !d.noExperience){if(!p.workExperiences.length)return 'Tambahkan pengalaman kerja atau pilih belum memiliki pengalaman.';for(const e of p.workExperiences){const w=this.workDetails(e);
      if(!this.text(e.companyName) || !this.text(e.position) || !w.employmentType || !this.text(w.industry) || !this.text(e.description) || !w.skills.length || !w.tools.length)return 'Lengkapi perusahaan, posisi, status, industri, deskripsi, skill, dan tools.';
      if(!e.startDate || e.startDate>this.today || !e.currentJob && (!e.endDate || e.endDate<e.startDate || e.endDate>this.today || !this.text(w.resignReason)))return 'Periksa bulan dan tahun kerja serta alasan resign. Tahun selesai tidak boleh sebelum mulai.';
    }}
    if(step===5 && (!this.number(p.expectedSalary) || !this.number(d.expectedSalaryMax) || Number(d.expectedSalaryMax)<Number(p.expectedSalary) || p.currentSalary!=null && !this.number(p.currentSalary)))return 'Isi rentang ekspektasi gaji yang valid. Maksimum harus sama atau lebih besar dari minimum.';
    if(step===6 && this.portfolioLinks.some(l=>l.url && (!this.text(l.title) || !this.url(l.url))))return 'Tautan portofolio harus memiliki judul dan URL http:// atau https:// yang valid.';
    if(step===7){if(!p.jobInterests.length || !p.preferredLocations.length || !this.text(p.source))return 'Fungsi, lokasi yang diminati, dan sumber informasi wajib diisi.';if(!d.languageSkills.length || d.languageSkills.some(l=>!this.text(l.name) || !l.proficiency))return 'Bahasa dan tingkat penguasaan wajib diisi.';if(!p.termsAccepted)return 'Syarat dan ketentuan harus disetujui.';}
    return '';
  }
  finish():void {
    if(this.saving)return;for(let step=1;step<=7;step++){const error=this.validateStep(step);if(error){this.step=step;this.error=error;return;}}
    this.error='';this.saving=true;this.profile.portfolios=[...this.profile.portfolios.filter(p=>p.type!=='LINK'),...this.portfolioLinks.filter(p=>p.url.trim()).map(p=>({type:'LINK',title:p.title.trim(),url:p.url.trim()}))];
    this.profile.tools=Array.from(new Set(this.profile.workExperiences.flatMap(exp=>this.workDetails(exp).tools))).slice(0,20);
    this.profile.relatedIndustries=Array.from(new Set(this.profile.workExperiences.map(exp=>this.workDetails(exp).industry))).slice(0,3);
    this.profile.languanges=this.details.languageSkills.map(l=>l.name).join(', ');this.profile.relatedJobPositions=[...this.profile.jobInterests];
    this.portal.saveProfile(this.profile,this.profilePicture,this.cvFile,this.portfolioFiles,this.supportingUploads).subscribe({next:profile=>{
      this.profile=profile;this.details=profile.profileDetails!;this.supportingUploads=[];this.cvFile=null;this.profilePicture=null;this.portfolioFiles=[];
      if(this.auth.session?.onboardingCompleted){this.router.navigateByUrl(this.returnUrl);return;}
      this.auth.completeOnboarding().subscribe({next:()=>this.router.navigateByUrl(this.returnUrl),error:err=>{this.saving=false;this.error=err?.error?.message||'Status onboarding gagal diperbarui. Data tersimpan; silakan coba lagi.';}});
    },error:err=>{this.saving=false;this.error=err?.error?.message||'Profil gagal disimpan. Periksa koneksi lalu coba lagi.';}});
  }
}
