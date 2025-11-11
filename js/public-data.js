// js/data.js
const stateList = [
  { key: 'assam', name: 'Assam' },
  { key: 'arunachal-pradesh', name: 'Arunachal Pradesh' },
  { key: 'nagaland', name: 'Nagaland' },
  { key: 'manipur', name: 'Manipur' },
  { key: 'mizoram', name: 'Mizoram' },
  { key: 'tripura', name: 'Tripura' },
  { key: 'meghalaya', name: 'Meghalaya' },
  { key: 'sikkim', name: 'Sikkim' }
];

// js/data.js
// js/data.js
// FIXED VERSION – works in every browser (Edge, Chrome, Firefox)

const supabaseUrl = 'https://enfzymosvlrmfluwidbj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuZnp5bW9zdmxybWZsdXdpZGJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNTU1ODYsImV4cCI6MjA3NzkzMTU4Nn0._Mf8tyGBmcVgYPDTinF-UVD-HJD3-9OB90IAPJ5Dyx4';

// Global supabase object is already created by the CDN script
// We just expose it cleanly for all your files
window.supabase = supabase.createClient(supabaseUrl, supabaseKey);

console.log("Supabase initialized successfully!");

let jobData = {}
window.jobData = jobData

async function loadJobs() {
  const { data } = await supabase.from('jobs').select('*')
  jobData = {}

  data.forEach(job => {
    const state = job.state === 'central-govt' ? 'centralGovtJobs' : job.state
    if (!jobData[state]) jobData[state] = {}
    if (!jobData[state][job.category]) jobData[state][job.category] = []
    jobData[state][job.category].push(job)
  })

  window.jobData = jobData
  if (window.app) window.app.renderStateSections(window.app.currentState)
}

loadJobs()

// Real-time updates
supabase
  .channel('jobs')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => {
    loadJobs()
  })
  .subscribe()
