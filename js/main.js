// js/main.js
// RENDER JOBS BEAUTIFULLY

const stateNames = {
  'assam': 'Assam',
  'arunachal-pradesh': 'Arunachal Pradesh',
  'nagaland': 'Nagaland',
  'manipur': 'Manipur',
  'mizoram': 'Mizoram',
  'tripura': 'Tripura',
  'meghalaya': 'Meghalaya',
  'sikkim': 'Sikkim',
  'centralGovtJobs': 'Central Government Jobs',
  'privateJobs': 'Private Jobs'
};

const categoryNames = {
  latestJobs: 'Latest Jobs',
  results: 'Results',
  admitCards: 'Admit Cards',
  answerKeys: 'Answer Keys',
  centralGovtJobs: 'Central Govt',
  privateJobs: 'Private Jobs'
};

function getStatusBadge(status) {
  const badges = {
    start: '<span class="badge start">Apply Now</span>',
    closing: '<span class="badge closing">Last Few Days</span>',
    out: '<span class="badge out">Exam Over</span>',
    soon: '<span class="badge soon">Coming Soon</span>'
  };
  return badges[status] || '<span class="badge soon">Soon</span>';
}

function renderJobCard(job) {
  // Map category to correct detail page
  const pageMap = {
    latestJobs: 'job-details.html',
    results: 'result-details.html',
    admitCards: 'admit-card-details.html',
    answerKeys: 'answer-key-details.html',
    centralGovtJobs: 'central-govt-details.html',
    privateJobs: 'private-job-details.html'
  };

  const detailPage = pageMap[job.category] || 'job-details.html';
  const detailUrl = `pages/${detailPage}?id=${job.id}`;

  // Special buttons for Results/Admit/Answer Key
  let actionButtons = '';
  if (job.category === 'results' && job.resultLink) {
    actionButtons = `<a href="${job.resultLink}" target="_blank" class="btn-download">Download Result</a>`;
  } else if (job.category === 'admitCards' && job.admitCardLink) {
    actionButtons = `<a href="${job.admitCardLink}" target="_blank" class="btn-download">Download Admit Card</a>`;
  } else if (job.category === 'answerKeys' && job.answerKeyLink) {
    actionButtons = `<a href="${job.answerKeyLink}" target="_blank" class="btn-download">Download Answer Key</a>`;
  } else {
    actionButtons = `
      <a href="${job.apply}" target="_blank" class="btn-apply">Apply Now</a>
      <a href="${job.notification}" target="_blank" class="btn-noti">Notification</a>
    `;
  }

  return `
    <a href="${detailUrl}" class="job-card-link">
      <div class="job-card">
        <div class="job-header">
          <h3>${job.title}</h3>
          ${getStatusBadge(job.status)}
        </div>
        <div class="job-info">
          <p><strong>Last Date:</strong> 
            <span style="color:#e74c3c; font-weight:bold;">${job.lastdate || 'Soon'}</span>
          </p>
          <p><strong>Vacancy:</strong> ${job.vacancy || 'See Notification'}</p>
          <p><strong>Post:</strong> ${job.postname || 'Various Posts'}</p>
        </div>
        <div class="job-actions">
          ${actionButtons}
          <span class="view-full">View Full Details →</span>
        </div>
      </div>
    </a>
  `;
}
window.renderJobs = function() {
  const container = document.getElementById('sections-container');
  const activeState = document.querySelector('.navbar a.active')?.getAttribute('data-state') || 'assam';
  
  container.innerHTML = '';
  
  if (!window.jobData[activeState]) {
    container.innerHTML = `<p style="text-align:center; color:#666; padding:3rem;">No jobs found for ${stateNames[activeState]}.</p>`;
    return;
  }

  Object.keys(window.jobData[activeState]).forEach(category => {
    const jobs = window.jobData[activeState][category];
    if (jobs.length === 0) return;

    const section = document.createElement('section');
    section.className = 'job-section';
    section.innerHTML = `
      <h2>${categoryNames[category] || category}</h2>
      <div class="jobs-grid">
        ${jobs.map(renderJobCard).join('')}
      </div>
    `;
    container.appendChild(section);
  });
};

// Navigation
document.querySelectorAll('.navbar a').forEach(link => {
  link.addEventListener('click', function() {
    document.querySelectorAll('.navbar a').forEach(a => a.classList.remove('active'));
    this.classList.add('active');
    document.getElementById('loading').style.display = 'block';
    document.getElementById('sections-container').innerHTML = '';
    setTimeout(() => {
      window.renderJobs();
      document.getElementById('loading').style.display = 'none';
    }, 300);
  });
});

// Initial render
setTimeout(() => {
  if (window.jobData && Object.keys(window.jobData).length > 0) {
    window.renderJobs();
    document.getElementById('loading').style.display = 'none';
  }
}, 1000);
