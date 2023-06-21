import express, { Express } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import carBrandRoute from './routes/carBrands'
import categorieRoute from './routes/categories'
import productBrandRoute from './routes/productBrands'
import productRoute from './routes/products'
import providerRoute from './routes/providers'
import connectDb from './database/config'

dotenv.config()
void connectDb()

const app: Express = express()

// Middlewares
app.use(express.json()) // transforma la req.body a un json
app.use(cors())
app.use(express.urlencoded({ extended: true }))
// app.use(express.static(__dirname + '/public'))

const PATH = '/api/'
app.use(`${PATH}car-brands`, carBrandRoute)
app.use(`${PATH}categories`, categorieRoute)
app.use(`${PATH}product-brands`, productBrandRoute)
app.use(`${PATH}product`, productRoute)
app.use(`${PATH}providers`, providerRoute)

const PORT = process.env.PORT ?? 8080
const server = app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running on port ${PORT}`)
})
server.on('error', error => console.log('Server error', error))
