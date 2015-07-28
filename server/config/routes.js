/**
 * Routes for express app
 */
var users = require('../controllers/users');
var mongoose = require('mongoose');
var _ = require('lodash');



//var Topic = mongoose.model('Topic');
//var Header = require('../../public/assets/header.server');
//var App = require('../../public/assets/app.server');

module.exports = function(app) {
  // user routes
  //app.post('/login', users.postLogin);
  //app.post('/signup', users.postSignUp);
  app.get('/users', users.getUsers);


  // topic routes
  //app.get('/topic', topics.all);

  //app.post('/topic', function(req, res) {
  //  topics.add(req, res);
  //});
  //
  //app.put('/topic', function(req, res) {
  //  topics.update(req, res);
  //});
  //
  //app.delete('/topic', function(req, res) {
  //  topics.remove(req, res);
  //});

  // This is where the magic happens. We take the locals data we have already 
  // fetched and seed our stores with data.
  // App is a function that requires store data and url to initialize and return the React-rendered html string
  // Exclude any image files or map files
  app.get('*', function (req, res, next) {
    if (/(\.png$|\.map$|\.jpg$)/.test(req.url)) return;
    //Topic.find({}).exec(function(err, topics) {
    //  if(!err) {
    //    var topicmap = _.indexBy(topics, 'id');
    //    // We don't want to be seeding and generating markup with user information
    //    var user = req.user ? { authenticated: true, isWaiting: false } : { authenticated: false, isWaiting: false };
    //    // An object that contains response local variables scoped to the request, and therefore available only to the view(s) rendered during
    //    // that request/response cycle (if any). Otherwise, this property is identical to app.locals
    //    // This property is useful for exposing request-level information such as request path name, authenticated user, user settings, and so on.
    //    // pass in data to be seeded into the TopicStore
    //    res.locals.data =  {
    //      TopicStore: { topics: topicmap},
    //      UserStore: { user: user }
    //    };
    //
    //    var html = App(JSON.stringify(res.locals.data || {}), req.url);
    //    html = html.replace("TITLE", Header.title)
    //                .replace("META", Header.meta)
    //                .replace("LINK", Header.link);
    //
    //    res.contentType = "text/html; charset=utf8";
    //    res.end(html);
    //  }else {
    //    console.log('Error in first query');
    //  }
    //});
  });

};
