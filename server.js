var express = require('express');
var app = express();

var mongojs = require('mongojs');
var db = mongojs('photobud', ['user']);

var bodyParser = require('body-parser');
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

// SELECT DATA WITH CONDITION
app.post('/select', function (req, res) {

	var data = req.body;

	if (req.body.collection == undefined) {

		res.json("Please define collection name.");

	} else {

		if (req.body.condition == undefined) {
			var collection = db.collection(req.body.collection);
			collection.find(function (err, data) {
				console.log('select success');
				res.json(data);
			});
		} else {
			var collection = db.collection(req.body.collection);

			// CREATE _ID OBJECT
			if (req.body.condition["_id"] !== undefined) {
				var id = new mongojs.ObjectID(req.body.condition["_id"]);
				req.body.condition["_id"] = id;
			}

			if (req.body.fields == undefined) {
				collection.find(req.body.condition, function (err, data) {
					console.log('select success');
					res.json(data);
				});
			} else {
				collection.find(req.body.condition, req.body.fields, function (err, data) {
					console.log('select success');
					res.json(data);
				});
			}
		}
	}
});


// SELECT DATA WITH CONDITION
app.post('/select-sort', function (req, res) {

	var data = req.body;
	console.log(req.body);
	
	if (req.body.collection == undefined) {

		res.json("Please define collection name.");

	} else {

		if (req.body.condition == undefined) {
			var collection = db.collection(req.body.collection);
			collection.find().sort(req.body.sort, function (err, data) {
				console.log('select sort success');
				res.json(data);
			});
		} else {
			var collection = db.collection(req.body.collection);

			// CREATE _ID OBJECT
			if (req.body.condition["_id"] !== undefined) {
				var id = new mongojs.ObjectID(req.body.condition["_id"]);
				req.body.condition["_id"] = id;
			}

			if (req.body.fields == undefined) {
				collection.find(req.body.condition).sort(req.body.sort, function (err, data) {
					console.log('select sort success');
					res.json(data);
				});
			} else {
				collection.find(req.body.condition, req.body.fields).sort(req.body.sort, function (err, data) {
					console.log('select sort success');
					res.json(data);
				});
			}
		}
	}
});

// INSERT DATA
app.post('/insert', function (req, res) {
	
	var data = req.body;
	
	if (req.body.collection == undefined) {
		
		res.json("Please define collection name.");

	} else {
		var collection = db.collection(req.body.collection);

		if (req.body.collection == 'user') {
			delete data.collection;
			
			//INSERT DOCUMENT IN USER COLLECTION
			collection.insert(data, function (err, result) {

				console.log('Data inserted in user collection. User Id : ' + result._id);
				var response = {
					"user_id" : result._id
				}

				var newdata = {
					"user_id" : result._id
				}

				//INSERT DOCUMENT IN HOST COLLECTION
				collection = db.collection('host');
				collection.insert(newdata, function (err, host_result) {
					console.log('Data inserted in host collection. Host Id : ' + host_result._id);
					response.host_id = host_result._id;

					//INSERT DOCUMENT IN PHOTOGRAPHER COLLECTION
					collection = db.collection('photographer');
					collection.insert(newdata, function (err, photographer_result) {
						console.log('Data inserted in photographer collection. Photographer Id : ' + photographer_result._id);
						response.photographer_id = photographer_result._id;
						res.json(response);
					});
				});
			});
		} else {
			delete data.collection;
			// INSERT DOCUMENT IN ANY COLLECTION 
			collection.insert(data, function (err, result) {
				res.json(req.body);
			});
		}
	}
});

// UPDATE SPECIFIC DATA OF DOCUMENT
app.post('/update', function (req, res) {

	if (req.body.collection == undefined) {
		
		res.json("Please define collection name.");

	} else {
		var collection = db.collection(req.body.collection);

		// CREATE _ID OBJECT
		if (req.body.condition["_id"] !== undefined) {
			var id = new mongojs.ObjectID(req.body.condition["_id"]);
			req.body.condition["_id"] = id;
		}

		// UPDATE SPECIFIC FIELD IN DOCUMENT IN ANY COLLECTION
		collection.update(req.body.condition,{$set:req.body.set}, function (err, result) {
			console.log('update success');
			res.json(result);
		});
	}
});

// UPDATE FULL DOCUMENT
app.post('/save', function (req, res) {
	
	if (req.body.collection == undefined) {
		
		res.json("Please define collection name.");

	} else {
		var collection = db.collection(req.body.collection);

		// CREATE _ID OBJECT
		if (req.body.condition["_id"] !== undefined) {
			var id = new mongojs.ObjectID(req.body.condition["_id"]);
			req.body.condition["_id"] = id;
		}

		// UPDATE FULL DOCUMENT IN ANY COLLECTION 
		collection.save(req.body.condition, req.body.data, function (err, result) {
			console.log('save success');
			res.json(result);
		});
	}
});

// DELETE DATA
app.post('/delete', function (req, res) {
	
	if (req.body.collection == undefined) {
		
		res.json("Please define collection name.");

	} else {
		var collection = db.collection(req.body.collection);

		// CREATE _ID OBJECT
		if (req.body.condition["_id"] !== undefined) {
			var id = new mongojs.ObjectID(req.body.condition["_id"]);
			req.body.condition["_id"] = id;
		}

		// DELETE DOCUMENT IN ANY COLLECTION 
		collection.remove(req.body.condition, function (err, result) {
			console.log('delete success');
			res.json(result);
		});
	}
});


// FILE UPLOADING
var fs = require('fs');
var multiparty = require('multiparty');

app.post('/image',  function (req, res) {

	var form = new multiparty.Form();

	form.on('error', function(err) {
		console.log('Error parsing form: ' + err.stack);
		res.json('Error in file uploading');
	});

	form.on('file', function(name, file) {
		fs.readFile(file.path, function (err, data) {

			var imageName = file.originalFilename;
			var newPath = __dirname + "/uploads/" + imageName;

			fs.writeFile(newPath, data, function (err) {
				console.log('File uploaded');
			});
		});
	});

	form.on('close', function() {
		res.json('File uploaded');
	});

	form.parse(req);
});

app.once('error', function(err) {
	if (err.code === 'EADDRINUSE') {
		app.close();
	}
});

app.listen(2195);

console.log('connected');