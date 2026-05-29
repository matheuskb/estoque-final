from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3, os
from datetime import datetime

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH  = os.environ.get("DB_PATH", os.path.join(BASE_DIR, "estoque.db"))

CATEGORIAS_ROUPAS   = ["OVERSIZED BRASIL","OVERSIZED NORMAL","CONJUNTO NIKE TEECH","CONJUNTO FINO LACOSTE","CONJUNTO FINO NIKE","Camisa Tricô gola polo Zara"]
CATEGORIAS_PERFUMES = ["IMPORTADO MASCULINO","IMPORTADO FEMININO","ARABE MASCULINO","ARABE FEMININO"]

def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def now_str():
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

def today_str():
    return datetime.now().strftime("%Y-%m-%d")

def iniciar_banco():
    with get_conn() as conn:
        conn.execute("""CREATE TABLE IF NOT EXISTS roupas (
            id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL,
            categoria TEXT NOT NULL, cor TEXT NOT NULL, tamanho TEXT NOT NULL,
            preco REAL NOT NULL, quantidade INTEGER NOT NULL, created_at TEXT NOT NULL DEFAULT "")""")
        conn.execute("""CREATE TABLE IF NOT EXISTS perfumes (
            id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL,
            categoria TEXT NOT NULL, preco REAL NOT NULL, quantidade INTEGER NOT NULL,
            created_at TEXT NOT NULL DEFAULT "")""")
        conn.execute("""CREATE TABLE IF NOT EXISTS investimentos (
            id INTEGER PRIMARY KEY AUTOINCREMENT, modulo TEXT NOT NULL,
            nome TEXT NOT NULL, valor REAL NOT NULL, data TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT "")""")
        conn.execute("""CREATE TABLE IF NOT EXISTS entradas (
            id INTEGER PRIMARY KEY AUTOINCREMENT, modulo TEXT NOT NULL,
            produto TEXT NOT NULL, valor REAL NOT NULL, data TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT "")""")

def roupa_dict(r):
    return {"id":r["id"],"nome":r["nome"],"categoria":r["categoria"],"cor":r["cor"],"tamanho":r["tamanho"],"preco":r["preco"],"quantidade":r["quantidade"],"total":round(r["preco"]*r["quantidade"],2),"created_at":r["created_at"]}

def perfume_dict(r):
    return {"id":r["id"],"nome":r["nome"],"categoria":r["categoria"],"preco":r["preco"],"quantidade":r["quantidade"],"total":round(r["preco"]*r["quantidade"],2),"created_at":r["created_at"]}

def inv_dict(r):
    return {"id":r["id"],"modulo":r["modulo"],"nome":r["nome"],"valor":r["valor"],"data":r["data"],"created_at":r["created_at"]}

def entrada_dict(r):
    return {"id":r["id"],"modulo":r["modulo"],"produto":r["produto"],"valor":r["valor"],"data":r["data"],"created_at":r["created_at"]}

def dashboard_stats(rows, dict_fn):
    total_valor = sum(r["preco"]*r["quantidade"] for r in rows)
    por_cat = {}
    for r in rows:
        cat = r["categoria"]
        if cat not in por_cat: por_cat[cat] = {"qtd":0,"valor":0.0}
        por_cat[cat]["qtd"] += r["quantidade"]
        por_cat[cat]["valor"] += r["preco"]*r["quantidade"]
    return {"total_produtos":len(rows),"total_pecas":sum(r["quantidade"] for r in rows),"total_valor":round(total_valor,2),"estoque_baixo":[dict_fn(r) for r in rows if r["quantidade"]<=3],"por_categoria":[{"categoria":k,"qtd":v["qtd"],"valor":round(v["valor"],2)} for k,v in sorted(por_cat.items())]}

# ── Health ──
@app.route("/api/health")
def health(): return jsonify({"status":"ok"})

@app.route("/api/categorias/roupas")
def categorias_roupas(): return jsonify(CATEGORIAS_ROUPAS)

@app.route("/api/categorias/perfumes")
def categorias_perfumes(): return jsonify(CATEGORIAS_PERFUMES)

# ── ROUPAS ──
@app.route("/api/roupas")
def listar_roupas():
    with get_conn() as conn:
        rows = conn.execute("SELECT * FROM roupas ORDER BY categoria,nome").fetchall()
    return jsonify([roupa_dict(r) for r in rows])

@app.route("/api/roupas", methods=["POST"])
def criar_roupa():
    data = request.get_json(force=True)
    for c in ["nome","categoria","cor","tamanho","preco","quantidade"]:
        if not str(data.get(c,"")).strip(): return jsonify({"error":f"Campo '{c}' obrigatório"}),400
    with get_conn() as conn:
        cur = conn.execute("INSERT INTO roupas (nome,categoria,cor,tamanho,preco,quantidade,created_at) VALUES (?,?,?,?,?,?,?)",
            (data["nome"].strip(),data["categoria"].strip(),data["cor"].strip(),data["tamanho"].strip(),float(data["preco"]),int(data["quantidade"]),now_str()))
        row = conn.execute("SELECT * FROM roupas WHERE id=?",(cur.lastrowid,)).fetchone()
    return jsonify(roupa_dict(row)),201

@app.route("/api/roupas/<int:pid>/vender", methods=["PATCH"])
def vender_roupa(pid):
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM roupas WHERE id=?",(pid,)).fetchone()
        if not row: return jsonify({"error":"Não encontrado"}),404
        preco = row["preco"]
        nome  = row["nome"]
        if row["quantidade"] > 1:
            conn.execute("UPDATE roupas SET quantidade=quantidade-1 WHERE id=?",(pid,))
            conn.execute("INSERT INTO entradas (modulo,produto,valor,data,created_at) VALUES (?,?,?,?,?)",
                ("ROUPAS", nome, preco, today_str(), now_str()))
            updated = conn.execute("SELECT * FROM roupas WHERE id=?",(pid,)).fetchone()
            return jsonify(roupa_dict(updated))
        conn.execute("DELETE FROM roupas WHERE id=?",(pid,))
        conn.execute("INSERT INTO entradas (modulo,produto,valor,data,created_at) VALUES (?,?,?,?,?)",
            ("ROUPAS", nome, preco, today_str(), now_str()))
        return jsonify({"deleted":True,"id":pid})

@app.route("/api/roupas/<int:pid>", methods=["DELETE"])
def deletar_roupa(pid):
    with get_conn() as conn:
        if not conn.execute("SELECT id FROM roupas WHERE id=?",(pid,)).fetchone(): return jsonify({"error":"Não encontrado"}),404
        conn.execute("DELETE FROM roupas WHERE id=?",(pid,))
    return jsonify({"deleted":True,"id":pid})

@app.route("/api/roupas/dashboard")
def dashboard_roupas():
    with get_conn() as conn:
        rows = conn.execute("SELECT * FROM roupas").fetchall()
    return jsonify(dashboard_stats(rows,roupa_dict))

# ── PERFUMES ──
@app.route("/api/perfumes")
def listar_perfumes():
    with get_conn() as conn:
        rows = conn.execute("SELECT * FROM perfumes ORDER BY categoria,nome").fetchall()
    return jsonify([perfume_dict(r) for r in rows])

@app.route("/api/perfumes", methods=["POST"])
def criar_perfume():
    data = request.get_json(force=True)
    for c in ["nome","categoria","preco","quantidade"]:
        if not str(data.get(c,"")).strip(): return jsonify({"error":f"Campo '{c}' obrigatório"}),400
    with get_conn() as conn:
        cur = conn.execute("INSERT INTO perfumes (nome,categoria,preco,quantidade,created_at) VALUES (?,?,?,?,?)",
            (data["nome"].strip(),data["categoria"].strip(),float(data["preco"]),int(data["quantidade"]),now_str()))
        row = conn.execute("SELECT * FROM perfumes WHERE id=?",(cur.lastrowid,)).fetchone()
    return jsonify(perfume_dict(row)),201

@app.route("/api/perfumes/<int:pid>/vender", methods=["PATCH"])
def vender_perfume(pid):
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM perfumes WHERE id=?",(pid,)).fetchone()
        if not row: return jsonify({"error":"Não encontrado"}),404
        preco = row["preco"]
        nome  = row["nome"]
        if row["quantidade"] > 1:
            conn.execute("UPDATE perfumes SET quantidade=quantidade-1 WHERE id=?",(pid,))
            conn.execute("INSERT INTO entradas (modulo,produto,valor,data,created_at) VALUES (?,?,?,?,?)",
                ("PERFUMES", nome, preco, today_str(), now_str()))
            updated = conn.execute("SELECT * FROM perfumes WHERE id=?",(pid,)).fetchone()
            return jsonify(perfume_dict(updated))
        conn.execute("DELETE FROM perfumes WHERE id=?",(pid,))
        conn.execute("INSERT INTO entradas (modulo,produto,valor,data,created_at) VALUES (?,?,?,?,?)",
            ("PERFUMES", nome, preco, today_str(), now_str()))
        return jsonify({"deleted":True,"id":pid})

@app.route("/api/perfumes/<int:pid>", methods=["DELETE"])
def deletar_perfume(pid):
    with get_conn() as conn:
        if not conn.execute("SELECT id FROM perfumes WHERE id=?",(pid,)).fetchone(): return jsonify({"error":"Não encontrado"}),404
        conn.execute("DELETE FROM perfumes WHERE id=?",(pid,))
    return jsonify({"deleted":True,"id":pid})

@app.route("/api/perfumes/dashboard")
def dashboard_perfumes():
    with get_conn() as conn:
        rows = conn.execute("SELECT * FROM perfumes").fetchall()
    return jsonify(dashboard_stats(rows,perfume_dict))

# ── INVESTIMENTOS ──
@app.route("/api/investimentos")
def listar_investimentos():
    modulo = request.args.get("modulo","")
    mes    = request.args.get("mes","")
    ano    = request.args.get("ano","")
    q = "SELECT * FROM investimentos WHERE 1=1"
    params = []
    if modulo: q += " AND modulo=?"; params.append(modulo)
    if ano:    q += " AND strftime('%Y',data)=?"; params.append(ano)
    if mes:    q += " AND strftime('%m',data)=?"; params.append(mes.zfill(2))
    q += " ORDER BY data DESC"
    with get_conn() as conn:
        rows = conn.execute(q,params).fetchall()
    return jsonify([inv_dict(r) for r in rows])

@app.route("/api/investimentos", methods=["POST"])
def criar_investimento():
    data = request.get_json(force=True)
    for c in ["modulo","nome","valor","data"]:
        if not str(data.get(c,"")).strip(): return jsonify({"error":f"Campo '{c}' obrigatório"}),400
    with get_conn() as conn:
        cur = conn.execute("INSERT INTO investimentos (modulo,nome,valor,data,created_at) VALUES (?,?,?,?,?)",
            (data["modulo"].strip(),data["nome"].strip(),float(data["valor"]),data["data"],now_str()))
        row = conn.execute("SELECT * FROM investimentos WHERE id=?",(cur.lastrowid,)).fetchone()
    return jsonify(inv_dict(row)),201

@app.route("/api/investimentos/<int:pid>", methods=["PUT"])
def editar_investimento(pid):
    data = request.get_json(force=True)
    with get_conn() as conn:
        if not conn.execute("SELECT id FROM investimentos WHERE id=?",(pid,)).fetchone(): return jsonify({"error":"Não encontrado"}),404
        conn.execute("UPDATE investimentos SET nome=?,valor=?,data=? WHERE id=?",
            (data["nome"].strip(),float(data["valor"]),data["data"],pid))
        row = conn.execute("SELECT * FROM investimentos WHERE id=?",(pid,)).fetchone()
    return jsonify(inv_dict(row))

@app.route("/api/investimentos/<int:pid>", methods=["DELETE"])
def deletar_investimento(pid):
    with get_conn() as conn:
        if not conn.execute("SELECT id FROM investimentos WHERE id=?",(pid,)).fetchone(): return jsonify({"error":"Não encontrado"}),404
        conn.execute("DELETE FROM investimentos WHERE id=?",(pid,))
    return jsonify({"deleted":True,"id":pid})

# ── ENTRADAS ──
@app.route("/api/entradas")
def listar_entradas():
    modulo = request.args.get("modulo","")
    mes    = request.args.get("mes","")
    ano    = request.args.get("ano","")
    q = "SELECT * FROM entradas WHERE 1=1"
    params = []
    if modulo: q += " AND modulo=?"; params.append(modulo)
    if ano:    q += " AND strftime('%Y',data)=?"; params.append(ano)
    if mes:    q += " AND strftime('%m',data)=?"; params.append(mes.zfill(2))
    q += " ORDER BY data DESC, id DESC"
    with get_conn() as conn:
        rows = conn.execute(q,params).fetchall()
    return jsonify([entrada_dict(r) for r in rows])

# ── FINANCEIRO RESUMO ──
@app.route("/api/financeiro/<modulo>")
def financeiro(modulo):
    mes_atual = datetime.now().strftime("%m")
    ano_atual = datetime.now().strftime("%Y")
    with get_conn() as conn:
        inv_total = conn.execute("SELECT COALESCE(SUM(valor),0) FROM investimentos WHERE modulo=?",(modulo.upper(),)).fetchone()[0]
        inv_mes   = conn.execute("SELECT COALESCE(SUM(valor),0) FROM investimentos WHERE modulo=? AND strftime('%m',data)=? AND strftime('%Y',data)=?",(modulo.upper(),mes_atual,ano_atual)).fetchone()[0]
        ent_total = conn.execute("SELECT COALESCE(SUM(valor),0) FROM entradas WHERE modulo=?",(modulo.upper(),)).fetchone()[0]
        ent_mes   = conn.execute("SELECT COALESCE(SUM(valor),0) FROM entradas WHERE modulo=? AND strftime('%m',data)=? AND strftime('%Y',data)=?",(modulo.upper(),mes_atual,ano_atual)).fetchone()[0]
    return jsonify({
        "investimentos":{"total":round(inv_total,2),"mes":round(inv_mes,2)},
        "entradas":{"total":round(ent_total,2),"mes":round(ent_mes,2)},
        "lucro":{"total":round(ent_total-inv_total,2),"mes":round(ent_mes-inv_mes,2)},
    })

if __name__ == "__main__":
    iniciar_banco()
    app.run(debug=os.environ.get("FLASK_DEBUG","false").lower()=="true",host="0.0.0.0",port=int(os.environ.get("PORT",5000)))
