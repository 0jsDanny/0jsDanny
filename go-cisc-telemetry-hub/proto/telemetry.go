package proto

import (
	"context"
	"google.golang.org/grpc"
)

// TelemetryData representa a mensagem gRPC para dados de sensores/alertas
type TelemetryData struct {
	Timestamp        string  `json:"timestamp"`
	Source           string  `json:"source"`
	Neighborhood     string  `json:"neighborhood"`
	Temperature      float32 `json:"temperature"`
	Humidity         float32 `json:"humidity"`
	HeatIndex        float32 `json:"heat_index"`
	Rainfall         float32 `json:"rainfall"`
	RiverLevel       float32 `json:"river_level"`
	AlertLevel       string  `json:"alert_level"`
	AlertDescription string  `json:"alert_description"`
}

// Implementação da interface proto.Message
func (*TelemetryData) Reset()         {}
func (*TelemetryData) String() string { return "" }
func (*TelemetryData) ProtoMessage()  {}

// TelemetryResponse representa a resposta de confirmação de ingestão
type TelemetryResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Id      int64  `json:"id"`
}

// Implementação da interface proto.Message
func (*TelemetryResponse) Reset()         {}
func (*TelemetryResponse) String() string { return "" }
func (*TelemetryResponse) ProtoMessage()  {}

// TelemetryIngestionServer é a interface do serviço gRPC
type TelemetryIngestionServer interface {
	SubmitTelemetry(context.Context, *TelemetryData) (*TelemetryResponse, error)
}

// Registrador do Servidor gRPC sem dependência de protoc local
func RegisterTelemetryIngestionServer(s grpc.ServiceRegistrar, srv TelemetryIngestionServer) {
	s.RegisterService(&TelemetryIngestion_ServiceDesc, srv)
}

var TelemetryIngestion_ServiceDesc = grpc.ServiceDesc{
	ServiceName: "telemetry.TelemetryIngestion",
	HandlerType: (*TelemetryIngestionServer)(nil),
	Methods: []grpc.MethodDesc{
		{
			MethodName: "SubmitTelemetry",
			Handler:    _TelemetryIngestion_SubmitTelemetry_Handler,
		},
	},
	Streams:  []grpc.StreamDesc{},
	Metadata: "proto/telemetry.proto",
}

func _TelemetryIngestion_SubmitTelemetry_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(TelemetryData)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(TelemetryIngestionServer).SubmitTelemetry(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/telemetry.TelemetryIngestion/SubmitTelemetry",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(TelemetryIngestionServer).SubmitTelemetry(ctx, req.(*TelemetryData))
	}
	return interceptor(ctx, in, info, handler)
}
