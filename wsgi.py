"""
wsgi.py
-------
Cole o conteúdo deste arquivo no WSGI configuration file do PythonAnywhere.
Substitua SEU_USUARIO pelo seu username do PythonAnywhere.

Caminho típico do WSGI no PythonAnywhere:
  /var/www/SEU_USUARIO_pythonanywhere_com_wsgi.py
"""
import sys, os

# ── Aponta para a pasta raiz do projeto ───────────────────────────────────
# Ajuste o caminho abaixo se necessário
project_home = "/home/mksantos/estoque-os"   # ← pasta onde está o app.py raiz

if project_home not in sys.path:
    sys.path.insert(0, project_home)

# ── Também adiciona a pasta backend ───────────────────────────────────────
backend_path = os.path.join(project_home, "backend")
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# ── Caminho absoluto do banco ─────────────────────────────────────────────
os.environ["DB_PATH"] = os.path.join(project_home, "backend", "estoque.db")

# ── Importa e inicializa ──────────────────────────────────────────────────
from backend.app import app as application, iniciar_banco  # noqa: E402
iniciar_banco()
