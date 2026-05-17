package service

import (
	"testing"

	"github.com/keeq0/dokkee/backend/internal/repository"
	"github.com/stretchr/testify/assert"
)

func TestNewService(t *testing.T) {
	repos := &repository.Repository{}
	svc := NewService(repos)
	assert.NotNil(t, svc)
	assert.NotNil(t, svc.Authorization)
	assert.NotNil(t, svc.Document)
	assert.NotNil(t, svc.Result)
	assert.NotNil(t, svc.Audit)
}
