// js/main.js - v2.5 PURPLE THEME + HOME DASHBOARD WITH 5 LATEST JOBS PER STATE
class NEIJobPortal {
    constructor() {
        this.sectionsContainer = document.getElementById('sections-container');
        this.homeDashboard = document.getElementById('home-dashboard');
        this.stateSections = document.getElementById('state-sections');
        this.homeStatesGrid = document.getElementById('home-states-grid');
        this.currentState = 'assam';
        this.allJobs = [];
        this.centralGovtJobs = [];
        this.stateWiseData = {};
        window.app = this;
    }

    async init() {
        await this.loadAllJobs();
        this.setupEventListeners();
        this.showHome(); // Start with homepage dashboard
        console.log('%cNEI JOB PORTAL v2.5 - PURPLE DASHBOARD LIVE!', 'color: #667eea; font-size: 20px; font-weight: bold');
    }

    showHome() {
        this.homeDashboard.style.display = 'block';
        this.stateSections.style.display = 'none';
        document.querySelectorAll('.navbar a').forEach(a => a.classList.remove('active'));
        this.renderHomeDashboard();
    }

    // Render Homepage - 8 States with 5 Latest Jobs Each (Purple Compact Cards)
    renderHomeDashboard() {
            const states = [
                { key: 'assam', name: 'Assam' },
                { key: 'arunachal-pradesh', name: 'Arunachal Pradesh' },
                { key: 'nagaland', name: 'Nagaland' },
                { key: 'manipur', name: 'Manipur' },
                { key: 'meghalaya', name: 'Meghalaya' },
                { key: 'mizoram', name: 'Mizoram' },
                { key: 'tripura', name: 'Tripura' },
                { key: 'sikkim', name: 'Sikkim' }
            ];
        
            const today = new Date(); today.setHours(0,0,0,0);
        
            const html = states.map(state => {
                const jobs = (this.stateWiseData[state.key]?.latestJobs || [])
                    .filter(j => j.parsedDate && j.parsedDate >= today)
                    .slice(0, 12); // 12 jobs = perfect for double height cards
        
                const jobCards = jobs.length > 0 
                    ? this.renderJobItems(jobs)  // ← YEH WAHI PURANA FUNCTION! SAME DESIGN!
                    : '<p style="text-align:center;color:#95a5a6;padding:2rem;font-size:0.9rem;">No active jobs</p>';
        
                return `
                    <div class="section home-state-card" onclick="window.app.goToState('${state.key}')">
                        <div class="section-header" style="cursor:pointer;">
                            <h3 class="section-title-mini">Latest ${state.name} Jobs</h3>
                        </div>
                        <div class="job-list">
                            ${jobCards}
                        </div>
                    </div>
                `;
            }).join('');
        
            this.homeStatesGrid.innerHTML = html;
        }
    goToState(state) {
        this.currentState = state;
        this.homeDashboard.style.display = 'none';
        this.stateSections.style.display = 'block';
        document.querySelectorAll('.navbar a').forEach(a => a.classList.remove('active'));
        document.querySelector(`.navbar a[data-state="${state}"]`)?.classList.add('active');
        this.renderStateSections(state);
    }

    // Tera Original Code (Unchanged - Latest Jobs, Results, etc.)
    async loadAllJobs() {
        try {
            const { data, error } = await supabase
                .from('jobs')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            if (!data || data.length === 0) {
                this.homeStatesGrid.innerHTML = '<p style="text-align:center; color:#95a5a6;">No jobs found.</p>';
                return;
            }
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            this.allJobs = data.map(job => {
                const parsed = this.parseDate(job.lastdate);
                return { ...job, parsedDate: parsed };
            });
            this.centralGovtJobs = this.allJobs.filter(job => {
                const s = (job.state || '').toLowerCase().trim();
                return s.includes('central') || s.includes('upsc') || s.includes('ssc') || s.includes('railway') || s.includes('ibps') || s.includes('all india');
            });
            this.buildStateData();
        } catch (err) {
            console.error('Supabase Error:', err);
            this.homeStatesGrid.innerHTML = '<p style="color:red; text-align:center;">Failed to load jobs.</p>';
        }
    }

    parseDate(raw) {
        if (!raw) return null;
        const str = String(raw).trim();
        if (!str) return null;
        let d = new Date(str);
        if (!isNaN(d)) return d;
        const match = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
        if (match) {
            const [_, day, month, year] = match;
            d = new Date(`${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')} 23:59:59`);
            if (!isNaN(d)) return d;
        }
        const clean = str.replace(/(st|nd|rd|th)/gi, '');
        d = new Date(clean);
        if (!isNaN(d)) return d;
        return null;
    }

    buildStateData() {
        const states = [
            'assam', 'arunachal-pradesh', 'manipur', 'meghalaya',
            'mizoram', 'nagaland', 'tripura', 'sikkim'
        ];
        this.stateWiseData = {};
        states.forEach(state => {
            const stateJobs = this.allJobs.filter(job => {
                const jobState = (job.state || '').toLowerCase().trim();
                const target = state.toLowerCase();
                return jobState === target ||
                       jobState.includes(target) ||
                       jobState.replace(/\s+/g, '-') === target ||
                       (jobState === 'arunachal pradesh' && target === 'arunachal-pradesh');
            });
            this.stateWiseData[state] = {
                latestJobs: stateJobs.filter(j => j.category === 'latestJobs' || !j.category),
                results: stateJobs.filter(j => j.category === 'results'),
                admitCards: stateJobs.filter(j => j.category === 'admitCards'),
                answerKeys: stateJobs.filter(j => j.category === 'answerKeys'),
                centralGovtJobs: this.centralGovtJobs,
                privateJobs: stateJobs.filter(j => j.category === 'privateJobs')
            };
        });
    }

    renderStateSections(state) {
        this.currentState = state;
        const data = this.stateWiseData[state] || {};
        const sectionsConfig = [
            { id: `${state}-latest-jobs`, title: "Latest Jobs", data: data.latestJobs || [], icon: "🆕" },
            { id: `${state}-results`, title: "Results", data: data.results || [], icon: "📊", special: 'result' },
            { id: `${state}-admit-cards`, title: "Admit Cards", data: data.admitCards || [], icon: "🎫", special: 'admit' },
            { id: `${state}-answer-keys`, title: "Answer Key", data: data.answerKeys || [], icon: "🔑", special: 'answerkey' },
            { id: `${state}-central-govt`, title: "Central Govt Jobs", data: this.centralGovtJobs, icon: "🇮🇳" },
            { id: `${state}-private-jobs`, title: "Private Jobs", data: data.privateJobs || [], icon: "💼" }
        ];
        this.sectionsContainer.innerHTML = sectionsConfig.map(section => `
            <div class="section" id="${section.id}">
                <div class="section-header">
                   <h3 class="section-title-mini">
                        ${section.icon} ${section.title}
                    </h3>
                </div>
                <div class="job-list">
                    ${this.renderJobItems(section.data, section.special)}
                </div>
            </div>
        `).join('');
    }

    renderJobItems(jobs, type = '') {
        if (!jobs || jobs.length === 0) {
            return '<p style="text-align:center; color:#95a5a6; padding:2rem;">No active jobs available</p>';
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return jobs.map(job => {
            if (type === 'result' || type === 'admit' || type === 'answerkey') {
                const start = job.startdate ? this.formatDate(job.startdate) : 'Not Announced';
                const end = job.lastdate ? this.formatDate(job.lastdate) : 'Not Announced';
                return `
                    <a href="pages/detail.html?id=${job.id}" class="job-item compact-card">
                        <div class="job-title-inline">
                            ${job.title}
                            <span class="date-inline">Start: ${start} | End: ${end}</span>
                        </div>
                    </a>
                `;
            }
            let dateText = '';
            if (job.parsedDate) {
                const d = job.parsedDate;
                const formatted = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
                const daysLeft = Math.ceil((d - today) / 86400000);
                const color = daysLeft > 7 ? '#27ae60' : daysLeft > 3 ? '#f39c12' : '#e74c3c';
                dateText = `Last Date: <strong style="color:${color}">${formatted}</strong> <small>(${daysLeft} day${daysLeft > 1 ? 's' : ''} left)</small>`;
            } else {
                dateText = '<span style="color:#95a5a6;">Date Not Announced</span>';
            }
            return `
                <a href="pages/detail.html?id=${job.id}" class="job-item compact-card">
                    <div class="job-title-inline">
                        ${job.title}
                        <span class="date-inline">${dateText}</span>
                    </div>
                </a>
            `;
        }).join('');
    }

    formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        const d = new Date(dateStr);
        if (isNaN(d)) return dateStr;
        return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
    }

    setupEventListeners() {
        document.querySelectorAll('.navbar a[data-state]').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                this.goToState(link.dataset.state);
            });
        });
    }
}

// START APP
document.addEventListener('DOMContentLoaded', () => {
    if (typeof supabase === 'undefined') {
        console.error('Supabase client not loaded!');
        return;
    }
    new NEIJobPortal().init();
});
