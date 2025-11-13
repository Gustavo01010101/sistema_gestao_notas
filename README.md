# Backend - Sistema de Gestão de Notas (Flask) - v2

Atualização com:
- Autenticação (login) usando hashing de senha.
- Endpoints para `professor_turma` e `aluno_turma`.
- Exemplos de INSERTs para popular o banco (apenas exemplo - tenha cuidado com senhas).

## Como usar

1. Confirme que o MySQL está rodando e que o banco `SistemaGestaoNotas` existe com as tabelas:
   `usuarios`, `disciplinas`, `turmas`, `professor_turma`, `aluno_turma`, `notas`, `logs_sistema`.

2. Credenciais em `db.py`:
   - usuário: `root`
   - senha: `gu123`

3. Instalar dependências:
```bash
pip install -r requirements.txt
```

4. Rodar a API:
```bash
python app.py
```

## Endpoints adicionais
- POST /auth/login  -> faz login (json: email, senha)
- POST /auth/register -> registra usuário com senha hasheada (json: nome,email,senha,tipo)
- CRUD básico para professor_turma e aluno_turma:
  - GET/POST /professor_turma/
  - GET/POST /aluno_turma/

## Exemplos de INSERTs (execute no seu MySQL - são apenas exemplos)
```sql
-- Usuários (notar que aqui as senhas são em texto; se usar /auth/register a API já fará hashing)
INSERT INTO usuarios (nome, email, senha, tipo) VALUES
('Ana Souza', 'ana@escola.com', 'senha123', 'aluno'),
('Bruno Martins', 'bruno@escola.com', 'senha123', 'aluno'),
('Carlos Prof', 'carlos@escola.com', 'senha123', 'professor'),
('Admin', 'admin@escola.com', 'admin123', 'administrador');

-- Disciplinas
INSERT INTO disciplinas (nome, codigo, carga_horaria) VALUES
('Matemática', 'MAT101', 60),
('Português', 'POR101', 60);

-- Turmas
INSERT INTO turmas (nome, ano, semestre) VALUES
('1A', 2025, 1),
('1B', 2025, 1);

-- Vincular aluno a turma (supondo ids existentes)
INSERT INTO aluno_turma (id_aluno, id_turma) VALUES
(1, 1), (2, 1);

-- Vincular professor a turma/disciplina
INSERT INTO professor_turma (id_professor, id_turma, id_disciplina) VALUES
(3, 1, 1);

-- Notas (supondo id_aluno_turma = 1)
INSERT INTO notas (id_aluno_turma, id_disciplina, nota1, nota2) VALUES
(1, 1, 7.5, 8.0);
```

> Lembre-se: para produção, nunca armazene senhas em texto puro no banco e utilize variáveis de ambiente para credenciais.
