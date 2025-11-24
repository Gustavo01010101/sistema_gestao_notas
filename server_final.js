const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json()); // Importante para ler o JSON do front

// Conecta no banco
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '', // Coloque sua senha se tiver
    database: 'sistema_gestao_notas'
});

console.log('🚀 SERVIDOR FINAL INICIADO! AGUARDANDO LOGIN...');

// Rota de Login "X-9" (Com Logs Detalhados)
app.post('/login', async (req, res) => {
    console.log('\n------------------------------------------------');
    console.log('📨 RECEBI UMA TENTATIVA DE LOGIN!');
    
    const { email, senha } = req.body;
    console.log(`👤 Email recebido: "${email}"`);
    console.log(`🔑 Senha recebida: "${senha}"`);

    if (!email || !senha) {
        console.log('❌ ERRO: Email ou senha vieram vazios!');
        return res.status(400).json({ error: 'Dados incompletos' });
    }

    // Busca no banco
    connection.query("SELECT * FROM usuarios WHERE email = ?", [email], async (err, results) => {
        if (err) {
            console.log('❌ ERRO NO SQL:', err);
            return res.status(500).json({ error: 'Erro interno' });
        }

        if (results.length === 0) {
            console.log('❌ ERRO: Usuário não encontrado no banco.');
            return res.status(401).json({ error: 'Usuário não existe' });
        }

        const usuario = results[0];
        console.log('✅ Usuário encontrado no banco!');
        console.log('🔒 Hash guardado:', usuario.senha.substring(0, 20) + '...');

        // Compara senha
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        
        if (senhaValida) {
            console.log('✅ SUCESSO! A senha bateu. Logando...');
            res.json({ id: usuario.id, nome: usuario.nome, email: usuario.email, tipo: usuario.tipo });
        } else {
            console.log('❌ ERRO: A senha não bateu com o hash.');
            console.log('👉 Dica: Verifique espaços em branco ou Caps Lock.');
            res.status(401).json({ error: 'Senha incorreta' });
        }
    });
});

// Rotas do CRUD (Resumidas para funcionar o menu)
app.get('/alunos-lista', (req, res) => connection.query("SELECT id, nome FROM usuarios WHERE tipo='aluno'", (e,r) => res.json(r)));
app.get('/disciplinas-lista', (req, res) => connection.query("SELECT id, nome FROM disciplinas", (e,r) => res.json(r)));
app.get('/notas', (req, res) => connection.query("SELECT * FROM notas", (e,r) => res.json(r)));
app.get('/relatorios/media-geral', (req, res) => res.json([])); // Placeholder para não dar erro 404

app.listen(3000, '0.0.0.0', () => console.log('👂 SERVIDOR VISÍVEL: Ouvindo em http://127.0.0.1:3000'));