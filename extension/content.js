// content.js —— 只读当前页面 DOM，把用户滚到视野里的帖子攒成批，交给 background 判断，然后高亮。
// 不自动滚动、不自动点开帖子、不向 X 发任何请求。
// X 改版时通常只需改下面 SELECTORS 里的几个选择器。
// Community-maintained open-source project

(() => {
  const SELECTORS = {
    article: 'article[data-testid="tweet"]',
    text: '[data-testid="tweetText"]',
    user: '[data-testid="User-Name"]',
    statusLink: 'a[href*="/status/"]',
    reply: '[data-testid="reply"]',
    repost: '[data-testid="retweet"]',
    like: '[data-testid="like"]',
  };

  let settings = null;
  const cache = new Map(); // id -> {noul, rank?, post}
  const queue = [];
  const queued = new Set();
  let idleTimer = null;
  let judgedThisPage = 0;
  let paused = false;
  let inflight = false;
  let currentPath = location.pathname;

  // ---------- 面板 ----------
  const panel = document.createElement("div");
  panel.className = "xjev-panel";
  panel.innerHTML = `
    <div class="xjev-panel-title">推文雷达</div>
    <div class="xjev-panel-status"></div>
    <div class="xjev-panel-actions">
      <button class="xjev-btn xjev-rank">精排本页</button>
      <button class="xjev-btn xjev-resume" hidden>继续判断</button>
      <button class="xjev-btn xjev-opts">设置</button>
    </div>`;
  document.documentElement.appendChild(panel);
  const statusEl = panel.querySelector(".xjev-panel-status");
  const resumeBtn = panel.querySelector(".xjev-resume");
  panel.querySelector(".xjev-opts").onclick = () => chrome.runtime.sendMessage({ type: "openOptions" });
  panel.querySelector(".xjev-rank").onclick = rankPage;
  resumeBtn.onclick = () => {
    paused = false;
    judgedThisPage = 0;
    resumeBtn.hidden = true;
    setStatus("已重置上限，继续判断");
    scan();
  };

  function setStatus(msg) {
    statusEl.textContent = msg;
  }

  // ---------- 抽取 ----------
  function parseCount(el) {
    if (!el) return 0;
    const label = el.getAttribute("aria-label") || "";
    const m = label.replace(/,/g, "").match(/(\d+(?:\.\d+)?)\s*([KkMm万]?)/);
    if (!m) return 0;
    let n = parseFloat(m[1]);
    const unit = m[2];
    if (/k/i.test(unit)) n *= 1e3;
    else if (/m/i.test(unit)) n *= 1e6;
    else if (unit === "万") n *= 1e4;
    return Math.round(n);
  }

  function extract(article) {
    const link = [...article.querySelectorAll(SELECTORS.statusLink)].find((a) => /\/status\/\d+/.test(a.getAttribute("href") || "") && a.querySelector("time"))
      || article.querySelector(SELECTORS.statusLink);
    const href = link ? link.getAttribute("href") : "";
    const idMatch = href.match(/\/status\/(\d+)/);
    const textEl = article.querySelector(SELECTORS.text);
    const text = (textEl ? textEl.innerText : "").replace(/\s+/g, " ").trim();
    if (!text) return null;
    const id = idMatch ? idMatch[1] : "h" + hash(text);
    const userEl = article.querySelector(SELECTORS.user);
    const handle = userEl ? (userEl.innerText.match(/@\w+/) || ["@unknown"])[0] : "@unknown";
    return {
      id,
      author: handle,
      url: idMatch ? `https://x.com${href.split("?")[0]}` : location.href,
      text: [...text].slice(0, settings.textMaxChars).join(""),
      metrics: {
        replies: parseCount(article.querySelector(SELECTORS.reply)),
        reposts: parseCount(article.querySelector(SELECTORS.repost)),
        likes: parseCount(article.querySelector(SELECTORS.like)),
      },
    };
  }

  function hash(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return (h >>> 0).toString(36);
  }

  // ---------- 装饰 ----------
  function decorate(article, entry) {
    article.classList.remove("xjev-hi", "xjev-mid", "xjev-dim");
    const p = entry.noul;
    if (p >= settings.hiThreshold) article.classList.add("xjev-hi");
    else if (p >= settings.midThreshold) article.classList.add("xjev-mid");
    else if (p < settings.dimThreshold) article.classList.add("xjev-dim");

    let badge = article.querySelector(".xjev-badge");
    if (!badge) {
      badge = document.createElement("div");
      badge.className = "xjev-badge";
      article.style.position = article.style.position || "relative";
      article.appendChild(badge);
    }
    badge.textContent = (entry.rank ? `#${entry.rank}  ` : "") + p.toFixed(2);
    badge.title = entry.rank
      ? `精排第 ${entry.rank} 名（配对得分 ${entry.score.toFixed(2)}/${entry.max}），粗筛概率 ${p.toFixed(2)}`
      : `与目标相关且值得读的概率 ${p.toFixed(2)}`;
    badge.classList.toggle("xjev-badge-rank", !!entry.rank);
  }

  // ---------- 批处理 ----------
  function scan() {
    if (!settings || !settings.enabled || !settings.goal || !settings.profile || !settings.apiKey || paused) return;
    for (const article of document.querySelectorAll(SELECTORS.article)) {
      if (article.dataset.xjevSeen) {
        const e = cache.get(article.dataset.xjevId);
        if (e && !article.querySelector(".xjev-badge")) decorate(article, e); // X 重绘后补回装饰
        continue;
      }
      const post = extract(article);
      if (!post) continue;
      article.dataset.xjevSeen = "1";
      article.dataset.xjevId = post.id;
      const hit = cache.get(post.id);
      if (hit) {
        decorate(article, hit);
        continue;
      }
      if (queued.has(post.id)) continue;
      if (judgedThisPage + queue.length >= settings.maxPerPage) {
        paused = true;
        resumeBtn.hidden = false;
        setStatus(`已达本页上限 ${settings.maxPerPage} 条，点击“继续判断”放行`);
        break;
      }
      queued.add(post.id);
      queue.push(post);
    }
    schedule();
  }

  function schedule() {
    if (queue.length === 0) return;
    if (queue.length >= settings.batchMinFlush) return flush();
    clearTimeout(idleTimer);
    idleTimer = setTimeout(flush, settings.batchIdleMs);
  }

  async function flush() {
    clearTimeout(idleTimer);
    if (inflight || queue.length === 0) return;
    inflight = true;
    const batch = queue.splice(0, settings.batchSize);
    setStatus(`判断中：${batch.length} 条（本页已判 ${judgedThisPage}）`);
    try {
      const resp = await chrome.runtime.sendMessage({ type: "judge", posts: batch });
      if (!resp || !resp.ok) throw new Error(resp ? resp.error : "无响应");
      for (const p of batch) {
        const noul = resp.results[p.id];
        if (typeof noul !== "number") continue;
        cache.set(p.id, { noul, post: p });
        judgedThisPage++;
      }
      if (settings.goal && settings.profile) { // 批返回时可能已被清空研判
        for (const article of document.querySelectorAll(SELECTORS.article)) {
          const e = cache.get(article.dataset.xjevId);
          if (e) decorate(article, e);
        }
      }
      const u = resp.usage || {};
      setStatus(`本页已判 ${judgedThisPage} 条，本批 tokens ${u.input_tokens || 0}/${u.output_tokens || 0}`);
    } catch (e) {
      setStatus(`出错：${e.message}`);
      batch.forEach((p) => queued.delete(p.id)); // 允许下次重试
      for (const p of batch) {
        const a = document.querySelector(`[data-xjev-id="${p.id}"]`);
        if (a) delete a.dataset.xjevSeen;
      }
    } finally {
      batch.forEach((p) => queued.delete(p.id));
      inflight = false;
      if (queue.length) schedule();
    }
  }

  // ---------- 精排本页 ----------
  async function rankPage() {
    const candidates = [...cache.values()]
      .filter((e) => e.noul >= settings.rankMinNoul)
      .sort((a, b) => b.noul - a.noul)
      .slice(0, settings.rankMaxPosts)
      .map((e) => e.post);
    if (candidates.length < 2) return setStatus("可精排候选不足 2 条（需粗筛概率 >= " + settings.rankMinNoul + "）");
    const pairs = (candidates.length * (candidates.length - 1)) / 2;
    setStatus(`精排中：${candidates.length} 条，${pairs} 对`);
    let resp;
    try {
      resp = await chrome.runtime.sendMessage({ type: "rank", posts: candidates });
    } catch (e) {
      return setStatus(`精排出错：${e.message}（刚重载过扩展？请刷新本页）`);
    }
    if (!resp || !resp.ok) return setStatus(`精排出错：${resp ? resp.error : "无响应"}`);
    for (const e of cache.values()) delete e.rank;
    const ordered = Object.entries(resp.scores).sort((a, b) => b[1].score - a[1].score);
    ordered.forEach(([id, s], i) => {
      const e = cache.get(id);
      if (!e) return;
      e.score = s.score;
      e.max = s.max;
      if (i < 3) e.rank = i + 1;
    });
    for (const article of document.querySelectorAll(SELECTORS.article)) {
      const e = cache.get(article.dataset.xjevId);
      if (e) decorate(article, e);
    }
    renderRankedTop(ordered.slice(0, 3));
    console.info("[xjev] 精排结果", ordered.map(([id, s]) => ({ id, ...s, url: cache.get(id)?.post.url })));
  }

  // 精排完成后，把前三名渲染成可点击的名字：点击跳到该帖锚点。
  function renderRankedTop(topEntries) {
    statusEl.textContent = "精排完成：";
    topEntries.forEach(([id, s], i) => {
      const e = cache.get(id);
      if (!e) return;
      const link = document.createElement("a");
      link.className = "xjev-jump";
      link.textContent = `#${i + 1} ${e.post.author} ${s.score.toFixed(2)}`;
      link.title = `${e.post.text.slice(0, 80)}\n点击跳到这条帖子`;
      link.href = e.post.url;
      link.onclick = (ev) => {
        ev.preventDefault();
        jumpToPost(id, e.post.url);
      };
      statusEl.appendChild(link);
    });
  }

  function jumpToPost(id, url) {
    const article = document.querySelector(`[data-xjev-id="${id}"]`);
    if (!article) {
      window.open(url, "_blank", "noopener"); // 帖子已不在当前 DOM，退化为新标签打开
      return;
    }
    article.scrollIntoView({ behavior: "smooth", block: "center" });
    article.classList.remove("xjev-flash");
    void article.offsetWidth; // 重新触发动画
    article.classList.add("xjev-flash");
  }

  // 清除所有高亮与角标（清空研判 / 停用后恢复正常浏览）
  function clearDecorations() {
    for (const article of document.querySelectorAll(SELECTORS.article)) {
      article.classList.remove("xjev-hi", "xjev-mid", "xjev-dim", "xjev-flash");
      const badge = article.querySelector(".xjev-badge");
      if (badge) badge.remove();
    }
  }

  // ---------- 启动 ----------
  async function loadSettings() {
    let resp;
    try {
      resp = await chrome.runtime.sendMessage({ type: "settings" });
    } catch (e) {
      return setStatus(`与扩展失联：${e.message}（刚重载过扩展？请刷新本页）`);
    }
    settings = resp && resp.settings;
    if (!settings) return;
    if (!settings.goal || !settings.profile) {
      clearDecorations();
      queue.length = 0;
      clearTimeout(idleTimer);
    }
    if (!settings.apiKey) setStatus("请在设置里填写 TYPESAFE_API_KEY");
    else if (!settings.goal) setStatus("未在研判：目标为空，正常浏览中");
    else setStatus(`目标：${settings.goal.slice(0, 40)}`);
  }

  chrome.storage.onChanged.addListener(() => loadSettings().then(scan));

  const observer = new MutationObserver(() => {
    if (location.pathname !== currentPath) {
      // SPA 切页：重置本页计数，保留缓存
      currentPath = location.pathname;
      judgedThisPage = 0;
      paused = false;
      resumeBtn.hidden = true;
    }
    scan();
  });

  loadSettings().then(() => {
    observer.observe(document.body, { childList: true, subtree: true });
    scan();
  });
})();
