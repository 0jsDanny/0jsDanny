# -*- coding: utf-8 -*-
import os
import re
import urllib.request
import urllib.parse
from bs4 import BeautifulSoup

class BelemTransparencyScraper:
    """
    Scraper to extract and download financial reports (Anexo 8, 9, 10, and Balancetes)
    from the Belém Municipal Transparency Portal.
    """
    
    BASE_BG_URL = "https://portaltransparencia.belem.pa.gov.br/demonstrativos-contabeis-e-orcamentarios/balanco-geral-do-municipio/"
    BASE_BF_URL = "https://portaltransparencia.belem.pa.gov.br/demonstrativos-contabeis-e-orcamentarios/balancete-financeiro/"
    
    # Fallback direct links in case the portal fails to load or page changes
    FALLBACK_URLS = {
        # Anexo 10 (Revenues)
        "2020_anexo10": "https://portaltransparencia.belem.pa.gov.br/wp-content/uploads/2021/06/Anexo-10-COMPARATIVO-DA-RECEITA-ORCADA-COM-ARRECADADA-Todos-mesclado-final_compressed.pdf",
        "2022_anexo10": "https://portaltransparencia.belem.pa.gov.br/wp-content/uploads/2023/05/ANEXO-10-COMPARATIVO-DA-RECEITA-ORCADA-COM-ARRECADADA-12.pdf",
        "2023_anexo10": "https://portaltransparencia.belem.pa.gov.br/wp-content/uploads/2024/05/ANEXO-10-COMPARATIVO-DA-RECEITA-ORCADA-COM-ARRECADADA-2023-final_compressed.pdf",
        "2024_anexo10": "https://portaltransparencia.belem.pa.gov.br/wp-content/uploads/2025/05/Anexo-10-COMPARATIVO-DA-RECEITA-ORCADA-COM-ARRECADADA-FINAL.pdf",
        "2025_anexo10": "https://portaltransparencia.belem.pa.gov.br/wp-content/uploads/2026/05/ANEXO-10-COMPARATIVO-DA-RECEITA-ORCADA-COM-ARRECADADA.pdf",
        
        # Anexo 8 (Expenses consolidated)
        "2020_anexo8": "https://portaltransparencia.belem.pa.gov.br/wp-content/uploads/2021/06/Anexo-08-DEMONSTRATIVO-DE-FUNCOES-SUBFUNCOES-E-PROGRAMAS-DE-GOVERNO-consolidado-2020-CMB.pdf",
        "2022_anexo8": "https://portaltransparencia.belem.pa.gov.br/wp-content/uploads/2023/05/ANEXO-8-CONSOLIDACAO-GERAL-DEMONSTRATIVO-DE-FUNCOES-SUBFUNCOES-E-PROGRAMAS-DE-GOVERNO-CONFORME-O-VINCULO-COM-OS-RECURSOS-e-por-CATEGORIA-ECONOMICA-12.pdf",
        "2023_anexo8": "https://portaltransparencia.belem.pa.gov.br/wp-content/uploads/2024/05/Anexo-8-CONSOLIDACAO-GERAL-DEMONSTRATIVO-DE-FUNCOES-SUBFUNCOES-E-PROGRAMAS-DE-GOVERNO-POR-CATEGORIA-E-VINCULO-final.pdf",
        "2024_anexo8": "https://portaltransparencia.belem.pa.gov.br/wp-content/uploads/2025/05/Anexo-8-CONSOLID-DEMONS-FUNCOES-SUBFUNCOES-E-PROG-DE-GOVERNO-CONF-O-VINCULO-COM-OS-RECURSOS-E-CAT-ECONOMICA.pdf",
        "2025_anexo8": "https://portaltransparencia.belem.pa.gov.br/wp-content/uploads/2026/05/ANEXO-8-CONSOLIDACAO-GERAL-FUNCOES-SUBFUNCOES-E-PROGRAM.pdf",
        
        # 2026 Balancetes
        "2026_jan": "https://portaltransparencia.belem.pa.gov.br/wp-content/uploads/2026/03/BALANCETE_FINANCEIRO_CONSOLIDADO_JAN_2026_Vs_2.pdf",
        "2026_fev": "https://portaltransparencia.belem.pa.gov.br/wp-content/uploads/2026/04/BALANCETE_FINANCEIRO_CONSOLIDADO_FEV_2026_Vs_1.pdf",
    }

    def __init__(self, output_dir="data"):
        self.output_dir = output_dir
        self.pdf_dir = os.path.join(output_dir, "pdfs")
        os.makedirs(self.pdf_dir, exist_ok=True)
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }

    def fetch_links_from_url(self, page_url):
        """Scrapes all PDF links from a given page URL."""
        print(f"Scraping links from: {page_url}")
        try:
            req = urllib.request.Request(page_url, headers=self.headers)
            with urllib.request.urlopen(req, timeout=15) as response:
                html = response.read()
            soup = BeautifulSoup(html, 'html.parser')
            links = []
            for a in soup.find_all('a', href=True):
                href = a['href']
                if href.lower().endswith('.pdf'):
                    links.append(href)
            return list(set(links))
        except Exception as e:
            print(f"Warning: Failed to scrape {page_url} due to {e}. Using fallbacks if available.")
            return []

    def download_file(self, url, filename):
        """Downloads a single PDF file, keeping local cache if it already exists."""
        dest_path = os.path.join(self.pdf_dir, filename)
        if os.path.exists(dest_path) and os.path.getsize(dest_path) > 10000:
            print(f"Already cached: {filename}")
            return dest_path
            
        print(f"Downloading: {filename} ...")
        try:
            req = urllib.request.Request(url, headers=self.headers)
            with urllib.request.urlopen(req, timeout=20) as response, open(dest_path, 'wb') as out_file:
                out_file.write(response.read())
            print(f"Successfully saved to: {dest_path}")
            return dest_path
        except Exception as e:
            print(f"Error downloading {filename} from {url}: {e}")
            return None

    def run(self):
        """Runs the scraping and downloading pipeline."""
        bg_links = self.fetch_links_from_url(self.BASE_BG_URL)
        bf_links = self.fetch_links_from_url(self.BASE_BF_URL)
        all_online_links = bg_links + bf_links
        
        downloads = {}
        
        # We search online links first, if not found we use fallback list
        target_keys = ["anexo10", "anexo8", "jan", "fev"]
        
        for key, fallback_url in self.FALLBACK_URLS.items():
            year_prefix = key.split("_")[0]
            doc_type = key.split("_")[1]
            
            # Find in scraped links
            matched_url = None
            for link in all_online_links:
                decoded_link = urllib.parse.unquote(link).lower()
                
                # Check for year
                if year_prefix in decoded_link:
                    # Check for doc type
                    if doc_type == "anexo10" and ("anexo-10" in decoded_link or "anexo10" in decoded_link or ("anexo" in decoded_link and "10" in decoded_link and "receita" in decoded_link)):
                        matched_url = link
                        break
                    elif doc_type == "anexo8" and ("anexo-8" in decoded_link or "anexo08" in decoded_link or "anexo-08" in decoded_link or ("anexo" in decoded_link and "8" in decoded_link and "funcoes" in decoded_link)):
                        matched_url = link
                        break
                    elif doc_type == "jan" and "jan" in decoded_link and "2026" in decoded_link:
                        matched_url = link
                        break
                    elif doc_type == "fev" and "fev" in decoded_link and "2026" in decoded_link:
                        matched_url = link
                        break
            
            # If not found online, use the fallback direct URL
            if not matched_url:
                matched_url = fallback_url
                print(f"Using static fallback URL for: {key}")
                
            filename = f"belem_{key}.pdf"
            path = self.download_file(matched_url, filename)
            if path:
                downloads[key] = path
                
        return downloads

if __name__ == "__main__":
    scraper = BelemTransparencyScraper()
    scraper.run()
