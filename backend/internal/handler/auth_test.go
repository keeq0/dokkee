package handler

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	dokkee "github.com/keeq0/dokkee/backend"
	"github.com/keeq0/dokkee/backend/internal/service"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

type MockAuthorizationService struct {
	mock.Mock
}

func (m *MockAuthorizationService) CreateUser(user dokkee.User) (int, error) {
	args := m.Called(user)
	return args.Int(0), args.Error(1)
}

func (m *MockAuthorizationService) GenerateToken(username, password string) (string, error) {
	args := m.Called(username, password)
	return args.String(0), args.Error(1)
}

func (m *MockAuthorizationService) ParseToken(token string) (int, string, error) {
	args := m.Called(token)
	return args.Int(0), args.String(1), args.Error(2)
}

func (m *MockAuthorizationService) GetUserByID(userID int) (dokkee.User, error) {
	args := m.Called(userID)
	return args.Get(0).(dokkee.User), args.Error(1)
}

func (m *MockAuthorizationService) GetProfile(userID int) (dokkee.User, error) {
	args := m.Called(userID)
	return args.Get(0).(dokkee.User), args.Error(1)
}

func (m *MockAuthorizationService) UpdateProfile(userID int, input dokkee.UpdateProfileInput) error {
	args := m.Called(userID, input)
	return args.Error(0)
}

func (m *MockAuthorizationService) UpsertSuperAdmin(username, password string) error {
	args := m.Called(username, password)
	return args.Error(0)
}

// ========== СУЩЕСТВУЮЩИЕ ТЕСТЫ ==========

func TestHandler_signUp(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := new(MockAuthorizationService)
	handler := &Handler{
		services: &service.Service{
			Authorization: mockService,
		},
	}

	user := dokkee.User{
		Username:  "alice",
		Password:  "password",
		FirstName: "Alice",
		LastName:  "Smith",
		Email:     "alice@example.com",
		Phone:     "+1234567890",
	}

	returnedUser := dokkee.User{
		Id:        1,
		Username:  "alice",
		FirstName: "Alice",
		LastName:  "Smith",
		Email:     "alice@example.com",
		Phone:     "+1234567890",
	}

	mockService.On("CreateUser", mock.AnythingOfType("dokkee.User")).Return(1, nil)
	mockService.On("GenerateToken", user.Username, user.Password).Return("tok123", nil)
	mockService.On("GetUserByID", 1).Return(returnedUser, nil)

	body, _ := json.Marshal(user)
	req, _ := http.NewRequest(http.MethodPost, "/auth/sign-up", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router := gin.New()
	router.POST("/auth/sign-up", handler.signUp)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), `"user":`)
	assert.Contains(t, w.Body.String(), `"username":"alice"`)
	assert.NotContains(t, w.Body.String(), `"password"`)

	cookies := w.Result().Cookies()
	require.Len(t, cookies, 1)
	assert.Equal(t, cookieName, cookies[0].Name)
	assert.True(t, cookies[0].HttpOnly)
	assert.Equal(t, http.SameSiteLaxMode, cookies[0].SameSite)
	assert.NotEmpty(t, cookies[0].Value)

	mockService.AssertExpectations(t)
}

func TestHandler_signIn(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := new(MockAuthorizationService)
	handler := &Handler{
		services: &service.Service{
			Authorization: mockService,
		},
	}

	input := signInInput{
		Username: "testuser",
		Password: "password",
	}

	mockService.On("GenerateToken", input.Username, input.Password).Return("token123", nil)

	body, _ := json.Marshal(input)
	req, _ := http.NewRequest(http.MethodPost, "/auth/sign-in", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router := gin.New()
	router.POST("/auth/sign-in", handler.signIn)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), `"ok":true`)

	cookies := w.Result().Cookies()
	require.Len(t, cookies, 1)
	assert.Equal(t, cookieName, cookies[0].Name)
	assert.True(t, cookies[0].HttpOnly)
	assert.Equal(t, http.SameSiteLaxMode, cookies[0].SameSite)
	assert.NotEmpty(t, cookies[0].Value)

	mockService.AssertExpectations(t)
}

// ========== НОВЫЕ ТЕСТЫ ==========

func TestHandler_signUp_InvalidJSON(t *testing.T) {
	gin.SetMode(gin.TestMode)

	handler := &Handler{services: &service.Service{}}

	req, _ := http.NewRequest(http.MethodPost, "/auth/sign-up", bytes.NewBufferString("invalid"))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router := gin.New()
	router.POST("/auth/sign-up", handler.signUp)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestHandler_signUp_ServiceError(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := new(MockAuthorizationService)
	handler := &Handler{
		services: &service.Service{
			Authorization: mockService,
		},
	}

	user := dokkee.User{
		Username:  "testuser",
		Password:  "password",
		FirstName: "Test",
		LastName:  "User",
		Email:     "test@example.com",
		Phone:     "+1234567890",
	}
	mockService.On("CreateUser", mock.Anything).Return(0, errors.New("duplicate username"))

	body, _ := json.Marshal(user)
	req, _ := http.NewRequest(http.MethodPost, "/auth/sign-up", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router := gin.New()
	router.POST("/auth/sign-up", handler.signUp)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)
	mockService.AssertExpectations(t)
}

func TestHandler_signIn_InvalidJSON(t *testing.T) {
	gin.SetMode(gin.TestMode)

	handler := &Handler{services: &service.Service{}}

	req, _ := http.NewRequest(http.MethodPost, "/auth/sign-in", bytes.NewBufferString("invalid"))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router := gin.New()
	router.POST("/auth/sign-in", handler.signIn)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestHandler_signUp_EmptyBody(t *testing.T) {
	gin.SetMode(gin.TestMode)

	handler := &Handler{services: &service.Service{}}

	req, _ := http.NewRequest(http.MethodPost, "/auth/sign-up", bytes.NewBufferString(""))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router := gin.New()
	router.POST("/auth/sign-up", handler.signUp)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestHandler_signIn_EmptyBody(t *testing.T) {
	gin.SetMode(gin.TestMode)

	handler := &Handler{services: &service.Service{}}

	req, _ := http.NewRequest(http.MethodPost, "/auth/sign-in", bytes.NewBufferString(""))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router := gin.New()
	router.POST("/auth/sign-in", handler.signIn)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestHandler_signIn_MissingUsername(t *testing.T) {
	gin.SetMode(gin.TestMode)

	handler := &Handler{services: &service.Service{}}

	input := map[string]string{"password": "pass123"}
	body, _ := json.Marshal(input)
	req, _ := http.NewRequest(http.MethodPost, "/auth/sign-in", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router := gin.New()
	router.POST("/auth/sign-in", handler.signIn)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestHandler_signUp_EmptyUsername(t *testing.T) {
	gin.SetMode(gin.TestMode)

	handler := &Handler{services: &service.Service{}}

	user := map[string]string{"username": "", "password": "pass"}
	body, _ := json.Marshal(user)
	req, _ := http.NewRequest(http.MethodPost, "/auth/sign-up", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router := gin.New()
	router.POST("/auth/sign-up", handler.signUp)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}
