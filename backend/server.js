const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

// --- CONEXÃO COM O BANCO DO ARQUIVO SQL ---
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',      // Coloque sua senha aqui se tiver
    database: 'sistema_gestao_notas', // O nome exato que está no seu SQL
    multipleStatements: true
});

connection.connect((err) => {
    if (err) {
        console.error('❌ Erro Fatal no MySQL:', err.message);
        return;
    }
    console.log('✅ MySQL Conectado ao banco "sistema_gestao_notas"!');
    console.log('🚀 SERVIDOR PRONTO EM: http://127.0.0.1:3000');
});

// Função Helper para Promises
function query(sql, params) {
    return new Promise((resolve, reject) => {
        connection.query(sql, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
}

// --- ROTAS DO SISTEMA ---

// 1. LOGIN
app.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        // Busca na tabela 'usuarios' do seu SQL
        const users = await query("SELECT * FROM usuarios WHERE email = ?", [email]);
        
        if (users.length === 0) return res.status(401).json({ error: 'Usuário não encontrado' });
        
        const user = users[0];

        // ATENÇÃO: Seu SQL tem senhas em texto puro ('123456') para testes,
        // mas o sistema usa criptografia. Vamos permitir ambos para facilitar seus testes.
        let valid = false;
        if (user.senha === senha) {
            valid = true; // Permite login com os usuários do SQL importado
        } else {
            valid = await bcrypt.compare(senha, user.senha); // Permite login com usuários novos criados pelo site
        }

        if (!valid) return res.status(401).json({ error: 'Senha incorreta' });

        res.json({ id: user.id, nome: user.nome, email: user.email, tipo: user.tipo });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// 2. CADASTRO DE USUÁRIOS
app.post('/usuarios', async (req, res) => {
    console.log("📩 Novo cadastro:", req.body.email);
    try {
        const { nome, email, senha, tipo } = req.body; // tipo: 'aluno', 'professor', etc.

        if (!nome || !email || !senha) return res.status(400).json({ error: 'Preencha tudo.' });

        // Verifica duplicidade
        const check = await query("SELECT * FROM usuarios WHERE email = ?", [email]);
        if (check.length > 0) return res.status(409).json({ error: 'Email já cadastrado!' });

        // Criptografa senha para segurança
        const hash = await bcrypt.hash(senha, 10);
        
        // Insere na tabela 'usuarios'
        await query("INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)", [nome, email, hash, tipo]);
        
        res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
    } catch (e) {
        console.error("Erro cadastro:", e);
        res.status(500).json({ error: 'Erro interno.' });
    }
});

// 3. DROPDOWNS (Listar Alunos e Disciplinas)
app.get('/alunos-lista', async (req, res) => {
    // Busca apenas quem tem tipo = 'aluno'
    const alunos = await query("SELECT id, nome FROM usuarios WHERE tipo = 'aluno'");
    res.json(alunos);
});

app.get('/disciplinas-lista', async (req, res) => {
    // Busca na tabela 'disciplinas'
    const disc = await query("SELECT id, nome FROM disciplinas");
    res.json(disc);
});

// 4. NOTAS (Leitura e Criação)
app.get('/notas', async (req, res) => {
    // Join complexo para pegar nomes das tabelas relacionadas
    const sql = `
        SELECT n.id, u.nome AS aluno, d.nome AS disciplina, 
               n.nota1, n.nota2, n.nota3, n.media_final 
        FROM notas n 
        JOIN usuarios u ON n.id_aluno = u.id 
        JOIN disciplinas d ON n.id_disciplina = d.id 
        ORDER BY n.id DESC
    `;
    res.json(await query(sql));
});

app.post('/notas', async (req, res) => {
    // NÃO inserimos a media_final aqui, o seu banco SQL calcula sozinho (GENERATED ALWAYS)
    try {
        const { id_aluno, id_disciplina, nota1, nota2, nota3 } = req.body;
        await query(
            `INSERT INTO notas (id_aluno, id_disciplina, nota1, nota2, nota3) VALUES (?, ?, ?, ?, ?)`, 
            [id_aluno, id_disciplina, nota1, nota2, nota3]
        ); 
        res.json({ ok: true }); 
    } catch (e) {
        console.error("Erro nota:", e);
        res.status(500).json({ error: "Erro ao salvar nota" });
    }
});

// 5. RELATÓRIOS
app.get('/relatorios/media-geral', async (req, res) => {
    const sql = `
        SELECT d.nome as disciplina, AVG(n.media_final) as media 
        FROM notas n 
        JOIN disciplinas d ON n.id_disciplina = d.id 
        GROUP BY d.id
    `;
    res.json(await query(sql));
});

// Rotas extras de admin
app.get('/usuarios', async (req, res) => res.json(await query("SELECT id, nome, email, tipo FROM usuarios")));
app.delete('/usuarios/:id', async (req, res) => { await query("DELETE FROM usuarios WHERE id = ?", [req.params.id]); res.json({ok:true}); });

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`👂 Ouvindo na porta ${PORT}...`);
});