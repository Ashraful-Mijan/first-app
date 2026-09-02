# Plan: React Native Book Reader (Expo) — "real book" reading experience

## Goal
A React Native (Expo managed, SDK 53) book reader where a user opens a book and reads it **like a real book**: two-page spread layout (left page + right page, like an opened physical book), paginated text, page-flip animation, and a cover shown centered first. Bundled sample book is public-domain **Alice's Adventures in Wonderland, Chapter 1**.

## Decisions (locked)
- Platform: **Expo managed workflow, SDK 53**, TypeScript. Replaces the existing Create React App project.
- Routing: classic `App.tsx` + `@react-navigation/native-stack` (2 screens). Avoids Expo Router gesture interference with the reader's pan-to-turn.
- Book format: **Markdown** stored under `assets/books/`; parsed by a small custom parser (no `react-native-markdown-display` dependency).
- Pagination: **greedy bin-packing at paragraph-block level** using `onLayout` heights measured at column width. Pure-JS, no native modules.
- Page model: **two-page spread**. `currentPage` (state) is always an **even left-page index**; spread shows `[currentPage, currentPage+1]`. Taps navigate one spread (step of 2).
- Cover: H1 title block that is the first block → rendered **centered, full-width, no spread**.
- Animation: **Reanimated v3** horizontal `rotateY` flip + `react-native-gesture-handler` pan, front/back faces, `withTiming` settle. No heavyweight WebView.
- Typography: system serif (iOS `Times New Roman`, Android `NotoSerif`), `fontSize` 16 (adjustable setting), `lineHeight` 1.45×, `textAlign: justify`, `letterSpacing 0.3`. Dark/paper themes.
- Sample book: `assets/books/alice_ch1.md` (Lewis Carroll, 1865, public domain). Chapter 1 (~6 min read) is a fine demo; full book is a documented future add.

## Out of scope
- EPUB/PDF parsing, device file import, cloud sync, highlights/bookmarks. (Documented as future extensions.)
- Native page-curl (`react-native-curl`). Chosen Reanimated flip instead due to no device toolchain here.
- Visual/runtime animation validation (no Android SDK / Xcode / emulator in sandbox). Covered by lint+tsc+jest.

## Affected boundaries
- Deletes Create React App artifacts: `public/`, `src/*`, `react-scripts` deps, `package-lock.json`. Replaces with Expo skeleton.
- Keeps git repo; rename active branch to `main` recommended. `.gitignore` adds `.expo/`, `ios/`, `android/`, `.env`.

## Data flow
1. `App.tsx`: load fonts/assets (none custom beyond system), render `<NavigationContainer>` → `Library`.
2. `Library`: reads bundled `BOOKS` registry (`id, title, author, sourcePath`), lists them. Tap → `Reader` route with `bookId`.
3. `Reader({ book })`:
   a. Parse `book.source` (Markdown string) → `BookBlock[]` via `parseMarkdown()` (`lib/markdown.ts`).
   b. **Measurement pass** (`ParagraphMeasurer`, off-screen): render each block `Text` at the computed **column width**, capture `onLayout` heights → `blockHeights[]`.
   c. `paginate(blockHeights, pageBodyHeight, blocks)` (`lib/pagination.ts`) → `pages: BookBlock[][]` (greedy: add block to current page if cumulative height ≤ body height, else start new page; single block taller than page → its own page, overflow allowed).
   d. Render spread: cover (if `currentPage` at cover index) centered; else `[pages[currentPage], pages[currentPage+1?]]` as left/right.
   e. Pan right-edge→left = next spread (`currentPage += 2`); pan left-edge→right = prev spread (`currentPage -= 2`). `withTiming` flip; commit page on complete.
   f. UI chrome toggle on tap center; status bar light/overlays; page indicator.
4. Dimensions via `useWindowDimensions`; orientation change re-runs measurement+pagination (key on `pageWidth`/`fontSize`).

## Pagination / page layout math
- `bookMargin = 16`dp (outer), `gutter = 12`dp (center gap).
- Portrait: `pageWidth = (W - 2*bookMargin - gutter)/2`; `pageHeight = H - 2*bookMargin - (statusBar+top)`.
- `pageBodyHeight = pageHeight - topMargin - bottomMargin` (inner typography margins ~ `pageWidth*0.06`).
- Cover page: rendered at full available width centered (single), height auto.
- Odd total content pages: last spread's right page missing → render right slot empty (single centered page). Covered as "final odd page."

## Edge cases (to handle)
- Empty/very short book → at least one page.
- Single-block-taller-than-page → own page (allowed overflow); log/flag if desired.
- Reaching first/last spread → no prev/next; tap zones disabled at bounds.
- Orientation change → `pageWidth` key changes → remeasure; memoize pages by `(bookId, pageWidth, fontSize, fontFamily)` to avoid recompute.
- First tap on cover → enter spreads (`currentPage` → 0).
- `textAlign: 'justify'` on Android: known minor last-line issues; acceptable for sample.
- Status bar / safe areas handled via `react-native-safe-area-context` + `expo-status-bar`.

## File layout (target)
```
app.tsx                      # Entry, nav container, theme
src/
  navigation/RootNavigator.tsx
  screens/Library.tsx        # Book list
  screens/Reader.tsx         # Spread + flip + gestures + chrome
  components/BookPageFlip.tsx  # Reanimated flip card
  components/ParagraphMeasurer.tsx  # Off-screen onLayout heights
  components/PageIndicator.tsx
  assets/books/alice_ch1.md
  lib/markdown.ts            # parseMarkdown(str): BookBlock[]
  lib/pagination.ts          # paginate(blocks, heights, pageBodyH): BookBlock[][]
  lib/types.ts               # Book, BookBlock, BookBlockType
  lib/books.ts               # BOOKS registry
  theme.ts                   # colors, typography defaults
package.json                 # expo, react-native, reanimated, gesture-handler, navigation
tsconfig.json
```

## Ordered task list (implementation)
1. Scaffold Expo project (`npx create-expo-app@latest` with SDK 53, TS) into this repo; remove CRA files/deps.
2. Add deps: `expo`, `react-native-screens`, `react-native-safe-area-context`, `expo-status-bar`, `react-native-reanimated@3`, `react-native-gesture-handler`, `@react-navigation/native`, `@react-navigation/native-stack`. Enable Reanimated plugin in `app.json`.
3. Implement `lib/markdown.ts` + `lib/types.ts`; parse headings (`#`,`##`) + paragraphs + inline `**bold**`.
4. Implement `lib/pagination.ts` greedy bin-packer; export `paginate()`.
5. Implement `ParagraphMeasurer` off-screen component returning `blockHeights` via callback; key on pageWidth.
6. Bundle sample book `assets/books/alice_ch1.md`; add `lib/books.ts` registry.
7. Build `BookPageFlip` component (Reanimated + gesture-handler, front/back `rotateY`, settle, callbacks for next/prev).
8. Build `Reader` screen: dimension math, cover-centered-first rule, spread rendering, odd-last-page handling, tap zones, chrome toggle, status bar, `PageIndicator`.
9. Build `Library` screen + `RootNavigator`; wire `App.tsx`.
10. Add settings toggle (font size +/-, light/dark) — minimal.
11. Configure ESLint/TypeScript; write `README.md` reflecting the book reader + how to run (`npx expo start`).

## Validation (what is runnable in this sandbox)
- `npx tsc --noEmit` — type check (TSX components, library code).
- `npx expo lint` — ESLint (Expo + Reanimated rules).
- `jest` (jest-expo preset) on pure-logic units:
  - `markdown.ts`: parses headings/paragraphs/bold correctly.
  - `pagination.ts`: bin-pack distributes blocks, handles block>page, stable order, page count.
- No runtime/device validation (no Android SDK/Xcode/emulator here). Note in README; animations verified by logic review.
- `npx expo start` is the dev entry (cannot fully run without a device/emulator in sandbox).

## Risks & mitigations
- Pagination precision (paragraph-level, not word/line): acceptable for demo; future work = line-level via `react-native-text-size`.
- Reanimated 3 gesture conflicts with scroll/nav: disable native stack gesture on Reader (`gestureEnabled:false`), lock gestures to reader.
- `justify` on Android: minor rendering quirks; acceptable, document.
- Long books performance: sample is short; virtualizing by chapter is future work.
- Font rendering differences (system serif): tested via lint/type only; visual confirmation deferred to device.

## Open questions (none — plan is implementation-ready)
