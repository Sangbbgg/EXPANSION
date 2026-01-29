import { NextResponse } from 'next/server';

export async function GET() {
  const envVars = {
    SUPABASE_URL: process.env.SUPABASE_URL ? '설정됨' : '설정되지 않음',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? '설정됨' : '설정되지 않음',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ? '설정됨' : '설정되지 않음',
  };

  const allSet = Object.values(envVars).every(status => status === '설정됨');

  return NextResponse.json({
    message: '시스템 환경 변수 확인',
    status: allSet ? '정상' : '일부 변수 누락',
    envVars,
  });
}
