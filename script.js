const firstMeeting = new Date('2026-08-03T12:26:00+08:00').getTime();
const letterEmphasis = '与你，岁岁年年～';
const letter = `很高兴与你相遇，
愿我们有并肩看世界的勇气，
也有坐下来分享些许琐事的闲心...

我会好好珍惜这段感情，
希望可以与你，岁岁年年～`;

const keepsake = document.querySelector('#keepsake');
const welcome = document.querySelector('#welcome');
const wakeButton = document.querySelector('#wake-button');
const scrollCue = document.querySelector('.scroll-cue');
const letterSection = document.querySelector('#letter');
const letterScroll = document.querySelector('#letter-scroll');
const plainText = document.querySelector('#letter-plain');
const emphasizedText = document.querySelector('#letter-emphasis');
const typingCaret = document.querySelector('#typing-caret');
const letterEllipsis = document.querySelector('#letter-ellipsis');
const letterSignature = document.querySelector('#letter-signature');
const themeColor = document.querySelector('meta[name="theme-color"]');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const chromeColors = ['#c9c1b9', '#f6ecdf', '#f7efe2', '#26313b'];

function updateChromeColor(index, override) {
  const color = override || chromeColors[index];
  themeColor.setAttribute('content', color);
  document.documentElement.style.setProperty('--chrome-color', color);
}

function wakePage() {
  keepsake.classList.add('is-awake');
  updateChromeColor(0, '#f5ebdd');
}

welcome.addEventListener('click', wakePage);
wakeButton.addEventListener('click', wakePage);

const pages = Array.from(keepsake.querySelectorAll(':scope > section'));
let touchStartX = 0;
let touchStartY = 0;
let activePage = 0;
let touchPage = 0;
let trackingTouch = false;
let wheelLocked = false;
let wheelUnlockTimer = 0;
let resizeTimer = 0;

function nearestPage() {
  let nearest = 0;
  let distance = Number.POSITIVE_INFINITY;
  pages.forEach((page, index) => {
    const nextDistance = Math.abs(keepsake.scrollTop - page.offsetTop);
    if (nextDistance < distance) {
      distance = nextDistance;
      nearest = index;
    }
  });
  return nearest;
}

function scrollToPage(index, instant = false) {
  activePage = Math.max(0, Math.min(pages.length - 1, index));
  const page = pages[activePage];
  if (!page) return;
  updateChromeColor(activePage, activePage === 0 && keepsake.classList.contains('is-awake') ? '#f5ebdd' : undefined);
  keepsake.scrollTo({
    top: page.offsetTop,
    behavior: instant || prefersReducedMotion ? 'auto' : 'smooth',
  });
}

scrollCue.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  scrollToPage(1);
});

keepsake.addEventListener('touchstart', (event) => {
  if (event.touches.length !== 1) return;
  touchStartX = event.touches[0].clientX;
  touchStartY = event.touches[0].clientY;
  activePage = nearestPage();
  touchPage = activePage;
  trackingTouch = true;
}, { passive: true });

keepsake.addEventListener('touchmove', (event) => {
  if (!trackingTouch || event.touches.length !== 1) return;
  const deltaX = touchStartX - event.touches[0].clientX;
  const deltaY = touchStartY - event.touches[0].clientY;
  if (Math.abs(deltaY) <= Math.abs(deltaX) || Math.abs(deltaY) < 8) return;
  event.preventDefault();
}, { passive: false });

keepsake.addEventListener('touchend', (event) => {
  if (!trackingTouch) return;
  trackingTouch = false;
  const endY = event.changedTouches[0]?.clientY ?? touchStartY;
  const deltaY = touchStartY - endY;
  const direction = Math.abs(deltaY) >= 44 ? Math.sign(deltaY) : 0;
  scrollToPage(touchPage + direction);
}, { passive: true });

keepsake.addEventListener('touchcancel', () => {
  trackingTouch = false;
  scrollToPage(nearestPage());
}, { passive: true });

keepsake.addEventListener('wheel', (event) => {
  if (Math.abs(event.deltaY) <= Math.abs(event.deltaX) || Math.abs(event.deltaY) < 8) return;
  event.preventDefault();
  if (wheelLocked) return;
  wheelLocked = true;
  scrollToPage(nearestPage() + Math.sign(event.deltaY));
  window.clearTimeout(wheelUnlockTimer);
  wheelUnlockTimer = window.setTimeout(() => {
    wheelLocked = false;
  }, 720);
}, { passive: false });

function alignHashTarget() {
  const target = pages.find((page) => `#${page.id}` === window.location.hash);
  if (target) scrollToPage(pages.indexOf(target), true);
}

function alignAfterViewportResize() {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(() => scrollToPage(activePage, true), 90);
}

window.addEventListener('hashchange', alignHashTarget);
window.visualViewport?.addEventListener('resize', alignAfterViewportResize);
keepsake.addEventListener('scrollend', () => {
  activePage = nearestPage();
  updateChromeColor(activePage, activePage === 0 && keepsake.classList.contains('is-awake') ? '#f5ebdd' : undefined);
}, { passive: true });
window.requestAnimationFrame(() => window.requestAnimationFrame(alignHashTarget));

function getElapsedTime() {
  const totalSeconds = Math.max(0, Math.floor((Date.now() - firstMeeting) / 1000));
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function updateCounter() {
  const elapsed = getElapsedTime();
  for (const [key, value] of Object.entries(elapsed)) {
    const element = document.querySelector(`#${key}`);
    const nextValue = String(value).padStart(2, '0');
    if (element.textContent === nextValue) continue;
    element.textContent = nextValue;
    element.style.animation = 'none';
    void element.offsetHeight;
    element.style.animation = '';
  }
  document.querySelector('#counter-shell').setAttribute(
    'aria-label',
    `从第一次见面起已经过去 ${elapsed.days} 天 ${elapsed.hours} 小时 ${elapsed.minutes} 分钟 ${elapsed.seconds} 秒`,
  );
}

updateCounter();
window.setInterval(updateCounter, 1000);

let letterStarted = false;

function renderLetter(length) {
  const emphasisStart = letter.indexOf(letterEmphasis);
  plainText.textContent = letter.slice(0, Math.min(length, emphasisStart));
  emphasizedText.textContent = length > emphasisStart ? letter.slice(emphasisStart, length) : '';
}

function typeLetter() {
  if (letterStarted) return;
  letterStarted = true;
  letterScroll.classList.add('is-open');

  if (prefersReducedMotion) {
    renderLetter(letter.length);
    typingCaret.classList.add('is-done');
    letterEllipsis.classList.add('is-visible');
    letterSignature.classList.add('is-visible');
    return;
  }

  let typedLength = 0;
  const typeNext = () => {
    if (typedLength >= letter.length) {
      typingCaret.classList.add('is-done');
      letterEllipsis.classList.add('is-visible');
      letterSignature.classList.add('is-visible');
      return;
    }
    typedLength += 1;
    renderLetter(typedLength);
    const delay = typedLength < 12 ? 105 : 68;
    window.setTimeout(typeNext, delay);
  };
  window.setTimeout(typeNext, 1650);
}

const letterObserver = new IntersectionObserver(
  ([entry]) => entry.isIntersecting && typeLetter(),
  { threshold: 0.28 },
);
letterObserver.observe(letterSection);
