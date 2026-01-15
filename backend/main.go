package main

import (
	"log"
	"os"
	"tunorth-brms-backend/internal/adapters/handlers/http"
	"tunorth-brms-backend/internal/adapters/storage"
	"tunorth-brms-backend/internal/core/domain"
	"tunorth-brms-backend/internal/core/services"

	jwtware "github.com/gofiber/contrib/jwt"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"
)

func main() {
	// 1. Setup Config
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found")
	}

	// 2. Setup Database Connection
	database := storage.NewDatabase(
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)

	// 3. Dependency Injection (ต่อท่อส่งข้อมูล)
	// DB -> Repository -> Service -> Handler
	roomRepo := storage.NewRoomRepository(database.DB)
	roomService := services.NewRoomService(roomRepo)
	roomHandler := http.NewRoomHandler(roomService)

	// --- Bookings (เพิ่มส่วนนี้) ---
	bookingRepo := storage.NewBookingRepository(database.DB)
	bookingService := services.NewBookingService(bookingRepo)
	bookingHandler := http.NewBookingHandler(bookingService)

	// Auth (เพิ่มใหม่)
	userRepo := storage.NewUserRepository(database.DB)
	authService := services.NewAuthService(userRepo)
	authHandler := http.NewAuthHandler(authService)

	// User Management
    userService := services.NewUserService(userRepo)
    userHandler := http.NewUserHandler(userService)

	// Resource
	resRepo := storage.NewResourceRepository(database.DB)
    resService := services.NewResourceService(resRepo)
    resHandler := http.NewResourceHandler(resService)

	// Settings (Admin)
	settingRepo := storage.NewSettingRepository(database.DB)
	settingService := services.NewSettingService(settingRepo)
	settingHandler := http.NewSettingHandler(settingService)

	// Auto-Migrate & Initialize Defaults
	database.DB.AutoMigrate(&domain.Setting{})
	settingService.InitializeDefaults()

	// 4. Setup Fiber App
	app := fiber.New(fiber.Config{
		// เพิ่มขีดจำกัดขนาดไฟล์เป็น 20 MB (หรือตามต้องการ)
		BodyLimit: 20 * 1024 * 1024,
	})

	// Middleware: Logger (ดู log การยิง api) & CORS (ให้ frontend เรียกได้)
	app.Use(logger.New())
	app.Use(cors.New())

	// เปิดให้เข้าถึงไฟล์ในโฟลเดอร์ uploads ผ่าน URL /uploads
	app.Static("/uploads", "./uploads")

	// 5. Routes Definition
	api := app.Group("/api") // จัดกลุ่ม path ขึ้นต้นด้วย /api

	// Public Settings (ไม่ต้อง Login ก็ได้ จะได้โหลด Logo ได้)
	api.Get("/settings/public", settingHandler.GetPublicSettings)

	// Room Routes
	rooms := api.Group("/rooms")
	rooms.Post("/", roomHandler.CreateRoom)      // สร้างห้อง
	rooms.Get("/", roomHandler.GetAllRooms)      // ดูห้องทั้งหมด
	rooms.Get("/:id", roomHandler.GetRoom)       // ดูห้องรายตัว
	rooms.Put("/:id", roomHandler.UpdateRoom)    // แก้ไขห้อง
	rooms.Delete("/:id", roomHandler.DeleteRoom) // ลบห้อง

	// Booking Routes 
	bookings := api.Group("/bookings")
	bookings.Get("/", bookingHandler.GetBookings) // รองรับ ?start=...&end=...
	bookings.Post("/", bookingHandler.CreateBooking)
	bookings.Patch("/:id/status", bookingHandler.UpdateStatus)
	bookings.Put("/:id", bookingHandler.UpdateBooking)
	bookings.Delete("/:id", bookingHandler.DeleteBooking)

	// Auth Routes 
	api.Post("/register", authHandler.Register)
	api.Post("/login", authHandler.Login)

	// Middleware JWT
	// ใช้ contrib/jwt เพื่อรองรับ golang-jwt/jwt/v5
	jwtMiddleware := jwtware.New(jwtware.Config{
		SigningKey: jwtware.SigningKey{Key: []byte(os.Getenv("JWT_SECRET"))},
	})
	
	// Protected Routes
	api.Get("/me", jwtMiddleware, authHandler.GetMe)
	api.Put("/me", jwtMiddleware, authHandler.UpdateMe)
	
	// Settings Protected
	api.Get("/settings", jwtMiddleware, settingHandler.GetAllSettings)
	api.Put("/settings", jwtMiddleware, settingHandler.UpdateSettings)
	api.Post("/settings/upload", jwtMiddleware, settingHandler.UploadImage)

	// Example: Apply to other routes if needed
	// bookings.Use(jwtMiddleware)

	// User Routes
    users := api.Group("/users")
    users.Get("/", userHandler.GetAllUsers)
    users.Put("/:id", userHandler.UpdateUser)
    users.Delete("/:id", userHandler.DeleteUser)
	users.Post("/import", userHandler.ImportUsers)

	// Resource Routes
    resources := api.Group("/resources")
    resources.Get("/", resHandler.GetAllResources)
    resources.Post("/", resHandler.CreateResource)
    resources.Put("/:id", resHandler.UpdateResource)
    resources.Delete("/:id", resHandler.DeleteResource)

	// Test Route
	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("TUNorth-BRMS API is Running!")
	})

	// 6. Start Server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Fatal(app.Listen(":" + port))
}
