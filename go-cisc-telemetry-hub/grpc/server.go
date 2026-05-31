package grpc

import (
	"context"
	"log"
	"time"

	"github.com/0jsDanny/go-cisc-telemetry-hub/database"
	"github.com/0jsDanny/go-cisc-telemetry-hub/proto"
)

type Server struct {
	DB       *database.Database
	EventBus chan *database.TelemetryRecord
}

// SubmitTelemetry recebe dados via gRPC, salva no banco e despacha para o barramento de eventos
func (s *Server) SubmitTelemetry(ctx context.Context, req *proto.TelemetryData) (*proto.TelemetryResponse, error) {
	log.Printf("[gRPC] Nova telemetria recebida: Fonte=%s | Bairro=%s | NivelAlerta=%s", req.Source, req.Neighborhood, req.AlertLevel)

	// Criar registro para o banco de dados
	rec := &database.TelemetryRecord{
		Timestamp:        time.Now(),
		Source:           req.Source,
		Neighborhood:     req.Neighborhood,
		Temperature:      float64(req.Temperature),
		Humidity:         float64(req.Humidity),
		HeatIndex:        float64(req.HeatIndex),
		Rainfall:         float64(req.Rainfall),
		RiverLevel:       float64(req.RiverLevel),
		AlertLevel:       req.AlertLevel,
		AlertDescription: req.AlertDescription,
	}

	// Persistir no SQLite
	id, err := s.DB.InsertTelemetry(rec)
	if err != nil {
		log.Printf("[gRPC] Erro ao persistir telemetria: %v", err)
		return &proto.TelemetryResponse{
			Success: false,
			Message: "Erro interno ao persistir dados",
		}, nil
	}
	rec.ID = id

	// Despachar evento para assinantes GraphQL de forma assíncrona
	select {
	case s.EventBus <- rec:
		// Enviado com sucesso
	default:
		// Buffer cheio, descarta para evitar travamentos
	}

	return &proto.TelemetryResponse{
		Success: true,
		Message: "Telemetria processada com sucesso no CISC Hub",
		Id:      id,
	}, nil
}
