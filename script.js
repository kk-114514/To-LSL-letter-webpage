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
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function wakePage() {
  keepsake.classList.add('is-awake');
}

welcome.addEventListener('click', wakePage);
wakeButton.addEventListener('click', wakePage);
scrollCue.addEventListener('click', (event) => event.stopPropagation());

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
    return;
  }

  let typedLength = 0;
  const typeNext = () => {
    if (typedLength >= letter.length) {
      typingCaret.classList.add('is-done');
      letterEllipsis.classList.add('is-visible');
      return;
    }
    typedLength += 1;
    renderLetter(typedLength);
    const delay = typedLength < 12 ? 80 : 42;
    window.setTimeout(typeNext, delay);
  };
  window.setTimeout(typeNext, 1250);
}

const letterObserver = new IntersectionObserver(
  ([entry]) => entry.isIntersecting && typeLetter(),
  { threshold: 0.28 },
);
letterObserver.observe(letterSection);
