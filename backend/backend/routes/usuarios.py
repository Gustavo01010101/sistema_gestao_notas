from flask import Blueprint, request, jsonify
from db import get_connection

usuarios_bp = Blueprint('usuarios', __name__)

@usuarios_bp.route('/', methods=['GET'])
def listar_usuarios():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id_usuario, nome, email, tipo, data_criacao FROM usuarios")
    resultado = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(resultado)

@usuarios_bp.route('/<int:id_usuario>', methods=['GET'])
def obter_usuario(id_usuario):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id_usuario, nome, email, tipo, data_criacao FROM usuarios WHERE id_usuario = %s", (id_usuario,))
    resultado = cursor.fetchone()
    cursor.close()
    conn.close()
    if resultado:
        return jsonify(resultado)
    return jsonify({"erro":"Usuário não encontrado"}), 404
