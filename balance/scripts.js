// =====================================================
// CONFIG
// =====================================================
const API_URL = "/api"
let authToken = localStorage.getItem("token")
let currentUser = JSON.parse(localStorage.getItem("user") || "null")
let categories = { income: [], expense: [] }

// =====================================================
// HEADER FUNCTIONS
// =====================================================
function updateUserInfo() {
  const userNameElement = document.getElementById("userName")
  if (userNameElement && currentUser) {
    userNameElement.textContent = currentUser.name || "Usuário"
  }
}

function setupLogout() {
  const logoutBtn = document.getElementById("logoutBtn")
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "../auth/login.html"
    })
  }
}

// =====================================================
// AUTH CHECK
// =====================================================
function checkAuth() {
  if (!authToken || !currentUser) {
    window.location.href = "../auth/login.html"
    return false
  }
  return true
}

// Também verificar no localStorage ao carregar
authToken = localStorage.getItem("token")
currentUser = JSON.parse(localStorage.getItem("user") || "null")

// Verificar autenticação ao carregar
if (!checkAuth()) {
  throw new Error("Não autenticado")
}

// =====================================================
// API HELPER
// =====================================================
async function apiRequest(endpoint, options = {}) {
  try {
    const config = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
        ...options.headers,
      },
    }

    const response = await fetch(`${API_URL}${endpoint}`, config)
    const data = await response.json()

    if (response.status === 401) {
      // Token inválido ou expirado
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "../auth/login.html"
      return null
    }

    if (!response.ok) {
      throw new Error(data.message || "Erro na requisição")
    }

    return data
  } catch (error) {
    console.error("Erro na API:", error)
    throw error
  }
}

// =====================================================
// MODAL
// =====================================================
const Modal = {
  overlay: document.querySelector(".modal-overlay"),

  open() {
    this.overlay.classList.add("active")
    // Focar no primeiro campo
    setTimeout(() => {
      document.getElementById("description").focus()
    }, 100)
  },

  close() {
    this.overlay.classList.remove("active")
    Form.clearFields()
  },
}

// =====================================================
// CATEGORIES
// =====================================================
const Categories = {
  async load() {
    try {
      const data = await apiRequest("/categories")
      if (data && data.success) {
        categories.income = data.data.income
        categories.expense = data.data.expense
        this.populateSelect()
      }
    } catch (error) {
      console.error("Erro ao carregar categorias:", error)
    }
  },

  populateSelect() {
    const typeSelect = document.getElementById("transactionType")
    const categorySelect = document.getElementById("category")

    if (!typeSelect || !categorySelect) return

    typeSelect.addEventListener("change", () => {
      this.updateCategoryOptions()
    })

    this.updateCategoryOptions()
  },

  updateCategoryOptions() {
    const typeSelect = document.getElementById("transactionType")
    const categorySelect = document.getElementById("category")
    const type = typeSelect?.value || "INCOME"

    if (!categorySelect) return

    categorySelect.innerHTML =
      '<option value="">Selecione uma categoria</option>'

    const categoryList =
      type === "INCOME" ? categories.income : categories.expense

    // Agrupar por categoria pai se for despesa
    if (type === "EXPENSE") {
      const parents = categoryList.filter((cat) => !cat.parent_id)
      parents.forEach((parent) => {
        const optgroup = document.createElement("optgroup")
        optgroup.label = parent.name

        const children = categoryList.filter(
          (cat) => cat.parent_id === parent.id
        )
        children.forEach((child) => {
          const option = document.createElement("option")
          option.value = child.id
          option.textContent = child.name
          optgroup.appendChild(option)
        })

        if (children.length > 0) {
          categorySelect.appendChild(optgroup)
        }
      })
    } else {
      categoryList.forEach((cat) => {
        const option = document.createElement("option")
        option.value = cat.id
        option.textContent = cat.name
        categorySelect.appendChild(option)
      })
    }
  },
}

// =====================================================
// TRANSACTIONS
// =====================================================
const Transaction = {
  all: [],

  async loadAll() {
    try {
      const data = await apiRequest("/transactions")
      if (data && data.success) {
        this.all = data.data
        DOM.updateUI()
      }
    } catch (error) {
      console.error("Erro ao carregar transações:", error)
      alert("Erro ao carregar transações")
    }
  },

  async add(transaction) {
    try {
      const data = await apiRequest("/transactions", {
        method: "POST",
        body: JSON.stringify(transaction),
      })

      if (data && data.success) {
        await this.loadAll()
        Modal.close()
      }
    } catch (error) {
      console.error("Erro ao adicionar transação:", error)
      throw error
    }
  },

  async remove(id) {
    if (!confirm("Deseja realmente excluir esta transação?")) {
      return
    }

    try {
      const data = await apiRequest(`/transactions/${id}`, {
        method: "DELETE",
      })

      if (data && data.success) {
        await this.loadAll()
      }
    } catch (error) {
      console.error("Erro ao remover transação:", error)
      alert("Erro ao remover transação")
    }
  },

  incomes() {
    return this.all
      .filter((t) => t.transaction_type === "INCOME")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)
  },

  expenses() {
    return this.all
      .filter((t) => t.transaction_type === "EXPENSE")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)
  },

  total() {
    return this.incomes() - this.expenses()
  },
}

// =====================================================
// DOM
// =====================================================
const DOM = {
  transactionsContainer: document.querySelector("#data-table tbody"),

  addTransaction(transaction) {
    const tr = document.createElement("tr")
    tr.innerHTML = this.innerHTMLTransaction(transaction)
    tr.dataset.id = transaction.id
    this.transactionsContainer.appendChild(tr)
  },

  innerHTMLTransaction(transaction) {
    const isIncome = transaction.transaction_type === "INCOME"
    const CSSclass = isIncome ? "income" : "expense"
    const amount = Utils.formatCurrency(transaction.amount)
    const date = Utils.formatDate(transaction.transaction_date)
    const categoryName = isIncome
      ? transaction.income_category_name
      : transaction.expense_category_name

    return `
      <td class="description">
        ${transaction.description}
        ${
          categoryName
            ? `<br><small style="opacity: 0.7">${categoryName}</small>`
            : ""
        }
      </td>
      <td class="${CSSclass}">${isIncome ? "" : "-"} ${amount}</td>
      <td class="date">${date}</td>
      <td>
        <img 
          onclick="Transaction.remove(${transaction.id})" 
          src="../assets/minus.svg" 
          alt="Remover transação"
          style="cursor: pointer"
        >
      </td>
    `
  },

  updateBalance() {
    const incomeDisplay = document.getElementById("incomeDisplay")
    const expenseDisplay = document.getElementById("expenseDisplay")
    const totalDisplay = document.getElementById("totalDisplay")

    if (incomeDisplay) {
      incomeDisplay.innerHTML = Utils.formatCurrency(Transaction.incomes())
    }

    if (expenseDisplay) {
      expenseDisplay.innerHTML = Utils.formatCurrency(Transaction.expenses())
    }

    if (totalDisplay) {
      totalDisplay.innerHTML = Utils.formatCurrency(Transaction.total())

      // Mudar cor se negativo
      const totalCard = totalDisplay.closest(".card")
      if (Transaction.total() < 0) {
        totalCard.style.background = "var(--red)"
      } else {
        totalCard.style.background = "var(--green)"
      }
    }
  },

  clearTransactions() {
    this.transactionsContainer.innerHTML = ""
  },

  updateUI() {
    this.clearTransactions()
    Transaction.all.forEach((transaction) => {
      this.addTransaction(transaction)
    })
    this.updateBalance()
    this.updateUserInfo()
  },

  updateUserInfo() {
    const userNameEl = document.getElementById("userName")
    if (userNameEl && currentUser) {
      userNameEl.textContent = currentUser.name
    }
  },
}

// =====================================================
// UTILS
// =====================================================
const Utils = {
  formatAmount(value) {
    if (!value || value === "") {
      throw new Error("Valor não pode estar vazio")
    }

    // Converter vírgula para ponto se necessário
    let normalizedValue = value.toString().trim()

    // Se tem vírgula, converter para ponto
    if (normalizedValue.includes(",")) {
      normalizedValue = normalizedValue.replace(",", ".")
    }

    const parsed = parseFloat(normalizedValue)

    if (isNaN(parsed) || parsed < 0) {
      throw new Error("Valor deve ser um número positivo válido")
    }

    return parsed
  },

  formatDate(dateString) {
    try {
      const date = new Date(dateString)

      // Formatar data: DD/MM/YYYY
      const day = date.getDate().toString().padStart(2, "0")
      const month = (date.getMonth() + 1).toString().padStart(2, "0")
      const year = date.getFullYear()

      // Formatar hora: HH:MM
      const hours = date.getHours().toString().padStart(2, "0")
      const minutes = date.getMinutes().toString().padStart(2, "0")

      return `${day}/${month}/${year} - ${hours}:${minutes}`
    } catch (error) {
      console.error("Erro ao formatar data:", error)
      return dateString
    }
  },

  formatDateToISO(dateString) {
    // Converter DD/MM/YYYY para YYYY-MM-DD
    if (dateString.includes("/")) {
      const [day, month, year] = dateString.split("/")
      return `${year}-${month}-${day}`
    }
    return dateString
  },

  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : ""
    value = String(Math.abs(value)).replace(/\D/g, "")
    value = Number(value)

    const formatted = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })

    return signal + formatted
  },
}

// =====================================================
// FORM
// =====================================================
const Form = {
  description: document.querySelector("input#description"),
  amount: document.querySelector("input#amount"),
  date: document.querySelector("input#date"),
  type: document.querySelector("select#transactionType"),
  category: document.querySelector("select#category"),

  getValues() {
    return {
      description: this.description.value,
      amount: this.amount.value,
      transaction_date: this.date.value,
      transaction_type: this.type?.value || "INCOME",
      category_id: this.category?.value || null,
    }
  },

  validateField() {
    const { description, amount, transaction_date } = this.getValues()

    if (
      description.trim() === "" ||
      amount.trim() === "" ||
      transaction_date.trim() === ""
    ) {
      throw new Error("Por favor, preencha todos os campos obrigatórios")
    }

    // Validar valor usando a função formatAmount
    try {
      Utils.formatAmount(amount)
    } catch (error) {
      throw new Error(error.message)
    }
  },

  formatValues() {
    let {
      description,
      amount,
      transaction_date,
      transaction_type,
      category_id,
    } = this.getValues()

    amount = Utils.formatAmount(amount)

    return {
      description: description.trim(),
      amount,
      transaction_date,
      transaction_type,
      category_id: category_id || null,
    }
  },

  clearFields() {
    this.description.value = ""
    this.amount.value = ""
    this.date.value = ""
    if (this.type) this.type.value = "INCOME"
    if (this.category) this.category.value = ""
    Categories.updateCategoryOptions()
  },

  async submit(event) {
    event.preventDefault()

    try {
      this.validateField()
      const transaction = this.formatValues()
      await Transaction.add(transaction)
    } catch (error) {
      alert(error.message)
    }
  },
}

// Adicionar listener ao formulário
const formElement = document.querySelector("#form form")
if (formElement) {
  formElement.addEventListener("submit", (e) => Form.submit(e))
}

// Permitir apenas números e decimais no input
const amountInput = document.querySelector("input#amount")
if (amountInput) {
  amountInput.addEventListener("keypress", (e) => {
    // Permitir: números, ponto, vírgula, backspace, delete, tab, enter, escape
    const allowedKeys = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      ".",
      ",",
      "Backspace",
      "Delete",
      "Tab",
      "Enter",
      "Escape",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
    ]

    if (!allowedKeys.includes(e.key)) {
      e.preventDefault()
    }
  })
}

// =====================================================
// APP
// =====================================================
const App = {
  async init() {
    updateUserInfo()
    setupLogout()
    await Categories.load()
    await Transaction.loadAll()
  },
}

// Iniciar aplicação
App.init()

// =====================================================
// DARK MODE
// =====================================================
const toggleSwitch = document.querySelector(
  '.theme-switch input[type="checkbox"]'
)

if (toggleSwitch) {
  const switchTheme = (e) => {
    if (e.target.checked) {
      document.documentElement.setAttribute("data-theme", "dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.setAttribute("data-theme", "light")
      localStorage.setItem("theme", "light")
    }
  }

  toggleSwitch.addEventListener("click", switchTheme)

  // Verificar se o usuário já tem uma preferência
  const currentTheme = localStorage.getItem("theme")

  if (currentTheme) {
    document.documentElement.setAttribute("data-theme", currentTheme)
    if (currentTheme === "dark") {
      toggleSwitch.checked = true
    }
  }
}
