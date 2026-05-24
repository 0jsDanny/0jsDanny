package main

// StandardEvent is the normalized data contract that the message broker (e.g. n8n) expects.
type StandardEvent struct {
	EventType    string         `json:"eventType"`
	FormID       string         `json:"formId"`
	SubmissionID string         `json:"submissionId"`
	Payload      map[string]any `json:"payload"`
}

// EventAdapter is the interface for transforming heterogeneous sources into a unified contract.
type EventAdapter interface {
	Normalize() StandardEvent
}

// --- Implementation 1: External Tally Form Payload ---

type TallyPayload struct {
	ResponseID string
	Fields     []string
	Data       map[string]any
}

func (t TallyPayload) Normalize() StandardEvent {
	return StandardEvent{
		EventType:    "FORM_RESPONSE",
		FormID:       "EXTERNAL_TALLY",
		SubmissionID: t.ResponseID,
		Payload:      t.Data,
	}
}

// --- Implementation 2: Internal Frontend Payload ---

type InternalPayload struct {
	RecordID string
	ProcType string
	CPFCNPJ  string
	Contact  map[string]any
}

func (i InternalPayload) Normalize() StandardEvent {
	return StandardEvent{
		EventType:    "FORM_RESPONSE",
		FormID:       "FRONTEND_VISA",
		SubmissionID: i.RecordID,
		Payload: map[string]any{
			"proc_type": i.ProcType,
			"cpf_cnpj":  i.CPFCNPJ,
			"contato":   i.Contact,
		},
	}
}
