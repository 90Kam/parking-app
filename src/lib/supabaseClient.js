import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'TWÓJ_SUPABASE_URL'
const supabaseAnonKey = 'TWÓJ_SUPABASE_ANON_KEY'

export const supabase = createClient("https://oiwuuscuklutkvuavlvt.supabase.co"
, "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pd3V1c2N1a2x1dGt2dWF2bHZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMjExMTMsImV4cCI6MjA2MzU5NzExM30.d7Sv_wlQkm5hOTQ3pJYVNRvIy_JSPLm7Q_9A8sGLjk0")