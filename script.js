const sheetUrl = "https://docs.google.com/spreadsheets/d/【試算表ID】/gviz/tq?tqx=out:csv";

let words = [];
let filteredWords = [];
let currentAnswer = "";
let correctCount = 0;
let wrongCount = 0;
let correctWords = [];
let wrongWords = [];

// 載入資料
function loadData() {
  Papa.parse(sheetUrl, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
      words = results.data.map(row => ({
        word: row.word,
        meaning: row.meaning,
        type: row.type
      }));

      // 建立下拉選單
      const select = document.getElementById("typeSelect");
      const types = ["all", ...new Set(words.map(w => w.type))];
      types.forEach(t => {
        const option = document.createElement("option");
        option.value = t;
        option.textContent = t;
        select.appendChild(option);
      });
      select.disabled = false; // 啟用下拉選單

      filteredWords = [...words];
      nextWord();
      createTypeButtons(); // 建立快速切換按鈕
    },
    error: function(err) {
      document.getElementById("word").textContent = "資料載入失敗";
      console.error(err);
    }
  });
}

// 篩選單字種類
function filterByType() {
  const select = document.getElementById("typeSelect");
  const value = select.value;
  filteredWords = value === "all" ? [...words] : words.filter(w => w.type === value);
  nextWord();
}

// 顯示下一題
function nextWord() {
  if (!filteredWords || filteredWords.length === 0) {
    document.getElementById("word").textContent = "沒有單字可練習";
    document.getElementById("options").innerHTML = "";
    document.getElementById("result").textContent = "";
    return;
  }

  document.getElementById("result").textContent = "";

  const item = filteredWords[Math.floor(Math.random() * filteredWords.length)];
  currentAnswer = item.meaning;
  document.getElementById("word").textContent = item.word;

  // 建立選項
  let options = [item.meaning];
  while (options.length < 4) {
    const rand = filteredWords[Math.floor(Math.random() * filteredWords.length)].meaning;
    if (!options.includes(rand)) options.push(rand);
  }
  options = options.sort(() => Math.random() - 0.5);

  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";
  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.className = "option";
    btn.onclick = () => checkAnswer(opt, item.word);
    optionsDiv.appendChild(btn);
  });
}

// 檢查答案
function checkAnswer(selected, word) {
  if (selected === currentAnswer) {
    document.getElementById("result").textContent = "✅ 正確！";
    correctCount++;
    if (!correctWords.includes(word)) correctWords.push(word);
  } else {
    document.getElementById("result").textContent = "❌ 錯誤，正確答案是：" + currentAnswer;
    wrongCount++;
    if (!wrongWords.includes(word)) wrongWords.push(word);
  }

  // 更新統計
  document.getElementById("correctCount").textContent = correctCount;
  document.getElementById("wrongCount").textContent = wrongCount;

  // 更新列表
  document.getElementById("correctList").innerHTML = correctWords.map(w => `<li>${w}</li>`).join("");
  document.getElementById("wrongList").innerHTML = wrongWords.map(w => `<li>${w}</li>`).join("");
}

// 清空答對/答錯列表
function resetLists() {
  correctWords = [];
  wrongWords = [];
  document.getElementById("correctList").innerHTML = "";
  document.getElementById("wrongList").innerHTML = "";
}

// 建立快速切換按鈕
function createTypeButtons() {
  const container = document.getElementById("typeButtons");
  container.innerHTML = "";

  const types = ["all", ...new Set(words.map(w => w.type))];
  types.forEach(t => {
    const btn = document.createElement("button");
    btn.textContent = t === "all" ? "全部單字" : t;
    btn.onclick = () => {
      document.getElementById("typeSelect").value = t;
      filterByType();
    };
    container.appendChild(btn);
  });
}

// 初始化
loadData();
