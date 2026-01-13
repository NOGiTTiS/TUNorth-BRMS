package domain

// Setting เก็บค่าตั้งค่าต่างๆ
type Setting struct {
	SettingName  string `gorm:"primaryKey" json:"setting_name"`
	SettingValue string `json:"setting_value"`
}