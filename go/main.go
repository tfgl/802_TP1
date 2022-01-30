package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

type Res = http.ResponseWriter
type Req = *http.Request
type Test struct {Test string `json:"Test"`}

func logHandler( handler func(w Res, r Req), msg string) func ( w Res, r Req ) {
  return func ( w Res, r Req ) {
    fmt.Println(msg)
    handler(w, r)
  }
}

func baseTest() Test{
  return Test {Test: "hi"}
}

func homePage(w Res, r Req) {
  fmt.Fprintf(w, "Hi");
  var t = baseTest();
  t.Test = "hello"
  json.NewEncoder(w).Encode(t)
}

func handleRequests() {
  http.HandleFunc("/", logHandler(homePage, "homePage"))
  log.Fatal(http.ListenAndServe(":3000", nil))
}

func main() {
  handleRequests()
}
