// js/public-data.js
// LOADS DATA FROM SUPABASE + REAL-TIME

const supabaseUrl = 'https://enfzymosvlrmfluwidbj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuZnp5bW9zdmxybWZsdXdpZGJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNTU1ODYsImV4cCI6MjA3NzkzMTU4Nn0._Mf8tyGBmcVgYPDTinF-UVD-HJD3-9OB90IAPJ5Dyx4';

const { createClient } = supabase;
window.supabase = createClient(supabaseUrl, supabaseKey);

window.jobData = {};

async function loadJobs() {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Supabase Error:", error);
    return;
  }

  window.jobData = {};
  data.forEach(job => {
    const stateKey = job.state === 'central-govt' ? 'centralGovtJobs' : job.state;
    if (!window.jobData[stateKey]) window.jobData[stateKey] = {};
    if (!window.jobData[stateKey][job.category]) window.jobData[stateKey][job.category] = [];
    window.jobData[stateKey][job.category].push(job);
  });

  if (window.app) window.app.renderStateSections(window.app.currentState);
}

loadJobs();

// Real-time updates
supabase
  .channel('jobs')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => {
    loadJobs();
  })
  .subscribe();
