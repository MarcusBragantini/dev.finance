const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { pool } = require("../config/database")

/**
 * Gerar token JWT
 */
const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  })
}

/**
 * Registro de novo usuário
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Validação básica
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Por favor, preencha todos os campos obrigatórios",
      })
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Email inválido",
      })
    }

    // Validar senha (mínimo 6 caracteres)
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "A senha deve ter no mínimo 6 caracteres",
      })
    }

    // Verificar se email já existe
    const [existingUsers] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    )

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Este email já está cadastrado",
      })
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10)

    // Inserir usuário
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    )

    // Buscar usuário criado
    const [users] = await pool.query(
      "SELECT id, name, email, created_at FROM users WHERE id = ?",
      [result.insertId]
    )

    const user = users[0]

    // Gerar token
    const token = generateToken(user)

    res.status(201).json({
      success: true,
      message: "Usuário registrado com sucesso",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token,
      },
    })
  } catch (error) {
    console.error("Erro no registro:", error)
    res.status(500).json({
      success: false,
      message: "Erro ao registrar usuário",
    })
  }
}

/**
 * Login de usuário
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validação básica
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Por favor, forneça email e senha",
      })
    }

    // Buscar usuário
    const [users] = await pool.query(
      "SELECT id, name, email, password, active FROM users WHERE email = ?",
      [email]
    )

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Email ou senha incorretos",
      })
    }

    const user = users[0]

    // Verificar se usuário está ativo
    if (!user.active) {
      return res.status(401).json({
        success: false,
        message: "Usuário desativado",
      })
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Email ou senha incorretos",
      })
    }

    // Atualizar último login
    await pool.query("UPDATE users SET last_login = NOW() WHERE id = ?", [
      user.id,
    ])

    // Gerar token
    const token = generateToken(user)

    res.json({
      success: true,
      message: "Login realizado com sucesso",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token,
      },
    })
  } catch (error) {
    console.error("Erro no login:", error)
    res.status(500).json({
      success: false,
      message: "Erro ao fazer login",
    })
  }
}

/**
 * Obter perfil do usuário autenticado
 */
const getProfile = async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT id, name, email, avatar, created_at, last_login 
       FROM users WHERE id = ?`,
      [req.userId]
    )

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado",
      })
    }

    res.json({
      success: true,
      data: users[0],
    })
  } catch (error) {
    console.error("Erro ao buscar perfil:", error)
    res.status(500).json({
      success: false,
      message: "Erro ao buscar perfil",
    })
  }
}

/**
 * Atualizar perfil do usuário
 */
const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body
    const updates = []
    const values = []

    if (name) {
      updates.push("name = ?")
      values.push(name)
    }

    if (email) {
      // Verificar se email já existe para outro usuário
      const [existingUsers] = await pool.query(
        "SELECT id FROM users WHERE email = ? AND id != ?",
        [email, req.userId]
      )

      if (existingUsers.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Este email já está em uso",
        })
      }

      updates.push("email = ?")
      values.push(email)
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Nenhum campo para atualizar",
      })
    }

    values.push(req.userId)

    await pool.query(
      `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
      values
    )

    // Buscar usuário atualizado
    const [users] = await pool.query(
      "SELECT id, name, email, avatar FROM users WHERE id = ?",
      [req.userId]
    )

    res.json({
      success: true,
      message: "Perfil atualizado com sucesso",
      data: users[0],
    })
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error)
    res.status(500).json({
      success: false,
      message: "Erro ao atualizar perfil",
    })
  }
}

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
}
