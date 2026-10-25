// 이름, 사진, 날짜, 교통 안내는 이 파일에서 관리합니다.
// 사진 경로는 dist/ 기준이며 앞에 /를 붙이지 않습니다.
// 이 파일의 내용은 배포 후 누구나 읽을 수 있습니다. 비밀키를 넣지 마세요.
window.WEDDING_CONFIG = {
  groom: { name: "주환석", father: "", mother: "", relation: "아들", phone: "" },
  bride: { name: "김솔", father: "", mother: "", relation: "딸", phone: "" },
  date: "2027-01-09T13:00:00+09:00",
  durationMinutes: 90,
  invitation: [
    "사람이 온다는 건\n실은 어마어마한 일이다.\n그는 그의 과거와 현재와\n그리고 그의 미래와 함께 오기 때문이다.\n한 사람의 일생이 오기 때문이다."
  ],
  invitationSource: "정현종, 「방문객」\n시집 『광휘의 속삭임』",
  cover: { src: "assets/couple-cover.jpg", alt: "꽃다발을 함께 든 주환석과 김솔의 웨딩 사진", position: "center 35%" },
  // 예: { src: "assets/photo-01.jpg", alt: "함께한 봄날" }
  gallery: [],
  venue: {
    name: "더채플앳청담",
    hall: "6층 채플홀",
    address: "서울 강남구 선릉로 757",
    latitude: 37.5222395047947,
    longitude: 127.039012903503,
    naverPlaceId: "34120522",
    // 공개 교통 안내 기준입니다. 배포 전 예식일의 운영 조건을 확인하세요.
    transport: [
      { title: "지하철", detail: "7호선 · 수인분당선 강남구청역\n3-1번 출구에서 도보 약 8분", note: "선릉로를 따라 학동사거리 방향으로 이동해 주세요." },
      { title: "자가용 · 주차", detail: "내비게이션에 ‘더채플앳청담’을 검색해 주세요.\n서울 강남구 선릉로 757", note: "내부 주차장이 만차일 경우, 현장 직원의 안내에 따라 외부 주차장을 이용해 주세요." },
      { title: "셔틀버스", detail: "강남구청역 3번 출구 앞\n웨딩홀 셔틀버스를 이용하실 수 있습니다.", note: "운행 간격은 약 10~15분입니다." },
      { title: "ATM 안내", detail: "현금인출기(ATM)는 건물 4층에 있습니다." }
    ]
  },
  // people은 기본 표시, parents는 부모님 계좌 펼치기 안에 표시합니다.
  // 실제 계좌 입력 후 해당 항목의 placeholder를 false로 바꾸면 복사 버튼이 활성화됩니다.
  accounts: [
    {
      title: "신랑측",
      people: [{ name: "주환석", bank: "○○은행", number: "000-0000-0000", placeholder: true }],
      parents: [
        { name: "신랑 아버지", bank: "○○은행", number: "000-0000-0000", placeholder: true },
        { name: "신랑 어머니", bank: "○○은행", number: "000-0000-0000", placeholder: true }
      ]
    },
    {
      title: "신부측",
      people: [{ name: "김솔", bank: "○○은행", number: "000-0000-0000", placeholder: true }],
      parents: [
        { name: "신부 아버지", bank: "○○은행", number: "000-0000-0000", placeholder: true },
        { name: "신부 어머니", bank: "○○은행", number: "000-0000-0000", placeholder: true }
      ]
    }
  ],
  // 별도 안내가 필요하면 문구를 입력하세요. 빈 문자열이면 영역을 숨깁니다.
  notice: "",
  // 청첩장 공유에 사용하는 공개 주소입니다.
  siteUrl: "https://louisju.github.io/louisnsol-wedding-invitation/",
  // 카카오톡 등에서 사용하는 공유 이미지. 표지 교체 시 함께 바꾸세요.
  shareImage: "assets/couple-cover.jpg",
  // 비우면 이름·날짜·장소에서 자동 생성합니다.
  shareDescription: ""
};
