const express = require( 'express' );
const rp = require( 'request-promise-native' );
const uuidv4 = require( 'uuid' );

// Router
let router = express.Router();

// Test
router.get( '/test', ( req, res ) => {    
  res.json( {authenticate: 'Test'} );
} );

// Client ID
router.get( '/github', ( req, res ) => {
  res.json( req.config.github.client_id );
} );

// OAuth
router.post( '/github', async ( req, res ) => {
  // Get access token  
  const auth = await rp( {
    url: 'https://github.com/login/oauth/access_token',
    method: 'POST',
    json: {
      client_id: req.config.github.client_id,
      client_secret: req.config.github.client_secret,
      code: req.body.code,
      accept: 'application/json'
    }
  } );

  // Get email addresses
  let emails = await rp( {
    url: 'https://api.github.com/user/public_emails',
    method: 'GET',
    headers: {
      'Authorization': `token ${auth.access_token}`,
      'User-Agent': 'Avocado'
    },
    json: true
  } );

  let email = null;

  // Find primary
  for( let e = 0; e < emails.length; e++ ) {
    if( emails[e].primary ) {
      email = emails[e].email;
      break;
    }
  }

  // Check exists
  let account = await req.db
  .select(
    'Account.id',
    'Account.created_at',
    'Account.updated_at',
    'Account.email',
    'Account.token'
  )
  .from( 'Account' )
  .where( 'Account.email', email )
  .first();

  // Does not exist
  if( account === undefined ) {
    // Record 
    const record = {
      id: uuidv4(),
      created_at: new Date(),
      updated_at: new Date(),
      token: uuidv4(),
      email: email
    };

    // SQLite
    if( req.db.client.config.client === 'sqlite3' ) {
      record.created_at = record.created_at.toISOString();
      record.updated_at = record.updated_at.toISOString();
    }    

    // Create
    await req.db( 'Account' )
    .insert( {
      id: record.id,
      created_at: record.created_at,
      updated_at: record.updated_at,
      email: record.email,
      token: record.token
    } );

    // Build account response
    account = {
      id: record.id,
      created_at: record.created_at,
      updated_at: record.updated_at,
      email: record.email,
      token: record.token
    };
  }

  // Response
  res.json( account );
} );

// Export
module.exports = router;
