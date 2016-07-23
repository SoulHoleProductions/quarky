var resolve   = require('path').resolve;

var express   = require('express');
var app       = express();

app.use(express.logger());

// Get auth0-angular.js from the root directory
app.use('/auth0-angular.js',function (req, res) {
  res.sendfile(resolve(__dirname + '/../../../auth0-angular.js'));
});

app.use('/', express.static(__dirname + '/../client'));

var Auth0 = require('auth0').ManagementClient;
var extend = require('xtend');

var api = new Auth0({
  token:  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJFb2JoYWVoTXFXdDdnT0JZR0hwenRDUkh5SVZ4enlrUiIsInNjb3BlcyI6eyJ1c2VycyI6eyJhY3Rpb25zIjpbImNyZWF0ZSJdfX0sImlhdCI6MTQ2MDA4MjkwOCwianRpIjoiYTNkZDU3ZDU3YTRhYThkZjk0ZjYwODVjYTU4NjQ2YzcifQ.rg4uUftBNS9p2ZO0I7Y-6FuqPR4cbjivF3t5znPdiZs',
  domain: 'contoso.auth0.com'
});

var CONNECTION = 'Username-Password-Authentication';

app.use(express.bodyParser());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(express.bodyParser());

app.post('/custom-signup', function (req, res) {
  console.log("req.body: ", JSON.stringify(req.body));
  var data = extend(req.body, {connection: CONNECTION, email_verified: false});

  console.log("Data: ", JSON.stringify(data));

  api.createUser(data, function (err) {
    if (err) {
      console.log('Error creating user: ' + err);
      res.send(500, err);
      return;
    }

    res.send(200);
    
  });
});

app.listen(3001);
console.log('listening on port http://localhost:3001');
