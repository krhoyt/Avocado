const cors = require( 'cors' );
const express = require( 'express' );
const jsonfile = require( 'jsonfile' );
const parser = require( 'body-parser' );

// Configuration
const config = jsonfile.readFileSync( './config.json' );

// Database
const db = require( 'knex' )( config.server[config.server.mode] );

// Application
const app = express();

// IP tracking
// Not yet implemented
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

  // Database
  req.db = db;

  // Authorization
  if( req.headers['x-avocado'] ) {
    // API token present
    const account = await req.db
    .select(
      'Account.uuid',
      'Account.created_at',
      'Account.updated_at',
      'Account.email',
      'Account.token'
    )
    .from( 'Account' )
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

// Static files
app.use( '/', express.static( 'public' ) );

// Routes
app.use( '/api/account', require( './routes/account' ) );
app.use( '/api/authenticate', require( './routes/authenticate' ) );

// Listen
var port = process.env.PORT || config.server.port;

// Start
app.listen( port, function() {
  // Debug
  console.log( 'Get relating!' );
} );
