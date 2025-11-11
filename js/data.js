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
const supabaseUrl = 'https://your-project.supabase.co'
const supabaseKey = 'your-anon-key'
const supabase = Supabase.createClient(supabaseUrl, supabaseKey)

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
