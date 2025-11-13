from flask import Blueprint, request, jsonify
from db import get_connection

notas_bp = Blueprint('notas', __name__)

@notas_bp.route('/', methods=['GET'])
def listar_notas():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT n.id_nota, u.id_usuario AS id_aluno, u.nome AS aluno,
               d.id_disciplina, d.nome AS disciplina,
               n.nota1, n.nota2, n.nota_final, n.data_registro
        FROM notas n
        JOIN aluno_turma at ON n.id_aluno_turma = at.id_aluno_turma
        JOIN usuarios u ON at.id_aluno = u.id_usuario
        JOIN disciplinas d ON n.id_disciplina = d.id_disciplina
        ORDER BY n.data_registro DESC
    """)
    resultado = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(resultado)

@notas_bp.route('/', methods=['POST'])
def cadastrar_nota():
    dados = request.json
    conn = get_connection()
    cursor = conn.cursor()
    sql = "INSERT INTO notas (id_aluno_turma, id_disciplina, nota1, nota2) VALUES (%s, %s, %s, %s)"
    valores = (dados.get('id_aluno_turma'), dados.get('id_disciplina'), dados.get('nota1',0), dados.get('nota2',0))
    cursor.execute(sql, valores)
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"mensagem": "Nota cadastrada com sucesso!"}), 201
