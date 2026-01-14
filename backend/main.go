package main

import (
	"log"
	"os"
	"tunorth-brms-backend/internal/adapters/handlers/http"
	"tunorth-brms-backend/internal/adapters/storage"
	"tunorth-brms-backend/internal/core/services"

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

	// 4. Setup Fiber App
	app := fiber.New()

	// Middleware: Logger (ดู log การยิง api) & CORS (ให้ frontend เรียกได้)
	app.Use(logger.New())
	app.Use(cors.New())

	// 5. Routes Definition
	api := app.Group("/api") // จัดกลุ่ม path ขึ้นต้นด้วย /api

	// Room Routes
	rooms := api.Group("/rooms")
	rooms.Post("/", roomHandler.CreateRoom)       // สร้างห้อง
	rooms.Get("/", roomHandler.GetAllRooms)       // ดูห้องทั้งหมด
	rooms.Get("/:id", roomHandler.GetRoom)        // ดูห้องรายตัว
	rooms.Put("/:id", roomHandler.UpdateRoom)     // แก้ไขห้อง
	rooms.Delete("/:id", roomHandler.DeleteRoom)  // ลบห้อง

	// Booking Routes (เพิ่มส่วนนี้)
    bookings := api.Group("/bookings")
    bookings.Get("/", bookingHandler.GetBookings) // รองรับ ?start=...&end=...
    bookings.Post("/", bookingHandler.CreateBooking)
	
	// Auth Routes (เพิ่มใหม่)
    api.Post("/register", authHandler.Register)
    api.Post("/login", authHandler.Login)

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