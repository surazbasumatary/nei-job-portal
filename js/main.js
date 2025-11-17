// js/main.js - FINAL v4.0 → Home Dashboard + Original 3-Column Design
class NEIJobPortal {
    constructor() {
        this.sectionsContainer = document.getElementById('sections-container');
        this.homeDashboard = document.getElementById('home-dashboard');
        this.homeStatesContainer = document.getElementById('home-states-container');
        this.currentState = 'assam';
        this.allJobs = [];
        this.centralGovtJobs = [];
        this.stateWiseData = {};
        window.app = this;
    }

    async init() {
        await this.loadAllJobs();
        this.setupEventListeners();
        this.showHome(); // Pehle home dashboard
        this.renderStateSections('assam'); // Background mein Assam load
        console.log('%cNEI JOB PORTAL v4.0 — HOME DASHBOARD LIVE WITH ORIGINAL 3-COLUMN!', 'color: #11998e; font-size: 22px; font-weight: bold');
    }

    // Show Home Dashboard
    showHome() {
        this.homeDashboard.style.display = 'block';
        this.sectionsContainer.style.display = 'none';
        document.querySelectorAll('.navbar a').forEach(a => a.classList.remove('active'));
        this.renderHomeDashboard();
    }

    // Render 8 States on Home with Original 3-Column Job Cards
    renderHomeDashboard() {
        const states = [
            { key: 'assam', name: 'Assam' },
            { key: 'arunachal-pradesh', name: 'Arunachal Pradesh' },
            { key: 'nagaland', name: 'Nagaland' },
            { key: 'manipur', name: 'Manipur' },
            { key: 'meghalaya', name: 'Meghalaya' },
            { key: 'tripura', name: 'Tripura' },
            { key: 'mizoram', name: 'Mizoram' },
            { key: 'sikkim', name: 'Sikkim' }
        ];

        const today = new Date(); today.setHours(0,0,0,0);

        const html = states.map(state => {
            const activeJobs = (this.stateWiseData[state.key]?.latestJobs || [])
                .filter(j => j.parsedDate && j.parsedDate >= today)
                .slice(0, 15);

            return `
                <div class="home-state-section" onclick="window.app.goToState('${state.key}')">
                    <div class="section-header">
                        <h3 class="section-title-mini">${state.name} Latest Jobs</h3>
                    </div>
                    <div class="job-list">
                        ${this.renderJobItems(activeJobs)}
                    </div>
                </div>
            `;
        }).join('');

        this.homeStatesContainer.innerHTML = html;
    }

    goToState(state) {
        this.homeDashboard.style.display = 'none';
        this.sectionsContainer.style.display = 'block';
        this.renderStateSections(state);
    }

    // Baaki sab tera original code (unchanged)
    async loadAllJobs() {
        try {
            const { data, error } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            if (!data || data.length === 0) {
                this.homeStatesContainer.innerHTML = '<p style="text-align:center; color:#95a5a6; padding:3rem;">No jobs found.</p>';
                return;
            }
            const today = new Date(); today.setHours(0,0,0,0);
            this.allJobs = data.map(job => ({ ...job, parsedDate: this.parseDate(job.lastdate) }));
            this.centralGovtJobs = this.allJobs.filter(job => {
                const s = (job.state || '').toLowerCase();
                return s.includes('central') || s.includes('upsc') || s.includes('ssc') || s.includes('all india');
            });
            this.buildStateData();
        } catch (err) {
            console.error('Supabase Error:', err);
            this.homeStatesContainer.innerHTML = '<p style="color:red;">Failed to load jobs.</p>';
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
        const states = ['assam','arunachal-pradesh','manipur','meghalaya','mizoram','nagaland','tripura','sikkim'];
        this.stateWiseData = {};
        states.forEach(state => {
            const stateJobs = this.allJobs.filter(job => {
                const jobState = (job.state || '').toLowerCase().trim().replace(/\s+/g, '-');
                return jobState.includes(state) || (jobState === 'arunachal pradesh' && state === 'arunachal-pradesh');
            });
            this.stateWiseData[state] = {
                latestJobs: stateJobs.filter(j => !j.category || j.category === 'latestJobs'),
                results: stateJobs.filter(j => j.category === 'results'),
                admitCards: stateJobs.filter(j => j.category === 'admitCards'),
                answerKeys: stateJobs.filter(j => j.category === 'answerKeys'),
                privateJobs: stateJobs.filter(j => j.category === 'privateJobs')
            };
        });
    }

    renderStateSections(state) {
        this.currentState = state;
        document.querySelectorAll('.navbar a').forEach(a => a.classList.remove('active'));
        document.querySelector(`.navbar a[data-state="${state}"]`)?.classList.add('active');
        const data = this.stateWiseData[state] || {};
        const sectionsConfig = [
            { id: `${state}-latest-jobs`, title: "Latest Jobs", data: data.latestJobs || [], icon: "New" },
            { id: `${state}-results`, title: "Results", data: data.results || [], icon: "Result", special: 'result' },
            { id: `${state}-admit-cards`, title: "Admit Cards", data: data.admitCards || [], icon: "Card", special: 'admit' },
            { id: `${state}-answer-keys`, title: "Answer Key", data: data.answerKeys || [], icon: "Key", special: 'answerkey' },
            { id: `${state}-central-govt`, title: "Central Govt Jobs", data: this.centralGovtJobs, icon: "India Flag" },
            { id: `${state}-private-jobs`, title: "Private Jobs", data: data.privateJobs || [], icon: "Briefcase" }
        ];
        this.sectionsContainer.innerHTML = sectionsConfig.map(section => `
            <div class="section" id="${section.id}">
                <div class="section-header">
                   <h3 class="section-title-mini">${section.icon} ${section.title}</h3>
                </div>
                <div class="job-list">${this.renderJobItems(section.data, section.special)}</div>
            </div>
        `).join('');
    }

    renderJobItems(jobs, type = '') {
        if (!jobs || jobs.length === 0) {
            return '<p style="text-align:center; color:#95a5a6; padding:2rem;">No active jobs available</p>';
        }
        const today = new Date(); today.setHours(0,0,0,0);
        return jobs.map(job => {
            if (type === 'result' || type === 'admit' || type === 'answerkey') {
                const start = job.startdate ? this.formatDate(job.startdate) : 'N/A';
                const end = job.lastdate ? this.formatDate(job.lastdate) : 'N/A';
                return `<a href="pages/detail.html?id=${job.id}" class="job-item compact-card">
                    <div class="job-title-inline">${job.title}
                        <span class="date-inline">Start: ${start} | End: ${end}</span>
                    </div>
                </a>`;
            }
            let dateText = job.parsedDate ? (
                (() => {
                    const d = job.parsedDate;
                    const formatted = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
                    const daysLeft = Math.ceil((d - today) / 86400000);
                    const color = daysLeft > 7 ? '#27ae60' : daysLeft > 3 ? '#f39c12' : '#e74c3c';
                    return `Last Date: <strong style="color:${color}">${formatted}</strong> <small>(${daysLeft} day${daysLeft>1?'s':''} left)</small>`;
                })()
            ) : '<span style="color:#95a5a6;">Date Not Announced</span>';

            return `<a href="pages/detail.html?id=${job.id}" class="job-item compact-card">
                <div class="job-title-inline">${job.title}
                    <span class="date-inline">${dateText}</span>
                </div>
            </a>`;
        }).join('');
    }

    formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        const d = new Date(dateStr);
        return isNaN(d) ? dateStr : `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
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

document.addEventListener('DOMContentLoaded', () => {
    if (typeof supabase === 'undefined') return console.error('Supabase not loaded!');
    new NEIJobPortal().init();
});
