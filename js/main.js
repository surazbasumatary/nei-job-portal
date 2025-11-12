// js/main.js - FINAL PRO VERSION (Fixed Dates + Auto Hide Expired Jobs)
class NEIJobPortal {
    constructor() {
        this.sectionsContainer = document.getElementById('sections-container');
        this.currentState = 'assam';
        this.centralGovtJobs = [];
        this.stateWiseData = {};
        window.app = this;
    }

    async init() {
        await this.loadAllJobs();
        this.setupEventListeners();
        this.renderStateSections(this.currentState);
        document.querySelector(`.navbar a[data-state="${this.currentState}"]`).classList.add('active');
        console.log('NEI Job Portal PRO - Expired Jobs Hidden + Dates Fixed!');
    }

    async loadAllJobs() {
        try {
            const { data, error } = await supabase
                .from('jobs')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const now = new Date();
            now.setHours(0, 0, 0, 0); // Today at 00:00

            // Filter OUT expired jobs + extract central jobs
            const activeJobs = data.filter(job => {
                if (!job.last_date) return true; // No date = show
                const lastDate = new Date(job.last_date);
                lastDate.setHours(23, 59, 59, 999); // End of day
                return lastDate >= now;
            });

            this.centralGovtJobs = activeJobs.filter(job => 
                job.state === 'central-govt' || 
                job.state?.toLowerCase().includes('central')
            );

            this.buildStateData(activeJobs);

        } catch (err) {
            console.error('Supabase Error:', err);
            this.sectionsContainer.innerHTML = '<p style="color:red;text-align:center;">Failed to load jobs.</p>';
        }
    }

    buildStateData(allJobs) {
        const states = ['assam', 'arunachal', 'manipur', 'meghalaya', 'mizoram', 'nagaland', 'tripura', 'sikkim'];
        this.stateWiseData = {};

        states.forEach(state => {
            const jobsInState = allJobs.filter(job => 
                job.state && job.state.toLowerCase() === state.toLowerCase()
            );

            this.stateWiseData[state] = {
                latestJobs: jobsInState.filter(j => 
                    !['result', 'admit-card', 'answer-key', 'private'].includes(j.category || '')
                ),
                results: jobsInState.filter(j => j.category === 'result'),
                admitCards: jobsInState.filter(j => j.category === 'admit-card'),
                answerKeys: jobsInState.filter(j => j.category === 'answer-key'),
                centralGovtJobs: this.centralGovtJobs,
                privateJobs: jobsInState.filter(j => j.category === 'private')
            };
        });

        window.jobData = this.stateWiseData;
    }

    renderStateSections(state) {
        this.currentState = state;
        document.querySelectorAll('.navbar a').forEach(a => a.classList.remove('active'));
        const activeLink = document.querySelector(`.navbar a[data-state="${state}"]`);
        if (activeLink) activeLink.classList.add('active');

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

        return jobs.map(job => {
            const lastDateRaw = job.last_date;
            let lastDateHTML = '<span style="color:#95a5a6;">Date Not Announced</span>';

            if (lastDateRaw) {
                const dateObj = new Date(lastDateRaw);
                const formatted = dateObj.toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                });
                const daysLeft = Math.ceil((dateObj - new Date()) / (1000 * 60 * 60 * 24));

                let color = '#e74c3c';
                if (daysLeft > 7) color = '#27ae60';
                else if (daysLeft > 3) color = '#f39c12';

                lastDateHTML = `Last Date: <strong style="color:${color};">${formatted}</strong> 
                               ${daysLeft > 0 ? `<small>(${daysLeft} days left)</small>` : ''}`;
            }

            const status = job.status || 'soon';
            const statusText = {
                start: 'Apply Now',
                closing: 'Last Few Days',
                out: 'Closed',
                soon: 'Coming Soon'
            }[status] || 'Soon';

            const statusClass = status === 'start' ? 'status-start' : 
                               status === 'closing' ? 'status-closing' : 
                               status === 'out' ? 'status-out' : 'status-soon';

            return `
                <a href="pages/detail.html?id=${job.id}" class="job-item" data-id="${job.id}">
                    <div class="job-title">${job.title}</div>
                    <div class="job-meta">
                        <div class="job-lastdate">${lastDateHTML}</div>
                        <div class="job-status ${statusClass}">${statusText}</div>
                    </div>
                </a>
            `;
        }).join('');
    }

    setupEventListeners() {
        document.querySelectorAll('.navbar a[data-state]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const state = link.getAttribute('data-state');
                this.renderStateSections(state);
            });
        });
    }
}

// START
document.addEventListener('DOMContentLoaded', () => {
    if (typeof supabase === 'undefined') {
        console.error('Supabase not loaded!');
        return;
    }
    new NEIJobPortal().init();
});
