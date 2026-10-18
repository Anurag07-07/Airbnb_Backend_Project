package router

import (
	"github.com/go-chi/chi/v5"
	"AuthInGo/controllers"
)
func SetupRouter() *chi.Mux {
	router := chi.NewRouter()

	//Define the routes
	router.Get("/ping",controllers.PingHandler)

	return router
}