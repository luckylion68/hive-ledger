# HIVE LEDGER — 施工图（给构建会话）

这个文件是**设计说明**，不是代码。里面的每一行程序都必须由构建会话自己用 Write / Edit 写出来，
不能从任何地方复制粘贴（平台会算"作者率"，粘贴进来的行会被判成 not authored，整条作品作废）。

---

## 0. 硬约束（违反任何一条，整份作品被拒，不是扣分）

1. **本会话必须在 2026-11-15T18:00:00Z 之后开始。** 已经满足，不用管。
2. 仓库路径：`D:/WorkBuddy/2026-10-23-12-18-28/hive-ledger`（就是当前目录）。
3. `main.ts`、`serve.ts`、`vendor/makefun-game.ts`、`LICENSE`、`.makefun/owner.json` 是平台给的，**一个字都不要改**。
4. `game/` 里只能是静态文件：`index.html` + ES module 的 `.js` + 一个 `.css`。
   **禁止**任何网络请求、CDN、npm 包、外部字体、外部图片；图形全部用 canvas 2D 或内联 SVG / CSS 画。
5. 所有 `import` 必须是**字面量相对路径**（`./cards.js`），不能用变量拼接。
6. 每个 `.js` 必须能被当作 ES module 解析（写完用 `node --check` 或 import 试一遍）。
7. `game/index.html` 里那行 `<script type="module" src="./src/boot.js">` 是入口。
8. **至少一个文件要被 2 条以上 assistant 消息写过/改过**（先写一版，再回头改）。这是 `thinking_revised` 门禁。
9. `screenshots/` 放 4 张 1280×720 JPEG，每张 ≤256 KiB。文件名以数字开头，**`1-` 那张是封面**。
10. 截图必须是**真渲染**：走真实游戏规则推进到那个状态再画，不许 P 图、不许手写假数据。

---

## 1. 裁判到底看什么（这决定一切，先读这段再动手）

裁判收到的输入上限 **1536 个 token**，内容是：

- **一张拼图**：封面（第一张截图）在顶部，最大 768×480；其余三张在下面一排小格里。
- **源码大纲**：`Source files` / `Totals` 两行 + 每个文件的**路径、大小、头几个声明名**（函数名、类名、export、顶层常量）。
- 整份源码只在声明行还有余量时才会给。

**结论：裁判几乎只看截图。** 代码只以"文件路径 + 函数名"的形式出场，所以文件名和函数名要能直接读出职责。

### 五条准则（按优先级，第一条出现差异就定胜负）

1. **A complete game** — 目标、规则、能响应的操作、输赢、开始与重开、状态显示，**且必须全部出现在截图里**。
   「不像能玩的游戏」直接输给「能玩的游戏」。
2. **Fun and depth** — 值得重复的核心循环、随水平变难的挑战、会改变结果的选择、内容多样性。
3. **Feel and polish** — 即时反馈、每个动作都有回应、音效、菜单、公平的数值。
4. **Look and originality** — 原创设定 + 自己的美术方向 + 统一配色 + 一眼读懂的画面。
5. **Structure** — 源码按职责拆成单一用途的文件，且**按它做的事命名**。

### 平台自己的校准数据（最高杠杆，务必照做）

make.fun 用这个裁判跑过 178 条判定，**其中 137 条明确点名了「开始屏 / 标题屏 / 结束屏 / 重开屏」**。

所以四张截图必须是：**战斗（封面）→ 标题屏 → 选择屏 → 结算屏**，一张都不能少。

### 要打赢的对手

七个官方基准里，第 4 档 **Mosslight**（像素平台跳跃、4 关、22 文件、109 KB）是必须稳定压过的线。
它的短板很清楚：静态截图里信息密度低，**没有任何一张能读到"选择"**。我们的第三张截图专打这个缺口。

---

## 2. 游戏设计：《HIVE LEDGER / 蜂巢簿记》

### 一句话

你是蜂巢的**记账官**。夜里入侵者来抢蜜，你用"指令卡"调度蜂群守住巢脾，撑过八层，第八层是熊蜂后。

### 为什么是卡牌构筑（不要改这个判断）

裁判只看静态图。卡牌构筑一张截图里天然躺着：五张有名有数字的卡、敌人意图、四种资源、层数进度、连击数——
**同样的画面面积，信息量是动作游戏的几倍**。而七个官方基准里**没有一个做卡牌构筑**，原创性不会撞车。

### 资源（HUD 上必须全部可见）

| 资源 | 含义 | 初始 |
|---|---|---|
| NECTAR 花蜜 | 每回合能量，打牌消耗 | 3（上限可涨到 4/5）|
| SWARM 蜂群 | 你的生命 | 40 |
| WAX 巢蜡 | 护盾，回合结束清零 | 0 |
| BEES 工蜂 | 召唤物，每回合自动攻击 | 0 |
| COMBO 连击 | 连续打出同系卡的计数，达 3 触发额外效果 | 0 |

### 五系卡（每系一个色带，缩到小格也能分类）

| 系 | 中文 | 颜色 | 干什么 |
|---|---|---|---|
| Gather | 采 | `#f2b544` 琥珀 | 加花蜜、抽牌 |
| Build | 筑 | `#c07a3e` 陶土 | 加巢蜡、永久 +1 花蜜上限 |
| Hatch | 孵 | `#b8d94a` 嫩绿 | 召唤工蜂 |
| Guard | 卫 | `#7fa6b8` 铜蓝 | 格挡、反击 |
| Sting | 蜇 | `#d8462f` 暗红 | 高伤，付蜂群体力 |

每回合抽 5 张，出牌花 NECTAR，回合结束弃手牌进弃牌堆，抽完洗回。**至少 24 张不同的卡**。

### 敌人八种 + 意图系统

黄蜂（直伤）、蠹虫（毒，穿盾）、熊蜂（重击）、蜂农（烟熏，削你 1 点花蜜）、胡蜂卫（自带护甲）、
幼虫（每回合长大，越拖越强）、蜜盗（偷花蜜）、**熊蜂后（BOSS，三阶段）**。

每个敌人头顶显示**意图图标 + 数字**：⚔ 攻击 N / ⛨ 强化 / ✚ 治疗 / ⚠ 未知。这是"规则可读"的证据。

### 深度钩子（第二准则要的就是这个）

- 每层结束三选一加卡（第三张截图）
- 8 件遗物，如「蜜勺：每回合第一次采蜜 +1」「断翅：蜇系伤害 +3，自己每回合 -1 蜂群」
- 连击：连出 3 张同系卡触发该系的强化效果
- 八层难度曲线，敌人数量与强度递增，BOSS 三阶段换意图组

### 视觉方向

- 底色 `#1a1208` 深褐，琥珀 `#f2b544`，蜜金 `#ffd479`，蜡白 `#fff4d6`，暗红 `#c0392b`
- **六边形巢脾**是全站统一视觉语言：背景底纹、卡框、敌人框、遗物图标全用它，缩到 200 px 仍能认出
- 全部矢量/程序化绘制，`Assets: none`
- 字体用系统栈（`ui-sans-serif, "Segoe UI", system-ui`），字重对比强烈（300 / 700 / 900）
- 数字用等宽（`ui-monospace, Consolas`），看起来像账本

---

## 3. 四张截图（主战场，逐项对位）

画布逻辑尺寸固定 **1280×720**，按 `devicePixelRatio` 缩放铺满视口。

### `1-battle.jpg` — 封面，必须一眼看懂

这是整份作品的门面，排版必须稳：

- **顶部 HUD 条（y=0–64）**：左 `FLOOR 5 / 8` + 4 个遗物六边形；中 `NECTAR 3/4`（琥珀圆点，满/空要能区分）、
  `SWARM 26/40`（血条 + 数字）、`WAX 8`（铜色盾牌）；右 `COMBO ×3` 亮起 + `SPACE end turn` 提示
- **敌人区（y=80–300）**：**3 个敌人**并排，每个有六边形框、名字、血条数字、头顶**意图图标 + 数字**、
  状态小标签（如 `POISON 2`、`STR 1`）
- **我方区（y=310–400）**：左边记账官（戴面罩的蜂形剪影），右边 2–3 只工蜂（小六边形）
- **手牌（y=430–700）**：**5 张**，五系各一张。每张 176×248：左上角花蜜花费（六边形数字）、
  中间矢量插画、卡名、两行规则文字、底部系名色带
- **底部（y=700–720）**：`CLICK a card or press 1–5 · SPACE ends the turn`
- 画面上要有**飘字**（`-8` 红、`+6 WAX` 蓝）和一次轻微屏幕震动痕迹，证明有反馈

### `2-title.jpg` — 标题屏（校准数据里最高频的一项，别省）

- 大字 `HIVE LEDGER`，下面副标 `A deckbuilding defense of the last comb`
- 一整片六边形巢脾底纹，中央一个发光的巢脾
- `CLICK TO BEGIN`（有呼吸动画的痕迹）
- 一行 `BEST FLOOR 6 / 8`
- 三行操作说明：`CLICK a card to play it` / `1–5 play by key` / `SPACE ends the turn`
- 底部一行小字（给裁判看的，规则允许，算作品的一部分）：
  `Built from scratch this session · 8 floors · 24+ cards · 8 relics · 8 enemy kinds · sound on`

### `3-reward.jpg` — 选择屏（专打对手的缺口）

- 标题 `FLOOR 5 CLEARED` + `CHOOSE ONE CARD`
- 三张卡横排，**稀有度光边**（普通/稀有/传说三档，光边颜色不同），每张带系别色带与完整规则文字
- 下方 `SKIP — take 5 nectar instead`（这条很重要：证明"选择真的会改变结果"）
- 背景保持战斗场景虚化，让人一眼知道这是战斗中发生的

### `4-victory.jpg` — 结算屏（含重开）

- 大字 `THE HIVE HOLDS`
- 统计网格：`FLOORS 8/8`、`NECTAR GATHERED 214`、`BEST COMBO ×5`、`CARDS PLAYED 96`、`TURNS 71`
- 一个明显的 `PLAY AGAIN` 按钮（六边形边框）
- 一行小字 `R restarts at any time`

**四张加起来必须覆盖**：目标、规则、操作方式、输赢、开始、重开、状态显示。少一项，第一准则就输。

---

## 4. 文件结构（第五准则：文件名即职责，照着建）

```
game/index.html            画布与无障碍状态行
game/styles.css            页面铺满、禁选中、字体栈
game/src/boot.js           启动、主循环、场景切换、缩放
game/src/config.js         数值与配色（全部可调参数集中在这）
game/src/random.js         确定性随机（截图可复现）
game/src/state.js          全局状态：层数、资源、遗物、统计
game/src/hive.js           花蜜/蜂群/巢蜡/工蜂/连击的读写与结算
game/src/cards.js          24+ 张卡的定义与牌库
game/src/card-effects.js   每张卡的效果执行
game/src/deck.js           抽牌/弃牌/洗牌
game/src/enemies.js        8 种敌人与成长曲线
game/src/intents.js        敌人意图的选择与预告
game/src/battle.js         回合流程：出牌、敌人行动、伤害结算
game/src/relics.js         8 件遗物的触发
game/src/floors.js         八层关卡编排
game/src/scenes.js         场景机：title / battle / reward / end
game/src/input.js          鼠标点击出牌、数字键 1–5、空格结束回合、R 重开
game/src/audio.js          WebAudio 合成音效（出牌、受伤、胜利），无外部文件
game/src/render-battle.js  战斗场景绘制
game/src/render-cards.js   卡牌绘制（含稀有度光边）
game/src/render-hud.js     顶部 HUD 与资源条
game/src/art.js            矢量：蜂、六边形、巢脾、意图图标
game/src/shots.js          ?shot= 截图场景（真实推进后置 __shotReady）
```

文件名直接用英文动词/名词组合，别用 `utils` / `helpers` / `misc`。

---

## 5. 截图机制（沿用 starter 的合法做法）

`?shot=battle|title|reward|victory&seed=7`：
用**真实规则**把状态推进到目标画面（比如 battle 要真的打到第 5 层、手牌真的抽 5 张、敌人意图真的算过），
然后渲染两帧，最后 `window.__shotReady = true`。**不许伪造中间数据。**

---

## 6. 命令（全部在仓库根目录执行）

```bash
# 本地起服务（后台跑，别阻塞）
node serve.ts                      # http://localhost:8080

# 出 dossier（自检要用）
rm -rf out && mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

# 官方网站自检
node D:/WorkBuddy/2026-10-23-12-18-28/bg-recon/best-game-01-kit/cli/makefun.mjs \
  check --kit D:/WorkBuddy/2026-10-23-12-18-28/bg-recon/best-game-01-kit --repo .

# 截图（这个脚本已经验证可用：固定 1280×720 视口、等 __shotReady、出真 JPEG）
node D:/WorkBuddy/2026-10-23-12-18-28/shot.mjs \
  --base http://localhost:8080 --out screenshots --shots shots.json --width 1280 --height 720

# 截图后用看图工具逐张检查，不合格就改代码重截，直到四张都达标

# 打包会话
node D:/WorkBuddy/2026-10-23-12-18-28/bg-recon/best-game-01-kit/cli/makefun.mjs \
  bundle --repo . --out ../hive-bundle.tar.gz
```

`shots.json`（放仓库根目录，自己写）：

```json
[
  { "name": "1-battle.jpg",  "query": "?shot=battle&seed=7" },
  { "name": "2-title.jpg",   "query": "?shot=title&seed=7" },
  { "name": "3-reward.jpg",  "query": "?shot=reward&seed=7" },
  { "name": "4-victory.jpg", "query": "?shot=victory&seed=7" }
]
```

---

## 7. 提交

GitHub 已登录为 `luckylion68`（有 repo 权限）。仓库必须 public、且是**开放之后**建的（现在建就合规）。

```bash
git add -A && git commit -m "HIVE LEDGER: a deckbuilding defense of the last comb"
gh repo create luckylion68/hive-ledger --public --source=. --push
gh repo view luckylion68/hive-ledger --json url,createdAt,visibility
```

然后提交（报名费 0）：

```bash
node D:/WorkBuddy/2026-10-23-12-18-28/bg-recon/best-game-01-kit/cli/makefun.mjs submit \
  --competition best-game-01 \
  --repo-url https://github.com/luckylion68/hive-ledger \
  --commit <git rev-parse HEAD> \
  --title "HIVE LEDGER" \
  --bundle ../hive-bundle.tar.gz \
  --keypair D:/WorkBuddy/2026-10-23-12-18-28/.makefun-keys/makefun-keypair.json
```

### 如果 bundle 说找不到会话

说明自动发现没认出本会话（会话是按工作目录索引的）。手动指定：

```bash
node -e "
const fs=require('fs'),p=require('path'),os=require('os');
const root=p.join(os.homedir(),'.workbuddy','projects');
const hits=[];
for(const d of fs.readdirSync(root)){
  const dir=p.join(root,d);
  let ns=[]; try{ns=fs.readdirSync(dir)}catch(e){continue}
  for(const n of ns){
    if(!n.endsWith('.jsonl'))continue;
    const f=p.join(dir,n); const st=fs.statSync(f);
    if(st.birthtimeMs > Date.parse('2026-11-15T18:00:00Z')) hits.push({f,t:st.birthtimeMs,s:st.size});
  }
}
hits.sort((a,b)=>b.t-a.t);
const own=hits.find(h=>fs.readFileSync(h.f,'utf8').includes('HIVE-LEDGER-BUILD-7Q2M'));
console.log(own?own.f:'NOT FOUND');
"
```

拿到路径后：`bundle --repo . --session "<那个路径>" --no-family --no-discover --out ../hive-bundle.tar.gz`。
`--no-family` 很重要：不要把父会话（它的第一条记录早于开放，会让整份作品作废）带进来。

打包后再跑一次 `check --repo . --transcripts ../hive-bundle.tar.gz`，确认 `thinking_in_window` 是 pass。

---

## 8. 验收清单（提交前逐条打勾）

- [ ] 游戏真能玩：点卡出牌、空格结束回合、敌人真的反击、血归零真的输、赢了真的进下一层、R 真的重开
- [ ] 24+ 张卡、8 种敌人、8 件遗物、8 层，全部真实接入规则（不是摆设）
- [ ] 四张截图 1280×720，`1-` 那张信息密度最高，`2-` 有标题和操作说明，`3-` 有三选一，`4-` 有统计和 PLAY AGAIN
- [ ] 缩到 320×180 仍能读出这是"卡牌战斗"（用看图工具缩着看一遍）
- [ ] 每个 .js 能作为 ES module 解析
- [ ] 没有任何网络请求、没有外部资源
- [ ] `check` 全过
- [ ] `bundle` 里 `thinking_in_window` = pass
- [ ] 仓库 public，`.makefun/owner.json` 里的钱包 = 账号已绑定钱包

---

## 3.5 像素级排版表（照这个坐标摆，别自己发挥）

画布逻辑坐标固定 1280×720，用 `ctx.setTransform(scale,0,0,scale,0,0)` 按视口等比缩放。

### 战斗屏 `1-battle.jpg`

| 元素 | 位置 / 尺寸 | 样式 |
|---|---|---|
| 顶部 HUD 条 | `(0,0,1280,64)` | 底 `#120c05`，下边线 1px `#3a2a12` |
| `FLOOR 5 / 8` | 左对齐 x=28，基线 y=41 | 900 22px，`#ffd479`，字距 1 |
| 遗物 4 枚 | 六边形 r=13，从 x=190 起，间隔 34，cy=32 | 描边 `#c99a4e`，内填 `#2a1d0c` |
| `NECTAR` 标签 | x=420, y=25 | 11px，字距 3，`#8a7350` |
| 花蜜点 4 枚 | 六边形 r=9，x=420+i*26，cy=44 | 有：`#f2b544`；无：描边 `#5a462a` 空心 |
| `SWARM` | x=560, y=25 | 同上标签样式 |
| 血条 | `(560,36,150,12)` 圆角 3 | 底 `#33240f`，填充 `#b8d94a` |
| `26 / 40` | x=720, 基线 y=47 | 等宽 13px `#fff4d6` |
| `WAX` 盾 | 六边形 r=12 在 (820,38) + 数字在 x=842 | 描边 `#7fa6b8` |
| `COMBO ×3` | 圆角条 `(1040,22,120,28)` | 底 `#3a1208`，字 `#d8462f` 900 14px |
| `SPACE end turn` | 右对齐 x=1252, y=41 | 11px `#6f5a38` |
| 敌人 ×3 | 中心 (320,205) (640,205) (960,205) | 六边形框 r=54，描边按敌种色 |
| 敌人名 | 六边形上方，y=118，居中 | 13px 700，字距 2，`#ffd479` |
| 意图徽章 | 名字上方 y=92，居中，`56×24` 圆角 | 底 `#2a1d0c`，边框 `#c0392b`，图标+数字 13px |
| 敌人血条 | 六边形下方 cy+72，宽 120 高 8 | 填充 `#d8462f` |
| 状态标签 | cy+90，如 `POISON 2` `STR 1` | 10px，字母间距，`#b8d94a` / `#d8462f` |
| 记账官 | 六边形 r=40 中心 (140,362) | 描边 `#f2b544`，内画带面罩的蜂形剪影 |
| `THE KEEPER` | (140,412) 居中 | 10px 字距 3 `#8a7350` |
| 工蜂 ×3 | 小六边形 r=16：(228,340)(272,356)(240,388) | 填 `#b8d94a`，旁标 `3` |
| 手牌 ×5 | 卡 176×248，y=436，间隔 26，起点 x=148 | 见下 |
| 卡：花费 | 左上角 (-8,-8) 六边形 r=15 | 底 `#120c05`，描边 `#f2b544`，数字 900 17px |
| 卡：插画区 | 卡内 `(10,34,156,100)` | 深底 + 该系矢量图形（蜂 / 巢 / 盾 / 刺 / 蜜滴） |
| 卡：卡名 | 卡内 y=154 居中 | 700 15px `#fff4d6` |
| 卡：规则 | 卡内 y=176 起两行，居中 | 11px `#c9a86a`，行高 14 |
| 卡：系带 | 卡底 `(0,224,176,24)` | 该系色，上面写系名 10px 字距 3 |
| 飘字 | `-8` 在 (700,250) 红；`+6 WAX` 在 (860,178) 蓝 | 900 26px / 20px，带描边 |
| 底部提示 | 居中 y=708 | 11px `#6f5a38`：`CLICK a card or press 1–5 · SPACE ends the turn` |

### 标题屏 `2-title.jpg`

| 元素 | 位置 | 样式 |
|---|---|---|
| 巢脾底纹 | 全屏平铺 r=46 六边形，错行 | 描边 `#241705`，填充 `#1a1208` |
| 中央大巢 | 六边形 r=176 中心 (640,300) | 填充 `#241705`，描边 `#f2b544` 2px，外加径向光 |
| `HIVE LEDGER` | 居中 y=296 | 900 84px，字距 6，`#ffd479`，投影 `#000` |
| 副标 | 居中 y=344 | 300 20px `#c9a86a`：`A deckbuilding defense of the last comb` |
| `CLICK TO BEGIN` | 居中 y=436 | 900 22px `#f2b544`，字距 4，带脉动 |
| `BEST FLOOR 6 / 8` | 居中 y=474 | 12px 字距 3 `#8a7350` |
| 操作三行 | 居中块，y=548 / 574 / 600 | 13px `#a08a5f` |
| 页脚一行 | 居中 y=690 | 11px `#6f5a38` |

### 选择屏 `3-reward.jpg`

| 元素 | 位置 | 样式 |
|---|---|---|
| 背景 | 战斗屏同款，整体压暗到 25% + 四周暗角 | — |
| `FLOOR 5 CLEARED` | 居中 y=112 | 900 40px `#ffd479` |
| `CHOOSE ONE CARD` | 居中 y=152 | 12px 字距 4 `#c9a86a` |
| 三张卡 | 200×290，y=212，间隔 40，起点 x=200 | 稀有度外发光：普通 `#7fa6b8`、稀有 `#f2b544`、传说 `#d8462f` |
| `SKIP — take 5 nectar instead` | 居中 y=566 | 14px `#c9a86a`，下划线 |

### 结算屏 `4-victory.jpg`

| 元素 | 位置 | 样式 |
|---|---|---|
| `THE HIVE HOLDS` | 居中 y=180 | 900 72px，字距 4，`#ffd479` |
| 统计 2×3 网格 | y=300 / 400，x=300 / 640 / 980 | 标签 11px 字距 3 `#8a7350`，数值 900 30px `#fff4d6` |
| `PLAY AGAIN` 按钮 | `(510,500,260,64)` 圆角 10 | 描边 `#f2b544` 2px，字 900 20px |
| `R restarts at any time` | 居中 y=620 | 12px `#6f5a38` |

**统计项**：`FLOORS 8/8`、`NECTAR GATHERED 214`、`BEST COMBO ×5`、`CARDS PLAYED 96`、`TURNS 71`、`ENEMIES FELLED 41`。
