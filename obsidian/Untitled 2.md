# Hướng dẫn tích hợp Wink SDK cho game in-house

> Status: **Contract**
> Audience: PapaStudio game developers và reviewer
> Owner: Wink platform team
> Contract version: **1.0**
> Runtime: Wink SDK v1, protocol 1
> Git flow: developer → `develop`; release owner → protected `production`
> Last updated: **2026-09-09**

Đây là tài liệu duy nhất game developer cần dùng để tích hợp game in-house vào
Winkgames. Developer chịu trách nhiệm source game và các điểm gọi SDK. Wink
platform chịu trách nhiệm build production, game ID, environment, domain,
session, deploy, symlink, promotion và rollback.

## 1. Kết quả cần đạt

Một repository game hoàn tất integration phải có các đặc điểm sau:

- game chạy được độc lập khi mở ngoài Wink;
- game load một SDK tập trung từ `https://sdk.winkgames.fun/v1/wink.js`;
- game báo đúng lúc bắt đầu/kết thúc một round;
- game đọc leaderboard và gửi score qua SDK;
- game phản ứng với pause/resume, mute/unmute và thay đổi ngôn ngữ từ Wink;
- game gửi custom tracking qua SDK khi capability cho phép;
- source không chứa game ID, API URL, access token, environment hoặc domain config;
- output production là static bundle có `index.html`;
- developer chỉ merge source vào `develop`, không thao tác VPS/Coolify/deploy.

## 2. Những file repository cần có

```text
<game-repository>/
├── package.json
├── <một lockfile>
├── wink.game.json
├── index.html
└── src/
    ├── main.*
    └── integrations/
        └── wink.*
```

Repository phải có:

- đúng một lockfile: `package-lock.json`, `pnpm-lock.yaml` hoặc `yarn.lock`;
- script `build` trong `package.json`;
- static output directory được khai báo trong `wink.game.json`;
- `<outputDirectory>/index.html` sau khi build.

Game không cần Dockerfile hoặc deploy script riêng để được đưa lên Winkgames.

### `wink.game.json`

Với game Vite/static tiêu chuẩn:

```json
{
  "schemaVersion": 1,
  "runtime": {
    "kind": "wink-sdk",
    "protocolVersion": 1,
    "sdkMajor": 1
  },
  "build": {
    "profile": "vite-static-v1",
    "outputDirectory": "dist"
  }
}
```

Không thêm vào file này:

- game slug hoặc catalog UUID;
- staging/production environment;
- domain hoặc allowed origins;
- API URL;
- token/secret;
- shell/deploy command;
- đường dẫn VPS.

Nếu game không dùng Vite hoặc cần build profile khác, yêu cầu Wink platform team
đăng ký profile mới. Không tự đặt command tuỳ ý trong manifest.

## 3. Cài SDK vào game

Đặt SDK trước entrypoint của game trong `index.html`:

```html
<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, maximum-scale=1"
    />
    <script src="https://sdk.winkgames.fun/v1/wink.js"></script>
    <script type="module" src="/src/main.js"></script>
  </head>
  <body>
    <div id="game"></div>
  </body>
</html>
```

SDK phải được load từ đúng URL trên. Không download/copy SDK vào repository và
không đổi sang một CDN URL khác.

Khởi tạo SDK một lần trong bootstrap:

```js
const Wink = await window.Wink.init();
```

`init()` luôn resolve:

- trong iframe Wink, SDK kết nối với parent và nhận session/capabilities;
- khi mở game trực tiếp, SDK chuyển sang `standalone` để developer vẫn chơi/test
  game bình thường.

Không đặt toàn bộ gameplay sau điều kiện `Wink.status === "online"`. Wink API có
thể tạm unavailable nhưng game vẫn phải khởi động và chơi được.

## 4. Tạo một integration module nhỏ

Nên giữ mọi thao tác SDK trong một module thay vì gọi rải rác trong engine:

```js
export async function createWinkIntegration({
  pauseGame,
  resumeGame,
  setHostMuted,
  changeLocale,
}) {
  const Wink = await window.Wink.init();

  const unsubscribe = [
    Wink.on("pause", pauseGame),
    Wink.on("resume", resumeGame),
    Wink.on("mute", () => setHostMuted(true)),
    Wink.on("unmute", () => setHostMuted(false)),
    Wink.on("locale", changeLocale),
  ];

  setHostMuted(Boolean(Wink.muted));
  changeLocale(Wink.locale);

  return {
    Wink,

    destroy() {
      for (const off of unsubscribe) off();
    },
  };
}
```

Mỗi lần mount game chỉ tạo một SDK integration instance. Khi unmount/hot reload,
gọi unsubscribe và `Wink.destroy()` nếu SDK instance không còn được dùng.

## 5. Gameplay lifecycle

### Bắt đầu round

Gọi `gameplayStart()` tại thời điểm player thực sự bắt đầu điều khiển/chơi, không
gọi lúc loading assets hoặc lúc menu vừa mở:

```js
function startRound() {
  Wink.gameplayStart();
  game.startRound();
}
```

### Kết thúc round

Gọi `gameplayStop()` đúng một lần tại semantic end của round:

```js
function stopRound() {
  game.stopRound();
  Wink.gameplayStop();
}
```

Các ví dụ semantic end:

- player thắng;
- player thua/game over;
- player hoàn thành level;
- player chủ động kết thúc round theo gameplay rule.

Không gọi `gameplayStop()` cho pause tạm thời, browser background hoặc overlay
settings. Pause/resume do lifecycle events quản lý.

`gameplayStop()` và `submitScore()` là hai hành động độc lập. Round vẫn phải được
complete dù player hiện không có quyền submit score.

## 6. Submit score

Chỉ submit tại final scoring boundary đã được game designer/reviewer xác nhận:

```js
async function finishRound(finalScore) {
  game.stopRound();
  Wink.gameplayStop();

  if (!Wink.can("submitScore")) return;

  try {
    await Wink.submitScore(finalScore);
  } catch (error) {
    console.warn("Wink score submission failed", error.code);
  }
}
```

Score phải là non-negative integer. Khi cần metadata:

```js
await Wink.submitScore({
  score: 1250,
  playTime: 42,
  gameMode: "classic",
  counter: 3,
  metadata: {
    level: 8,
    difficulty: "normal"
  }
});
```

`playTime` là số giây nguyên, không âm.

Quy tắc:

- không submit score ở mỗi frame/tick;
- không tự retry vô hạn;
- không gọi trực tiếp leaderboard API;
- không lưu access token;
- không chặn gameplay/UI nếu network fail;
- không dùng custom tracking thay cho `submitScore()`.

Anonymous player có thể không có capability submit score. Đây là trạng thái hợp
lệ; luôn kiểm `Wink.can("submitScore")`.

## 7. Đọc leaderboard và personal best

```js
async function loadLeaderboard() {
  if (!Wink.can("getLeaderboard")) {
    return { entries: [], me: null, total: 0 };
  }

  try {
    return await Wink.getLeaderboard({
      limit: 20,
      offset: 0,
    });
  } catch (error) {
    console.warn("Wink leaderboard unavailable", error.code);
    return { entries: [], me: null, total: 0 };
  }
}

async function loadPersonalBest() {
  try {
    return await Wink.getPersonalBest();
  } catch (error) {
    console.warn("Wink personal best unavailable", error.code);
    return { me: null };
  }
}
```

`getLeaderboard()` trả:

```js
{
  entries: [],
  me: null,
  total: 0
}
```

Trong standalone/offline mode, SDK trả cùng empty shape để game không cần một
code path giả lập khác.

Không tin client-side score/leaderboard cho reward có giá trị. Backend là nơi
validate authority và dữ liệu cuối cùng.

## 8. Tracking

Core gameplay tracking dùng `gameplayStart()` và `gameplayStop()`. Custom product
events dùng `track()` khi capability cho phép:

```js
async function trackLevelStart(level) {
  if (!Wink.can("track")) return;

  try {
    await Wink.track("level_start", {
      level,
      difficulty: game.difficulty,
    });
  } catch (error) {
    console.warn("Wink tracking unavailable", error.code);
  }
}
```

Tên event:

- lowercase `snake_case`;
- bắt đầu bằng chữ cái;
- tối đa 64 ký tự;
- không dùng prefix `wink_`, `system_`, `auth_` hoặc `billing_`;
- dùng một tên ổn định, không tạo tên động chứa user/level/time.

Tên chuẩn nên dùng khi phù hợp:

```text
level_start
level_complete
level_fail
tutorial_start
tutorial_complete
powerup_used
game_mode_selected
```

Properties phải là JSON-safe, nhỏ và có schema ổn định. Không gửi:

- tên, email, số điện thoại hoặc thông tin định danh player;
- access token/cookie/session ID;
- free-form chat/text chưa sanitize;
- toàn bộ game state/save file;
- score/reward dùng để thay thế API chuyên dụng.

Tracking fail không được dừng gameplay. Platform tự gắn trusted game/session/
player/time metadata; game không tự tạo các field đó.

## 9. Pause và resume

```js
Wink.on("pause", () => {
  engine.pause();
  physics.pause();
  input.disable();
});

Wink.on("resume", () => {
  input.enable();
  physics.resume();
  engine.resume();
});
```

Pause phải dừng tối thiểu:

- game loop/update tốn CPU;
- physics/timer ảnh hưởng kết quả;
- input;
- animation không cần thiết;
- audio của game.

Resume không được tạo round mới, reset score hoặc gọi `gameplayStart()` lần nữa
nếu round cũ vẫn đang tiếp tục.

## 10. Mute và audio

Wink mute là một lớp mute của host, độc lập với setting âm thanh bên trong game:

```js
let hostMuted = Boolean(Wink.muted);
let playerMuted = loadPlayerAudioPreference();

function syncAudio() {
  audio.setMuted(hostMuted || playerMuted);
}

Wink.on("mute", () => {
  hostMuted = true;
  syncAudio();
});

Wink.on("unmute", () => {
  hostMuted = false;
  syncAudio();
});
```

Không ghi đè preference riêng của player khi nhận host mute. Khi Wink unmute,
game vẫn phải giữ mute nếu player đã mute trong settings của game.

Tuân thủ browser autoplay policy: chỉ unlock/resume audio context sau user
gesture phù hợp.

## 11. Ngôn ngữ

`Wink.locale` là locale ban đầu và event `locale` báo thay đổi sau đó:

```js
const SUPPORTED_LOCALES = new Set(["vi", "en"]);

function applyLocale(locale) {
  const selected = SUPPORTED_LOCALES.has(locale) ? locale : "en";
  i18n.changeLanguage(selected);
}

applyLocale(Wink.locale);
Wink.on("locale", applyLocale);
```

Game phải:

- có fallback locale;
- không reload toàn iframe chỉ để đổi ngôn ngữ;
- cập nhật UI đang mở nếu có thể;
- không tự thay đổi language của Wink parent;
- không lấy locale bằng cách đọc DOM/cookie của parent.

Nếu sau này game được cấp capability yêu cầu đổi locale của Wink shell, SDK sẽ
có method riêng; không tự viết `postMessage` cho việc đó.

## 12. Capability và error handling

Luôn kiểm capability trước action có quyền:

```js
Wink.can("getLeaderboard");
Wink.can("submitScore");
Wink.can("complete");
Wink.can("track");
```

Nguyên tắc xử lý lỗi:

- SDK/network error không làm crash round đang chơi;
- hiển thị trạng thái nhẹ cho leaderboard nếu cần;
- score có thể báo “chưa đồng bộ” nhưng không tự claim thành công;
- log `error.code`, không log toàn SDK/session object;
- không tự refresh token hoặc gọi auth API;
- không loop retry; SDK/Wink parent quản lý session renewal.

## 13. Standalone/local development

Game phải chơi được khi chạy trực tiếp:

```bash
npm ci
npm run dev
```

Trong standalone mode:

- `Wink.status === "standalone"`;
- leaderboard trả empty shape;
- personal best trả `{ me: null }`;
- capability cần backend có thể là `false`;
- gameplay vẫn hoạt động bình thường;
- không cần local Wink API, token, game ID hoặc runtime config.

Không hardcode fake production data vào SDK adapter. Nếu game cần leaderboard
mock cho UI development, đặt mock ở story/test fixture riêng.

## 14. Những thứ bị cấm trong source game

Không commit hoặc tự implement:

- `wink-bridge.js`;
- `wink-runtime-config.json`;
- `wink-bridge.lock.json`;
- `wink-integration.json` kiểu Bridge legacy;
- `GAME_ID`, catalog UUID hoặc environment-specific game config;
- Wink API URL;
- access/refresh/game-session token;
- anonymous ID storage cho Wink;
- custom `postMessage` protocol với Wink parent;
- wildcard/allowed parent origin list;
- SSH key, GitLab/Coolify token hoặc deploy script;
- production bundle chỉ để deploy.

Game có thể có config gameplay thuần tuý như difficulty, assets hoặc level data,
miễn không chứa Wink environment/credential/identity.

## 15. Migration từ Bridge 9.x

Với game cũ, migration hoàn tất khi:

1. thêm canonical SDK script tag;
2. thay adapter Bridge bằng API trong tài liệu này;
3. chuyển lifecycle, leaderboard, score, mute và locale sang SDK;
4. thêm tracking points đã được product/reviewer duyệt;
5. thêm `wink.game.json`;
6. xoá vendored bridge/runtime config/lock/integration manifest;
7. xoá game ID, environment, API URL và origin config khỏi source;
8. build output chỉ còn static game assets và SDK script reference;
9. standalone behavior pass;
10. merge source vào `develop`.

Không giữ song song SDK và Bridge trong cùng production artifact. Dual runtime có
thể tạo hai listener, gửi duplicate completion/score và làm session behavior
không xác định.

## 16. Git workflow

### Game developer

```text
feature branch
  -> merge request
  -> review/test
  -> merge vào develop
```

Developer không merge/push vào `production` và không chạy production deploy.

Push/merge `develop` tạo staging candidate từ exact commit. Release system build
source, chạy gate và publish staging artifact.

### Release owner

Sau khi Wink BE/FE và staging certification đạt yêu cầu, release owner
fast-forward protected `production` tới đúng full commit SHA đã certify:

```text
develop @ <certified-sha>
production --fast-forward--> <certified-sha>
```

Production event promote đúng artifact digest đã build/certify. Nó không build
lại game.

Production branch phải dùng fast-forward-only. Không squash, cherry-pick hoặc tạo
merge commit khác SHA cho release đã certify.

## 17. Checklist trước khi mở merge request

### Repository/build

- [ ] Có đúng một lockfile.
- [ ] `package.json` có script `build`.
- [ ] `wink.game.json` đúng schema/profile.
- [ ] Build tạo `<outputDirectory>/index.html`.
- [ ] Asset paths hoạt động từ static origin root.
- [ ] Không commit secret hoặc environment config.

### SDK

- [ ] Chỉ load `https://sdk.winkgames.fun/v1/wink.js`.
- [ ] Chỉ gọi `window.Wink.init()` một lần cho một game mount.
- [ ] Có `gameplayStart()` tại semantic round start.
- [ ] Có `gameplayStop()` đúng một lần tại semantic round end.
- [ ] Score chỉ submit ở final boundary và sau capability check.
- [ ] Leaderboard/personal-best failure không crash game.
- [ ] Pause/resume thực sự dừng/khôi phục loop, timer, physics và input.
- [ ] Host mute phối hợp đúng với player audio preference.
- [ ] Locale ban đầu và locale change đều hoạt động.
- [ ] Tracking không có PII/credential và không thay thế score/completion.
- [ ] Có cleanup listener khi game unmount.

### Behavior

- [ ] Game chạy được ở standalone mode.
- [ ] Game không yêu cầu Wink API để qua loading screen.
- [ ] Không tự viết `postMessage` với Wink parent.
- [ ] Không có vendored Bridge/runtime config trong output.
- [ ] Không có game ID/API URL/environment trong source hoặc bundle.

## 18. Definition of done

Game-side integration được coi là hoàn tất khi:

- merge request vào `develop` đã được review;
- build và static gate pass;
- standalone test pass;
- staging SDK handshake pass;
- anonymous play/completion/leaderboard behavior pass;
- authenticated score và personal best pass;
- pause/resume, mute/unmute và locale pass;
- tracking events đúng taxonomy/schema;
- artifact không chứa Bridge/config/credential;
- release evidence nối đúng source SHA và artifact digest.

Sau đó release owner chịu trách nhiệm production branch/promotion. Game developer
không cần thêm thao tác deploy.

## 19. Public SDK surface

| Member | Contract |
| --- | --- |
| `init()` | Resolve online hoặc standalone; không reject |
| `gameplayStart()` | Bắt đầu semantic round |
| `gameplayStop()` | Complete semantic round đúng một lần |
| `submitScore(number \| object)` | Submit final score qua parent |
| `getLeaderboard(options?)` | Đọc leaderboard |
| `getPersonalBest()` | Đọc personal best |
| `track(eventName, properties?)` | Gửi custom product event qua parent |
| `on(event, listener)` | Subscribe pause/resume/mute/unmute/locale |
| `can(capability)` | Kiểm quyền/capability hiện tại |
| `player` | Safe display identity hoặc `null` |
| `locale` | Locale hiện tại |
| `muted` | Read-only host mute state |
| `status` | connecting/connected/online/standalone |
| `version` | SDK/integration semver |
| `protocolVersion` | Wire protocol version |
| `destroy()` | Huỷ SDK listeners/timers |

Public SDK không cung cấp generic `request(type, payload)`. Capability tương lai
sẽ có method và schema rõ ràng để game code có thể nâng cấp mà không phụ thuộc
chi tiết transport/API của Wink.

## 20. Liên hệ khi cần thay đổi contract

Game developer cần trao đổi với Wink platform team trước khi:

- thêm build tool/profile mới;
- thêm tracking event taxonomy mới;
- gửi dữ liệu ngoài schema đã thống nhất;
- cần cloud save, purchase, ads hoặc capability mới;
- thay đổi scoring boundary;
- cần remote script/API ngoài Wink SDK;
- không thể bỏ Bridge legacy trong một game cụ thể.

Không giải quyết các nhu cầu trên bằng hardcode API, custom postMessage hoặc
environment config trong game. SDK và capability contract là extension point
duy nhất cho tích hợp Wink về sau.