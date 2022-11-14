const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const passport = require('passport')

//Model
const User = require('../models/User')

//Login page
router.get('/login', (req, res) => {
    res.render('login')
})

//Register page
router.get('/register', (req, res) => {
    res.render('register')
})

//Register handle
router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body
    let errors = []

    //Check required fields
    if(!name || !email || !password || !password2) {
        errors.push({message: 'All fields are required'})
    }

    //Check passwords
    if(password !== password2) {
        errors.push({ message: 'Passwords do not match'})
    }

    //Check pass length
    if(password.length < 6) {
        errors.push({ message: 'Password should be at least 6 characters'})
    }

    if(errors.length > 0) {
        console.log(errors);
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        })
    } else {
        //Validation pass
        User.findOne({email: email})
            .then(user => {
                if(user){
                    errors.push({message: 'Email already registered'})
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2
                    });
                } else {
                    const newUser = new User({
                        name,
                        email,
                        password
                    })
                    bcrypt.genSalt(10, (err, salt) => 
                        bcrypt.hash(newUser.password, salt, (err,hash) => {
                            if(err) throw err
                            //set password to hash
                            newUser.password = hash;
                            // save user
                            newUser.save()
                                .then(user => {
                                    req.flash('success_msg', 'You are now registered')
                                    res.redirect('/users/login')
                                })
                                .catch(err => console.log(err))

                    }))

                }
            })
    }

})

// Login handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next)
})

// Logout handle
router.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err) }
        req.flash('success_msg', 'You are logout')
        res.redirect('/users/login')
    })    
})

module.exports = router;