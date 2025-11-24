const mysql = require('mysql2');

// 1. Conexão INICIAL (sem definir o banco de dados ainda)
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '', // Deixe vazio (padrão XAMPP)
});

console.log('⏳ Conectando ao MySQL para criar o banco...');

connection.connect(async (err) => {
    if (err) {
        console.error('❌ Erro na conexão inicial:', err.message);
        console.log('DICA: Verifique se o MySQL está ligado no XAMPP.');
        return;
    }
    console.log('✅ Conectado ao MySQL! Criando estrutura...');

    try {
        // Cria o Banco de Dados
        await query("CREATE DATABASE IF NOT EXISTS sistema_gestao_notas");
        await query("USE sistema_gestao_notas");
        console.log('-> Banco de dados criado/selecionado.');

        // Cria Tabela Usuários
        await query(`CREATE TABLE IF NOT EXISTS usuarios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nome VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            senha VARCHAR(255) NOT NULL,
            tipo ENUM('aluno', 'professor', 'administrador') NOT NULL
        )`);

        // Cria Tabela Cursos
        await query(`CREATE TABLE IF NOT EXISTS cursos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nome VARCHAR(100) NOT NULL,
            descricao TEXT
        )`);

        // Cria Tabela Disciplinas
        await query(`CREATE TABLE IF NOT EXISTS disciplinas (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nome VARCHAR(100) NOT NULL,
            carga_horaria INT NOT NULL,
            id_curso INT,
            FOREIGN KEY (id_curso) REFERENCES cursos(id)
        )`);

        // Cria Tabela Notas (Com a média automática)
        await query(`CREATE TABLE IF NOT EXISTS notas (
            id INT AUTO_INCREMENT PRIMARY KEY,
            id_aluno INT NOT NULL,
            id_disciplina INT NOT NULL,
            nota1 DECIMAL(5,2),
            nota2 DECIMAL(5,2),
            nota3 DECIMAL(5,2),
            media_final DECIMAL(5,2) GENERATED ALWAYS AS (
                ROUND((COALESCE(nota1,0) + COALESCE(nota2,0) + COALESCE(nota3,0)) / 3, 2)
            ) STORED,
            FOREIGN KEY (id_aluno) REFERENCES usuarios(id),
            FOREIGN KEY (id_disciplina) REFERENCES disciplinas(id)
        )`);
        console.log('-> Tabelas criadas com sucesso.');

        // --- INSERINDO DADOS DE TESTE ---

        // Verifica se tem usuários, se não tiver, cria
        const users = await query("SELECT * FROM usuarios");
        if (users.length === 0) {
            console.log('-> Inserindo alunos de teste...');
            await query(`INSERT INTO usuarios (nome, email, senha, tipo) VALUES
                ('Gustavo Almeida', 'gustavo@teste.com', '123', 'aluno'),
                ('Ana Souza', 'ana@escola.com', '123', 'aluno'),
                ('Bruno Martins', 'bruno@escola.com', '123', 'aluno')`);
        }

        // Verifica se tem cursos/disciplinas
        const cursos = await query("SELECT * FROM cursos");
        if (cursos.length === 0) {
            console.log('-> Inserindo cursos e disciplinas...');
            await query(`INSERT INTO cursos (nome, descricao) VALUES ('Sistemas de Informação', 'Tecnologia')`);
            await query(`INSERT INTO disciplinas (nome, carga_horaria, id_curso) VALUES 
                ('Programação Web', 80, 1), 
                ('Banco de Dados', 60, 1),
                ('Engenharia de Software', 70, 1)`);
        }

        console.log('\n✅ TUDO PRONTO! O banco foi instalado com sucesso.');
        console.log('👉 Agora rode: node server.js');
        process.exit();

    } catch (e) {
        console.error('❌ Erro ao criar banco:', e.message);
        process.exit(1);
    }
});

// Função auxiliar para facilitar o código
function query(sql) {
    return new Promise((resolve, reject) => {
        connection.query(sql, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}