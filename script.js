// 2026-10-09 17:04 KST

const MODES = {
  practice: { name: "연습", timeLimit: 0, hintCount: 0, hintScore: null, leaderboard: false, retry: true },
};

const state = {
  category: null, mode: "practice", questions: [], index: 0, score: 0,
  hintUsed: false, wrong: [], secondsLeft: 0,
  answered: false, firstScore: null, timerId: null,
};

function showScreen(name) {
  document.querySelectorAll("main > section").forEach(section => {
    section.hidden = section.id !== `screen-${name}`;
  });
}

function init() {
  showScreen("start");
}

function runSelfTests() {
  const results = [];
  const check = (name, fn) => {
    let ok = false;
    try { ok = fn() === true; } catch (e) { ok = false; }
    results.push(ok);
    console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
  };
  check("연습 모드 규칙(PRD 5.1항)", () =>
    MODES.practice.timeLimit === 0 && MODES.practice.hintCount === 0 &&
    MODES.practice.leaderboard === false && MODES.practice.retry === true);
  // 태스크마다 여기에 check(...)를 더함
  const failed = results.filter(ok => !ok).length;
  console.log(failed ? `점검 실패: ${failed}개` : `점검 통과: ${results.length}개`);
  return failed === 0;
}

if (typeof document === "undefined") {
  process.exitCode = runSelfTests() ? 0 : 1;   // 클로드: node script.js
} else {
  init();
  if (new URLSearchParams(location.search).has("test")) runSelfTests();   // 사용자: index.html?test
}
