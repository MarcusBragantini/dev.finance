const express = require("express")
const router = express.Router()
const authController = require("../controllers/authController")
const authMiddleware = require("../middleware/auth")

/**
 * @route   POST /api/auth/register
 * @desc    Registrar novo usuário
 * @access  Public
 */
router.post("/register", authController.register)

/**
 * @route   POST /api/auth/login
 * @desc    Login de usuário
 * @access  Public
 */
router.post("/login", authController.login)

/**
 * @route   GET /api/auth/profile
 * @desc    Obter perfil do usuário autenticado
 * @access  Private
 */
router.get("/profile", authMiddleware, authController.getProfile)

/**
 * @route   PUT /api/auth/profile
 * @desc    Atualizar perfil do usuário
 * @access  Private
 */
router.put("/profile", authMiddleware, authController.updateProfile)

module.exports = router
