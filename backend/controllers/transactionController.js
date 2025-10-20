const { pool } = require("../config/database")

/**
 * Listar todas as transações do usuário
 */
const getTransactions = async (req, res) => {
  try {
    const { startDate, endDate, type, categoryId } = req.query

    let query = `
      SELECT 
        t.*,
        ic.name as income_category_name,
        ec.name as expense_category_name
      FROM transactions t
      LEFT JOIN income_categories ic ON t.income_category_id = ic.id
      LEFT JOIN expense_categories ec ON t.expense_category_id = ec.id
      WHERE t.user_id = ?
    `

    const params = [req.userId]

    // Filtros opcionais
    if (startDate) {
      query += " AND t.transaction_date >= ?"
      params.push(startDate)
    }

    if (endDate) {
      query += " AND t.transaction_date <= ?"
      params.push(endDate)
    }

    if (type) {
      query += " AND t.transaction_type = ?"
      params.push(type.toUpperCase())
    }

    if (categoryId) {
      query += " AND (t.income_category_id = ? OR t.expense_category_id = ?)"
      params.push(categoryId, categoryId)
    }

    query += " ORDER BY t.transaction_date DESC, t.created_at DESC"

    const [transactions] = await pool.query(query, params)

    res.json({
      success: true,
      data: transactions,
    })
  } catch (error) {
    console.error("Erro ao buscar transações:", error)
    res.status(500).json({
      success: false,
      message: "Erro ao buscar transações",
    })
  }
}

/**
 * Obter uma transação específica
 */
const getTransaction = async (req, res) => {
  try {
    const { id } = req.params

    const [transactions] = await pool.query(
      `SELECT 
        t.*,
        ic.name as income_category_name,
        ec.name as expense_category_name
      FROM transactions t
      LEFT JOIN income_categories ic ON t.income_category_id = ic.id
      LEFT JOIN expense_categories ec ON t.expense_category_id = ec.id
      WHERE t.id = ? AND t.user_id = ?`,
      [id, req.userId]
    )

    if (transactions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Transação não encontrada",
      })
    }

    res.json({
      success: true,
      data: transactions[0],
    })
  } catch (error) {
    console.error("Erro ao buscar transação:", error)
    res.status(500).json({
      success: false,
      message: "Erro ao buscar transação",
    })
  }
}

/**
 * Criar nova transação
 */
const createTransaction = async (req, res) => {
  try {
    const {
      description,
      amount,
      transaction_date,
      transaction_type,
      category_id,
      notes,
      tags,
    } = req.body

    // Validação
    if (!description || !amount || !transaction_date || !transaction_type) {
      return res.status(400).json({
        success: false,
        message:
          "Campos obrigatórios: description, amount, transaction_date, transaction_type",
      })
    }

    // Validar tipo de transação
    if (!["INCOME", "EXPENSE"].includes(transaction_type.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: "transaction_type deve ser INCOME ou EXPENSE",
      })
    }

    const type = transaction_type.toUpperCase()
    const income_category_id = type === "INCOME" ? category_id : null
    const expense_category_id = type === "EXPENSE" ? category_id : null

    // Inserir transação
    const [result] = await pool.query(
      `INSERT INTO transactions 
       (user_id, description, amount, transaction_date, transaction_type, 
        income_category_id, expense_category_id, notes, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.userId,
        description,
        amount,
        transaction_date,
        type,
        income_category_id,
        expense_category_id,
        notes || null,
        tags || null,
      ]
    )

    // Buscar transação criada
    const [transactions] = await pool.query(
      `SELECT 
        t.*,
        ic.name as income_category_name,
        ec.name as expense_category_name
      FROM transactions t
      LEFT JOIN income_categories ic ON t.income_category_id = ic.id
      LEFT JOIN expense_categories ec ON t.expense_category_id = ec.id
      WHERE t.id = ?`,
      [result.insertId]
    )

    res.status(201).json({
      success: true,
      message: "Transação criada com sucesso",
      data: transactions[0],
    })
  } catch (error) {
    console.error("Erro ao criar transação:", error)
    res.status(500).json({
      success: false,
      message: "Erro ao criar transação",
    })
  }
}

/**
 * Atualizar transação
 */
const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params
    const {
      description,
      amount,
      transaction_date,
      transaction_type,
      category_id,
      notes,
      tags,
    } = req.body

    // Verificar se transação pertence ao usuário
    const [existing] = await pool.query(
      "SELECT id FROM transactions WHERE id = ? AND user_id = ?",
      [id, req.userId]
    )

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Transação não encontrada",
      })
    }

    const updates = []
    const values = []

    if (description) {
      updates.push("description = ?")
      values.push(description)
    }

    if (amount) {
      updates.push("amount = ?")
      values.push(amount)
    }

    if (transaction_date) {
      updates.push("transaction_date = ?")
      values.push(transaction_date)
    }

    if (transaction_type) {
      if (!["INCOME", "EXPENSE"].includes(transaction_type.toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: "transaction_type deve ser INCOME ou EXPENSE",
        })
      }
      updates.push("transaction_type = ?")
      values.push(transaction_type.toUpperCase())

      // Atualizar categoria conforme tipo
      if (transaction_type.toUpperCase() === "INCOME") {
        updates.push("income_category_id = ?, expense_category_id = NULL")
        values.push(category_id || null)
      } else {
        updates.push("expense_category_id = ?, income_category_id = NULL")
        values.push(category_id || null)
      }
    } else if (category_id !== undefined) {
      // Se apenas categoria foi fornecida, manter o tipo existente
      const [current] = await pool.query(
        "SELECT transaction_type FROM transactions WHERE id = ?",
        [id]
      )

      if (current[0].transaction_type === "INCOME") {
        updates.push("income_category_id = ?")
        values.push(category_id)
      } else {
        updates.push("expense_category_id = ?")
        values.push(category_id)
      }
    }

    if (notes !== undefined) {
      updates.push("notes = ?")
      values.push(notes)
    }

    if (tags !== undefined) {
      updates.push("tags = ?")
      values.push(tags)
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Nenhum campo para atualizar",
      })
    }

    values.push(id)

    await pool.query(
      `UPDATE transactions SET ${updates.join(", ")} WHERE id = ?`,
      values
    )

    // Buscar transação atualizada
    const [transactions] = await pool.query(
      `SELECT 
        t.*,
        ic.name as income_category_name,
        ec.name as expense_category_name
      FROM transactions t
      LEFT JOIN income_categories ic ON t.income_category_id = ic.id
      LEFT JOIN expense_categories ec ON t.expense_category_id = ec.id
      WHERE t.id = ?`,
      [id]
    )

    res.json({
      success: true,
      message: "Transação atualizada com sucesso",
      data: transactions[0],
    })
  } catch (error) {
    console.error("Erro ao atualizar transação:", error)
    res.status(500).json({
      success: false,
      message: "Erro ao atualizar transação",
    })
  }
}

/**
 * Deletar transação
 */
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params

    const [result] = await pool.query(
      "DELETE FROM transactions WHERE id = ? AND user_id = ?",
      [id, req.userId]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Transação não encontrada",
      })
    }

    res.json({
      success: true,
      message: "Transação deletada com sucesso",
    })
  } catch (error) {
    console.error("Erro ao deletar transação:", error)
    res.status(500).json({
      success: false,
      message: "Erro ao deletar transação",
    })
  }
}

/**
 * Obter resumo financeiro
 */
const getSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query

    let query = `
      SELECT 
        SUM(CASE WHEN transaction_type = 'INCOME' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN transaction_type = 'EXPENSE' THEN amount ELSE 0 END) as total_expense,
        SUM(CASE WHEN transaction_type = 'INCOME' THEN amount ELSE -amount END) as balance,
        COUNT(*) as total_transactions
      FROM transactions
      WHERE user_id = ?
    `

    const params = [req.userId]

    if (startDate) {
      query += " AND transaction_date >= ?"
      params.push(startDate)
    }

    if (endDate) {
      query += " AND transaction_date <= ?"
      params.push(endDate)
    }

    const [summary] = await pool.query(query, params)

    res.json({
      success: true,
      data: {
        total_income: parseFloat(summary[0].total_income) || 0,
        total_expense: parseFloat(summary[0].total_expense) || 0,
        balance: parseFloat(summary[0].balance) || 0,
        total_transactions: summary[0].total_transactions || 0,
      },
    })
  } catch (error) {
    console.error("Erro ao buscar resumo:", error)
    res.status(500).json({
      success: false,
      message: "Erro ao buscar resumo",
    })
  }
}

module.exports = {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
}
