const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'sistema_gestao_notas',
    multipleStatements: true
});

connection.connect(async (err) => {
    if (err) return console.error('❌ Erro MySQL:', err.message);
    console.log('✅ MySQL Conectado!');
    
    // --- AUTO-SEED CORRIGIDO ---
    await setupInicial();

    app.listen(3000, () => console.log('🚀 SISTEMA PRONTO: http://127.0.0.1:3000'));
});

function query(sql, params) {
    return new Promise((resolve, reject) => {
        connection.query(sql, params, (err, res) => { if (err) return reject(err); resolve(res); });
    });
}

// --- FUNÇÃO QUE CRIA AS MATÉRIAS SE ELAS FALTAREM ---
async function setupInicial() {
    try {
        // 1. Garante que existe um Curso
        const cursos = await query("SELECT * FROM cursos");
        if (cursos.length === 0) {
            await query("INSERT INTO cursos (nome, descricao) VALUES ('Ensino Médio', 'Curso Regular')");
            console.log("🌱 Curso criado.");
        }

        // 2. Garante que existem Disciplinas (CORREÇÃO AQUI)
        const disciplinas = await query("SELECT * FROM disciplinas");
        if (disciplinas.length === 0) {
            console.log("🌱 Criando matérias que faltavam...");
            await query("INSERT INTO disciplinas (nome, carga_horaria, id_curso) VALUES ('Matemática', 80, 1), ('Português', 80, 1), ('História', 60, 1), ('Geografia', 60, 1), ('Ciências', 60, 1)");
            console.log("✅ Matérias criadas com sucesso!");
        }
    } catch (e) { console.error("Erro no setup:", e); }
}

// --- ROTAS ---

app.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        const users = await query("SELECT * FROM usuarios WHERE email = ?", [email]);
        if (users.length === 0) return res.status(401).json({ error: 'Usuário não encontrado' });
        const valid = await bcrypt.compare(senha, users[0].senha);
        if (!valid) return res.status(401).json({ error: 'Senha incorreta' });
        res.json({ id: users[0].id, nome: users[0].nome, email: users[0].email, tipo: users[0].tipo });
    } catch (e) { res.status(500).json(e); }
});

app.post('/usuarios', async (req, res) => {
    try {
        const { nome, email, senha, tipo } = req.body;
        if (!nome || !email || !senha) return res.status(400).json({ error: 'Preencha tudo' });
        const check = await query("SELECT * FROM usuarios WHERE email = ?", [email]);
        if (check.length > 0) return res.status(409).json({ error: 'Email já existe' });
        const hash = await bcrypt.hash(senha, 10);
        await query("INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)", [nome, email, hash, tipo]);
        res.status(201).json({ message: 'Cadastrado!' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/usuarios', async (req, res) => res.json(await query("SELECT id, nome, email, tipo FROM usuarios")));
app.delete('/usuarios/:id', async (req, res) => { await query("DELETE FROM usuarios WHERE id = ?", [req.params.id]); res.json({ok:true}); });

// DROPDOWNS
app.get('/alunos-lista', async (req, res) => res.json(await query("SELECT id, nome FROM usuarios WHERE tipo = 'aluno'")));
app.get('/disciplinas-lista', async (req, res) => res.json(await query("SELECT id, nome FROM disciplinas")));

// ROTAS DE NOTAS E RELATÓRIOS (ISSO FAZ O NOME APARECER NO HISTÓRICO)
app.get('/notas', async (req, res) => {
    // Este JOIN garante que pegamos o NOME do aluno e o NOME da disciplina
    const sql = `
        SELECT n.id, u.nome AS aluno, d.nome AS disciplina, n.nota1, n.nota2, n.nota3, n.media_final 
        FROM notas n 
        JOIN usuarios u ON n.id_aluno = u.id 
        JOIN disciplinas d ON n.id_disciplina = d.id 
        ORDER BY n.id DESC
    `;
    res.json(await query(sql));
});

app.post('/notas', async (req, res) => { 
    await query(`INSERT INTO notas (id_aluno, id_disciplina, nota1, nota2, nota3) VALUES (?, ?, ?, ?, ?)`, [req.body.id_aluno, req.body.id_disciplina, req.body.nota1, req.body.nota2, req.body.nota3]); 
    res.json({ok:true}); 
});

app.get('/relatorios/media-geral', async (req, res) => res.json(await query(`SELECT d.nome as disciplina, AVG(n.media_final) as media FROM notas n JOIN disciplinas d ON n.id_disciplina = d.id GROUP BY d.id`)));