from flask import Blueprint, request, jsonify
from db import get_connection

turmas_bp = Blueprint('turmas', __name__)

@turmas_bp.route('/', methods=['GET'])
def listar_turmas():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id_turma, nome, ano, semestre FROM turmas")
    resultado = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(resultado)

@turmas_bp.route('/', methods=['POST'])
def cadastrar_turma():
    dados = request.json
    conn = get_connection()
    cursor = conn.cursor()
    sql = "INSERT INTO turmas (nome, ano, semestre) VALUES (%s, %s, %s)"
    valores = (dados.get('nome'), dados.get('ano'), dados.get('semestre'))
    cursor.execute(sql, valores)
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"mensagem": "Turma cadastrada com sucesso!"}), 201
