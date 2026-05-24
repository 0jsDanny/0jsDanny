
import sys
from database import get_connection, init_db, create_views
from processor import (
    process_estabelecimentos, 
    process_generic, 
    process_simples, 
    process_reference_table
)
from downloader import log, log_success, log_error, log_phase, LOG_FILE
from state import (
    load_state, save_state, mark_phase_complete, is_phase_complete,
    get_roots, clear_state, add_error
)
from datetime import datetime

def main():
    start_time = datetime.now()
    
    # Load previous state (for resume)
    state = load_state()
    
    is_resume = len(state["completed_phases"]) > 0
    
    # Initialize log
    mode = "a" if is_resume else "w"
    with open(LOG_FILE, mode, encoding="utf-8") as f:
        if is_resume:
            f.write(f"\n=== Migration RESUMED at {start_time.strftime('%Y-%m-%d %H:%M:%S')} ===\n")
            f.write(f"Previously completed phases: {state['completed_phases']}\n")
        else:
            f.write(f"=== Migration Started at {start_time.strftime('%Y-%m-%d %H:%M:%S')} ===\n")
    
    if is_resume:
        log_phase("RESUMING MIGRATION")
        log(f"Resuming from previous run. Completed phases: {state['completed_phases']}")
    else:
        log_phase("INITIALIZATION")
        log("Starting Optimized Migration (Active Companies in Belém)")
    
    conn = get_connection()
    init_db(conn)
    log_success("Database initialized")
    
    # Track overall success
    all_success = True
    
    # 1. Establishments
    if not is_phase_complete(state, "ESTABLISHMENTS"):
        log_phase("ESTABLISHMENTS (Discovery - ACTIVE ONLY)")
        roots, success = process_estabelecimentos(conn, state)
        if success:
            mark_phase_complete(state, "ESTABLISHMENTS")
        else:
            all_success = False
            log_error("ESTABLISHMENTS phase failed. Stopping migration.")
    else:
        log("Phase ESTABLISHMENTS already completed, loading saved roots...")
        roots = get_roots(state)
        log_success(f"Loaded {len(roots)} previously discovered roots")
    
    if all_success and roots:
        # 2. Companies
        if not is_phase_complete(state, "EMPRESAS"):
            log_phase("COMPANY DETAILS")
            success = process_generic(conn, state, "Empresas", "empresas", 7, roots)
            if success:
                mark_phase_complete(state, "EMPRESAS")
            else:
                all_success = False
                log_error("EMPRESAS phase failed. Stopping migration.")
        else:
            log("Phase EMPRESAS already completed, skipping...")
        
        # 3. Partners
        if all_success and not is_phase_complete(state, "SOCIOS"):
            log_phase("PARTNERS")
            success = process_generic(conn, state, "Socios", "socios", 11, roots)
            if success:
                mark_phase_complete(state, "SOCIOS")
            else:
                all_success = False
                log_error("SOCIOS phase failed. Stopping migration.")
        elif all_success:
            log("Phase SOCIOS already completed, skipping...")
        
        # 4. Simples / MEI
        if all_success and not is_phase_complete(state, "SIMPLES_MEI"):
            log_phase("SIMPLES / MEI DATA")
            success = process_simples(conn, state, roots)
            if success:
                mark_phase_complete(state, "SIMPLES_MEI")
            else:
                all_success = False
                log_error("SIMPLES_MEI phase failed. Stopping migration.")
        elif all_success:
            log("Phase SIMPLES_MEI already completed, skipping...")
    elif not roots:
        all_success = False
        add_error(state, "No establishments found!")
        log_error("No establishments found! Cannot continue.")
    
    # 5. Reference Tables
    if all_success and not is_phase_complete(state, "REFERENCE"):
        log_phase("REFERENCE DATA")
        reference_files = {
            "Cnaes.zip": "cnaes",
            "Motivos.zip": "motivos",
            "Naturezas.zip": "naturezas",
            "Municipios.zip": "municipios",
            "Paises.zip": "paises",
            "Qualificacoes.zip": "qualificacoes"
        }
        ref_success = True
        for filename, table in reference_files.items():
            if not process_reference_table(conn, state, filename, table):
                ref_success = False
                break
        
        if ref_success:
            mark_phase_complete(state, "REFERENCE")
        else:
            all_success = False
            log_error("REFERENCE phase failed. Stopping migration.")
    elif all_success:
        log("Phase REFERENCE already completed, skipping...")
    
    # 6. Views
    if all_success and not is_phase_complete(state, "VIEWS"):
        log_phase("CREATING VIEWS")
        try:
            create_views(conn)
            log_success("Views created successfully")
            mark_phase_complete(state, "VIEWS")
        except Exception as e:
            all_success = False
            add_error(state, f"Failed to create views: {e}")
            log_error(f"Failed to create views: {e}")
    elif all_success:
        log("Phase VIEWS already completed, skipping...")
    
    conn.close()
    
    # Summary
    end_time = datetime.now()
    duration = end_time - start_time
    
    if all_success:
        log_phase("MIGRATION COMPLETE")
        log_success(f"Database generated: dados_cnpj_belem_ativo.db")
        log_success(f"Total duration: {duration}")
        log(f"Full log saved to: {LOG_FILE}")
        
        # Clear checkpoint file on success
        clear_state()
        log_success("Checkpoint file cleared (migration complete)")
    else:
        log_phase("MIGRATION STOPPED")
        log_error("Migration stopped due to errors.")
        log_error(f"Errors: {state.get('errors', [])}")
        log(f"State saved to migration_state.json - run again to resume")
        log(f"Full log saved to: {LOG_FILE}")
        sys.exit(1)

if __name__ == "__main__":
    main()
