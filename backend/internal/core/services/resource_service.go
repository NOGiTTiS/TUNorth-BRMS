package services

import (
	"errors"
	"tunorth-brms-backend/internal/core/domain"
	"tunorth-brms-backend/internal/core/ports"
)

type resourceService struct {
	repo ports.ResourceRepository
}

func NewResourceService(repo ports.ResourceRepository) ports.ResourceService {
	return &resourceService{repo: repo}
}

func (s *resourceService) CreateResource(resource *domain.Resource) error {
	if resource.ResourceName == "" {
		return errors.New("resource name is required")
	}
	return s.repo.Create(resource)
}

func (s *resourceService) GetAllResources() ([]domain.Resource, error) {
	return s.repo.GetAll()
}

func (s *resourceService) GetResourceByID(id uint) (*domain.Resource, error) {
	return s.repo.GetByID(id)
}

func (s *resourceService) UpdateResource(id uint, input *domain.Resource) error {
	existing, err := s.repo.GetByID(id)
	if err != nil {
		return err
	}
	// Update fields
	existing.ResourceName = input.ResourceName
	existing.Type = input.Type
	
	return s.repo.Update(existing)
}

func (s *resourceService) DeleteResource(id uint) error {
	return s.repo.Delete(id)
}