package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
  "github.com/gorilla/mux"
)

type Res = http.ResponseWriter
type Req = *http.Request
type Test struct {
  Test string `json:"Test"`
}

func logHandler( handler func(w Res, r Req), msg string) func ( w Res, r Req ) {
  return func ( w Res, r Req ) {
    fmt.Println(msg)
    var body = r.URL.Query()

    fmt.Println( body.Get("test") )
    handler(w, r)
  }
}

func baseTest() Test{
  return Test {Test: "hi"}
}

func homePage(w Res, r Req) {
  fmt.Fprintf(w, "Hi");
  var t = baseTest();
  json.NewEncoder(w).Encode(t)
}

func handleRequests() {
  PORT, ok := os.LookupEnv("PORT")
  if( !ok ) { PORT = "3000" }
  fmt.Println("Server listening on port "+PORT)
  myRouter := mux.NewRouter().StrictSlash(true)

  myRouter.HandleFunc("/", logHandler(homePage, "homePage"))
  log.Fatal(http.ListenAndServe(":"+PORT, myRouter))
}

func main() {
  handleRequests()
}
