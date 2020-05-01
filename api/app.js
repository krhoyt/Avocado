var cors = require( 'cors' );
var express = require( 'express' );
var jsonfile = require( 'jsonfile' );
var parser = require( 'body-parser' );
var request = require( 'sync-request' );

// Configuration
var config = jsonfile.readFileSync( './config.json' );

// Twitter credentials
// Synchronous for simplicity in this case only
// Once at startup has no further performance penalties
var authentication = Buffer.from( config.twitter.key + ':' + config.twitter.secret );
var response = request( 'POST', 'https://api.twitter.com/oauth2/token', {
  headers: {
    'Authorization': 'Basic ' + authentication.toString( 'base64' ),
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: 'grant_type=client_credentials'
});
var twitter = JSON.parse( response.getBody( 'utf8' ) );

// Database
var db = require( 'knex' )( config.server[config.server.mode] );

// Application
var app = express();

// IP tracking
app.enable( 'trust proxy' );

// Cross-domain
app.use( cors() );

// Middleware
app.use( parser.json( { limit: '50mb' } ) );
app.use( parser.urlencoded( {
  limit: '50mb',
  extended: false,
  parameterLimit: 50000
} ) );

// Per-request actions
app.use( async ( req, res, next ) => {
  // Configuration
  req.config = config;
  req.db = db;
  req.twitter = twitter;

  if( req.headers['x-avocado'] ) {
    // API token present
    var account = await req.db
    .select(
      'Account.id',
      'Account.uuid',
      'Account.created_at',
      'Account.updated_at',
      'Owner.uuid AS owner',
      'Account.email',
      'Account.role',
      'Account.token'
    )
    .from( 'Account' )
    .leftJoin( 'Account AS Owner', 'Account.owner', 'Owner.id' )
    .where( {
      'Account.token': req.headers['x-avocado']
    } )
    .first();
  
    if( account === undefined ) {
      // Not found
      // Pass along nothing
      req.account = null;
    } else {
      // Pass along the account record
      req.account = account;
    }
  } else {
    req.account = null;
  }

  // Just keep swimming!
  next();
} );

// Static for main files
app.use( '/', express.static( 'public' ) );

// Routes
app.use( '/api/account', require( './routes/account' ) );
app.use( '/api/reports', require( './routes/reports' ) );
app.use( '/api/color', require( './routes/color' ) );
app.use( '/api/situation', require( './routes/situation' ) );
app.use( '/api/language', require( './routes/language' ) );
app.use( '/api/organization', require( './routes/organization' ) );
app.use( '/api/relationship', require( './routes/relationship' ) );
app.use( '/api/role', require( './routes/role' ) );
app.use( '/api/skill', require( './routes/skill' ) );
app.use( '/api/contribution', require( './routes/contribution' ) );
app.use( '/api/capacity', require( './routes/capacity' ) );
app.use( '/api/developer', require( './routes/developer' ) );
app.use( '/api/note', require( './routes/note' ) );
app.use( '/api/blog/post', require( './routes/blog-post' ) );
app.use( '/api/blog', require( './routes/blog' ) );
app.use( '/api/dev/post', require( './routes/dev-post' ) );
app.use( '/api/dev', require( './routes/dev' ) );
app.use( '/api/github/event', require( './routes/github-event' ) );
app.use( '/api/github', require( './routes/github' ) );
app.use( '/api/instagram', require( './routes/instagram' ) );
app.use( '/api/linkedin', require( './routes/linkedin' ) );
app.use( '/api/medium/post', require( './routes/medium-post' ) );
app.use( '/api/medium', require( './routes/medium' ) );
app.use( '/api/youtube/video', require( './routes/youtube-video' ) );
app.use( '/api/youtube', require( './routes/youtube' ) );
app.use( '/api/media', require( './routes/media' ) );
app.use( '/api/reddit/post', require( './routes/reddit-post' ) );
app.use( '/api/reddit', require( './routes/reddit' ) );
app.use( '/api/so/question', require( './routes/so-question' ) );
app.use( '/api/so/answer', require( './routes/so-answer' ) );
app.use( '/api/so', require( './routes/so' ) );
app.use( '/api/twitter/status', require( './routes/twitter-status' ) );
app.use( '/api/twitter', require( './routes/twitter' ) );
app.use( '/api/website', require( './routes/website' ) );
app.use( '/api/repository', require( './routes/repository' ) );
app.use( '/api/watson', require( './routes/watson' ) );
app.use( '/api/utility', require( './routes/utility' ) );

// Listen
var port = process.env.PORT || config.server.port;

// Start
app.listen( port, function() {
  // Debug
  console.log( 'Get relating!' );
} );
