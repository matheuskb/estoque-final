"""
Ponto de entrada raiz — usado no deploy (PythonAnywhere, Railway, etc.)
Importa o app da pasta backend.
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

from app import app, iniciar_banco  # noqa: E402

if __name__ == "__main__":
    iniciar_banco()
    app.run(
        debug=False,
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000)),
    )
