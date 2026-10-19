/* ==========================================
   大数据技术专业认知平台 · script.js
   ========================================== */

/* ---------- 背景动态粒子网络(带鼠标交互) ---------- */
(function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], t = 0;
  const mouse = { x: null, y: null };
  const LINK = 130;        // 粒子间连线距离
  const MOUSE_R = 200;     // 鼠标影响半径

  function createParticles() {
    const count = Math.min(110, Math.floor(W * H / 15000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 2.2 + 1,
      phase: Math.random() * Math.PI * 2,          // 闪烁相位
      color: Math.random() < 0.28 ? 'rgba(139, 92, 246,' : 'rgba(59, 130, 246,'
    }));
  }

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    createParticles();
  }

  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('mouseout', () => { mouse.x = null; mouse.y = null; });
  window.addEventListener('resize', resize);

  function draw() {
    t += 0.02;
    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      // 鼠标吸引:影响半径内的粒子被轻轻拉向鼠标
      if (mouse.x !== null) {
        const dx = mouse.x - p.x, dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_R && dist > 0.001) {
          p.vx += dx / dist * 0.012;
          p.vy += dy / dist * 0.012;
        }
      }
      // 限速,保持缓慢漂移
      p.vx = Math.max(-0.9, Math.min(0.9, p.vx));
      p.vy = Math.max(-0.9, Math.min(0.9, p.vy));

      p.x += p.vx; p.y += p.vy;
      // 越界环绕
      if (p.x < -20) p.x = W + 20; else if (p.x > W + 20) p.x = -20;
      if (p.y < -20) p.y = H + 20; else if (p.y > H + 20) p.y = -20;

      // 呼吸式闪烁
      const twinkle = 0.45 + 0.3 * Math.sin(t * 2 + p.phase);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + twinkle.toFixed(3) + ')';
      ctx.fill();

      // 粒子间连线(每对只画一次)
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(99, 102, 241, ${(0.16 * (1 - dist / LINK)).toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // 与鼠标连线
      if (mouse.x !== null) {
        const dx = mouse.x - p.x, dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_R) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(37, 99, 235, ${(0.28 * (1 - dist / MOUSE_R)).toFixed(3)})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }

  resize();
  draw();
})();

/* ---------- 导航状态 ---------- */
(function initNav() {
  const nav = document.getElementById('site-nav');
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  if (!nav || !toggle || !links) return; // 页面结构缺失时安全跳过

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('open');
    links.classList.toggle('open');
  });
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    toggle.classList.remove('open');
    links.classList.remove('open');
  }));

  // 高亮当前区块
  const sections = document.querySelectorAll('section[id]');
  const navA = document.querySelectorAll('.nav-links a');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navA.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => io.observe(s));
})();

/* ---------- 滚动显现 ---------- */
(function initReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

/* ---------- 数字滚动 ---------- */
(function initCounter() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = +el.dataset.count;
      const dur = 1400, start = performance.now();
      (function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      })(start);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat-num').forEach(el => io.observe(el));
})();

/* ---------- 课程筛选 ---------- */
(function initFilter() {
  const btns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.course-card');
  btns.forEach(btn => btn.addEventListener('click', () => {
    btns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    cards.forEach(c => {
      const show = f === 'all' || c.dataset.year === f;
      c.classList.toggle('hidden', !show);
      if (show) {
        c.classList.add('visible');
      }
    });
  }));
})();

/* ---------- 学习路线面板 ---------- */
(function initRoadmap() {
  const phases = [
    {
      title: '阶段一 · 筑基期(大一)',
      goal: 'GOAL // 建立编程与数据的基础思维',
      tasks: [
        ['Python 入门', '吃透基础语法与文件操作,完成 100+ 道基础编程题'],
        ['面向对象进阶', '掌握类/封装/继承/多态,写出规范的面向对象程序'],
        ['Web 前端基础', 'HTML/CSS/JS 入门,能写出交互良好的展示页面'],
        ['Linux 与网络', '熟悉 Linux 常用命令与服务部署,理解 HTTP 基本原理'],
        ['工具与习惯', '学会使用 Git 管理代码,开始写技术博客积累沉淀'],
        ['英语与技术阅读', '培养查阅官方文档的习惯,技术词的英文要认识']
      ],
      milestone: '里程碑:独立完成一个「学生成绩管理系统」小项目,并用 Git 托管在 GitHub 上。'
    },
    {
      title: '阶段二 · 核心期(大二)',
      goal: 'GOAL // 掌握数据全流程核心技术栈',
      tasks: [
        ['SQL 必修课', '吃透数据库原理与多表联查,SQL 是数据岗位面试必考项'],
        ['采集与清洗', '用爬虫与 Pandas 把原始数据变成干净可用的数据集'],
        ['数据分析与挖掘', 'Pandas 熟练分析数据,入门分类、聚类等数据挖掘算法'],
        ['Hadoop 与 Spark', '理解 HDFS 分布式存储,用 Spark SQL 高效完成大规模数据计算'],
        ['后端全链路', 'Web 后端开发接口,打通"页面-接口-数据"全链路'],
        ['可视化与表达', '用 ECharts/BI 做图表大屏,配合商业简报讲好数据故事']
      ],
      milestone: '里程碑:组队完成一个「数据采集 → 分析 → 可视化大屏」完整项目,参加一次学科竞赛。'
    },
    {
      title: '阶段三 · 冲刺期(大三)',
      goal: 'GOAL // 打磨作品、明确方向、拿下 offer 或升本',
      tasks: [
        ['确定主攻方向', '根据兴趣在开发/分析/数仓/运维中选定目标岗位,针对性补强'],
        ['综合项目实战', '做 1-2 个简历级项目,突出业务价值与技术难点'],
        ['刷题与八股', 'SQL 题、Python/Java 基础、Hadoop/Spark 原理高频面试题'],
        ['实习求职', '打磨简历,通过顶岗实习进入企业,争取转正 offer'],
        ['证书与竞赛', '考取华为 HCIA / 工信部大数据证书,竞赛奖项查漏补缺'],
        ['升学备选', '准备专升本的复习计划,双线并行不留遗憾']
      ],
      milestone: '里程碑:毕业前手握 offer 或专升本录取通知,项目作品集完整沉淀在 GitHub。'
    }
  ];

  const panel = document.getElementById('roadmap-panel');
  if (!panel) return; // 课程详情页等无此元素的页面直接跳过
  const btns = document.querySelectorAll('.phase-btn');

  function render(i) {
    const p = phases[i];
    panel.innerHTML = `
      <h3 class="rm-title">${p.title}</h3>
      <div class="rm-goal">${p.goal}</div>
      <div class="rm-tasks">
        ${p.tasks.map(([t, d]) => `<div class="rm-task"><div><strong>${t}</strong>${d}</div></div>`).join('')}
      </div>
      <div class="rm-milestone"><strong>MILESTONE</strong>${p.milestone}</div>
    `;
  }

  btns.forEach(btn => btn.addEventListener('click', () => {
    btns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render(+btn.dataset.phase);
    // 重新触发面板入场动画
    panel.style.animation = 'none';
    void panel.offsetWidth;
    panel.style.animation = '';
  }));

  render(0);
})();

/* ---------- 课程详情页数据 ---------- */
const COURSE_ORDER = ['python','web-frontend','oop-advanced','linux','database-sql','web-backend','data-collect','data-analysis','computer-network','business-brief','data-visual','spark','data-mining','hadoop','practice'];

const COURSE_DATA = {
  'python': {
    year: '大一', type: '基础课', cls: 'y1', title: 'Python',
    desc: '程序设计入门课:变量、流程控制、函数与文件操作,建立编程与计算思维,是后续数据分析、数据采集的语言基石。',
    points: ['Python 基础语法:变量、数据类型、运算符', '流程控制:条件判断与循环结构', '函数定义、参数传递与模块化编程', '文件读写与异常处理', '常用标准库与第三方库的安装使用'],
    tips: ['每天坚持敲代码,完成 100+ 道基础编程题', '遇到报错先自己读错误信息,培养调试能力'],
    jobs: ['数据分析师', '大数据开发工程师', '全栈开发']
  },
  'web-frontend': {
    year: '大一', type: '基础课', cls: 'y1', title: 'Web 前端技术与应用',
    desc: 'HTML / CSS / JavaScript 三大件,页面布局与交互实现,既能做出数据展示页面,也为后续数据可视化大屏打基础。',
    points: ['HTML 语义化标签与页面结构', 'CSS 盒模型、Flex/Grid 布局与响应式设计', 'JavaScript 基础语法与 DOM 操作', '表单验证与常见交互效果', '简单数据展示页面的开发'],
    tips: ['多动手临摹优秀页面,再逐步加入自己的设计', '学好 JS 基础对后续 ECharts 可视化帮助极大'],
    jobs: ['前端开发', '数据可视化工程师', '数据分析师']
  },
  'oop-advanced': {
    year: '大一', type: '基础课', cls: 'y1', title: '面向对象程序设计(高级)',
    desc: '在入门语法之上进阶:类与对象、封装、继承、多态与常用框架,写出规范、可维护的面向对象程序,是工程化开发的核心能力。',
    points: ['类与对象:封装、构造方法', '继承、多态与抽象类/接口', '集合框架与泛型的使用', '常用设计思想与代码规范', '小型面向对象项目的设计与实现'],
    tips: ['先用画图的方式理清类之间的关系,再动手写代码', '对照优秀开源代码学习命名与结构规范'],
    jobs: ['大数据开发工程师', 'Java 后端开发', '数据仓库工程师']
  },
  'linux': {
    year: '大一', type: '基础课', cls: 'y1', title: 'Linux 操作系统基础',
    desc: '大数据平台几乎都跑在 Linux 上:常用命令、Shell 脚本、文件系统与服务部署,是后续所有大数据课程的运行环境基础。',
    points: ['常用命令:文件、目录、权限、进程管理', 'Vim 编辑器与文本处理工具', 'Shell 脚本编写与自动化', '软件安装、环境变量与服务部署', '远程连接与服务器基本运维'],
    tips: ['给自己装一台 Linux 虚拟机,日常操作全在终端完成', '大数据组件部署练习前,先把 Linux 玩熟'],
    jobs: ['大数据运维工程师', '大数据开发工程师', '云计算运维']
  },
  'database-sql': {
    year: '大二', type: '核心课', cls: 'y2', title: '数据库原理与 SQL 语言',
    desc: '学习关系模型与数据库设计:建库建表、SQL 增删改查、多表联查与索引优化。SQL 是数据人的"母语",几乎所有数据岗位面试必考。',
    points: ['关系模型、范式与数据库设计', 'DDL/DML/DQL:建表、增删改、查询', '多表联查:JOIN、子查询、分组聚合', '索引原理与查询优化', '事务与数据一致性基础'],
    tips: ['SQL 每天练,推荐在 SQL 练习平台刷完 100 题', '尝试给生活中的数据(成绩单、账单)建一个库'],
    jobs: ['数据分析师', '数据仓库工程师', '大数据开发工程师']
  },
  'web-backend': {
    year: '大二', type: '核心课', cls: 'y2', title: 'Web 后端技术与应用',
    desc: '服务端开发:接口设计与实现、前后端数据交互、数据库连接,打通"页面 → 接口 → 数据"全链路,理解系统如何协同工作。',
    points: ['HTTP 请求响应与 RESTful 接口设计', '后端框架基本使用(路由、中间件)', '数据库连接与 ORM 操作', '用户认证与会话管理基础', '前后端联调与接口测试'],
    tips: ['把自己做的前端页面配上真实后端接口,形成完整闭环', '学会用接口调试工具(Postman/Apifox)自测'],
    jobs: ['后端开发', '大数据开发工程师', '数据平台开发']
  },
  'data-collect': {
    year: '大二', type: '核心课', cls: 'y2', title: '数据采集与清洗',
    desc: '把原始数据变成可用数据:网络爬虫获取外部数据,再用 Pandas 等工具处理缺失值、异常值与重复数据,保证分析质量。',
    points: ['Requests 爬虫与网页解析(BeautifulSoup/XPath)', '动态网页数据抓取思路', 'Pandas 数据清洗:缺失值、异常值、去重', '数据格式转换与规范化存储', '采集合规与反爬常识'],
    tips: ['爬取数据前先确认网站允许,遵守 robots 协议', '清洗练习可用公开数据集,重点练 Pandas'],
    jobs: ['数据分析师', '数据采集工程师', '大数据开发工程师']
  },
  'data-analysis': {
    year: '大二', type: '核心课', cls: 'y2', title: '数据分析技术与应用',
    desc: 'NumPy、Pandas、Matplotlib 三件套:统计分析、多维透视与图表呈现,从数据中提炼结论,是数据分析岗的核心技能。',
    points: ['NumPy 数组运算与向量化思维', 'Pandas 数据结构、分组聚合与透视表', 'Matplotlib 常用图表绘制', '描述性统计与分析思路', '完整分析报告的撰写与呈现'],
    tips: ['每做一个分析都要回答"所以呢?"——结论比过程更重要', '找一本数据分析实战书,完整跟完 2-3 个案例'],
    jobs: ['数据分析师', '商业分析师', '数据运营']
  },
  'computer-network': {
    year: '大二', type: '基础课', cls: 'y2', title: '计算机网络技术',
    desc: 'TCP/IP、HTTP 等网络原理与协议,理解数据如何在网络中传输,是爬虫、后端开发与运维排错的底层知识支撑。',
    points: ['网络分层模型与常见协议', 'TCP/IP 原理:三次握手、可靠传输', 'HTTP/HTTPS 请求流程与状态码', 'IP 地址、端口与域名解析', '抓包工具与网络故障排查入门'],
    tips: ['抓包工具(如浏览器开发者工具)是学网络最直观的方式', '把"输入网址到看到页面"的完整过程讲清楚'],
    jobs: ['大数据运维工程师', '后端开发', '网络安全方向']
  },
  'business-brief': {
    year: '大二', type: '素养课', cls: 'y2', title: '商业简报制作',
    desc: '学会用 PPT 与 BI 报告"讲好数据故事":结构化表达、可视化呈现与汇报技巧,把分析结论转化为业务方听得懂的语言。',
    points: ['金字塔原理与结构化表达', '数据图表的选型与美化', '商业简报的逻辑框架与排版', '汇报演讲技巧与临场表达', '从数据结论到业务建议的转化'],
    tips: ['课程展示/竞赛答辩就是最好的练习场,主动上台', '研究优秀咨询公司报告的图表与叙事方式'],
    jobs: ['数据分析师', '商业分析师', '数据产品经理']
  },
  'data-visual': {
    year: '大二', type: '核心课', cls: 'y2', title: '数据可视化技术',
    desc: 'ECharts、FineBI 等工具制作交互式图表与数据大屏,让数据"开口说话",是数据分析师与开发岗的通用加分技能。',
    points: ['可视化基本原则:准确、简洁、聚焦', 'ECharts 图表配置与交互', 'FineBI 等 BI 工具搭建看板', '数据大屏的设计与布局', '结合后端接口实现动态数据展示'],
    tips: ['做一个自己主题的数据大屏,放进简历非常加分', '配色和布局决定第一印象,多参考优秀案例'],
    jobs: ['数据分析师', '数据可视化工程师', 'BI 工程师']
  },
  'spark': {
    year: '大二', type: '核心课', cls: 'y2', title: 'Spark 生态技术与应用',
    desc: '新一代分布式计算框架生态:Spark Core、Spark SQL、Spark Streaming 等组件,基于内存计算,高效完成大规模数据的批处理与实时分析。',
    points: ['Spark Core:RDD 编程模型', 'Spark SQL 结构化数据处理', 'Spark Streaming / Structured Streaming 实时计算', 'Spark 与 Hadoop 的关系与配合', '性能调优与常见面试原理题'],
    tips: ['先把单机版跑通,再体验集群模式', '对比 SQL 与 Spark SQL 写法的异同,理解底层执行'],
    jobs: ['大数据开发工程师', '数据仓库工程师', '实时计算工程师']
  },
  'data-mining': {
    year: '大二', type: '核心课', cls: 'y2', title: '数据挖掘技术与应用',
    desc: '从数据中挖掘规律与价值:分类、聚类、回归、关联分析等常用算法与建模流程,入门机器学习在真实业务中的应用。',
    points: ['数据挖掘基本流程:数据→特征→模型→评估', '分类算法:决策树、KNN、朴素贝叶斯', '聚类算法:K-Means 及应用场景', '回归预测与关联规则挖掘', 'scikit-learn 建模实战'],
    tips: ['先用可视化理解数据,再上模型,不要一上来就调参', '每个算法搞清楚"适合什么场景"比记公式更重要'],
    jobs: ['数据分析师', '数据挖掘工程师', 'AI 数据工程方向']
  },
  'hadoop': {
    year: '大二', type: '核心课', cls: 'y2', title: 'Hadoop 大数据生态技术与应用',
    desc: '大数据技术体系的基石:HDFS 分布式存储、MapReduce 分布式计算与 YARN 资源调度,理解大数据平台的底层架构与运行机制。',
    points: ['HDFS 架构与分布式存储原理', 'MapReduce 计算模型与执行流程', 'YARN 资源调度机制', 'Hadoop 集群部署与环境搭建', '生态组件(Hive/HBase 等)与 Hadoop 的配合'],
    tips: ['亲手搭一套伪分布式环境,报错越多收获越大', '结合 Hadoop 原理去理解 Spark 为什么更快'],
    jobs: ['大数据开发工程师', '大数据运维工程师', '数据仓库工程师']
  },
  'practice': {
    year: '大三', type: '实践课', cls: 'y3', title: '实践实习',
    desc: '走进企业真实岗位顶岗实习,同步开展综合项目实战与毕业设计:把三年所学对接产业需求,积累经验、打磨作品,多数同学由此拿到转正 offer。',
    points: ['顶岗实习:进入企业真实项目与工作流程', '综合项目实战:采集→分析→可视化完整闭环', '毕业设计:独立完成课题与答辩', '简历打磨与面试准备', '求职/专升本双线规划'],
    tips: ['实习期多问多记,主动承担任务积累作品与评价', '提前半年准备简历与目标公司清单'],
    jobs: ['直接对口就业方向', '专升本深造', '校招/实习转正']
  }
};

/* ---------- 课程详情页渲染 ---------- */
(function initCoursePage() {
  const box = document.getElementById('course-detail');
  if (!box) return;

  const id = new URLSearchParams(location.search).get('id');
  const c = COURSE_DATA[id];

  if (!c) {
    box.innerHTML = `
      <div class="cd-card cd-missing">
        <h1>没有找到这门课程</h1>
        <p>课程链接可能有误,请从课程体系页重新选择。</p>
        <a class="btn btn-primary" href="index.html#courses">返回课程体系</a>
      </div>`;
    return;
  }

  const idx = COURSE_ORDER.indexOf(id);
  const prevId = idx > 0 ? COURSE_ORDER[idx - 1] : null;
  const nextId = idx < COURSE_ORDER.length - 1 ? COURSE_ORDER[idx + 1] : null;
  const prev = prevId ? COURSE_DATA[prevId] : null;
  const next = nextId ? COURSE_DATA[nextId] : null;

  box.innerHTML = `
    <a class="cd-back" href="index.html#courses">← 返回课程体系</a>
    <div class="cd-card">
      <div class="cd-head">
        <span class="course-year ${c.cls}">${c.year}</span>
        <span class="course-type">${c.type}</span>
      </div>
      <h1 class="cd-title">${c.title}</h1>
      <p class="cd-desc">${c.desc}</p>
      <div class="cd-grid">
        <div class="cd-block">
          <h2>学习内容</h2>
          <ul class="cd-points">
            ${c.points.map(p => `<li>${p}</li>`).join('')}
          </ul>
        </div>
        <div class="cd-side">
          <div class="cd-block">
            <h2>学习建议</h2>
            <ul class="cd-tips">
              ${c.tips.map(t => `<li>${t}</li>`).join('')}
            </ul>
          </div>
          <div class="cd-block">
            <h2>关联岗位</h2>
            <div class="cd-jobs">${c.jobs.map(j => `<span>${j}</span>`).join('')}</div>
          </div>
        </div>
      </div>
      <div class="cd-nav">
        ${prev
          ? `<a class="cd-nav-btn" href="course.html?id=${prevId}"><em>上一门</em><strong>${prev.title}</strong></a>`
          : '<span></span>'}
        ${next
          ? `<a class="cd-nav-btn cd-next" href="course.html?id=${nextId}"><em>下一门</em><strong>${next.title}</strong></a>`
          : '<span></span>'}
      </div>
    </div>`;

  document.title = c.title + ' | 大数据技术专业认知平台';
})();
