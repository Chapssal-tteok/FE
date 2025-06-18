# PreView Frontend Repository

## 👥 팀 소개

**Team 30 - 찹쌀떡**

| 항목 | 신정화 (2271035) | 차현주 (2276321) |
|-----|-----------------|-----------------|
| GitHub | [@jungh150](https://github.com/jungh150) | [@chacha091](https://github.com/chacha091) |
| 역할  | 팀장 / 백엔드 개발자 | 팀원 / 프론트엔드 개발자 |
| 담당 업무 | 백엔드 개발, 서버 배포, AI 기능 구현 | 프론트엔드 개발, UI/UX 디자인, AI 기능 구현 |

## 🔍 프로젝트 개요
**PreView**는 GPT-4o와 RAG 기반 기술을 활용하여 자기소개서 분석과 맞춤형 면접 연습을 지원하는 **AI 면접 시뮬레이션 서비스**입니다.  
취업 준비자가 보다 효율적으로 자기소개서를 개선하고, 실제 면접처럼 연습할 수 있도록 돕는 것이 핵심 목표입니다.


[웹사이트 바로가기](https://chapssaltteok-preview.vercel.app/)
<br>테스트 계정:
- ID: ```test```
- PW: ```test1234```
---

### 🎯 주요 목표
- 객관적이고 세밀한 자기소개서 분석 및 피드백 제공
- 자기소개서 및 기업·직무 맞춤형 면접 예상 질문 생성
- 음성 기반 인터뷰 시뮬레이션을 통한 실전 감각 향상

### 🧠 기술적 특성
- **GPT-4o** 기반 프롬프트 엔지니어링을 통한 정밀한 자소서 피드백
- **Perplexity AI + ChromaDB** 기반 RAG 시스템으로 기업 및 직무 맞춤형 질문 생성
- **Google TTS/STT** 기술을 활용한 음성 기반 면접 연습 기능 제공
- **Next.js App Router** 기반 서버 사이드 렌더링 구현

### 🛠 제공 기능
1. **자기소개서 피드백**  
   → 질문 충실도, 논리 흐름, 구체성 등 6가지 항목 분석 + 개선 예문 제시  
2. **맞춤형 면접 질문 생성**  
   → 자기소개서 핵심 키워드 기반, RAG로 도출된 예상 질문 제공  
3. **음성 면접 시뮬레이션**  
   → TTS/STT로 실제 면접처럼 연습, 답변 분석 및 후속 질문 피드백 제공

## 🛠 기술 스택 및 주요 라이브러리

### 🧩 사용 기술

| 항목 | 내용 |
|-----|------|
| Language | TypeScript |
| Framework | Next.js 14 |
| Build Tool | npm |
| UI Library | Shadcn/ui |
| Styling | Tailwind CSS |
| State Management | React Context |
| API Integration | Axios |
| 배포 | Vercel |

---

### 📦 주요 라이브러리

| 범주 | 라이브러리명 / 기능 설명 |
|-----|-----------------------|
| **UI 컴포넌트** | `@radix-ui/*` – 접근성 고려한 UI 컴포넌트<br>`@shadcn/ui` – 커스터마이저블 컴포넌트<br>`tailwindcss` – 유틸리티 기반 스타일링 |
| **상태 관리** | `react-context` – 전역 상태 관리<br>`zustand` – 클라이언트 상태 관리 |
| **API 통신** | `axios` – HTTP 클라이언트<br>`react-query` – 서버 상태 관리 |
| **폼 관리** | `react-hook-form` – 폼 상태 및 유효성 검증<br>`zod` – 스키마 기반 데이터 검증 |
| **음성 처리** | `react-media-recorder` – 음성 녹음 기능<br>`web-speech-api` – 음성 인식 처리 |
| **유틸리티** | `date-fns` – 날짜 처리<br>`class-variance-authority` – 조건부 스타일링 |

---

## 📁 프로젝트 구조
```
├── public/                # 정적 파일
│   ├── favicon.ico
│   ├── font/             # 폰트 파일
│   └── svg/              # SVG 아이콘 및 이미지
│
├── src/
│   ├── api-client/      # API 통신 관련 코드
│   │   ├── core/       # API 코어 유틸리티
│   │   ├── models/     # API 요청/응답 타입 정의
│   │   ├── services/   # API 서비스 구현
│   │   └── index.ts    # API 클라이언트 설정
│   │
│   ├── app/            # Next.js 페이지 컴포넌트
│   │   ├── chat/[id]/     # 채팅 상세 페이지
│   │   ├── interview/[id]/ # 면접 상세 페이지
│   │   ├── resume/[id]/   # 이력서 상세 페이지
│   │   ├── login/        # 로그인 페이지
│   │   ├── mypage/       # 마이페이지
│   │   ├── signup/       # 회원가입 페이지
│   │   ├── writeResume/  # 이력서 작성 페이지
│   │   ├── layout.tsx    # 루트 레이아웃
│   │   ├── page.tsx      # 메인 페이지
│   │   └── providers.tsx # 전역 프로바이더
│   │
│   ├── components/      # 재사용 가능한 컴포넌트
│   │   ├── ui/         # 기본 UI 컴포넌트
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   ├── sidebar/    # 사이드바 관련 컴포넌트
│   │   └── mypage/     # 마이페이지 관련 컴포넌트
│   │
│   ├── contexts/      # React Context
│   │   └── AuthContext.tsx  # 인증 관련 컨텍스트
│   │
│   ├── lib/          # 유틸리티 함수
│   │   └── utils.ts  # 공통 유틸리티 함수
│   │
│   └── styles/       # 스타일 관련
│       └── globals.css # 전역 스타일
│
├── .eslintrc.json   # ESLint 설정
├── components.json  # shadcn/ui 컴포넌트 설정
├── next.config.js   # Next.js 설정
├── package.json     # 프로젝트 의존성
├── postcss.config.mjs # PostCSS 설정
├── tailwind.config.js # Tailwind CSS 설정
└── tsconfig.json    # TypeScript 설정
```

### 📚 주요 디렉토리 설명

#### 🔷 `src/api-client`
- OpenAPI 생성기로 생성된 타입-세이프한 API 클라이언트
- API 요청/응답 타입 정의 및 서비스 로직 구현
- 에러 처리 및 요청 취소 기능 포함

#### 🔷 `src/app`
- Next.js 14 App Router 기반의 페이지 구조
- 동적 라우팅을 통한 상세 페이지 구현 ([id] 사용)
- 공통 레이아웃 및 전역 상태 관리

#### 🔷 `src/components`
- **UI**: shadcn/ui 기반의 재사용 가능한 기본 컴포넌트
- **Sidebar**: 내비게이션 및 사용자 메뉴 컴포넌트
- **Mypage**: 사용자 프로필 및 설정 관련 컴포넌트

#### 🔷 `src/contexts`
- 전역 상태 관리를 위한 React Context 구현
- 사용자 인증 상태 관리

#### 🔷 `public`
- 폰트, 이미지 등 정적 리소스 관리
- SVG 아이콘 및 로고 파일

## 🔧 사전 준비사항
프론트엔드 서버를 실행하기 위해 아래의 환경이 필요합니다:

### ✅ 필수 환경
| 항목 | 내용 |
|-----|------|
| Node.js | 18.0.0 이상 |
| npm | 9.0.0 이상 |
| OS | Windows, macOS, Linux |

### 🚀 시작하기

#### 1️⃣ 레포지토리 클론
```bash
git clone https://github.com/Chapssal-tteok/FE.git
cd FE
```

#### 2️⃣ 필수 도구 설치

🔧 Node.js 설치
- Node.js 18.0.0 이상 필요
- [Node.js 공식 웹사이트](https://nodejs.org/)에서 다운로드

🔧 패키지 매니저 설정
OS | 명령어
---|---
Windows | `npm install -g npm@latest`
macOS | `npm install -g npm@latest`
Linux | `sudo npm install -g npm@latest`

#### 3️⃣ 프로젝트 의존성 설치
```bash
npm install
```

#### 4️⃣ 개발 서버 실행
```bash
npm run dev
```
- 기본 실행 주소: http://localhost:3000

#### 5️⃣ 프로덕션 빌드
```bash
npm run build
npm start
```