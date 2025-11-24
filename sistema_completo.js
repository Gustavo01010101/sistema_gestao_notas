const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

// Conexão sem banco definido (para poder apagar/criar)
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '', 
    multipleStatements: true
});

const SENHA_ADMIN_PADRAO = '123456';

console.log('🔥 INICIANDO REINICIALIZAÇÃO TOTAL DO SISTEMA...');

connection.connect(async (err) => {
    if (err) {
        console.error('❌ Erro fatal de conexão:', err.message);
        return;
    }
    console.log('✅ MySQL conectado.');

    try {
        // 1. DESTRÓI E RECRIAR O BANCO (Limpeza Nuclear)
        console.log('🗑️ Apagando banco antigo...');
        await query("DROP DATABASE IF EXISTS sistema_gestao_notas");
        
        console.log('🏗️ Criando banco novo...');
        await query("CREATE DATABASE sistema_gestao_notas");
        await query("USE sistema_gestao_notas");

        // 2. CRIA TABELAS
        await query(`CREATE TABLE usuarios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nome VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            senha VARCHAR(255) NOT NULL,
            tipo ENUM('aluno', 'professor', 'administrador') NOT NULL,
            data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        
        await query(`CREATE TABLE cursos (id INT AUTO_INCREMENT PRIMARY KEY, nome VARCHAR(100), descricao TEXT)`);
        await query(`CREATE TABLE disciplinas (id INT AUTO_INCREMENT PRIMARY KEY, nome VARCHAR(100), carga_horaria INT, id_curso INT)`);
        
        await query(`CREATE TABLE notas (
            id INT AUTO_INCREMENT PRIMARY KEY, id_aluno INT, id_disciplina INT, 
            nota1 DECIMAL(5,2), nota2 DECIMAL(5,2), nota3 DECIMAL(5,2),
            media_final DECIMAL(5,2) GENERATED ALWAYS AS (ROUND((COALESCE(nota1,0) + COALESCE(nota2,0) + COALESCE(nota3,0)) / 3, 2)) STORED
        )`);

        // 3. CRIA O ADMIN OBRIGATÓRIO
        console.log('🔐 Gerando senha segura para o Admin...');
        const hash = await bcrypt.hash(SENHA_ADMIN_PADRAO, 10);
        
        await query("INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)", 
            ['Admin Supremo', 'admin@escola.com', hash, 'administrador']);
        
        console.log('✅ ADMIN CRIADO COM SUCESSO!');
        console.log('-----------------------------------');
        console.log('📧 LOGIN: admin@escola.com');
        console.log('🔑 SENHA: ' + SENHA_ADMIN_PADRAO);
        console.log('-----------------------------------');

        // 4. INICIA O SERVIDOR
        app.listen(3000, () => {
            console.log('🚀 SERVIDOR PRONTO E RODANDO NA PORTA 3000');
            console.log('Pode abrir o index.html e logar.');
        });

    } catch (e) {
        console.error('❌ ERRO DURANTE A INSTALAÇÃO:', e);
    }
});

// --- ROTAS (O mesmo código de antes) ---

app.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        const users = await query("SELECT * FROM usuarios WHERE email = ?", [email]);
        if (users.length === 0) return res.status(401).json({ error: 'User not found' });
        
        const valid = await bcrypt.compare(senha, users[0].senha);
        if (!valid) return res.status(401).json({ error: 'Senha errada' });

        res.json(users[0]);
    } catch (e) { res.status(500).json(e); }
});

app.get('/usuarios', async (req, res) => res.json(await query("SELECT * FROM usuarios")));
app.post('/usuarios', async (req, res) => {
    try {
        const { nome, email, senha, tipo } = req.body;
        const hash = await bcrypt.hash(senha, 10);
        await query("INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)", [nome, email, hash, tipo]);
        res.status(201).json({ ok: true });
    } catch (e) { res.status(500).json(e); }
});
app.delete('/usuarios/:id', async (req, res) => {
    await query("DELETE FROM usuarios WHERE id = ?", [req.params.id]);
    res.json({ ok: true });
});

// Rotas de Notas e Dropdowns
app.get('/notas', async (req, res) => {
    const sql = `SELECT n.*, u.nome AS aluno, d.nome AS disciplina FROM notas n JOIN usuarios u ON n.id_aluno = u.id JOIN disciplinas d ON n.id_disciplina = d.id ORDER BY n.id DESC`;
    res.json(await query(sql));
});
app.post('/notas', async (req, res) => {
    const { id_aluno, id_disciplina, nota1, nota2, nota3 } = req.body;
    await query(`INSERT INTO notas (id_aluno, id_disciplina, nota1, nota2, nota3) VALUES (?, ?, ?, ?, ?)`, [id_aluno, id_disciplina, nota1, nota2, nota3]);
    res.status(201).json({ ok: true });
});
app.get('/alunos-lista', async (req, res) => res.json(await query("SELECT id, nome FROM usuarios WHERE tipo = 'aluno'")));
app.get('/disciplinas-lista', async (req, res) => res.json(await query("SELECT id, nome FROM disciplinas")));
app.get('/relatorios/media-geral', async (req, res) => {
    const sql = `SELECT d.nome as disciplina, AVG(n.media_final) as media FROM notas n JOIN disciplinas d ON n.id_disciplina = d.id GROUP BY d.id`;
    res.json(await query(sql));
});

function query(sql, params) {
    return new Promise((resolve, reject) => {
        connection.query(sql, params, (err, res) => {
            if (err) return reject(err);
            resolve(res);
        });
    });
}