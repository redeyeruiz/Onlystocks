const express = require ('express')
const app = express()
const port = process.env.PORT || 3030
var path = require('path')

app.set('view engine','ejs')
app.use(express.static('views'))
app.use(express.static(path.join(__dirname, 'public')));
app.listen(port)