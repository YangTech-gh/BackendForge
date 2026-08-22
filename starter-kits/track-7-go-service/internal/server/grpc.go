package server

import (
	"context"
	"time"

	pb "github.com/backendforge/go-service/proto"
	"go.uber.org/zap"
)

type GRPCServer struct {
	pb.UnimplementedHealthServiceServer
	logger *zap.Logger
}

func NewGRPCServer(logger *zap.Logger) *GRPCServer {
	return &GRPCServer{logger: logger}
}

func (s *GRPCServer) Health(ctx context.Context, req *pb.HealthRequest) (*pb.HealthResponse, error) {
	s.logger.Info("health check requested")
	return &pb.HealthResponse{
		Status:  "ok",
		Version: "1.0.0",
	}, nil
}

func (s *GRPCServer) Start(addr string) error {
	s.logger.Info("starting gRPC server", zap.String("addr", addr))
	return nil
}

func (s *GRPCServer) Shutdown(ctx context.Context) {
	s.logger.Info("shutting down gRPC server")
	time.Sleep(100 * time.Millisecond)
}
