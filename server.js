const express = require ('express')
const app = express()
const port = process.env.PORT || 3030

app.set('view engine','ejs')
app.use(express.static('public/views'))

app.listen(port)