package services

import (
	"errors"
	"tunorth-brms-backend/internal/core/domain"
	"tunorth-brms-backend/internal/core/ports"

	"golang.org/x/crypto/bcrypt"
)

type userService struct {
	repo ports.UserRepository
}

func NewUserService(repo ports.UserRepository) ports.UserService {
	return &userService{repo: repo}
}

// CreateUser: สร้างผู้ใช้ใหม่ (ใช้สำหรับ Import CSV หรือ Admin สร้างให้)
func (s *userService) CreateUser(user *domain.User) error {
	// 1. ตรวจสอบ Username ซ้ำ
	if _, err := s.repo.GetByUsername(user.Username); err == nil {
		// ถ้า err == nil แสดงว่าเจอ user เดิม (ซ้ำ)
		return errors.New("username " + user.Username + " already exists")
	}

	// 2. Hash Password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	user.Password = string(hashedPassword)

	// 3. บันทึก
	return s.repo.Create(user)
}

func (s *userService) GetAllUsers() ([]domain.User, error) {
	return s.repo.GetAll()
}

func (s *userService) UpdateUser(id uint, input *domain.User) error {
	existingUser, err := s.repo.GetByID(id)
	if err != nil {
		return errors.New("user not found")
	}

	// อัปเดตข้อมูล (ไม่รวม Username เพราะเป็น Unique key หลักที่มักไม่เปลี่ยนกัน)
	existingUser.FullName = input.FullName
	existingUser.Department = input.Department
	existingUser.Tel = input.Tel
	existingUser.Email = input.Email
	existingUser.Role = input.Role // ใช้สำหรับเลื่อนขั้นเป็น admin

	// ถ้ามีการส่ง Password มาใหม่ (ไม่ว่าง) ให้ Hash และเปลี่ยนใหม่
	// ถ้าส่งมาว่าง แปลว่าไม่ต้องการเปลี่ยนรหัส
	if input.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		existingUser.Password = string(hashedPassword)
	}

	return s.repo.Update(existingUser)
}

func (s *userService) DeleteUser(id uint) error {
	return s.repo.Delete(id)
}