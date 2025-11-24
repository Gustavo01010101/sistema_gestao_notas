const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

// Conecta no banco
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '', // Se seu MySQL tiver senha, coloque aqui
    database: 'sistema_gestao_notas'
});

console.log('🕵️ INICIANDO INVESTIGAÇÃO...');

connection.connect(async (err) => {
    if (err) {
        console.log('❌ ERRO FATAL: Não consegui conectar no MySQL.');
        console.log('Motivo:', err.message);
        process.exit();
    }

    // 1. Verifica se o usuário existe
    connection.query("SELECT * FROM usuarios WHERE email = 'admin@escola.com'", async (err, results) => {
        if (results.length === 0) {
            console.log('❌ ERRO ENCONTRADO: O usuário admin@escola.com NÃO EXISTE no banco de dados.');
            console.log('Solução: O script de criação do banco não rodou até o fim.');
        } else {
            const usuario = results[0];
            console.log('✅ Usuário encontrado no banco:', usuario.email);
            console.log('🔑 Hash gravado no banco:', usuario.senha);

            // 2. Tenta comparar a senha na força bruta
            const senhaCorreta = await bcrypt.compare('123456', usuario.senha);
            
            if (senhaCorreta) {
                console.log('\n✅ RESULTADO: A senha no banco ESTÁ CORRETA (é 123456).');
                console.log('👉 Se o login falha no site, o problema é o navegador enviando os dados errado.');
            } else {
                console.log('\n❌ RESULTADO: A senha no banco ESTÁ ERRADA.');
                console.log('👉 O banco gravou algo que não é "123456".');
            }
        }
        connection.end();
    });
});