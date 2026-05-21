package handler

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/keeq0/dokkee/backend/internal/service"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

type MockAuditService struct {
	mock.Mock
}

func (m *MockAuditService) Log(event service.AuditEvent) error {
	args := m.Called(event)
	return args.Error(0)
}

func TestJwtMiddleware_ValidToken(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockAuth := new(MockAuthorizationService)
	handler := &Handler{
		services: &service.Service{
			Authorization: mockAuth,
		},
	}

	token := "valid.token"
	mockAuth.On("ParseToken", token).Return(1, "user", nil)

	req, _ := http.NewRequest(http.MethodGet, "/", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req

	handler.jwtMiddleware()(c)

	assert.Equal(t, http.StatusOK, w.Code)
	userID, exists := c.Get("user_id")
	assert.True(t, exists)
	assert.Equal(t, 1, userID)
	role, roleExists := c.Get("user_role")
	assert.True(t, roleExists)
	assert.Equal(t, "user", role)
	mockAuth.AssertExpectations(t)
}

func TestJwtMiddleware_MissingHeader(t *testing.T) {
	gin.SetMode(gin.TestMode)

	handler := &Handler{services: &service.Service{}}

	req, _ := http.NewRequest(http.MethodGet, "/", nil)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req

	handler.jwtMiddleware()(c)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
	assert.Contains(t, w.Body.String(), "no auth token")
}

func TestJwtMiddleware_WrongFormat(t *testing.T) {
	gin.SetMode(gin.TestMode)

	handler := &Handler{services: &service.Service{}}

	req, _ := http.NewRequest(http.MethodGet, "/", nil)
	req.Header.Set("Authorization", "InvalidScheme token")
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req

	handler.jwtMiddleware()(c)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
	assert.Contains(t, w.Body.String(), "no auth token")
}

func TestJwtMiddleware_InvalidToken(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockAuth := new(MockAuthorizationService)
	handler := &Handler{
		services: &service.Service{
			Authorization: mockAuth,
		},
	}

	token := "invalid.token"
	mockAuth.On("ParseToken", token).Return(0, "", assert.AnError)

	req, _ := http.NewRequest(http.MethodGet, "/", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req

	handler.jwtMiddleware()(c)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
	mockAuth.AssertExpectations(t)
}

func TestGetUserID_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Set("user_id", 42)

	userID, ok := getUserID(c)
	assert.True(t, ok)
	assert.Equal(t, 42, userID)
}

func TestGetUserID_NotFound(t *testing.T) {
	gin.SetMode(gin.TestMode)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	userID, ok := getUserID(c)
	assert.False(t, ok)
	assert.Equal(t, 0, userID)
}

func TestAuditMiddleware_CallsLog(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockAudit := new(MockAuditService)
	handler := &Handler{
		services: &service.Service{
			Audit: mockAudit,
		},
	}

	mockAudit.On("Log", mock.Anything).Return(nil)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request, _ = http.NewRequest(http.MethodGet, "/api/documents", nil)
	c.Set("user_id", 1)

	handler.auditMiddleware()(c)

	mockAudit.AssertExpectations(t)
}

func TestAuditEventByPath(t *testing.T) {
	tests := []struct {
		path   string
		method string
		want   string
	}{
		{"/api/documents", "POST", "DOCUMENT_UPLOADED"},
		{"/api/documents/1/result", "GET", "RESULT_ACCESSED"},
		{"/api/profile", "GET", "PROFILE_ACCESSED"},
		{"/api/profile", "PATCH", "PROFILE_UPDATED"},
		{"/api/unknown", "GET", "API_REQUEST"},
		{"/", "GET", "API_REQUEST"},
	}

	for _, tt := range tests {
		t.Run(tt.path+"_"+tt.method, func(t *testing.T) {
			got := auditEventByPath(tt.path, tt.method)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestJWTMiddleware_CookieAuth(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockAuth := new(MockAuthorizationService)
	h := &Handler{services: &service.Service{Authorization: mockAuth}}

	mockAuth.On("ParseToken", "valid-cookie-token").Return(42, "super_admin", nil)

	r := gin.New()
	r.Use(h.jwtMiddleware())
	r.GET("/test", func(c *gin.Context) {
		uid, _ := c.Get(userCtx)
		role, _ := c.Get(userRoleCtx)
		c.JSON(http.StatusOK, gin.H{"user_id": uid, "role": role})
	})

	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	req.AddCookie(&http.Cookie{Name: cookieName, Value: "valid-cookie-token"})
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), `"user_id":42`)
	assert.Contains(t, w.Body.String(), `"role":"super_admin"`)
	mockAuth.AssertExpectations(t)
}

func TestJWTMiddleware_NoToken(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockAuth := new(MockAuthorizationService)
	h := &Handler{services: &service.Service{Authorization: mockAuth}}

	r := gin.New()
	r.Use(h.jwtMiddleware())
	r.GET("/test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"ok": true})
	})

	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
	assert.Contains(t, w.Body.String(), "no auth token")
}

func TestJWTMiddleware_CookieOverridesBearer(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockAuth := new(MockAuthorizationService)
	h := &Handler{services: &service.Service{Authorization: mockAuth}}

	// Cookie wins -- ParseToken called with cookie value
	mockAuth.On("ParseToken", "cookie-tok").Return(1, "user", nil)

	r := gin.New()
	r.Use(h.jwtMiddleware())
	r.GET("/test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"ok": true})
	})

	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	req.AddCookie(&http.Cookie{Name: cookieName, Value: "cookie-tok"})
	req.Header.Set("Authorization", "Bearer header-tok")
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	mockAuth.AssertExpectations(t)
}
