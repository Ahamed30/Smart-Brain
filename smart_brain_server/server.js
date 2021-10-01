const express = require("express");
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const Clarifai = require('clarifai');
const knex = require('knex')({
	  client: 'pg',
	  connection: {
	    host : '127.0.0.1',
	    user : 'postgres',
	    password : 'root',
	    database : 'smartbrain'
     }
});

const api_app = new Clarifai.App({
  apiKey: 'YOUR_API_KEY'
});

const handleApiCall = (req, res) => {
	api_app.models
      .predict(Clarifai.FACE_DETECT_MODEL, req.body.input)
      .then(data => {
      	res.json(data);
      })
      .catch(err => res.status(400).json("Unable to connect"))
}

const app = express();

app.use(bodyParser.json());
app.use(cors())

app.post('/imageurl', (req, res) => { 
	handleApiCall(req, res);
})

app.get('/', (req, res) => {
	res.send(database.users);
})
app.post('/signin', (req, res) =>{
	const {email, password } = req.body;
	if(!email || !password){
		res.status(400).json("Incorrect form submission");
	}else{
		knex.select('email', 'hash').from('login')
		.where('email', '=', email)
		.then(data => {
			const isValid = bcrypt.compareSync(password, data[0].hash);
			if(isValid){
				return knex.select('*').from('users')
					.where('email', '=', email)
					.then(user => {
						res.json(user[0])
					})
					.catch(err => res.status(400).json('unable to signIn'))
			}else{
				 res.status(400).json('wrong credentials')
			}
		})
		.catch(err => res.status(400).json('wrong credentials'))
	}
})
app.post('/register', (req, res) => { 
	const { email, name, password } = req.body;
	if(!email || !password || !name){
		res.status(400).json("Incorrect form submission");
	}else{
		const hash = bcrypt.hashSync(password);
		knex.transaction(trx => {
			trx.insert({
				hash: hash,
				email: email
			})
			.into('login')
			.returning('email')
			.then(loginEmail => {
				return trx('users')
					.returning('*')
					.insert({
					email: loginEmail[0],
					name: name,
					joined: new Date()
				})
				.then(user => {
					res.json(user[0]);
				})
			})
			.then(trx.commit)
			.catch(trx.rollback)
		})
		.catch(err => res.status(400).json("unable to register"));
	}
})
app.get('/profile/:id', (req, res) =>{
	const { id } = req.params;
	let found = false;
	knex.select('*').from('users').where({
		id:id
	}).then(user => {
		if(user.length){
			res.json(user[0])
		}else{
			res.status(400).json("user not found")
		}
	})
})
app.put('/image', (req, res) => {
	const { id } = req.body;
	knex('users')
		.where('id', '=', id)
		.increment('entries', 1)
		.returning('entries')
		.then(user => {
			res.json(user[0])
		})
		.catch(err => res.status(400).json("unable to get entries"))
})
// bcrypt.hash("bacon", null, null, function(err, hash) {
//     // Store hash in your password DB.
// });

// // Load hash from your password DB.

app.listen(3000, () => {
	console.log('Test');
})


