import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CandidateProfile, EducationItem, WorkExperienceItem, WorkDetails, TalentProfileDetails, SupportingUpload, PortfolioItem } from '../../core/models/talent.models';
import { TalentAuthService } from '../../core/service/api/talent-auth.service';
import { TalentPortalService } from '../../core/service/api/talent-portal.service';
import { ChoiceFieldComponent } from '../../shared/choice-field.component';
import { TagSelectComponent } from '../../shared/tag-select.component';
import { TALENT_OPTIONS } from '../../shared/talent-options';
import { IconComponent } from '../../shared/icon.component';
import { OnboardingDraft } from '../../shared/onboarding-draft';
import { WordLimitDirective, wordCount } from '../../shared/word-limit.directive';
import { SearchSelectComponent } from '../../shared/search-select.component';
import { PostalRegionFieldComponent } from '../../shared/postal-region-field.component';
import { SocialAccountsFieldComponent } from '../../shared/social-accounts-field.component';
import { cleanSocial, socialError } from '../../shared/social-accounts';
@Component({selector:'app-talent-onboarding',standalone:true,imports:[CommonModule,FormsModule,RouterLink,ChoiceFieldComponent,TagSelectComponent,IconComponent,SearchSelectComponent,WordLimitDirective,PostalRegionFieldComponent,SocialAccountsFieldComponent],templateUrl:'./talent-onboarding.component.html'})
export class TalentOnboardingComponent implements OnInit, OnDestroy {
  profile!:CandidateProfile; details!:TalentProfileDetails; options=TALENT_OPTIONS;
  draft!:OnboardingDraft; draftRestored=false; private autosaveTimer:ReturnType<typeof setInterval>|null=null; private lastSig=''; private lastFileSig=''; private draftReady=false;
  step=1; saving=false; editing=false; error=''; returnUrl='/portal';
  today=new Date().toLocaleDateString('en-CA'); currentYear=new Date().getFullYear();
  cvFile:File|null=null; profilePicture:File|null=null; profilePicturePreviewUrl:string|null=null; portfolioFiles:File[]=[]; supportingUploads:SupportingUpload[]=[];
  portfolioLinks=[{title:'Portfolio',url:''}]; postalRegions:string[]=[]; postalLoading=false; postalError='';
  steps=['Data Diri','Pendidikan','Pengalaman Kerja','Pelatihan & Sertifikasi','Info Tambahan','Dokumen'];
  trainingTypes=['Workshop','Webinar','Seminar'];
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
      if(this.profile.profilePictureOriginalName)this.loadExistingProfilePicture();
      this.details={gender:'',postalCode:'',region:'',linkedinUrl:'',socialPlatform:'',socialUsername:'',expectedSalaryMax:null,noExperience:false,noTraining:false,noCertification:false,noLanguage:false,languageSkills:[],trainingCertifications:[],residentialPostalCode:'',residentialRegion:'',socialAccounts:[],...profile.profileDetails};this.details.socialAccounts ||= [];this.details.languageSkills ||= [];this.details.trainingCertifications ||= [];this.profile.profileDetails=this.details;
      if(['Talent Portal','Website'].includes(this.profile.source||'')) this.profile.source='';
      this.formalEducations.forEach(edu=>edu.clientKey ||= crypto.randomUUID());this.profile.workExperiences.forEach(exp=>this.workDetails(exp));
      if(!this.formalEducations.length)this.addEducation();if(!this.details.noExperience && !this.profile.workExperiences.length)this.addExperience();if(!this.details.noLanguage && !this.details.languageSkills.length)this.addLanguage();
      this.details.trainingCertifications.forEach(c=>c.key ||= crypto.randomUUID());if(!this.details.noTraining && !this.trainings.length)this.addTraining();if(!this.details.noCertification && !this.details.trainingCertifications.length)this.addTrainingCertification();
      if(this.details.postalCode)this.loadPostalRegions(this.details.postalCode,false);
      const links=this.profile.portfolios.filter(p=>p.type==='LINK' && p.url).map(p=>({title:p.title||'Portfolio',url:p.url||''}));if(links.length)this.portfolioLinks=links;
      this.restoreDraft();
    },error:()=>this.error='Profil kandidat gagal dimuat. Silakan coba lagi.'});
  }
  @HostListener('window:pagehide') flushDraft():void{this.persistDraft(true);}
  /** Pulihkan isian yang belum terkirim (mis. koneksi putus atau halaman tertutup) lalu mulai simpan otomatis. */
  private restoreDraft():void{
    this.draft=new OnboardingDraft(this.profile.email||this.auth.session?.email||'');
    const data=this.draft.load();
    if(data){
      const server=this.profile;
      this.profile={...server,...data.profile,cvOriginalName:server.cvOriginalName,profilePictureOriginalName:server.profilePictureOriginalName,supportingDocuments:server.supportingDocuments,portfolios:server.portfolios};
      this.details={...this.details,...data.details};
      this.portfolioLinks=data.portfolioLinks?.length?data.portfolioLinks:this.portfolioLinks;
      this.step=Math.min(6,Math.max(1,data.step||1));
      this.formalEducations.forEach(edu=>edu.clientKey ||= crypto.randomUUID());
      if(this.details.postalCode)this.loadPostalRegions(this.details.postalCode,false);
      this.draftRestored=true;
      this.draft.loadFiles().then(files=>{if(!files)return;
        if(files.cv&&!this.cvFile)this.cvFile=files.cv;
        if(files.picture&&!this.profilePicture){this.profilePicture=files.picture;if(this.profilePicturePreviewUrl)URL.revokeObjectURL(this.profilePicturePreviewUrl);this.profilePicturePreviewUrl=URL.createObjectURL(files.picture);}
        if(files.portfolio?.length&&!this.portfolioFiles.length)this.portfolioFiles=files.portfolio;
        files.docs?.forEach(d=>{if(!this.supportingUploads.some(u=>u.key===d.key))this.supportingUploads.push(d);});
        this.lastFileSig='';
      });
    }
    this.lastSig=this.snapshot();this.draftReady=true;
    this.autosaveTimer=setInterval(()=>this.persistDraft(false),1500);
  }
  private snapshot():string{return JSON.stringify({profile:this.profile,details:this.details,step:this.step,portfolioLinks:this.portfolioLinks});}
  private persistDraft(force:boolean):void{
    if(!this.draftReady||this.saving||!this.profile)return;
    const sig=this.snapshot();
    if(force||sig!==this.lastSig){this.lastSig=sig;this.draft.save({step:this.step,profile:this.profile,details:this.details,portfolioLinks:this.portfolioLinks});}
    const files=this.cvFile||this.profilePicture||this.portfolioFiles.length||this.supportingUploads.length;
    const fileSig=[this.cvFile,this.profilePicture,...this.portfolioFiles,...this.supportingUploads.map(u=>u.file)].map(f=>f?f.name+f.size+f.lastModified:'').join('|')+this.supportingUploads.map(u=>u.key).join(',');
    if(fileSig!==this.lastFileSig&&(files||this.lastFileSig)){this.lastFileSig=fileSig;this.draft.saveFiles({cv:this.cvFile,picture:this.profilePicture,portfolio:this.portfolioFiles,docs:this.supportingUploads});}
  }
  discardDraft():void{this.draft.clear();this.draftRestored=false;this.draftReady=false;if(this.autosaveTimer)clearInterval(this.autosaveTimer);this.autosaveTimer=null;this.cvFile=null;this.profilePicture=null;this.portfolioFiles=[];this.supportingUploads=[];this.step=1;this.error='';this.ngOnInit();}
  ngOnDestroy():void{this.persistDraft(true);if(this.autosaveTimer)clearInterval(this.autosaveTimer);if(this.profilePicturePreviewUrl)URL.revokeObjectURL(this.profilePicturePreviewUrl);}
  private loadExistingProfilePicture():void{this.portal.profilePicture().subscribe({next:blob=>{if(!blob.size)return;if(this.profilePicturePreviewUrl)URL.revokeObjectURL(this.profilePicturePreviewUrl);this.profilePicturePreviewUrl=URL.createObjectURL(blob);},error:()=>{this.profilePicturePreviewUrl=null;}});}
  get progress():number{return this.step/6*100;}
  get stepLabel():string{return String(this.step).padStart(2,'0');}
  get formalEducations():EducationItem[]{return this.profile?.educations.filter(e=>e.type==='FORMAL')||[];}
  get trainings():EducationItem[]{return this.profile?.educations.filter(e=>e.type==='INFORMAL')||[];}
  get existingPortfolioFiles():PortfolioItem[]{return this.profile?.portfolios.filter(item=>item.type==='FILE')||[];}
  get stepTitle():string{return ['Informasi pribadi','Pendidikan','Pengalaman kerja','Pelatihan dan sertifikasi','Informasi tambahan','CV dan portofolio'][this.step-1];}
  get stepDescription():string{return ['Lengkapi identitas, alamat, dan kontak yang dapat dihubungi.','Isi pendidikan terakhir beserta ijazah dan transkrip.','Ceritakan pengalaman, keahlian, dan pencapaian Anda.','Isi pelatihan dan sertifikasi yang Anda miliki, atau centang bila tidak memiliki.','Ekspektasi gaji, minat kerja, dan kemampuan bahasa.','Unggah CV terbaru dan dokumen atau tautan portofolio Anda.'][this.step-1];}
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
  addTraining():void{this.profile.educations.push({clientKey:crypto.randomUUID(),type:'INFORMAL',level:'',institution:'',major:'',startYear:null,endYear:null,ipk:null,description:''});}
  removeTraining(i:number):void{const t=this.trainings[i];this.profile.educations=this.profile.educations.filter(e=>e!==t);}
  toggleNoTraining():void{if(this.details.noTraining)this.profile.educations=this.profile.educations.filter(e=>e.type!=='INFORMAL');else if(!this.trainings.length)this.addTraining();}
  addTrainingCertification():void{this.details.trainingCertifications.push({key:crypto.randomUUID(),name:'',issuingOrganization:'',issueDate:'',expiryDate:'',credentialId:'',credentialUrl:''});}
  removeTrainingCertification(index:number):void{const [cert]=this.details.trainingCertifications.splice(index,1);if(cert?.key)this.removeUploads('certification:'+cert.key+':');}
  toggleNoCertification():void{if(this.details.noCertification){this.details.trainingCertifications.forEach(c=>c.key&&this.removeUploads('certification:'+c.key+':'));this.details.trainingCertifications=[];}else if(!this.details.trainingCertifications.length)this.addTrainingCertification();}
  toggleNoLanguage():void{if(this.details.noLanguage){this.details.languageSkills.forEach(l=>this.removeUploads('language:'+l.key+':'));this.details.languageSkills=[];}else if(!this.details.languageSkills.length)this.addLanguage();}
  certificateKey(cert:{key?:string|null}):string{return 'certification:'+cert.key+':certificate';}
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
  selectProfilePicture(event:Event):void{const file=this.selected(event,['jpg','jpeg','png'],10);if(file){this.profilePicture=file;if(this.profilePicturePreviewUrl)URL.revokeObjectURL(this.profilePicturePreviewUrl);this.profilePicturePreviewUrl=URL.createObjectURL(file);}}
  selectPortfolioFiles(event:Event):void{const input=event.target as HTMLInputElement,files=Array.from(input.files||[]);this.error='';if(files.length>10){this.error='Maksimal 10 file portofolio.';input.value='';return;}if(files.every(f=>this.validFile(f,['pdf','jpg','jpeg','png','doc','docx','zip'],10)))this.portfolioFiles=files;else input.value='';}
  selectDocument(event:Event,key:string):void{const file=this.selected(event,['pdf'],2);if(file){this.supportingUploads=this.supportingUploads.filter(u=>u.key!==key);this.supportingUploads.push({key,file});}}
  goToCompletedStep(target:number):void{if(target<this.step){this.step=target;this.error='';}}
  previous():void{this.error='';this.step=Math.max(1,this.step-1);}
  next():void{this.error=this.validateStep(this.step);if(!this.error)this.step=Math.min(6,this.step+1);}
  private text(value:unknown):boolean{return typeof value==='string' && !!value.trim();}
  private number(value:unknown):boolean{return value!==null && value!==undefined && value!=='' && Number.isFinite(Number(value)) && Number(value)>=0;}
  private url(value:string):boolean{try{return ['http:','https:'].includes(new URL(value).protocol);}catch{return false;}}
  validateStep(step:number):string {
    const p=this.profile,d=this.details;
    if(step===1){
      if(!this.text(p.fullName) || !this.text(p.email) || !/^\d{8,15}$/.test(p.phone||''))return 'Nama lengkap, email, dan WhatsApp wajib diisi. WhatsApp harus 8–15 digit angka.';
      if(wordCount(p.citizenIdAddress)>40 || wordCount(p.residentialAddress)>40)return 'Alamat maksimal 40 kata.';
      if(p.identityNumber && !/^\d+$/.test(p.identityNumber))return 'Nomor KTP hanya boleh berisi angka.';
      if(!d.gender || !p.religion || this.age===null || this.age>=120)return 'Jenis kelamin, agama, dan tanggal lahir yang valid wajib diisi.';
      if(!this.text(p.citizenIdAddress) || !/^\d{5}$/.test(d.postalCode) || !this.text(d.region) || !this.postalRegions.includes(d.region))return 'Lengkapi alamat KTP, kode pos, dan pilihan wilayah.';
      if(!p.sameAsCitizenIdAddress && !this.text(p.residentialAddress))return 'Alamat domisili wajib diisi.';
      if(!p.sameAsCitizenIdAddress && (!/^\d{5}$/.test(d.residentialPostalCode||'') || !this.text(d.residentialRegion||'')))return 'Lengkapi kode pos dan pilihan wilayah domisili.';
      if(!this.text(d.socialPlatform) || !this.text(d.socialUsername))return 'Media sosial dan username wajib diisi.';
      cleanSocial(d);const socialProblem=socialError(d);if(socialProblem)return socialProblem;
      if(d.linkedinUrl && !this.url(d.linkedinUrl))return 'URL LinkedIn harus diawali https:// atau http://.';
    }
    if(step===2){if(!this.formalEducations.length)return 'Tambahkan pendidikan terakhir.';for(const e of this.formalEducations){
      if(wordCount(e.description)>80)return 'Proyek atau penghargaan maksimal 80 kata.';
      if(!e.level || !this.text(e.institution) || !this.text(e.major) || !this.number(e.ipk))return 'Jenjang, institusi, jurusan, dan IPK / nilai wajib diisi.';
      if(!Number.isInteger(e.startYear) || !Number.isInteger(e.endYear) || Number(e.startYear)<1900 || Number(e.endYear)<Number(e.startYear) || Number(e.endYear)>this.currentYear)return 'Tahun pendidikan harus valid dan tahun selesai tidak boleh sebelum tahun mulai.';
      if(!this.documentName(this.educationKey(e,'diploma')) || !this.documentName(this.educationKey(e,'transcript')))return 'Ijazah dan transkrip wajib diunggah untuk setiap pendidikan (PDF, maks. 2 MB).';
    }}
    if(step===3 && !d.noExperience){if(!p.workExperiences.length)return 'Tambahkan pengalaman kerja atau pilih belum memiliki pengalaman.';for(const e of p.workExperiences){const w=this.workDetails(e);
      if(wordCount(e.description)>120)return 'Tugas dan pencapaian maksimal 120 kata.';if(wordCount(w.resignReason)>50)return 'Alasan berhenti maksimal 50 kata.';
      if(!this.text(e.companyName) || !this.text(e.position) || !w.employmentType || !this.text(w.industry) || !this.text(e.description) || !w.skills.length || !w.tools.length)return 'Lengkapi perusahaan, posisi, status, industri, deskripsi, skill, dan tools.';
      if(!e.startDate || e.startDate>this.today || !e.currentJob && (!e.endDate || e.endDate<e.startDate || e.endDate>this.today || !this.text(w.resignReason)))return 'Periksa bulan dan tahun kerja serta alasan resign. Tahun selesai tidak boleh sebelum mulai.';
    }}
    if(step===4){
      if(!d.noTraining){
        if(!this.trainings.length)return 'Tambahkan pelatihan atau centang tidak memiliki pelatihan.';
        for(const t of this.trainings){
          if(!this.trainingTypes.includes(t.level||'') || !this.text(t.major) || !this.text(t.institution))return 'Jenis, nama pelatihan, dan penyelenggara wajib diisi.';
          if(!Number.isInteger(t.startYear) || Number(t.startYear)<1900 || Number(t.startYear)>this.currentYear)return 'Tahun pelatihan harus valid.';
        }
      }
      if(!d.noCertification){
        if(!d.trainingCertifications.length)return 'Tambahkan sertifikasi atau centang tidak memiliki sertifikasi.';
        for(const c of d.trainingCertifications){
          if(!this.text(c.name) || !this.text(c.issuingOrganization) || !this.text(c.credentialId) || !c.issueDate || !c.expiryDate)return 'Lengkapi nama, penyelenggara atau institusi penerbit, nomor, dan masa berlaku sertifikasi.';
          if(c.expiryDate<c.issueDate)return 'Masa berlaku sertifikasi: tanggal akhir tidak boleh sebelum tanggal mulai.';
          if(!this.documentName(this.certificateKey(c)))return 'Upload sertifikat wajib diisi untuk setiap sertifikasi (PDF, maks. 2 MB).';
        }
      }
    }
    if(step===5){if(wordCount(p.about)>150)return 'Ringkasan profil maksimal 150 kata.';if(!this.number(p.expectedSalary) || !this.number(d.expectedSalaryMax) || Number(d.expectedSalaryMax)<Number(p.expectedSalary) || p.currentSalary!=null && !this.number(p.currentSalary))return 'Isi rentang ekspektasi gaji yang valid. Maksimum harus sama atau lebih besar dari minimum.';if(!p.jobInterests.length || !p.preferredLocations.length || !this.text(p.source))return 'Fungsi, lokasi yang diminati, dan sumber informasi wajib diisi.';if(!d.noLanguage && (!d.languageSkills.length || d.languageSkills.some(l=>!this.text(l.name) || !l.proficiency)))return 'Bahasa dan tingkat penguasaan wajib diisi, atau centang tidak memiliki keahlian berbahasa.';if(!d.noLanguage && d.languageSkills.some(l=>!this.documentName('language:'+l.key+':certificate')))return 'Sertifikat bahasa wajib diunggah untuk setiap bahasa (PDF, maks. 2 MB). Bila tidak memiliki sertifikat, centang tidak memiliki keahlian berbahasa.';if(!p.termsAccepted)return 'Syarat dan ketentuan harus disetujui.';}
    if(step===6){if(!this.cvFile && !p.cvOriginalName)return 'Upload CV terlebih dahulu.';if(this.portfolioLinks.some(l=>l.url && (!this.text(l.title) || !this.url(l.url))))return 'Tautan portofolio harus memiliki judul dan URL http:// atau https:// yang valid.';}
    return '';
  }
  finish():void {
    if(this.saving)return;for(let step=1;step<=6;step++){const error=this.validateStep(step);if(error){this.step=step;this.error=error;return;}}
    this.error='';this.saving=true;this.profile.portfolios=[...this.profile.portfolios.filter(p=>p.type!=='LINK'),...this.portfolioLinks.filter(p=>p.url.trim()).map(p=>({type:'LINK',title:p.title.trim(),url:p.url.trim()}))];
    this.profile.tools=Array.from(new Set(this.profile.workExperiences.flatMap(exp=>this.workDetails(exp).tools))).slice(0,20);
    this.profile.relatedIndustries=Array.from(new Set(this.profile.workExperiences.map(exp=>this.workDetails(exp).industry))).slice(0,3);
    this.profile.languanges=this.details.languageSkills.map(l=>l.name).join(', ');this.profile.relatedJobPositions=[...this.profile.jobInterests];
    this.portal.saveProfile(this.profile,this.profilePicture,this.cvFile,this.portfolioFiles,this.supportingUploads).subscribe({next:profile=>{
      this.draftReady=false;this.draft.clear();this.profile=profile;this.details=profile.profileDetails!;this.supportingUploads=[];this.cvFile=null;this.profilePicture=null;this.portfolioFiles=[];
      if(this.auth.session?.onboardingCompleted){this.router.navigateByUrl(this.returnUrl);return;}
      this.auth.completeOnboarding().subscribe({next:()=>this.router.navigateByUrl(this.returnUrl),error:err=>{this.saving=false;this.error=err?.error?.message||'Status onboarding gagal diperbarui. Data tersimpan; silakan coba lagi.';}});
    },error:err=>{this.saving=false;this.error=(navigator.onLine===false||err?.status===0)?'Koneksi terputus. Data Anda aman tersimpan di perangkat ini — periksa jaringan lalu tekan Simpan lagi.':(err?.error?.message||'Profil gagal disimpan. Data tetap tersimpan di perangkat ini; coba lagi.');}});
  }
}
