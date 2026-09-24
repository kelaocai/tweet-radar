// background.js —— 唯一持有 TYPESAFE key、唯一访问 api.typesafe.ai 的地方。
// content.js 只把抽取到的帖子文本发过来，这里组装 Jev 请求、退避重试、把概率发回去。
// 判断逻辑（state / instructions / criteria 写法）与 api/x_jev_search.py 保持同一套。
// Community-maintained open-source project

const jevEndpoint = "https://api.typesafe.ai/v1/systemone";
const jevModel = "jev-latest";

const DEFAULTS = {
  goal: "",
  profile: "",
  apiKey: "",
  enabled: true,
  batchSize: 12,
  batchIdleMs: 1500,
  batchMinFlush: 8,
  maxPerPage: 60,
  hiThreshold: 0.8,
  midThreshold: 0.6,
  dimThreshold: 0.35,
  rankMinNoul: 0.5,
  rankMaxPosts: 12,
  textMaxChars: 400,
  summaryChars: 60,
};

chrome.action.onClicked.addListener(() => chrome.runtime.openOptionsPage());

async function getSettings() {
  const stored = await chrome.storage.local.get(Object.keys(DEFAULTS));
  return { ...DEFAULTS, ...stored };
}

// API 会拒绝非法 Unicode：去掉孤立代理项（被 slice 切断的半个 emoji）和控制字符
function clean(s) {
  return String(s || "")
    .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
}

function makeSubject(s) {
  return {
    goal: clean(s.goal),
    profile: clean(s.profile),
    reject:
      "纯转发或引流营销、情绪化表达没有实质内容、只是关键词重叠但不服务于 goal、无法核实的夸大宣称、加密货币或课程推销",
  };
}

function summaryOf(p, n) {
  return `${p.author}：${[...p.text].slice(0, n).join("")}`; // 按码点截断，不切断 emoji
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function jevCall(apiKey, state, questions) {
  const body = JSON.stringify({ state, model: jevModel, questions });
  for (let attempt = 0; attempt < 4; attempt++) {
    const resp = await fetch(jevEndpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body,
    });
    if (resp.ok) return resp.json();
    if ([429, 503, 529].includes(resp.status) && attempt < 3) {
      await sleep(1000 * 2 ** attempt);
      continue;
    }
    const detail = (await resp.text()).slice(0, 300);
    throw new Error(`Jev HTTP ${resp.status}: ${detail}`);
  }
  throw new Error("Jev 不可用");
}

// 粗筛：每帖一个 noul。posts: [{id, author, text, metrics}]
async function judge(posts, s) {
  const state = {
    judgment_subject: makeSubject(s),
    posts: posts.map((p, i) => ({ id: `p${i}`, author: clean(p.author), text: clean(p.text), metrics: p.metrics })),
  };
  const questions = {};
  posts.forEach((p, i) => {
    questions[`c${i}`] = {
      type: "noul",
      instructions:
        `判断 \`posts[${i}]\`（${summaryOf(p, s.summaryChars)}）这条帖子，` +
        "对 `judgment_subject.profile` 描述的这个人、为了 `judgment_subject.goal` 这个目的，" +
        "是否属于「直接相关且有实质内容、值得点开细读」。" +
        "命中 `judgment_subject.reject` 里任何一条则不成立。",
    };
  });
  const out = await jevCall(s.apiKey, state, questions);
  const results = {};
  posts.forEach((p, i) => {
    results[p.id] = out.answers[`c${i}`].noul;
  });
  return { results, usage: out.usage };
}

// 最佳匹配：两两 choice，代码累加。posts 已经是 noul>=阈值、最多 rankMaxPosts 条。
async function rank(posts, s) {
  const state = {
    judgment_subject: makeSubject(s),
    posts: posts.map((p, i) => ({ id: `p${i}`, author: clean(p.author), text: clean(p.text), metrics: p.metrics })),
  };
  const questions = {};
  const pairs = [];
  for (let i = 0; i < posts.length; i++) {
    for (let j = i + 1; j < posts.length; j++) {
      const qid = `f${pairs.length}`;
      pairs.push([i, j]);
      questions[qid] = {
        type: "choice",
        instructions:
          "对 `judgment_subject.profile` 描述的这个人、为了 `judgment_subject.goal`，" +
          `比较 \`posts[${i}]\` 和 \`posts[${j}]\` 这两条帖子，哪一条更值得作为最终推荐？` +
          "只看对目标的实质贡献，不看粉丝数和热度。",
        criteria: {
          A: `\`posts[${i}]\` ${summaryOf(posts[i], s.summaryChars)}`,
          B: `\`posts[${j}]\` ${summaryOf(posts[j], s.summaryChars)}`,
          equal: "两条对目标的价值相当，难分高下",
        },
      };
    }
  }
  const out = await jevCall(s.apiKey, state, questions);
  const total = new Array(posts.length).fill(0);
  pairs.forEach(([i, j], k) => {
    const pr = out.answers[`f${k}`].probabilities || {};
    total[i] += (pr.A || 0) + (pr.equal || 0) / 2;
    total[j] += (pr.B || 0) + (pr.equal || 0) / 2;
  });
  const scores = {};
  posts.forEach((p, i) => {
    scores[p.id] = { score: total[i], max: posts.length - 1 };
  });
  return { scores, pairs: pairs.length, usage: out.usage };
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  (async () => {
    const s = await getSettings();
    if (msg.type === "openOptions") {
      chrome.runtime.openOptionsPage();
      return {};
    }
    if (msg.type === "settings") return { settings: { ...s, apiKey: s.apiKey ? "set" : "" } };
    if ((msg.type === "judge" || msg.type === "rank") && !s.enabled) throw new Error("自动判断已关闭");
    if (!s.apiKey) throw new Error("未设置 TYPESAFE_API_KEY，请打开插件选项页");
    if (!s.goal || !s.profile) throw new Error("未设置目标或判断主体，请打开插件选项页");
    if (msg.type === "judge") return judge(msg.posts.slice(0, s.batchSize), s);
    if (msg.type === "rank") return rank(msg.posts.slice(0, s.rankMaxPosts), s);
    throw new Error(`未知消息 ${msg.type}`);
  })()
    .then((data) => sendResponse({ ok: true, ...data }))
    .catch((e) => sendResponse({ ok: false, error: String(e.message || e) }));
  return true; // 异步回复
});
