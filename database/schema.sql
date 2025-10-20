-- =====================================================
-- DEV.FINANCE$ - Sistema de Controle Financeiro
-- Banco de Dados MySQL
-- =====================================================

-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS dev_finance CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dev_finance;

-- =====================================================
-- Tabela de Usuários
-- =====================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    active BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email),
    INDEX idx_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabela de Categorias de Receitas
-- =====================================================
CREATE TABLE income_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50) DEFAULT 'income',
    color VARCHAR(7) DEFAULT '#12a454',
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabela de Categorias de Despesas
-- =====================================================
CREATE TABLE expense_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id INT DEFAULT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50) DEFAULT 'expense',
    color VARCHAR(7) DEFAULT '#e92929',
    is_system BOOLEAN DEFAULT FALSE,
    category_type ENUM('MENSAL_FIXA', 'MENSAL_VARIAVEL', 'ANUAL_EVENTUAL') DEFAULT 'MENSAL_VARIAVEL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES expense_categories(id) ON DELETE SET NULL,
    INDEX idx_parent (parent_id),
    INDEX idx_type (category_type),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabela de Transações
-- =====================================================
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    transaction_date DATE NOT NULL,
    transaction_type ENUM('INCOME', 'EXPENSE') NOT NULL,
    income_category_id INT DEFAULT NULL,
    expense_category_id INT DEFAULT NULL,
    notes TEXT,
    tags VARCHAR(255),
    attachment VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (income_category_id) REFERENCES income_categories(id) ON DELETE SET NULL,
    FOREIGN KEY (expense_category_id) REFERENCES expense_categories(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_date (transaction_date),
    INDEX idx_type (transaction_type),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabela de Metas Financeiras
-- =====================================================
CREATE TABLE financial_goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    target_amount DECIMAL(15, 2) NOT NULL,
    current_amount DECIMAL(15, 2) DEFAULT 0,
    target_date DATE,
    status ENUM('ACTIVE', 'COMPLETED', 'CANCELLED') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabela de Investimentos
-- =====================================================
CREATE TABLE investments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    investment_type ENUM('EMERGENCIA', 'EDUCACAO', 'APOSENTADORIA', 'OUTROS_PROJETOS') NOT NULL,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    investment_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_type (investment_type),
    INDEX idx_date (investment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Inserir Categorias de Receitas Padrão
-- =====================================================
INSERT INTO income_categories (name, description, is_system) VALUES
('Salário', 'Salário mensal', TRUE),
('13º Salário', 'Décimo terceiro salário', TRUE),
('Bônus', 'Bônus e gratificações', TRUE),
('Férias', 'Pagamento de férias', TRUE),
('PLR / Comissão', 'Participação nos lucros e comissões', TRUE),
('Freelance', 'Trabalhos autônomos', TRUE),
('Investimentos', 'Rendimentos de investimentos', TRUE),
('Outros', 'Outras receitas', TRUE);

-- =====================================================
-- Inserir Categorias de Despesas Padrão
-- =====================================================

-- MENSAIS FIXAS - Moradia/Habitação
INSERT INTO expense_categories (name, description, category_type, is_system, parent_id) VALUES
('Moradia / Habitação', 'Despesas com moradia', 'MENSAL_FIXA', TRUE, NULL);
SET @moradia_id = LAST_INSERT_ID();
INSERT INTO expense_categories (parent_id, name, description, category_type, is_system) VALUES
(@moradia_id, 'Aluguel', 'Aluguel mensal', 'MENSAL_FIXA', TRUE),
(@moradia_id, 'Condomínio', 'Taxa de condomínio', 'MENSAL_FIXA', TRUE),
(@moradia_id, 'Financiamento casa', 'Prestação do financiamento', 'MENSAL_FIXA', TRUE),
(@moradia_id, 'Diarista/Mensalista', 'Serviços de limpeza', 'MENSAL_FIXA', TRUE),
(@moradia_id, 'Seguro da casa', 'Seguro residencial', 'MENSAL_FIXA', TRUE),
(@moradia_id, 'IPTU', 'Imposto predial', 'MENSAL_FIXA', TRUE);

-- MENSAIS FIXAS - Educação
INSERT INTO expense_categories (name, description, category_type, is_system, parent_id) VALUES
('Educação', 'Despesas com educação', 'MENSAL_FIXA', TRUE, NULL);
SET @educacao_id = LAST_INSERT_ID();
INSERT INTO expense_categories (parent_id, name, description, category_type, is_system) VALUES
(@educacao_id, 'Colégio', 'Mensalidade escolar', 'MENSAL_FIXA', TRUE),
(@educacao_id, 'Faculdade', 'Mensalidade universitária', 'MENSAL_FIXA', TRUE),
(@educacao_id, 'Idiomas / cursos', 'Cursos e idiomas', 'MENSAL_FIXA', TRUE);

-- MENSAIS FIXAS - Transporte
INSERT INTO expense_categories (name, description, category_type, is_system, parent_id) VALUES
('Transporte', 'Despesas com transporte', 'MENSAL_FIXA', TRUE, NULL);
SET @transporte_id = LAST_INSERT_ID();
INSERT INTO expense_categories (parent_id, name, description, category_type, is_system) VALUES
(@transporte_id, 'Prestação do carro', 'Financiamento do veículo', 'MENSAL_FIXA', TRUE),
(@transporte_id, 'Seguro do carro', 'Seguro do veículo', 'MENSAL_FIXA', TRUE),
(@transporte_id, 'IPVA', 'Imposto do veículo', 'MENSAL_FIXA', TRUE);

-- MENSAIS FIXAS - Saúde
INSERT INTO expense_categories (name, description, category_type, is_system, parent_id) VALUES
('Saúde', 'Despesas com saúde', 'MENSAL_FIXA', TRUE, NULL);
SET @saude_id = LAST_INSERT_ID();
INSERT INTO expense_categories (parent_id, name, description, category_type, is_system) VALUES
(@saude_id, 'Plano de saúde', 'Plano médico', 'MENSAL_FIXA', TRUE),
(@saude_id, 'Academia', 'Academia e exercícios', 'MENSAL_FIXA', TRUE);

-- MENSAIS FIXAS - Outros
INSERT INTO expense_categories (name, description, category_type, is_system, parent_id) VALUES
('Outros Fixos', 'Outras despesas fixas', 'MENSAL_FIXA', TRUE, NULL);
SET @outros_fixos_id = LAST_INSERT_ID();
INSERT INTO expense_categories (parent_id, name, description, category_type, is_system) VALUES
(@outros_fixos_id, 'Seguro de vida', 'Seguro de vida', 'MENSAL_FIXA', TRUE),
(@outros_fixos_id, 'Empréstimos', 'Parcelas de empréstimos', 'MENSAL_FIXA', TRUE);

-- MENSAIS VARIÁVEIS - Habitação
INSERT INTO expense_categories (name, description, category_type, is_system, parent_id) VALUES
('Habitação Variável', 'Despesas variáveis com habitação', 'MENSAL_VARIAVEL', TRUE, NULL);
SET @habitacao_var_id = LAST_INSERT_ID();
INSERT INTO expense_categories (parent_id, name, description, category_type, is_system) VALUES
(@habitacao_var_id, 'Luz', 'Conta de energia', 'MENSAL_VARIAVEL', TRUE),
(@habitacao_var_id, 'Internet / TV', 'Internet e TV', 'MENSAL_VARIAVEL', TRUE),
(@habitacao_var_id, 'Água', 'Conta de água', 'MENSAL_VARIAVEL', TRUE),
(@habitacao_var_id, 'Gás', 'Gás de cozinha', 'MENSAL_VARIAVEL', TRUE),
(@habitacao_var_id, 'Telefone / celular', 'Telefonia', 'MENSAL_VARIAVEL', TRUE);

-- MENSAIS VARIÁVEIS - Transporte
INSERT INTO expense_categories (name, description, category_type, is_system, parent_id) VALUES
('Transporte Variável', 'Despesas variáveis com transporte', 'MENSAL_VARIAVEL', TRUE, NULL);
SET @transporte_var_id = LAST_INSERT_ID();
INSERT INTO expense_categories (parent_id, name, description, category_type, is_system) VALUES
(@transporte_var_id, 'Combustível', 'Gasolina, etanol, diesel', 'MENSAL_VARIAVEL', TRUE),
(@transporte_var_id, 'Estacionamento', 'Estacionamento', 'MENSAL_VARIAVEL', TRUE),
(@transporte_var_id, 'Taxi / Uber', 'Transporte por aplicativo', 'MENSAL_VARIAVEL', TRUE),
(@transporte_var_id, 'Ônibus / metrô', 'Transporte público', 'MENSAL_VARIAVEL', TRUE);

-- MENSAIS VARIÁVEIS - Alimentação
INSERT INTO expense_categories (name, description, category_type, is_system, parent_id) VALUES
('Alimentação', 'Despesas com alimentação', 'MENSAL_VARIAVEL', TRUE, NULL);
SET @alimentacao_id = LAST_INSERT_ID();
INSERT INTO expense_categories (parent_id, name, description, category_type, is_system) VALUES
(@alimentacao_id, 'Supermercado', 'Compras no supermercado', 'MENSAL_VARIAVEL', TRUE),
(@alimentacao_id, 'Feira / padaria', 'Feira e padaria', 'MENSAL_VARIAVEL', TRUE);

-- MENSAIS VARIÁVEIS - Lazer
INSERT INTO expense_categories (name, description, category_type, is_system, parent_id) VALUES
('Lazer', 'Despesas com lazer', 'MENSAL_VARIAVEL', TRUE, NULL);
SET @lazer_id = LAST_INSERT_ID();
INSERT INTO expense_categories (parent_id, name, description, category_type, is_system) VALUES
(@lazer_id, 'Viagens/Passeios', 'Viagens e passeios', 'MENSAL_VARIAVEL', TRUE),
(@lazer_id, 'Cinema/teatro', 'Cinema e teatro', 'MENSAL_VARIAVEL', TRUE),
(@lazer_id, 'Restaurantes/bares', 'Restaurantes e bares', 'MENSAL_VARIAVEL', TRUE),
(@lazer_id, 'Clube', 'Clube recreativo', 'MENSAL_VARIAVEL', TRUE),
(@lazer_id, 'Streaming', 'Netflix, Spotify, etc', 'MENSAL_VARIAVEL', TRUE);

-- MENSAIS VARIÁVEIS - Outros
INSERT INTO expense_categories (name, description, category_type, is_system, parent_id) VALUES
('Outros Variáveis', 'Outras despesas variáveis', 'MENSAL_VARIAVEL', TRUE, NULL);
SET @outros_var_id = LAST_INSERT_ID();
INSERT INTO expense_categories (parent_id, name, description, category_type, is_system) VALUES
(@outros_var_id, 'Tarifas Banco', 'Tarifas bancárias', 'MENSAL_VARIAVEL', TRUE);

-- ANUAIS / EVENTUAIS - Saúde
INSERT INTO expense_categories (name, description, category_type, is_system, parent_id) VALUES
('Saúde Eventual', 'Despesas eventuais com saúde', 'ANUAL_EVENTUAL', TRUE, NULL);
SET @saude_ev_id = LAST_INSERT_ID();
INSERT INTO expense_categories (parent_id, name, description, category_type, is_system) VALUES
(@saude_ev_id, 'Médico / Hospital', 'Consultas e hospitais', 'ANUAL_EVENTUAL', TRUE),
(@saude_ev_id, 'Medicamentos', 'Medicamentos', 'ANUAL_EVENTUAL', TRUE);

-- ANUAIS / EVENTUAIS - Educação
INSERT INTO expense_categories (name, description, category_type, is_system, parent_id) VALUES
('Educação Eventual', 'Despesas eventuais com educação', 'ANUAL_EVENTUAL', TRUE, NULL);
SET @educacao_ev_id = LAST_INSERT_ID();
INSERT INTO expense_categories (parent_id, name, description, category_type, is_system) VALUES
(@educacao_ev_id, 'Material escolar', 'Material escolar', 'ANUAL_EVENTUAL', TRUE),
(@educacao_ev_id, 'Uniforme', 'Uniformes escolares', 'ANUAL_EVENTUAL', TRUE);

-- ANUAIS / EVENTUAIS - Manutenção
INSERT INTO expense_categories (name, description, category_type, is_system, parent_id) VALUES
('Manutenção / Prevenção', 'Manutenção e reparos', 'ANUAL_EVENTUAL', TRUE, NULL);
SET @manutencao_id = LAST_INSERT_ID();
INSERT INTO expense_categories (parent_id, name, description, category_type, is_system) VALUES
(@manutencao_id, 'Carro', 'Manutenção do carro', 'ANUAL_EVENTUAL', TRUE),
(@manutencao_id, 'Casa', 'Manutenção da casa', 'ANUAL_EVENTUAL', TRUE);

-- ANUAIS / EVENTUAIS - Vestuário
INSERT INTO expense_categories (name, description, category_type, is_system, parent_id) VALUES
('Vestuário', 'Roupas e acessórios', 'ANUAL_EVENTUAL', TRUE, NULL);
SET @vestuario_id = LAST_INSERT_ID();
INSERT INTO expense_categories (parent_id, name, description, category_type, is_system) VALUES
(@vestuario_id, 'Roupas', 'Roupas', 'ANUAL_EVENTUAL', TRUE),
(@vestuario_id, 'Calçados', 'Calçados', 'ANUAL_EVENTUAL', TRUE),
(@vestuario_id, 'Acessórios', 'Acessórios', 'ANUAL_EVENTUAL', TRUE);

-- ANUAIS / EVENTUAIS - Cuidados Pessoais
INSERT INTO expense_categories (name, description, category_type, is_system, parent_id) VALUES
('Cuidados Pessoais', 'Cuidados pessoais', 'ANUAL_EVENTUAL', TRUE, NULL);
SET @cuidados_id = LAST_INSERT_ID();
INSERT INTO expense_categories (parent_id, name, description, category_type, is_system) VALUES
(@cuidados_id, 'Corte de cabelo', 'Barbeiro / cabeleireiro', 'ANUAL_EVENTUAL', TRUE),
(@cuidados_id, 'Estética/Manicure', 'Estética e manicure', 'ANUAL_EVENTUAL', TRUE),
(@cuidados_id, 'Farmácia / Drogaria', 'Produtos de farmácia', 'ANUAL_EVENTUAL', TRUE);

-- ANUAIS / EVENTUAIS - Outros
INSERT INTO expense_categories (name, description, category_type, is_system, parent_id) VALUES
('Outros Eventuais', 'Outras despesas eventuais', 'ANUAL_EVENTUAL', TRUE, NULL);
SET @outros_ev_id = LAST_INSERT_ID();
INSERT INTO expense_categories (parent_id, name, description, category_type, is_system) VALUES
(@outros_ev_id, 'Presentes', 'Presentes', 'ANUAL_EVENTUAL', TRUE),
(@outros_ev_id, 'Outros Impostos', 'Outros impostos', 'ANUAL_EVENTUAL', TRUE);

-- =====================================================
-- View para Relatórios Mensais
-- =====================================================
CREATE OR REPLACE VIEW v_monthly_summary AS
SELECT 
    u.id as user_id,
    u.name as user_name,
    YEAR(t.transaction_date) as year,
    MONTH(t.transaction_date) as month,
    t.transaction_type,
    SUM(CASE WHEN t.transaction_type = 'INCOME' THEN t.amount ELSE 0 END) as total_income,
    SUM(CASE WHEN t.transaction_type = 'EXPENSE' THEN t.amount ELSE 0 END) as total_expense,
    SUM(CASE WHEN t.transaction_type = 'INCOME' THEN t.amount ELSE -t.amount END) as balance
FROM users u
LEFT JOIN transactions t ON u.id = t.user_id
GROUP BY u.id, u.name, YEAR(t.transaction_date), MONTH(t.transaction_date), t.transaction_type;

-- =====================================================
-- View para Dashboard
-- =====================================================
CREATE OR REPLACE VIEW v_user_dashboard AS
SELECT 
    u.id as user_id,
    u.name as user_name,
    u.email,
    COUNT(DISTINCT t.id) as total_transactions,
    SUM(CASE WHEN t.transaction_type = 'INCOME' THEN t.amount ELSE 0 END) as total_income,
    SUM(CASE WHEN t.transaction_type = 'EXPENSE' THEN t.amount ELSE 0 END) as total_expense,
    SUM(CASE WHEN t.transaction_type = 'INCOME' THEN t.amount ELSE -t.amount END) as current_balance,
    (SELECT SUM(current_amount) FROM financial_goals WHERE user_id = u.id AND status = 'ACTIVE') as goals_saved,
    (SELECT SUM(amount) FROM investments WHERE user_id = u.id) as total_invested
FROM users u
LEFT JOIN transactions t ON u.id = t.user_id
GROUP BY u.id, u.name, u.email;

-- =====================================================
-- Criar usuário de exemplo (senha: admin123)
-- Nota: Em produção, use bcrypt para hash de senha
-- =====================================================
INSERT INTO users (name, email, password) VALUES
('Administrador', 'admin@devfinance.com', '$2a$10$xQp6KZqCxGKEYBZJLw7cj.L0VEYJrYvV5VxJ3P8VxZwGZfQyLNQYO');

-- =====================================================
-- Índices adicionais para performance
-- =====================================================
CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date);
CREATE INDEX idx_transactions_user_type ON transactions(user_id, transaction_type);
CREATE INDEX idx_transactions_amount ON transactions(amount);

-- =====================================================
-- Fim do Script
-- =====================================================

