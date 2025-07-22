import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.42.3/+esm";

const supabaseUrl = "https://rlgsehxrpkxlavxdpzgz.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsZ3NlaHhycGt4bGF2eGRwemd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1OTY2MjgsImV4cCI6MjA2ODE3MjYyOH0.S_doyB0_3GuKRWCb0RXOXzTBvhsiEp_l9X0kWMt86Xg";

export const supabase = createClient(supabaseUrl, supabaseKey);

// Só pra debug no console, pode remover depois
window.supabase = supabase;
