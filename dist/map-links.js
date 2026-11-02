(() => {
  "use strict";
  const config = window.WEDDING_CONFIG;
  if (!config) return;
  const { latitude: lat, longitude: lng, name, naverPlaceId } = config.venue;
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
    || (/Macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
  const providers = {
    naver: {
      name: "네이버지도",
      appUrl: `nmap://place?lat=${lat}&lng=${lng}&name=${encodeURIComponent(name)}&appname=${encodeURIComponent(config.siteUrl)}`,
      webUrl: naverPlaceId ? `https://map.naver.com/p/entry/place/${encodeURIComponent(naverPlaceId)}` : `https://map.naver.com/v5/search/${encodeURIComponent(name)}`,
      packageName: "com.nhn.android.nmap"
    },
    kakao: {
      name: "카카오맵",
      appUrl: `kakaomap://look?p=${lat},${lng}`,
      webUrl: `https://map.kakao.com/link/map/${encodeURIComponent(name)},${lat},${lng}`,
      packageName: "net.daum.android.map"
    }
  };
  const link = (key) => {
    const provider = providers[key];
    if (isAndroid) {
      const [scheme, destination] = provider.appUrl.split("://");
      return `intent://${destination}#Intent;scheme=${scheme};package=${provider.packageName};S.browser_fallback_url=${encodeURIComponent(provider.webUrl)};end`;
    }
    return isIOS ? `map-launch.html?provider=${key}` : provider.webUrl;
  };
  window.WEDDING_MAPS = { providers, link, isIOS, isAndroid };
})();
