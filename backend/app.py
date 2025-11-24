
import os 
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import mysql.connector
import bcrypt

app = Flask(__name__)
CORS(app)

# Configuração do Banco de Dados
db_config = {
    'host': '127.0.0.1',
    'user': 'root',
    'password': '',  
    'database': 'sistema_gestao_notas'
}

def get_db_connection():
    return mysql.connector.connect(**db_config)

# Função auxiliar para executar queries (Igual fazíamos no Node)
def query_db(query, args=(), one=False):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True) # dictionary=True faz os dados virem como JSON {chave: valor}
    try:
        cursor.execute(query, args)
        if query.strip().upper().startswith(("INSERT", "UPDATE", "DELETE")):
            conn.commit()
            return cursor.lastrowid
        else:
            rv = cursor.fetchall()
            return (rv[0] if rv else None) if one else rv
    except Exception as e:
        print(f"Erro no SQL: {e}")
        return None
    finally:
        cursor.close()
        conn.close()

# --- ROTAS (TRADUZIDAS DO NODE.JS) ---

@app.route('/')
def home():
    # 1. Pega a pasta onde o app.py está (pasta 'backend')
    pasta_backend = os.path.dirname(os.path.abspath(__file__))
    
    # 2. Volta um nível (..) e entra na pasta 'frontend'
    pasta_frontend = os.path.join(pasta_backend, '..', 'frontend')
    
    # 3. Serve o arquivo
    return send_from_directory(pasta_frontend, 'index.html')

# 1. LOGIN
# 1. LOGIN (Versão Compatível com SQL Importado)
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    senha = data.get('senha')

    # Busca o usuário no banco
    users = query_db("SELECT * FROM usuarios WHERE email = %s", (email,))
    
    if not users:
        return jsonify({'error': 'Usuário não encontrado'}), 401
    
    user = users[0]
    senha_banco = user['senha'] # A senha que está gravada no banco
    
    # CENÁRIO 1: Senha Texto Puro (Do arquivo SQL importado)
    # Se a senha do banco for exatamente igual à digitada
    if senha_banco == senha:
        return jsonify({
            'id': user['id'],
            'nome': user['nome'],
            'email': user['email'],
            'tipo': user['tipo']
        })

    # CENÁRIO 2: Senha Criptografada (Novos cadastros)
    try:
        # Converte para bytes se for string
        hashed = senha_banco.encode('utf-8') if isinstance(senha_banco, str) else senha_banco
        input_pass = senha.encode('utf-8')
        
        if bcrypt.checkpw(input_pass, hashed):
            return jsonify({
                'id': user['id'],
                'nome': user['nome'],
                'email': user['email'],
                'tipo': user['tipo']
            })
    except Exception as e:
        # Se der erro na criptografia (ex: formato inválido), ignora e recusa
        pass

    return jsonify({'error': 'Senha incorreta'}), 401

# 2. CADASTRO DE USUÁRIOS
@app.route('/usuarios', methods=['POST'])
def criar_usuario():
    data = request.json
    nome = data.get('nome')
    email = data.get('email')
    senha = data.get('senha')
    tipo = data.get('tipo')

    if not nome or not email or not senha:
        return jsonify({'error': 'Preencha todos os campos'}), 400

    # Verifica duplicidade
    check = query_db("SELECT * FROM usuarios WHERE email = %s", (email,))
    if check:
        return jsonify({'error': 'Email já cadastrado!'}), 409

    # Criptografa senha
    hashed = bcrypt.hashpw(senha.encode('utf-8'), bcrypt.gensalt())
    
    query_db("INSERT INTO usuarios (nome, email, senha, tipo) VALUES (%s, %s, %s, %s)", 
             (nome, email, hashed.decode('utf-8'), tipo))
    
    return jsonify({'message': 'Usuário criado com sucesso!'}), 201

# 3. LISTAR USUÁRIOS (ADMIN)
@app.route('/usuarios', methods=['GET'])
def listar_usuarios():
    users = query_db("SELECT id, nome, email, tipo FROM usuarios")
    return jsonify(users)

@app.route('/usuarios/<int:id>', methods=['DELETE'])
def deletar_usuario(id):
    query_db("DELETE FROM usuarios WHERE id = %s", (id,))
    return jsonify({'ok': True})

# 4. DROPDOWNS
@app.route('/alunos-lista', methods=['GET'])
def listar_alunos():
    alunos = query_db("SELECT id, nome FROM usuarios WHERE tipo = 'aluno'")
    return jsonify(alunos)

@app.route('/disciplinas-lista', methods=['GET'])
def listar_disciplinas():
    disc = query_db("SELECT id, nome FROM disciplinas")
    return jsonify(disc)

# 5. NOTAS
@app.route('/notas', methods=['GET'])
def ler_notas():
    sql = """
        SELECT n.id, u.nome AS aluno, d.nome AS disciplina, 
               n.nota1, n.nota2, n.nota3, n.media_final 
        FROM notas n 
        JOIN usuarios u ON n.id_aluno = u.id 
        JOIN disciplinas d ON n.id_disciplina = d.id 
        ORDER BY n.id DESC
    """
    notas = query_db(sql)
    # Python Decimal não é serializável em JSON direto, convertemos para float/str se precisar
    # Mas o flask jsonify costuma lidar bem, ou o mysql connector retorna float.
    return jsonify(notas)

@app.route('/notas', methods=['POST'])
def salvar_nota():
    data = request.json
    try:
        query_db("""
            INSERT INTO notas (id_aluno, id_disciplina, nota1, nota2, nota3) 
            VALUES (%s, %s, %s, %s, %s)
        """, (data['id_aluno'], data['id_disciplina'], data['nota1'], data['nota2'], data['nota3']))
        return jsonify({'ok': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 6. RELATÓRIOS
@app.route('/relatorios/media-geral', methods=['GET'])
def relatorio():
    sql = """
        SELECT d.nome as disciplina, AVG(n.media_final) as media 
        FROM notas n 
        JOIN disciplinas d ON n.id_disciplina = d.id 
        GROUP BY d.id
    """
    dados = query_db(sql)
    return jsonify(dados)

if __name__ == '__main__':
    print("🚀 SERVIDOR PYTHON (FLASK) RODANDO NA PORTA 3000")
    # debug=True faz o servidor reiniciar sozinho se você mexer no código
    app.run(port=3000, debug=True)