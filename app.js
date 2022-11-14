const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose')
require('dotenv').config()
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')

const app = express()

// Passport config
require('./config/passport')(passport)




//Connect DB
try {
    mongoose.connect(process.env.MONGO_URI)
    console.log('Database connected');

} catch (error) {
    console.log(error)
}

//EJS
app.use(expressLayouts)
app.set('view engine', 'ejs')

//BodyParser
app.use(express.urlencoded({extended: false}))

// Express session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))

app.use(passport.initialize());
app.use(passport.session());

app.use(flash())

// Global vars
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error = req.flash('error')
    next()
})


//Routes
app.use('/', require('./routes/index'))
app.use('/users', require('./routes/users'))

const  PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on port ${PORT}`))
