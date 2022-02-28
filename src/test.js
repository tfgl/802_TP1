import axios from 'axios'

const options = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
}

const body = {
   src: {lat: 9,  long: 48},
   dst: {lat: 10, long: 48}
}

axios.post('http://127.0.0.1:3000/rest/tempsDeParcours', {
  src: {lat: 9,  long: 48},
  dst: {lat: 10, long: 48}
}).then(res => {
  console.log(res)
})
