import exp from 'express'
import router from './routes'
import 'dotenv/config'

const port = process.env.PORT || 3000
const app = exp()

const log = fn => async(req, res) => {
  console.table( (await fn(req, res)).flat() )
}

app.use('/station', log(router.station))

app.listen(port, () => {
  console.log(`server running on port ${port}`)
})
