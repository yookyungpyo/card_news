# Progress — 인스타그램 카드뉴스 제작 자동화

> 모든 진행 과정은 이 파일에 누적 기록합니다. (요청사항)

## 프로젝트 목표
- 인스타그램에 올릴 카드뉴스 이미지를 제작한다.
- 제작 파이프라인을 **재사용 가능한 Skill**로 패키징한다.
- OpenAI가 말하는 **하네스 엔지니어링(Harness Engineering)** 개념으로 환경(도구·템플릿·설정)을 구축한다.
- **루프 엔지니어링(Loop Engineering)** 으로 반복 제작을 자동화한다.
- 메모리 관리 + **다이나믹 워크플로우(Dynamic Workflow)** 를 활용한다.

## 핵심 원칙 (사용자 지시)
1. 본 프로그램을 **먼저 만들지 않는다.** 사용 가능한 스킬/플러그인을 먼저 추천하고, 사용자가 설치한 뒤 진행.
2. 플랜을 잘 구성한다.
3. 메모리 관리를 잘한다.
4. 다이나믹 워크플로우를 사용한다.
5. 과정은 항상 이 Progress.md에 저장한다.

## 단계 (Phase)
- [x] **Phase 0 — 환경 점검**: 작업 디렉토리(`C:\업무방\AI-project\card_news`) 비어 있음 확인, 메모리 초기화.
- [x] **Phase 1 — 플랜 & 스킬/플러그인 추천**: 렌더링 방식 결정, 설치 목록 제시.
- [x] **Phase 2 — 설치**: Playwright Chromium 설치 완료 (chromium-1228, headless_shell, ffmpeg). 스킬은 기존 사용 가능분으로 충분.
- [x] **Phase 3 — 하네스 구축**: 폴더 구조 + theme.json + card.html 템플릿 + render.mjs 엔진 + package.json 완료.
- [x] **Phase 4 — 카드뉴스 1세트 제작 (PoC)**: sample.json → 7장 렌더 성공, 한글 선명, 레이아웃 검증 완료.
- [x] **Phase 5 — Skill 패키징**: `~/.claude/skills/insta-card-news/` 자체 완결형 스킬 생성·검증 완료.
- [ ] **Phase 6 — 루프/스케줄 자동화** (보류 — 사용자 미선택. 필요 시 /loop·/schedule로 큐 배치)
- [x] **Phase 7 — 다이나믹 워크플로우 통합**: 5단계(앵글→심사→구성→검수→저장) 워크플로우 구축·실행 성공. 8장 카드 생성·렌더 완료. args=JSON문자열 버그 진단·수정, 워크플로우 영구 저장.

## 다이나믹 워크플로우 (Phase 7 완료)
- 영구 스크립트: `workflows/card-news-generator.js`
- 입력(args, **JSON 문자열로 전달됨 → 내부에서 JSON.parse**): `{ topic, brand, outPath }`
- 단계: Angle(3병렬) → Judge → Compose(슬라이드수 동적) → Critique(적대검수) → Save
- 산출물 예: `content/ai-work-tips.json` → `output/ai-work-tips/` (8장)
- 실행: `Workflow({ scriptPath: "workflows/card-news-generator.js", args: { topic, brand, outPath } })`

## 하네스 구조 (Phase 3 완료)
```
card_news/
├── config/theme.json      # 색상·폰트·규격(1080×1350·@2x) 테마
├── content/sample.json     # 카드 콘텐츠 (meta + slides[]: cover/content/outro)
├── templates/card.html     # HTML/CSS 템플릿 (window.renderSlide)
├── scripts/render.mjs      # Playwright 렌더 엔진
├── output/<name>/          # 생성된 PNG (NN_type.png)
└── package.json            # playwright 의존성, npm run render
```
**렌더 명령:** `node scripts/render.mjs content/<파일>.json [config/theme.json] [outDir]`

## 결정 사항 (2026-06-21)
- **렌더링 방식:** HTML/CSS 템플릿 전용 → Playwright 스크린샷 (AI 이미지 생성 미사용)
- **카드 규격:** 세로형 1080×1350 (4:5)

## 사용 스킬/도구 확정
- 이미 사용 가능(설치 불필요): `webapp-testing`(Playwright), `theme-factory`, `skill-creator`, `loop`, `schedule`
- 로컬 환경 점검 결과:
  - Node v24.11.1 ✅ / npm 11.6.2 ✅
  - Playwright 1.61.0 (npx) ✅
  - 한글 폰트: Malgun Gothic, NanumGothic, NotoSansKR, NotoSerifKR 모두 설치됨 ✅
  - ⚠️ Playwright **Chromium 브라우저 바이너리 미설치** → `npx playwright install chromium` 필요 (유일한 설치 항목)

## 로그
- 2026-06-21: 프로젝트 시작. Progress.md / 메모리 초기화.
- 2026-06-21: 렌더링=HTML/CSS전용, 규격=1080×1350 확정. 환경 점검 완료. Chromium 브라우저만 설치하면 준비 완료.
- 2026-06-21: `npx playwright install chromium` 완료. 환경 100% 준비. Phase 3 하네스 구축 착수.
- 2026-06-21: 하네스 구축 완료(theme/template/render/package). playwright 로컬 설치. PoC 7장 렌더 성공 후 푸터-장식바 겹침 버그 수정 → 재렌더 검증 완료. Phase 3·4 종료.
- 2026-06-21: 다이나믹 워크플로우 구축·실행(6에이전트/~2분). "AI 업무 기술" 8장 생성→렌더 검증. args가 JSON문자열로 옴을 진단(미니 프로브), JSON.parse 수정 후 workflows/card-news-generator.js 영구 저장. 메모리 기록. Phase 7 종료.
- 남은 작업: Phase 5(Skill 패키징), Phase 6(루프/스케줄 자동화).
- 2026-06-21: [검증] AX 주제로 워크플로우 재실행 → args 정상 전달 확인, Save 에이전트가 content/ax-first-step.json 자동 저장(완전 자동화). AX 7장 렌더 완료.
- 2026-06-21: [디자인] 스와이프 힌트(커버) + 페이지표시(콘텐츠 N/총) 추가, 라이트 테마(paper-coral) 추가. 다크/라이트 양쪽 렌더 검증. 사용자 선택: 1·2·4 진행(루프 자동화는 보류).
- 산출물: output/ai-work-tips(8장), output/ai-work-tips-light(8장), output/ax-first-step(7장), output/sample(7장).
- 2026-06-22: [Phase 5] skill-creator로 insta-card-news 스킬 생성. 하네스 자산(render/template/themes/workflow/sample) 번들, SKILL.md 작성. 스킬 폴더에서 자체 렌더 검증 성공. 위치: ~/.claude/skills/insta-card-news/. 정식 eval 벤치마크는 생략(주관적 디자인 산출물 + 파이프라인 사전검증됨).

## 최종 상태
- ✅ 환경(하네스) 구축 + 다크/라이트 테마
- ✅ 다이나믹 워크플로우(주제→카피, 멀티에이전트)
- ✅ 재사용 Skill `insta-card-news` (세션 간 사용 가능)
- ⏸ 루프/스케줄 자동화는 보류(요청 시 진행)

## 실전 테스트 (2026-06-22)
- [x] 주제 "사내 AX 성공법", 방법 B(다이나믹 워크플로우), **스킬 번들 스크립트** 사용 → content/sanae-ax.json 자동저장 → 8장 렌더 성공.
  - 카피 품질 우수("AX 한다더니 또 PPT만 쌓였나요?"). args 정상 전달, Save 자동저장 확인.
  - **발견·수정**: 아웃트로 제목이 길면 커버용 96px로 3줄 넘침 → `.outro-title` 크기 0.74배(line-height 1.24)로 조정, 프로젝트·스킬 양쪽 템플릿 동기화 후 재렌더 검증.
- 테스트 결론: 스킬 end-to-end 정상 동작. 산출물 output/sanae-ax/ (8장).

## 사진(이미지) 지원 추가 (2026-06-22)
- 요청: "사진을 넣으면 관련 내용을 뽑아 카드뉴스 제작" + "사진을 카드에 삽입" → 둘 다 지원.
- 모드 1(내용 소스): 이미지 Read로 요점 추출 → 콘텐츠 생성. 템플릿 변경 없음, SKILL.md 절차 추가.
- 모드 2(카드 비주얼): 슬라이드 `image` 필드 지원. 템플릿 리팩터(.layer/.bgimg/.scrim/.photo-band),
  render.mjs에 이미지 경로 file:// 변환 + 로딩 대기 추가.
  - cover/outro+image=풀블리드 배경(스크림+흰텍스트), content+image=상단 사진밴드, `fullBleed:true` 옵션.
- 테스트: assets/test-photo.jpg 생성 → content/photo-test.json 4장 렌더, 커버 풀블리드/콘텐츠 밴드 검증 OK.
- 엔진(card.html, render.mjs) 스킬에 동기화, SKILL.md 2.5절 추가.
- 2026-06-22: [실사진 테스트-모드①] 사용자가 'AI/AX 버즈워드' 캡처 이미지 + "증강·자동화·조직화" 관점 제공.
  이미지 내용 추출 → content/ai-ax-question.json(8장) 생성·렌더 성공. 커버/증강/아웃트로 검수 OK.
- 2026-06-22: [이모지+캐릭터] 요청 반영. content 슬라이드 `icon`(컬러 이모지 칩), `meta.character`(커버·아웃트로
  우하단 마스코트, 제목폭 자동축소) 지원. assets/my.png(투명배경 확인) 사용. 커버 제목 폭/부제 조정.
  엔진+캐릭터 스킬 동기화, SKILL.md 2.6절 추가. 최종 ai-ax-question 8장 완성.
- 2026-06-22: [인포그래픽 테스트] 'AI 에이전트 시대 전문성(도메인 지식)' 인포그래픽 → 7장(커버+5단계+결론).
  슬라이드별 `char` 배치(pos/h/flip/rot/show) 지원 추가 — 포즈 1장으로 위치·반전·회전·크기 변형.
  데이터 슬라이드는 코너 소형(가독성), cover/outro 대형. 결론은 직접 작성. 커버/아웃트로 제목폭 재조정.
  엔진 스킬 동기화. 산출물 output/ai-domain-expertise/ (7장).
  (한계: 진짜 다른 포즈는 포즈 이미지 추가 또는 AI 생성 필요 — 사용자에게 안내함.)
- 2026-06-22: [다중 포즈 지원] 사용자가 포즈 직접 준비 선택. `char.src`(슬라이드별 포즈 이미지 override) 추가.
  render.mjs가 char.src 경로도 file:// 변환. 회귀 렌더 OK, 엔진 스킬 동기화, SKILL.md 다중 포즈 절 추가.
- 2026-06-22: [브랜드/연락처 표준화] 모든 카드 푸터를 좌:www.wylieax.com / 우:문의 : pyo0700@wylie.co.kr 로 변경.
  템플릿 footerHTML에 meta.contact(우측) 지원, 워크플로우 기본 brand/contact 이 값으로 고정 + CTA 핸들 금지 규칙.
  모든 content/*.json meta 표준화 + CTA의 @핸들 제거(스크립트). 전체 7덱 재렌더, 엔진+워크플로우 스킬 동기화, SKILL.md 갱신.
- 2026-06-22: [haroo 포즈 라이브러리] 사용자가 assets/my_expression.png(haroo 캐릭터 포즈 시트) 제공.
  자동 분할(연결요소 검출, 54개) → 흰배경 테두리 플러드필 투명화 + 최대덩어리 보존 + bbox 트림 → assets/poses/01~54.png.
  컨택트 시트(_contact_dark.png) 생성해 포즈 식별. ai-domain-expertise 7장에 슬라이드별 다른 포즈(char.src) 적용
  (커버09/01효율32/격차42/복합30/점프08/결론01 등). 캐릭터 z-index를 텍스트 뒤(1)로 내려 제목·이메일 가독성 확보.
  포즈 54개+컨택트시트 스킬에 동기화, SKILL.md 포즈 라이브러리 절 추가. 산출물 output/ai-domain-expertise/(7장).
- 2026-06-22: [흰 테두리 제거] 컷아웃 헤일로 개선 — 디프린지(무채색·밝은 엣지 픽셀 3패스 제거, 유채색 재킷 보존) +
  1px 엣지 소프트닝. 54개 포즈 재처리, 덱 재렌더(흰 테두리 사라짐 확인), 컨택트시트 갱신, 스킬 재동기화.
- 2026-06-22: [가독성+내부 흰패치] 사용자 피드백 2건. ① 푸터 readability 스크림(.footer::before, bg 그라데이션)
  추가 — 캐릭터 위에서도 웹사이트/이메일 또렷. ② 컷아웃의 내부 큰 흰 영역(종이/소품) 제거(연결요소>120px 투명화,
  눈·하이라이트 등 작은 흰색은 보존). 54포즈 재처리·덱 재렌더 검증, 컨택트시트·스킬 동기화.
