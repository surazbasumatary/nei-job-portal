// js/main.js - v2.0 FINAL: RESULTS IN RESULT CARD + DATES + PDF LINKS
class NEIJobPortal {
    constructor() {
        this.sectionsContainer = document.getElementById('sections-container');
        this.currentState = 'assam';
        this.allJobs = [];
        this.centralGovtJobs = [];
        this.stateWiseData = {};
        window.app = this;
    }

    async init() {
        await this.loadAllJobs();
        this.setupEventListeners();
        this.renderStateSections(this.currentState);
        document.querySelector(`.navbar a[data-state="${this.currentState}"]`)?.classList.add('active');
        console.log('%cNEI JOB PORTAL v2.0 LOADED — RESULTS FIXED!', 'color: #27ae60; font-size: 20px; font-weight: bold');
    }

    async loadAllJobs() {
        try {
            const { data, error } = await supabase
                .from('jobs')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            if (!data || data.length === 0) {
                this.sectionsContainer.innerHTML = '<p style="text-align:center; color:#95a5a6;">No jobs found.</p>';
                return;
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            this.allJobs = data.map(job => {
                const parsed = this.parseDate(job.lastdate);
                return { ...job, parsedDate: parsed };
            });

            // CENTRAL GOVT JOBS
            this.centralGovtJobs = this.allJobs.filter(job => {
                const s = (job.state || '').toLowerCase().trim();
                return s.includes('central') || s.includes('upsc') || s.includes('ssc') || s.includes('railway') || s.includes('ibps') || s.includes('all india');
            });

            this.buildStateData();
        } catch (err) {
            console.error('Supabase Error:', err);
            this.sectionsContainer.innerHTML = '<p style="color:red; text-align:center;">Failed to load jobs.</p>';
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
        window.jobData = {};

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

        window.jobData = this.stateWiseData;
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

    // === NORMAL JOBS (LATEST JOBS) ===
// === NORMAL JOBS (LATEST JOBS) ===
renderJobItems(jobs, type = '') {
    if (!jobs || jobs.length === 0) {
        return '<p style="text-align:center; color:#95a5a6; padding:2rem;">No active jobs available</p>';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return jobs.map(job => {
        // === RESULT / ADMIT / ANSWER KEY CARDS ===
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

        // === NORMAL JOBS (LATEST JOBS) ===
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

        const status = job.status || 'soon';
        const statusText = {
            start: 'Apply Now',
            closing: 'Last Few Days',
            out: 'Closed',
            soon: 'Coming Soon'
        }[status] || 'Soon';

        return `
            <a href="pages/detail.html?id=${job.id}" class="job-item compact-card">
                <div class="job-title-inline">
                    ${job.title}
                    <span class="date-inline">${dateText}</span>
                </div>
                <div class="apply-btn">${statusText}</div>
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
                this.renderStateSections(link.dataset.state);
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
