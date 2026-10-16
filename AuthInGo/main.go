package main

import (
	"AuthInGo/app"
)
func main(){
	cfg := app.NewConfig(":8080")  //Set the Server Config
	app := app.NewApplication(cfg)
	app.Run()
}