from flask import Flask, jsonify
from flask_cors import CORS
from routes.usuarios import usuarios_bp
from routes.disciplinas import disciplinas_bp
from routes.turmas import turmas_bp
from routes.notas import notas_bp
from routes.auth import auth_bp
from routes.professor_turma import professor_turma_bp
from routes.aluno_turma import aluno_turma_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(usuarios_bp, url_prefix='/usuarios')
app.register_blueprint(disciplinas_bp, url_prefix='/disciplinas')
app.register_blueprint(turmas_bp, url_prefix='/turmas')
app.register_blueprint(notas_bp, url_prefix='/notas')
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(professor_turma_bp, url_prefix='/professor_turma')
app.register_blueprint(aluno_turma_bp, url_prefix='/aluno_turma')

@app.route('/')
def home():
    return jsonify({"mensagem": "API do Sistema de Gestão de Notas está rodando!"})

if __name__ == '__main__':
    app.run(debug=True)
