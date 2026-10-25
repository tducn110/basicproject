import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const LANGUAGE_STORAGE_KEY = "10-caro-language";
type SupportedLanguage = "vi" | "en";
const isSupportedLanguage = (value: string | null): value is SupportedLanguage =>
  value === "vi" || value === "en";

// Language is intentionally controlled by this app, not by the browser or OS.
// English is the first-visit default; a valid saved choice wins on reload.
const getInitialLanguage = (): SupportedLanguage => {
  if (typeof window === 'undefined') return 'en';
  try {
    const value = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isSupportedLanguage(value)) return value;
  } catch {
    // Storage read failure fallback
  }
  
  return 'en';
};

const syncDocumentLang = (lang: string) => {
  if (typeof document !== "undefined" && document.documentElement) {
    document.documentElement.lang = lang;
  }
};

export const formatNumber = (value: number, lang?: string): string => {
  const current = lang || i18n.resolvedLanguage || i18n.language || "en";
  return value.toLocaleString(current.startsWith("vi") ? "vi-VN" : "en-US");
};

const persistLanguage = (language: string): void => {
  const normalized = language.split("-")[0];
  if (typeof window === "undefined" || !isSupportedLanguage(normalized)) return;

  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, normalized);
  } catch {
    // Persistence is best-effort in restricted browsers/WebViews.
  }
};

export const applyHostLocale = (value?: string | null): void => {
  const normalized = (value || "").split("-")[0].toLowerCase();
  if (isSupportedLanguage(normalized)) {
    void i18n.changeLanguage(normalized);
    syncDocumentLang(normalized);
  }
};

export const selectLanguage = (locale: SupportedLanguage): void => {
  if (typeof window !== "undefined" && typeof (window as any).Wink?.setLocale === "function") {
    (window as any).Wink.setLocale(locale);
  } else {
    applyHostLocale(locale);
    persistLanguage(locale);
  }
};

const resources = {
  vi: {
    translation: {
      common: {
        play: "Chơi",
        pause: "Tạm dừng",
        resume: "Tiếp tục",
        back: "Quay lại",
        close: "Đóng",
        retry: "Chơi lại",
        undo: "Đi lại",
        loading: "Đang tải...",
      },
      leaderboard: {
        title: "BẢNG XẾP HẠNG",
        empty: "Chưa có điểm số nào",
      },
      player: {
        you: "Bạn",
        anonymous: "Người chơi",
      },
      settings: {
        title: "Cài đặt",
        language: "Ngôn ngữ",
        music: "Nhạc nền",
        sfx: "Hiệu ứng âm thanh",
        on: "Bật",
        off: "Tắt",
      },
      game: {
        title: "Cờ Caro",
        modeAi: "Đấu máy",
        difficultyEasy: "Dễ",
        difficultyNormal: "Trung bình",
        difficultyHard: "Khó",
        difficultyVeryhard: "Rất khó",
        difficultyExpert: "Chuyên gia",
        difficultyMaster: "Bậc thầy",
        difficulty: "Độ khó",
        chooseMode: "Chọn chế độ chơi",
        modePvp: "Hai người chơi",
        aiThinking: "Máy đang tính…",
        aiReady: "Sẵn sàng",
        aiFailed: "Máy chưa trả được nước đi. Bạn có thể thử lại hoặc đi lại.",
        retryAi: "Thử lại máy",
        lastSearch: "Lần tính gần nhất",
        searchDepth: "Độ sâu đã xong",
        searchNodes: "Node đã duyệt",
        searchCutoffs: "Lần cắt nhánh",
        searchScore: "Điểm",
        searchLeaves: "Đánh giá lá",
        searchOrdering: "Đánh giá sắp thứ tự",
        searchCandidates: "Ứng viên đã sinh",
        searchElapsed: "Thời gian",
        strategy_random: "Ngẫu nhiên",
        strategy_rule_based: "Theo luật và heuristic",
        strategy_alpha_beta: "Alpha-Beta",
        strategy_tactical: "Dò thắng hoặc chặn",
        strategy_legacy: "Bộ tìm kiếm TypeScript cũ",
        tacticalScope: "Dò chiến thuật bằng TypeScript; Rust không chạy. Các bộ đếm Rust bằng 0; điểm chưa được tính.",
        workerScope: "Thời gian gồm khôi phục lịch sử, Rust tính toán và giải phóng Game; không gồm tải WASM hoặc truyền message. Dấu — là không có dữ liệu.",
        player: "Người chơi {{number}}",
        you: "Bạn",
        machine: "Máy",
        turn: "Đến lượt",
        pieceX: "Quân X",
        pieceO: "Quân O",
        draw: "Hòa!",
        boardFull: "Bàn cờ đã kín",
        youWin: "Bạn thắng!",
        machineWin: "Máy thắng!",
        playerWin: "Người chơi {{number}} thắng!",
        fiveInRow: "5 quân liên tiếp",
        info: "Thông tin",
        mode: "Chế độ",
        boardSize: "15 × 15",
        size: "Kích thước",
        time: "Thời gian",
        moveHistory: "Lịch sử nước đi",
        noMoves: "Chưa có nước đi nào",
      },
    },
  },
  en: {
    translation: {
      common: {
        play: "Play",
        pause: "Pause",
        resume: "Resume",
        back: "Back",
        close: "Close",
        retry: "Play again",
        undo: "Undo",
        loading: "Loading...",
      },
      leaderboard: {
        title: "LEADERBOARD",
        empty: "No scores yet",
      },
      player: {
        you: "You",
        anonymous: "Player",
      },
      settings: {
        title: "Settings",
        language: "Language",
        music: "Background music",
        sfx: "Sound effects",
        on: "On",
        off: "Off",
      },
      game: {
        title: "Gomoku",
        modeAi: "Play vs AI",
        difficultyEasy: "Easy",
        difficultyNormal: "Normal",
        difficultyHard: "Hard",
        difficultyVeryhard: "Very Hard",
        difficultyExpert: "Expert",
        difficultyMaster: "Master",
        difficulty: "Difficulty",
        chooseMode: "Choose a game mode",
        modePvp: "Two players",
        aiThinking: "Computer is thinking…",
        aiReady: "Ready",
        aiFailed: "The computer could not return a move. Retry or undo to continue.",
        retryAi: "Retry computer",
        lastSearch: "Last search",
        searchDepth: "Completed depth",
        searchNodes: "Nodes visited",
        searchCutoffs: "Cutoffs",
        searchScore: "Score",
        searchLeaves: "Leaf evaluations",
        searchOrdering: "Ordering evaluations",
        searchCandidates: "Candidates generated",
        searchElapsed: "Elapsed",
        strategy_random: "Random",
        strategy_rule_based: "Rule based and heuristic",
        strategy_alpha_beta: "Alpha-Beta",
        strategy_tactical: "Immediate win or block",
        strategy_legacy: "Legacy TypeScript search",
        tacticalScope: "TypeScript tactical scan; Rust did not run. Rust counters are zero; no score was computed.",
        workerScope: "Elapsed includes history hydration, Rust computation and Game cleanup; excludes WASM loading and message delivery. — means unavailable.",
        player: "Player {{number}}",
        you: "You",
        machine: "Computer",
        turn: "Your turn",
        pieceX: "X piece",
        pieceO: "O piece",
        draw: "Draw!",
        boardFull: "The board is full",
        youWin: "You win!",
        machineWin: "Computer wins!",
        playerWin: "Player {{number}} wins!",
        fiveInRow: "5 in a row",
        info: "Information",
        mode: "Mode",
        boardSize: "15 × 15",
        size: "Size",
        time: "Time",
        moveHistory: "Move history",
        noMoves: "No moves yet",
      },
    },
  },
} as const;

void i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(),
    supportedLngs: ["en", "vi"],
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });
syncDocumentLang(i18n.language || "en");
i18n.on("languageChanged", (lng) => {
  persistLanguage(lng);
  syncDocumentLang(lng);
});

export default i18n;
