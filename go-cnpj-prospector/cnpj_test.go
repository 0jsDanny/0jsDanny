package main

import (
	"testing"
	"time"
)

func TestCleanCNPJ(t *testing.T) {
	tests := []struct {
		input    string
		expected string
	}{
		{"12.345.678/0001-95", "12345678000195"},
		{"12345678000195", "12345678000195"},
		{"A1.B2C.3D4/E5F6-68", "A1B2C3D4E5F668"},
		{"  123-456/7890..12  ", "123456789012"},
	}

	for _, test := range tests {
		result := CleanCNPJ(test.input)
		if result != test.expected {
			t.Errorf("CleanCNPJ(%q) = %q; expected %q", test.input, result, test.expected)
		}
	}
}

func TestFormatCNPJ(t *testing.T) {
	tests := []struct {
		input    string
		expected string
	}{
		{"12345678000195", "12.345.678/0001-95"},
		{"A1B2C3D4E5F668", "A1.B2C.3D4/E5F6-68"},
		{"123", "123"}, // too short, should return original
	}

	for _, test := range tests {
		result := FormatCNPJ(test.input)
		if result != test.expected {
			t.Errorf("FormatCNPJ(%q) = %q; expected %q", test.input, result, test.expected)
		}
	}
}

func TestValidateCNPJ(t *testing.T) {
	tests := []struct {
		cnpj  string
		valid bool
	}{
		// Valid numeric CNPJs
		{"19.131.243/0001-97", true},
		{"19131243000197", true},
		{"00.000.000/0001-91", true},
		{"00000000000191", true},
		// Invalid numeric CNPJs
		{"19131243000198", false}, // wrong check digit
		{"00000000000000", false}, // repeating digits
		{"11111111111111", false}, // repeating digits
		{"12345678", false},       // too short
		
		// Valid alphanumeric CNPJs (calculated using COCAD 01/2024 rules)
		{"A1B2C3D4E5F668", true}, // A1.B2C.3D4/E5F6-68
		{"A1.B2C.3D4/E5F6-68", true},
		{"12A34B56C78D91", true}, // 12.A34.B56/C78D-91
		{"12.A34.B56/C78D-91", true},

		// Invalid alphanumeric CNPJs
		{"A1B2C3D4E5F669", false}, // wrong second check digit
		{"A1B2C3D4E5F678", false}, // wrong both check digits
		{"AAAAAAAAAAAAAA", false}, // repeating characters
	}

	for _, test := range tests {
		result := ValidateCNPJ(test.cnpj)
		if result != test.valid {
			t.Errorf("ValidateCNPJ(%q) = %v; expected %v", test.cnpj, result, test.valid)
		}
	}
}

func TestCache(t *testing.T) {
	cache := NewCNPJCache()
	cnpj := "19131243000197"
	resp := &CNPJNormalizedResponse{
		CNPJ:        cnpj,
		RazaoSocial: "Open Knowledge Brasil",
	}

	// Should not find initially
	if _, ok := cache.Get(cnpj, 5*time.Second); ok {
		t.Error("Cache hit on empty cache")
	}

	// Set and get
	cache.Set(cnpj, resp)
	cached, ok := cache.Get(cnpj, 5*time.Second)
	if !ok {
		t.Error("Cache miss after setting entry")
	}
	if cached.RazaoSocial != "Open Knowledge Brasil" {
		t.Errorf("Expected 'Open Knowledge Brasil', got %q", cached.RazaoSocial)
	}

	// Should expire
	time.Sleep(10 * time.Millisecond)
	if _, ok := cache.Get(cnpj, 5*time.Millisecond); ok {
		t.Error("Cache entry did not expire")
	}

	// Clear
	cache.Set(cnpj, resp)
	cache.Clear()
	if _, ok := cache.Get(cnpj, 5*time.Second); ok {
		t.Error("Cache not cleared")
	}
}
