package repository

import (
	"fmt"
	"strings"

	"github.com/jmoiron/sqlx"
	dokkee "github.com/keeq0/dokkee/backend"
)

type AuthPostgres struct {
	db *sqlx.DB
}

func NewAuthPostgres(db *sqlx.DB) *AuthPostgres {
	return &AuthPostgres{db: db}
}

func (r *AuthPostgres) CreateUser(user dokkee.User) (int, error) {
	tx, err := r.db.Begin()
	if err != nil {
		return 0, err
	}
	defer tx.Rollback()

	var userID int
	err = tx.QueryRow(
		fmt.Sprintf(`INSERT INTO %s (username, password_hash) VALUES ($1, $2) RETURNING id`, authCredentialsTable),
		user.Username, user.Password,
	).Scan(&userID)
	if err != nil {
		return 0, fmt.Errorf("failed to create auth: %w", err)
	}

	_, err = tx.Exec(
		fmt.Sprintf(`INSERT INTO %s (user_id, first_name, last_name, middle_name, email, phone) VALUES ($1, $2, $3, $4, $5, $6)`, userProfilesTable),
		userID, user.FirstName, user.LastName, user.MiddleName, user.Email, user.Phone,
	)
	if err != nil {
		return 0, fmt.Errorf("failed to create profile: %w", err)
	}

	// Устанавливаем баланс: 500 для тестовых пользователей, иначе 0
	balance := 0.00
	if strings.HasPrefix(user.Username, "loadtest_") {
		balance = 500.00
	}

	_, err = tx.Exec(
		fmt.Sprintf(`INSERT INTO %s (user_id, balance) VALUES ($1, $2)`, userBalancesTable),
		userID, balance,
	)
	if err != nil {
		return 0, fmt.Errorf("failed to create balance: %w", err)
	}

	return userID, tx.Commit()
}

func (r *AuthPostgres) GetUser(username string) (dokkee.User, error) {
	var user dokkee.User
	query := fmt.Sprintf(`SELECT id, username, password_hash AS password, role FROM %s WHERE username = $1`, authCredentialsTable)
	err := r.db.Get(&user, query, username)
	return user, err
}

func (r *AuthPostgres) GetProfile(userID int) (dokkee.User, error) {
	var user dokkee.User
	query := fmt.Sprintf(`
        SELECT ac.id, ac.username,
               up.first_name, up.last_name, up.middle_name, up.email, up.phone,
               ub.balance
        FROM %s ac
        JOIN %s up ON up.user_id = ac.id
        JOIN %s ub ON ub.user_id = ac.id
        WHERE ac.id = $1`,
		authCredentialsTable, userProfilesTable, userBalancesTable,
	)
	err := r.db.Get(&user, query, userID)
	return user, err
}

func (r *AuthPostgres) UpdateProfile(userID int, input dokkee.UpdateProfileInput) error {
	setClause := ""
	args := []interface{}{}
	argIdx := 1

	if input.FirstName != nil {
		setClause += fmt.Sprintf("first_name = $%d, ", argIdx)
		args = append(args, *input.FirstName)
		argIdx++
	}
	if input.LastName != nil {
		setClause += fmt.Sprintf("last_name = $%d, ", argIdx)
		args = append(args, *input.LastName)
		argIdx++
	}
	if input.MiddleName != nil {
		setClause += fmt.Sprintf("middle_name = $%d, ", argIdx)
		args = append(args, *input.MiddleName)
		argIdx++
	}
	if input.Phone != nil {
		setClause += fmt.Sprintf("phone = $%d, ", argIdx)
		args = append(args, *input.Phone)
		argIdx++
	}

	if setClause == "" {
		return nil
	}

	setClause += fmt.Sprintf("updated_at = NOW()")
	args = append(args, userID)

	query := fmt.Sprintf(`UPDATE %s SET %s WHERE user_id = $%d`, userProfilesTable, setClause, argIdx)
	_, err := r.db.Exec(query, args...)
	return err
}

func (r *AuthPostgres) GetUserByID(userID int) (dokkee.User, error) {
	var user dokkee.User
	query := fmt.Sprintf(`SELECT id, username, role FROM %s WHERE id = $1`, authCredentialsTable)
	err := r.db.Get(&user, query, userID)
	return user, err
}

func (r *AuthPostgres) UpdateRole(userID int, role string) error {
	query := fmt.Sprintf(`UPDATE %s SET role = $1, updated_at = NOW() WHERE id = $2`, authCredentialsTable)
	_, err := r.db.Exec(query, role, userID)
	if err != nil {
		return fmt.Errorf("failed to update role: %w", err)
	}
	return nil
}
