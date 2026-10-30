// 이름, 사진, 날짜, 교통 안내는 이 파일에서 관리합니다.
// 사진 경로는 dist/ 기준이며 앞에 /를 붙이지 않습니다.
// 이 파일의 내용은 배포 후 누구나 읽을 수 있습니다. 비밀키를 넣지 마세요.
window.WEDDING_CONFIG = {
  groom: { name: "주환석", givenName: "환석", father: "주규천", mother: "김혜숙", relation: "아들", phone: "" },
  bride: { name: "김솔", givenName: "솔", father: "김천석", mother: "이금주", relation: "딸", phone: "" },
  date: "2027-01-09T13:00:00+09:00",
  durationMinutes: 90,
  invitation: [
    "사람이 온다는 건\n실은 어마어마한 일이다.\n그는 그의 과거와 현재와\n그리고 그의 미래와 함께 오기 때문이다.\n한 사람의 일생이 오기 때문이다."
  ],
  invitationSource: "정현종, 「방문객」\n시집 『광휘의 속삭임』",
  cover: {"src": "assets/optimized/cover.webp", "originalSrc": "assets/main/03_LYH00763_선수정-1.jpg", "width": 1200, "height": 1800, "alt": "초록 나무와 흰 담장 앞에 나란히 선 주환석과 김솔의 웨딩 사진", "position": "center"},
  // 새 메인 사진은 assets/main/, 갤러리 사진은 assets/gallery/에 원본 그대로 보관합니다.
  // originalSrc는 원본, src는 확대용 WebP, thumbnailSrc는 목록용 WebP입니다.
  // 사진 교체 후 npm run images:optimize && npm run prepare:pages를 실행합니다.
  // thumbnailSrc가 없으면 기존처럼 src를 목록에서도 사용합니다.
  gallery: [
    {"src": "assets/optimized/gallery/01.webp", "thumbnailSrc": "assets/optimized/gallery/01-thumb.webp", "originalSrc": "assets/gallery/01_LYH00441_기본액자_선수정-1.jpg", "alt": "주환석과 김솔의 웨딩 사진 1"},
    {"src": "assets/optimized/gallery/02.webp", "thumbnailSrc": "assets/optimized/gallery/02-thumb.webp", "originalSrc": "assets/gallery/02_LYH00666_bw_선수정-1(흑백).jpg", "alt": "주환석과 김솔의 웨딩 사진 2"},
    {"src": "assets/optimized/gallery/03.webp", "thumbnailSrc": "assets/optimized/gallery/03-thumb.webp", "originalSrc": "assets/gallery/04_LYH00960_선수정-1.jpg", "alt": "주환석과 김솔의 웨딩 사진 3"},
    {"src": "assets/optimized/gallery/04.webp", "thumbnailSrc": "assets/optimized/gallery/04-thumb.webp", "originalSrc": "assets/gallery/05_LYH03216_bw_선수정-1(흑백).jpg", "alt": "주환석과 김솔의 웨딩 사진 4"},
    {"src": "assets/optimized/gallery/05.webp", "thumbnailSrc": "assets/optimized/gallery/05-thumb.webp", "originalSrc": "assets/gallery/06_LYH03261_bw_선수정-1.jpg", "alt": "주환석과 김솔의 웨딩 사진 5"},
    {"src": "assets/optimized/gallery/06.webp", "thumbnailSrc": "assets/optimized/gallery/06-thumb.webp", "originalSrc": "assets/gallery/07_LYH03513_bw_선수정-1.jpg", "alt": "주환석과 김솔의 웨딩 사진 6"},
    {"src": "assets/optimized/gallery/07.webp", "thumbnailSrc": "assets/optimized/gallery/07-thumb.webp", "originalSrc": "assets/gallery/08_LYH03817_선수정-1.jpg", "alt": "주환석과 김솔의 웨딩 사진 7"},
    {"src": "assets/optimized/gallery/08.webp", "thumbnailSrc": "assets/optimized/gallery/08-thumb.webp", "originalSrc": "assets/gallery/09_LYH03874_bw_선수정-1.jpg", "alt": "주환석과 김솔의 웨딩 사진 8"},
    {"src": "assets/optimized/gallery/09.webp", "thumbnailSrc": "assets/optimized/gallery/09-thumb.webp", "originalSrc": "assets/gallery/10_LYH00366_선수정-1.jpg", "alt": "주환석과 김솔의 웨딩 사진 9"}
  ],
  venue: {
    name: "더채플앳청담",
    hall: "6층 채플홀",
    address: "서울 강남구 선릉로 757",
    latitude: 37.5222395047947,
    longitude: 127.039012903503,
    naverPlaceId: "34120522",
    // 공개 교통 안내 기준입니다. 배포 전 예식일의 운영 조건을 확인하세요.
    transport: [
      // 버스 하차 지점·도보 안내는 사용자 제공 더무드 샘플 기준입니다.
      { title: "버스 이용 시", detail: "영동고등학교·현대아파트 정류장 하차", note: "학동사거리 방향으로 약 120m 직진\n도보 약 1분 거리입니다." },
      { title: "지하철", lines: [{ name: "7호선", color: "#747f00" }, { name: "수인분당선", color: "#d5a700" }], detail: "강남구청역 3-1번 출구에서 도보 약 8분", note: "선릉로를 따라 학동사거리 방향으로 이동해 주세요." },
      { title: "자가용 · 주차", detail: "내비게이션에 ‘더채플앳청담’을 검색해 주세요.\n서울 강남구 선릉로 757", note: "내부 주차장이 만차일 경우, 현장 직원의 안내에 따라 외부 주차장을 이용해 주세요." },
      { title: "셔틀버스", icon: "🚌", detail: "강남구청역 3번 출구 앞\n웨딩홀 셔틀버스를 이용하실 수 있습니다.", note: "운행 간격은 약 10~15분입니다." },
      { title: "ATM 안내", detail: "현금인출기(ATM)는 건물 4층에 있습니다." }
    ]
  },
  // 신랑측·신부측 그룹을 펼치면 people과 parents를 함께 표시합니다.
  // relation은 예금주 이름 뒤에 작은 괄호로 표시합니다.
  // 실제 계좌 입력 후 해당 항목의 placeholder를 false로 바꾸면 복사 버튼이 활성화됩니다.
  accounts: [
    {
      title: "신랑측",
      people: [{ name: "주환석", bank: "신한은행", number: "110-334-887285", placeholder: false }],
      parents: [
        { name: "주규천", relation: "아버지", bank: "하나은행", number: "562-810163-14107", placeholder: false },
        { name: "김혜숙", relation: "어머니", bank: "국민은행", number: "821-21-0429-197", placeholder: false }
      ]
    },
    {
      title: "신부측",
      people: [{ name: "김솔", bank: "국민은행", number: "640602-04-032290", placeholder: false }],
      parents: [
        { name: "김천석", relation: "아버지", bank: "농협", number: "626-12-027500", placeholder: false },
        { name: "이금주", relation: "어머니", bank: "국민은행", number: "567001-04-217146", placeholder: false }
      ]
    }
  ],
  // 안내 본문을 비우면 NOTICE 영역 전체를 숨깁니다.
  noticeTitle: "화환은 정중히 사양합니다.",
  notice: "축하의 마음만 감사히 받겠습니다.\n너른 양해 부탁드립니다.",
  // 청첩장 공유에 사용하는 공개 주소입니다.
  siteUrl: "https://solnlouis-wedding.vercel.app/",
  // 카카오톡 등에서 사용하는 공유 이미지. 표지 교체 시 함께 바꾸세요.
  shareImage: "assets/optimized/share.png",
  // 비우면 이름·날짜·장소에서 자동 생성합니다.
  shareDescription: ""
};
