# 주환석 · 김솔 모바일 청첩장

2027년 1월 9일 토요일 오후 1시 · 더채플앳청담 6층 채플홀.

HTML/CSS/JavaScript만 사용하는 정적 사이트입니다. 패키지 설치, 데이터베이스, 서버 API가 필요하지 않습니다. GitHub Pages와 Vercel에 배포할 수 있도록 구성했습니다. BGM과 방명록은 포함하지 않습니다.

## 로컬에서 보기

Node.js 20 이상에서 이 폴더를 열고 실행합니다. iCloud 동기화 폴더의 파일 읽기가 지연되는 경우, 다운로드가 끝난 파일로 iCloud 밖의 로컬 폴더에서 작업합니다.

```sh
npm start
```

브라우저에서 http://127.0.0.1:4173 을 엽니다. 종료는 Ctrl+C입니다. 기본 포트가 사용 중이면 `PORT=4174 npm start`로 바꿀 수 있습니다.

## 내용 수정

- `dist/config.js`: 이름, 날짜, 초대글, 부모님 성함, 연락처, 사진, 계좌, 교통 안내.
- `dist/styles.css`: 색상, 글꼴, 크기, 간격.
- `dist/index.html`: 섹션 구조.
- `dist/motion.js`: 스크롤 등장 효과. 화면 안쪽에 들어오면 48px 아래에서 1.1초 동안 올라오며 나타납니다. 사진첩은 60px 이동과 94% → 100% 확대, 열마다 160ms·행마다 80ms 시차를 적용합니다. 한 번 본 내용은 유지하며, 동작 줄이기 설정에서는 즉시 표시합니다.
- `dist/assets/`: 사진과 아이콘.
- `dist/assets/fonts/`: 이전 손글씨 시안의 나눔손글씨 붓체와 OFL 라이선스를 보관합니다. 현재 표지는 샘플처럼 고운돋움을 사용하므로 손글씨 폰트를 요청하지 않습니다.
- `dist/paper-fonts.css`와 `dist/assets/fonts/paper/`: 고운바탕·고운돋움의 공식 WOFF2 조각(총 약 380KB)과 라이선스. 현재 콘텐츠에 필요한 범위를 로컬에서 선택했으며, 브라우저는 사용한 문자에 필요한 조각만 읽습니다. 이름이나 문구를 바꿀 때 범위를 확인합니다.
- `DESIGN.md`: Claude의 색감·타이포그래피와 Airbnb의 사진·버튼 규칙을 청첩장에 맞게 조정한 디자인 기준.

화면 순서는 표지 → 초대글 → 예식 달력 → 갤러리 → 오시는 길 → 계좌 → 화환 안내 → 공유입니다. 표지는 사진, 사진 아래 이름·문구, 한 줄의 날짜·시간, 장소 순서입니다. 별도의 예식장 소개 영역은 없습니다. 초대글에는 전달받은 정현종의 「방문객」 발췌문을 넣었으며, `invitationSource`에서 작은 출처 문구를 관리합니다.

표지와 공유 사진은 `assets/main/03_LYH00763_선수정-1.jpg`에서 생성하며, 갤러리는 총 11장으로, 메인 사진을 2번째에, `02_LYH00666` 사진을 6번째에, `assets/gallery/LYH03499_수정_솔_1.jpg`를 7번째에 등록했습니다. 나머지 사진의 상대 순서는 유지하며, 실제 표시 순서는 `config.js`의 `gallery` 배열을 따릅니다. 2번째 확대 사진은 메인의 웹용 파일을 재사용하고 썸네일만 별도로 생성합니다. 화면에는 `assets/optimized/`의 웹용 이미지를 사용하고 고해상도 JPEG는 원본 폴더에 보관합니다. 원본 파일명은 제공받은 형태를 유지하고, 한글 경로는 Git과 같은 NFC 형식으로 설정합니다. 사진 상단은 글자 없이 보여 주고, 하단에는 백색 종이로 이어지는 옅은 안개 효과를 CSS로 적용합니다. 섹션 제목과 달력의 일요일·예식일 표시는 참고 샘플의 장밋빛(#B27085)을 사용합니다. 이름과 메인 안내·본문은 고운돋움으로 표시하고, 하단 기존 서명은 고운바탕을 유지합니다. 오시는 길 버튼은 얇은 밑줄로 처리합니다. 배경 질감은 직접 만든 `assets/paper-grain.svg`를 사용하며, 기존 콘텐츠와 섹션 순서를 유지합니다. “주환석 & 김솔” 아래 “저희 결혼합니다.”, 기호 ⊹, 날짜·시간, 더채플앳청담, 오시는 길 링크가 이어집니다. 초대글은 INVITATION 제목과 시·출처 뒤에 양가 부모님 성함과 아들·딸 소개를 표시합니다. 연락하기 버튼은 없습니다. 첫 화면에서 이름이 1.6초 동안 왼쪽에서 오른쪽으로 쓰이듯 나타난 뒤 문구가 1.5초 동안 이어집니다. 작은 화면에서는 이름이 보일 때 시작합니다. 페이지를 읽는 동안 한 번만 재생하며, 동작 줄이기 설정과 글꼴 로딩 실패 시에는 즉시 표시합니다.

표지 사진은 2:3 비율로 너비를 채워 아래 이름으로 이어집니다. `object-fit: cover`로 채우며, `cover.position`에서 사진 기준 위치를 조정할 수 있습니다. 짧은 화면에서는 스크롤하여 전체를 확인합니다. 사진을 교체할 때는 `cover.originalSrc`를 변경하고 아래 이미지 생성 명령을 실행하세요. `cover.src`와 `shareImage`는 생성 파일 경로입니다. 갤러리는 3열로 처음 9장을 보여주고, 10장 이상이면 ‘사진 더보기’로 나머지를 모두 펼치거나 ‘사진 접기’로 다시 9장만 볼 수 있습니다. 9장 이하에서는 버튼을 숨깁니다. 사진을 누르면 확대창에서 전체 사진을 이전·다음 버튼으로 볼 수 있습니다. 사진이 없으면 9칸의 임시 타일만 표시합니다. 갤러리 설명 문구는 없습니다. 초대글 하단 부모님 성함·별도 안내는 입력한 항목만 표시합니다. 연락하기 UI는 사용하지 않습니다.

사진 파일은 아래 폴더에 원본 그대로 복사합니다. 파일명은 유지해도 됩니다.

- 메인 사진: `dist/assets/main/`
- 갤러리 사진: `dist/assets/gallery/`

웹용 파일은 `dist/assets/optimized/`에 보관하며 파일명으로 용도를 구분합니다. 원본 JPEG의 파일명은 변경하지 않습니다. 갤러리 번호는 화면 표시 순서입니다.

| 파일명 | 용도 |
| --- | --- |
| `main-web.webp` | 첫 화면 메인 사진 · 갤러리 2번째 확대 사진 |
| `main-share.png` | 링크 공유 미리보기 |
| `gallery-01-web.webp` ~ `gallery-11-web.webp` | 갤러리 확대 사진 (2번째는 `main-web.webp` 재사용) |
| `gallery-01-thumb.webp` ~ `gallery-11-thumb.webp` | 갤러리 목록 썸네일 |

파일을 넣은 뒤 `dist/config.js`의 `originalSrc`에 원본 경로를 등록합니다. 갤러리 순서는 `gallery` 배열의 순서입니다. 이후 사진을 추가할 때도 배열에 항목을 추가하고 이미지 생성 명령을 실행하면 되며, 10번째 사진부터 더보기 안에 자동으로 표시됩니다.

```js
cover: {
  src: "assets/optimized/main-web.webp",
  originalSrc: "assets/main/cover.jpg",
  width: 1200, height: 1800,
  alt: "주환석과 김솔의 웨딩 사진", position: "center"
},
shareImage: "assets/optimized/main-share.png",
gallery: [
  {
    src: "assets/optimized/gallery/gallery-01-web.webp",
    thumbnailSrc: "assets/optimized/gallery/gallery-01-thumb.webp",
    originalSrc: "assets/gallery/01.jpg",
    alt: "함께한 봄날"
  }
],
```

### 이미지 최적화

웹용 이미지는 표지·확대 사진의 긴 변을 최대 1800px, 썸네일을 최대 720px로 줄이고 WebP **무손실 모드**로 저장합니다. 비율과 색상 프로필(ICC)을 유지하며 회전 정보를 반영합니다. 리사이즈 자체는 원본의 픽셀 수를 줄이는 작업이고, 이후 WebP 인코딩에는 추가 손실이 없습니다. 스크립트가 리사이즈 직후 이미지와 WebP를 디코딩한 픽셀 해시를 비교합니다. 썸네일도 전체 구도를 보관하고 정사각형 크롭은 CSS로만 적용합니다.

갤러리 목록은 `thumbnailSrc`를 지연 로딩하고, 10번째 이후 썸네일은 더보기를 처음 누를 때 이미지 주소를 설정합니다. 사진을 눌렀을 때 `src`의 확대용 WebP를 불러옵니다. `thumbnailSrc`가 없는 기존 JPG/PNG/WebP 설정은 `src`를 그대로 사용합니다. 공유용 사진은 같은 원본에서 최대 600 × 900px의 PNG로 생성합니다. 브라우저와 로컬 서버에서 WebP를 표시할 수 있습니다.

이미지 생성 도구는 사진을 바꿀 때 로컬에서만 필요합니다. macOS에서는 다음과 같이 설치합니다.

```sh
brew install imagemagick webp jpeg-turbo
npm run images:optimize
npm run prepare:pages
npm run check
```

`magick`, `cwebp`, `jpegtran` 실행 파일이 PATH에 있어야 합니다. `cover.width`·`cover.height`는 생성된 표지의 실제 크기와 맞춥니다. `prepare:pages`는 정적 HTML의 표지와 공유 경로도 설정과 동기화하므로 첫 요청에서 큰 원본을 다운로드하지 않습니다. 생성된 `dist/assets/optimized/`도 함께 커밋합니다. 배포 과정에서는 이미지를 다시 변환하지 않습니다.

JPEG 원본도 해상도·픽셀·메타데이터를 유지하며 무손실 최적화할 수 있습니다.

```sh
npm run images:lossless
```

이 명령은 `jpegtran -copy all -optimize`로 압축 테이블을 최적화합니다. 픽셀 해시가 일치하고 파일이 작아진 경우에만 교체하며, 최초 입력 파일의 바이트 단위 백업은 Git에서 제외되는 `.preview/originals/`에 보관합니다. 원본은 이미 JPEG로 압축되어 있어 감소 폭이 작을 수 있습니다. 화면 로딩 개선은 원본 최적화보다 작은 WebP와 썸네일 분리에서 주로 얻습니다.

사진 경로는 `assets/...`처럼 상대 경로를 사용합니다. 설정 파일에 입력한 전화번호·계좌번호는 공개 페이지의 일부입니다.

계좌 영역은 ACCOUNT 소제목 아래 신랑측·신부측이 각각 접힌 상태로 시작합니다. 각 그룹을 펼치면 `people`과 `parents`의 세 계좌를 함께 표시하며, 이름 또는 계좌 행을 누르면 번호를 복사합니다. 기존에 입력한 양가 여섯 분의 예금주와 실제 계좌 정보를 유지합니다. 추후 임시 계좌를 넣을 때는 `placeholder: true`로 설정하면 화면에는 표시되지만 복사되지 않습니다.

계좌 아래 화환 안내는 `noticeTitle`과 `notice`로 관리하며 `notice`가 비어 있으면 영역 전체를 숨깁니다. NOTICE 제목 아래 양해 문구를 표시한 뒤 기존 감사 인사와 서명으로 마무리합니다.

오시는 길은 카카오맵 ‘약도 만들기 → 일반지도’에서 생성한 실제 지도를 사용합니다. 지도는 240px 높이(출처 포함 274px)의 고정 미리보기이며, 지도 위에서 스크롤하거나 손가락으로 쓸어도 청첩장 페이지가 이동합니다. 지도 내부의 확대·축소·드래그와 키보드 진입은 막았습니다. 별도 개발자 API 키나 도메인 등록 없이 로컬 파일·로컬 서버·GitHub Pages에서 사용합니다. 지도 표시에는 인터넷 연결이 필요합니다.

퍼가기 코드는 `dist/kakao-map.html`에 있으며 청첩장 CSS가 지도 버튼에 영향을 주지 않도록 iframe으로 분리했습니다. 코드의 `key`는 공개 약도 식별자입니다. 장소·기본 범위를 바꾸려면 카카오맵 약도 만들기에서 새 코드를 생성하고 `timestamp`와 `key`를 함께 교체하세요. 주소/전화번호·지하철·정류장·버스·메모 노출을 끈 상태로 생성했습니다. 카카오 출처를 유지하고 내부 조작 버튼은 숨깁니다. 지도 로딩 실패 시 안내 문구를 표시하며 아래 지도 앱 버튼은 계속 이용할 수 있습니다.

아래 네이버지도·카카오맵·티맵 버튼과 별도의 교통 안내를 유지합니다. 네이버지도는 `venue.naverPlaceId`에 지정한 장소를 엽니다. 지도 전체를 누르면 네이버지도로 이동하던 동작은 제거했습니다. 위치 상세 확인과 확대·축소는 아래 지도 앱 버튼으로 이동한 뒤 이용합니다.

버스·지하철·자가용/주차·셔틀·ATM 안내는 `venue.transport`에서 관리합니다. 버스 정류장과 도보 설명은 [사용자 제공 샘플](https://w.theirmood.com/card/RkM6W1shpT)의 영동고등학교·현대아파트 하차, 학동사거리 방향 120m 안내를 반영했습니다. 지하철 노선색·셔틀 이모지·지도 앱 아이콘을 표시합니다. 셔틀은 공개 안내의 강남구청역 3번 출구, 약 10~15분 간격을 반영했습니다. ATM은 2026년 방문 후기 두 곳에서 확인한 건물 4층으로 안내합니다. 예식장 공식 확인 자료는 아니므로 예식일 운영 조건과 함께 배포 전에 확인해 조정하세요. 무료 주차 시간은 확정되지 않아 넣지 않았습니다. 예식장 전화번호는 표시하지 않습니다. 공유 설명은 이름·날짜·장소에서 자동 생성됩니다.

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

정적 설정 검증은 `npm run check`로 실행합니다. 달력과 카운트다운은 방문자의 시간대에 관계없이 한국 예식일을 기준으로 계산합니다. 갤러리 확대창은 키보드와 Escape를 지원하며, 화면 동작 줄이기 설정을 존중합니다. 내비 앱 실행, 카카오톡 미리보기는 실제 휴대폰과 배포 주소에서 최종 확인하세요.

## 자료 출처

- 디자인 참고: https://toourguest.com/cards/mwny
- 갤러리·계좌 구성 참고: https://miseo-yoonjong-wedding.vercel.app/
- 표지·공유 사진: 사용자 제공 `03_LYH00763_선수정-1.jpg` 원본, 3736 × 5604. 갤러리도 제공받은 원본 9장에서 웹용 WebP와 썸네일을 생성합니다.
- 약도: 카카오맵 더채플앳 청담 ‘약도 만들기 → 일반지도’, https://place.map.kakao.com/roughmap/placeRoughMap.daum?confirmid=23182563 (2026-10-25 생성).
- 위치 및 교통 검토: https://thechapel.co.kr/home/index 및 기존 청첩장 참고 자료.
- 셔틀·교통 안내: https://app.wisewedding.co.kr/weddinghall/weddinghall_share.asp?code=851
- ATM 층수: [웨딩북 방문 후기](https://www.weddingbook.com/review/811?reviewType=BLOG_REVIEW), [2026년 6월 24일 방문 후기](https://subinc206.tistory.com/entry/결혼준비-4-메종드아나하-계약금까지-포기하고-더채플앳청담을-선택한-이유-하객-후기) (2026-10-25 확인).
- 초대글: 사용자가 제공한 정현종, 「방문객」, 시집 『광휘의 속삭임』 발췌문.
- GitHub Pages 설정: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

기존 채플홀 참고 사진은 `assets/`에 남아 있지만 현재 화면과 공유 사진에는 사용하지 않습니다.

안개꽃 효과는 직접 제작한 `assets/babys-breath.svg` 16개를 CSS로 천천히 이동시킵니다. 고정 레이어는 클릭을 가로채지 않으며 오른쪽 아래 꽃 버튼으로 끄거나 켤 수 있습니다. 동작 줄이기 설정·인쇄에서는 숨기고, 다른 탭에 있는 동안에는 애니메이션을 일시 정지합니다.
