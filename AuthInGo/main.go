package main

import (
	"AuthInGo/app"
)
func main(){
	cfg := app.NewConfig()  //Set the Server Config
	app := app.NewApplication(cfg)
	app.Run()
}