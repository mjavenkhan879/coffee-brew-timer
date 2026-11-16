import { Dimensions } from 'react-native';

const win = Dimensions.get('window');
export const SCREEN_W = win.width;
export const SCREEN_H = win.height;

/* ---------- timings ---------- */
/** EXACT 8000 — shorter races the UI-test screenshot window (rule #13). */
export const LOADER_DURATION_MS = 8000;
export const SCREEN_FADE_MS = 320;
export const FADE_MS = 200;
export const STEP_CHANGE_MS = 320;
export const TICK_MS = 100;

export const SPRING_BUTTON = { tension: 40, friction: 7, useNativeDriver: true };
export const SPRING_HERO = { tension: 50, friction: 6, useNativeDriver: true };

/* ---------- header ---------- */
export const HEADER_PAD_TOP = 44;
export const HEADER_CONTENT_H = 72;
export const HEADER_H = HEADER_PAD_TOP + HEADER_CONTENT_H;

/* ---------- dose / ratio ranges ---------- */
export const DOSE_MIN = 10;
export const DOSE_MAX = 60;
export const DOSE_STEP = 1;
export const DOSE_BIG_STEP = 5;

export const RATIO_MIN = 12;
export const RATIO_MAX = 18;
export const RATIO_STEP = 0.5;

export const LONG_PRESS_MS = 420;
export const REPEAT_MS = 120;
export const BIG_STEP_AFTER_MS = 1200;

/* ---------- card / grid geometry (BOARD_FRAME formula, rules #4-#5) ---------- */
export const CARD_MAX_W = Math.min(SCREEN_W - 32, 380);
export const CARD_PAD = 14;
export const CARD_BORDER = 2;
export const CARD_FRAME = CARD_PAD + CARD_BORDER; // 16
export const GRID_GAP = 10;
export const GRID_COLS = 3;
export const GRID_CHIP_W = Math.floor(
  (CARD_MAX_W - 2 * CARD_FRAME - (GRID_COLS - 1) * GRID_GAP) / GRID_COLS,
);
export const GRID_W =
  GRID_CHIP_W * GRID_COLS + (GRID_COLS - 1) * GRID_GAP + 2 * CARD_FRAME;

/* ---------- brew ring ---------- */
/* height-aware so the ring never pushes the controls block off a short screen */
export const RING_SIZE = Math.min(SCREEN_W - 92, 272, Math.round(SCREEN_H * 0.34));
export const RING_STROKE_OUT = 15;
export const RING_STROKE_IN = 6;
export const RING_GAP = 6;

/* ---------- menu layout (M2 bottom sheet) ---------- */
/* the sheet always keeps at least 480dp, so the secondary row is never clipped */
export const MENU_ART_H = Math.max(
  150,
  Math.min(Math.round(SCREEN_H * 0.32), SCREEN_H - 480),
);
export const SHEET_OVERLAP = 28;
/** Art sprites shrink with the art block so they never ride up into the badge row. */
export const MENU_SPRITE = Math.min(140, MENU_ART_H - 96);
export const MENU_SPRITE_BOTTOM = 12;

/* ---------- misc ---------- */
export const MAX_RATING = 5;
export const BUTTON_H = 60;
export const BUTTON_H_SM = 48;
export const ICON_SIZE = 24;
