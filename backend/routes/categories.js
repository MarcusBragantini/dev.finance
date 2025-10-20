const express = require("express")
const router = express.Router()
const categoryController = require("../controllers/categoryController")
const authMiddleware = require("../middleware/auth")

// Todas as rotas requerem autenticação
router.use(authMiddleware)

/**
 * @route   GET /api/categories
 * @desc    Listar todas as categorias
 * @access  Private
 */
router.get("/", categoryController.getAllCategories)

/**
 * @route   GET /api/categories/income
 * @desc    Listar categorias de receitas
 * @access  Private
 */
router.get("/income", categoryController.getIncomeCategories)

/**
 * @route   GET /api/categories/expense
 * @desc    Listar categorias de despesas
 * @access  Private
 */
router.get("/expense", categoryController.getExpenseCategories)

module.exports = router
