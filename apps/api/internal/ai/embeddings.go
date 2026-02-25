package ai

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"math"
	"net/http"
	"os"
)

type EmbeddingResponse struct {
	Embeddings [][]float64 `json:"embeddings"`
}

func GetEmbedding(ctx context.Context, text string) ([]float64, error) {
	reqBody := map[string]interface{}{
		"inputs": text,
	}

	body, _ := json.Marshal(reqBody)

	req, err := http.NewRequestWithContext(ctx, "POST",
		"https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2",
		bytes.NewBuffer(body),
	)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+os.Getenv("HUGGINGFACE_API_KEY"))

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("huggingface error %d: %s", resp.StatusCode, string(respBody))
	}

	// HuggingFace returns [][]float64 for feature-extraction
	var embeddings [][]float64
	if err := json.Unmarshal(respBody, &embeddings); err != nil {
		return nil, fmt.Errorf("failed to parse embedding: %w", err)
	}

	if len(embeddings) == 0 {
		return nil, fmt.Errorf("empty embedding response")
	}

	return embeddings[0], nil
}

// CosineSimilarity hitung similarity antara dua vector
func CosineSimilarity(a, b []float64) float64 {
	if len(a) != len(b) {
		return 0
	}

	var dot, normA, normB float64
	for i := range a {
		dot += a[i] * b[i]
		normA += a[i] * a[i]
		normB += b[i] * b[i]
	}

	if normA == 0 || normB == 0 {
		return 0
	}

	return dot / (math.Sqrt(normA) * math.Sqrt(normB))
}
