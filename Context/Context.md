# 🚀 프로젝트 EXPANSION: AI 매니저 마스터 설계도

## 1. 프로젝트 개요 (Overview)

* **프로젝트 명**: **EXPANSION**
* **정의**: 관리자의 웹 UI 지시에 따라 AI(Gemini)가 클라우드의 격리된 컨테이너에서 코딩, 테스트, 배포를 전담하는 **Zero-Local** 자동화 시스템입니다.
* **비전**: 로컬 환경 구축 없이 브라우저만으로 수많은 프로젝트를 병렬로 지휘하고 확장(Expansion)해 나가는 AI 개발 허브 구축.
* **핵심 목표**:
* 로컬 개발 세팅 0% (Cloud-Native).
* 다중 프로젝트 병렬 지휘 및 실시간 통합 모니터링.
* 무료 서비스 조합을 통한 운영 비용 0원 유지.



---

## 2. 시스템 아키텍처 (Architecture)

* **Management Layer (Control Tower)**:
* **Web UI**: Next.js 기반 대시보드. Vercel 호스팅. AI 채팅창 및 실시간 로그 뷰어 제공.


* **Orchestration Layer (Brain)**:
* **Gemini API Controller**: 관리자의 의도를 분석하여 실행 가능한 CLI 명령으로 변환.
* **Worker Manager**: 프로젝트별 실행 환경(Runner)의 생명주기 관리.


* **Execution Layer (Cloud Sandbox)**:
* **GitHub Codespaces/Docker**: AI가 직접 코드를 작성하고 실행하는 격리된 가상 작업장.
* **Live Preview**: 배포 전 결과물을 즉시 확인할 수 있는 임시 스테이징 URL 제공.


* **Storage Layer**:
* **Remote Git (EXPANSION Repo)**: 모든 결과물은 GitHub 저장소에 실시간 동기화.
* **State DB**: AI 작업 이력 및 프로젝트 컨텍스트 저장.



---

## 3. 상세 기능 명세 (Functional Specifications)

### 3.1 AI 지휘 및 실행 엔진

* **프롬프트 기반 작업 생성**: 사용자의 자연어 지시를 분석하여 단계별 개발 로드맵(Task) 생성.
* **Self-Healing Loop**: 빌드 에러 시 AI가 에러 로그를 읽고 스스로 코드를 수정하는 자가 치유 루프.

### 3.2 실시간 모니터링 및 시각화

* **Terminal Mirroring**: 클라우드 샌드박스의 모든 터미널 출력(stdout)을 웹 대시보드에 실시간 중계.
* **진행 단계 추적**: 기획 → 설계 → 구현 → 테스트 → 완료 과정을 시각화하여 한눈에 파악.

### 3.3 관리자 인터페이스

* **Checkpoint 시스템**: 중요한 아키텍처 결정 시 AI가 멈추고 관리자의 승인을 대기.
* **Multi-Project Switcher**: 여러 프로젝트를 넘나들며 개별 에이전트들의 상태를 제어.

---

## 4. [실전] Zero-Cost 인프라 구축 가이드

### 4.1 저장소 생성 및 배포 환경 연동

1. **GitHub 저장소 생성**: 저장소 이름 **`EXPANSION`**으로 생성 (Public 추천).
2. **Vercel 연결**: Vercel 대시보드에서 `EXPANSION` 저장소를 Import하여 자동 배포 설정.
3. **Codespaces 활성화**: GitHub `EXPANSION` 저장소에서 `[Code] -> [Codespaces]`를 통해 온라인 IDE 확보.

### 4.2 Gemini API 두뇌 이식

1. **API 키 발급**: [Google AI Studio](https://aistudio.google.com/)에서 키 생성 및 복사.
2. **환경 변수(Secrets) 등록**:
* **GitHub**: `Settings -> Secrets -> Codespaces`에 `GEMINI_API_KEY` 등록.
* **Vercel**: `Settings -> Environment Variables`에 `GEMINI_API_KEY` 등록.



---

## 5. 데이터 및 워크플로우 (Workflow)

### 5.1 데이터 모델

| 구분 | 항목 | 설명 |
| --- | --- | --- |
| **Projects** | ID, Name, Status | 프로젝트 `EXPANSION` 내 각 하위 프로젝트 상태 |
| **Tasks** | Instruction, Log, Result | AI에게 내린 명령과 터미널 실행 기록 |
| **Snapshots** | Commit_Hash, ID | 특정 시점의 코드 및 환경 상태 기록 |

### 5.2 표준 수행 흐름

1. **Instruction**: 관리자가 웹 UI에 개발 목표 입력.
2. **Provisioning**: 클라우드에 전용 샌드박스 컨테이너 즉시 할당.
3. **Implementation**: Gemini가 패키지 설치 및 소스 코드 작성 시작.
4. **Verification**: AI가 테스트 코드를 실행하여 정상 작동 확인.
5. **Sync & Deploy**: 최종 코드를 GitHub `EXPANSION` 저장소에 푸시하고 웹에 자동 배포.

---

## 6. 단계별 로드맵 (Roadmap)

### 6.1 Phase 1: Foundation (기반)

* GitHub-Vercel-Gemini API 기본 통신망 구축.
* 웹에서 내린 명령이 클라우드 터미널에 전달되는 기초 통로 확보.

### 6.2 Phase 2: Intelligence (지능화)

* AI 자동 디버깅(Self-healing) 루프 구현.
* 실시간 터미널 로그 웹 스트리밍 기능 완성.

### 6.3 Phase 3: Expansion (고도화)

* 수십 개의 프로젝트를 동시 지휘하는 멀티 대시보드 완성.
* 프로젝트별 리소스 및 비용(0원 유지 확인) 모니터링 기능 추가.

---

### [관리자 핵심 팁]

* **저장소 이름 활용**: 모든 API 요청이나 폴더 구조에서 프로젝트 명인 **`EXPANSION`**을 일관되게 사용하여 AI의 컨텍스트 혼동을 방지하세요.
* **비용 관리**: Gemini 무료 티어(15 RPM) 내에서 충분히 운영 가능하므로 별도의 결제 수단 등록은 필요하지 않습니다.

**이제 저장소 `EXPANSION`이 준비되었습니다. 첫 번째 작업으로 "웹 대시보드의 메인 화면 UI 코드"를 AI에게 짜달라고 해볼까요?**