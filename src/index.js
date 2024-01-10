const express = require("express")
const path = require("path")
const app = express()
const hbs = require("hbs")
const LogInCollection = require("./mongo")
const port = process.env.PORT || 3000
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
const templatePath = path.join(__dirname, '../tempelates')
const publicPath = path.join(__dirname, '../public')

console.log(publicPath);

app.set('view engine', 'hbs')
app.set('views', templatePath)
app.use(express.static(publicPath))

app.get('/signup', (req, res) => {
    res.render('signup')
})

app.get('/', (req, res) => {
    res.render('login')
})

app.post('/signup', async (req, res) => {
    try {
        const data = {
            name: req.body.name,
            password: req.body.password
        }

        const existingUser = await LogInCollection.findOne({ name: req.body.name })

        if (existingUser) {
            res.status(409).send("User details already exist")
        } else {
            await LogInCollection.create(data)
            res.status(201).render("home", { naming: req.body.name })
        }
    } catch (error) {
        res.status(500).send("An error occurred while processing the request")
        console.error(error)
    }
})

app.post('/login', async (req, res) => {
    try {
        const user = await LogInCollection.findOne({ name: req.body.name })

        if (!user) {
            res.status(404).send("User not found")
        } else if (user.password !== req.body.password) {
            res.status(401).send("Incorrect password")
        } else {
            res.status(200).render("home", { naming: req.body.name })
        }
    } catch (error) {
        res.status(500).send("An error occurred while processing the request")
        console.error(error)
    }
})

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
      if (err) {
        console.error('Error occurred while logging out', err);
        res.status(500).send('An error occurred while logging out');
      } else {
        res.redirect('/login'); // Redirect to the login page after logout
      }
    });
  });
  

app.listen(port, () => {
    console.log('Port connected');
})
