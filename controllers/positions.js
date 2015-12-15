var express = require('express'),
    router  = express.Router(),
    bcrypt  = require('bcrypt'),
    User    = require('../models/user');

    // ALL OF THE BELOW IS PLACEHOLDER CODE AND NEEDS TO BE REPLACED

    // INDEX
    router.get('/positions', function (req, res) {
      if (!req.session.userId) {
        res.redirect(302, '/users/login');
      } else {
        Article.find({}, function (err, allArticlesArray) {
          if (err) {
            console.log("Retrieval error: ", err);
          } else {
            res.render('articles/index', {
              articles: allArticlesArray
            });
          }
        });
      }
    });

    // NEW
    router.get('/new', function (req, res) {
      if (req.session.userId) {
        User.findById(req.session.userId, function (err, user) {
          if (err) {
            req.session.flash.message = "An error has occurred: " + err;
            res.redirect(302, '/');
          } else if (user) {
            res.render('articles/new', {
              user: user
            });
          }
        });
      } else {
        res.redirect(302, '/users/login');
      }
    });

    // CREATE
    router.post('/', function (req, res) {
      console.log(req.body);
      if (!req.session.userId) {
        res.redirect(302, '/users/login');
      } else {
        var articleOptions = req.body.article;
        articleOptions.published.tags = articleOptions.published.tags.split(/,\s?/);
        articleOptions.authorId = req.session.userId;
        articleOptions.authorName = req.session.userName;
        var newArticle = new Article(articleOptions);

        newArticle.save(newArticle, function (err, addedArticle) {
          if (err) {
            console.log("There was a database error: ", err);
            res.redirect(302, '/articles/new');
          } else {
            console.log("Article added to database: " + addedArticle);
            res.redirect(302, '/articles');
          }
        });
      }
    });

    // SHOW
    router.get('/:id', function (req, res) {
      if (!req.session.userId) {
        res.redirect(302, '/users/login');
      } else {
        Article.findById(req.params.id, function (err, specificArticle) {
          	if (err) {
            		console.log("Retrieval error: ", err);
         		} else {
            		res.render('articles/show', {
              		article: specificArticle,
                  content: marked(specificArticle.published.content)
            		});
      	      }
        	});
      }
    });

    // EDIT
    router.get('/:id/edit', function (req, res) {
      if (!req.session.userId) {
        res.redirect(302, '/users/login');
      } else {
        Article.findById(req.params.id, function (err, specificArticle) {
          	if (err) {
            		console.log("Retrieval error: ", err);
         		} else {
            		res.render('articles/edit', {
              		article: specificArticle
            		});
      	      }
        	});
      }
    });

    // UPDATE
    router.patch('/:id', function (req, res) {
      if (!req.session.userId) {
        res.redirect(302, '/users/login');
      } else {
        var newEdit = req.body.article;
        newEdit.tags = newEdit.tags.split(/,\s?/);
        newEdit.last_edited = new Date();
        newEdit.editorId = req.session.userId;
        newEdit.editorName = req.session.userName;
        Article.findById(req.params.id, function (err, foundArticle) {
          if (req.session.userId == foundArticle.authorId) {
            Article.findByIdAndUpdate(req.params.id, {published: newEdit, $push: {history: foundArticle.published}}, function (err, updatedArticle) {
              if (err) {
                console.log("update error: ", err);
              } else {
                res.redirect(302, "/articles/" + updatedArticle._id);
                console.log("article successfully updated");
              }
            });
          } else {
            Article.findByIdAndUpdate(req.params.id, {$push: {drafts: newEdit}}, function (err, updatedArticle) {
              if (err) {
                console.log("update error: ", err);
              } else {
                res.redirect(302, "/articles/" + updatedArticle._id);
                console.log("article successfully updated");
              }
            });
          }
        });
      }
    });

    // DELETE
    router.delete('/:id', function (req, res) {
      if (!req.session.userId) {
        res.redirect(302, '/users/login');
      } else {
        Article.findByIdAndRemove(req.params.id, function (err) {
          if (err) {
            console.log(err);
          } else {
            console.log("Article has been removed from database");
            res.redirect(302, '/articles');
          }
        });
      }
    });

module.exports = router;
