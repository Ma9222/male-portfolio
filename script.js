/* ===== 打字机效果 ===== */
(function () {
  const el = document.getElementById('typed');
  if (!el) return;
  const phrases = [
    '大数据技术专业 · 在校大三学生',
    '热爱编程 · JavaScript / React / Node / Python',
    '9 项竞赛获奖 · 国家级二等奖',
    '院自律会卫生部部长 · 班级副班长',
    '志愿服务 312 小时 · citywalk 爱好者',
  ];
  let pi = 0, ci = 0, deleting = false;
  function tick() {
    const cur = phrases[pi];
    if (!deleting) {
      el.textContent = cur.slice(0, ++ci);
      if (ci === cur.length) {
        deleting = true;
        return setTimeout(tick, 1800);
      }
    } else {
      el.textContent = cur.slice(0, --ci);
      if (ci === 0) {
        deleting = false;
        pi = (pi + 1) % phrases.length;
      }
    }
    setTimeout(tick, deleting ? 40 : 80);
  }
  tick();
})();

/* ===== 滚动显示动画 ===== */
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
// 兜底：800ms 后仍未显示的首屏元素强制可见
setTimeout(() => {
  document.querySelectorAll('.reveal:not(.visible)').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('visible');
  });
}, 800);

/* ===== 数字计数动画 ===== */
const countTargets = document.querySelectorAll('.stat-num, .viz-total, .ps-num[data-count]');
function runCount(el) {
  const target = +el.dataset.count;
  if (el.dataset.counted) return;
  el.dataset.counted = '1';
  const dur = 1600;
  const start = performance.now();
  const timer = setInterval(() => {
    const now = performance.now();
    const t = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.floor(ease * target);
    if (t >= 1) {
      el.textContent = target;
      clearInterval(timer);
    }
  }, 30);
}
const statIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    runCount(e.target);
    statIO.unobserve(e.target);
  });
}, { threshold: 0.1 });
countTargets.forEach((el) => statIO.observe(el));
// 兜底：800ms 后对仍在视口内且未计数的强制执行
setTimeout(() => {
  countTargets.forEach((el) => {
    if (el.dataset.counted) return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) runCount(el);
  });
}, 800);
// 终极兜底：2.5s 后所有计数元素若仍为 0 则直接显示目标值
setTimeout(() => {
  countTargets.forEach((el) => {
    if (el.textContent === '0' && el.dataset.count) {
      el.textContent = el.dataset.count;
    }
  });
}, 2500);

/* ===== 导航栏滚动效果 ===== */
const nav = document.querySelector('.nav');
const navLinks = document.querySelectorAll('.nav-links a[data-link]');
const sections = [...navLinks].map((a) => document.querySelector(a.getAttribute('href')));

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* 当前段落高亮 */
const secIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      const id = '#' + e.target.id;
      navLinks.forEach((a) => {
        a.classList.toggle('active', a.getAttribute('href') === id);
      });
    }
  });
}, { threshold: 0.4 });
sections.forEach((s) => s && secIO.observe(s));

/* ===== 移动端菜单切换 ===== */
const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('.nav-links');
if (toggle) {
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('open');
    links.classList.toggle('open');
  });
  links.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      toggle.classList.remove('open');
      links.classList.remove('open');
    });
  });
}

/* ===== 技能卡片光标跟随 ===== */
document.querySelectorAll('.skill-card').forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
    card.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
  });
});

/* ===== 背景粒子 ===== */
(function () {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  const COUNT = 60;
  const COLORS = ['#5eead4', '#818cf8', '#f472b6'];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function init() {
    particles = [];
    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.6 + 0.4,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        c: COLORS[Math.floor(Math.random() * COLORS.length)],
        a: Math.random() * 0.6 + 0.2,
      });
    }
  }
  init();

  function draw() {
    ctx.clearRect(0, 0, W, H);

    /* 连线 */
    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 140) {
          ctx.strokeStyle = 'rgba(94, 234, 212, ' + (0.12 * (1 - d / 140)) + ')';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }

    /* 粒子 */
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.c;
      ctx.globalAlpha = p.a;
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    requestAnimationFrame(draw);
  }
  draw();
})();

/* ===== 获奖分布环形图 ===== */
(function () {
  const g = document.getElementById('donutSegments');
  const wrap = document.querySelector('.awards-viz');
  if (!g || !wrap) return;

  const data = [
    { val: 1, color: '#f472b6' },
    { val: 1, color: '#818cf8' },
    { val: 2, color: '#5eead4' },
    { val: 4, color: '#8a94ad' },
    { val: 1, color: '#5e6783' },
  ];
  const total = data.reduce((s, d) => s + d.val, 0);
  const R = 80;
  const C = 2 * Math.PI * R;

  const segs = data.map((d) => {
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', 100);
    c.setAttribute('cy', 100);
    c.setAttribute('r', R);
    c.setAttribute('fill', 'none');
    c.setAttribute('stroke', d.color);
    c.setAttribute('stroke-width', 22);
    c.setAttribute('stroke-linecap', 'butt');
    c.classList.add('donut-seg');
    g.appendChild(c);
    return { el: c, val: d.val };
  });

  function render(progress) {
    const tp = progress * total;
    let acc = 0;
    segs.forEach((s) => {
      const segStart = acc;
      const segEnd = acc + s.val;
      let draw;
      if (tp <= segStart) draw = 0;
      else if (tp >= segEnd) draw = s.val;
      else draw = tp - segStart;
      const segLen = (draw / total) * C;
      s.el.setAttribute('stroke-dasharray', segLen + ' ' + (C - segLen));
      s.el.setAttribute('stroke-dashoffset', -(acc / total) * C);
      acc += s.val;
    });
  }
  render(0);

  const vizIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const start = performance.now();
      const dur = 1800;
      function step(now) {
        const t = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        render(ease);
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      vizIO.unobserve(e.target);
    });
  }, { threshold: 0.3 });
  vizIO.observe(wrap);
})();
