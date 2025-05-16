import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('معلومات Supabase غير مكتملة. تأكد من وجود الملف .env.local مع المتغيرات الصحيحة')
  throw new Error('معلومات Supabase غير مكتملة')
}

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key موجود:', !!supabaseAnonKey)

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 