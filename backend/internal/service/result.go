package service

import (
	dokkee "github.com/keeq0/dokkee/backend"
	"github.com/keeq0/dokkee/backend/internal/repository"
)

type ResultService struct {
	repo repository.Result
}

func NewResultService(repo repository.Result) *ResultService {
	return &ResultService{repo: repo}
}

func (s *ResultService) GetByDocumentID(docID int) (dokkee.AnalysisResult, error) {
	return s.repo.GetByDocumentID(docID)
}
