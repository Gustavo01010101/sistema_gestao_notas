import mysql.connector
from mysql.connector import Error

def get_connection():
    """
    Conexão com MySQL usando credenciais fornecidas.
    ATENÇÃO: para produção, mova credenciais para variáveis de ambiente.
    """
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="gu123",
            database="SistemaGestaoNotas"
        )
        return conn
    except Error as e:
        print("Erro ao conectar ao MySQL:", e)
        raise
