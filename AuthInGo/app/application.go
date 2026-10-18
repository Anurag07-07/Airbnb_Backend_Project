package app

import (
	config "AuthInGo/config/env"
	"fmt"
	"net/http"
	"time"
)

type Config struct {
	Addr string //PORT
}

type Application struct {
	Config Config
}

//Constructor for Config
func NewConfig() Config {

	port := config.GetString("PORT",":8080")
	return Config{
		Addr:port,
	}
}
//Constructor for Application
func NewApplication(cfg Config) *Application {
	return &Application{
		Config: cfg,
	}
}

// Member Function of Application Struct
func (app *Application) Run() error {
	server := &http.Server{
		Addr: app.Config.Addr,
		Handler: router.SetupRouter(), //Setup a Chi Router
		ReadTimeout:10 * time.Second, // Set read timeout to 10 sec
		WriteTimeout:10 * time.Second, // Set write timeout to 10 sec
	}

	fmt.Println("Starting server on",app.Config.Addr);

	return server.ListenAndServe()
}