# Scratch / Recursos Auxiliares (belem_maps)

Esta pasta contém arquivos auxiliares e recursos brutos que não fazem parte do fluxo principal de geração do GeoJSON final, mas que são úteis para fins de auditoria, testes ou replicação do processo de extração.

## Conteúdo

1. **`Bairros de Belém – CODEM.html`**:
   - Cópia salva da página oficial da CODEM contendo os links para os PDFs de cada bairro.
   - Utilizado pelo script `download_codem_pdfs.py` para baixar os arquivos originais.

2. **`test_pdf_vectors.py`**:
   - Script de teste para analisar a estrutura interna dos PDFs da CODEM.
   - Verifica se os arquivos contêm dados vetoriais extraíveis ou se são apenas imagens escaneadas (raster), imprimindo um relatório detalhado.

3. **`view-source_https___defesacivil.belem.pa.gov.br_riscos-geologicos_.mhtml`**:
   - Snapshot estático da página de Riscos Geológicos da Defesa Civil de Belém.
   - **Nota sobre inconsistências observadas**: A página original da Defesa Civil possui erros de digitação (typos) em alguns links:
     - O link sob o rótulo *SETORIZAÇÃO DE ÁREAS 024* aponta erroneamente para o PDF do Setor 023 (`PA_BELEM_SR_023_CPRM.pdf`).
     - O link sob o rótulo *SETORIZAÇÃO DE ÁREAS 046* aponta erroneamente para o PDF do Setor 003 (`PA_BELEM_SR_003_CPRM.pdf`).
     - No entanto, os arquivos correspondentes corretos (`PA_BELEM_SR_024_CPRM.pdf` e `PA_BELEM_SR_046_CPRM.pdf`) existem no servidor.
   - Para contornar essa inconsistência, o script `download_riscos_pdfs.py` monta as URLs diretamente em uma sequência numérica de `001` a `125`, garantindo o download dos 126 arquivos corretos (125 setores + 1 arquivo de índice).


