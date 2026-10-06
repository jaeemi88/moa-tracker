# MOA FORMULA 수강생 사후관리 트래커 (moa-tracker)

## 앱 정보
- 진로모아커리어센터 "면접스킬" 앱 묶음의 하나. 개인관리(수강생별 케어) + 진로모아관리(기관·프로그램 실적)
- Vercel 프로젝트: moa-tracker (https://moa-tracker-tau.vercel.app) / GitHub: jaeemi88
- 파일은 저장소 최상위에 바로 있음 (public 폴더 아님)
  - index.html: 강사·학생 설문 화면 전체 / api/: 서버 함수 / moa-ui.css·moa-ui.js: 공용 디자인 키트
- 화면 구분
  - 강사(기본): ?t=강사코드 → staff-guard.js(always 모드) 잠금. 원장님 암호(STAFF_PIN)만 인정 (강사 개인 승인 링크 ?k=는 안 됨)
  - 학생 설문(공개): ?survey=1&t=강사코드&p=프로그램ID — 허브 반별 QR·운영보드 반별 집계와 연결
  - 원장님: ?master=1 (MASTER_ADMIN_PASSWORD)
- 환경변수: REDIS_URL, STAFF_PIN, MASTER_ADMIN_PASSWORD

## 디자인 규칙
- 대표색: 라임 #C0D904 (글자는 올리브 #3D4500). 화면 톤은 공용 디자인 키트(남색 #141A2E + 라임)
- 폰트: Noto Sans KR / 흰 배경 / 상단 "MOA FORMULA" 로고
- 버튼·카드 모양은 다른 면접스킬 앱과 통일
- 학생용 버튼은 대표색 채움, 강사용은 같은 색 테두리 + 자물쇠 아이콘
- 소속 강사 명칭은 "파트너강사" ("파견강사" 사용 금지)

## 반드시 유지할 기능 (2026-10-06 기준, index.html 약 1,107줄 — 이보다 크게 줄면 옛 버전으로 돌아간 것)
- 학생 만족도·소감 설문 (별점) (renderSurveyScreen, bindStars)
- 수강생 목록·상세·케어 기록 (renderStudentList, renderStudentDetail, renderStudentDetailWithRecord)
- 프로그램(기관·반) 목록·상세·설문 집계 (renderProgramList, renderProgramDetail, loadSurveyStats)
- 소감 모아보기 (renderReviews)
- 원장님 강사 명단 관리 (renderMasterTeacherList)

## 작업 원칙
- 수정 전 항상 현재 저장소의 최신 index.html을 기준으로 작업 (예전 버전 덮어쓰기 금지)
- 수정본은 저장소 최상위에 저장 (이 앱은 public 폴더를 쓰지 않음)
- 수정 후 줄 수가 크게 줄었거나 위 기능이 사라졌으면 작업 중단하고 알릴 것
- api/teacher-registry.js는 모의면접·자소서·트래커 공용 최신 버전 유지 (같은 Redis 강사 명단·초대코드 공유)
  - 2026-10-06 확인: 이 앱의 파일(261줄)이 자소서·모의면접(398줄)보다 옛 버전. 맞출지는 원장님 확인 후 진행
- staff-guard.js, moa-ui.css, moa-ui.js도 여러 앱 공용 파일. 고칠 때는 다른 앱의 같은 파일과 함께 맞출 것
- 큰 변경은 먼저 계획을 보여주고 승인받은 뒤 진행
- 결과물은 모바일에서도 정상 표시되어야 함
