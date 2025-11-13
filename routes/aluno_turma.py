from flask import Blueprint, request, jsonify
from db import get_connection

aluno_turma_bp = Blueprint('aluno_turma', __name__)

@aluno_turma_bp.route('/', methods=['GET'])
def listar():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT at.id_aluno_turma, u.id_usuario as id_aluno, u.nome as aluno,
               t.id_turma, t.nome as turma
        FROM aluno_turma at
        JOIN usuarios u ON at.id_aluno = u.id_usuario
        JOIN turmas t ON at.id_turma = t.id_turma
    """)
    res = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(res)

@aluno_turma_bp.route('/', methods=['POST'])
def criar():
    dados = request.json
    conn = get_connection()
    cursor = conn.cursor()
    sql = "INSERT INTO aluno_turma (id_aluno, id_turma) VALUES (%s, %s)"
    valores = (dados.get('id_aluno'), dados.get('id_turma'))
    cursor.execute(sql, valores)
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"mensagem":"Aluno vinculado à turma com sucesso"}), 201
