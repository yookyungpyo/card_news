export const meta = {
  name: 'card-news-generator',
  description: '주제 1개를 받아 인스타 카드뉴스 콘텐츠 JSON을 다단계로 생성(앵글→심사→구성→검수→저장)',
  phases: [
    { title: 'Angle', detail: '서로 다른 3가지 접근 앵글 병렬 생성' },
    { title: 'Judge', detail: '인스타 적합도로 최적 앵글 선택' },
    { title: 'Compose', detail: '풀 슬라이드 JSON으로 확장 (슬라이드 수 동적)' },
    { title: 'Critique', detail: '적대적 검수로 카피 개선' },
    { title: 'Save', detail: 'content/*.json 파일로 저장' },
  ],
}

// 이 하네스에서 args 는 JSON "문자열" 로 전달된다 → 반드시 파싱.
const A = typeof args === 'string' ? JSON.parse(args) : (args || {})
const topic = A.topic || '직장인을 위한 AI 활용법'
const brand = A.brand || 'www.wylieax.com'
const contact = A.contact || '문의 : pyo0700@wylie.co.kr'
const outPath = A.outPath

const ANGLE_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['hook', 'approach', 'outline'],
  properties: {
    hook: { type: 'string', description: '커버에 쓸 강력한 한 줄 훅' },
    approach: { type: 'string', description: '이 앵글의 콘셉트/차별점 한 문장' },
    outline: { type: 'array', items: { type: 'string' }, description: '본문 슬라이드 소제목 4~6개' },
  },
}

const JUDGE_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['winner', 'reason'],
  properties: {
    winner: { type: 'number', description: '가장 좋은 앵글의 인덱스 (0,1,2)' },
    reason: { type: 'string' },
  },
}

const SLIDE_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['type'],
  properties: {
    type: { type: 'string', enum: ['cover', 'content', 'outro'] },
    badge: { type: 'string' },
    title: { type: 'string' },
    subtitle: { type: 'string' },
    index: { type: 'string' },
    heading: { type: 'string' },
    body: { type: 'string' },
    cta: { type: 'string' },
  },
}
const CONTENT_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['meta', 'slides'],
  properties: {
    meta: {
      type: 'object', additionalProperties: false,
      required: ['brand', 'topic'],
      properties: { brand: { type: 'string' }, topic: { type: 'string' } },
    },
    slides: { type: 'array', items: SLIDE_SCHEMA },
  },
}

const SCHEMA_DOC = `
카드뉴스 콘텐츠 스키마 (한국어로 작성):
{
  "meta": { "brand": "${brand}", "topic": "${topic}" },
  "slides": [
    { "type": "cover", "badge": "짧은 라벨", "title": "강력한 제목 (줄바꿈은 \\n 사용, 최대 2줄)", "subtitle": "한 줄 부제" },
    { "type": "content", "index": "01", "heading": "소제목(짧고 강함)", "body": "본문 2~3문장, 구체적이고 실용적으로" },
    ...(content 슬라이드 4~6개, index는 01,02,...),
    { "type": "outro", "title": "마무리 메시지", "cta": "저장/공유 유도 (SNS 핸들 금지, 필요시 www.wylieax.com)" }
  ]
}
규칙: 모든 텍스트는 자연스러운 한국어. 커버 title은 임팩트 있게. body는 한 문장이 길지 않게(모바일 가독성). 과장/클릭베이트 금지, 정보 가치 우선. CTA에 SNS 핸들(@...) 쓰지 말 것.`

// Phase 1: 3가지 앵글 병렬 생성
phase('Angle')
const angleStyles = [
  '실용 체크리스트형 — 오늘 바로 따라 할 수 있는 단계 위주',
  '오해 깨기형 — 흔한 착각/실수를 짚고 바로잡는 구성',
  '스토리/전환형 — Before→After 변화를 보여주는 서사',
]
const angles = (await parallel(angleStyles.map((style, i) => () =>
  agent(
    `너는 인스타그램 카드뉴스 기획자다. 주제: "${topic}".\n` +
    `이 스타일로 카드뉴스 앵글을 1개 기획하라: ${style}\n` +
    `타깃: 한국 직장인. 훅은 스크롤을 멈추게 할 한 줄. outline은 본문 슬라이드 소제목 4~6개.`,
    { label: `angle:${i + 1}`, phase: 'Angle', schema: ANGLE_SCHEMA }
  )
))).filter(Boolean)

// Phase 2: 심사
phase('Judge')
const judged = await agent(
  `다음은 주제 "${topic}"에 대한 카드뉴스 앵글 후보 ${angles.length}개다.\n` +
  angles.map((a, i) => `[${i}] 훅: ${a.hook}\n    콘셉트: ${a.approach}\n    구성: ${a.outline.join(' / ')}`).join('\n\n') +
  `\n\n인스타그램 저장/공유가 가장 잘 나올 앵글 1개를 골라라. 정보가치·훅 강도·실용성 기준.`,
  { label: 'judge', phase: 'Judge', schema: JUDGE_SCHEMA }
)
const winner = angles[judged.winner] || angles[0]
log(`선택된 앵글: "${winner.hook}" — ${judged.reason}`)

// Phase 3: 풀 슬라이드 구성 (슬라이드 수 동적)
phase('Compose')
const draft = await agent(
  `너는 카드뉴스 카피라이터다. 아래 선택된 앵글을 완성된 카드뉴스 콘텐츠로 확장하라.\n` +
  `주제: ${topic}\n훅: ${winner.hook}\n콘셉트: ${winner.approach}\n본문 소제목 초안: ${winner.outline.join(' / ')}\n\n` +
  `cover 1장 + content ${winner.outline.length}장 + outro 1장으로 구성. 소제목 수는 내용 밀도에 맞게 4~6 사이로 조정 가능.\n` +
  SCHEMA_DOC,
  { label: 'compose', phase: 'Compose', schema: CONTENT_SCHEMA }
)

// Phase 4: 적대적 검수 → 개선본
phase('Critique')
const finalContent = await agent(
  `너는 깐깐한 카드뉴스 편집자다. 아래 JSON 카드뉴스를 검수하고 개선된 최종본을 반환하라.\n` +
  `점검: (1) 커버 훅이 약하지 않은가 (2) 각 body가 모바일에서 너무 길지 않은가(가능하면 60자 내외) ` +
  `(3) 소제목이 추상적이지 않고 구체적인가 (4) 한국어가 자연스러운가 (5) 마지막 outro의 CTA가 명확한가.\n` +
  `브랜드/주제 meta는 그대로 유지. 문제 있으면 고치고, 좋으면 유지해서 전체 JSON을 반환.\n\n` +
  `현재 JSON:\n${JSON.stringify(draft, null, 2)}\n\n${SCHEMA_DOC}`,
  { label: 'critique', phase: 'Critique', schema: CONTENT_SCHEMA }
)

// meta 강제 정합 (브랜드/연락처는 항상 표준값으로 고정)
finalContent.meta = { brand, topic, contact }

// Phase 5: 파일로 저장 (writer 에이전트가 정확히 기록)
phase('Save')
if (outPath) {
  await agent(
    `아래 JSON을 한 글자도 바꾸지 말고 그대로 파일로 저장하라.\n` +
    `Write 도구로 파일 경로 "${outPath}" 에 정확히 이 내용을 기록하라. 끝나면 "saved"만 반환.\n\n` +
    JSON.stringify(finalContent, null, 2),
    { label: 'save', phase: 'Save' }
  )
}

log(`완료: ${finalContent.slides.length}장 슬라이드 생성`)
return finalContent
