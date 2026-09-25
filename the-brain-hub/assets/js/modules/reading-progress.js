/**
 * reading-progress.js — แถบบางใต้แถบบนที่บอกว่าอ่านบทปัจจุบันไปถึงไหนแล้ว
 * คิดจากตัวบทความ ไม่ใช่ทั้งหน้า footer กับส่วนท้ายจึงไม่ทำให้แถบไม่เต็มตอนอ่านจบ
 */
export function createReadingProgress(element) {
  const bar = element.querySelector('.reading-progress__bar');
  const topbar = element.closest('.topbar');
  let target = null;
  let frame = 0;

  const update = () => {
    frame = 0;
    if (!target) return;
    const offset = topbar?.offsetHeight ?? 0;
    const rect = target.getBoundingClientRect();
    const distance = rect.height - (window.innerHeight - offset);
    const ratio = distance > 0 ? (offset - rect.top) / distance : 1;
    bar.style.setProperty('--progress', String(Math.min(1, Math.max(0, ratio))));
  };

  const schedule = () => {
    if (!frame) frame = window.requestAnimationFrame(update);
  };

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);

  return {
    track(next) {
      target = next;
      element.hidden = !next;
      schedule();
    },
  };
}
