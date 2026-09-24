// options.js —— 读写 chrome.storage.local。字段名与 background.js 的 DEFAULTS 一致。
const DEFAULTS = {
  goal: "", profile: "", apiKey: "", enabled: true,
  batchSize: 12, batchIdleMs: 1500, batchMinFlush: 8, maxPerPage: 60,
  hiThreshold: 0.8, midThreshold: 0.6, dimThreshold: 0.35,
  rankMinNoul: 0.5, rankMaxPosts: 12,
};
const NUMERIC = ["batchSize", "batchIdleMs", "batchMinFlush", "maxPerPage", "hiThreshold", "midThreshold", "dimThreshold", "rankMinNoul", "rankMaxPosts"];

async function load() {
  const s = { ...DEFAULTS, ...(await chrome.storage.local.get(Object.keys(DEFAULTS))) };
  for (const k of Object.keys(DEFAULTS)) {
    const el = document.getElementById(k);
    if (!el) continue;
    if (el.type === "checkbox") el.checked = !!s[k];
    else el.value = s[k];
  }
}

async function save() {
  const out = {};
  for (const k of Object.keys(DEFAULTS)) {
    const el = document.getElementById(k);
    if (!el) continue;
    if (el.type === "checkbox") out[k] = el.checked;
    else if (NUMERIC.includes(k)) out[k] = Number(el.value);
    else out[k] = el.value.trim();
  }
  if (out.midThreshold > out.hiThreshold) out.midThreshold = out.hiThreshold;
  await chrome.storage.local.set(out);
  const msg = document.getElementById("msg");
  msg.textContent = "已保存";
  setTimeout(() => (msg.textContent = ""), 1500);
}

document.getElementById("save").addEventListener("click", save);

// ---------- 历史研判记录 ----------
const HISTORY_KEY = "judgmentHistory";
const HISTORY_MAX = 50;

async function getHistory() {
  const stored = await chrome.storage.local.get(HISTORY_KEY);
  return stored[HISTORY_KEY] || [];
}

async function renderHistory() {
  const list = await getHistory();
  const box = document.getElementById("history");
  box.textContent = "";
  if (!list.length) {
    box.innerHTML = '<p class="hist-empty">暂无记录</p>';
    return;
  }
  list.forEach((item, i) => {
    const div = document.createElement("div");
    div.className = "hist-item";
    div.innerHTML = `
      <div class="hist-goal"></div>
      <div class="hist-profile"></div>
      <div class="hist-time">${new Date(item.at).toLocaleString()}</div>
      <div class="hist-actions">
        <button type="button" class="restore">恢复</button>
        <button type="button" class="del">删除</button>
      </div>`;
    div.querySelector(".hist-goal").textContent = item.goal.slice(0, 60) || "（空目标）";
    div.querySelector(".hist-profile").textContent = item.profile.slice(0, 60);
    div.querySelector(".restore").onclick = async () => {
      document.getElementById("goal").value = item.goal;
      document.getElementById("profile").value = item.profile;
      await save();
    };
    div.querySelector(".del").onclick = async () => {
      list.splice(i, 1);
      await chrome.storage.local.set({ [HISTORY_KEY]: list });
      renderHistory();
    };
    box.appendChild(div);
  });
}

document.getElementById("clear").addEventListener("click", async () => {
  const goal = document.getElementById("goal").value.trim();
  const profile = document.getElementById("profile").value.trim();
  if (goal || profile) {
    const list = await getHistory();
    if (!list.some((h) => h.goal === goal && h.profile === profile)) {
      list.unshift({ goal, profile, at: Date.now() });
      await chrome.storage.local.set({ [HISTORY_KEY]: list.slice(0, HISTORY_MAX) });
    }
  }
  document.getElementById("goal").value = "";
  document.getElementById("profile").value = "";
  await save();
  renderHistory();
});

load();
renderHistory();
