const { pool } = require("../config/database")

/**
 * Listar categorias de receitas
 */
const getIncomeCategories = async (req, res) => {
  try {
    const [categories] = await pool.query(
      "SELECT * FROM income_categories ORDER BY name ASC"
    )

    res.json({
      success: true,
      data: categories,
    })
  } catch (error) {
    console.error("Erro ao buscar categorias de receitas:", error)
    res.status(500).json({
      success: false,
      message: "Erro ao buscar categorias",
    })
  }
}

/**
 * Listar categorias de despesas
 */
const getExpenseCategories = async (req, res) => {
  try {
    const { type } = req.query

    let query = `
      SELECT 
        c.*,
        p.name as parent_name
      FROM expense_categories c
      LEFT JOIN expense_categories p ON c.parent_id = p.id
    `

    const params = []

    if (type) {
      query += " WHERE c.category_type = ?"
      params.push(type.toUpperCase())
    }

    query += " ORDER BY c.parent_id, c.name ASC"

    const [categories] = await pool.query(query, params)

    // Organizar em hierarquia
    const organized = categories.reduce((acc, cat) => {
      if (!cat.parent_id) {
        acc.push({
          ...cat,
          subcategories: categories.filter((sub) => sub.parent_id === cat.id),
        })
      }
      return acc
    }, [])

    res.json({
      success: true,
      data: organized,
    })
  } catch (error) {
    console.error("Erro ao buscar categorias de despesas:", error)
    res.status(500).json({
      success: false,
      message: "Erro ao buscar categorias",
    })
  }
}

/**
 * Listar todas as categorias (receitas e despesas)
 */
const getAllCategories = async (req, res) => {
  try {
    const [incomeCategories] = await pool.query(
      'SELECT id, name, description, icon, color, "INCOME" as type FROM income_categories ORDER BY name'
    )

    const [expenseCategories] = await pool.query(
      `SELECT 
        c.id, 
        c.name, 
        c.description, 
        c.icon, 
        c.color, 
        c.category_type,
        c.parent_id,
        p.name as parent_name,
        "EXPENSE" as type
      FROM expense_categories c
      LEFT JOIN expense_categories p ON c.parent_id = p.id
      ORDER BY c.parent_id, c.name`
    )

    res.json({
      success: true,
      data: {
        income: incomeCategories,
        expense: expenseCategories,
      },
    })
  } catch (error) {
    console.error("Erro ao buscar categorias:", error)
    res.status(500).json({
      success: false,
      message: "Erro ao buscar categorias",
    })
  }
}

module.exports = {
  getIncomeCategories,
  getExpenseCategories,
  getAllCategories,
}
