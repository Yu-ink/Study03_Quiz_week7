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

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function scoreFor(correct, hintUsed, mode) {
  if (!correct) return 0;
  return hintUsed ? MODES[mode].hintScore : 1;
}

function formatScore(score, total) {
  return `${score}/${total}`;
}

function startCategory(category) {
  state.category = category;
  state.mode = "practice";
  state.firstScore = null;
  startRound(QUESTIONS.filter(q => q.category === category));
}

function startRound(list) {
  state.questions = shuffle(list).map(q => ({ ...q, choices: shuffle(q.choices) }));
  state.index = 0;
  state.score = 0;
  state.wrong = [];
  renderQuestion();
  showScreen("question");
}

function renderQuestion() {
  const q = state.questions[state.index];
  state.answered = false;
  state.hintUsed = false;
  document.getElementById("progress").textContent = `${state.index + 1}/${state.questions.length}`;
  document.getElementById("current-score").textContent = `점수 ${formatScore(state.score, state.questions.length)}`;
  document.getElementById("question-text").textContent = q.question;
  const list = document.getElementById("choice-list");
  list.replaceChildren();
  for (const choice of q.choices) {
    const button = document.createElement("button");
    button.textContent = choice;
    button.addEventListener("click", () => selectChoice(choice));
    list.appendChild(button);
  }
  document.getElementById("feedback").hidden = true;
}

function selectChoice(choice) {
  if (state.answered) return;
  const q = state.questions[state.index];
  const correct = choice === q.answer;
  state.score += scoreFor(correct, state.hintUsed, state.mode);
  if (!correct) state.wrong.push(q);
  revealAnswer(choice);
}

function revealAnswer(selected) {
  const q = state.questions[state.index];
  state.answered = true;
  for (const button of document.getElementById("choice-list").children) {
    button.disabled = true;
    if (button.textContent === q.answer) button.classList.add("correct");
    else if (button.textContent === selected) button.classList.add("wrong");
  }
  let result = selected === q.answer ? "정답" : "오답";
  if (selected === null) result = "시간 초과";
  document.getElementById("feedback-result").textContent = result;
  document.getElementById("feedback-explanation").textContent = q.explanation;
  document.getElementById("feedback-source").textContent = `출처: ${q.source}`;
  document.getElementById("current-score").textContent = `점수 ${formatScore(state.score, state.questions.length)}`;
  const isLast = state.index === state.questions.length - 1;
  document.getElementById("next-button").textContent = isLast ? "결과 보기" : "다음";
  document.getElementById("feedback").hidden = false;
}

function nextQuestion() {
  state.index++;
  renderQuestion();
}

function showResult() {
  document.getElementById("result-score").textContent = formatScore(state.score, state.questions.length);
  showScreen("result");
}

function init() {
  document.querySelectorAll("[data-category]").forEach(button => {
    button.addEventListener("click", () => startCategory(button.dataset.category));
  });
  document.getElementById("next-button").addEventListener("click", () => {
    if (state.index === state.questions.length - 1) showResult();
    else nextQuestion();
  });
  document.getElementById("home-button").addEventListener("click", () => showScreen("start"));
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
  check("shuffle: 원소를 그대로 두고 원본을 바꾸지 않음", () => {
    const a = [1, 2, 3, 4], b = shuffle(a);
    return b.length === 4 && [...b].sort().join() === "1,2,3,4" && a.join() === "1,2,3,4";
  });
  check("formatScore", () => formatScore(7.5, 10) === "7.5/10" && formatScore(3, 4) === "3/4");
  check("채점: 연습 모드에서 맞히면 1점", () => scoreFor(true, false, "practice") === 1);
  check("채점: 틀리면 0점", () => scoreFor(false, false, "practice") === 0);
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
