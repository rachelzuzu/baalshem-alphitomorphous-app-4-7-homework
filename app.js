var express = require('express'),
	bodyParser = require('body-parser'),
	ejs=require('ejs'),
	methodOverride=require("method-override"),
	pg = require("pg"),
	db = require("./models"),
	session = require("express-session"),
	app = express();


app.set('view engine', 'ejs');

app.use(methodOverride('_method'));

app.use(bodyParser.urlencoded({extended: true}));

//create a session
app.use(session({
  secret: 'super secret',
  resave: false,
  saveUninitialized: true
}));


//save user data for a session
app.use("/", function (req, res, next) {

  req.login = function (user) {
    req.session.userId = user.id;
  };

  req.currentUser = function () {
    return db.User.
      find({
        where: {
          id: req.session.userId
       }
      }).
      then(function (user) {
        req.user = user;
        return user;
      })
  };

  req.logout = function () {
    req.session.userId = null;
    req.user = null;
  }

  next(); 
});

//create a route to sign up**
app.get("/signup", function (req, res) {
  res.render("signup");
});

// where the user submits the sign-up form
app.post("/users", function (req, res) {

  // grab the user from the params
  var user = req.body.user;

  // create the new user
  db.User.
 	 // create user
    createSecure(user.email, user.password).
    // if user created successfully, then login user
    then(function (user) {
	    req.login(user);
	    res.redirect("/profile");
    });
});

//add a login path
app.get("/login", function (req, res) {
  res.render("login");
});

//login
app.post("/login", function (req, res) {
  var user = req.body.user;

  db.User
    .authenticate(user.email, user.password)
    .then(function (user) {
          req.login(user);
          res.redirect("/profile");
    });
});

//user show path
app.get("/profile", function (req, res) {
  req.currentUser()
      .then(function (user) {
        res.render("profile.ejs", {user:user});
      })
});



// Fill in these ARTICLE routes!

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
  			res.render('articles/article', {articleToDisplay: dbArticle});
  		});
});


// app.get('/articles/:id', function(req, res) {
//   	var articleId=req.params.id;
//   	db.Article.find({ where: { id: req.params.id }})
//   	.then(function (article) {
//   		return article.getAuthor().
//   			then(function (author) {
//   				article.Author = author;
//   				return article;
//   			});
//   	})
// 	.then(function(dbArticle) {
// 		res.render('articles/article', {articleToDisplay: dbArticle});
// 	});
// });

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

//add post/users

// where the user submits the sign-up form
app.post("/users", function (req, res) {

  // grab the user from the params
  var user = req.body.user;

  // create the new user
  db.User.
    createSecure(user.email, user.password).
    then(function(){
        res.send("SIGNED UP!");
      });
});





app.listen(3000, function() {
	var msg = "* Listening on Port 3000 *";

	console.log(Array(msg.length + 1).join("*"));
	console.log(msg);
	console.log(Array(msg.length + 1).join("*"));
});
