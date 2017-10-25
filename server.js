var express = require("express");
var exphbs = require("express-handlebars");
var path = require("path");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var request = require("request");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = 3000;

var app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: false }));

app.set('views',path.join(__dirname, 'views'));
app.engine('handlebars',exphbs({defaultLayout: 'main'}));
app.set('view engine','handlebars');

app.use(express.static(path.join(__dirname,'public')));

app.get("/",function(req, res) {
  res.render('home');
});

app.get("/saved",function(req, res) {
  res.render('saved');
});

mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/TESTING", {
  useMongoClient: true
});

app.get("/scrape", function(req, res) {
	request("https://www.nytimes.com/section/sports", function(error, response, html) {
		var $ = cheerio.load(html);
		$("div.story-body").each(function(i, element) {
			var title = $(element).eq(0).find("h2.headline").text().trim();
			var summary = $(element).eq(0).find("p.summary").text();
			var link = $(element).eq(0).find("a").attr("href");

			var article = {
				title: title,
				summary: summary,
				link: link
			};

			db.Article.create(article).then(function(dbArticle) {
				res.send("Scrape Complete");
			}).catch(function(err) {
				res.json(err);
			});
		});
	});
});

app.get("/articles", function(req, res) {
  db.Article.find({}).then(function(dbArticle) {
    res.json(dbArticle);
  }).catch(function(err) {
    res.json(err);
  });
});

app.post("/save/articles/:id", function(req, res) {
  db.Article.findOneAndUpdate({
      _id: req.params.id
    }, { saved: true }, { new: true })
  .then(function(dbArticle) {
    res.json(dbArticle);
  }).catch(function(err) {
    res.json(err);
  });
});

app.get("/articles/:id", function(req, res) {
  db.Article.find({
    _id: req.params.id
  }).populate("note").then(function(dbArticle) {
    res.json(dbArticle);
  }).catch(function(err) {
    res.json(err);
  });
});

app.post("/delete/articles/:id", function(req, res) {
  db.Article.findOneAndUpdate({
      _id: req.params.id
    }, { saved: false }, { new: true })
  .then(function(dbArticle) {
    res.json(dbArticle);
  }).catch(function(err) {
    res.json(err);
  });
});

app.post("/articles/:id", function(req, res) {
  db.Note.create(req.body).then(function(dbNote) {
    return db.Article.findOneAndUpdate({
      _id: req.params.id
    }, { $push: { note: dbNote._id } }, { new: true });
  }).then(function(dbArticle) {
    res.json(dbArticle);
  }).catch(function(err) {
    res.json(err);
  });
});

app.post("/delete/note/:id", function(req, res) {
  db.Note.findOneAndRemove({
    _id: req.params.id
  }, function(err, response) {
    db.Article.update(
    {
      "note": req.params.id
    },
    {
      "$pull": { "note": req.params.id }
    }, function(err, res) {
      if (err) throw err;
    });
  });
});

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});