import os
import sqlite3
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

# Configure environment variables before importing app
os.environ["CACHE_DB_PATH"] = "siat_test_cache.db"
os.environ["PROXY_TOKEN"] = "test-secret-token"

from main import app, get_db_connection, init_db

# Create test database connection
def clean_test_db():
    if os.path.exists("siat_test_cache.db"):
        os.remove("siat_test_cache.db")
    if os.path.exists("siat_test_cache.db-wal"):
        os.remove("siat_test_cache.db-wal")
    if os.path.exists("siat_test_cache.db-shm"):
        os.remove("siat_test_cache.db-shm")
    init_db()

@pytest.fixture(autouse=True)
def setup_database():
    clean_test_db()
    yield
    clean_test_db()

client = TestClient(app)

def make_mock_html(num_dam="202600000012345", situacao="1 - Baixado", ident="12.345.678/0001-99", nome="EMPRESA MOCK LTDA"):
    return f"""
    <html>
        <body>
            <input id="formDetalhe:inputNrDam" value="{num_dam}" />
            <input id="formDetalhe:inputCodigoBarras" value="81600000001234567890123456789012345678901234" />
            <input id="formDetalhe:calendarDtLimitePagto_input" value="31/12/2026" />
            <input id="formDetalhe:inputVlTotal" value="150,00" />
            <input id="formDetalhe:inputNrIdentificacao" value="{ident}" />
            <input id="formDetalhe:inputNomeEmissor" value="{nome}" />
            <input id="formDetalhe:inputSituacaoPagto" value="{situacao}" />
            <input id="formDetalhe:calendarDtBaixa_input" value="28/05/2026" />
            <input id="formDetalhe:inputBancoPagto" value="BANCO DO BRASIL S.A." />
            <input id="formDetalhe:inputLotePagto" value="98765" />
            <textarea id="formDetalhe:inputInfosAdd">LICENSING PROCESS - MOCK REGULATION DATA</textarea>
        </body>
    </html>
    """

def test_healthcheck():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "cache" in data

def test_unauthorized_access():
    # Attempt requests without authentication headers
    response = client.get("/api/siat/detalhar/202600000012345")
    assert response.status_code == 401
    assert "Access denied" in response.json()["detail"]

def test_authorized_access_invalid_token():
    # Attempt with incorrect token
    response = client.get("/api/siat/detalhar/202600000012345", headers={"x-proxy-token": "wrong-token"})
    assert response.status_code == 401

@patch("requests.get")
def test_get_details_cache_flow(mock_get):
    dam_id = "202600000012345"
    mock_html = make_mock_html(num_dam=dam_id, situacao="1 - Baixado")
    
    # Configure mock requests response
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.text = mock_html
    mock_get.return_value = mock_response
    
    # First request: MISS (triggers HTTP request to SIAT)
    response1 = client.get(
        f"/arrecadacao/pages/arrecadacao/guiaArrecadacaoDetalheExterno.jsf?id={dam_id}&op=4",
        headers={"x-proxy-token": "test-secret-token"}
    )
    assert response1.status_code == 200
    assert response1.headers["X-Cache"] == "MISS"
    assert "inputNrIdentificacao" in response1.text
    mock_get.assert_called_once()
    
    # Reset mock to ensure it doesn't get called again
    mock_get.reset_mock()
    
    # Second request: HIT (served directly from SQLite WAL cache)
    response2 = client.get(
        f"/arrecadacao/pages/arrecadacao/guiaArrecadacaoDetalheExterno.jsf?id={dam_id}&op=4",
        headers={"x-proxy-token": "test-secret-token"}
    )
    assert response2.status_code == 200
    assert response2.headers["X-Cache"] == "HIT"
    assert "inputNrIdentificacao" in response2.text
    mock_get.assert_not_called()

@patch("requests.get")
def test_structured_json_details(mock_get):
    dam_id = "202600000054321"
    mock_html = make_mock_html(num_dam=dam_id, situacao="0 - Em Aberto", ident="12.345.678/0001-99", nome="EMPRESA MOCK LTDA")
    
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.text = mock_html
    mock_get.return_value = mock_response
    
    response = client.get(
        f"/api/siat/detalhar/{dam_id}",
        headers={"x-proxy-token": "test-secret-token"}
    )
    assert response.status_code == 200
    data = response.json()
    
    assert data["num_dam"] == dam_id
    assert data["codigo_barras"] == "81600000001234567890123456789012345678901234"
    assert data["emissor"]["identificacao"] == "12345678000199"  # Normalized CNPJ
    assert data["emissor"]["nome"] == "EMPRESA MOCK LTDA"
    assert data["pagamento"]["pago"] is False
    assert data["pagamento"]["situacao"] == "0 - Em Aberto"

@patch("requests.post")
@patch("requests.get")
def test_post_pdf_cache_flow(mock_get, mock_post):
    dam_id = "202600000012345"
    mock_pdf_bytes = b"%PDF-1.4 test mock pdf content"
    
    # 1. Populate the HTML cache first to store 'is_pago' state as Paid (cache is permanent)
    mock_html_response = MagicMock()
    mock_html_response.status_code = 200
    mock_html_response.text = make_mock_html(num_dam=dam_id, situacao="1 - Baixado")
    mock_get.return_value = mock_html_response
    
    client.get(
        f"/arrecadacao/pages/arrecadacao/guiaArrecadacaoDetalheExterno.jsf?id={dam_id}&op=4",
        headers={"x-proxy-token": "test-secret-token"}
    )
    
    # 2. Configure post response for PDF download
    mock_pdf_response = MagicMock()
    mock_pdf_response.status_code = 200
    mock_pdf_response.content = mock_pdf_bytes
    mock_pdf_response.headers = {"content-type": "application/pdf"}
    mock_post.return_value = mock_pdf_response
    
    # First PDF request: MISS
    response1 = client.post(
        f"/arrecadacao/pages/arrecadacao/guiaArrecadacaoDetalheExterno.jsf?id={dam_id}&op=4",
        content="btnEmitirDAM=1",
        headers={"x-proxy-token": "test-secret-token"}
    )
    assert response1.status_code == 200
    assert response1.content == mock_pdf_bytes
    assert response1.headers["X-Cache"] == "MISS"
    mock_post.assert_called_once()
    
    mock_post.reset_mock()
    
    # Second PDF request: HIT
    response2 = client.post(
        f"/arrecadacao/pages/arrecadacao/guiaArrecadacaoDetalheExterno.jsf?id={dam_id}&op=4",
        content="btnEmitirDAM=1",
        headers={"x-proxy-token": "test-secret-token"}
    )
    assert response2.status_code == 200
    assert response2.content == mock_pdf_bytes
    assert response2.headers["X-Cache"] == "HIT"
    mock_post.assert_not_called()
