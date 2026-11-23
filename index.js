const STORAGE_KEY = "kakeiboEntries";

const form = document.querySelector("form");
const dateInput = document.querySelector("#entry-date");
const itemInput = document.querySelector("#entry-item");
const typeInput = document.querySelector("#entry-type");
const amountInput = document.querySelector("#entry-amount");
const totalOutput = document.querySelector('output[name="total"]');
const entryList = document.querySelector("#entry-list");

let entries = [];
let storageReady = false;

function isEntry(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof value.date === "string" &&
    typeof value.item === "string" &&
    (value.type === "expense" || value.type === "income") &&
    typeof value.amount === "number" &&
    Number.isInteger(value.amount) &&
    value.amount >= 0
  );
}

function loadEntries() {
  const savedEntries = localStorage.getItem(STORAGE_KEY);

  if (savedEntries === null) {
    return [];
  }

  const parsedEntries = JSON.parse(savedEntries);
  if (!Array.isArray(parsedEntries) || !parsedEntries.every(isEntry)) {
    throw new Error("保存データの形式が正しくありません。");
  }

  return parsedEntries;
}

function renderEntries() {
  entryList.replaceChildren();

  if (entries.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 4;
    cell.textContent = "登録データはありません。";
    row.append(cell);
    entryList.append(row);
  } else {
    for (const entry of entries) {
      const row = document.createElement("tr");
      const values = [
        entry.date,
        entry.item,
        entry.type === "expense" ? "支出" : "収入",
        entry.amount.toLocaleString("ja-JP"),
      ];

      for (const value of values) {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.append(cell);
      }

      entryList.append(row);
    }
  }

  const incomeTotal = entries
    .filter((entry) => entry.type === "income")
    .reduce((sum, entry) => sum + entry.amount, 0);
  const expenseTotal = entries
    .filter((entry) => entry.type === "expense")
    .reduce((sum, entry) => sum + entry.amount, 0);

  totalOutput.textContent = (incomeTotal - expenseTotal).toLocaleString("ja-JP");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!storageReady) {
    window.alert("保存データを読み込めなかったため、登録できません。");
    return;
  }

  const entry = {
    date: dateInput.value,
    item: itemInput.value.trim(),
    type: typeInput.value,
    amount: Number(amountInput.value),
  };
  const updatedEntries = [...entries, entry];

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
  } catch (error) {
    console.error("家計簿データを保存できませんでした。", error);
    window.alert("家計簿データを保存できませんでした。");
    return;
  }

  entries = updatedEntries;
  renderEntries();
  form.reset();
});

try {
  entries = loadEntries();
  storageReady = true;
  renderEntries();
} catch (error) {
  console.error("家計簿データを読み込めませんでした。", error);
  window.alert("家計簿データを読み込めませんでした。保存データを確認してください。");
}
