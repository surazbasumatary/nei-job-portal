// js/main.js - FINAL INDIAN DATE FIX + ALL JOBS SHOW + CENTRAL EVERYWHERE
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
        console.log('%cNEI JOB PORTAL LOADED SUCCESSFULLY!', 'color: #27ae60; font-size: 18px; font-weight: bold');
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

            // Parse dates + filter active jobs
            this.allJobs = data
                .map(job => {
                    const parsed = this.parseDate(job.lastdate);
                    return { ...job, parsedDate: parsed };
                })
                .filter(job => {
                    if (!job.parsedDate) return true; // No date = show
                    return job.parsedDate >= today;
                });

            // CENTRAL GOVT JOBS - ULTRA FLEXIBLE
            this.centralGovtJobs = this.allJobs.filter(job => {
                const s = (job.state || '').toLowerCase().trim();
                return s.includes('central') || 
                       s.includes('upsc') || 
                       s.includes('ssc') || 
                       s.includes('railway') || 
                       s.includes('ibps') || 
                       s.includes('all india');
            });

            this.buildStateData();

        } catch (err) {
            console.error('Supabase Error:', err);
            this.sectionsContainer.innerHTML = '<p style="color:red; text-align:center;">Failed to load jobs.</p>';
        }
    }

    // SUPER DATE PARSER - WORKS WITH ALL INDIAN FORMATS
    parseDate(raw) {
        if (!raw) return null;
        const str = String(raw).trim();
        if (!str) return null;

        // 1. Try direct parse
        let d = new Date(str);
        if (!isNaN(d)) return d;

        // 2. Handle DD-MM-YYYY, DD/MM/YYYY, DD.MM.YYYY → convert to YYYY-MM-DD
        const match = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
        if (match) {
            const [_, day, month, year] = match;
            d = new Date(`${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')} 23:59:59`);
            if (!isNaN(d)) return d;
        }

        // 3. Handle "20 November 2025", "November 20, 2025", "20th Nov 2025"
        const clean = str.replace(/(st|nd|rd|th)/gi, '');
        d = new Date(clean);
        if (!isNaN(d)) return d;

        return null;
    }

    buildStateData() {
    const states = [
        'assam',
        'arunachal-pradesh',  // ← NOW MATCHES YOUR DATABASE
        'manipur',
        'meghalaya',
        'mizoram',
        'nagaland',
        'tripura',
        'sikkim'
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
                   jobState === 'arunachal pradesh' && target === 'arunachal-pradesh';
        });

        this.stateWiseData[state] = {
            latestJobs: stateJobs.filter(j => 
                !j.category || !['result', 'admit-card', 'answer-key', 'private'].includes(j.category)
            ),
            results: stateJobs.filter(j => j.category === 'result'),
            admitCards: stateJobs.filter(j => j.category === 'admit-card'),
            answerKeys: stateJobs.filter(j => j.category === 'answer-key'),
            centralGovtJobs: this.centralGovtJobs,
            privateJobs: stateJobs.filter(j => j.category === 'private')
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
            { id: `${state}-results`, title: "Results", data: data.results || [], icon: "Result" },
            { id: `${state}-admit-cards`, title: "Admit Cards", data: data.admitCards || [], icon: "Card" },
            { id: `${state}-answer-keys`, title: "Answer Key", data: data.answerKeys || [], icon: "Key" },
            { id: `${state}-central-govt`, title: "Central Govt Jobs", data: this.centralGovtJobs, icon: "India Flag" },
            { id: `${state}-private-jobs`, title: "Private Jobs", data: data.privateJobs || [], icon: "Briefcase" }
        ];

        this.sectionsContainer.innerHTML = sectionsConfig.map(section => `
            <div class="section" id="${section.id}">
                <div class="section-header">
                    <h2>${section.icon} ${section.title}</h2>
                    ${section.data.length > 0 ? `<span class="count-badge">${section.data.length}</span>` : ''}
                </div>
                <div class="job-list">
                    ${this.renderJobItems(section.data)}
                </div>
            </div>
        `).join('');
    }

    renderJobItems(jobs) {
        if (!jobs || jobs.length === 0) {
            return '<p style="text-align:center; color:#95a5a6; padding:2rem;">No active jobs available</p>';
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return jobs.map(job => {
            let lastDateHTML = '<span style="color:#95a5a6;">Date Not Announced</span>';

            if (job.parsedDate) {
                const d = job.parsedDate;
                const formatted = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
                const daysLeft = Math.ceil((d - today) / 86400000);

                let color = '#e74c3c';
                if (daysLeft > 7) color = '#27ae60';
                else if (daysLeft > 3) color = '#f39c12';

                lastDateHTML = `
                    Last Date: <strong style="color:${color};">${formatted}</strong>
                    <small>(${daysLeft} day${daysLeft > 1 ? 's' : ''} left)</small>
                `;
            }

            const status = job.status || 'soon';
            const statusText = {
                start: 'Apply Now',
                closing: 'Last Few Days',
                out: 'Closed',
                soon: 'Coming Soon'
            }[status] || 'Soon';

            return `
                <a href="pages/detail.html?id=${job.id}" class="job-item">
                    <div class="job-title">${job.title}</div>
                    <div class="job-meta">
                        <div class="job-lastdate">${lastDateHTML}</div>
                        <div class="job-status status-${status}">${statusText}</div>
                    </div>
                </a>
            `;
        }).join('');
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

// START THE APP
document.addEventListener('DOMContentLoaded', () => {
    if (typeof supabase === 'undefined') {
        console.error('Supabase client not loaded!');
        return;
    }
    new NEIJobPortal().init();
});
