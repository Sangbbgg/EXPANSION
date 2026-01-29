# 파일명: worker.py
import os, time, google.generativeai as genai, psycopg2
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-flash')

def get_db_conn():
    return psycopg2.connect(os.getenv("DATABASE_URL"))

def log(p_id, msg):
    conn = get_db_conn(); cur = conn.cursor()
    cur.execute("INSERT INTO activity_logs (project_id, message) VALUES (%s, %s)", (p_id, msg))
    conn.commit(); cur.close(); conn.close()
    print(f"📝 [LOG]: {msg}")

def work():
    print("🛰️ AI 워커가 지시를 기다리는 중...")
    while True:
        conn = get_db_conn(); cur = conn.cursor()
        cur.execute("SELECT id, project_name FROM projects WHERE status = 'READY' LIMIT 1")
        row = cur.fetchone()
        if row:
            p_id, p_name = row
            # 상태 변경
            cur.execute("UPDATE projects SET status = 'GENERATING' WHERE id = %s", (p_id,))
            conn.commit()
            log(p_id, f"Gemini가 {p_name} 프로젝트를 분석하고 코드를 작성하기 시작했습니다.")
            
            # Gemini 호출
            res = model.generate_content(f"{p_name} 개발을 위한 핵심 코드와 구조를 짜줘.")
            log(p_id, "코드 생성 완료. 사용자 승인 대기 중 (PENDING_APPROVAL)")
            
            cur.execute("UPDATE projects SET status = 'PENDING_APPROVAL' WHERE id = %s", (p_id,))
            conn.commit()
        cur.close(); conn.close()
        time.sleep(5)

if __name__ == "__main__":
    work()
