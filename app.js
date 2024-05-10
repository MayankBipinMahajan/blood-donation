const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = 9000;

mongoose.connect('mongodb://localhost:27017/BloodDonation', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String
});

const User = mongoose.model('User', userSchema);

const donorSchema = new mongoose.Schema({
    name: String,
    bloodGroup: String,
    contactNumber: String,
    email: String
});

const Donor = mongoose.model('Donor', donorSchema);

const messageSchema = new mongoose.Schema({
    name: String,
    mobileNo: String,
    email: String,
    message: String
});

const Message = mongoose.model('Message', messageSchema);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// User routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

app.get('/signup', (req, res) => {
    res.sendFile(__dirname + '/public/signup.html');
}); 
// Serve index1.html
app.get('/index1', (req, res) => {
    res.sendFile(__dirname + '/public/index1.html');
});

app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    const newUser = new User({ username, email, password });
    await newUser.save();
    res.redirect('/login');
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) {
        return res.status(401).send('Invalid email or password');
    }
    res.redirect('/index1');
});


// Blood donation routes
app.get('/blood', (req, res) => {
    res.sendFile(__dirname + '/public/blood.html');
});

app.post('/donate', (req, res) => {
    const newDonor = new Donor({
        name: req.body.name,
        bloodGroup: req.body.bloodGroup,
        contactNumber: req.body.contactNumber,
        email: req.body.email
    });

    newDonor.save()
        .then(() => res.redirect('/index1.html'))
        .catch(err => res.status(400).send('Unable to save to database'));
});

// Quick Message route
app.get('/quickmessage', (req, res) => {
    res.sendFile(__dirname + '/public/quickmessage.html');
});

app.post('/quickmessage', async (req, res) => {
    const { name, mobileNo, email, message } = req.body;

    // Create a new model instance with the form data
    const newMessage = new Message({
        name: name,
        mobileNo: mobileNo,
        email: email,
        message: message
    });

    try {
        // Save the new message to the database
        await newMessage.save();
        res.send('Message sent successfully');
    } catch (err) {
        res.status(500).send('Unable to save message');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
