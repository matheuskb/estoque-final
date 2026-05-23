from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app, origins=[
    "https://estoque-final-andv3d326-mkcompany01.vercel.app"
])

@app.route("/")
def home():
    return "API online"

if __name__ == "__main__":
    app.run()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH  = os.environ.get("DB_PATH", os.path.join(BASE_DIR, "estoque.db"))

CATEGORIAS = [
    "OVERSIZED BRASIL",
    "OVERSIZED NORMAL",
    "CONJUNTO NIKE TEECH",
    "CONJUNTO FINO LACOSTE",
    "CONJUNTO FINO NIKE",
    "Camisa Tricô gola polo Zara",
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
        conn.execute("""
            CREATE TABLE IF NOT EXISTS produtos (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                nome       TEXT    NOT NULL,
                categoria  TEXT    NOT NULL,
                cor        TEXT    NOT NULL,
                tamanho    TEXT    NOT NULL,
                preco      REAL    NOT NULL,
                quantidade INTEGER NOT NULL
            )
        """)

def to_dict(row: sqlite3.Row) -> dict:
    return {
        "id":         row["id"],
        "nome":       row["nome"],
        "categoria":  row["categoria"],
        "cor":        row["cor"],
        "tamanho":    row["tamanho"],
        "preco":      row["preco"],
        "quantidade": row["quantidade"],
        "total":      round(row["preco"] * row["quantidade"], 2),
    }

# ──────────────────────────────────────────────────────────
# Rotas
# ──────────────────────────────────────────────────────────
@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/api/categorias")
def listar_categorias():
    return jsonify(CATEGORIAS)


@app.route("/api/produtos")
def listar_produtos():
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM produtos ORDER BY categoria, nome"
        ).fetchall()
    return jsonify([to_dict(r) for r in rows])


@app.route("/api/produtos", methods=["POST"])
def criar_produto():
    data = request.get_json(force=True)
    campos = ["nome", "categoria", "cor", "tamanho", "preco", "quantidade"]
    for c in campos:
        if not str(data.get(c, "")).strip():
            return jsonify({"error": f"Campo '{c}' obrigatório"}), 400

    with get_conn() as conn:
        cur = conn.execute(
            "INSERT INTO produtos (nome,categoria,cor,tamanho,preco,quantidade)"
            " VALUES (?,?,?,?,?,?)",
            (
                data["nome"].strip(), data["categoria"].strip(),
                data["cor"].strip(),  data["tamanho"].strip(),
                float(data["preco"]), int(data["quantidade"]),
            ),
        )
        row = conn.execute(
            "SELECT * FROM produtos WHERE id=?", (cur.lastrowid,)
        ).fetchone()
    return jsonify(to_dict(row)), 201


@app.route("/api/produtos/<int:pid>/vender", methods=["PATCH"])
def vender_produto(pid: int):
    with get_conn() as conn:
        row = conn.execute(
            "SELECT * FROM produtos WHERE id=?", (pid,)
        ).fetchone()
        if not row:
            return jsonify({"error": "Não encontrado"}), 404

        if row["quantidade"] > 1:
            conn.execute(
                "UPDATE produtos SET quantidade=quantidade-1 WHERE id=?", (pid,)
            )
            updated = conn.execute(
                "SELECT * FROM produtos WHERE id=?", (pid,)
            ).fetchone()
            return jsonify(to_dict(updated))

        conn.execute("DELETE FROM produtos WHERE id=?", (pid,))
        return jsonify({"deleted": True, "id": pid})


@app.route("/api/produtos/<int:pid>", methods=["DELETE"])
def deletar_produto(pid: int):
    with get_conn() as conn:
        if not conn.execute(
            "SELECT id FROM produtos WHERE id=?", (pid,)
        ).fetchone():
            return jsonify({"error": "Não encontrado"}), 404
        conn.execute("DELETE FROM produtos WHERE id=?", (pid,))
    return jsonify({"deleted": True, "id": pid})


@app.route("/api/dashboard")
def dashboard():
    with get_conn() as conn:
        rows = conn.execute("SELECT * FROM produtos").fetchall()

    total_valor = sum(r["preco"] * r["quantidade"] for r in rows)
    por_cat: dict[str, dict] = {}
    for r in rows:
        cat = r["categoria"]
        if cat not in por_cat:
            por_cat[cat] = {"qtd": 0, "valor": 0.0}
        por_cat[cat]["qtd"]   += r["quantidade"]
        por_cat[cat]["valor"] += r["preco"] * r["quantidade"]

    return jsonify({
        "total_produtos": len(rows),
        "total_pecas":    sum(r["quantidade"] for r in rows),
        "total_valor":    round(total_valor, 2),
        "estoque_baixo":  [to_dict(r) for r in rows if r["quantidade"] <= 3],
        "por_categoria": [
            {"categoria": k, "qtd": v["qtd"], "valor": round(v["valor"], 2)}
            for k, v in sorted(por_cat.items())
        ],
    })


# ──────────────────────────────────────────────────────────
if __name__ == "__main__":
    iniciar_banco()
    app.run(
        debug=os.environ.get("FLASK_DEBUG", "false").lower() == "true",
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000)),
    )
