const express = require( 'express' );
const uuidv4 = require( 'uuid' );

// Router
let router = express.Router();

// Token authentication
router.use( (req, res, next ) => {
  if( req.account === null ) {
    res.status( 401 ).send( 'API token required for this resource.' );
  } else {
    next();
  }
} );

// Test
router.get( '/test', ( req, res ) => {    
  res.json( {color: 'Test'} );
} );

// Read single record by ID
router.get( '/:id', async ( req, res ) => {
  let record = await req.db
  .select(
    'Color.uuid AS id',
    'Color.created_at',
    'Color.updated_at',
    'Account.uuid AS account_id',
    'Color.name',
    'Color.foreground',
    'Color.background'
  )
  .from( 'Color' )
  .leftJoin( 'Account', 'Account.id', 'Color.account_id' )
  .where( {
    'Color.uuid': req.params.id,
    'Account.id': req.account.id
  } )
  .first();

  if( record === undefined ) {
    record = null;
  }

  res.json( record );
} );

// Read all records
// Includes count of developers
router.get( '/', async ( req, res ) => {
  let records = await req.db
  .select( 
    'Color.uuid AS id',
    'Color.created_at',
    'Color.updated_at',
    'Account.uuid AS account_id',
    'Color.name',
    'Color.foreground',
    'Color.background'
  )
  .from( 'Color' )
  .leftJoin( 'Account', 'Account.id', 'Color.account_id' )
  .where( 'Account.id', req.account.id )
  .orWhere( 'Color.account_id', null )
  .orderBy( 'Color.name', 'asc' );

  res.json( records );
} );

// Create record
router.post( '/', async ( req, res ) => {
  let record = {
    id: null,
    uuid: uuidv4(),
    created_at: new Date(),
    updated_at: new Date(),
    account_id: req.account.id,
    name: req.body.name.trim(),
    foreground: req.body.foreground === null ? null : req.body.foreground.trim(),
    background: req.body.background === null ? null : req.body.background.trim()
  };

  let existing = await req.db
  .select( 
    'Color.uuid AS id',
    'Color.created_at',
    'Color.updated_at',
    'Color.name',
    'Color.foreground',
    'Color.background'
  )
  .from( 'Color' )
  .leftJoin( 'Account', 'Account.id', 'Color.account_id' )
  .where( {
    'Color.name': record.name,
    'Account.id': record.account_id
  } )
  .first();

  if( existing === undefined ) {
    // SQLite does not support date objects
    // Store as string
    if( req.db.client.config.client === 'sqlite3' ) {
      record.created_at = record.created_at.toISOString();
      record.updated_at = record.updated_at.toISOString();
    }  

    // Insert
    await req.db( 'Color' )
    .insert( {
      id: record.id,
      uuid: record.uuid,
      created_at: record.created_at,
      updated_at: record.updated_at,
      account_id: record.account_id,
      name: record.name,
      foreground: record.foreground,
      background: record.background
    } );

    // Response
    record = {
      id: record.uuid,
      created_at: record.created_at,
      updated_at: record.updated_at,
      account_id: req.account.uuid,
      name: record.name,
      foreground: record.foreground,
      background: record.background
    };    
  } else {
    record = existing;
  }

  res.json( record );
} );

// Update
router.put( '/:id', async ( req, res ) => {
  let record = {
    uuid: req.params.id,
    updated_at: new Date(),
    account_id: req.account.id,
    name: req.body.name,
    foreground: req.body.foreground,
    background: req.body.background
  };

  // SQLite does not support date objects
  // Store as string
  if( req.db.client.config.client === 'sqlite3' ) {
    record.updated_at = record.updated_at.toISOString();
  }

  // Update
  await req.db( 'Color' )
  .update( {
    updated_at: record.updated_at,
    name: record.name,
    foreground: record.foreground,
    background: record.background
  } )
  .where( {
    uuid: record.uuid
  } );

  // Return includes created date
  record = await req.db
  .select( 
    'Color.uuid AS id',
    'Color.created_at',
    'Color.updated_at',
    'Account.uuid AS account_id',
    'Color.name',
    'Color.foreground',
    'Color.background'
  )
  .from( 'Color' )
  .leftJoin( 'Account', 'Account.id', 'Color.account_id' )
  .where( {
    'Color.uuid': record.uuid,
    'Account.id': record.account_id
  } )
  .first();

  res.json( record );  
} );

// Delete record
router.delete( '/:id', async ( req, res ) => {
  await req.db( 'Color' )
  .where( {
    uuid: req.params.id
  } )
  .del();

  res.json( {
    id: req.params.id
  } );
} );

// Export
module.exports = router;
