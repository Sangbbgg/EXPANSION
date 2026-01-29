모든 과정을 사용자의 수동 조작 없이 **CLI 터미널에서 단계별로 지시하고, 자동 검증하며, 실행까지 관리**할 수 있도록 최적화된 전체 컨텍스트를 `.md` 파일 형식으로 제공합니다.

이 내용을 복사해서 `PROJECT_CLI_MASTER.md`로 저장하세요. 이 문서 하나만 있으면 시스템 구축부터 운영까지 모든 단계를 CLI로 제어할 수 있습니다.

---

# 🤖 AI 프로젝트 관제 시스템: 통합 CLI 자동화 마스터북

이 시스템은 **Gemini AI**가 코드를 생성하고, **Supabase**가 상태를 관리하며, 모든 과정이 **CLI 터미널**에서 단계별로 통제되는 자동화 프로젝트 관제 시스템입니다.

---

## 🛠️ Phase 1: 로컬 환경 및 터미널 인코딩 설정

VS Code 터미널에서 한글 깨짐을 방지하고 자동화에 필요한 라이브러리를 설치하는 첫 단계입니다.

**CLI 실행 명령어:**

```bash
# 1. 터미널 한글 깨짐 방지 (윈도우 필수)
chcp 65001

# 2. 필수 라이브러리 설치
pip install psycopg2-binary python-dotenv google-generativeai supabase fastapi uvicorn

```

> **✅ Checkpoint 1: 환경 준비**
> * [ ] 터미널 인코딩이 `65001`로 설정되었는가?
> * [ ] 패키지 설치 시 `Error` 없이 완료되었는가?
> 
> 

---

## ⚡ Phase 2: 통합 자동화 관리자 (`manager.py`)

이 스크립트는 **Key 설정, DB 구축, 프로젝트 생성 지시**를 한 곳에서 처리하는 컨트롤 타워입니다.

```python
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

```

---

## 🤖 Phase 3: AI 실행 워커 (`worker.py`)

사용자의 지시를 감지하여 실제로 Gemini AI를 호출하고 코드를 생성하는 '수행자'입니다. 별도의 터미널에서 계속 실행해 둡니다.

```python
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

```

---

## 📤 Phase 4: Git 연동 및 Vercel 배포 (자동화 단계)

CLI에서 모든 준비가 끝나면, 대시보드를 클라우드에 올립니다.

1. **Git Push**:
```bash
git init
echo ".env" >> .gitignore
git add .
git commit -m "feat: AI Control System Initial"
git remote add origin [내_레포_주소]
git push -u origin main

```


2. **Vercel 연결**:
* Vercel 대시보드에서 GitHub 레포를 연결하고 `.env`에 있는 키(URL, ANON_KEY)를 **Environment Variables**에 추가합니다.



---

## 🔄 Phase 5: 운영 시나리오 및 체크포인트 (Monitoring)

사용자는 CLI 메뉴를 통해 다음 단계를 자동으로 확인합니다.

| 단계 | CLI 지시 / 반응 | 결과 확인 (Checkpoint) |
| --- | --- | --- |
| **01** | `manager.py`에서 1번 선택 | Supabase DB에 신규 프로젝트 데이터 생성 |
| **02** | `worker.py`가 지시 감지 | 터미널 로그에 "Gemini 가동" 출력 |
| **03** | AI 코드 생성 진행 | `activity_logs` 테이블에 실시간 로그 업데이트 |
| **04** | 사용자 승인 대기 | 상태가 `PENDING_APPROVAL`로 변경됨 |
| **05** | 최종 빌드(준비 중) | 승인 시 로컬 폴더에 결과물 저장 |

---

## 📂 최종 폴더 구성

```text
/ai-control-system
├── manager.py           # [메인] 설정, DB구축, 지시 하달
├── worker.py            # [수행] AI 코드 생성 및 로그 기록
├── .env                 # [저장] 모든 비밀키 (자동 생성됨)
├── .gitignore           # [보안] .env 배포 제외
└── /generated_projects  # [결과] AI가 생성한 프로젝트 저장소

```

---

**안내**: 이제 이 파일의 모든 내용을 숙지하셨다면, 터미널에서 **`python manager.py`**를 실행하여 시스템을 가동하세요. 모든 단계는 CLI가 가이드하며 당신의 확인을 기다릴 것입니다.