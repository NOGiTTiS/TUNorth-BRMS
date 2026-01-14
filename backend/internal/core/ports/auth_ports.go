package ports

import "tunorth-brms-backend/internal/core/domain"

type UserRepository interface {
	Create(user *domain.User) error
	GetByUsername(username string) (*domain.User, error)
	GetByID(id uint) (*domain.User, error)
}

type AuthService interface {
	Register(user *domain.User) error
	Login(username, password string) (string, error) // Return JWT Token
}