
import zipfile
import io
import csv
import os
from downloader import download_file, log, log_success, log_error
from config import BASE_URL, TARGET_MUNICIPALITY_CODE, TARGET_SITUACAO_ATIVA
from state import mark_file_complete, is_file_complete, add_error, save_roots
from normalizer import normalize_bairro

def process_reference_table(conn, state, filename, table_name):
    """Process a reference table. Returns True on success, False on failure."""
    if is_file_complete(state, filename):
        log(f"Skipping {filename} (already processed)")
        return True
    
    if not download_file(BASE_URL + filename, filename):
        add_error(state, f"Download failed: {filename}")
        log_error(f"Could not download reference table {table_name}")
        return False
    
    cursor = conn.cursor()
    log(f"Processing reference table {table_name}...")
    
    try:
        with zipfile.ZipFile(filename) as z:
            with z.open(z.namelist()[0]) as f:
                wrapper = io.TextIOWrapper(f, encoding='latin-1')
                reader = csv.reader(wrapper, delimiter=';', quotechar='"')
                batch = []
                for row in reader:
                    if len(row) >= 2:
                        batch.append((row[0], row[1]))
                if batch:
                    cursor.executemany(f"INSERT OR IGNORE INTO {table_name} VALUES (?, ?)", batch)
                    conn.commit()
                    log_success(f"Reference table {table_name}: {len(batch)} records inserted")
        os.remove(filename)
        mark_file_complete(state, filename)
        return True
    except Exception as e:
        add_error(state, f"Error processing {filename}: {e}")
        log_error(f"Error processing {table_name}: {e}")
        return False

def process_estabelecimentos(conn, state):
    """Process establishments. Returns (roots, success) tuple."""
    cursor = conn.cursor()
    relevant_roots = set()
    total_inserted = 0
    has_error = False
    
    for i in range(10):
        filename = f"Estabelecimentos{i}.zip"
        
        if is_file_complete(state, filename):
            log(f"Skipping {filename} (already processed)")
            continue
        
        if not download_file(BASE_URL + filename, filename):
            add_error(state, f"Download failed: {filename}")
            log_error(f"Could not download {filename}")
            has_error = True
            break  # Stop on first error
            
        log(f"Filtering {filename} for Municipality {TARGET_MUNICIPALITY_CODE} and Status {TARGET_SITUACAO_ATIVA}...")
        try:
            with zipfile.ZipFile(filename) as z:
                with z.open(z.namelist()[0]) as f:
                    wrapper = io.TextIOWrapper(f, encoding='latin-1')
                    reader = csv.reader(wrapper, delimiter=';', quotechar='"')
                    batch = []
                    file_count = 0
                    for row in reader:
                        if len(row) < 30: continue
                        
                        if row[20] == TARGET_MUNICIPALITY_CODE and row[5] == TARGET_SITUACAO_ATIVA:
                            relevant_roots.add(row[0])
                            
                            # Build full CNPJ for normalization lookup
                            cnpj_full = row[0] + row[1] + row[2]
                            bairro_original = row[17]
                            bairro_normalizado = normalize_bairro(bairro_original, cnpj_full)
                            
                            # Append row data + normalized neighborhood (31 fields total)
                            record = tuple(row[0:30]) + (bairro_normalizado,)
                            batch.append(record)
                            file_count += 1
                            
                            if len(batch) >= 5000:
                                cursor.executemany("INSERT OR IGNORE INTO estabelecimentos VALUES (" + ",".join(["?"]*31) + ")", batch)
                                conn.commit()
                                batch = []
                    if batch:
                        cursor.executemany("INSERT OR IGNORE INTO estabelecimentos VALUES (" + ",".join(["?"]*31) + ")", batch)
                        conn.commit()
            
            total_inserted += file_count
            log_success(f"{filename}: {file_count} active establishments found")
            os.remove(filename)
            mark_file_complete(state, filename)
            
            # Save roots incrementally for resume
            save_roots(state, relevant_roots)
            
        except Exception as e:
            add_error(state, f"Error processing {filename}: {e}")
            log_error(f"Error processing {filename}: {e}")
            has_error = True
            break
    
    if not has_error:
        log_success(f"TOTAL: {total_inserted} establishments, {len(relevant_roots)} unique CNPJs")
    
    return relevant_roots, not has_error

def process_generic(conn, state, file_prefix, table_name, columns_count, relevant_roots):
    """Process generic files. Returns True on success, False on failure."""
    cursor = conn.cursor()
    query = f"INSERT OR IGNORE INTO {table_name} VALUES (" + ",".join(["?"]*columns_count) + ")"
    total_inserted = 0
    has_error = False
    
    for i in range(10):
        filename = f"{file_prefix}{i}.zip"
        
        if is_file_complete(state, filename):
            log(f"Skipping {filename} (already processed)")
            continue
        
        if not download_file(BASE_URL + filename, filename):
            add_error(state, f"Download failed: {filename}")
            log_error(f"Could not download {filename}")
            has_error = True
            break
            
        log(f"Processing {filename} for {len(relevant_roots)} roots...")
        try:
            with zipfile.ZipFile(filename) as z:
                with z.open(z.namelist()[0]) as f:
                    wrapper = io.TextIOWrapper(f, encoding='latin-1')
                    reader = csv.reader(wrapper, delimiter=';', quotechar='"')
                    batch = []
                    file_count = 0
                    for row in reader:
                        if len(row) < columns_count: continue
                        if row[0] in relevant_roots:
                            batch.append(tuple(row[0:columns_count]))
                            file_count += 1
                            if len(batch) >= 5000:
                                cursor.executemany(query, batch)
                                conn.commit()
                                batch = []
                    if batch:
                        cursor.executemany(query, batch)
                        conn.commit()
            
            total_inserted += file_count
            log_success(f"{filename}: {file_count} records matched")
            os.remove(filename)
            mark_file_complete(state, filename)
        except Exception as e:
            add_error(state, f"Error processing {filename}: {e}")
            log_error(f"Error processing {filename}: {e}")
            has_error = True
            break
    
    if not has_error:
        log_success(f"TOTAL {table_name}: {total_inserted} records inserted")
    
    return not has_error

def process_simples(conn, state, relevant_roots):
    """Process Simples/MEI data. Returns True on success, False on failure."""
    filename = "Simples.zip"
    
    if is_file_complete(state, filename):
        log(f"Skipping {filename} (already processed)")
        return True
    
    if not download_file(BASE_URL + filename, filename):
        add_error(state, f"Download failed: {filename}")
        log_error("Could not download Simples.zip")
        return False
        
    cursor = conn.cursor()
    log("Processing Simples/MEI data...")
    try:
        with zipfile.ZipFile(filename) as z:
            with z.open(z.namelist()[0]) as f:
                wrapper = io.TextIOWrapper(f, encoding='latin-1')
                reader = csv.reader(wrapper, delimiter=';', quotechar='"')
                batch = []
                total = 0
                for row in reader:
                    if len(row) < 7: continue
                    if row[0] in relevant_roots:
                        batch.append(tuple(row[0:7]))
                        total += 1
                        if len(batch) >= 5000:
                            cursor.executemany("INSERT OR IGNORE INTO simples_mei VALUES (?,?,?,?,?,?,?)", batch)
                            conn.commit()
                            batch = []
                if batch:
                    cursor.executemany("INSERT OR IGNORE INTO simples_mei VALUES (?,?,?,?,?,?,?)", batch)
                    conn.commit()
        
        log_success(f"Simples/MEI: {total} records inserted")
        os.remove(filename)
        mark_file_complete(state, filename)
        return True
    except Exception as e:
        add_error(state, f"Error processing Simples: {e}")
        log_error(f"Error processing Simples: {e}")
        return False
