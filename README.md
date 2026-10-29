# 주환석 · 김솔 모바일 청첩장

2027년 1월 9일 토요일 오후 1시 · 더채플앳청담 6층 채플홀.

HTML/CSS/JavaScript만 사용하는 정적 사이트입니다. 패키지 설치, 데이터베이스, 서버 API가 필요하지 않습니다. GitHub Pages와 Vercel에 배포할 수 있도록 구성했습니다. BGM과 방명록은 포함하지 않습니다.

## 로컬에서 보기

Node.js 20 이상에서 이 폴더를 열고 실행합니다.

```sh
npm start
```

브라우저에서 http://127.0.0.1:4173 을 엽니다. 종료는 Ctrl+C입니다. 기본 포트가 사용 중이면 `PORT=4174 npm start`로 바꿀 수 있습니다.

## 내용 수정

- `dist/config.js`: 이름, 날짜, 초대글, 부모님 성함, 연락처, 사진, 계좌, 교통 안내.
- `dist/styles.css`: 색상, 글꼴, 크기, 간격.
- `dist/index.html`: 섹션 구조.
- `dist/motion.js`: 스크롤 등장 효과. 아래에서 부드럽게 나타나며 사진첩은 열마다 시차를 둡니다. 한 번 본 내용은 유지하며, 동작 줄이기 설정에서는 즉시 표시합니다.
- `dist/assets/`: 사진과 아이콘.
- `DESIGN.md`: Claude의 색감·타이포그래피와 Airbnb의 사진·버튼 규칙을 청첩장에 맞게 조정한 디자인 기준.

화면 순서는 표지 → 초대글 → 예식 달력 → 갤러리 → 오시는 길 → 계좌 → 공유입니다. 표지의 이름은 가로로, 날짜·시간·장소는 세로로 배치합니다. 별도의 예식장 소개 영역은 없습니다. 초대글에는 전달받은 정현종의 「방문객」 발췌문을 넣었으며, `invitationSource`에서 작은 출처 문구를 관리합니다.

현재 표지와 공유 사진은 이전에 만든 웹용 복사본 `assets/couple-cover.jpg`입니다. 새 사진을 등록하기 전까지 유지합니다. 사진은 첫 화면 전체를 채우며, 어두운 그라데이션이나 밝기 필터를 적용하지 않습니다. 이름은 사진 하단에 가로로 배치하고, 스크롤 안내는 사진 맨 아래에 유지합니다. 날짜·시간·장소·오시는 길 버튼은 사진 아래 아이보리 배경에 표시합니다. 글씨는 짙은 갈색, 버튼은 얇은 테두리로 처리합니다.

첫 화면은 휴대폰의 보이는 높이(`100svh`)에 맞추며, 사진은 `object-fit: cover`로 가장자리 일부를 잘라 빈틈없이 채웁니다. `cover.position`에서 사진 기준 위치를 조정할 수 있습니다. 사진 영역의 최소 높이는 480px로, 이보다 짧은 가로 화면에서는 스크롤하여 전체를 확인합니다. 사진을 교체할 때는 `cover.src`와 `shareImage`를 함께 변경하세요. 갤러리는 3열로 처음 9장을 보여주고, 사진을 누르면 확대창에서 전체 사진을 이전·다음 버튼으로 볼 수 있습니다. 사진이 없으면 9칸의 임시 타일만 표시합니다. 갤러리 설명 문구와 더 보기 버튼은 없습니다. 연락처·초대글 하단 부모님 성함·별도 안내는 입력한 항목만 표시합니다.

사진 파일은 아래 폴더에 원본 그대로 복사합니다. 파일명은 유지해도 됩니다.

- 메인 사진: `dist/assets/main/`
- 갤러리 사진: `dist/assets/gallery/`

파일을 넣은 뒤 `dist/config.js`에 경로를 등록해야 화면에 표시됩니다. 갤러리 순서는 파일명이 아닌 `gallery` 배열에 적은 순서입니다. `cover.src`와 `shareImage`에는 같은 메인 사진 경로를 지정합니다. 아래 파일명은 예시입니다.

```js
cover: { src: "assets/main/cover.jpg", alt: "주환석과 김솔의 웨딩 사진", position: "center" },
shareImage: "assets/main/cover.jpg",
gallery: [
  { src: "assets/gallery/01.jpg", alt: "함께한 봄날" },
  { src: "assets/gallery/02.jpg", alt: "웨딩 촬영" }
],
```

새 사진은 사용자 요청에 따라 압축·리사이즈·재인코딩하지 않습니다. 배포 과정도 사진을 변환하지 않고 파일 그대로 제공합니다. 화면에서 표지는 `cover`, 갤러리 썸네일은 정사각형으로 일부 잘려 보이지만 원본 파일은 변경하지 않습니다. 확대창에서는 사진 전체를 보여줍니다. 사진 경로는 `assets/...`처럼 상대 경로를 사용합니다. 설정 파일에 입력한 전화번호·계좌번호는 공개 페이지의 일부입니다.

계좌 영역의 `people`은 항상 보이며, `parents`는 ‘부모님 계좌’ 펼치기 안에 표시합니다. 현재는 요청에 따라 양가 모두 임시 데이터를 사용했습니다. 실제 예금주·은행·계좌번호를 입력한 뒤 각 항목의 `placeholder: true`를 `false`로 바꾸면 복사 버튼이 활성화됩니다. 임시 계좌는 화면에 표시되지만 복사되지 않습니다.

오시는 길은 카카오맵 ‘약도 만들기 → 일반지도’에서 생성한 실제 지도를 사용합니다. `＋`·`−` 버튼으로 확대·축소하고, 지도를 드래그해 이동하거나 초기화 버튼으로 예식장 중심에 돌아올 수 있습니다. 별도 개발자 API 키나 도메인 등록 없이 로컬 파일·로컬 서버·GitHub Pages에서 사용합니다. 지도 표시에는 인터넷 연결이 필요합니다.

퍼가기 코드는 `dist/kakao-map.html`에 있으며 청첩장 CSS가 지도 버튼에 영향을 주지 않도록 iframe으로 분리했습니다. 코드의 `key`는 공개 약도 식별자입니다. 장소·기본 범위를 바꾸려면 카카오맵 약도 만들기에서 새 코드를 생성하고 `timestamp`와 `key`를 함께 교체하세요. 주소/전화번호·지하철·정류장·버스·메모 노출을 끈 상태로 생성했습니다. 카카오 출처와 기본 하단 링크는 유지합니다. 지도를 불러오지 못하면 카카오맵 바로가기를 표시합니다.

아래 네이버지도·카카오맵·티맵 버튼과 별도의 교통 안내를 유지합니다. 네이버지도는 `venue.naverPlaceId`에 지정한 장소를 엽니다. 지도 전체를 누르면 네이버지도로 이동하던 동작은 제거했습니다. 지도 확대·축소는 버튼 기준으로 안내하며, 두 손가락 확대는 브라우저 테스트에서 확인되지 않았습니다.

지하철·자가용/주차·셔틀·ATM 안내는 `venue.transport`에서 관리합니다. 셔틀은 공개 안내의 강남구청역 3번 출구, 약 10~15분 간격을 반영했습니다. ATM은 2026년 방문 후기 두 곳에서 확인한 건물 4층으로 안내합니다. 예식장 공식 확인 자료는 아니므로 예식일 운영 조건과 함께 배포 전에 확인해 조정하세요. 무료 주차 시간은 확정되지 않아 넣지 않았습니다. 예식장 전화번호는 표시하지 않습니다. 공유 설명은 이름·날짜·장소에서 자동 생성됩니다.

## Vercel 배포

Vercel 프로젝트는 `hwandol/solnlouis-wedding`이며, 청첩장 공유 주소는 https://solnlouis-wedding.vercel.app/ 입니다. 무료 Hobby 플랜을 사용하며, GitHub 저장소 `louisJu/louisnsol-wedding-invitation`과 연결되어 있습니다.

1. Vercel에서 기존 GitHub 저장소 `louisJu/louisnsol-wedding-invitation`을 연결합니다.
2. 프로젝트 이름을 `solnlouis-wedding`, 배포 브랜치를 `main`, Root Directory를 저장소 최상위(`./`)로 설정합니다.
3. `vercel.json`에 정의한 설정으로 배포합니다. Framework Preset은 **Other**, Output Directory는 **dist**이며 패키지 설치는 생략합니다. 빌드 단계에서 설정을 검증하고 공유 미리보기 정보를 생성합니다.
4. `dist/config.js`의 `siteUrl`에는 위 Vercel 공개 주소를 설정했습니다. 주소를 변경하면 이 값도 수정하고 `npm run prepare:pages`를 실행합니다.
5. `main`에 push할 때마다 Vercel에 자동 배포됩니다. 결과는 [Vercel 프로젝트의 Deployments](https://vercel.com/hwandol/solnlouis-wedding/deployments)에서 확인합니다. 실패한 배포가 있으면 마지막으로 성공한 청첩장을 계속 제공합니다.

`.vercel/`은 이 컴퓨터의 프로젝트 연결 정보이므로 Git에서 제외합니다. `.vercelignore`로 로컬 시안과 환경 파일을 CLI 업로드에서도 제외합니다. `prepare:pages` 명령은 두 호스팅 환경에서 공유 미리보기 메타데이터를 생성하는 용도로 사용합니다.

## GitHub Pages 배포

이 프로젝트의 저장소는 https://github.com/louisJu/louisnsol-wedding-invitation 이며, 청첩장 주소는 https://louisju.github.io/louisnsol-wedding-invitation/ 입니다. 공개 저장소의 `main` 브랜치에서 자동 배포합니다.

1. GitHub 저장소를 만들고 **이 wedding-invitation 폴더의 내용**을 저장소 최상위에 올립니다.
2. 저장소의 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 설정합니다.
3. `main` 브랜치에 push하면 `.github/workflows/pages.yml`이 내용을 확인하고 `dist/`를 배포합니다. 첫 실행은 Actions에서 직접 실행해도 됩니다.
4. 완료 후 Pages에 표시되는 주소로 확인합니다. 프로젝트 저장소는 일반적으로 `https://사용자명.github.io/저장소명/` 형태입니다.
5. 이후 `config.js`나 사진을 수정하고 commit/push하면 같은 주소에 반영됩니다. 이전 버전 복원은 해당 커밋을 revert하면 됩니다.

이 컴퓨터에서 수정한 내용을 반영하려면 프로젝트 폴더에서 실행합니다.

```sh
npm run check
git add dist README.md DESIGN.md
git commit -m "Update wedding invitation"
git push origin main
```

검증에 실패하면 수정 후 다시 실행하세요. 배포 결과는 저장소의 **Actions → Deploy wedding invitation**에서 확인합니다. `.github/workflows/`나 `scripts/`를 수정했다면 해당 파일도 함께 커밋하세요. `.preview/`의 비교 시안과 로컬 검증 화면은 업로드하지 않습니다.

배포 전 로컬 확인:

```sh
npm run check
npm run prepare:pages
```

카카오톡에 링크를 붙여넣었을 때 표시되는 제목·설명·사진은 배포 단계에서 정적 HTML의 Open Graph 태그로 설정합니다. `config.siteUrl`에는 Vercel 공개 청첩장 주소를 설정했습니다. 주소가 바뀌면 함께 수정하세요. 전용 카카오 SDK 버튼 대신 휴대폰의 기본 공유 메뉴를 사용합니다. 공유 API를 지원하지 않는 환경에서는 주소 복사로 전환됩니다.

GitHub Pages는 정적 호스팅이므로 공유 방명록을 저장하려면 별도 백엔드/댓글 서비스를 연결해야 합니다. 이 프로젝트에는 이를 연결하지 않았습니다.

## 확인 범위

정적 설정 검증은 `npm run check`로 실행합니다. 달력과 카운트다운은 방문자의 시간대에 관계없이 한국 예식일을 기준으로 계산합니다. 갤러리 확대창·연락처창은 키보드와 Escape를 지원하며, 화면 동작 줄이기 설정을 존중합니다. 실제 전화/문자 발신, 내비 앱 실행, 카카오톡 미리보기는 실제 휴대폰과 배포 주소에서 최종 확인하세요.

## 자료 출처

- 디자인 참고: https://toourguest.com/cards/mwny
- 갤러리·계좌 구성 참고: https://miseo-yoonjong-wedding.vercel.app/
- 표지·공유 사진: 사용자가 제공한 ‘그레인 적당.png’. 원본은 수정하지 않고 1472 × 2000 JPEG로 최적화한 복사본을 사용합니다.
- 약도: 카카오맵 더채플앳 청담 ‘약도 만들기 → 일반지도’, https://place.map.kakao.com/roughmap/placeRoughMap.daum?confirmid=23182563 (2026-10-25 생성).
- 위치 및 교통 검토: https://thechapel.co.kr/home/index 및 기존 청첩장 참고 자료.
- 셔틀·교통 안내: https://app.wisewedding.co.kr/weddinghall/weddinghall_share.asp?code=851
- ATM 층수: [웨딩북 방문 후기](https://www.weddingbook.com/review/811?reviewType=BLOG_REVIEW), [2026년 6월 24일 방문 후기](https://subinc206.tistory.com/entry/결혼준비-4-메종드아나하-계약금까지-포기하고-더채플앳청담을-선택한-이유-하객-후기) (2026-10-25 확인).
- 초대글: 사용자가 제공한 정현종, 「방문객」, 시집 『광휘의 속삭임』 발췌문.
- GitHub Pages 설정: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

기존 채플홀 참고 사진은 `assets/`에 남아 있지만 현재 화면과 공유 사진에는 사용하지 않습니다.
