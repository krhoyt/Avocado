const express = require( 'express' );
const uuidv4 = require( 'uuid' );

// Router
let router = express.Router();

// Test
router.get( '/test', ( req, res ) => {    
  res.json( {account: 'Test'} );
} );

// Read by ID
router.get( '/:id', async ( req, res ) => {
  // Record
  let record = await req.db
  .select(
    'Account.id',
    'Account.created_at',
    'Account.updated_at',
    'Account.email',
    'Account.token'
  )
  .from( 'Account' )
  .where( {
    'Account.id': req.params.id
  } )
  .first();

  // Does not exist
  if( record === undefined ) {
    record = null;
  }

  // Response
  res.json( record );
} );

// Read by email
router.get( '/email/:email', async ( req, res ) => {
  // Record
  const record = await req.db
  .select(
    'Account.id',
    'Account.created_at',
    'Account.updated_at',
    'Account.email',
    'Account.token'
  )
  .from( 'Account' )
  .where( {
    'Account.email': req.params.email
  } )
  .first();

  // Does not exist
  if( record === undefined ) {
    record = null;
  }

  // Response
  res.json( record );
} );

// Read by token
router.get( '/token/:token', async ( req, res ) => {
  // Record
  let record = await req.db
  .select(
    'Account.id',
    'Account.created_at',
    'Account.updated_at',
    'Account.email',
    'Account.token'
  )
  .from( 'Account' )
  .where( {
    'Account.token': req.params.token
  } )
  .first();

  // Does not exist
  if( record === undefined ) {
    record = null;
  }

  // Response
  res.json( record );
} );

// Read all
router.get( '/', async ( req, res ) => {
  // Records
  const records = await req.db
  .select(
    'Account.id',
    'Account.created_at',
    'Account.updated_at',
    'Account.email',
    'Account.token'
  )
  .from( 'Account' )
  .orderBy( 'Account.email', 'asc' );

  // Response
  res.json( records );
} );

// Create
router.post( '/', async ( req, res ) => {
  // Record
  let record = {
    id: uuidv4(),
    created_at: new Date(),
    updated_at: new Date(),
    email: req.body.email,
    token: uuidv4()
  };

  // No duplicates
  const existing = await req.db
  .select(
    'Account.id',
    'Account.created_at',
    'Account.updated_at',
    'Account.email',
    'Account.token'
  )
  .from( 'Account' )
  .where( {
    'Account.email': record.email
  } )
  .first();

  // New account
  if( existing === undefined ) {
    // SQLite
    if( req.db.client.config.client === 'sqlite3' ) {
      record.created_at = record.created_at.toISOString();
      record.updated_at = record.updated_at.toISOString();
    }

    // Insert
    await req.db( 'Account' )
    .insert( {
      id: record.id,
      created_at: record.created_at,   
      updated_at: record.updated_at,
      email: record.email,
      token: record.token
    } );

    // Response
    record = {
      id: record.id,
      created_at: record.created_at,
      updated_at: record.updated_at,
      email: record.email,
      token: record.token
    };
  } else {
    // Existing
    record = existing;
  }

  // Reponse
  res.json( record );
} );

// Update
router.put( '/:id', async ( req, res ) => {
  // Record
  let record = {
    id: req.params.id,
    updated_at: new Date(),
    email: req.body.email
  };

  // SQLite
  if( req.db.client.config.client === 'sqlite3' ) {
    record.updated_at = record.updated_at.toISOString();
  }

  // Update
  await req.db( 'Account' )
  .update( {
    updated_at: record.updated_at,      
    email: record.email
  } )
  .where( {
    id: record.id
  } );    

  // Full record
  record = await req.db
  .select(
    'Account.id',
    'Account.created_at',
    'Account.updated_at',
    'Account.email',
    'Account.token'
  )
  .from( 'Account' )
  .where( {
    'Account.id': record.id
  } )
  .first();


  // Response
  res.json( record );  
} );

// Refresh token
router.patch( '/:id/token', async ( req, res ) => {
  // Record
  let record = {
    updated_at: new Date(),
    token: uuidv4(),
    id: req.params.id
  };

  // SQLite
  if( req.db.client.config.client === 'sqlite3' ) {
    record.updated_at = record.updated_at.toISOString();
  }

  // Update
  await req.db( 'Account' )
  .update( {
    updated_at: record.updated_at,
    token: record.token
  } )
  .where( {
    id: record.id
   } );

   // Response
   res.json( {
     token: record.token
   } );
} );

// Delete
router.delete( '/:id', async ( req, res ) => {
  // Remove
  await req.db( 'Account' )
  .where( {
    id: req.params.id
  } )
  .del();

  // Response
  res.json( {
    id: req.params.id
  } );
} );

// Export
module.exports = router;
