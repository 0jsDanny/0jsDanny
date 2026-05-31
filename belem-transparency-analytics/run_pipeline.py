# -*- coding: utf-8 -*-
"""
Belém Transparency Analytics - Pipeline Runner
Executes both scraping and analysis/report generation phases.
"""
import sys
import generate_report

if __name__ == "__main__":
    try:
        generate_report.main()
        print("\nPipeline run complete. Check the 'reports/' directory for outputs.")
    except Exception as e:
        print(f"Error executing pipeline: {e}")
        sys.exit(1)
