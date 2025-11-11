// js/main.js - PURPLE CARD TILES VERSION (EXACTLY LIKE YOUR SCREENSHOT)

const categoryOrder = ['latestJobs', 'results', 'admitCards', 'answerKeys', 'centralGovtJobs', 'privateJobs'];
const categoryTitles = {
  latestJobs: 'Latest Jobs',
  results: 'Results',
  admitCards: 'Admit Cards',
  answerKeys: 'Answer Key',
  centralGovtJobs: 'Central Govt Jobs',
  privateJobs: 'Private Jobs'
};

const pageMap = {
  latestJobs: 'job-details.html',
  results: 'result-details.html',
  admitCards: 'admit-card-details.html',
  answerKeys: 'answer-key-details.html',
  centralGovtJobs: 'central-govt-details.html',
  privateJobs: 'private-job-details.html'
};

function getStatusBadge(status) {
  const badges = {
    start: '<span class="status-badge start">Apply Now</span>',
    closing: '<span class="status-badge closing">Last Few Days</span>',
    out: '<span class="status-badge out">Out</span>',
    soon: '<span class="status-badge soon">Coming Soon</span>'
  };
  return badges[status] || '<span class="status-badge soon">Soon</span>';
}

function renderJobCard(job) {
  const detailPage = pageMap[job.category] || 'job-details.html';
  const url = `pages/${detailPage}?id=${job.id}`;

  return `
    <a href="${url}" class="tile-card">
      <div class="tile-title">${job.title}</div>
      ${getStatusBadge(job.status)}
    </a>
  `;
}

window.renderJobs = function() {
  const container = document.getElementById('sections-container');
  const activeState = document.querySelector('.navbar a.active')?.getAttribute('data-state') || 'assam';
  
  container.innerHTML = '<div class="tiles-grid"></div>';
  const grid = container.querySelector('.tiles-grid');

  if (!window.jobData[activeState]) {
    grid.innerHTML = `<p style="text-align:center; color:white; grid-column: 1/-1; padding:3rem;">No jobs found for this state.</p>`;
    return;
  }

  // Render in exact order
  categoryOrder.forEach(cat => {
    if (window.jobData[activeState][cat] && window.jobData[activeState][cat].length > 0) {
      const section = document.createElement('div');
      section.className = 'tile-section';
      section.innerHTML = `
        <h2 class="section-title">${categoryTitles[cat]}</h2>
        <div class="tiles-row">
          ${window.jobData[activeState][cat].slice(0, 6).map(renderJobCard).join('')}
        </div>
      `;
      grid.appendChild(section);
    }
  });

  document.getElementById('loading').style.display = 'none';
};
