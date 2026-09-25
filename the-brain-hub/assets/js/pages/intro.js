import { isReady, loadRegistry } from '../utils/catalog.js';
import { escapeHtml } from '../utils/escape-html.js';
import { brainNetworkMarkup } from '../modules/brain-network.js';
import { initThemeToggle } from '../modules/theme-toggle.js';

function renderLanguages(container, languages) {
  const ordered = [...languages].sort((a, b) => Number(isReady(b)) - Number(isReady(a)) || a.order - b.order);
  container.innerHTML = ordered.map((language) => {
    const planned = !isReady(language);
    return `<li class="intro__lang${planned ? ' intro__lang--planned' : ''}" data-language="${escapeHtml(language.id)}">`
      + `<span class="lang-badge lang-badge--sm" aria-hidden="true"><span class="lang-badge__text">${escapeHtml(language.badge)}</span></span>`
      + `<span>${escapeHtml(language.name)}</span>`
      + (planned ? '<span class="intro__lang-note">เร็ว ๆ นี้</span>' : '')
      + '</li>';
  }).join('');
  container.hidden = ordered.length === 0;
}

async function init() {
  document.getElementById('boot-notice')?.remove();
  initThemeToggle(document.getElementById('theme-toggle'));
  document.getElementById('intro-logo').innerHTML = brainNetworkMarkup({
    className: 'brain-network--animated',
    label: 'โลโก้ The Brain',
  });

  // Enter เข้า Dashboard ได้ทันทีโดยไม่ต้องโฟกัสปุ่มก่อน แต่ไม่แย่ง Enter จากปุ่มอื่นที่โฟกัสอยู่
  const enter = document.getElementById('intro-enter');
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' || event.repeat || event.defaultPrevented) return;
    if (event.target === document.body || event.target === document.documentElement) enter.click();
  });

  const list = document.getElementById('intro-langs');
  try {
    const { languages } = await loadRegistry();
    renderLanguages(list, languages);
  } catch {
    list.hidden = true;
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
