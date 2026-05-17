package handler

import (
	"net/http"
	"os"
	"strconv"

	"github.com/gin-gonic/gin"
	dokkee "github.com/keeq0/dokkee/backend"
)

func setAuthCookie(c *gin.Context, token string) {
	secure, _ := strconv.ParseBool(os.Getenv("COOKIE_SECURE"))
	domain := os.Getenv("COOKIE_DOMAIN") // empty = host-only
	maxAge := 12 * 60 * 60               // 12 hours, matches tokenTTL
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(cookieName, token, maxAge, "/", domain, secure, true)
}

func clearAuthCookie(c *gin.Context) {
	secure, _ := strconv.ParseBool(os.Getenv("COOKIE_SECURE"))
	domain := os.Getenv("COOKIE_DOMAIN")
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(cookieName, "", -1, "/", domain, secure, true)
}

func (h *Handler) signUp(c *gin.Context) {
	var input dokkee.User

	if err := c.BindJSON(&input); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	id, err := h.services.CreateUser(input)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	token, err := h.services.GenerateToken(input.Username, input.Password)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	user, err := h.services.GetUserByID(id)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	setAuthCookie(c, token)
	c.JSON(http.StatusOK, gin.H{"user": struct {
		ID         int     `json:"id"`
		Username   string  `json:"username"`
		FirstName  string  `json:"first_name"`
		LastName   string  `json:"last_name"`
		MiddleName string  `json:"middle_name,omitempty"`
		Email      string  `json:"email"`
		Phone      string  `json:"phone"`
		Balance    float64 `json:"balance"`
		Role       string  `json:"role,omitempty"`
	}{
		ID:         user.Id,
		Username:   user.Username,
		FirstName:  user.FirstName,
		LastName:   user.LastName,
		MiddleName: user.MiddleName,
		Email:      user.Email,
		Phone:      user.Phone,
		Balance:    user.Balance,
		Role:       user.Role,
	}})
}

type signInInput struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func (h *Handler) signIn(c *gin.Context) {
	var input signInInput

	if err := c.BindJSON(&input); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	token, err := h.services.GenerateToken(input.Username, input.Password)
	if err != nil {
		newErrorResponse(c, http.StatusUnauthorized, err.Error())
		return
	}

	setAuthCookie(c, token)
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

func (h *Handler) me(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		newErrorResponse(c, http.StatusUnauthorized, "user not in context")
		return
	}

	user, err := h.services.GetUserByID(userID)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{"user": struct {
		ID         int     `json:"id"`
		Username   string  `json:"username"`
		FirstName  string  `json:"first_name"`
		LastName   string  `json:"last_name"`
		MiddleName string  `json:"middle_name,omitempty"`
		Email      string  `json:"email"`
		Phone      string  `json:"phone"`
		Balance    float64 `json:"balance"`
		Role       string  `json:"role,omitempty"`
	}{
		ID:         user.Id,
		Username:   user.Username,
		FirstName:  user.FirstName,
		LastName:   user.LastName,
		MiddleName: user.MiddleName,
		Email:      user.Email,
		Phone:      user.Phone,
		Balance:    user.Balance,
		Role:       user.Role,
	}})
}

func (h *Handler) logout(c *gin.Context) {
	clearAuthCookie(c)
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
