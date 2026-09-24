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
  let rankInFlight = false;
  let criteriaRevision = 0;
  let currentPath = location.pathname;

  // ---------- 面板 ----------
  const panel = document.createElement("div");
  panel.className = "xjev-panel";
  panel.innerHTML = `
    <div class="xjev-panel-header">
      <span class="xjev-brand-icon" aria-hidden="true">
        <svg viewBox="0 0 40 40" focusable="false">
          <circle cx="20" cy="20" r="15" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="76 18" transform="rotate(-42 20 20)" />
          <circle cx="20" cy="20" r="8" fill="none" stroke="currentColor" stroke-width="3" />
          <circle cx="20" cy="20" r="2.5" fill="currentColor" />
          <path d="M20 20 31 9m-5 0h5v5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
      <div class="xjev-brand-copy">
        <div class="xjev-panel-title">推文雷达 <span class="xjev-beta">Beta</span></div>
        <div class="xjev-panel-subtitle">按你的标准，发现更值得看的内容</div>
      </div>
      <div class="xjev-panel-tools">
        <button class="xjev-icon-btn xjev-opts" type="button" aria-label="设置规则" title="设置规则">
          <svg class="xjev-settings-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
        <button class="xjev-icon-btn xjev-close" type="button" aria-label="收起面板" title="收起面板">×</button>
      </div>
    </div>
    <div class="xjev-panel-steps">
      <section class="xjev-step">
        <span class="xjev-step-number">1</span>
        <div class="xjev-step-copy">
          <strong>设置阅读目标与判断标准</strong>
          <span>写下关注目标、判断角度和排除条件</span>
        </div>
        <button class="xjev-btn xjev-opts" type="button">设置规则</button>
      </section>
      <section class="xjev-step">
        <span class="xjev-step-number">2</span>
        <div class="xjev-step-copy">
          <strong>分析已加载的帖子</strong>
          <span>启用后自动判断新帖，也可手动检查当前页</span>
        </div>
        <button class="xjev-btn xjev-primary" type="button">检查新帖</button>
      </section>
      <section class="xjev-step xjev-step-legend">
        <span class="xjev-step-number">3</span>
        <div class="xjev-step-copy">
          <strong>高亮值得优先阅读的内容</strong>
          <span>不同颜色标记相关性，快速识别重点</span>
          <div class="xjev-legend">
            <span><i class="xjev-legend-dot xjev-dot-high"></i>高度相关</span>
            <span><i class="xjev-legend-dot xjev-dot-mid"></i>中度相关</span>
            <span><i class="xjev-legend-dot xjev-dot-low"></i>相关性较低</span>
          </div>
        </div>
      </section>
    </div>
    <div class="xjev-panel-ranking">
      <div class="xjev-ranking-copy">
        <strong>可选：最佳匹配前三</strong>
        <span class="xjev-rank-hint">等待已判断的帖子</span>
      </div>
      <button class="xjev-btn xjev-rank" type="button" disabled>最佳匹配前三</button>
    </div>
    <div class="xjev-panel-footer">
      <div class="xjev-panel-status" aria-live="polite"></div>
      <button class="xjev-btn xjev-resume" type="button" hidden>继续判断</button>
    </div>`;
  document.documentElement.appendChild(panel);
  const reopenButton = document.createElement("button");
  reopenButton.className = "xjev-reopen";
  reopenButton.type = "button";
  reopenButton.title = "打开推文雷达";
  reopenButton.setAttribute("aria-label", "打开推文雷达");
  reopenButton.hidden = true;
  reopenButton.innerHTML = `<svg viewBox="3 3 34 34" aria-hidden="true"><circle cx="20" cy="20" r="15" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="76 18" transform="rotate(-42 20 20)"/><circle cx="20" cy="20" r="8" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="20" cy="20" r="2.5" fill="currentColor"/><path d="M20 20 31 9m-5 0h5v5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  document.documentElement.appendChild(reopenButton);
  const statusEl = panel.querySelector(".xjev-panel-status");
  const resumeBtn = panel.querySelector(".xjev-resume");
  const primaryBtn = panel.querySelector(".xjev-primary");
  const rankBtn = panel.querySelector(".xjev-rank");
  const rankHint = panel.querySelector(".xjev-rank-hint");
  panel.querySelectorAll(".xjev-opts").forEach((button) => {
    button.onclick = async () => {
      try {
        const resp = await chrome.runtime.sendMessage({ type: "openOptions" });
        if (!resp || !resp.ok) throw new Error(resp ? resp.error : "无响应");
      } catch (e) {
        setStatus(`无法打开设置：${e.message}；请刷新本页后重试`);
      }
    };
  });
  panel.querySelector(".xjev-close").onclick = () => {
    panel.hidden = true;
    reopenButton.hidden = false;
  };
  reopenButton.onclick = () => {
    panel.hidden = false;
    reopenButton.hidden = true;
  };
  primaryBtn.onclick = () => {
    if (!settings) return setStatus("正在读取设置，请稍后再试");
    if (!settings.apiKey) return setStatus("请先在设置中填写 TypeSafe API key");
    if (!settings.goal || !settings.profile) return setStatus("请先设置目标与判断主体");
    if (!settings.enabled) return setStatus("请先在设置中启用自动判断");
    if (paused) return setStatus(`已达本页上限 ${settings.maxPerPage} 条，请点击“继续判断”`);
    const added = scan();
    if (paused) return;
    if (added === 0 && !inflight && queue.length === 0) {
      setStatus("当前没有新帖子；向下滚动加载后会自动判断");
    } else if (added > 0 && !inflight) {
      setStatus(`已发现 ${added} 条新帖，等待批量判断`);
    }
  };
  rankBtn.onclick = rankPage;
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
      badge.setAttribute("role", "img");
      const icon = document.createElement("span");
      icon.className = "xjev-badge-icon";
      icon.setAttribute("aria-hidden", "true");
      const value = document.createElement("span");
      value.className = "xjev-badge-value";
      badge.append(icon, value);
      article.style.position = article.style.position || "relative";
      article.appendChild(badge);
    }
    const level = p >= settings.hiThreshold ? "high" : p >= settings.midThreshold ? "mid" : "low";
    const levelLabel = level === "high" ? "高度相关" : level === "mid" ? "中度相关" : "相关性较低";
    const icon = badge.querySelector(".xjev-badge-icon");
    icon.textContent = level === "high" ? "✓" : level === "mid" ? "!" : "·";
    badge.querySelector(".xjev-badge-value").textContent = `${entry.rank ? `#${entry.rank} ` : ""}${Math.round(p * 100)}%`;
    badge.title = entry.rank
      ? `最佳匹配第 ${entry.rank} 名（配对得分 ${entry.score.toFixed(2)}/${entry.max}），初步匹配概率 ${p.toFixed(2)}`
      : `与目标相关且值得读的概率 ${p.toFixed(2)}`;
    badge.setAttribute("aria-label", `${levelLabel}，置信度 ${Math.round(p * 100)}%${entry.rank ? `，最佳匹配第 ${entry.rank} 名` : ""}`);
    badge.classList.remove("xjev-badge-high", "xjev-badge-mid", "xjev-badge-low", "xjev-badge-rank");
    badge.classList.add(`xjev-badge-${level}`);
    if (entry.rank) badge.classList.add("xjev-badge-rank");
  }

  // ---------- 批处理 ----------
  function scan() {
    if (!settings || !settings.enabled || !settings.goal || !settings.profile || !settings.apiKey || paused) return 0;
    let added = 0;
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
      added++;
    }
    updateRankAvailability();
    schedule();
    return added;
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
    const revision = criteriaRevision;
    setStatus(`判断中：${batch.length} 条（本页已判 ${judgedThisPage}）`);
    try {
      const resp = await chrome.runtime.sendMessage({ type: "judge", posts: batch });
      if (revision !== criteriaRevision) return;
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
      updateRankAvailability();
      const u = resp.usage || {};
      setStatus(`本页已判 ${judgedThisPage} 条，本批 tokens ${u.input_tokens || 0}/${u.output_tokens || 0}`);
    } catch (e) {
      if (revision !== criteriaRevision) return;
      setStatus(`出错：${e.message}`);
      batch.forEach((p) => queued.delete(p.id)); // 允许下次重试
      for (const p of batch) {
        const a = document.querySelector(`[data-xjev-id="${p.id}"]`);
        if (a) delete a.dataset.xjevSeen;
      }
    } finally {
      if (revision === criteriaRevision) batch.forEach((p) => queued.delete(p.id));
      inflight = false;
      if (queue.length) schedule();
    }
  }

  // ---------- 候选两两比较，选出最多三条最佳匹配 ----------
  function currentRankCandidates() {
    if (!settings) return [];
    const ids = new Set(
      [...document.querySelectorAll(SELECTORS.article)]
        .map((article) => article.dataset.xjevId)
        .filter(Boolean)
    );
    return [...ids]
      .map((id) => cache.get(id))
      .filter((entry) => entry && entry.noul >= settings.rankMinNoul)
      .sort((a, b) => b.noul - a.noul)
      .slice(0, settings.rankMaxPosts);
  }

  function updateRankAvailability() {
    if (!settings || !settings.goal || !settings.profile || !settings.apiKey || !settings.enabled) {
      rankBtn.disabled = true;
      rankHint.textContent = "先在设置中填写目标、判断主体和 API key，并启用判断";
      return;
    }
    const count = currentRankCandidates().length;
    rankBtn.disabled = rankInFlight || count < 2;
    rankHint.textContent = rankInFlight
      ? "正在比较候选帖子…"
      : count < 2
        ? `当前有 ${count} 条入围候选；至少需要 2 条（阈值 ${Math.round(settings.rankMinNoul * 100)}%）`
        : `将比较 ${count} 条入围候选，共 ${(count * (count - 1)) / 2} 对；会额外消耗 tokens`;
  }

  async function rankPage() {
    if (rankInFlight || !settings || !settings.enabled) return;
    const candidates = currentRankCandidates().map((entry) => entry.post);
    if (candidates.length < 2) {
      updateRankAvailability();
      return setStatus("入围候选不足 2 条，请先浏览并判断更多帖子");
    }
    const pairs = (candidates.length * (candidates.length - 1)) / 2;
    const revision = criteriaRevision;
    rankInFlight = true;
    rankBtn.textContent = "比较中…";
    updateRankAvailability();
    setStatus(`正在比较 ${candidates.length} 条候选，共 ${pairs} 对`);
    try {
      const resp = await chrome.runtime.sendMessage({ type: "rank", posts: candidates });
      if (revision !== criteriaRevision) return;
      if (!resp || !resp.ok) throw new Error(resp ? resp.error : "无响应");
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
      console.info("[xjev] 最佳匹配结果", ordered.map(([id, s]) => ({ id, ...s, url: cache.get(id)?.post.url })));
    } catch (e) {
      if (revision === criteriaRevision) setStatus(`比较失败：${e.message}`);
    } finally {
      rankInFlight = false;
      rankBtn.textContent = "最佳匹配前三";
      updateRankAvailability();
    }
  }

  // 比较完成后，把最多三条结果渲染成可点击的名字：点击跳到该帖锚点。
  function renderRankedTop(topEntries) {
    statusEl.textContent = "最佳匹配结果：";
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

  function resetJudgments() {
    criteriaRevision++;
    cache.clear();
    queue.length = 0;
    queued.clear();
    clearTimeout(idleTimer);
    judgedThisPage = 0;
    paused = false;
    resumeBtn.hidden = true;
    clearDecorations();
    for (const article of document.querySelectorAll(SELECTORS.article)) {
      delete article.dataset.xjevSeen;
      delete article.dataset.xjevId;
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
    const previous = settings;
    settings = resp && resp.settings;
    if (!settings) return;
    if (previous && (previous.goal !== settings.goal || previous.profile !== settings.profile || previous.enabled !== settings.enabled)) {
      resetJudgments();
    }
    if (!settings.enabled || !settings.goal || !settings.profile) clearDecorations();
    else for (const article of document.querySelectorAll(SELECTORS.article)) {
      const entry = cache.get(article.dataset.xjevId);
      if (entry) decorate(article, entry);
    }
    updateRankAvailability();
    if (!settings.enabled) setStatus("自动判断已关闭，正常浏览中");
    else if (!settings.apiKey) setStatus("请在设置里填写 TYPESAFE_API_KEY");
    else if (!settings.goal) setStatus("未在研判：目标为空，正常浏览中");
    else if (!settings.profile) setStatus("请先设置判断主体");
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
      updateRankAvailability();
    }
    scan();
  });

  loadSettings().then(() => {
    observer.observe(document.body, { childList: true, subtree: true });
    scan();
  });
})();
