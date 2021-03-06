import cors from 'cors'

import users from '../routes/users'
import orders from '../routes/orders'
import logs from '../routes/logs'
import payments from '../routes/payments'

import express from 'express'
const app: express.Application = express()

app.use(cors())
app.use(express.json())

app.use('/users', users)
app.use('/orders', orders)
app.use('/logs', logs)
app.use('/payments', payments)

export default app;