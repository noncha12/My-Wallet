const STARTING_BALANCE = 6024;


function formatDateThai(dateStr) {
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  }
  
function getTransactions() {
  return JSON.parse(localStorage.getItem("transactions") || "[]");
}

function saveTransactions(transactions) {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function calculateBalance(transactions) {
  let income = 0, expense = 0;
  transactions.forEach(t => {
    if (t.type === "income") income += Number(t.amount);
    else expense += Number(t.amount);
  });
  return STARTING_BALANCE + income - expense;
}

function updateSummary(transactions) {
  const today = new Date().toISOString().split("T")[0];
  const todayTx = transactions.filter(t => t.date === today);

  let incomeToday = 0, expenseToday = 0;
  todayTx.forEach(t => {
    if (t.type === "income") incomeToday += Number(t.amount);
    else expenseToday += Number(t.amount);
  });

  document.getElementById("total-income").textContent = incomeToday.toLocaleString(undefined, {minimumFractionDigits:2});
  document.getElementById("total-expense").textContent = expenseToday.toLocaleString(undefined, {minimumFractionDigits:2});
  document.getElementById("total-balance").textContent = (incomeToday - expenseToday).toLocaleString(undefined, {minimumFractionDigits:2});
  document.getElementById("account-balance").textContent = calculateBalance(transactions).toLocaleString(undefined, {minimumFractionDigits:2});

  updateDailyTable(transactions);
  updateMonthlyTable(transactions);
  updateAllTransactionsTable(transactions);
}

function updateDailyTable(transactions) {
  const daily = {};
  transactions.forEach(({ date, amount, type }) => {
    if (type === "income") {
      if (!daily[date]) daily[date] = 0;
      daily[date] += Number(amount);
    }
  });

  const tbody = document.getElementById("daily-income-body");
  tbody.innerHTML = "";
  Object.keys(daily).sort().reverse().forEach(date => {
    const row = `<tr><td>${formatDateThai(date)}</td><td>${daily[date].toLocaleString(undefined, {minimumFractionDigits:2})} ฿</td></tr>`;

    tbody.innerHTML += row;
  });
}

function updateMonthlyTable(transactions) {
  const monthly = {};
  transactions.forEach(({ date, amount, type }) => {
    if (type === "income") {
      const d = new Date(date);
      const key = d.toLocaleString('default', { month: 'long' }) + ' ' + d.getFullYear();
      if (!monthly[key]) monthly[key] = 0;
      monthly[key] += Number(amount);
    }
  });

  const tbody = document.getElementById("monthly-income-body");
  tbody.innerHTML = "";
  Object.keys(monthly).sort().reverse().forEach(month => {
    const row = `<tr><td>${month}</td><td>${monthly[month].toLocaleString(undefined, {minimumFractionDigits:2})} ฿</td></tr>`;
    tbody.innerHTML += row;
  });
}

function updateAllTransactionsTable(transactions) {
  const tbody = document.getElementById("all-transactions-body");
  tbody.innerHTML = "";

  transactions.slice().reverse().forEach((tx, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${formatDateThai(tx.date)}</td>

      <td>${tx.time || '-'}</td>
      <td>${tx.category}</td>
      <td>${Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
      <td>${tx.type === 'income' ? 'รายรับ' : 'รายจ่าย'}</td>
      <td>${tx.note || '-'}</td>
      <td><button class="edit-btn">✏️</button></td>
    `;

    const editBtn = row.querySelector(".edit-btn");
    editBtn.addEventListener("click", () => handleEdit(tx, transactions.length - 1 - index));
    tbody.appendChild(row);
  });
}

function handleEdit(tx, realIndex) {
  const tbody = document.getElementById("all-transactions-body");
  const row = tbody.children[tbody.children.length - 1 - realIndex];
  const cells = row.querySelectorAll("td");

  cells[0].innerHTML = `<input type="date" value="${tx.date}" />`;
  cells[1].innerHTML = `<input type="time" value="${tx.time}" />`;
  cells[2].innerHTML = `<input type="text" value="${tx.category}" />`;
  cells[3].innerHTML = `<input type="number" value="${tx.amount}" />`;
  cells[4].innerHTML = `
    <select>
      <option value="income" ${tx.type === 'income' ? 'selected' : ''}>รายรับ</option>
      <option value="expense" ${tx.type === 'expense' ? 'selected' : ''}>รายจ่าย</option>
    </select>`;
  cells[5].innerHTML = `<input type="text" value="${tx.note || ''}" />`;
  cells[6].innerHTML = `<button class="save-btn">💾</button>`;

  cells[6].querySelector(".save-btn").addEventListener("click", () => {
    const updated = {
      date: cells[0].querySelector("input").value,
      time: cells[1].querySelector("input").value,
      category: cells[2].querySelector("input").value.trim(),
      amount: cells[3].querySelector("input").value,
      type: cells[4].querySelector("select").value,
      note: cells[5].querySelector("input").value.trim()
    };

    const transactions = getTransactions();
    transactions[realIndex] = updated;
    saveTransactions(transactions);
    updateSummary(transactions);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const transactions = getTransactions();
  updateSummary(transactions);

  const now = new Date();
  document.getElementById("date").value = now.toISOString().split("T")[0];
  document.getElementById("time").value = now.toTimeString().slice(0, 5);
});

document.getElementById("transaction-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;
  const category = document.getElementById("category").value.trim();
  const amount = document.getElementById("amount").value;
  const type = document.getElementById("type").value;
  const note = document.getElementById("note").value.trim();

  if (!date || !time || !category || !amount || !type) return;

  const newTx = { date, time, category, amount, type, note };
  const transactions = getTransactions();
  transactions.push(newTx);
  saveTransactions(transactions);

  updateSummary(transactions);
  this.reset();

  const now = new Date();
  document.getElementById("date").value = now.toISOString().split("T")[0];
  document.getElementById("time").value = now.toTimeString().slice(0, 5);
});

document.getElementById("reset-btn").addEventListener("click", () => {
  if (confirm("ล้างบัญชีทั้งหมด?")) {
    localStorage.removeItem("transactions");
    location.reload();
  }
});


const customSelect = document.getElementById("custom-select");
const selectedOption = document.getElementById("selected-option");
const optionsList = customSelect.querySelector(".select-options");
const hiddenInput = document.getElementById("type");

customSelect.addEventListener("click", () => {
  optionsList.style.display = optionsList.style.display === "block" ? "none" : "block";
});

optionsList.querySelectorAll("li").forEach(item => {
  item.addEventListener("click", () => {
    selectedOption.textContent = item.textContent;
    hiddenInput.value = item.dataset.value;
    optionsList.style.display = "none";
  });
});

document.addEventListener("click", (e) => {
  if (!customSelect.contains(e.target)) {
    optionsList.style.display = "none";
  }
});
