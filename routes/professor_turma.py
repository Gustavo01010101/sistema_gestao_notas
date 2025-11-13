from flask import Blueprint, request, jsonify
from db import get_connection

professor_turma_bp = Blueprint('professor_turma', __name__)

@professor_turma_bp.route('/', methods=['GET'])
def listar():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT pt.id_professor_turma, u.id_usuario as id_professor, u.nome as professor,
               t.id_turma, t.nome as turma, d.id_disciplina, d.nome as disciplina
        FROM professor_turma pt
        JOIN usuarios u ON pt.id_professor = u.id_usuario
        JOIN turmas t ON pt.id_turma = t.id_turma
        JOIN disciplinas d ON pt.id_disciplina = d.id_disciplina
    """)
    res = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(res)

@professor_turma_bp.route('/', methods=['POST'])
def criar():
    dados = request.json
    conn = get_connection()
    cursor = conn.cursor()
    sql = "INSERT INTO professor_turma (id_professor, id_turma, id_disciplina) VALUES (%s, %s, %s)"
    valores = (dados.get('id_professor'), dados.get('id_turma'), dados.get('id_disciplina'))
    cursor.execute(sql, valores)
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"mensagem":"Vínculo professor-turma criado"}), 201
