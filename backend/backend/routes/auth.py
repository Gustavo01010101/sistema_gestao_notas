from flask import Blueprint, request, jsonify
from db import get_connection
from werkzeug.security import generate_password_hash, check_password_hash

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    dados = request.json
    nome = dados.get('nome')
    email = dados.get('email')
    senha = dados.get('senha')
    tipo = dados.get('tipo', 'aluno')

    if not nome or not email or not senha:
        return jsonify({"erro": "nome, email e senha são obrigatórios"}), 400

    hashed = generate_password_hash(senha)

    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO usuarios (nome, email, senha, tipo) VALUES (%s, %s, %s, %s)", (nome, email, hashed, tipo))
        conn.commit()
    except Exception as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return jsonify({"erro": str(e)}), 400

    cursor.close()
    conn.close()
    return jsonify({"mensagem": "Usuário registrado com sucesso!"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    dados = request.json
    email = dados.get('email')
    senha = dados.get('senha')

    if not email or not senha:
        return jsonify({"erro": "email e senha são obrigatórios"}), 400

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id_usuario, nome, email, senha, tipo FROM usuarios WHERE email = %s", (email,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if not user:
        return jsonify({"erro": "Usuário ou senha inválidos"}), 401

    if check_password_hash(user['senha'], senha):
        user.pop('senha', None)
        return jsonify({"mensagem": "Login bem-sucedido", "usuario": user})
    else:
        return jsonify({"erro": "Usuário ou senha inválidos"}), 401
