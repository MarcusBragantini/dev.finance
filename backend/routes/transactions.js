const express = require("express")
const router = express.Router()
const transactionController = require("../controllers/transactionController")
const authMiddleware = require("../middleware/auth")

// Todas as rotas requerem autenticação
router.use(authMiddleware)

/**
 * @route   GET /api/transactions
 * @desc    Listar todas as transações do usuário
 * @access  Private
 */
router.get("/", transactionController.getTransactions)

/**
 * @route   GET /api/transactions/summary
 * @desc    Obter resumo financeiro
 * @access  Private
 */
router.get("/summary", transactionController.getSummary)

/**
 * @route   GET /api/transactions/:id
 * @desc    Obter uma transação específica
 * @access  Private
 */
router.get("/:id", transactionController.getTransaction)

/**
 * @route   POST /api/transactions
 * @desc    Criar nova transação
 * @access  Private
 */
router.post("/", transactionController.createTransaction)

/**
 * @route   PUT /api/transactions/:id
 * @desc    Atualizar transação
 * @access  Private
 */
router.put("/:id", transactionController.updateTransaction)

/**
 * @route   DELETE /api/transactions/:id
 * @desc    Deletar transação
 * @access  Private
 */
router.delete("/:id", transactionController.deleteTransaction)

module.exports = router
