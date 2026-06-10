// ------------------------------
// 画面の要素を取得（存在チェック付き）
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

// プログレスバー（任意）
var progressBarEl = document.querySelector(".progress-bar");

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
// BGM・効果音要素（存在チェック）
// ------------------------------
var bgm = document.getElementById("bgm");
var bgmBtn = document.getElementById("bgmBtn");
var bgmVolume = document.getElementById("bgmVolume");
var volumeIcon = document.getElementById("volumeIcon");
var bgmPlaying = true;

var seClick = document.getElementById("seClick");

// ------------------------------
// JSON読み込み（例外処理付き）
// ------------------------------
fetch("questions.json")
  .then(res => {
    if (!res.ok) throw new Error("JSONファイルの読み込みに失敗しました");
    return res.json();
  })
  .then(dataJson => {
    if (!Array.isArray(dataJson)) throw new Error("JSON形式が不正です");

    // 40問固定仕様：超過分は切り捨て、足りない場合は警告
    if (dataJson.length > 40) {
      console.warn(`questions.json が ${dataJson.length} 問あります。先頭40問に切り詰めます。`);
      questions = dataJson.slice(0, 40);
    } else if (dataJson.length < 40) {
      console.warn(`questions.json が ${dataJson.length} 問です。40問を想定したUIとスコア計算です。`);
      questions = dataJson;
    } else {
      questions = dataJson;
    }

    if (loadingScreen) loadingScreen.style.display = "none";
    if (startScreen) startScreen.style.display = "block";
  })
  .catch(err => {
    console.error("読み込みエラー:", err);
    alert("データの読み込みに失敗しました。ファイルを確認してください。");
  });

// ------------------------------
// スタートボタン（存在チェック）
// ------------------------------
if (document.getElementById("startBtn")) {
  document.getElementById("startBtn").addEventListener("click", function() {
    if (startScreen) startScreen.style.display = "none";
    if (questionScreen) questionScreen.style.display = "block";

    if (bgm) {
      bgm.src = "bgm/question.mp3";
      bgm.play().catch(() => {});
    }
    updateVolumeIcon();

    showQuestion();
  });
}

// ------------------------------
// 質問表示（例外処理付き）
// ------------------------------
function showQuestion() {
  try {
    var q = questions[index];
    if (!q || !q.answers) throw new Error("質問データが不正です");

    if (questionText) questionText.textContent = q.text;
    if (answerButtons) answerButtons.innerHTML = "";

    q.answers.forEach((ans, i) => {
      var btn = document.createElement("button");
      btn.textContent = ans.text;
      btn.addEventListener("click", () => selectAnswer(i));
      answerButtons.appendChild(btn);
    });

    // 表示は 40問固定で見せる（questions.length が 40 未満でも動く）
    var total = questions.length;
    if (total > 40) total = 40;
    if (progress) progress.textContent = (index + 1) + " / " + total;

    // プログレスバーがあれば幅を更新
    if (progressBarEl) {
      var pct = Math.round(((index + 1) / (questions.length || 1)) * 100);
      progressBarEl.style.width = pct + "%";
    }

    // ▼ スマホで画面がズレないように固定
    window.scrollTo(0, 0);

  } catch (err) {
    console.error("質問表示エラー:", err);
    alert("質問データに問題があります。JSONを確認してください。");
  }
}

// ------------------------------
// 回答選択（例外処理付き）
// ------------------------------
let lastType = null;
let comboCount = 0;

function selectAnswer(i) {
  try {
    var a = questions[index].answers[i];
    if (!a) throw new Error("回答データが不正です");

    let currentType = null;
    if (a.front > 0) currentType = "front";
    if (a.backend > 0) currentType = "backend";
    if (a.data > 0) currentType = "data";
    if (a.infra > 0) currentType = "infra";

    front += Number(a.front) || 0;
    backend += Number(a.backend) || 0;
    data += Number(a.data) || 0;
    infra += Number(a.infra) || 0;

    if (a.reflex) reflex += Number(a.reflex) || 0;
    if (a.strategy) strategy += Number(a.strategy) || 0;
    if (a.explore) explore += Number(a.explore) || 0;
    if (a.optimize) optimize += Number(a.optimize) || 0;
    if (a.analysis) analysis += Number(a.analysis) || 0;

    const randomBonus = Math.floor(Math.random() * 3);
    front += randomBonus;
    backend += randomBonus;
    data += randomBonus;
    infra += randomBonus;

    if (Math.random() < 0.10) {
      front += 10;
      backend += 10;
      data += 10;
      infra += 10;
      console.log("🔥 クリティカルヒット！ +10点");
    }

    if (Math.random() < 0.05) {
      front -= 5;
      backend -= 5;
      data -= 5;
      infra -= 5;
      console.log("💀 ミス発生！ -5点");
    }

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

    index++;

    if (index < questions.length) {
      showQuestion();
    } else {
      showResult();
    }

  } catch (err) {
    console.error("回答処理エラー:", err);
    alert("回答データに問題があります。JSONを確認してください。");
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
  return "未分類";
}

function judgeResult(scores) {
  const { front, backend, data, infra } = scores;
  const maxScore = Math.max(front, backend, data, infra);

  if (maxScore === front) return "反射・直感タイプ";
  if (maxScore === backend) return "戦略・ロジックタイプ";
  if (maxScore === data) return "分析・探索タイプ";
  if (maxScore === infra) return "最適化・安定性タイプ";
  return "バランス型";
}

// ------------------------------
// 結果表示（1000点換算）
// ------------------------------
function showResult() {
  if (bgm) {
    bgm.src = "bgm/result.mp3";
    bgm.play().catch(() => {});
  }
  updateVolumeIcon();

  const scores = { front, backend, data, infra };
  const rawScore = front + backend + data + infra;

  // 40問前提の換算（questions.json を 40問に揃えているため）
  const totalScore = Math.min(1000, Math.round((rawScore / 80) * 1000));

  const gameType = judgeResult(scores);
  const programmerType = judgeProgrammerType(scores);

  const gameDetail = getDetailText(gameType);
  const programmerDetail = getProgrammerDetail(programmerType);

  if (questionScreen) questionScreen.style.display = "none";
  if (resultScreen) resultScreen.style.display = "block";

  if (gameTypeText) gameTypeText.textContent = `ゲームタイプ：${gameType}`;
  if (programmerTypeText) programmerTypeText.textContent = `プログラマー適性：${programmerType}`;
  if (detailText) detailText.textContent = `${gameDetail}\n\n${programmerDetail}`;

  if (resultIcon) resultIcon.textContent = getResultIcon(programmerType);

  showScoreBreakdown(scores);
  showRecommendedLanguages(programmerType);

  saveRanking(totalScore, programmerType);
  showRanking();
}

// ------------------------------
// スコア内訳
// ------------------------------
function showScoreBreakdown(scores) {
  var el = document.getElementById("scoreBreakdown");
  if (!el) return;
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
  if (!el) return;
  el.innerHTML = `<strong>おすすめ言語:</strong> ${getRecommendedLanguages(type).join(" / ")}`;
}

// ------------------------------
// ランキング保存
// ------------------------------
function saveRanking(score, type) {
  let ranking = JSON.parse(localStorage.getItem("ranking")) || [];
  const name = document.getElementById("playerName") ? document.getElementById("playerName").value || "ゲスト" : "ゲスト";

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
  if (!rankingArea) return;
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
  if (savedName && document.getElementById("playerName")) document.getElementById("playerName").value = savedName;
});

// ------------------------------
// ランキング登録（存在チェック）
// ------------------------------
if (document.getElementById("saveNameBtn")) {
  document.getElementById("saveNameBtn").addEventListener("click", function () {
    const name = document.getElementById("playerName") ? document.getElementById("playerName").value || "ゲスト" : "ゲスト";
    localStorage.setItem("playerName", name);

    const rawScore = front + backend + data + infra;
    const totalScore = Math.min(1000, Math.round((rawScore / 80) * 1000));
    const programmerType = judgeProgrammerType({ front, backend, data, infra });

    saveRanking(totalScore, programmerType);
    showRanking();

    const msg = document.getElementById("saveMessage");
    if (msg) {
      msg.textContent = "ランキングに登録しました！";
      setTimeout(() => msg.textContent = "", 3000);
    }
  });
}

// ------------------------------
// ランキングリセット（存在チェック）
// ------------------------------
if (document.getElementById("resetRankingBtn")) {
  document.getElementById("resetRankingBtn").addEventListener("click", function () {
    if (confirm("ランキングをリセットしますか？")) {
      localStorage.removeItem("ranking");
      showRanking();
    }
  });
}

// ------------------------------
// ダークモード（存在チェック）
// ------------------------------
if (document.getElementById("darkModeBtn")) {
  document.getElementById("darkModeBtn").addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
  });
}

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
// 共有画像生成（存在チェック）
// ------------------------------
function generateShareImage(text) {
  const canvas = document.getElementById("shareCanvas");
  if (!canvas) return "";
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

if (document.getElementById("shareBtn")) {
  document.getElementById("shareBtn").addEventListener("click", () => {
    const text = `${gameTypeText ? gameTypeText.textContent : ""}\n${programmerTypeText ? programmerTypeText.textContent : ""}`;
    const img = generateShareImage(text);
    if (!img) return;
    const a = document.createElement("a");
    a.href = img;
    a.download = "result.png";
    a.click();
  });
}

// ------------------------------
// BGM・効果音（存在チェック・値のパース）
// ------------------------------
if (bgm && bgmVolume) {
  // 初期音量を数値で扱う
  bgm.volume = parseFloat(bgmVolume.value) || 0.5;
  updateVolumeIcon();
}

document.addEventListener("click", function initBGM() {
  if (!bgm) return;
  if (bgmVolume) bgm.volume = parseFloat(bgmVolume.value) || 0.5;
  bgm.src = "bgm/start.mp3";
  bgm.play().then(() => {
    bgmPlaying = true;
    updateVolumeIcon();
  }).catch(() => {});
  document.removeEventListener("click", initBGM);
});

if (bgmVolume) {
  bgmVolume.addEventListener("input", () => {
    if (!bgm) return;
    bgm.volume = parseFloat(bgmVolume.value) || 0;
    updateVolumeIcon();
  });
}

function updateVolumeIcon() {
  if (!volumeIcon) return;
  const v = bgm ? bgm.volume : 0;

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

// フェードイン
function fadeInBGM() {
  if (!bgm || !bgmVolume) return;
  bgm.volume = 0;
  bgm.play().catch(() => {});
  let v = 0;
  const target = parseFloat(bgmVolume.value) || 0.5;
  const fade = setInterval(() => {
    v += 0.02;
    if (v >= target) {
      v = target;
      clearInterval(fade);
    }
    bgm.volume = v;
  }, 40);
}

// フェードアウト
function fadeOutBGM() {
  if (!bgm) return;
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

// BGM ON/OFF（存在チェック）
if (bgmBtn) {
  bgmBtn.addEventListener("click", () => {
    if (!bgm) return;
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
}

// 効果音
function playClick() {
  if (!seClick) return;
  try {
    seClick.currentTime = 0;
    seClick.play();
  } catch (e) {}
}

// ------------------------------
// もう一度診断（存在チェック）
// ------------------------------
if (document.getElementById("restartBtn")) {
  document.getElementById("restartBtn").addEventListener("click", () => {
    playClick();
    location.reload();
  });
}

// ------------------------------
// 結果コピー（存在チェック）
// ------------------------------
if (document.getElementById("copyBtn")) {
  document.getElementById("copyBtn").addEventListener("click", () => {
    playClick();
    const text = `${gameTypeText ? gameTypeText.textContent : ""}\n${programmerTypeText ? programmerTypeText.textContent : ""}\n${detailText ? detailText.textContent : ""}`;
    navigator.clipboard.writeText(text).catch(() => {});
  });
}

// ------------------------------
// 補助関数：結果詳細・プログラマー詳細・アイコン
// ------------------------------
function getDetailText(type) {
  switch (type) {
    case "反射・直感タイプ":
      return "瞬時の判断が得意で、アクションゲームや高速処理に向いています。";
    case "戦略・ロジックタイプ":
      return "状況分析と計画立案が得意で、RPGやシミュレーションに強いタイプです。";
    case "分析・探索タイプ":
      return "情報収集やデータ分析が得意で、探索・収集系ゲームに向いています。";
    case "最適化・安定性タイプ":
      return "効率化や安定性を重視するタイプで、クラフト・管理系ゲームに向いています。";
    default:
      return "あなたのゲームスタイルに合わせた特徴が見つかりました！";
  }
}

function getProgrammerDetail(type) {
  switch (type) {
    case "フロントエンドエンジニア":
      return "UIやUXに強く、ユーザー体験を重視する開発が得意です。HTML/CSS/JSを活かせます。";
    case "バックエンドエンジニア":
      return "サーバーサイドやAPI設計が得意で、スケーラビリティやロジック設計に強みがあります。";
    case "データエンジニア / データ分析":
      return "データ処理や分析、可視化が得意で、PythonやSQLを活かした仕事が向いています。";
    case "インフラ / DevOps エンジニア":
      return "システムの安定運用や自動化、インフラ設計に強く、運用改善が得意です。";
    default:
      return "幅広い領域で活躍できるポテンシャルがあります。興味のある分野を深掘りしてみましょう。";
  }
}

function getResultIcon(programmerType) {
  switch (programmerType) {
    case "フロントエンドエンジニア": return "🎨";
    case "バックエンドエンジニア": return "🛠️";
    case "データエンジニア / データ分析": return "📊";
    case "インフラ / DevOps エンジニア": return "⚙️";
    default: return "✨";
  }
}
