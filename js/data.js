// js/data.js
// EXCLUSIVELY FOR admin.html
// DO NOT use this file on your main website!

const supabaseUrl = 'https://enfzymosvlrmfluwidbj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuZnp5bW9zdmxybWZsdXdpZGJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNTU1ODYsImV4cCI6MjA3NzkzMTU4Nn0._Mf8tyGBmcVgYPDTinF-UVD-HJD3-9OB90IAPJ5Dyx4';

const { createClient } = supabase;
window.supabase = createClient(supabaseUrl, supabaseKey);

console.log("Supabase initialized for ADMIN PANEL - READY!");
