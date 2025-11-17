// js/main.js - v2.5 DASHBOARD + 8 STATE LATEST JOB CARDS
class NEIJobPortal {
    constructor() {
        this.sectionsContainer = document.getElementById('sections-container');
        this.homeDashboard = document.getElementById('home-dashboard');
        this.stateGrid = document.getElementById('state-grid');
        this.currentState = 'assam';
        this.allJobs = [];
        this.centralGovtJobs = [];
        this.stateWiseData = {};
        window.app = this;
    }

    async init() {
        await this.loadAllJobs();
        this.setupEventListeners();

        // First show the beautiful 8-state dashboard
        this.renderHomeDashboard();

        // Default load Assam in background (optional)
        this.renderStateSections(this.currentState);
        document.querySelector(`.navbar a[data-state="${this.currentState}"]`)?.classList.add('active');

        console.log('%cNEI JOB PORTAL v2.5 — 8-STATE DASHBOARD LIVE!', 'color: #11998e; font-size: 20px; font-weight: bold');
    }

    // === NEW: RENDER 8 STATE DASHBOARD ===
    renderHomeDashboard() {
        const states = [
            { key: 'assam', name: 'Assam' },
            { key: 'arunachal-pradesh', name: 'Arunachal Pradesh' },
            { key: 'manipur', name: 'Manipur' },
            { key: 'meghalaya', name: 'Meghalaya' },
            { key: 'mizoram', name: 'Mizoram' },
            { key: 'nagaland', name: 'Nagaland' },
            { key: 'tripura', name: 'Tripura' },
            { key: 'sikkim', name: 'Sikkim' }
        ];

        const today = new Date();
        today.setHours(0,0,0,0);

        const cardsHTML = states.map(state => {
            const latestJob = (this.stateWiseData[state.key]?.latestJobs || [])
                .find(job => job.parsedDate && job.parsedDate >= today);

            let jobHTML = '';
            if (latestJob) {
                const daysLeft = Math.ceil((latestJob.parsedDate - today) / 86400000);
                const urgency = daysLeft > 7 ? 'soon' : daysLeft > 3 ? 'urgent' : 'critical';
                const dateStr = `${String(latestJob.parsedDate.getDate()).padStart(2,'0')}/${String(latestJob.parsedDate.getMonth()+1).padStart(2,'0')}/${latestJob.parsedDate.getFullYear()}`;

                jobHTML = `
                    <div class="latest-job-title">${latestJob.title}</div>
                    <div class="last-date ${urgency}">
                        Last Date: ${dateStr} (${daysLeft} day${daysLeft>1?'s':''} left)
                    </div>
                `;
            } else {
                jobHTML = '<div class="no-job">No active jobs right now</div>';
            }

            return `
                <div class="state-card" data-state="${state.key}">
                    <div class="state-name">:: ${state.name}</div>
                    ${jobHTML}
                </div>
            `;
        }).join('');

        this.stateGrid.innerHTML = cardsHTML;

        // Make cards clickable → go to that state
        document.querySelectorAll('.state-card').forEach(card => {
            card.addEventListener('click', () => {
                const state = card.dataset.state;
                this.homeDashboard.style.display = 'none';
                this.sectionsContainer.style.display = 'block';
                this.renderStateSections(state);
            });
        });
    }

    // Your existing methods remain 100% unchanged below...
    async loadAllJobs() { /* ... same as before ... */ }
    parseDate(raw) { /* ... same ... */ }
    buildStateData() { /* ... same ... */ }

    renderStateSections(state) {
        this.currentState = state;
        document.querySelectorAll('.navbar a').forEach(a => a.classList.remove('active'));
        document.querySelector(`.navbar a[data-state="${state}"]`)?.classList.add('active');

        // Hide dashboard, show full sections
        this.homeDashboard.style.display = 'none';
        this.sectionsContainer.style.display = 'block';

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

    renderJobItems(jobs, type = '') {
        // Your existing renderJobItems function - unchanged
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
                this.homeDashboard.style.display = 'none';
                this.sectionsContainer.style.display = 'block';
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
