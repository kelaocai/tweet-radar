// options.js —— 读写 chrome.storage.local。字段名与 background.js 的 DEFAULTS 一致。
const DEFAULTS = {
  goal: "", profile: "", apiKey: "", enabled: true,
  batchSize: 12, batchIdleMs: 1500, batchMinFlush: 8, maxPerPage: 60,
  hiThreshold: 0.8, midThreshold: 0.6, dimThreshold: 0.35,
  rankMinNoul: 0.5, rankMaxPosts: 12,
};
const NUMERIC = ["batchSize", "batchIdleMs", "batchMinFlush", "maxPerPage", "hiThreshold", "midThreshold", "dimThreshold", "rankMinNoul", "rankMaxPosts"];
const HISTORY_KEY = "judgmentHistory";
const HISTORY_MAX = 50;

async function load() {
  const s = { ...DEFAULTS, ...(await chrome.storage.local.get(Object.keys(DEFAULTS))) };
  for (const k of Object.keys(DEFAULTS)) {
    const el = document.getElementById(k);
    if (!el) continue;
    if (el.type === "checkbox") el.checked = !!s[k];
    else el.value = s[k];
  }
}

async function save({ overrides = {}, history, message = "已保存" } = {}) {
  const out = {};
  for (const k of Object.keys(DEFAULTS)) {
    const el = document.getElementById(k);
    if (!el) continue;
    if (el.type === "checkbox") out[k] = el.checked;
    else if (NUMERIC.includes(k)) out[k] = Number(el.value);
    else out[k] = el.value.trim();
  }
  Object.assign(out, overrides);
  if (out.midThreshold > out.hiThreshold) out.midThreshold = out.hiThreshold;
  const msg = document.getElementById("msg");
  try {
    await chrome.storage.local.set(history === undefined ? out : { ...out, [HISTORY_KEY]: history });
  } catch (e) {
    msg.textContent = `保存失败：${e.message}`;
    return false;
  }
  for (const [key, value] of Object.entries(overrides)) {
    const el = document.getElementById(key);
    if (!el) continue;
    if (el.type === "checkbox") el.checked = !!value;
    else el.value = value;
  }
  msg.textContent = message;
  setTimeout(() => {
    if (msg.textContent === message) msg.textContent = "";
  }, 2500);
  return true;
}

document.getElementById("save").addEventListener("click", () => save());

// ---------- 历史研判记录 ----------
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
      await save({
        overrides: { goal: item.goal, profile: item.profile, enabled: true },
        message: "已恢复并开启自动判断",
      });
    };
    div.querySelector(".del").onclick = async () => {
      list.splice(i, 1);
      await chrome.storage.local.set({ [HISTORY_KEY]: list });
    };
    box.appendChild(div);
  });
}

document.getElementById("clear").addEventListener("click", async () => {
  const goal = document.getElementById("goal").value.trim();
  const profile = document.getElementById("profile").value.trim();
  const list = await getHistory();
  if ((goal || profile) && !list.some((h) => h.goal === goal && h.profile === profile)) {
    list.unshift({ goal, profile, at: Date.now() });
  }
  await save({
    overrides: { goal: "", profile: "", enabled: false },
    history: list.slice(0, HISTORY_MAX),
    message: "已清空并关闭自动判断",
  });
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") return;
  for (const key of Object.keys(DEFAULTS)) {
    if (!changes[key]) continue;
    const el = document.getElementById(key);
    if (!el) continue;
    if (el.type === "checkbox") el.checked = !!changes[key].newValue;
    else el.value = changes[key].newValue ?? DEFAULTS[key];
  }
  if (changes[HISTORY_KEY]) renderHistory();
});

const startupActions = [document.getElementById("save"), document.getElementById("clear")];
startupActions.forEach((button) => { button.disabled = true; });
load()
  .then(renderHistory)
  .catch((e) => { document.getElementById("msg").textContent = `读取设置失败：${e.message}`; })
  .finally(() => { startupActions.forEach((button) => { button.disabled = false; }); });
