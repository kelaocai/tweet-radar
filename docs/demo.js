"use strict";
// Fictional posts and manually assigned demo values. No model calls or user data.
const copy = {
  zh: {seoDescription:"免费 Chrome 扩展，调用 TypeSafe Jev 按你的目标和判断标准筛选 X（Twitter）帖子。内置可复制的中英文判断规则与交互演示；需自备 API key，服务商可能收费。",title:"用自己的标准，<br>筛选 X 帖子。",lead:"用 TypeSafe Jev，在 X 上发现值得读的帖子。免费 Chrome 扩展，也是一起打磨判断规则的开源库。",download:"下载 Chrome 扩展",try:"先看示例效果",requirements:"MIT 开源 · 开发者模式安装 · 实际使用需自备 TypeSafe API key，API 可能收费",demoTitle:"看看不同标准会选出哪些帖子。",demoHint:"切换下方目标，对比同一组帖子在不同规则下的匹配结果。",goalLabel:"目标",profileLabel:"判断主体",copy:"复制目标与判断主体",sampleNote:"交互示例：帖子是虚构的，匹配值预先设定，不调用 API，也不代表 Jev 的实际输出。插件会按你自己的目标重新判断真实页面。",feedTitle:"示例信息流",sampleBadge:"预设演示",startTitle:"把自己的标准带进 X。",step1Title:"下载并加载",step1:"解压安装包，在 chrome://extensions 开启开发者模式，选择“加载已解压的扩展程序”，选中包含 manifest.json 的文件夹。",step2Title:"写下你的标准",step2:"打开设置，分别粘贴目标和判断主体，填写自己的 TypeSafe key，启用自动判断并保存。当前插件界面为中文，英文说明提供按钮对照。",step3Title:"像平常一样浏览",step3:"插件判断已加载帖子，显示图标与百分比。也可额外比较入围帖子，选出最多三条最佳匹配。",guide:"完整安装与操作说明",communityTitle:"一起定义“值得读”。",communityText:"规则可以被复制，也应该被质疑。带来一个场景、一条标准，或一个让规则失效的反例，帮助下一位读者少走弯路。",star:"在 GitHub 收藏与 Star",contribute:"贡献一条规则",privacyTitle:"使用前了解数据流与费用",privacy:"本演示页不读取你的 X 账号、不收集 API key。实际扩展会将已加载帖子的文字、作者标识、互动数及目标/判断主体发送给 TypeSafe API。key 存在本机扩展存储中；API 按服务商规则计费。插件不会自动搜索、滚动或点赞。匹配值不等于事实真实性或准确率。",privacyLink:"隐私与安全说明",footer:"kelaocai 制作的独立社区项目 · MIT · 非 X 或 TypeSafe 官方产品",coffee:"请我喝杯咖啡",copied:"已复制，请分别粘贴到目标和判断主体输入框。",failed:"复制失败，请选中上面的目标和判断主体手动复制。",reason:"规则线索：",example:"示例值"},
  en: {seoDescription:"A free Chrome extension that uses TypeSafe Jev to score loaded X posts against your criteria. Explore reusable prompts and a bilingual sample. Bring your own API key; API charges may apply.",title:"Filter X posts<br>by your own criteria.",lead:"Find posts worth reading on X with TypeSafe Jev. A free Chrome extension and an open library of rules we can improve together.",download:"Download Chrome extension",try:"Explore the sample",requirements:"MIT licensed · Developer mode install · Your own TypeSafe API key required; API charges may apply",demoTitle:"See which posts each rule selects.",demoHint:"Switch goals to compare how different rules match the same posts.",goalLabel:"Goal",profileLabel:"Reader profile",copy:"Copy goal and reader profile",sampleNote:"Interactive illustration: fictional posts and preset scores. No API is called, and these are not Jev results. The extension judges real loaded posts using your own criteria.",feedTitle:"Sample feed",sampleBadge:"Preset illustration",startTitle:"Bring your criteria to X.",step1Title:"Download and load",step1:"Unzip the extension. At chrome://extensions, enable Developer mode and choose Load unpacked. Select the folder that contains manifest.json.",step2Title:"Define what matters",step2:"Open settings, paste the goal and profile into their fields, add your own TypeSafe key, enable automatic judgment, and save. The extension UI is currently Chinese; the English guide translates the controls.",step3Title:"Browse as usual",step3:"The extension marks loaded posts with icons and percentages. Optionally compare eligible posts to get up to three top matches.",guide:"Full installation and usage guide",communityTitle:"What makes a post worth reading?",communityText:"A rule should be reusable and open to challenge. Contribute a reading goal, a criterion, or a counterexample that exposes where a rule fails.",star:"Save and star on GitHub",contribute:"Contribute a rule",privacyTitle:"Data flow and costs",privacy:"This sample does not access your X account or collect an API key. The installed extension sends loaded post text, author handles, engagement counts, and your goal/profile to TypeSafe. Your key is stored in local extension storage; provider API charges may apply. It does not automatically search, scroll, or like posts. A match score is not a measure of truth or accuracy.",privacyLink:"Security and privacy notes",footer:"Independent community project by kelaocai · MIT · Not affiliated with X or TypeSafe",coffee:"Buy me a coffee",copied:"Copied. Paste the goal and profile into their separate fields.",failed:"Could not copy. Select the goal and profile above and copy them manually.",reason:"Rule signal: ",example:"sample value"}
};
const rules = [
  {id:"jev",zh:{name:"Jev 一手实战",goal:"找到 Jev / TypeSafe AI 的一手集成经验，帮助开发者判断哪些任务值得实际尝试。",profile:"需要可复用代码、输入输出样例或明确失败边界的开发者。优先有具体任务、实现过程和限制的内容；降低纯发布转发、无方法的速度宣称和推广帖的权重。"},en:{name:"Jev in practice",goal:"Find first-hand Jev / TypeSafe AI integration reports that help developers decide what to try.",profile:"A developer looking for reusable code, input/output examples, or clear failure boundaries. Prioritize a concrete task, implementation details, and limitations. Downrank announcement reposts, speed claims without a method, and promotions."},scores:[92,28,19],reasons:{zh:["有实现过程，也说明失败边界。","只有宣传性结论，没有测试方法。","有具体需求，但与 Jev 集成无关。"],en:["Implementation details and a failure boundary.","A promotional conclusion without a test method.","A concrete need, but unrelated to Jev integration."]}},
  {id:"pain",zh:{name:"寻找产品需求",goal:"找到个人或团队反复遇到的内容整理问题，用来设计后续用户访谈。",profile:"在研究信息整理工具的独立开发者。优先有实际场景、重复频率和当前替代做法的求助；排除泛泛抱怨、无场景的功能愿望和促销。不把点赞量当需求验证。"},en:{name:"Find product needs",goal:"Find recurring content-organization problems to investigate in user interviews.",profile:"An independent developer researching information tools. Prioritize an actual situation, frequency, and current workaround. Exclude vague complaints, context-free wishlists, and promotions. Likes are not demand validation."},scores:[34,12,91],reasons:{zh:["主要讨论技术实现，用户痛点信息有限。","缺少实际用户场景。","描述了重复任务和当前手工替代方法。"],en:["Mostly implementation detail, with little user context.","No actual user situation.","Describes a recurring task and a manual workaround."]}},
  {id:"evidence",zh:{name:"有依据的技术内容",goal:"找到有可检查依据的技术实践内容，优先阅读能帮助复现或定位问题的帖子。",profile:"重视实现细节和边界的技术读者。要求至少一个具体过程或可检查材料，并说明条件或限制；不以自信语气、名气或互动数代替证据。证据不足时留给人工复核，不推断真实性。"},en:{name:"Evidence in technical posts",goal:"Find technical reports with inspectable evidence that can help reproduce a result or diagnose a problem.",profile:"A technical reader who values implementation details and limits. Look for a concrete process or inspectable material, plus conditions or limitations. Confidence, fame, and engagement are not evidence. Leave unclear claims for human review."},scores:[88,24,63],reasons:{zh:["具体配置与失败输入提供了核查方向。","量化宣称缺少基线与原始材料。","有具体过程，但仍需要补充可核查材料。"],en:["Configuration and failed inputs offer a way to inspect the claim.","The numerical claim has no baseline or source material.","A concrete process, but supporting material is still needed."]}}
];
const posts = [
 {zh:{author:"开发手记 · 虚构样例",text:"把 Jev 接进了书签分类：先定义问题，再按概率分流到人工复核。我整理了请求配置和两组失败输入。短文本还行，缺少上下文的引用容易误判。"},en:{author:"Build notes · Fictional",text:"I added Jev to bookmark triage: define the question, then route uncertain results to human review. I wrote down the request config and two failed inputs. Short text worked better than quotes without context."}},
 {zh:{author:"工具速报 · 虚构样例",text:"这个 AI 工具快了 100 倍！用了就回不去了，所有人都应该立刻上车。"},en:{author:"Tool digest · Fictional",text:"This AI tool is 100× faster! You will never go back. Everyone should switch immediately."}},
 {zh:{author:"工作记录 · 虚构样例",text:"每周都要把收藏的帖子重新复制到表格，手动补标签、删重复，周五再筛选给团队。试过浏览器收藏夹，还是找不到之前存的内容。"},en:{author:"Work notes · Fictional",text:"Every week I copy saved posts into a spreadsheet, add tags, remove duplicates, and pick a team reading list on Friday. Browser bookmarks did not help me find things I had saved."}}
];
const languageOverride = new URLSearchParams(location.search).get("lang");
const isEnglishPage = /\/en\/?$/.test(location.pathname);
let language = languageOverride === "en" || (!languageOverride && isEnglishPage) ? "en" : "zh";
let selected = 0;
function render() {
  const t = copy[language];
  document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  document.title = language === "zh" ? "推文雷达 Tweet Radar：用 Jev 筛选 X 推文" : "Tweet Radar — Filter X Posts with TypeSafe Jev";
  document.querySelector('meta[name="description"]').content = t.seoDescription;
  document.querySelector('meta[property="og:title"]').content = document.title;
  document.querySelector('meta[property="og:description"]').content = t.seoDescription;
  document.querySelector('meta[property="og:locale"]').content = language === "zh" ? "zh_CN" : "en_US";
  document.querySelector('meta[name="twitter:title"]').content = document.title;
  document.querySelector('meta[name="twitter:description"]').content = t.seoDescription;
  for (const el of document.querySelectorAll("[data-i18n]")) {
    if (el.dataset.i18n === "title") el.innerHTML = t.title;
    else el.textContent = t[el.dataset.i18n];
  }
  const languageLink = document.getElementById("language");
  languageLink.textContent = language === "zh" ? "English" : "简体中文";
  languageLink.href = language === "zh" ? "en/" : (isEnglishPage ? "../" : "./");
  document.getElementById("guide").href = `https://github.com/kelaocai/tweet-radar/blob/main/README${language === "en" ? ".en" : ""}.md`;
  const buttons = document.getElementById("rule-buttons");
  buttons.replaceChildren(...rules.map((rule,i) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = rule[language].name;
    button.setAttribute("aria-pressed",String(i === selected));
    button.addEventListener("click",() => { selected=i; render(); buttons.children[i].focus(); });
    return button;
  }));
  const rule = rules[selected];
  document.getElementById("goal").textContent = rule[language].goal;
  document.getElementById("profile").textContent = rule[language].profile;
  document.getElementById("copy-status").textContent = "";
  document.getElementById("feed").replaceChildren(...posts.map((post,i) => {
    const score = rule.scores[i];
    const article = document.createElement("article");
    article.className = `post ${score >= 80 ? "high" : score >= 60 ? "mid" : "low"}`;
    const header = document.createElement("div"); header.className="post-head";
    const author = document.createElement("span"); author.className="author"; author.textContent=post[language].author;
    const badge = document.createElement("span"); badge.className="badge"; badge.textContent=`${score >= 80 ? "✓" : score >= 60 ? "!" : "·"} ${score}%`;
    badge.setAttribute("aria-label",`${t.example}: ${score}%`);
    header.append(author,badge);
    const body = document.createElement("p"); body.textContent=post[language].text;
    const reason = document.createElement("p"); reason.className="reason"; reason.textContent=t.reason+rule.reasons[language][i];
    article.append(header,body,reason); return article;
  }));
}
document.getElementById("copy").addEventListener("click",async () => {
  const t=copy[language],rule=rules[selected][language];
  try { await navigator.clipboard.writeText(`${t.goalLabel}\n${rule.goal}\n\n${t.profileLabel}\n${rule.profile}`); document.getElementById("copy-status").textContent=t.copied; }
  catch { document.getElementById("copy-status").textContent=t.failed; }
});
render();
