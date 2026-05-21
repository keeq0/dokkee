package dokkee

type User struct {
	Id         int     `json:"id" db:"id"`
	Username   string  `json:"username" db:"username" binding:"required"`
	Password   string  `json:"password" db:"password"`
	FirstName  string  `json:"first_name" db:"first_name" binding:"required"`
	LastName   string  `json:"last_name" db:"last_name" binding:"required"`
	MiddleName string  `json:"middle_name" db:"middle_name"`
	Email      string  `json:"email" db:"email" binding:"required"`
	Phone      *string `json:"phone" db:"phone"`
	Balance    float64 `json:"balance" db:"balance"`
	Role       string  `json:"role" db:"role"`
}

type UpdateProfileInput struct {
	FirstName  *string `json:"first_name"`
	LastName   *string `json:"last_name"`
	MiddleName *string `json:"middle_name"`
	Phone      *string `json:"phone"`
}
