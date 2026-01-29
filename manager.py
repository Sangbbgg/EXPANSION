# 파일명: manager.py
import os, sys, io, psycopg2
from dotenv import load_dotenv, set_key

# VS Code 한글 깨짐 방지 래핑
if sys.platform.startswith('win'):
    sys.stdout = io.TextIOWrapper(sys.stdout.detach(), encoding='utf-8')

def setup_env():
    print("\n[단계 1] 환경 변수(.env) 점검 및 설정")
    env_path = ".env"
    if not os.path.exists(env_path):
        open(env_path, 'w').close()
    load_dotenv(env_path)
    
    keys = ["GOOGLE_API_KEY", "SUPABASE_URL", "SUPABASE_ANON_KEY", "DATABASE_URL"]
    for k in keys:
        if not os.getenv(k):
            val = input(f"➤ {k} 값을 입력하세요: ").strip()
            set_key(env_path, k, val)
    load_dotenv(env_path, override=True)
    print("✅ 환경 변수 설정 완료.")

def init_db():
    print("\n[단계 2] 온라인 DB(Supabase) 테이블 자동 구축")
    try:
        conn = psycopg2.connect(os.getenv("DATABASE_URL"))
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS projects (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                project_name TEXT NOT NULL,
                status TEXT DEFAULT 'READY',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            CREATE TABLE IF NOT EXISTS activity_logs (
                id SERIAL PRIMARY KEY,
                project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
                message TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        """)
        conn.commit()
        cur.close()
        conn.close()
        print("✅ DB 테이블이 준비되었습니다.")
    except Exception as e:
        print(f"❌ DB 오류: {e}")
        sys.exit()

def launch_project():
    name = input("\n➤ 새 프로젝트 이름을 입력하세요 (예: 게시판_프로젝트): ").strip()
    if not name: return
    try:
        conn = psycopg2.connect(os.getenv("DATABASE_URL"))
        cur = conn.cursor()
        cur.execute("INSERT INTO projects (project_name, status) VALUES (%s, 'READY');", (name,))
        conn.commit()
        print(f"🚀 프로젝트 '{name}' 생성 지시 완료! (Status: READY)")
    except Exception as e: print(f"❌ 생성 실패: {e}")

def main():
    setup_env()
    init_db()
    while True:
        print("\n" + "="*50)
        print("🤖 AI 관제 시스템 CLI 메인 메뉴")
        print("="*50)
        print("1. 신규 프로젝트 생성 및 AI 가동 지시")
        print("2. 현재 시스템 상태 체크 (Git/Vercel)")
        print("3. 종료")
        choice = input("\n➤ 선택: ").strip()
        if choice == '1': launch_project()
        elif choice == '3': break

if __name__ == "__main__":
    main()
