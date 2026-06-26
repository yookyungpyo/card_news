// Deck data + theme for the Reel POC.
// Ported from content/ai-keep-human.json (cream-navy theme). Character `pose`
// is the filename under public/poses/. Body/title use \n for hand-set breaks
// and *…* for handwriting emphasis — same conventions as the static cards.

export const theme = {
  bg: '#fbf7f2',
  bgAccent: '#eae6f0',
  primary: '#2b4c7e',
  text: '#1c1a19',
  textDim: '#6b6460',
};

export const meta = {
  brand: 'www.wylieax.com',
  contact: '문의 : pyo0700@wylie.co.kr',
  topic: 'AI를 쓰되 잃지 말 것',
};

export const slides = [
  {
    type: 'cover',
    badge: 'AI 시대의 균형',
    title: 'AI가 편할수록\n*잃어가는 것들*',
    subtitle: '편리함에 떠밀려\n사라지는 인간적인 것들',
    pose: '01.png', pos: 'br', flip: false,
  },
  {
    type: 'content',
    index: '01', icon: '🎨',
    heading: '내 손으로\n만들던 즐거움',
    body: '기존 방식으로 끙끙대며\n만들 때의 몰입과 뿌듯함.\nAI에 맡길수록\n그 재미가 옅어집니다.',
    pose: '24.png', pos: 'bl', flip: true,
  },
  {
    type: 'content',
    index: '02', icon: '🪨',
    heading: '실패가\n키워준 맷집',
    body: '틀리고 깨지며 배운 교훈,\n버텨내며 단단해진 맷집.\n실패를 건너뛰면\n그 힘도 자라지 않아요.',
    pose: '26.png', pos: 'br', flip: false,
  },
  {
    type: 'content',
    index: '03', icon: '🤔',
    heading: "가장 아쉬운 건\n'고뇌'",
    body: '답을 찾으려 파고들던 고민을\nAI는 건너뛰게 합니다.\n치열한 고뇌가 사라지는 것,\n그게 가장 아쉬워요.',
    pose: '30.png', pos: 'bl', flip: true,
  },
  {
    type: 'outro',
    badge: 'AI를 쓰되 잃지 말 것',
    title: '인간적인 건 *지키며*\nAI를 쓰자',
    cta: '편함은 취하되, 고뇌는 남겨두기.',
    pose: '35.png', pos: 'br', flip: false,
  },
];
