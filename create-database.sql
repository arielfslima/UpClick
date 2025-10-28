-- Script para criar o banco de dados UpClick
-- Execute este script após instalar o PostgreSQL

-- Criar o banco de dados
CREATE DATABASE upclick;

-- Conectar ao banco
\c upclick;

-- Verificar conexão
SELECT 'Banco de dados UpClick criado com sucesso!' AS status;
