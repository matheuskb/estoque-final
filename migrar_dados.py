"""
migrar_dados.py
---------------
Roda UMA VEZ no PythonAnywhere para migrar os dados do banco antigo
(tabela 'produtos' com cor/tamanho) para o novo banco unificado
(tabelas 'roupas' e 'perfumes').

Como usar no PythonAnywhere:
  cd ~/estoque-os   (ou o nome da sua pasta)
  python migrar_dados.py
"""
import sqlite3, os, shutil

BASE = os.path.dirname(os.path.abspath(__file__))
DB   = os.path.join(BASE, "backend", "estoque.db")

if not os.path.exists(DB):
    print(f"[ERRO] Banco não encontrado em: {DB}")
    exit(1)

# Backup antes de qualquer coisa
backup = DB + ".bak"
shutil.copy(DB, backup)
print(f"[OK] Backup criado: {backup}")

conn = sqlite3.connect(DB)
conn.row_factory = sqlite3.Row

# ── Verificar estrutura atual ──────────────────────────────────────────────
tables = [r[0] for r in conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
print(f"[INFO] Tabelas encontradas: {tables}")

# ── Criar tabelas novas se não existirem ──────────────────────────────────
conn.execute("""
    CREATE TABLE IF NOT EXISTS roupas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL, categoria TEXT NOT NULL,
        cor TEXT NOT NULL, tamanho TEXT NOT NULL,
        preco REAL NOT NULL, quantidade INTEGER NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    )
""")
conn.execute("""
    CREATE TABLE IF NOT EXISTS perfumes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL, categoria TEXT NOT NULL,
        preco REAL NOT NULL, quantidade INTEGER NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    )
""")
conn.commit()
print("[OK] Tabelas 'roupas' e 'perfumes' prontas")

# ── Migrar tabela 'produtos' → 'roupas' (se existir e tiver cor/tamanho) ──
if "produtos" in tables:
    cols = [r[1] for r in conn.execute("PRAGMA table_info(produtos)").fetchall()]
    print(f"[INFO] Colunas em 'produtos': {cols}")

    if "cor" in cols and "tamanho" in cols:
        rows = conn.execute("SELECT * FROM produtos").fetchall()
        migrados = 0
        for r in rows:
            conn.execute(
                "INSERT INTO roupas (nome,categoria,cor,tamanho,preco,quantidade) VALUES (?,?,?,?,?,?)",
                (r["nome"], r["categoria"], r["cor"], r["tamanho"], r["preco"], r["quantidade"])
            )
            migrados += 1
        conn.commit()
        print(f"[OK] {migrados} registro(s) migrado(s) de 'produtos' → 'roupas'")

        # Renomear tabela antiga para não conflitar
        conn.execute("ALTER TABLE produtos RENAME TO produtos_legado")
        conn.commit()
        print("[OK] Tabela 'produtos' renomeada para 'produtos_legado' (backup seguro)")
    else:
        print("[AVISO] Tabela 'produtos' não tem col 'cor'/'tamanho' — nada migrado")
else:
    print("[INFO] Tabela 'produtos' não encontrada — nada a migrar")

# ── Resumo final ──────────────────────────────────────────────────────────
r_count = conn.execute("SELECT COUNT(*) FROM roupas").fetchone()[0]
p_count = conn.execute("SELECT COUNT(*) FROM perfumes").fetchone()[0]
conn.close()

print()
print("=" * 45)
print(f"  Roupas no banco:   {r_count}")
print(f"  Perfumes no banco: {p_count}")
print("  Migração concluída com sucesso!")
print("=" * 45)
