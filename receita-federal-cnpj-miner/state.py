
import json
import os

STATE_FILE = "migration_state.json"

def load_state():
    """Load migration state from checkpoint file."""
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {
        "phase": "INIT",
        "completed_phases": [],
        "relevant_roots": [],
        "completed_files": [],
        "errors": [],
        "last_update": None
    }

def save_state(state):
    """Save migration state to checkpoint file."""
    from datetime import datetime
    state["last_update"] = datetime.now().isoformat()
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2, ensure_ascii=False)

def mark_phase_complete(state, phase_name):
    """Mark a phase as completed."""
    if phase_name not in state["completed_phases"]:
        state["completed_phases"].append(phase_name)
    save_state(state)

def mark_file_complete(state, filename):
    """Mark a file as processed."""
    if filename not in state["completed_files"]:
        state["completed_files"].append(filename)
    save_state(state)

def is_phase_complete(state, phase_name):
    """Check if a phase was already completed."""
    return phase_name in state["completed_phases"]

def is_file_complete(state, filename):
    """Check if a file was already processed."""
    return filename in state["completed_files"]

def add_error(state, error_msg):
    """Record an error."""
    state["errors"].append(error_msg)
    save_state(state)

def save_roots(state, roots):
    """Save discovered CNPJ roots for resume."""
    state["relevant_roots"] = list(roots)
    save_state(state)

def get_roots(state):
    """Get previously discovered roots."""
    return set(state.get("relevant_roots", []))

def clear_state():
    """Remove checkpoint file after successful completion."""
    if os.path.exists(STATE_FILE):
        os.remove(STATE_FILE)
