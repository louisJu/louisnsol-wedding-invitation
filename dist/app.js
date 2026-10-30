(() => {
  "use strict";
  const config = window.WEDDING_CONFIG;
  if (!config) return;
  const $ = (id) => document.getElementById(id);
  const fill = (selector, value) => document.querySelectorAll(selector).forEach((el) => { el.textContent = value; });
  const element = (tag, text, className) => {
    const el = document.createElement(tag);
    if (text !== undefined) el.textContent = text;
    if (className) el.className = className;
    return el;
  };
  const wedding = new Date(config.date);
  const seoulDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" });
  const dateParts = Object.fromEntries(seoulDate.formatToParts(wedding).map((p) => [p.type, p.value]));
  const year = Number(dateParts.year), month = Number(dateParts.month), day = Number(dateParts.day);
  const dateText = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "long", day: "numeric", weekday: "long" }).format(wedding);
  const clockParts = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Seoul", hour: "numeric", minute: "2-digit", hourCycle: "h23" }).formatToParts(wedding).map((p) => [p.type, p.value]));
  const hour = Number(clockParts.hour), minute = Number(clockParts.minute);
  const timeText = `${hour < 12 ? "오전" : "오후"} ${hour % 12 || 12}시${minute ? ` ${minute}분` : ""}`;
  const title = `${config.groom.name} · ${config.bride.name}의 결혼식에 초대합니다`;
  const description = config.shareDescription || `${title}. ${dateText} ${timeText}, ${config.venue.name} ${config.venue.hall}.`;
  document.title = title;
  fill("[data-groom]", config.groom.name);
  fill("[data-bride]", config.bride.name);
  fill("[data-venue]", config.venue.name);
  fill("[data-hall]", config.venue.hall);
  $("hero-date").textContent = `${dateText},`;
  $("hero-time").textContent = timeText;
  $("ceremony-date").append(element("span", dateText), element("strong", timeText));
  fill("[data-date-numeric]", `${year}. ${String(month).padStart(2, "0")}. ${String(day).padStart(2, "0")}.`);
  $("cover-image").src = config.cover.src;
  $("cover-image").alt = config.cover.alt;
  if (config.cover.width && config.cover.height) {
    $("cover-image").width = config.cover.width;
    $("cover-image").height = config.cover.height;
  }
  $("cover-image").style.objectPosition = config.cover.position || "center";
  config.invitation.forEach((paragraph) => {
    const p = element("p", paragraph);
    p.style.whiteSpace = "pre-line";
    $("invitation-copy").append(p);
  });
  if (config.invitationSource) {
    $("invitation-source").textContent = config.invitationSource;
    $("invitation-source").hidden = false;
  }
  const parents = [config.groom, config.bride].filter((person) => person.father || person.mother);
  if (parents.length) {
    $("families").hidden = false;
    parents.forEach((person) => {
      const row = element("p", undefined, "family-row");
      row.append(element("span", `${[person.father, person.mother].filter(Boolean).join(" · ")} `, "family-parents"));
      row.append(element("span", "의 ", "family-possessive"));
      row.append(element("span", `${person.relation} `, "family-relation"));
      const child = element("strong", person.givenName || person.name, "family-child");
      row.append(child);
      $("families").append(row);
    });
  }

  // Calendar is calculated in Korea time, including for visitors abroad.
  $("calendar").setAttribute("aria-label", `${year}년 ${month}월 ${day}일 예식 달력`);
  $("calendar").append(element("p", `${year}년 ${month}월`, "calendar-month"));
  const table = element("table");
  const head = element("thead"), headerRow = element("tr");
  ["일", "월", "화", "수", "목", "금", "토"].forEach((weekday) => { const th = element("th", weekday); th.scope = "col"; headerRow.append(th); });
  head.append(headerRow); table.append(head);
  const body = element("tbody");
  const offset = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const monthDays = new Date(Date.UTC(year, month, 0)).getUTCDate();
  for (let cell = 0; cell < Math.ceil((offset + monthDays) / 7) * 7; cell++) {
    if (cell % 7 === 0) body.append(element("tr"));
    const number = cell - offset + 1, td = element("td");
    if (number > 0 && number <= monthDays) {
      td.append(element("span", number));
      if (number === day) { td.className = "wedding-cell"; td.setAttribute("aria-label", `${month}월 ${day}일 결혼식`); }
    }
    body.lastElementChild.append(td);
  }
  table.append(body); $("calendar").append(table);
  const counterElements = ["일", "시간", "분", "초"].map((label) => {
    const container = element("div"), number = element("b", "00");
    container.append(number, element("small", label)); $("countdown").append(container); return number;
  });
  function updateCountdown() {
    const now = new Date(), seconds = Math.max(0, Math.floor((wedding - now) / 1000));
    const values = [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60];
    values.forEach((value, i) => { counterElements[i].textContent = String(value).padStart(2, "0"); });
    const today = Object.fromEntries(seoulDate.formatToParts(now).map((p) => [p.type, p.value]));
    const daysLeft = Math.round((Date.UTC(year, month - 1, day) - Date.UTC(Number(today.year), Number(today.month) - 1, Number(today.day))) / 86400000);
    $("countdown-caption").textContent = daysLeft > 0 ? `저희의 결혼식이 ${daysLeft}일 남았습니다.` : daysLeft === 0 ? "오늘, 저희 두 사람이 부부가 됩니다." : "함께해 주신 모든 분께 감사드립니다.";
  }
  updateCountdown(); setInterval(updateCountdown, 1000);

  let toastTimer;
  function toast(message) {
    clearTimeout(toastTimer); $("toast").textContent = message; $("toast").classList.add("visible");
    toastTimer = setTimeout(() => $("toast").classList.remove("visible"), 2600);
  }
  async function copy(text, message) {
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
      else {
        const textarea = element("textarea", text);
        textarea.setAttribute("readonly", ""); textarea.style.cssText = "position:fixed;top:0;left:-9999px";
        document.body.append(textarea); textarea.select();
        const succeeded = document.execCommand("copy"); textarea.remove();
        if (!succeeded) throw new Error("Clipboard unavailable");
      }
      toast(message);
    } catch { toast("복사하지 못했어요. 길게 눌러 복사해 주세요."); }
  }
  const shareUrl = () => config.siteUrl || window.location.href.split(/[?#]/)[0];
  $("copy-link").addEventListener("click", () => copy(shareUrl(), "청첩장 주소를 복사했어요."));
  $("share-button").addEventListener("click", async () => {
    if (navigator.share) {
      try { await navigator.share({ title, text: description, url: shareUrl() }); }
      catch (error) { if (error.name !== "AbortError") await copy(shareUrl(), "청첩장 주소를 복사했어요."); }
    } else await copy(shareUrl(), "청첩장 주소를 복사했어요. 카카오톡 등에 붙여넣어 주세요.");
  });

  const icsEscape = (value) => value.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
  const utcStamp = (date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  $("calendar-button").addEventListener("click", () => {
    const end = new Date(wedding.getTime() + config.durationMinutes * 60000);
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Wedding Invitation//KO", "CALSCALE:GREGORIAN", "BEGIN:VEVENT", `UID:wedding-${utcStamp(wedding)}@invitation.local`, `DTSTAMP:${utcStamp(new Date())}`, `DTSTART:${utcStamp(wedding)}`, `DTEND:${utcStamp(end)}`, `SUMMARY:${icsEscape(`${config.groom.name} · ${config.bride.name} 결혼식`)}`, `LOCATION:${icsEscape(`${config.venue.name} ${config.venue.hall}, ${config.venue.address}`)}`, `DESCRIPTION:${icsEscape(description)}`, "END:VEVENT", "END:VCALENDAR"];
    // RFC 5545: fold long lines at 75 octets without splitting UTF-8 characters.
    const fold = (line) => {
      const encoder = new TextEncoder(); let current = "", count = 0; const result = [];
      for (const char of line) { const bytes = encoder.encode(char).length; if (count + bytes > 75) { result.push(current); current = " "; count = 1; } current += char; count += bytes; }
      result.push(current); return result.join("\r\n");
    };
    const url = URL.createObjectURL(new Blob([lines.map(fold).join("\r\n") + "\r\n"], { type: "text/calendar;charset=utf-8" }));
    const a = element("a"); a.href = url; a.download = "wedding.ics"; document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  $("venue-address").textContent = config.venue.address;
  $("copy-address").addEventListener("click", () => copy(config.venue.address, "예식장 주소를 복사했어요."));
  const { latitude: lat, longitude: lng, name: venueName } = config.venue;
  $("naver-map").href = config.venue.naverPlaceId
    ? `https://map.naver.com/p/entry/place/${encodeURIComponent(config.venue.naverPlaceId)}`
    : `https://map.naver.com/v5/search/${encodeURIComponent(venueName)}`;
  $("kakao-map").href = `https://map.kakao.com/link/map/${encodeURIComponent(venueName)},${lat},${lng}`;
  $("tmap").href = `tmap://route?goalname=${encodeURIComponent(venueName)}&goalx=${lng}&goaly=${lat}`;
  $("tmap").setAttribute("aria-label", "티맵 앱으로 길찾기");
  config.venue.transport.forEach((item) => {
    const row = element("article", undefined, "transport-item");
    const heading = element("h3");
    if (item.icon) {
      const icon = element("span", item.icon, "transport-icon");
      icon.setAttribute("aria-hidden", "true");
      heading.append(icon);
    }
    heading.append(document.createTextNode(item.title));
    row.append(heading);
    if (item.lines?.length) {
      const lines = element("p", undefined, "transport-lines");
      item.lines.forEach((line) => {
        const label = element("span"), dot = element("i");
        dot.style.backgroundColor = line.color;
        dot.setAttribute("aria-hidden", "true");
        label.append(dot, document.createTextNode(line.name));
        lines.append(label);
      });
      row.append(lines);
    }
    row.append(element("p", item.detail));
    if (item.note) row.append(element("p", item.note, "transport-note"));
    $("transport-list").append(row);
  });

  function accountRow(person) {
    const row = element("button", undefined, "account-person"); row.type = "button";
    row.setAttribute("aria-label", `${person.name} 님 계좌번호 복사`);
    const name = element("span", undefined, "account-person-name"), icon = element("span", undefined, "copy-icon");
    icon.setAttribute("aria-hidden", "true");
    name.append(icon, document.createTextNode(person.name));
    if (person.relation) name.append(element("span", ` (${person.relation})`, "account-relation"));
    row.append(name, element("span", `${person.bank} ${person.number}`, "account-number"));
    if (person.placeholder) {
      row.append(element("small", "임시 계좌 정보", "account-placeholder"));
      row.disabled = true;
    } else row.addEventListener("click", () => copy(person.number, "계좌번호를 복사했어요."));
    return row;
  }
  config.accounts.forEach((group) => {
    const card = element("details", undefined, "account-group"), summary = element("summary", group.title);
    summary.setAttribute("aria-label", `${group.title} 계좌 펼치기`);
    card.append(summary);
    card.addEventListener("toggle", () => {
      summary.setAttribute("aria-label", `${group.title} 계좌 ${card.open ? "접기" : "펼치기"}`);
    });
    if (!group.people.length && !group.parents?.length) card.append(element("p", "계좌 안내를 준비하고 있습니다.", "account-empty"));
    [...group.people, ...(group.parents || [])].forEach((person) => card.append(accountRow(person)));
    $("accounts-list").append(card);
  });
  if (!config.accounts.length) $("accounts-list").append(element("p", "계좌 안내를 준비하고 있습니다.", "account-empty"));
  if (config.notice) {
    $("notice-section").hidden = false;
    $("notice-title").textContent = config.noticeTitle || "안내 말씀";
    $("notice-text").textContent = config.notice;
  }

  let galleryIndex = 0;
  const photos = config.gallery;
  const galleryPreviewCount = 9;
  function showPhoto(index) {
    galleryIndex = (index + photos.length) % photos.length;
    $("lightbox-image").src = photos[galleryIndex].src; $("lightbox-image").alt = photos[galleryIndex].alt;
    $("lightbox-position").textContent = `${galleryIndex + 1} / ${photos.length}`;
    if (!$("lightbox").open) openDialog($("lightbox"));
  }
  if (photos.length) {
    photos.forEach((photo, index) => {
      const button = element("button", undefined, "gallery-item"); button.type = "button";
      button.hidden = index >= galleryPreviewCount;
      button.setAttribute("aria-label", `사진 ${index + 1} 크게 보기`);
      const img = element("img"); img.loading = "lazy"; img.decoding = "async";
      const thumbnail = photo.thumbnailSrc || photo.src;
      if (button.hidden) img.dataset.src = thumbnail;
      else img.src = thumbnail;
      img.alt = photo.alt;
      button.append(img); button.addEventListener("click", () => showPhoto(index)); $("gallery-grid").append(button);
    });
    if (photos.length > galleryPreviewCount) {
      const toggle = $("gallery-toggle");
      const extraPhotos = [...$("gallery-grid").children].slice(galleryPreviewCount);
      toggle.hidden = false;
      toggle.addEventListener("click", () => {
        const expanded = toggle.getAttribute("aria-expanded") !== "true";
        const previousTop = toggle.getBoundingClientRect().top;
        extraPhotos.forEach((button) => {
          button.hidden = !expanded;
          const img = button.querySelector("img");
          if (expanded && img.dataset.src) {
            img.src = img.dataset.src;
            delete img.dataset.src;
          }
        });
        toggle.setAttribute("aria-expanded", String(expanded));
        toggle.replaceChildren(expanded ? "사진 접기 " : "사진 더보기 ");
        const icon = element("span", expanded ? "−" : "＋");
        icon.setAttribute("aria-hidden", "true");
        toggle.append(icon);
        if (!expanded) {
          // Keep the collapse control in place instead of jumping into the following section.
          toggle.focus({ preventScroll: true });
          requestAnimationFrame(() => {
            window.scrollBy({ top: toggle.getBoundingClientRect().top - previousTop, behavior: "instant" });
          });
        }
      });
    }
    $("lightbox-prev").addEventListener("click", () => showPhoto(galleryIndex - 1)); $("lightbox-next").addEventListener("click", () => showPhoto(galleryIndex + 1));
    $("lightbox").addEventListener("keydown", (event) => { if (event.key === "ArrowLeft") { event.preventDefault(); showPhoto(galleryIndex - 1); } if (event.key === "ArrowRight") { event.preventDefault(); showPhoto(galleryIndex + 1); } });
  } else {
    for (let index = 0; index < galleryPreviewCount; index++) {
      const tile = element("div", undefined, "gallery-placeholder");
      tile.setAttribute("aria-hidden", "true");
      tile.append(element("span", String(index + 1).padStart(2, "0")));
      $("gallery-grid").append(tile);
    }
  }
  function openDialog(dialog) { dialog.showModal(); document.body.style.overflow = "hidden"; }
  document.querySelectorAll("dialog").forEach((dialog) => {
    dialog.querySelector("[data-close]").addEventListener("click", () => dialog.close());
    dialog.addEventListener("close", () => { document.body.style.overflow = ""; });
    dialog.addEventListener("click", (event) => { if (event.target !== dialog) return; const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); });
  });
  document.querySelectorAll('a[href="#location"]').forEach((link) => link.addEventListener("click", () => { $("location").focus({ preventScroll: true }); }));
})();
