const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

// Conecta no banco
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'sistema_gestao_notas'
});

console.log('🔧 Iniciando reparo do login...');

connection.connect(async (err) => {
    if (err) {
        console.error('❌ Erro: O banco de dados "sistema_gestao_notas" não foi encontrado.');
        console.log('Rode o "node server.js" primeiro para criar o banco vazio.');
        process.exit(1);
    }

    // 1. Apaga qualquer usuário com esse email (para limpar o antigo bugado)
    connection.query("DELETE FROM usuarios WHERE email = 'admin@escola.com'", async (err) => {
        if (err) console.error('Erro ao limpar:', err);
        
        // 2. Gera a senha criptografada correta
        const senhaForte = await bcrypt.hash('123456', 10);

        // 3. Insere o Admin Novinho
        const sql = "INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)";
        connection.query(sql, ['Admin Supremo', 'admin@escola.com', senhaForte, 'administrador'], (err) => {
            if (err) {
                console.error('❌ Erro ao criar admin:', err.message);
            } else {
                console.log('\n✅ SUCESSO! O Admin foi recriado corretamente.');
                console.log('------------------------------------------------');
                console.log('📧 Email: admin@escola.com');
                console.log('🔑 Senha: 123456');
                console.log('------------------------------------------------');
                console.log('Agora rode o servidor (node server.js) e tente entrar!');
            }
            process.exit();
        });
    });
});