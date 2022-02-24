if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
  
const express = require ('express')
const app = express()
const port = process.env.PORT || 3030
const stripeSecretKey= process.env.STRIPE_SECRET_KEY
const stripePublicKey= process.env.STRIPE_PUBLIC_KEY

const path = require('path')
const mysql = require('mysql');
const util = require('util')
const bcrypt = require('bcrypt')
const SQL = require('sql-template-strings')

const passport = require('passport')
const flash = require('express-flash')
var session = require('express-session');

var cookieParser = require('cookie-parser');



//AZURE STORAGE TABLE CONNECTION
var AzureTablesStoreFactory = require('connect-azuretables')(session);
var options = {table: 'users',
            sessionTimeOut: 720,
            storageAccount: 'landingpage00',
            accessKey: 'oB/YuySSk0AC4RpvNBzKPJg65cnlhfesRBQbVXR22dht6FMevPpwBnbSJqPDA4AtrmmH+p0nIWiq+AStYO22qg=='
}; 


const initializePassport = require('./passport-config')
const { restart } = require('nodemon')
initializePassport(
    passport,
      async email => {
        const query= (SQL
            `SELECT * FROM users WHERE email = ${email} `
        )

        // console.log ( await getRecordsLogin(query))
        //console.log( await getRecordsLogin(query))
        return(  getRecordsLogin(query) )
    },
    id => {
        const query= (SQL
            `SELECT * FROM users WHERE id = ${id} `
        )
        return(  getRecordsLogin(query) )
    }
)


// AZURE DB CONNECTION
const conn=mysql.createConnection({host:"onlyinvestments.mysql.database.azure.com",
user:"lonelyadmin", 
password:"Onlyfans!", 
database:"Onlyinvestments", 
port:3306, 
ssl:true
});

conn.query = util.promisify(conn.query).bind(conn);

app.use(cookieParser());

//STRIPE VARIABLES
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)

app.use(express.json())

app.set('view engine','ejs')
app.use(express.urlencoded({ extended: false}))
app.use(flash())
// app.use(session({
//     secret:  'secret',
//     resave: false,
//     saveUninitialized: false
// }))

app.use(session({ store: AzureTablesStoreFactory.create(options),
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false}));

app.use(passport.initialize())
app.use(passport.session())
conn.connect(function(err){
    if (err) {
        console.log("error connecting: " + err.stack);
        return;
    }
    console.log("connected as... " + conn.threadId);
});

async function getRecords  (query){
    try{
        return await conn.query(query).catch(err => { throw err });
        
    } catch (err){
        console.log('error in getRecords')
        return(null)
    }
    
    
}

async function getRecordsQe(query,data){
    try{
        return await conn.query(query,data).catch(err => { throw err });
        
    } catch (err){
        console.log('error in getRecordsQe')
        return(null)
    }
}

 

async function getRecordsLogin  (query){
    try{
        const result = await conn.query(query).catch(err => { throw err });
        return result[0]
    } catch (err){
        console.log('error in RecordsLogin')
        return(null)
    }
    
    
}
// const email = 'w@w'
// const query= (SQL
//     `SELECT * FROM users WHERE mail = ${email} `
// )
// console.log( getRecordsLogin(query))
async function insertRecords  (insertQuery){

    try {
        const result = await conn.query(insertQuery).catch(err => { throw err });    
        return("SUCCESS")
    } catch (err) {
        return(err.code)
    } 

}
//STRIPE


//PAGES
app.get('/about', checkAuthenticated, (req, res) =>{
    res.render('page-about.ejs')
})

app.get('/conviertete-instructor', checkAuthenticated, (req, res) =>{
    res.render('page-become-instructor.ejs')
})

app.get('/blog', checkAuthenticated, (req, res) =>{
    res.render('page-blog.ejs')
})

app.get('/contactanos', checkAuthenticated, (req, res) =>{
    res.render('page-contact.ejs')
})

app.get('/cursos', checkAuthenticated, (req, res) =>{
    res.render('page-course-v2.ejs')
})

app.get('/dashboard', checkAuthenticated, (req, res) =>{
    res.render('page-dashboard.ejs')
})

app.get('/error', checkAuthenticated, (req, res) =>{
    res.render('page-error.ejs')
})

app.get('/eventos', checkAuthenticated, (req, res) =>{
    res.render('page-event.ejs')
})

app.get('/galleria', checkAuthenticated, (req, res) =>{
    res.render('page-gallery.ejs')
})

app.get('/instructor', checkAuthenticated, (req, res) =>{
    res.render('page-instructors-single.ejs')
})

app.get('/instructores', checkAuthenticated, (req, res) =>{
    res.render('page-instructors.ejs')
})

app.get('/mis-courses', checkAuthenticated, (req, res) =>{
    res.render('page-my-courses.ejs')
})

app.get('/mi-grupo', checkAuthenticated, (req, res) =>{
    res.render('page-my-group.ejs')
})

app.get('/mi-listado', checkAuthenticated, (req, res) =>{
    res.render('page-my-listing.ejs')
})

app.get('/mi-orden', checkAuthenticated, (req, res) =>{
    res.render('page-my-order.ejs')
})

app.get('/ms-review', checkAuthenticated, (req, res) =>{
    res.render('page-my-review.ejs')
})
app.get('/ms-configruación', checkAuthenticated, (req, res) =>{
    res.render('page-setting.ejs')
})

app.get('/precios', checkAuthenticated, (req, res) =>{
    res.render('page-pricing.ejs')
})
app.get('/carrito', checkAuthenticated, async (req, res) =>{
    try{
        var items = req.cookies['cart'].split('_')
        if (items[0] == '') items.shift()
        var myQuery = 'SELECT * FROM grupo where id_grupo IN (?)';
        var queryData = items
        items = await getRecordsQe(myQuery,[queryData])

        if( items != null && items.length > 0){
        
            items = JSON.stringify(items)
            items = JSON.parse(items)
            //console.log(items[0])
            res.render('page-shop-cart.ejs', {
                items: items,
                stripePublicKey: stripePublicKey
            })
        }else if(items.length == 0){
            console.log("no se encontro nada")
        }else{
            console.log("error con la tienda intentalo mas tarde")
        }
    }catch{
        console.log("error en carrito")
        res.render('page-shop-cart.ejs', {
            // items: {},
            stripePublicKey: stripePublicKey
        })
    }
    

    
    //res.render('page-shop-cart.ejs')
})

app.get('/orden-tienda', checkAuthenticated, (req, res) =>{
    res.render('page-shop-order.ejs')
})

app.get('/tienda', checkAuthenticated, async (req, res) =>{
    const query= (SQL
        `SELECT * FROM grupo LIMIT 3`)
    var items = await getRecords(query)
    
    if( items != null && items.length > 0){
        
        items = JSON.stringify(items)
        items = JSON.parse(items)
        console.log(items[0])
        res.render('page-shop.ejs', {
            items: items,
            stripePublicKey: stripePublicKey
        })
    }else if(items.length == 0){
        console.log("no se encontro nada")
    }else{
        console.log("error con la busqueda intentalo mas tarde")
    }
    // res.render('page-shop.ejs')
})

app.get('/tienda-articulo', checkAuthenticated, async (req, res) =>{
    
    res.render('page-shop-single.ejs')
})

app.get('/terminos', checkAuthenticated, (req, res) =>{
    res.render('page-terms.ejs')
})


app.get('/elementos-ui', checkAuthenticated, (req, res) =>{
    res.render('page-ui-elements.ejs')
})







// LOGIN AND REGISTER

app.get('/', checkAuthenticated, async (req, res) =>{
    const Object =JSON.stringify( await req.user)
    const objectJsn = JSON.parse(Object);
    console.log('login name: ' + objectJsn.name)
    res.render('index.ejs', { name : objectJsn.name})
})

app.get('/login', checkNotAuthenticated, (req, res) =>{
    res.render('page-login.ejs')
})

app.get('/register', (req, res) =>{
    res.render('page-register.ejs', { mssg : req.query.valid})
})



app.post('/login' ,  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.post('/register' ,checkNotAuthenticated, async (req, res) => {
    
    
    // }
    const hashedPassword =  await bcrypt.hash(req.body.password, 10)
    const name = req.body.name
    const email = req.body.email
    var creador = req.body.creador
    // console.log(creador)
    if (creador == undefined)  creador = 0
    // console.log(creador)
    
    //MIN  && MAX LENGTH
    // var nameString = String(name)
    // var passwordString = String(req.body.password)
    if(name.length > 23) {
        console.log("nombre demasiado largo")
        res.redirect('/register?valid='+ "nombre demasiado largo" )
    }else if(req.body.password.length < 6) {
        console.log("contraseña demasiado corta")
        res.redirect('/register?valid='+ "contraseña demasiado corta")
    }else if(req.body.password !=req.body.password2 ){
        res.redirect('/register?valid='+ "Las contraseñas deben coincidir")
    }else  {

        const sqlInsert = (SQL
            `INSERT INTO USERS (name, email, password, creador)
            VALUES (${name}, ${email}, ${hashedPassword}, ${creador})`
            )



        const errCode = await insertRecords(sqlInsert)
        if(errCode == "ER_DUP_ENTRY"){
            res.redirect('/register?valid='+ "ese correo ya esta asociado con alguna cuenta")
        } else if (errCode =="ER_BAD_NULL_ERROR") res.redirect('/register?valid='+ "campo vacio o con valores incorrecto")
       



        if(errCode == "SUCCESS") {
            res.redirect('/login')
        }
    }

    

})

//STRIPE CHECKOUT SESSION

app.post('/create-checkout-session',  async (req,res) =>{
    // res.json({url:"hi"})


    var cartItems = req.cookies['cart'].split('_')
    if (cartItems[0] == '') cartItems.shift()
    var myQuery = 'SELECT * FROM grupo where id_grupo IN (?)';
    var queryData = cartItems
    cartItems = await getRecordsQe(myQuery,[queryData])
    
    if( cartItems != null && cartItems.length > 0){
        
        cartItems = JSON.stringify(cartItems)
        cartItems = JSON.parse(cartItems)
        //console.log(cartItems[0])
        // res.render('page-shop-cart.ejs', {
        //     items: items,
        //     stripePublicKey: stripePublicKey
        // })
    }else if(cartItems.length == 0){
        console.log("no se mando nada al checkout")
    }else{
        console.log("error con la tienda intentalo mas tarde")
    }

    var stripeItems = ''
    //var cartItems = JSON.stringify(cartItems)
    //var cartItems = JSON.parse(cartItems)
    // console.log(cartItems.length)
    for (var i = 0; i < cartItems.length; i++){
        // console.log("item_id")
        // console.log(cartItems[i].id_grupo)
        // stripeItems +=
        // `
        //     price_data : {
            
        //         currency : "mxn",
        //         "product_data": {

        //             "name":  "${cartItems[i].nom_grupo}"
        //         },
        //         "unit_amount": "${cartItems[i].precio * 100}"
        //     },
        //     "quantity": "1",
        // `
        stripeItems += 
        `
            "price_data": {
                "currency": 'mxn',
                "product_data": {
                    "name":  ${cartItems[i].nom_grupo}
                },
                "unit_amount": ${cartItems[i].precio * 100}
            },
            "quantity": '1',
        `

    }
    stripeItems = stripeItems.slice(0,-1)
    //stringed = JSON.stringify(stripeItems)
    //parsed = JSON.parse(stripeItems)
    console.log( typeof stripeItems)

    

    

    const storeItems = new Map([
        [0, { priceInCents: 10000, name: "Learn React Today" }],
        [2, { priceInCents: 20000, name: "Learn CSS Today" }],
      ])
    try{
        const stripeSession = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: stripeItems,
            success_url: `${process.env.SERVER_URL}/success.html`,
            cancel_url: `${process.env.SERVER_URL}/cancel.html`,
        })
        res.json({url:"hi"})
    } catch(e) {
        console.log(req.body.items)
        res.status(500).json({ error: e.message })
    }

    // try{
    //     const stripeSession = await stripe.checkout.sessions.create({
    //         payment_method_types: ['card'],
    //         mode: 'payment',
    //         line_items: req.body.items.map(item => {
    //             const storeItem = storeItems.get(item.id)
    //             return {
    //               price_data: {
    //                 currency: "usd",
    //                 product_data: {
    //                   name: storeItem.name,
    //                 },
    //                 unit_amount: storeItem.priceInCents,
    //               },
    //               quantity: item.quantity,
    //             }
    //         }),
    //         success_url: `${process.env.SERVER_URL}/success.html`,
    //         cancel_url: `${process.env.SERVER_URL}/cancel.html`,
    //     })
    //     res.json({url:"hi"})
    // } catch(e) {
    //     console.log(req.body.items)
    //     res.status(500).json({ error: e.message })
    // }
    
    

    // // {
    // //     price_data: {
    // //     currency: "usd",
    // //     product_data: {
    // //         name: storeItem.name,
    // //     },
    // //     unit_amount: storeItem.priceInCents,
    // //     },
    // //     quantity: item.quantity,
    // // }

    
    // try{
    //     const session = await stripe.checkout.session.create({
    //         payment_method_types: ['card'],
    //         mode: 'payment',
    //         line_items : {

    //         },
    //         succes_url: `${process.env.SEVER_URL}/success.html`,
    //         cancel_url: `${process.env.SEVER_URL}/cancel.html`
    //     })
    //     res.json({url: session.url})
    //     // res.json({url: 'session.url'})
    // }catch (e) {
    //     res.status(500).json({ error: e.message})
    // }

    // try {
    //     const stripeSession = await stripe.checkout.sessions.create({
    //       payment_method_types: ["card"],
    //       mode: "payment",
    //       line_items: req.body.items.map(item => {
    //         const storeItem = storeItems.get(item.id)
    //         return {
    //           price_data: {
    //             currency: "usd",
    //             product_data: {
    //               name: storeItem.name,
    //             },
    //             unit_amount: storeItem.priceInCents,
    //           },
    //           quantity: item.quantity,
    //         }
    //       }),
    //       success_url: `${process.env.CLIENT_URL}/success.html`,
    //       cancel_url: `${process.env.CLIENT_URL}/cancel.html`,
    //     })
    //     res.json({ url: stripeSession.url })
    //   } catch (e) {
    //     res.status(500).json({ error: e.message })
    //   }
    
})

// async function recordGetTest(){
//     const email = 'w@w'
//     const query= (SQL
    
//     `SELECT *FROM users `
//     )
//     const  res =  await getRecords(query)
//     console.log(res)
// }
// recordGetTest()


//AUTHENTICATION FUNCTIONS FOR PAGE REDIRECTION
function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }

    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect('/')
    }
    next()

}


// GENERAL FOLDER AND PORT SETUP
app.use(express.static('views'))
app.use(express.static(path.join(__dirname, 'public')));
app.listen(port)