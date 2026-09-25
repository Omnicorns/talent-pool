(() => {
  const APP_BASE = location.pathname.includes('/talent') ? location.pathname.split('/talent')[0] : '';\n  const API = APP_BASE + '/api/talent';
  const TOKEN_KEY = 'talentPortalToken';
  let token = localStorage.getItem(TOKEN_KEY) || '';
  let me = null;
  let profile = null;
  let jobs = [];
  let applications = [];

  const $ = (id) => document.getElementById(id);
  const esc = (v='') => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const date = (v) => v ? new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(v)) : '-';
  const split3 = (v) => String(v || '').split(',').map(s=>s.trim()).filter(Boolean).slice(0,3);
  const toast = (msg, type='') => {
    const el=$('toast'); el.textContent=msg; el.className='toast show '+type;
    clearTimeout(toast.t); toast.t=setTimeout(()=>el.className='toast',3300);
  };
  const setBusy=(btn,busy,label)=>{ if(!btn)return; if(busy){btn.dataset.old=btn.textContent;btn.textContent=label||'Memproses...';btn.disabled=true}else{btn.textContent=btn.dataset.old||btn.textContent;btn.disabled=false} };

  async function request(path, options={}) {
    const headers = new Headers(options.headers || {});
    if (token) headers.set('Authorization', 'Bearer '+token);
    if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) headers.set('Content-Type','application/json');
    const res = await fetch(path.startsWith('/api') ? path : API+path, {...options, headers});
    if (res.status === 401 || res.status === 403) {
      if (!path.includes('/auth/login') && !path.includes('/auth/register')) logout(false);
    }
    if (!res.ok) {
      let message='Permintaan gagal';
      try { const e=await res.json(); message=e.message || e.error || message; } catch {}
      throw new Error(message);
    }
    if (res.status===204) return null;
    const ct=res.headers.get('content-type')||'';
    return ct.includes('application/json') ? res.json() : res.blob();
  }

  function authMode(mode){
    document.querySelectorAll('.auth-tab').forEach(b=>b.classList.toggle('active',b.dataset.authTab===mode));
    $('loginForm').classList.toggle('active',mode==='login');
    $('registerForm').classList.toggle('active',mode==='register');
  }

  async function bootstrap(){
    if(!token){ showAuth(); return; }
    try{
      me=await request('/auth/me');
      showPortal();
      await loadAll();
    }catch(e){ logout(false); toast('Sesi login berakhir, silakan masuk kembali.','error'); }
  }

  function showAuth(){
    $('authView').classList.remove('hidden'); $('portalView').classList.add('hidden');
  }
  function showPortal(){
    $('authView').classList.add('hidden'); $('portalView').classList.remove('hidden');
    $('userName').textContent=me?.fullName||'Talent';
    $('userEmail').textContent=me?.email||'-';
    $('userInitial').textContent=(me?.fullName||'T').trim().charAt(0).toUpperCase();
    $('helloText').textContent='Halo, '+(me?.fullName?.split(' ')[0]||'Talent');
  }
  function logout(message=true){
    token=''; me=null; profile=null; jobs=[]; applications=[];
    localStorage.removeItem(TOKEN_KEY); showAuth(); authMode('login');
    if(message) toast('Anda berhasil keluar.','success');
  }

  async function loadAll(){
    const results=await Promise.allSettled([loadProfile(),loadJobs(),loadApplications()]);
    if(results.some(r=>r.status==='rejected')) console.warn(results);
    renderDashboard();
  }

  async function loadProfile(){
    profile=await request('/profile');
    renderProfile();
  }
  async function loadJobs(q=''){
    const params=new URLSearchParams({page:'0',size:'100',sort:'updatedAt,desc'});
    if(q) params.set('q',q);
    const data=await request('/jobs?'+params.toString());
    jobs=data.content||[];
    renderJobs();
    return jobs;
  }
  async function loadApplications(){
    const data=await request('/applications?page=0&size=100&sort=updatedAt,desc');
    applications=data.content||[];
    renderApplications();
    return applications;
  }

  function navigate(page){
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    $('page-'+page)?.classList.add('active');
    document.querySelectorAll('.nav-item[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===page));
    const titles={dashboard:'Dashboard',profile:'Profil Saya',jobs:'Lowongan Aktif',applications:'Lamaran Saya',security:'Keamanan Akun'};
    $('pageTitle').textContent=titles[page]||'Talent Portal';
    $('portalView').classList.remove('sidebar-open');
    if(page==='jobs') loadJobs($('jobSearch').value.trim()).catch(e=>toast(e.message,'error'));
    if(page==='applications') loadApplications().catch(e=>toast(e.message,'error'));
  }

  function renderDashboard(){
    $('kpiJobs').textContent=jobs.length;
    $('kpiApplications').textContent=applications.length;
    $('kpiStage').textContent=applications[0]?.stage ? stageLabel(applications[0].stage) : 'Belum ada';
    $('dashboardJobs').innerHTML=jobs.length ? jobs.slice(0,4).map(jobMini).join('') : empty('Belum ada lowongan aktif','Lowongan baru akan tampil di sini.');
    $('dashboardApplications').innerHTML=applications.length ? applications.slice(0,4).map(applicationRow).join('') : empty('Belum ada lamaran','Mulai dengan melihat lowongan yang tersedia.');
  }

  function jobMini(j){
    return '<div class="job-mini"><div class="job-mini-main"><h3>'+esc(j.title)+'</h3><p>'+esc(j.department||'-')+' • '+esc(j.location||'-')+'</p></div><button class="text-action" data-job="'+esc(j.id)+'">Detail</button></div>';
  }
  function jobCard(j){
    return '<article class="job-card"><div class="job-top"><div><h3>'+esc(j.title)+'</h3><div class="job-meta">'+esc(j.department||'-')+'<br>'+esc(j.location||'-')+' • '+esc(employment(j.employmentType))+'</div></div><span class="badge red">'+esc(j.openings||1)+' posisi</span></div><p>'+esc(j.description||'Detail pekerjaan akan diinformasikan pada proses rekrutmen.')+'</p><div class="job-actions"><small>Batas: '+esc(date(j.applicationDeadline))+'</small><button class="text-action" data-job="'+esc(j.id)+'">Lihat detail →</button></div></article>';
  }
  function renderJobs(){
    $('jobsGrid').innerHTML=jobs.length ? jobs.map(jobCard).join('') : empty('Lowongan tidak ditemukan','Coba kata kunci lain atau cek kembali nanti.');
    renderDashboard();
  }

  function stageLabel(s){
    return ({NEW_CANDIDATE:'Kandidat Baru',SCREENING:'Screening',INTERVIEW:'Interview',OFFER:'Offering',HIRED:'Hired',REJECTED:'Tidak Dilanjutkan'})[s]||s||'-';
  }
  function statusBadge(s){
    const cls=s==='ACTIVE'?'green':s==='HIRED'?'green':s==='WITHDRAWN'?'amber':'red';
    return '<span class="badge '+cls+'">'+esc(s||'-')+'</span>';
  }
  function applicationRow(a){
    const withdraw = a.status==='ACTIVE' ? '<button class="text-action" data-withdraw="'+esc(a.id)+'">Tarik lamaran</button>' : '';
    return '<div class="application-item"><div class="application-main"><h3>'+esc(a.jobTitle)+'</h3><p>Melamar '+esc(date(a.appliedAt))+' • Tahap: '+esc(stageLabel(a.stage))+'</p></div><div class="application-side">'+statusBadge(a.status)+'<small>'+withdraw+'</small></div></div>';
  }
  function renderApplications(){
    $('applicationsList').innerHTML=applications.length ? applications.map(applicationRow).join('') : empty('Belum ada lamaran','Pilih lowongan dan kirim lamaran pertama Anda.');
    renderDashboard();
  }

  function renderProfile(){
    if(!profile)return;
    $('profileFullName').value=profile.fullName||'';
    $('profileEmail').value=profile.email||'';
    $('profilePhone').value=profile.phone||'';
    $('profileBirthDate').value=profile.birthDate||'';
    $('profileIdentity').value=profile.identityNumber||'';
    $('profileReligion').value=profile.religion||'';\n    if($('profileLanguage')) $('profileLanguage').value=profile.languanges||'';
    $('profileCitizenAddress').value=profile.citizenIdAddress||'';
    $('profileResidentialAddress').value=profile.residentialAddress||'';
    $('profileSameAddress').checked=!!profile.sameAsCitizenIdAddress;
    $('profileJobInterests').value=(profile.jobInterests||[]).join(', ');
    $('profileLocations').value=(profile.preferredLocations||[]).join(', ');
    $('profileIndustries').value=(profile.relatedIndustries||[]).join(', ');
    $('profilePositions').value=(profile.relatedJobPositions||[]).join(', ');
    $('profileTools').value=(profile.tools||[]).join(', ');
    $('profileExpectedSalary').value=profile.expectedSalary??'';
    $('cvLabel').textContent=profile.cvOriginalName ? 'CV saat ini: '+profile.cvOriginalName : 'Pilih CV baru';
  }

  function empty(title,desc){ return '<div class="empty"><strong>'+esc(title)+'</strong><span>'+esc(desc)+'</span></div>'; }
  function employment(v){return ({FULL_TIME:'Full Time',PART_TIME:'Part Time',CONTRACT:'Kontrak',INTERNSHIP:'Internship',FREELANCE:'Freelance'})[v]||v||'-'}

  async function openJob(id){
    try{
      const j=await request('/jobs/'+id);
      const already=applications.some(a=>a.jobListingId===id);
      $('jobModalBody').innerHTML='<span class="eyebrow red">JOB OPPORTUNITY</span><h2>'+esc(j.title)+'</h2><div class="job-meta">'+esc(j.department||'-')+' • '+esc(j.location||'-')+' • '+esc(employment(j.employmentType))+'</div><p class="modal-description">'+esc(j.description||'Tidak ada deskripsi tambahan.')+'</p><div class="modal-actions">'+(already?'<span class="badge green">Sudah dilamar</span>':'<button class="btn primary" data-apply="'+esc(j.id)+'">Lamar Posisi Ini</button>')+'</div>';
      $('jobModal').classList.remove('hidden');
    }catch(e){toast(e.message,'error')}
  }
  function closeModal(){$('jobModal').classList.add('hidden')}
  async function applyJob(id){
    const btn=document.querySelector('[data-apply="'+CSS.escape(id)+'"]'); setBusy(btn,true,'Mengirim...');
    try{
      await request('/jobs/'+id+'/apply',{method:'POST',body:JSON.stringify({notes:'Dilamar melalui Sarinah Talent Portal'})});
      toast('Lamaran berhasil dikirim.','success'); closeModal(); await loadApplications(); navigate('applications');
    }catch(e){toast(e.message,'error')}finally{setBusy(btn,false)}
  }
  async function withdraw(id){
    if(!confirm('Tarik lamaran ini? Tindakan ini tidak dapat dibatalkan dari portal.'))return;
    try{await request('/applications/'+id+'/withdraw',{method:'PATCH'});toast('Lamaran berhasil ditarik.','success');await loadApplications()}catch(e){toast(e.message,'error')}
  }

  $('loginForm').addEventListener('submit',async e=>{
    e.preventDefault(); const btn=$('loginBtn');setBusy(btn,true,'Masuk...');
    try{
      const data=await request('/auth/login',{method:'POST',body:JSON.stringify({email:$('loginEmail').value.trim(),password:$('loginPassword').value})});
      token=data.accessToken;localStorage.setItem(TOKEN_KEY,token);me={candidateId:data.candidateId,email:data.email,fullName:data.fullName};showPortal();await loadAll();toast('Login berhasil.','success');
    }catch(e){toast(e.message,'error')}finally{setBusy(btn,false)}
  });

  $('registerForm').addEventListener('submit',async e=>{
    e.preventDefault(); const btn=$('registerBtn');setBusy(btn,true,'Membuat akun...');
    try{
      const payload={fullName:$('registerName').value.trim(),email:$('registerEmail').value.trim(),phone:$('registerPhone').value.trim(),password:$('registerPassword').value,termsAccepted:$('registerTerms').checked};
      const data=await request('/auth/register',{method:'POST',body:JSON.stringify(payload)});
      token=data.accessToken;localStorage.setItem(TOKEN_KEY,token);me={candidateId:data.candidateId,email:data.email,fullName:data.fullName};showPortal();await loadAll();toast('Akun berhasil dibuat. Lengkapi profil Anda.','success');navigate('profile');
    }catch(e){toast(e.message,'error')}finally{setBusy(btn,false)}
  });

  $('profileForm').addEventListener('submit',async e=>{
    e.preventDefault(); const btn=$('saveProfileBtn');setBusy(btn,true,'Menyimpan...');
    try{
      const payload={
        fullName:$('profileFullName').value.trim(),email:profile.email,phone:$('profilePhone').value.trim(),
        birthDate:$('profileBirthDate').value||null,identityNumber:$('profileIdentity').value.trim()||null,
        citizenIdAddress:$('profileCitizenAddress').value.trim()||null,residentialAddress:$('profileResidentialAddress').value.trim()||null,
        languanges:$('profileLanguage')?.value.trim()||profile.languanges||null,religion:$('profileReligion').value.trim()||null,
        sameAsCitizenIdAddress:$('profileSameAddress').checked,currentSalary:profile.currentSalary??null,
        expectedSalary:$('profileExpectedSalary').value ? Number($('profileExpectedSalary').value) : null,
        source:profile.source||'Talent Portal',termsAccepted:true,
        relatedIndustries:split3($('profileIndustries').value),relatedJobPositions:split3($('profilePositions').value),
        tools:split3($('profileTools').value),jobInterests:split3($('profileJobInterests').value),
        preferredLocations:split3($('profileLocations').value),
        educations:(profile.educations||[]).map(x=>({type:x.type,level:x.level,institution:x.institution,major:x.major,startYear:x.startYear,endYear:x.endYear,description:x.description,ipk:x.ipk})),
        workExperiences:(profile.workExperiences||[]).map(x=>({companyName:x.companyName,position:x.position,startDate:x.startDate,endDate:x.endDate,currentJob:x.currentJob,description:x.description})),
        portfolioLinks:(profile.portfolios||[]).filter(x=>x.type==='LINK').map(x=>({title:x.title,url:x.url}))
      };
      const fd=new FormData();fd.append('data',new Blob([JSON.stringify(payload)],{type:'application/json'}));
      const cv=$('profileCv').files[0];if(cv)fd.append('cv',cv);
      profile=await request('/profile',{method:'PUT',body:fd});renderProfile();me.fullName=profile.fullName;$('userName').textContent=profile.fullName;$('helloText').textContent='Halo, '+profile.fullName.split(' ')[0];toast('Profil berhasil diperbarui.','success');
    }catch(e){toast(e.message,'error')}finally{setBusy(btn,false)}
  });

  $('passwordForm').addEventListener('submit',async e=>{
    e.preventDefault(); const next=$('newPassword').value;
    if(next!==$('confirmPassword').value){toast('Konfirmasi password baru tidak sama.','error');return}
    const btn=$('changePasswordBtn');setBusy(btn,true,'Mengubah...');
    try{
      await request('/auth/change-password',{method:'PATCH',body:JSON.stringify({currentPassword:$('currentPassword').value,newPassword:next})});
      e.target.reset();toast('Password berhasil diubah.','success');
    }catch(e){toast(e.message,'error')}finally{setBusy(btn,false)}
  });

  $('downloadCvBtn').addEventListener('click',async()=>{
    try{
      const res=await fetch(API+'/profile/cv',{headers:{Authorization:'Bearer '+token}});
      if(!res.ok){let m='CV belum tersedia';try{m=(await res.json()).message||m}catch{}throw new Error(m)}
      const blob=await res.blob();const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=profile?.cvOriginalName||'CV.pdf';a.click();URL.revokeObjectURL(url);
    }catch(e){toast(e.message,'error')}
  });

  $('profileCv').addEventListener('change',e=>{$('cvLabel').textContent=e.target.files[0]?.name||'Pilih CV baru'});
  $('profileSameAddress').addEventListener('change',e=>{if(e.target.checked)$('profileResidentialAddress').value=$('profileCitizenAddress').value});
  $('jobSearchBtn').addEventListener('click',()=>loadJobs($('jobSearch').value.trim()).catch(e=>toast(e.message,'error')));
  $('jobSearch').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('jobSearchBtn').click()}});
  $('logoutBtn').addEventListener('click',()=>logout());
  $('menuBtn').addEventListener('click',()=>$('portalView').classList.toggle('sidebar-open'));
  document.querySelectorAll('.auth-tab').forEach(b=>b.addEventListener('click',()=>authMode(b.dataset.authTab)));
  document.querySelectorAll('.password-toggle').forEach(b=>b.addEventListener('click',()=>{const i=$(b.dataset.target);i.type=i.type==='password'?'text':'password';b.textContent=i.type==='password'?'Lihat':'Sembunyi'}));
  document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.go)));
  document.querySelectorAll('.nav-item[data-page]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.page)));

  document.addEventListener('click',e=>{
    const job=e.target.closest('[data-job]');if(job)openJob(job.dataset.job);
    const apply=e.target.closest('[data-apply]');if(apply)applyJob(apply.dataset.apply);
    const wd=e.target.closest('[data-withdraw]');if(wd)withdraw(wd.dataset.withdraw);
    if(e.target.matches('[data-close-modal]'))closeModal();
  });

  bootstrap();
})();
