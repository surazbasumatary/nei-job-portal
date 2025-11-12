// js/main.js - FINAL FIXED VERSION (Real Supabase + Proper Dates + Hide Expired)
class NEIJobPortal {
    constructor() {
        this.sectionsContainer = document.getElementById('sections-container');
        this.currentState = 'assam';
        this.centralGovtJobs = [];
        this.allActiveJobs = [];
        window.app = this;
    }

    async init() {
        await this.loadJobs();
        this.setupEventListeners();
        this.renderStateSections(this.currentState);
        document.querySelector(`.navbar a[data-state="${this.currentState}"]`).classList.add('active');
    }

    async loadJobs() {
        try {
            const { data, error } = await supabase
                .from('jobs')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Filter only ACTIVE jobs (lastdate not passed)
            this.allActiveJobs = data.filter(job => {
                if (!job.lastdate) return true;
                const lastDate = new Date(job.lastdate);
                return lastDate >= today;
            });

            // Extract Central Govt Jobs
            this.centralGovtJobs = this.allActiveJobs.filter(job =>
                job.state === 'central-govt' ||
                job.state?.toLowerCase().includes('central')
            );

            this.buildStateData();

        } catch (err) {
            console.error('Error loading jobs:', err);
            this.sectionsContainer.innerHTML = '<p style="color:red;">Failed to load jobs.</p>';
        }
    }

    buildStateData() {
        const states = ['assam', 'arunachal', 'manipur', 'meghalaya', 'mizoram', 'nagaland', 'tripura', 'sikkim'];
        window.jobData = {};

        states.forEach(state => {
            const stateJobs = this.allActiveJobs.filter(job =>
                job.state?.toLowerCase() === state.toLowerCase()
            );

            window.jobData[state] = {
                latestJobs: stateJobs.filter(j => !['result', 'admit-card', 'answer-key', 'private'].includes(j.category || '')),
                results: stateJobs.filter(j => j.category === 'result'),
                admitCards: stateJobs.filter(j => j.category === 'admit-card'),
                answerKeys: stateJobs.filter(j => j.category === 'answer-key'),
                centralGovtJobs: this.centralGovtJobs,
                privateJobs: stateJobs.filter(j => j.category === 'private')
            };
        });
    }

    renderStateSections(state) {
        this.currentState = state;
        document.querySelectorAll('.navbar a').forEach(a => a.classList.remove('active'));
        document.querySelector(`.navbar a[data-state="${state}"]`)?.classList.add('active');

        const stateData = window.jobData[state] || {};

        const sectionsConfig = [
            { id: `${state}-latest-jobs`, title: "Latest Jobs", data: stateData.latestJobs || [], icon: "New" },
            { id: `${state}-results`, title: "Results", data: stateData.results || [], icon: "Result" },
            { id: `${state}-admit-cards`, title: "Admit Cards", data: stateData.admitCards || [], icon: "Card" },
            { id: `${state}-answer-keys`, title: "Answer Key", data: stateData.answerKeys || [], icon: "Key" },
            { id: `${state}-central-govt`, title: "Central Govt Jobs", data: this.centralGovtJobs, icon: "India Flag" },
            { id: `${state}-private-jobs`, title: "Private Jobs", data: stateData.privateJobs || [], icon: "Briefcase" }
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
        return '<p style="text-align:center; color:#95a5a6; padding:2rem;">No active jobs</p>';
    }

    return jobs.map(job => {
        let lastDateHTML = '<span style="color:#95a5a6;">Date Not Announced</span>';
        
        if (job.lastdate) {
            // SUPER SMART DATE PARSER — Understands ALL formats
            const raw = job.lastdate.trim();
            let date = null;

            // Try common formats one by one
            const formats = [
                raw, // original
                raw.replace(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/, '$1/$2/$3'), // 21/11/2025 → 21/11/2025
                raw.replace(/(\d{1,2})\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*(\d{4})/i, '$1 $2 $3'),
                raw.replace(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*(\d{1,2}),?\s*(\d{4})/i, '$2 $1 $3'),
                raw.replace(/(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/, '$2/$3/$1'), // YYYY-MM-DD
            ];

            for (let attempt of formats) {
                date = new Date(attempt);
                if (!isNaN(date.getTime())) break; // Valid date found!
            }

            // Final fallback: let browser try
            if (isNaN(date?.getTime())) {
                date = new Date(raw);
            }

            // If still invalid → skip formatting
            if (!date || isNaN(date.getTime())) {
                lastDateHTML = `<span style="color:#95a5a6;">Invalid Date: ${raw}</span>`;
            } else {
                // Now format as DD/MM/YYYY
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                const formatted = `${day}/${month}/${year}`;  // 21/11/2025

                const today = new Date();
                today.setHours(0, 0, 0, 0);
                date.setHours(23, 59, 59, 999);

                const daysLeft = Math.ceil((date - today) / (1000 * 60 * 60 * 24));

                // Hide expired jobs
                if (daysLeft < 0) {
                    return ''; // This hides expired jobs completely
                }

                let color = '#e74c3c'; // Red
                if (daysLeft > 7) color = '#27ae60';      // Green
                else if (daysLeft > 3) color = '#f39c12';  // Orange

                lastDateHTML = `
                    Last Date: <strong style="color:${color};">${formatted}</strong>
                    ${daysLeft > 0 ? `<small>(${daysLeft} day${daysLeft > 1 ? 's' : ''} left)</small>` : ''}
                `;
            }
        }

        const status = job.status || 'soon';
        const statusText = {
            start: 'Apply Now',
            closing: 'Last Few Days',
            out: 'Closed',
            soon: 'Coming Soon'
        }[status] || 'Soon';

        // If job is expired → don't show it at all
        if (lastDateHTML.includes('left') && lastDateHTML.includes('-')) return '';

        return `
            <a href="pages/detail.html?id=${job.id}" class="job-item">
                <div class="job-title">${job.title}</div>
                <div class="job-meta">
                    <div class="job-lastdate">${lastDateHTML}</div>
                    <div class="job-status status-${status}">${statusText}</div>
                </div>
            </a>
        `.trim();
    }).filter(Boolean).join(''); // Remove empty items
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
    if (!window.supabase) {
        console.error('Supabase not loaded!');
        return;
    }
    new NEIJobPortal().init();
});
