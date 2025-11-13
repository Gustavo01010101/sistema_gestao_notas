
CREATE DATABASE IF NOT EXISTS sistema_gestao_notas;
USE sistema_gestao_notas;

-- ==============================
-- TABELAS
-- ==============================

-- Tabela de usuários (alunos, professores, administradores)
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo ENUM('aluno', 'professor', 'administrador') NOT NULL,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de cursos
CREATE TABLE cursos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT
);

-- Tabela de disciplinas
CREATE TABLE disciplinas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    carga_horaria INT NOT NULL,
    id_curso INT,
    FOREIGN KEY (id_curso) REFERENCES cursos(id)
);

-- Tabela de vínculo entre alunos e disciplinas
CREATE TABLE alunos_disciplinas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_aluno INT NOT NULL,
    id_disciplina INT NOT NULL,
    FOREIGN KEY (id_aluno) REFERENCES usuarios(id),
    FOREIGN KEY (id_disciplina) REFERENCES disciplinas(id),
    UNIQUE (id_aluno, id_disciplina)
);

-- Tabela de notas
CREATE TABLE notas (
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
);

-- Tabela de histórico acadêmico
CREATE TABLE historico_academico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_aluno INT NOT NULL,
    id_disciplina INT NOT NULL,
    ano_letivo YEAR NOT NULL,
    situacao ENUM('Aprovado', 'Reprovado', 'Em andamento') DEFAULT 'Em andamento',
    FOREIGN KEY (id_aluno) REFERENCES usuarios(id),
    FOREIGN KEY (id_disciplina) REFERENCES disciplinas(id)
);

-- Tabela de logs (para auditoria)
CREATE TABLE logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    acao VARCHAR(255),
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);

-- ==============================
-- DADOS INICIAIS
-- ==============================

-- Usuários
INSERT INTO usuarios (nome, email, senha, tipo) VALUES
('Ana Souza', 'ana@escola.com', '123456', 'aluno'),
('Bruno Martins', 'bruno@escola.com', '123456', 'aluno'),
('Carla Ribeiro', 'carla@escola.com', '123456', 'aluno'),
('Diego Lopes', 'diego@escola.com', '123456', 'aluno'),
('Eduarda Lima', 'eduarda@escola.com', '123456', 'aluno'),
('Carlos Lima', 'carlos.prof@escola.com', '123456', 'professor'),
('Fernanda Alves', 'fernanda.prof@escola.com', '123456', 'professor'),
('Admin Geral', 'admin@escola.com', 'admin123', 'administrador');
('Matheus Pereira', 'Matheuspereiraifsp@gmail.com', '1234567', 'professor'),




-- Cursos
INSERT INTO cursos (nome, descricao) VALUES
('Engenharia de Software', 'Curso focado em desenvolvimento e gestão de sistemas.'),
('Ciência da Computação', 'Curso voltado à pesquisa e fundamentos da computação.'),
('Sistemas de Informação', 'Curso que integra tecnologia e gestão de negócios.');

-- Disciplinas
INSERT INTO disciplinas (nome, carga_horaria, id_curso) VALUES
('Programação I', 80, 1),
('Banco de Dados', 60, 1),
('Engenharia de Requisitos', 60, 1),
('Estruturas de Dados', 60, 2),
('Algoritmos Avançados', 70, 2),
('Gestão de Projetos', 50, 3),
('Redes de Computadores', 60, 3);

-- Vínculos de alunos e disciplinas
INSERT INTO alunos_disciplinas (id_aluno, id_disciplina) VALUES
(1, 1), (1, 2), (1, 3),
(2, 1), (2, 2), (2, 4),
(3, 2), (3, 3), (3, 5),
(4, 4), (4, 5), (4, 6),
(5, 1), (5, 2), (5, 7);

-- Notas
INSERT INTO notas (id_aluno, id_disciplina, nota1, nota2, nota3) VALUES
(1, 1, 8.5, 7.0, 9.0),
(1, 2, 6.0, 7.5, 8.0),
(1, 3, 9.0, 8.5, 9.5),
(2, 1, 5.5, 6.0, 6.5),
(2, 2, 7.0, 7.0, 7.5),
(2, 4, 8.5, 9.0, 9.0),
(3, 2, 8.0, 8.5, 9.0),
(3, 3, 9.5, 9.0, 9.5),
(3, 5, 7.5, 8.0, 8.5),
(4, 4, 6.0, 6.5, 7.0),
(4, 5, 7.0, 7.5, 8.0),
(4, 6, 8.5, 9.0, 9.5),
(5, 1, 9.0, 9.5, 10.0),
(5, 2, 7.5, 8.0, 8.5),
(5, 7, 8.0, 8.0, 8.0);

-- Histórico acadêmico
INSERT INTO historico_academico (id_aluno, id_disciplina, ano_letivo, situacao) VALUES
(1, 1, 2024, 'Aprovado'),
(1, 2, 2024, 'Aprovado'),
(1, 3, 2024, 'Aprovado'),
(2, 1, 2024, 'Reprovado'),
(2, 2, 2024, 'Aprovado'),
(2, 4, 2024, 'Aprovado'),
(3, 2, 2024, 'Aprovado'),
(3, 3, 2024, 'Aprovado'),
(3, 5, 2024, 'Aprovado'),
(4, 4, 2024, 'Aprovado'),
(4, 5, 2024, 'Aprovado'),
(4, 6, 2024, 'Aprovado'),
(5, 1, 2024, 'Aprovado'),
(5, 2, 2024, 'Aprovado'),
(5, 7, 2024, 'Em andamento');

-- Logs de exemplo
INSERT INTO logs (id_usuario, acao) VALUES
(8, 'Criou o banco de dados inicial'),
(6, 'Lançou notas de Programação I'),
(7, 'Atualizou notas de Estruturas de Dados'),
(8, 'Gerou relatório geral de desempenho');

