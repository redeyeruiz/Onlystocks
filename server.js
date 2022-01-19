if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
  
const express = require ('express')
const app = express()
const port = process.env.PORT || 3030
const path = require('path')
const mysql = require('mysql');
const util = require('util')
const bcrypt = require('bcrypt')
const SQL = require('sql-template-strings')
const passport = require('passport')
const flash = require('express-flash')
var session = require('cookie-session');

const initializePassport = require('./passport-config')
initializePassport(
    passport,
      async email => {
        const query= (SQL
            `SELECT * FROM users WHERE email = ${email} `
        )
        // console.log ( await getRecordsLogin(query))
        console.log( await getRecordsLogin(query))
        return(  getRecordsLogin(query) )
    },
    id => {
        const query= (SQL
            `SELECT * FROM users WHERE id = ${id} `
        )
        return(  getRecordsLogin(query) )
    }
)



const conn=mysql.createConnection({host:"lpmails.mysql.database.azure.com",
user:"LonelyAdmin", 
password:"OnlyFans785", 
database:"Onlyinvestments", 
port:3306, 
ssl:true
});

conn.query = util.promisify(conn.query).bind(conn);


app.set('view engine','ejs')
app.use(express.urlencoded({ extended: false}))
app.use(flash())
app.use(session({
    secret:  'secret',
    resave: false,
    saveUninitialized: false
}))
// app.use(session({ secret: 'secret' }));
app.use(passport.initialize())
// app.use(passport.session())
conn.connect(function(err){
    if (err) {
        console.log("error connecting: " + err.stack);
        return;
    }
    console.log("connected as... " + conn.threadId);
});

async function getRecords  (query){
    try{
        const result = await conn.query(query).catch(err => { throw err });
        return result
    } catch (err){
        console.log('error')
        return(null)
    }
    
    
}

async function getRecordsLogin  (query){
    try{
        const result = await conn.query(query).catch(err => { throw err });
        return result[0]
    } catch (err){
        console.log('error')
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

// async function insertR(sql) {
//     try{
  
//         conn.query(sql, async (err, res) => {
//             if (err) {
//                 throw new Error('My custom Error');

//             }
            
//         });

//     } catch(err){
//         console.log(err);
//     }

// }

// (async function insertR (sql) {
//     conn.query(sql)
// })().catch(console.error);


// var name = "drothaniel"
// var query = (SQL
//             `INSERT INTO test (name) 
//             VALUES (${name})`)
// insertRecords(query)            
// insertRecords("INSERT INTO test (name) VALUES ('daniel') ")
// getRecords("SELECT * FROM test", function  (res){
//     console.log(res)

//   });


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
app.get('/carrito', checkAuthenticated, (req, res) =>{
    res.render('page-shop-cart.ejs')
})

app.get('/orden-tienda', checkAuthenticated, (req, res) =>{
    res.render('page-shop-order.ejs')
})

app.get('/tienda', checkAuthenticated, (req, res) =>{
    res.render('page-shop.ejs')
})

app.get('/tienda-articulo', checkAuthenticated, (req, res) =>{
    res.render('page-shop-single.ejs')
})

app.get('/terminos', checkAuthenticated, (req, res) =>{
    res.render('page-terms.ejs')
})


app.get('/elementos-ui', checkAuthenticated, (req, res) =>{
    res.render('page-ui-elements.ejs')
})







// LOGIN AND REGISTER

app.get('/', checkAuthenticated, (req, res) =>{
    res.render('index.ejs', { name : req.user.name})
})

app.get('/login', checkNotAuthenticated, (req, res) =>{
    res.render('page-login.ejs')
})

app.get('/register', (req, res) =>{
    res.render('page-register.ejs')
})



app.post('/login' , checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
}))

app.post('/register' , async (req, res) => {
    
    // try {
    //     const hashedPassword =  await bcrypt.hash(req.body.password, 10)
    //     const name = req.body.name
    //     const mail = req.body.email
        
    //     const sqlInsert = (SQL
    //                         `INSERT INTO USERS (name, mail, password)
    //                         VALUES (${name}, ${mail}, ${hashedPassword})`
    //     )

    //     // insertRecords(sqlInsert)

       
    //     conn.query(sqlInsert, function  (err, result) {
    //         if (err){
    //             callback(err)
                
    //         }       
    //     });
    //     res.redirect('/login')
        
    // } catch  {
    //     console.log('error in registering user')
    //     res.redirect('/register')
        
    // }
    const hashedPassword =  await bcrypt.hash(req.body.password, 10)
    const name = req.body.name
    const email = req.body.email
    var creador = req.body.creador
    console.log(creador)
    if (creador == undefined)  creador = 0
    console.log(creador)
    
    const sqlInsert = (SQL
                        `INSERT INTO USERS (name, email, password, creador)
                        VALUES (${name}, ${email}, ${hashedPassword}, ${creador})`
    )
        
    // INSERTING AND LOGING ERROR OR RESULT
    // try {
    //     const result = await conn.query(sqlInsert).catch(err => { throw err });  
    //     res.redirect('/login')
    // } catch ( err ) {
    //     console.log(err)
    //     if(err.errno == 1062){
    //         console.log("duplicate entry")
    //     }
    //     res.redirect('/register')  
    // } 

    const errCode = await insertRecords(sqlInsert)
    if(errCode == "ER_DUP_ENTRY") console.log('duplicate entry on email')
    if (errCode =="ER_BAD_NULL_ERROR") console.log('duplicate entry on email')

    if(errCode == "ER_DUP_ENTRY" || errCode =="ER_BAD_NULL_ERROR" ){
        console.log(errCode)
        res.redirect('/register')
    }else{
        console.log(errCode)
        res.redirect('/login')
    }
    

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