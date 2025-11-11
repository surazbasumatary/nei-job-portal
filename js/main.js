// js/main.js
class NEIJobPortal {
    constructor() {
    this.sectionsContainer = document.getElementById('sections-container');
    this.currentState = 'assam';
    window.app = this; // Global reference
    this.init();
}

    init() {
        this.setupEventListeners();
        const defaultState = window.stateList[0].key;
        this.renderStateSections(defaultState);
        document.querySelector(`.navbar a[data-state="${defaultState}"]`).classList.add('active');
        console.log('NEI Job Portal initialized!');
    }

    renderStateSections(state) {
        document.querySelectorAll('.navbar a').forEach(a => a.classList.remove('active'));
        document.querySelector(`.navbar a[data-state="${state}"]`).classList.add('active');

        const stateData = window.jobData[state];  // ← Use window.jobData

        const sectionsConfig = [
            { id: `${state}-latest-jobs`, title: "Latest Jobs", data: stateData.latestJobs, icon: "Latest" },
            { id: `${state}-results`, title: "Results", data: stateData.results, icon: "Results" },
            { id: `${state}-admit-cards`, title: "Admit Cards", data: stateData.admitCards, icon: "Admit" },
            { id: `${state}-answer-keys`, title: "Answer Key", data: stateData.answerKeys, icon: "Key" },
            { id: `${state}-central-govt`, title: "Central Govt Jobs", data: stateData.centralGovtJobs, icon: "Central" },
            { id: `${state}-private-jobs`, title: "Private Jobs", data: stateData.privateJobs, icon: "Private" }
        ];

        this.sectionsContainer.innerHTML = sectionsConfig.map(section => `
            <div class="section" id="${section.id}">
                <div class="section-header">
                    <h2>${section.icon} ${section.title}</h2>
                </div>
                <div class="job-list">
                    ${this.renderJobItems(section.data)}
                </div>
            </div>
        `).join('');
    }

    renderJobItems(jobs) {
        return jobs.map(job => `
            <a href="#" class="job-item" data-job-id="${job.id}">
                <div class="job-title">${job.title}</div>
                <div class="job-status status-${job.status}">${job.statusText}</div>
            </a>
        `).join('');
    }

    setupEventListeners() {
        // State tabs
        document.querySelectorAll('.navbar a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const state = link.getAttribute('data-state');
                this.renderStateSections(state);
            });
        });

        // Job click — use event from listener
        document.addEventListener('click', (e) => {
            const jobItem = e.target.closest('.job-item');
            if (jobItem) {
                e.preventDefault();
                const jobId = jobItem.getAttribute('data-job-id');
                const section = jobItem.closest('.section');
                const sectionId = section.id;
                const activeTab = document.querySelector('.navbar a.active');
                const state = activeTab ? activeTab.getAttribute('data-state') : 'assam';

                let page = 'job-details.html';
                if (sectionId.includes('results')) page = 'result-details.html';
                else if (sectionId.includes('admit-cards')) page = 'admit-card-details.html';
                else if (sectionId.includes('answer-keys')) page = 'answer-key-details.html';
                else if (sectionId.includes('central-govt')) page = 'central-govt-details.html';
                else if (sectionId.includes('private-jobs')) page = 'private-job-details.html';

                window.location.href = `pages/${page}?state=${state}&id=${jobId}`;
            }
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new NEIJobPortal();
});
// Lazy load ads after page load
document.addEventListener('DOMContentLoaded', () => {
    if (typeof adsbygoogle !== 'undefined') {
        (adsbygoogle = window.adsbygoogle || []).push({});
    }
});
