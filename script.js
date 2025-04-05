// ยอดเริ่มต้นในบัญชี
const STARTING_BALANCE = 6024;

// แปลงวันที่จาก yyyy-mm-dd → dd/mm/yyyy
function formatDateThai(dateStr) {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

// ดึงข้อมูลรายการจาก localStorage
function getTransactions() {
  return JSON.parse(localStorage.getItem("transactions") || "[]");
}

// บันทึกข้อมูลลง localStorage
function saveTransactions(transactions) {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// คำนวณยอดคงเหลือจากยอดเริ่มต้น + รายรับ - รายจ่าย
function calculateBalance(transactions) {
  let income = 0, expense = 0;
  transactions.forEach(t => {
    if (t.type === "income") income += Number(t.amount);
    else expense += Number(t.amount);
  });
  return STARTING_BALANCE + income - expense;
}

// อัปเดตยอดรวมต่าง ๆ และแสดงผล
function updateSummary(transactions) {
  const today = new Date().toISOString().split("T")[0];
  const todayTx = transactions.filter(t => t.date === today);

  let incomeToday = 0, expenseToday = 0;
  todayTx.forEach(t => {
    if (t.type === "income") incomeToday += Number(t.amount);
    else expenseToday += Number(t.amount);
  });

  document.getElementById("total-income").textContent = incomeToday.toLocaleString(undefined, { minimumFractionDigits: 2 });
  document.getElementById("total-expense").textContent = expenseToday.toLocaleString(undefined, { minimumFractionDigits: 2 });
  document.getElementById("total-balance").textContent = (incomeToday - expenseToday).toLocaleString(undefined, { minimumFractionDigits: 2 });
  document.getElementById("account-balance").textContent = calculateBalance(transactions).toLocaleString(undefined, { minimumFractionDigits: 2 });

  updateCombinedDaily(transactions);
  updateCombinedMonthly(transactions);
  updateAllTransactionsTable(transactions);
}

// รวมรายรับและรายจ่ายรายวันในตารางเดียว
function updateCombinedDaily(transactions) {
  const daily = {};

  transactions.forEach(({ date, amount, type }) => {
    if (!daily[date]) daily[date] = { income: 0, expense: 0 };
    if (type === "income") daily[date].income += Number(amount);
    else daily[date].expense += Number(amount);
  });

  const tbody = document.getElementById("combined-daily-body");
  tbody.innerHTML = "";

  Object.keys(daily).sort().reverse().forEach(date => {
    const row = `<tr>
      <td>${formatDateThai(date)}</td>
      <td>${daily[date].income.toLocaleString(undefined, { minimumFractionDigits: 2 })} ฿</td>
      <td>${daily[date].expense.toLocaleString(undefined, { minimumFractionDigits: 2 })} ฿</td>
    </tr>`;
    tbody.innerHTML += row;
  });
}

// รวมรายรับและรายจ่ายรายเดือนในตารางเดียว
function updateCombinedMonthly(transactions) {
  const monthly = {};

  transactions.forEach(({ date, amount, type }) => {
    const d = new Date(date);
    const key = d.toLocaleString('th-TH', { month: 'long' }) + ' ' + d.getFullYear();
    if (!monthly[key]) monthly[key] = { income: 0, expense: 0 };
    if (type === "income") monthly[key].income += Number(amount);
    else monthly[key].expense += Number(amount);
  });

  const tbody = document.getElementById("combined-monthly-body");
  tbody.innerHTML = "";

  Object.keys(monthly).sort().reverse().forEach(month => {
    const row = `<tr>
      <td>${month}</td>
      <td>${monthly[month].income.toLocaleString(undefined, { minimumFractionDigits: 2 })} ฿</td>
      <td>${monthly[month].expense.toLocaleString(undefined, { minimumFractionDigits: 2 })} ฿</td>
    </tr>`;
    tbody.innerHTML += row;
  });
}

// แสดงตารางรายการทั้งหมด พร้อมปุ่มแก้ไข
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
<td><button class="delete-btn">🗑️</button></td>

    `;

    row.querySelector(".edit-btn").addEventListener("click", () => handleEdit(tx, transactions.length - 1 - index));
    tbody.appendChild(row);

    row.querySelector(".edit-btn").addEventListener("click", () => {
        handleEdit(tx, transactions.length - 1 - index);
      });
      
      // เพิ่มตรงนี้สำหรับปุ่มลบ
      row.querySelector(".delete-btn").addEventListener("click", () => {
        if (confirm("คุณต้องการลบรายการนี้หรือไม่?")) {
          const allTx = getTransactions();
          allTx.splice(transactions.length - 1 - index, 1); // ลบรายการที่เลือก
          saveTransactions(allTx);
          updateSummary(allTx);
        }
      });
      
  });
}

// แก้ไขรายการในตาราง
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

// เมื่อโหลดหน้าเว็บ
document.addEventListener("DOMContentLoaded", () => {
  const transactions = getTransactions();
  updateSummary(transactions);

  const now = new Date();
  document.getElementById("date").value = now.toISOString().split("T")[0];
  document.getElementById("time").value = now.toTimeString().slice(0, 5);
});

// เมื่อกดเพิ่มรายการใหม่
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

// ปุ่มรีเซ็ตบัญชี
document.getElementById("reset-btn").addEventListener("click", () => {
  if (confirm("ล้างบัญชีทั้งหมด?")) {
    localStorage.removeItem("transactions");
    location.reload();
  }
});

// จัดการ dropdown แบบ custom
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


// ปุ่มสลับธีม
document.getElementById("toggle-theme").addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
  });
  