let words = [];
let filteredWords = [];
let currentAnswer = "";
let correctCount = 0;
let wrongCount = 0;
let correctWords = [];
let wrongWords = [];

let practiceMode = "random"; // "order", "random", "wrongOnly"
let currentIndex = 0;         // 順序模式用
let wrongListQueue = [];      // 錯誤單字練習隊列

const sheetUrl = "https://docs.google.com/spreadsheets/d/1-HhKbscisIh5ou6Zy4Yj3XSCbFmKYEu8lf1DTbz8GMI/gviz/tq?tqx=out:csv";

// 載入資料
function loadData() {
  Papa.parse(sheetUrl, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
      words = results.data.map(item => ({
        word: item.word.trim(),
        meaning: item.meaning.trim(),
        type: item.type.trim()
      }));
      filteredWords = [...words];

      createTypeSelect();
      createTypeButtons();
      createModeSelect();

      nextWord();
    },
    error: function(err) {
      document.getElementById("word").textContent = "資料載入失敗";
      console.error("PapaParse Error:", err);
    }
  });
}

// 建立下拉選單
function createTypeSelect() {
  const select = document.getElementById("typeSelect");
  select.disabled = false;
  select.innerHTML = "";

  const types = ["all", ...new Set(words.map(w => w.type))];
  types.forEach(t => {
    const option = document.createElement("option");
    option.value = t;
    option.textContent = t === "all" ? "全部" : t;
    select.appendChild(option);
  });

  select.addEventListener("change", filterByType);
}

// 建立快速按鈕
function createTypeButtons() {
  const container = document.getElementById("typeButtons");
  container.innerHTML = "";
  const types = ["all", ...new Set(words.map(w => w.type))];

  types.forEach(t => {
    const btn = document.createElement("button");
    btn.textContent = t === "all" ? "全部" : t;
    btn.onclick = () => {
      document.getElementById("typeSelect").value = t;
      filterByType();
    };
    container.appendChild(btn);
  });
}

// 建立模式切換下拉選單
function createModeSelect() {
  const modeSelect = document.getElementById("modeSelect");
  modeSelect.innerHTML = "";
  const modes = [
    {value: "random", text: "隨機模式"},
    {value: "order", text: "順序模式"},
    {value: "wrongOnly", text: "錯題練習"}
  ];
  modes.forEach(m => {
    const option = document.createElement("option");
    option.value = m.value;
    option.textContent = m.text;
    modeSelect.appendChild(option);
  });
  modeSelect.value = practiceMode;

  modeSelect.addEventListener("change", e => {
    practiceMode = e.target.value;
    currentIndex = 0;
    nextWord();
  });
}

// 篩選單字
function filterByType() {
  const value = document.getElementById("typeSelect").value.trim();
  filteredWords = value === "all"
    ? [...words]
    : words.filter(w => w.type.trim() === value);

  if (!filteredWords || filteredWords.length === 0) {
    document.getElementById("word").textContent = "此類別沒有單字";
    document.getElementById("options").innerHTML = "";
    document.getElementById("result").textContent = "";
    return;
  }

  nextWord();
}

// 顯示下一題
function nextWord() {
  let item;

  if (practiceMode === "order") {
    if (currentIndex >= filteredWords.length) currentIndex = 0;
    item = filteredWords[currentIndex];
    currentIndex++;
  } else if (practiceMode === "random") {
    item = filteredWords[Math.floor(Math.random() * filteredWords.length)];
  } else if (practiceMode === "wrongOnly") {
    if (wrongListQueue.length === 0) {
      document.getElementById("word").textContent = "錯誤單字列表空，請先練習新單字";
      document.getElementById("options").innerHTML = "";
      document.getElementById("result").textContent = "";
      return;
    }
    item = wrongListQueue[Math.floor(Math.random() * wrongListQueue.length)];
  }

  currentAnswer = item.meaning;
  document.getElementById("word").textContent = item.word;

  generateOptions(item);
}

// 生成 4 個選項
function generateOptions(item) {
  let options = [item.meaning];
  while (options.length < 4) {
    const rand = filteredWords[Math.floor(Math.random() * filteredWords.length)].meaning;
    if (!options.includes(rand)) options.push(rand);
  }
  options.sort(() => Math.random() - 0.5);

  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";
  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.className = "option";
    btn.onclick = () => checkAnswer(opt, item.word);
    optionsDiv.appendChild(btn);
  });

  document.getElementById("result").textContent = "";
}

// 檢查答案
function checkAnswer(selected, word) {
  if (selected === currentAnswer) {
    document.getElementById("result").textContent = "✅ 正確！";
    correctCount++;
    if (!correctWords.includes(word)) correctWords.push(word);

    // 錯題模式，答對就移除
    wrongListQueue = wrongListQueue.filter(w => w !== word);

  } else {
    document.getElementById("result").textContent = "❌ 錯誤，正確答案是：" + currentAnswer;
    wrongCount++;

    if (!wrongWords.includes(word)) wrongWords.push(word);
    if (!wrongListQueue.includes(word)) wrongListQueue.push(word);
  }

  updateStats();
}

// 更新統計
function updateStats() {
  document.getElementById("correctCount").textContent = correctCount;
  document.getElementById("wrongCount").textContent = wrongCount;
  document.getElementById("correctList").innerHTML = correctWords.map(w => `<li>${w}</li>`).join("");
  document.getElementById("wrongList").innerHTML = wrongWords.map(w => `<li>${w}</li>`).join("");
}

// 清空答對/答錯列表
function resetLists() {
  correctWords = [];
  wrongWords = [];
  wrongListQueue = [];
  document.getElementById("correctList").innerHTML = "";
  document.getElementById("wrongList").innerHTML = "";
}

// 初始化
loadData();
