package database

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"time"

	_ "modernc.org/sqlite" // Pure Go SQLite driver (CGO-free, perfect for Windows/Linux)
)

type Database struct {
	Conn *sql.DB
}

type TelemetryRecord struct {
	ID               int64     `json:"id"`
	Timestamp        time.Time `json:"timestamp"`
	Source           string    `json:"source"`
	Neighborhood     string    `json:"neighborhood"`
	Temperature      float64   `json:"temperature"`
	Humidity         float64   `json:"humidity"`
	HeatIndex        float64   `json:"heat_index"`
	Rainfall         float64   `json:"rainfall"`
	RiverLevel       float64   `json:"river_level"`
	AlertLevel       string    `json:"alert_level"`
	AlertDescription string    `json:"alert_description"`
}

// InitDB inicializa o banco SQLite conectando ao banco compartilhado
func InitDB() (*Database, error) {
	// Caminho compartilhado com o cisc-data-pipelines
	dbDir := filepath.Join("..", "cisc-data-pipelines")
	os.MkdirAll(dbDir, 0755)
	dbPath := filepath.Join(dbDir, "cisc_health.db")

	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return nil, fmt.Errorf("falha ao abrir banco sqlite: %w", err)
	}

	// Habilitar WAL mode para melhor desempenho de leitura/escrita concorrente
	if _, err := db.Exec("PRAGMA journal_mode=WAL;"); err != nil {
		return nil, fmt.Errorf("falha ao ativar modo WAL: %w", err)
	}

	// Criar tabela de telemetria se não existir
	query := `
	CREATE TABLE IF NOT EXISTS telemetry (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		timestamp TEXT NOT NULL,
		source TEXT NOT NULL,
		neighborhood TEXT NOT NULL,
		temperature REAL,
		humidity REAL,
		heat_index REAL,
		rainfall REAL,
		river_level REAL,
		alert_level TEXT,
		alert_description TEXT
	);`

	if _, err := db.Exec(query); err != nil {
		return nil, fmt.Errorf("falha ao criar tabela: %w", err)
	}

	return &Database{Conn: db}, nil
}

// InsertTelemetry insere uma nova leitura de telemetria no banco
func (db *Database) InsertTelemetry(rec *TelemetryRecord) (int64, error) {
	query := `
	INSERT INTO telemetry (
		timestamp, source, neighborhood, temperature, humidity, heat_index, rainfall, river_level, alert_level, alert_description
	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

	res, err := db.Conn.Exec(
		query,
		rec.Timestamp.Format(time.RFC3339),
		rec.Source,
		rec.Neighborhood,
		rec.Temperature,
		rec.Humidity,
		rec.HeatIndex,
		rec.Rainfall,
		rec.RiverLevel,
		rec.AlertLevel,
		rec.AlertDescription,
	)
	if err != nil {
		return 0, err
	}

	return res.LastInsertId()
}

// GetRecentTelemetry busca as últimas N telemetrias inseridas
func (db *Database) GetRecentTelemetry(limit int) ([]TelemetryRecord, error) {
	query := `
	SELECT id, timestamp, source, neighborhood, temperature, humidity, heat_index, rainfall, river_level, alert_level, alert_description
	FROM telemetry
	ORDER BY id DESC
	LIMIT ?`

	rows, err := db.Conn.Query(query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var records []TelemetryRecord
	for rows.Next() {
		var rec TelemetryRecord
		var tsStr string
		err := rows.Scan(
			&rec.ID,
			&tsStr,
			&rec.Source,
			&rec.Neighborhood,
			&rec.Temperature,
			&rec.Humidity,
			&rec.HeatIndex,
			&rec.Rainfall,
			&rec.RiverLevel,
			&rec.AlertLevel,
			&rec.AlertDescription,
		)
		if err != nil {
			return nil, err
		}

		t, err := time.Parse(time.RFC3339, tsStr)
		if err == nil {
			rec.Timestamp = t
		}
		records = append(records, rec)
	}

	return records, nil
}
