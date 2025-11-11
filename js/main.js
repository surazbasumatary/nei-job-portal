// js/main.js
// YOUR ORIGINAL CLASS — NOW WORKS WITH SUPABASE + DETAIL PAGES

class NEIJobPortal {
    constructor() {
        this.sectionsContainer = document.getElementById('sections-container');
        this.currentState = 'assam';
        window.app = this;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderStateSections(this.currentState);
        document.querySelector(`.navbar a[data-state="${this.currentState}"]`).classList.add('active');
        console.log('NEI Job Portal initialized!');
    }

    renderStateSections(state) {
        this.currentState = state;
        document.querySelectorAll('.navbar a').forEach(a => a.classList.remove('active'));
        document.querySelector(`.navbar a[data-state="${state}"]`).classList.add('active');

        const stateData = window.jobData[state] || {};

        const sectionsConfig = [
            { id: `${state}-latest-jobs`, title: "Latest Jobs", data: stateData.latestJobs || [], icon: "Latest" },
            { id: `${state}-results`, title: "Results", data: stateData.results || [], icon: "Results" },
            { id: `${state}-admit-cards`, title: "Admit Cards", data: stateData.admitCards || [], icon: "Admit" },
            { id: `${state}-answer-keys`, title: "Answer Key", data: stateData.answerKeys || [], icon: "Key" },
            { id: `${state}-central-govt`, title: "Central Govt Jobs", data: stateData.centralGovtJobs || [], icon: "Central" },
            { id: `${state}-private-jobs`, title: "Private Jobs", data: stateData.privateJobs || [], icon: "Private" }
        ];

        this.sectionsContainer.innerHTML = sectionsConfig.map(section => `
            <div class="section" id="${section.id}">
                <div class="section-header">
                    <h2>${section.icon} ${section.title}</h2>
                </div>
                <div class="job-list">
                    ${this.renderJobItems(section.data, section.id)}
                </div>
            </div>
        `).join('');
    }

    renderJobItems(jobs, sectionId) {
        if (jobs.length === 0) {
            return '<p style="text-align:center; color:#95a5a6; padding:2rem;">No jobs available</p>';
        }

        return jobs.map(job => {
            const statusText = job.statusText || {
                start: 'Apply Now', closing: 'Last Few Days', out: 'Out', soon: 'Coming Soon'
            }[job.status] || 'Soon';

            let page = 'job-details.html';
            if (sectionId.includes('results')) page = 'result-details.html';
            else if (sectionId.includes('admit-cards')) page = 'admit-card-details.html';
            else if (sectionId.includes('answer-keys')) page = 'answer-key-details.html';
            else if (sectionId.includes('central-govt')) page = 'central-govt-details.html';
            else if (sectionId.includes('private-jobs')) page = 'private-job-details.html';

            return `
                <a href="pages/${page}?id=${job.id}" class="job-item" data-job-id="${job.id}">
                    <div class="job-title">${job.title}</div>
                    <div class="job-status status-${job.status}">${statusText}</div>
                </a>
            `;
        }).join('');
    }

    setupEventListeners() {
        document.querySelectorAll('.navbar a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const state = link.getAttribute('data-state');
                this.renderStateSections(state);
            });
        });
    }
}

// Initialize when DOM + data ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.jobData && Object.keys(window.jobData).length > 0) {
        new NEIJobPortal();
    } else {
        // Wait for data
        const checkData = setInterval(() => {
            if (window.jobData && Object.keys(window.jobData).length > 0) {
                clearInterval(checkData);
                new NEIJobPortal();
            }
        }, 100);
    }
});
