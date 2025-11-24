# 🎓 Sistema de Gestão de Notas Escolar

Um sistema web completo "Full Stack" para gerenciamento escolar. Permite o controle de alunos, disciplinas e lançamento de notas, com cálculo automático de médias e visualização de desempenho através de gráficos.

![Badge Concluído](http://img.shields.io/static/v1?label=STATUS&message=CONCLUIDO&color=GREEN&style=for-the-badge)

## 🚀 Funcionalidades

- **Autenticação Segura:** Login para Admin e Alunos com criptografia (bcrypt).
- **Painel Administrativo:** Gestão de usuários e permissões.
- **Gestão Acadêmica:** Lançamento de notas por disciplina.
- **Automação:** Cálculo automático de médias via Banco de Dados.
- **Relatórios Visuais:** Dashboard com gráficos de desempenho (Chart.js).

## 🛠️ Tecnologias Utilizadas

- **Back-end:** Node.js, Express.js
- **Banco de Dados:** MySQL (Relacional)
- **Front-end:** HTML5, CSS3, JavaScript (Vanilla)
- **Dependências:** `mysql2`, `cors`, `bcryptjs`, `express`

---

## 📦 Como Rodar o Projeto (Passo a Passo)

Siga estas instruções para rodar o projeto na sua máquina local.

### 1. Pré-requisitos
Certifique-se de ter instalado:
- [Node.js](https://nodejs.org/)
- [MySQL](https://dev.mysql.com/downloads/installer/) (Ou XAMPP com MySQL ativado)
- [Git](https://git-scm.com/)

### 2. Clonar e Instalar

Abra o terminal e rode os comandos:

```bash
# Clone este repositório
git clone [https://github.com/SEU-USUARIO/NOME-DO-REPO.git](https://github.com/SEU-USUARIO/NOME-DO-REPO.git)

# Entre na pasta
cd NOME-DO-REPO

# Instale as dependências do Node
npm install