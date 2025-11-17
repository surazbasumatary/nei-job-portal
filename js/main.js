class NEIJobPortal {
    constructor() {
        this.homeDashboard = document.getElementById('home-dashboard');
        this.stateSections = document.getElementById('state-sections');
        this.homeStatesGrid = document.getElementById('home-states-grid');
        this.sectionsContainer = document.getElementById('sections-container');
        this.allJobs = [];
        this.centralGovtJobs = [];
        this.stateWiseData = {};
        window.app = this;
    }

    async init() {
        await this.loadAllJobs();
        this.setupEventListeners();
        this.showHome();
        console.log('%cNEI JOB PORTAL → FULLY WORKING WITH HOME DASHBOARD!', 'color:#667eea;font-size:18px;font-weight:bold');
    }

    showHome() {
        this.homeDashboard.style.display = 'block';
        this.stateSections.style.display = 'none';
        document.querySelectorAll('.navbar a').forEach(a => a.classList.remove('active'));
        document.getElementById('home-tab')?.classList.add('active');
        this.renderHomeDashboard();
    }

    renderHomeDashboard() {
        const states = [
            {key:'assam', name:'Assam'}, {key:'nagaland', name:'Nagaland'},
            {key:'manipur', name:'Manipur'}, {key:'meghalaya', name:'Meghalaya'},
            {key:'tripura', name:'Tripura'}, {key:'sikkim', name:'Sikkim'},
            {key:'arunachal-pradesh', name:'Arunachal Pradesh'},{key:'mizoram', name:'Mizoram'}
        ];

        const today = new Date(); today.setHours(0,0,0,0);

        const html = states.map(state => {
            const jobs = (this.stateWiseData[state.key]?.latestJobs || [])
                .filter(j => j.parsedDate && j.parsedDate >= today)
                .slice(0, 15);

            const cards = jobs.length ? this.renderJobItemsForHome(jobs)
            : '<p style="text-align:center;color:#95a5a6;padding:2rem;font-size:0.9rem;">No active jobs</p>';
            return `
                <div class="section" onclick="window.app.goToState('${state.key}')">
                    <div class="section-header" style="cursor:pointer;background:linear-gradient(135deg,#667eea,#764ba2);">
                        <h3 class="section-title-mini">Latest ${state.name} Jobs</h3>
                    </div>
                    <div class="job-list">${cards}</div>
                </div>
            `;
        }).join('');

        this.homeStatesGrid.innerHTML = html;
    }

    goToState(state) {
        this.homeDashboard.style.display = 'none';
        this.stateSections.style.display = 'block';
        document.querySelectorAll('.navbar a').forEach(a => a.classList.remove('active'));
        document.querySelector(`.navbar a[data-state="${state}"]`)?.classList.add('active');
        this.renderStateSections(state);
    }

    setupEventListeners() {
        document.querySelectorAll('.navbar a[data-state]').forEach(link => {
            link.addEventListener('click', e => { e.preventDefault(); this.goToState(link.dataset.state); });
        });
        document.getElementById('home-tab')?.addEventListener('click', e => { e.preventDefault(); this.showHome(); });
        document.getElementById('logo-home')?.addEventListener('click', () => this.showHome());
    }

    // ==== TERA ORIGINAL WORKING CODE (No Change) ====
    async loadAllJobs() {
        try {
            const { data, error } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            if (!data || data.length === 0) return;
            const today = new Date(); today.setHours(0,0,0,0);
            this.allJobs = data.map(job => ({ ...job, parsedDate: this.parseDate(job.lastdate) }));
            this.centralGovtJobs = this.allJobs.filter(j => (j.state||'').toLowerCase().includes('central') || (j.state||'').toLowerCase().includes('all india'));
            this.buildStateData();
        } catch (err) { console.error(err); }
    }

    parseDate(raw) { /* tera original parseDate code yahan paste kar */ 
        if (!raw) return null; const str = String(raw).trim(); if (!str) return null;
        let d = new Date(str); if (!isNaN(d)) return d;
        const match = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
        if (match) { const [_,day,month,year] = match; d = new Date(`${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')} 23:59:59`); if (!isNaN(d)) return d; }
        return null;
    }

    buildStateData() {
        const states = ['assam','arunachal-pradesh','manipur','meghalaya','mizoram','nagaland','tripura','sikkim'];
        this.stateWiseData = {};
        states.forEach(s => {
            const jobs = this.allJobs.filter(j => (j.state||'').toLowerCase().replace(/\s+/g,'-').includes(s));
            this.stateWiseData[s] = {
                latestJobs: jobs.filter(j => !j.category || j.category === 'latestJobs'),
                results: jobs.filter(j => j.category === 'results'),
                admitCards: jobs.filter(j => j.category === 'admitCards'),
                answerKeys: jobs.filter(j => j.category === 'answerKeys'),
                privateJobs: jobs.filter(j => j.category === 'privateJobs')
            };
        });
    }

    renderStateSections(state) {
        const data = this.stateWiseData[state] || {};
        const sections = [
            {title:"Latest Jobs", data:data.latestJobs || [], icon:"New"},
            {title:"Results", data:data.results || [], icon:"Result", special:'result'},
            {title:"Admit Cards", data:data.admitCards || [], icon:"Card", special:'admit'},
            {title:"Answer Key", data:data.answerKeys || [], icon:"Key", special:'answerkey'},
            {title:"Central Govt Jobs", data:this.centralGovtJobs, icon:"India Flag"},
            {title:"Private Jobs", data:data.privateJobs || [], icon:"Briefcase"}
        ];
        this.sectionsContainer.innerHTML = sections.map(sec => `
            <div class="section">
                <div class="section-header"><h3 class="section-title-mini">${sec.icon} ${sec.title}</h3></div>
                <div class="job-list">${this.renderJobItems(sec.data, sec.special)}</div>
            </div>
        `).join('');
    }
            // SIRF HOME DASHBOARD KE LIYE — 4 Jobs + No Apply Button
        renderJobItemsForHome(jobs) {
            if (!jobs || jobs.length === 0) {
                return '<p style="text-align:center;color:#95a5a6;padding:2rem;font-size:0.9rem;">No active jobs</p>';
            }
            const today = new Date(); today.setHours(0,0,0,0);
            
            return jobs.slice(0, 3).map(job => {  // Sirf 4 jobs
                let dateText = job.parsedDate ? (() => {
                    const d = job.parsedDate;
                    const formatted = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
                    const daysLeft = Math.ceil((d - today) / 86400000);
                    const color = daysLeft > 7 ? '#27ae60' : daysLeft > 3 ? '#f39c12' : '#e74c3c';
                    return `Last Date: <strong style="color:${color}">${formatted}</strong> <small>(${daysLeft} day${daysLeft>1?'s':''} left)</small>`;
                })() : '<span style="color:#95a5a6;">Date Not Announced</span>';
        
                return `<a href="pages/detail.html?id=${job.id}" class="job-item compact-card" style="justify-content: flex-start;">
                    <div class="job-title-inline">${job.title}
                        <span class="date-inline">${dateText}</span>
                    </div>
                    <!-- Apply button nahi hai yahan -->
                </a>`;
            }).join('');
        }

    renderJobItems(jobs, type = '') {
        if (!jobs || jobs.length === 0) return '<p style="text-align:center;color:#95a5a6;padding:2rem;">No jobs available</p>';
        const today = new Date(); today.setHours(0,0,0,0);
        return jobs.map(job => {
            if (type) {
                const start = job.startdate ? this.formatDate(job.startdate) : 'N/A';
                const end = job.lastdate ? this.formatDate(job.lastdate) : 'N/A';
                return `<a href="pages/detail.html?id=${job.id}" class="job-item compact-card">
                    <div class="job-title-inline">${job.title}<span class="date-inline">Start: ${start} | End: ${end}</span></div>
                </a>`;
            }
            const dateText = job.parsedDate ? (() => {
                const d = job.parsedDate;
                const formatted = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
                const daysLeft = Math.ceil((d - today) / 86400000);
                const color = daysLeft > 7 ? '#27ae60' : daysLeft > 3 ? '#f39c12' : '#e74c3c';
                return `Last Date: <strong style="color:${color}">${formatted}</strong> <small>(${daysLeft} day${daysLeft>1?'s':''} left)</small>`;
            })() : '<span style="color:#95a5a6;">Date Not Announced</span>';

            return `<a href="pages/detail.html?id=${job.id}" class="job-item compact-card">
                <div class="job-title-inline">${job.title}<span class="date-inline">${dateText}</span></div>
            </a>`;
        }).join('');
    }

    formatDate(d) { if (!d) return 'N/A'; const date = new Date(d); return isNaN(date) ? d : `${String(date.getDate()).padStart(2,'0')}/${String(date.getMonth()+1).padStart(2,'0')}/${date.getFullYear()}`; }
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof supabase === 'undefined') return console.error('Supabase not loaded');
    new NEIJobPortal().init();
});
