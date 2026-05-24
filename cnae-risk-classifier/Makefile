.PHONY: test bench race build run

## test: run all tests
test:
	go test ./...

## race: run tests with the race detector
race:
	go test -race ./...

## bench: run benchmarks
bench:
	go test -bench=. -benchmem ./...

## build: compile the CLI binary
build:
	go build -o cnae-risk-classifier ./cmd/cnae-risk-classifier

## run: build and run with example CNAEs
run: build
	./cnae-risk-classifier 5611201 4771701 8610101

## run-json: run with JSON input via stdin
run-json: build
	@echo '["5611201","4771701","8610101","4781400"]' | ./cnae-risk-classifier

## clean: remove compiled binary
clean:
	rm -f cnae-risk-classifier cnae-risk-classifier.exe

## help: list available targets
help:
	@grep -E '^##' Makefile | sed 's/## //'
