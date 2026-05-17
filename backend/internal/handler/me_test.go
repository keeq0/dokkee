package handler

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	dokkee "github.com/keeq0/dokkee/backend"
	"github.com/keeq0/dokkee/backend/internal/service"
)

func TestMe_OK(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockAuth := new(MockAuthorizationService)
	h := &Handler{services: &service.Service{Authorization: mockAuth}}

	mockAuth.On("GetUserByID", 42).Return(dokkee.User{Id: 42, Username: "alice", Role: "user"}, nil)

	r := gin.New()
	r.Use(func(c *gin.Context) {
		c.Set(userCtx, 42)
		c.Next()
	})
	r.GET("/api/me", h.me)

	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/api/me", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), `"username":"alice"`)
	assert.Contains(t, w.Body.String(), `"role":"user"`)
	assert.NotContains(t, w.Body.String(), `"password"`)
	mockAuth.AssertExpectations(t)
}

func TestMe_NoUserContext(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockAuth := new(MockAuthorizationService)
	h := &Handler{services: &service.Service{Authorization: mockAuth}}

	r := gin.New()
	r.GET("/api/me", h.me)

	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/api/me", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}
