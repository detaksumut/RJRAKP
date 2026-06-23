import dotenv from 'dotenv';
dotenv.config();
console.log('Environment keys:', Object.keys(process.env).filter(k => k.includes('SUPABASE') || k.includes('DATABASE') || k.includes('POSTGRES')));
