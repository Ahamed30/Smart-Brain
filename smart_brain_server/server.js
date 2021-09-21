const express = require("express");
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex')({
	  client: 'pg',
	  connection: {
	    host : '127.0.0.1',
	    user : 'postgres',
	    password : 'root',
	    database : 'smartbrain'
     }
});

const app = express();

app.use(bodyParser.json());
app.use(cors())

const database = {
	users:[
	   {
	   	id : '30',
	   	name : 'Steph',
	   	email : 'curry@gmail.com',
	   	password : 'chef',
	   	entries : 0,
	   	joined : new Date()
	   },
	   {
	   	id : '11',
	   	name : 'Klay',
	   	email : 'thompson@gmail.com',
	   	password : 'splashBro',
	   	entries : 0,
	   	joined : new Date()
	   }
	]
}
app.get('/', (req, res) => {
	res.send(database.users);
})
app.post('/signin', (req, res) =>{
	knex.select('email', 'hash').from('login')
		.where('email', '=', req.body.email)
		.then(data => {
			const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
			if(isValid){
				return knex.select('*').from('users')
					.where('email', '=', req.body.email)
					.then(user => {
						res.json(user[0])
					})
					.catch(err => res.status(400).json('unable to signIn'))
			}else{
				 res.status(400).json('wrong credentials')
			}
		})
		.catch(err => res.status(400).json('wrong credentials'))
})
app.post('/register', (req, res) => { 
	const { email, name, password } = req.body;
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


