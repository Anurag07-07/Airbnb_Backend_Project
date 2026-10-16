package main

import (
	"AuthInGo/app"
	config "AuthInGo/config/env"
)
func main(){
	config.Load()
	cfg := app.NewConfig()  //Set the Server Config
	app := app.NewApplication(cfg)
	app.Run()
}