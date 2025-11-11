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
  const specialContent = job.category === 'results' ? `
    <p><strong>Result:</strong> ${job.resultDesc || 'Check official website'}</p>
    <a href="${job.resultLink}" target="_blank" class="btn-small">Download Result</a>
  ` : job.category === 'admitCards' ? `
    <p><strong>Admit Card:</strong> ${job.admitCardDesc || 'Available now'}</p>
    <a href="${job.admitCardLink}" target="_blank" class="btn-small">Download Admit Card</a>
  ` : job.category === 'answerKeys' ? `
    <p><strong>Answer Key:</strong> ${job.answerKeyDesc || 'Released'}</p>
    <a href="${job.answerKeyLink}" target="_blank" class="btn-small">Download Answer Key</a>
  ` : `
    <a href="${job.apply}" target="_blank" class="btn-apply">Apply Online</a>
    <a href="${job.notification}" target="_blank" class="btn-noti">Notification</a>
  `;

  return `
    <div class="job-card">
      <div class="job-header">
        <h3>${job.title}</h3>
        ${getStatusBadge(job.status)}
      </div>
      <div class="job-details">
        <p><strong>Post:</strong> ${job.postname || 'Various Posts'}</p>
        <p><strong>Vacancy:</strong> ${job.vacancy || 'Check Notification'}</p>
        <p><strong>Last Date:</strong> ${job.lastdate || 'Soon'}</p>
        ${job.salary ? `<p><strong>Salary:</strong> ${job.salary}</p>` : ''}
      </div>
      <div class="job-actions">
        ${specialContent}
        <a href="${job.official}" target="_blank" class="btn-official">Official Website</a>
      </div>
    </div>
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
