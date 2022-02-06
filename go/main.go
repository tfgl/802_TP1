package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
)

type Res = http.ResponseWriter
type Req = *http.Request

type Bornes struct {
  records []struct {
    fields struct{
      name float32 `json:"n_station"`
      lat  float32 `json:"ylatitude"`
      long string  `json:"xlongitude"`
      acces_recharge string `json:"acces_recharge"`
    } `json:"fields"`
  } `json:"records"`
}

func logHandler( handler func(w Res, r Req), msg string) func ( w Res, r Req ) {
  return func ( w Res, r Req ) {
    fmt.Println(msg)
    var body = r.URL.Query()

    fmt.Println( body.Get("test") )
    handler(w, r)
  }
}

func homePage(w Res, r Req) {
  fmt.Fprintf(w, "Hi");
}

func temps_de_parcour(w Res, r Req) {
  //body := r.URL.Query()
  //tempsRecharge := body.Get("recharge")
  //dst := body.Get("dst")
  //autonomie := body.Get("autonomie")
}

func addField(url, field string, value string) string {
  return fmt.Sprintf("%s&%s=%s", url, field, value)
}

func bornes(w Res, r Req) {
  body := r.URL.Query()
  lat  := body.Get("lat")
  long := body.Get("long")
  dst  := 5000
  //url := "https://opendata.reseaux-energies.fr/api/records/1.0/search/?dataset=bornes-irve&q=&sort=n_amenageur&facet=region&geofilter.distance=" + lat +"%2C"+long+"%2C"+dst
  // ?dataset=bornes-irve&q=&sort=n_amenageur&facet=region&geofilter.distance=

  const baseUrl = "https://opendata.reseaux-energies.fr/api/records/1.0/search/?"
  distance := lat +"%2C"+ long +"%2C"+ fmt.Sprintf("%d", dst)
  url := addField( addField( addField( addField(baseUrl, "dataset", "bornes-irve"), "sort", "n_amenageur"), "facet", "region"), "geofilter.distance", distance)
  fmt.Println(url)

  resp, err := http.Get("https://opendata.reseaux-energies.fr/api/records/1.0/search/?dataset=bornes-irve&q=&sort=n_amenageur&facet=region&geofilter.distance=45.57%2C5.9%2C5000")
  if err != nil { log.Fatal(err) }

  var bornes Bornes

  resbody, err := ioutil.ReadAll(resp.Body)
  if( err != nil ) {
    log.Fatal(err)
  }
  resp.Body.Close()

  if err := json.Unmarshal(resbody, &bornes); err != nil {
    log.Fatal(err)
  }

  fmt.Printf("%s\n", resbody)
  fmt.Println(bornes)

  for _, borne := range bornes.records {
    fmt.Println(borne.fields.name)
  }
}

func handleRequests() {
  PORT, ok := os.LookupEnv("PORT")
  if( !ok ) { PORT = "3000" }
  fmt.Println("Server listening on port "+PORT)
  myRouter := mux.NewRouter().StrictSlash(true)

  myRouter.HandleFunc("/", logHandler(homePage, "homePage"))
  myRouter.HandleFunc("/temps_de_parcour", logHandler(temps_de_parcour, "temps_de_parcour"))
  myRouter.HandleFunc("/bornes", logHandler(bornes, "bornes"))

  log.Fatal(http.ListenAndServe(":"+PORT, myRouter))
}

func main() {
  handleRequests()
}
