from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH  = os.environ.get("DB_PATH", os.path.join(BASE_DIR, "estoque.db"))

CATEGORIAS_ROUPAS = [
    "OVERSIZED BRASIL",
    "OVERSIZED NORMAL",
    "CONJUNTO NIKE TEECH",
    "CONJUNTO FINO LACOSTE",
    "CONJUNTO FINO NIKE",
    "Camisa Tricô gola polo Zara",
]

CATEGORIAS_PERFUMES = [
    "IMPORTADO MASCULINO",
    "IMPORTADO FEMININO",
    "ARABE MASCULINO",
    "ARABE FEMININO",
]

# ──────────────────────────────────────────────────────────
# DB helpers
# ──────────────────────────────────────────────────────────
def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def iniciar_banco() -> None:
    with get_conn() as conn:
        # Tabela de roupas (mantém cor e tamanho)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS roupas (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                nome       TEXT    NOT NULL,
                categoria  TEXT    NOT NULL,
                cor        TEXT    NOT NULL,
                tamanho    TEXT    NOT NULL,
                preco      REAL    NOT NULL,
                quantidade INTEGER NOT NULL,
                created_at TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
            )
        """)
        # Tabela de perfumes (sem cor e tamanho)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS perfumes (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                nome       TEXT    NOT NULL,
                categoria  TEXT    NOT NULL,
                preco      REAL    NOT NULL,
                quantidade INTEGER NOT NULL,
                created_at TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
            )
        """)

def roupa_dict(row: sqlite3.Row) -> dict:
    return {
        "id":         row["id"],
        "nome":       row["nome"],
        "categoria":  row["categoria"],
        "cor":        row["cor"],
        "tamanho":    row["tamanho"],
        "preco":      row["preco"],
        "quantidade": row["quantidade"],
        "total":      round(row["preco"] * row["quantidade"], 2),
        "created_at": row["created_at"],
    }

def perfume_dict(row: sqlite3.Row) -> dict:
    return {
        "id":         row["id"],
        "nome":       row["nome"],
        "categoria":  row["categoria"],
        "preco":      row["preco"],
        "quantidade": row["quantidade"],
        "total":      round(row["preco"] * row["quantidade"], 2),
        "created_at": row["created_at"],
    }

def dashboard_stats(rows, dict_fn):
    total_valor = sum(r["preco"] * r["quantidade"] for r in rows)
    por_cat: dict[str, dict] = {}
    for r in rows:
        cat = r["categoria"]
        if cat not in por_cat:
            por_cat[cat] = {"qtd": 0, "valor": 0.0}
        por_cat[cat]["qtd"]   += r["quantidade"]
        por_cat[cat]["valor"] += r["preco"] * r["quantidade"]
    return {
        "total_produtos": len(rows),
        "total_pecas":    sum(r["quantidade"] for r in rows),
        "total_valor":    round(total_valor, 2),
        "estoque_baixo":  [dict_fn(r) for r in rows if r["quantidade"] <= 3],
        "por_categoria": [
            {"categoria": k, "qtd": v["qtd"], "valor": round(v["valor"], 2)}
            for k, v in sorted(por_cat.items())
        ],
    }

# ──────────────────────────────────────────────────────────
# Rotas gerais
# ──────────────────────────────────────────────────────────
@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})

@app.route("/api/categorias/roupas")
def categorias_roupas():
    return jsonify(CATEGORIAS_ROUPAS)

@app.route("/api/categorias/perfumes")
def categorias_perfumes():
    return jsonify(CATEGORIAS_PERFUMES)

# ──────────────────────────────────────────────────────────
# ROUPAS
# ──────────────────────────────────────────────────────────
@app.route("/api/roupas")
def listar_roupas():
    with get_conn() as conn:
        rows = conn.execute("SELECT * FROM roupas ORDER BY categoria, nome").fetchall()
    return jsonify([roupa_dict(r) for r in rows])

@app.route("/api/roupas", methods=["POST"])
def criar_roupa():
    data = request.get_json(force=True)
    for campo in ["nome", "categoria", "cor", "tamanho", "preco", "quantidade"]:
        if not str(data.get(campo, "")).strip():
            return jsonify({"error": f"Campo '{campo}' obrigatório"}), 400
    with get_conn() as conn:
        cur = conn.execute(
            "INSERT INTO roupas (nome,categoria,cor,tamanho,preco,quantidade) VALUES (?,?,?,?,?,?)",
            (data["nome"].strip(), data["categoria"].strip(),
             data["cor"].strip(), data["tamanho"].strip(),
             float(data["preco"]), int(data["quantidade"])),
        )
        row = conn.execute("SELECT * FROM roupas WHERE id=?", (cur.lastrowid,)).fetchone()
    return jsonify(roupa_dict(row)), 201

@app.route("/api/roupas/<int:pid>/vender", methods=["PATCH"])
def vender_roupa(pid: int):
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM roupas WHERE id=?", (pid,)).fetchone()
        if not row:
            return jsonify({"error": "Não encontrado"}), 404
        if row["quantidade"] > 1:
            conn.execute("UPDATE roupas SET quantidade=quantidade-1 WHERE id=?", (pid,))
            updated = conn.execute("SELECT * FROM roupas WHERE id=?", (pid,)).fetchone()
            return jsonify(roupa_dict(updated))
        conn.execute("DELETE FROM roupas WHERE id=?", (pid,))
        return jsonify({"deleted": True, "id": pid})

@app.route("/api/roupas/<int:pid>", methods=["DELETE"])
def deletar_roupa(pid: int):
    with get_conn() as conn:
        if not conn.execute("SELECT id FROM roupas WHERE id=?", (pid,)).fetchone():
            return jsonify({"error": "Não encontrado"}), 404
        conn.execute("DELETE FROM roupas WHERE id=?", (pid,))
    return jsonify({"deleted": True, "id": pid})

@app.route("/api/roupas/dashboard")
def dashboard_roupas():
    with get_conn() as conn:
        rows = conn.execute("SELECT * FROM roupas").fetchall()
    return jsonify(dashboard_stats(rows, roupa_dict))

# ──────────────────────────────────────────────────────────
# PERFUMES
# ──────────────────────────────────────────────────────────
@app.route("/api/perfumes")
def listar_perfumes():
    with get_conn() as conn:
        rows = conn.execute("SELECT * FROM perfumes ORDER BY categoria, nome").fetchall()
    return jsonify([perfume_dict(r) for r in rows])

@app.route("/api/perfumes", methods=["POST"])
def criar_perfume():
    data = request.get_json(force=True)
    for campo in ["nome", "categoria", "preco", "quantidade"]:
        if not str(data.get(campo, "")).strip():
            return jsonify({"error": f"Campo '{campo}' obrigatório"}), 400
    with get_conn() as conn:
        cur = conn.execute(
            "INSERT INTO perfumes (nome,categoria,preco,quantidade) VALUES (?,?,?,?)",
            (data["nome"].strip(), data["categoria"].strip(),
             float(data["preco"]), int(data["quantidade"])),
        )
        row = conn.execute("SELECT * FROM perfumes WHERE id=?", (cur.lastrowid,)).fetchone()
    return jsonify(perfume_dict(row)), 201

@app.route("/api/perfumes/<int:pid>/vender", methods=["PATCH"])
def vender_perfume(pid: int):
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM perfumes WHERE id=?", (pid,)).fetchone()
        if not row:
            return jsonify({"error": "Não encontrado"}), 404
        if row["quantidade"] > 1:
            conn.execute("UPDATE perfumes SET quantidade=quantidade-1 WHERE id=?", (pid,))
            updated = conn.execute("SELECT * FROM perfumes WHERE id=?", (pid,)).fetchone()
            return jsonify(perfume_dict(updated))
        conn.execute("DELETE FROM perfumes WHERE id=?", (pid,))
        return jsonify({"deleted": True, "id": pid})

@app.route("/api/perfumes/<int:pid>", methods=["DELETE"])
def deletar_perfume(pid: int):
    with get_conn() as conn:
        if not conn.execute("SELECT id FROM perfumes WHERE id=?", (pid,)).fetchone():
            return jsonify({"error": "Não encontrado"}), 404
        conn.execute("DELETE FROM perfumes WHERE id=?", (pid,))
    return jsonify({"deleted": True, "id": pid})

@app.route("/api/perfumes/dashboard")
def dashboard_perfumes():
    with get_conn() as conn:
        rows = conn.execute("SELECT * FROM perfumes").fetchall()
    return jsonify(dashboard_stats(rows, perfume_dict))

# ──────────────────────────────────────────────────────────
# Dashboard geral (ambos os módulos)
# ──────────────────────────────────────────────────────────
@app.route("/api/dashboard")
def dashboard_geral():
    with get_conn() as conn:
        roupas   = conn.execute("SELECT * FROM roupas").fetchall()
        perfumes = conn.execute("SELECT * FROM perfumes").fetchall()
    return jsonify({
        "roupas":   dashboard_stats(roupas, roupa_dict),
        "perfumes": dashboard_stats(perfumes, perfume_dict),
    })

# ──────────────────────────────────────────────────────────
if __name__ == "__main__":
    iniciar_banco()
    app.run(
        debug=os.environ.get("FLASK_DEBUG", "false").lower() == "true",
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000)),
    )
