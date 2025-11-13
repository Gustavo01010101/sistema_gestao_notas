from flask import Blueprint, request, jsonify
from db import get_connection

disciplinas_bp = Blueprint('disciplinas', __name__)

@disciplinas_bp.route('/', methods=['GET'])
def listar_disciplinas():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id_disciplina, nome, codigo, carga_horaria FROM disciplinas")
    resultado = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(resultado)

@disciplinas_bp.route('/', methods=['POST'])
def cadastrar_disciplina():
    dados = request.json
    conn = get_connection()
    cursor = conn.cursor()
    sql = "INSERT INTO disciplinas (nome, codigo, carga_horaria) VALUES (%s, %s, %s)"
    valores = (dados.get('nome'), dados.get('codigo'), dados.get('carga_horaria'))
    cursor.execute(sql, valores)
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"mensagem": "Disciplina cadastrada com sucesso!"}), 201
