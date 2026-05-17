package handler

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/keeq0/dokkee/backend/internal/service"
)

const (
	userCtx     = "user_id"
	userRoleCtx = "user_role"
	cookieName  = "dokkee_token"
)

func (h *Handler) jwtMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := extractToken(c)
		if token == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "no auth token"})
			return
		}

		userID, role, err := h.services.Authorization.ParseToken(token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		c.Set(userCtx, userID)
		c.Set(userRoleCtx, role)
		c.Next()
	}
}

func extractToken(c *gin.Context) string {
	if cookie, err := c.Cookie(cookieName); err == nil && cookie != "" {
		return cookie
	}

	header := c.GetHeader("Authorization")
	if header == "" {
		return ""
	}

	parts := strings.SplitN(header, " ", 2)
	if len(parts) != 2 || parts[0] != "Bearer" {
		return ""
	}
	return parts[1]
}

func (h *Handler) requireRole(allowed ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		role, ok := getUserRole(c)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "user role not in context"})
			return
		}

		for _, a := range allowed {
			if role == a {
				c.Next()
				return
			}
		}

		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "forbidden: role not allowed"})
	}
}

func (h *Handler) auditMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		userID, exists := c.Get(userCtx)
		if !exists {
			return
		}

		status := c.Writer.Status()
		success := status >= 200 && status < 400

		h.services.Audit.Log(service.AuditEvent{
			Type:    auditEventByPath(c.FullPath(), c.Request.Method),
			UserID:  userID.(int),
			IP:      c.ClientIP(),
			Success: success,
		})
	}
}

func auditEventByPath(path, method string) string {
	switch {
	case strings.Contains(path, "/documents") && method == "POST":
		return "DOCUMENT_UPLOADED"
	case strings.Contains(path, "/result"):
		return "RESULT_ACCESSED"
	case strings.Contains(path, "/profile") && method == "GET":
		return "PROFILE_ACCESSED"
	case strings.Contains(path, "/profile") && method == "PATCH":
		return "PROFILE_UPDATED"
	default:
		return "API_REQUEST"
	}
}

func getUserID(c *gin.Context) (int, bool) {
	id, exists := c.Get(userCtx)
	if !exists {
		return 0, false
	}
	userID, ok := id.(int)
	return userID, ok
}

func getUserRole(c *gin.Context) (string, bool) {
	r, exists := c.Get(userRoleCtx)
	if !exists {
		return "", false
	}
	role, ok := r.(string)
	return role, ok
}
