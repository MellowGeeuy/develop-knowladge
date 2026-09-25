/**
 * language-cards.js — การ์ดภาษาบน Dashboard · 1 การ์ด = 1 รายการใน languages.json
 * สีของการ์ดมาจาก data-language (language-accents.css) ไม่ได้ตั้งจาก JS
 */
import { escapeHtml } from '../utils/escape-html.js';
import { iconMarkup } from '../utils/icon.js';

function badgeMarkup(language, logoUrl) {
  if (logoUrl) {
    return `<span class="lang-badge lang-badge--md lang-badge--image" aria-hidden="true"><img src="${escapeHtml(logoUrl)}" alt=""></span>`;
  }
  return `<span class="lang-badge lang-badge--md" aria-hidden="true"><span class="lang-badge__text">${escapeHtml(language.badge)}</span></span>`;
}

function callToAction(item) {
  const { progress } = item;
  if (!progress || progress.read === 0) return 'เริ่มเรียน';
  if (!progress.nextLesson) return 'ทบทวนอีกครั้ง';
  return `อ่านต่อ บทที่ ${progress.nextLesson.number}`;
}

function readyCard(item) {
  const { language, course, progress } = item;
  const name = escapeHtml(language.name);
  return `
    <div class="lang-card__top">
      ${badgeMarkup(language, item.logoUrl)}
      <span class="chip chip--ready"><span class="chip__dot" aria-hidden="true"></span>พร้อมเรียน</span>
    </div>
    <div class="lang-card__body">
      <h3 class="lang-card__name"><a class="lang-card__link" href="${escapeHtml(item.href)}">${name}</a></h3>
      <p class="lang-card__tagline">${escapeHtml(language.tagline)}</p>
    </div>
    <ul class="lang-card__meta" aria-label="ข้อมูลคอร์ส ${name}">
      <li class="lang-card__meta-item">${iconMarkup('i-book', { className: 'icon--sm' })}${course.lessons.length} บท</li>
      <li class="lang-card__meta-item">${iconMarkup('i-layers', { className: 'icon--sm' })}${course.levels.length} ระดับ</li>
      <li class="lang-card__meta-item">${iconMarkup('i-clock', { className: 'icon--sm' })}ประมาณ ${escapeHtml(item.duration)}</li>
    </ul>
    <div class="lang-card__progress">
      <div class="progress" role="progressbar" aria-label="ความคืบหน้า ${name}"
           aria-valuemin="0" aria-valuemax="${progress.total}" aria-valuenow="${progress.read}">
        <span class="progress__fill" style="--value: ${progress.ratio}"></span>
      </div>
      <span class="lang-card__progress-label">อ่านแล้ว ${progress.read}/${progress.total}</span>
    </div>
    <p class="lang-card__cta">${callToAction(item)}${iconMarkup('i-arrow-right', { className: 'icon--sm' })}</p>`;
}

function plannedCard(item) {
  const { language } = item;
  return `
    <div class="lang-card__top">
      ${badgeMarkup(language, item.logoUrl)}
      <span class="chip chip--planned"><span class="chip__dot" aria-hidden="true"></span>กำลังจัดทำ</span>
    </div>
    <div class="lang-card__body">
      <h3 class="lang-card__name">${escapeHtml(language.name)}</h3>
      <p class="lang-card__tagline">${escapeHtml(language.tagline)}</p>
    </div>
    <ul class="lang-card__meta">
      <li class="lang-card__meta-item">${iconMarkup('i-lock', { className: 'icon--sm' })}ยังไม่เปิดให้เรียน</li>
    </ul>
    <div class="lang-card__progress">
      <span class="lang-card__progress-label">เนื้อหากำลังเรียบเรียง</span>
    </div>
    <p class="lang-card__cta">เร็ว ๆ นี้</p>`;
}

export function renderLanguageCards(container, items) {
  container.innerHTML = items.map((item, index) => {
    const classes = ['lang-card', 'reveal', item.ready ? '' : 'lang-card--planned'].filter(Boolean).join(' ');
    return `<article class="${classes}" role="listitem" data-language="${escapeHtml(item.language.id)}" style="--reveal-index: ${index}">`
      + `${item.ready ? readyCard(item) : plannedCard(item)}</article>`;
  }).join('');
}
