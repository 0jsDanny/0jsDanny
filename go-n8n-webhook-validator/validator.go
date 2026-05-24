package webhook

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/hex"
	"io"
	"net/http"
)

// HMACValidator lida com a verificação de assinaturas de Webhooks
type HMACValidator struct {
	Secret     []byte
	HeaderName string
}

// NewHMACValidator cria uma nova instância do validador
func NewHMACValidator(secret, headerName string) *HMACValidator {
	return &HMACValidator{
		Secret:     []byte(secret),
		HeaderName: headerName,
	}
}

// Middleware retorna um middleware HTTP que barra requisições não autenticadas
func (v *HMACValidator) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		signature := r.Header.Get(v.HeaderName)
		if signature == "" {
			http.Error(w, "Assinatura ausente", http.StatusUnauthorized)
			return
		}

		// Lê o body para validação
		body, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "Erro ao ler o corpo da requisição", http.StatusInternalServerError)
			return
		}

		// Restaura o body para que handlers seguintes possam consumi-lo
		r.Body = io.NopCloser(bytes.NewBuffer(body))

		if !v.Validate(body, signature) {
			http.Error(w, "Assinatura inválida", http.StatusUnauthorized)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// Validate calcula o HMAC e compara com a assinatura fornecida
func (v *HMACValidator) Validate(payload []byte, signature string) bool {
	mac := hmac.New(sha256.New, v.Secret)
	mac.Write(payload)
	expectedMAC := hex.EncodeToString(mac.Sum(nil))

	// Previne timing attacks
	return subtle.ConstantTimeCompare([]byte(signature), []byte(expectedMAC)) == 1
}
