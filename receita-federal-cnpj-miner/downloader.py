
import urllib.request
import os
import sys
from datetime import datetime
from config import CHUNK_SIZE

LOG_FILE = "migration.log"

def log(msg, level="INFO"):
    """Log to console and file with timestamp and level."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    console_msg = f"[{timestamp.split()[1]}] {msg}"
    try:
        print(console_msg)
    except UnicodeEncodeError:
        # Fallback to ascii representation on environments with restricted console encoding
        print(console_msg.encode('ascii', errors='replace').decode('ascii'))
    
    # File output (detailed)
    file_msg = f"[{timestamp}] [{level}] {msg}\n"
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(file_msg)


def log_success(msg):
    log(f"✓ {msg}", "SUCCESS")

def log_error(msg):
    log(f"✗ {msg}", "ERROR")

def log_phase(phase_name):
    separator = "=" * 60
    log(separator, "PHASE")
    log(f"PHASE: {phase_name}", "PHASE")
    log(separator, "PHASE")

import time

def download_file(url, local_filename, max_retries=3, delay=5):
    if os.path.exists(local_filename):
        log(f"File {local_filename} already exists. Skipping download.")
        return True

    for attempt in range(1, max_retries + 1):
        if attempt > 1:
            log(f"Retrying download of {local_filename}... (Attempt {attempt} of {max_retries})")
            time.sleep(delay)
        else:
            log(f"Downloading {url}...")
            
        try:
            # Added 30 seconds timeout to prevent hanging on slow connections
            with urllib.request.urlopen(url, timeout=30) as response, open(local_filename, 'wb') as out_file:
                total_size = int(response.info().get('Content-Length', 0))
                downloaded = 0
                while True:
                    chunk = response.read(CHUNK_SIZE)
                    if not chunk:
                        break
                    out_file.write(chunk)
                    downloaded += len(chunk)
                    if total_size > 0:
                        percent = (downloaded / total_size) * 100
                        sys.stdout.write(f"\rProgress: {percent:.1f}% ({downloaded}/{total_size})")
                        sys.stdout.flush()
            print()
            log_success(f"Download complete: {local_filename} ({total_size} bytes)")
            return True
        except Exception as e:
            log_error(f"Download attempt {attempt} failed for {url}: {e}")
            if os.path.exists(local_filename):
                try:
                    os.remove(local_filename)
                except Exception as cleanup_err:
                    log_error(f"Failed to remove partial file {local_filename}: {cleanup_err}")
                    
    log_error(f"All {max_retries} download attempts failed for {url}.")
    return False

