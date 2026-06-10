// ------------------------------
// 画面の要素を取得
// ------------------------------
var loadingScreen = document.getElementById("loadingScreen");
var startScreen = document.getElementById("startScreen");
var questionScreen = document.getElementById("questionScreen");
var resultScreen = document.getElementById("resultScreen");

var questionText = document.getElementById("questionText");
var answerButtons = document.getElementById("answerButtons");
var progress = document.getElementById("progress");

var gameTypeText = document.getElementById("gameType");
var programmerTypeText = document.getElementById("programmerType");
var detailText = document.getElementById("detailText");
var resultIcon = document.getElementById("resultIcon");

// ------------------------------
// 質問データ
// ------------------------------
var questions = [];
var index = 0;

// ------------------------------
// スコア（内部スコア）
// ------------------------------
var front = 0;
var backend = 0;
var data = 0;
var infra = 0;

// ------------------------------
// タグ（性格判定用）
// ------------------------------
var reflex = 0;
var strategy = 0;
var explore = 0;
var optimize = 0;
var analysis = 0;

// ------------------------------
// JSON読み込み
// ------------------------------
fetch("questions.json")
  .then(res => res.json())
  .then(data => {
    questions = data;
    loadingScreen.style.display = "none";
    startScreen.style.display = "block";
  });

// ------------------------------
// スタートボタン
// ------------------------------
document.getElementById("startBtn").addEventListener("click", function() {
  startScreen.style.display = "none";
  questionScreen.style.display = "block";

  // 質問画面BGM
  bgm.src = "bgm/question.mp3";
  bgm.play();
  updateVolumeIcon();

  showQuestion();
});

// ------------------------------
// 質問表示
// ------------------------------
function showQuestion() {
  var q = questions[index];
  questionText.textContent = q.text;

  answerButtons.innerHTML = "";

  q.answers.forEach((ans, i) => {
    var btn = document.createElement("button");
    btn.textContent = ans.text;
    btn.addEventListener("click", () => selectAnswer(i));
    answerButtons.appendChild(btn);
  });

  progress.textContent = (index + 1) + " / " + questions.length;
}

// ------------------------------
// 回答選択（ゲーム性MAX版）
// ------------------------------

// コンボ用
let lastType = null;
let comboCount = 0;

function selectAnswer(i) {
  var a = questions[index].answers[i];

  // ▼ どのタイプにポイントが入ったか判定
  let currentType = null;
  if (a.front > 0) currentType = "front";
  if (a.backend > 0) currentType = "backend";
  if (a.data > 0) currentType = "data";
  if (a.infra > 0) currentType = "infra";

  // ▼ 基本ポイント
  front += a.front;
  backend += a.backend;
  data += a.data;
  infra += a.infra;

  // ▼ タグポイント
  if (a.reflex) reflex += a.reflex;
  if (a.strategy) strategy += a.strategy;
  if (a.explore) explore += a.explore;
  if (a.optimize) optimize += a.optimize;
  if (a.analysis) analysis += a.analysis;

  // ▼ ランダムボーナス（0〜2点）
  const randomBonus = Math.floor(Math.random() * 3);
  front += randomBonus;
  backend += randomBonus;
  data += randomBonus;
  infra += randomBonus;

  // ▼ クリティカル（10%で +10点）
  if (Math.random() < 0.10) {
    front += 10;
    backend += 10;
    data += 10;
    infra += 10;
    console.log("🔥 クリティカルヒット！ +10点");
  }

  // ▼ ミス（5%で -5点）
  if (Math.random() < 0.05) {
    front -= 5;
    backend -= 5;
    data -= 5;
    infra -= 5;
    console.log("💀 ミス発生！ -5点");
  }

  // ▼ コンボ（同じタイプ連続で加算）
  if (currentType === lastType) {
    comboCount++;
    const comboBonus = comboCount;
    front += comboBonus;
    backend += comboBonus;
    data += comboBonus;
    infra += comboBonus;
    console.log(`⚡ コンボ ${comboCount}！ +${comboBonus}点`);
  } else {
    comboCount = 0;
  }

  lastType = currentType;

  // ▼ 次へ
  index++;

  if (index < questions.length) {
    showQuestion();
  } else {
    showResult();
  }
}

// ------------------------------
// 判定
// ------------------------------
function judgeProgrammerType(scores) {
  const { front, backend, data, infra } = scores;
  const maxScore = Math.max(front, backend, data, infra);

  if (maxScore === front) return "フロントエンドエンジニア";
  if (maxScore === backend) return "バックエンドエンジニア";
  if (maxScore === data) return "データエンジニア / データ分析";
  if (maxScore === infra) return "インフラ / DevOps エンジニア";
}

function judgeResult(scores) {
  const { front, backend, data, infra } = scores;
  const maxScore = Math.max(front, backend, data, infra);

  if (maxScore === front) return "反射・直感タイプ";
  if (maxScore === backend) return "戦略・ロジックタイプ";
  if (maxScore === data) return "分析・探索タイプ";
  if (maxScore === infra) return "最適化・安定性タイプ";
}

// ------------------------------
// 詳細テキスト
// ------------------------------
function getDetailText(type) {
  switch (type) {
    case "反射・直感タイプ": 
      return "瞬時の判断や操作が得意なタイプ。アクションや反射神経を使うゲームで力を発揮する！";
    case "戦略・ロジックタイプ": 
      return "状況を整理し、最適な手を考えるタイプ。RPGやシミュレーションで真価を発揮する！";
    case "分析・探索タイプ": 
      return "情報収集やパターン分析が得意。探索・収集・パズル系のゲームが向いている！";
    case "最適化・安定性タイプ": 
      return "効率化や環境構築が好き。クラフト・サバイバル・管理系ゲームと相性抜群！";
    default: 
      return "タイプ判定に失敗しました。";
  }
}

function getProgrammerDetail(type) {
  switch (type) {
    case "フロントエンドエンジニア": 
      return "UI/UX・デザイン・操作性に強いタイプ。見た目と体験を作るのが得意！";
    case "バックエンドエンジニア": 
      return "ロジック・仕組み・データ処理が得意。裏側の頭脳を作るタイプ！";
    case "データエンジニア / データ分析": 
      return "数字・パターン・分析が得意。情報から価値を生み出すタイプ！";
    case "インフラ / DevOps エンジニア": 
      return "安定性・効率化・環境構築が得意。システムを支える縁の下の力持ち！";
    default: 
      return "適性判定に失敗しました。";
  }
}

// ------------------------------
// 結果表示（1000点換算）
// ------------------------------
function showResult() {

  // 結果画面BGM
  bgm.src = "bgm/result.mp3";
  bgm.play();
  updateVolumeIcon();

  const scores = { front, backend, data, infra };

  // ▼ 内部スコア
  const rawScore = front + backend + data + infra;

  // ▼ 1000点にスケール変換（最大1000点）
  const totalScore = Math.min(1000, Math.round((rawScore / 80) * 1000));

  const gameType = judgeResult(scores);
  const programmerType = judgeProgrammerType(scores);

  const gameDetail = getDetailText(gameType);
  const programmerDetail = getProgrammerDetail(programmerType);

  questionScreen.style.display = "none";
  resultScreen.style.display = "block";

  gameTypeText.textContent = `ゲームタイプ：${gameType}`;
  programmerTypeText.textContent = `プログラマー適性：${programmerType}`;
  detailText.textContent = `${gameDetail}\n\n${programmerDetail}`;

  resultIcon.textContent = getResultIcon(programmerType);

  showScoreBreakdown(scores);
  showRecommendedLanguages(programmerType);

  // ▼ ランキング保存（1000点換算）
  saveRanking(totalScore, programmerType);
  showRanking();
}

// ------------------------------
// スコア内訳
// ------------------------------
function showScoreBreakdown(scores) {
  var el = document.getElementById("scoreBreakdown");
  el.innerHTML = `
    <strong>スコア内訳</strong>
    <div>フロント: ${scores.front}</div>
    <div>バックエンド: ${scores.backend}</div>
    <div>データ: ${scores.data}</div>
    <div>インフラ: ${scores.infra}</div>
  `;
}

// ------------------------------
// おすすめ言語
// ------------------------------
function getRecommendedLanguages(type) {
  switch (type) {
    case "フロントエンドエンジニア": return ["JavaScript", "TypeScript", "React"];
    case "バックエンドエンジニア": return ["Python", "Node.js", "Go"];
    case "データエンジニア / データ分析": return ["Python", "SQL", "R"];
    case "インフラ / DevOps エンジニア": return ["Bash", "Python", "Terraform"];
    default: return ["JavaScript", "Python"];
  }
}

function showRecommendedLanguages(type) {
  var el = document.getElementById("recommendedLang");
  el.innerHTML = `<strong>おすすめ言語:</strong> ${getRecommendedLanguages(type).join(" / ")}`;
}

// ------------------------------
// ランキング保存
// ------------------------------
function saveRanking(score, type) {
  let ranking = JSON.parse(localStorage.getItem("ranking")) || [];
  const name = document.getElementById("playerName").value || "ゲスト";

  ranking.push({
    name: name,
    score: score,
    type: type,
    date: new Date().toLocaleString()
  });

  ranking.sort((a, b) => b.score - a.score);
  ranking = ranking.slice(0, 10);

  localStorage.setItem("ranking", JSON.stringify(ranking));
}

// ------------------------------
// ランキング表示
// ------------------------------
function showRanking() {
  const rankingArea = document.getElementById("rankingArea");
  let ranking = JSON.parse(localStorage.getItem("ranking")) || [];

  if (ranking.length === 0) {
    rankingArea.innerHTML = "<h3>ランキング</h3><p>まだ記録がありません。</p>";
    return;
  }

  let html = "<h3>ランキング（上位10件）</h3><ol>";

  ranking.forEach(item => {
    html += `
      <li>
        ${item.name}：${item.score}点（${item.type}）
        <br><small>${item.date}</small>
      </li>
    `;
  });

  html += "</ol>";

  rankingArea.innerHTML = html;
}

// ------------------------------
// 名前の自動読み込み
// ------------------------------
document.addEventListener("DOMContentLoaded", function() {
  const savedName = localStorage.getItem("playerName");
  if (savedName) document.getElementById("playerName").value = savedName;
});

// ------------------------------
// ランキング登録（1000点換算版）
// ------------------------------
document.getElementById("saveNameBtn").addEventListener("click", function () {
  const name = document.getElementById("playerName").value || "ゲスト";
  localStorage.setItem("playerName", name);

  // ▼ 内部スコア
  const rawScore = front + backend + data + infra;

  // ▼ 1000点にスケール変換
  const totalScore = Math.min(1000, Math.round((rawScore / 80) * 1000));

  const programmerType = judgeProgrammerType({ front, backend, data, infra });

  saveRanking(totalScore, programmerType);
  showRanking();

  const msg = document.getElementById("saveMessage");
  msg.textContent = "ランキングに登録しました！";
  setTimeout(() => msg.textContent = "", 3000);
});

// ------------------------------
// ランキングリセット
// ------------------------------
document.getElementById("resetRankingBtn").addEventListener("click", function () {
  if (confirm("ランキングをリセットしますか？")) {
    localStorage.removeItem("ranking");
    showRanking();
  }
});

// ------------------------------
// ダークモード
// ------------------------------
document.getElementById("darkModeBtn").addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");
});

// ------------------------------
// 波紋エフェクト
// ------------------------------
document.addEventListener("click", function(e) {
  if (e.target.tagName === "BUTTON") {
    const rect = e.target.getBoundingClientRect();
    e.target.style.setProperty("--x", `${e.clientX - rect.left}px`);
    e.target.style.setProperty("--y", `${e.clientY - rect.top}px`);
  }
});

// ------------------------------
// 共有画像生成
// ------------------------------
function generateShareImage(text) {
  const canvas = document.getElementById("shareCanvas");
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, 800, 400);

  ctx.fillStyle = "#fff";
  ctx.font = "28px Yu Gothic";
  ctx.fillText("ゲーム × プログラマー診断", 40, 60);

  ctx.font = "22px Yu Gothic";
  ctx.fillText(text, 40, 140);

  return canvas.toDataURL("image/png");
}

document.getElementById("shareBtn").addEventListener("click", () => {
  const text = `${gameTypeText.textContent}\n${programmerTypeText.textContent}`;
  const img = generateShareImage(text);

  const a = document.createElement("a");
  a.href = img;
  a.download = "result.png";
  a.click();
});

// ------------------------------
// BGM・効果音
// ------------------------------
var bgm = document.getElementById("bgm");
var bgmBtn = document.getElementById("bgmBtn");
var bgmVolume = document.getElementById("bgmVolume");
var volumeIcon = document.getElementById("volumeIcon");
var bgmPlaying = true;

var seClick = document.getElementById("seClick");

// ▼ 最初の画面でクリックされた瞬間にBGMを許可＆再生
document.addEventListener("click", function initBGM() {
  bgm.src = "bgm/start.mp3";
  bgm.volume = bgmVolume.value;

  bgm.play().then(() => {
    bgmPlaying = true;
    updateVolumeIcon();
  });

  document.removeEventListener("click", initBGM);
});

setTimeout(() => {
  bgm.volume = bgmVolume.value;
  updateVolumeIcon();
}, 300);

// ▼ 音量スライダー
bgmVolume.addEventListener("input", () => {
  bgm.volume = bgmVolume.value;
  updateVolumeIcon();
});

// ▼ 音量アイコン更新
function updateVolumeIcon() {
  const v = bgm.volume;

  if (!bgmPlaying || v == 0) {
    volumeIcon.textContent = "🔇";
  } else if (v < 0.3) {
    volumeIcon.textContent = "🔈";
  } else if (v < 0.7) {
    volumeIcon.textContent = "🔉";
  } else {
    volumeIcon.textContent = "🔊";
  }

  volumeIcon.classList.remove("volume-animate");
  void volumeIcon.offsetWidth;
  volumeIcon.classList.add("volume-animate");
}

// ▼ フェードイン
function fadeInBGM() {
  bgm.volume = 0;
  bgm.play();
  let v = 0;
  const fade = setInterval(() => {
    v += 0.02;
    if (v >= bgmVolume.value) {
      v = bgmVolume.value;
      clearInterval(fade);
    }
    bgm.volume = v;
  }, 40);
}

// ▼ フェードアウト
function fadeOutBGM() {
  let v = bgm.volume;
  const fade = setInterval(() => {
    v -= 0.02;
    if (v <= 0) {
      v = 0;
      bgm.pause();
      clearInterval(fade);
    }
    bgm.volume = v;
  }, 40);
}

// ▼ BGM ON/OFF
bgmBtn.addEventListener("click", () => {
  if (bgmPlaying) {
    fadeOutBGM();
    bgmBtn.textContent = "BGM ON";
  } else {
    fadeInBGM();
    bgmBtn.textContent = "BGM OFF";
  }
  bgmPlaying = !bgmPlaying;
  updateVolumeIcon();
});

// ▼ 効果音
function playClick() {
  seClick.currentTime = 0;
  seClick.play();
}

// ------------------------------
// もう一度診断
// ------------------------------
document.getElementById("restartBtn").addEventListener("click", () => {
  playClick();
  location.reload();
});

// ------------------------------
// 結果コピー
// ------------------------------
document.getElementById("copyBtn").addEventListener("click", () => {
  playClick();
  const text = `${gameTypeText.textContent}\n${programmerTypeText.textContent}\n${detailText.textContent}`;
  navigator.clipboard.writeText(text);
});
