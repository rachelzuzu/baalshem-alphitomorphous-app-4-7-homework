var express = require('express');
var bodyParser = require('body-parser');
var pg = require("pg");
var methodOverride=require("method-override");

var app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));


app.use(methodOverride('_method'));
// Refactor connection and query code

var db = require("./models");

// Fill in these article routes!


//add get to show all articles
app.get('/articles', function(req,res) {
	db.Article
		.findAll({ include: db.Author })
// render the article index template with articlesList
//containing articles
		.then(function(dbArticles) {
			res.render('articles/index', {articlesList:dbArticles});
		})
});

//add route to show form for creating a new user
app.get('/articles/new', function(req,res) {
	db.Author.all().then(function(dbAuthors) {
			res.render('articles/new', { ejsAuthors:dbAuthors });
	});
//asks what author it is first
});

//post route for creating new article
//create a new user (no id yet, submitting data of new user
app.post('/articles', function(req,res) {
  // console.log(req.body);
  var article=req.body.article;

  db.Article
  	.create(article)
  	.then(function(dbArticle) {
  		res.redirect('/articles');
  	})
 // res.send("Set up a response for this route!");
});

//Add Get route for a specific article with an id
app.get('/articles/:id', function(req, res) {
  	var articleId=req.params.id;
  	db.Article.find({ where: { id: req.params.id }, include: db.Author })
//get id and find the author in the Author db
  		.then(function(dbArticle) {
  			res.render('articles/article', {articleToDisplay:dbArticle});
  		});
});

//add option to edit
app.get('/articles/:id/edit', function(req,res) {
	var articleId=req.params.id;
	db.Article.find({ where: { id: req.params.id }, include: db.Author })
		.then(function(article) {
			res.render('articles/edit', {article:article});
		});
});

// Fill in these AUTHOR routes!

app.get('/authors', function(req, res) {
	db.Author.findAll() 
		.then(function(authors) {
			res.render('authors/index', {ejsAuthors:authors});
		});
	// console.log("GET /authors")
	// res.send("Set up a response for this route!");
});

//get route for new author form
app.get('/authors/new', function(req, res) {
	res.render('authors/new');
	// console.log("GET /authors/new")
	// res.send("Set up a response for this route!");
});

//post route for creating new author
//use post bc creating new data
app.post('/authors', function(req, res) {
  var author=req.body.author;

  db.Author
  	.create(author)
  	.then(function(dbAuthor) {
  		res.redirect('/authors');
  	});
  	// console.log(req.body);
	// res.send("Set up a response for this route!");
});


app.get('/authors/:id', function(req, res) {
	var authorId=req.params.id;
	db.Author.find({ where: { id: req.params.id }, include: db.Article })
			.then(function(author) {
				res.render('authors/author', {ejsAuthor:author})
			});

	// console.log("GET /authors/:id")
	// res.send("Set up a response for this route!");
});


//add SITE routes

app.get('/', function(req,res) {
  res.render('site/index');
});

app.get('/about', function(req,res) {
  res.render('site/about');
});

app.get('/contact', function(req,res) {
  res.render('site/contact');
});

app.get('/sync', function(req, res) {
	db.sequelize.sync().then(function() {
		res.send("Sequelize Sync done!");
	});
});

app.listen(3000, function() {
	var msg = "* Listening on Port 3000 *";

	// Just for fun... what's going on in this code?
	/*
	 * When the server starts listening, it displays:
	 *
	 * 	**************************
	 *	* Listening on Port 3000 *
	 *	**************************
	 *
	*/
	console.log(Array(msg.length + 1).join("*"));
	console.log(msg);
	console.log(Array(msg.length + 1).join("*"));
});
