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
  res.json( {language: 'Test'} );
} );

// Read single record by ID
router.get( '/:id', async ( req, res ) => {
  let record = await req.db
  .select(
    'Language.uuid AS id',
    'Language.created_at',
    'Language.updated_at',
    'Account.uuid AS account_id',
    'Language.name',
    'Color.uuid AS color_id'
  )
  .from( 'Language' )
  .leftJoin( 'Account', 'Account.id', 'Language.account_id' )
  .leftJoin( 'Color', 'Color.id', 'Language.color_id' )
  .where( {
    'Language.uuid': req.params.id,
    'Account.id': req.account.id
  } )
  .first();

  if( record === undefined ) {
    record = null;
  }

  res.json( record );
} );

// Search for records with a given start
router.get( '/name/:prefix', async ( req, res ) => {
  let records = await req.db
  .select( 
    'Language.uuid AS id',
    'Language.created_at',
    'Language.updated_at',
    'Account.uuid AS account_id',
    'Language.name',
    'Color.uuid AS color_id'
  )
  .from( 'Language' )
  .leftJoin( 'Account', 'Account.id', 'Language.account_id' )
  .leftJoin( 'Color', 'Color.id', 'Language.color_id' )
  .where( 'Language.name', 'like', `${req.params.prefix}%` )
  .where( 'Account.id', req.account.id )
  .orWhere( 'Language.account_id', null );

  res.json( records );
} );

// Read all records
// Includes count of developers
router.get( '/', async ( req, res ) => {
  let records = await req.db
  .select( 
    'Language.uuid AS id',
    'Language.created_at',
    'Language.updated_at',
    'Account.uuid AS account_id',
    'Language.name',
    'Color.uuid AS color_id'
  )
  .count( 'DeveloperLanguage.id AS count' )
  .from( 'Language' )
  .leftJoin( 'DeveloperLanguage', 'Language.id', 'DeveloperLanguage.language_id' )
  .leftJoin( 'Account', 'Account.id', 'Language.account_id' )
  .leftJoin( 'Color', 'Color.id', 'Language.color_id' )
  .where( 'Account.id', req.account.id )
  .orWhere( 'Language.account_id', null )
  .groupBy( 'Language.id' )
  .orderBy( 'Language.name', 'asc' );

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
    color_uuid: req.body.color_id
  };

  let existing = await req.db
  .select( 
    'Language.uuid AS id',
    'Language.created_at',
    'Language.updated_at',
    'Account.uuid AS account_id',
    'Language.name',
    'Color.uuid AS color_id'
  )
  .from( 'Language' )
  .leftJoin( 'Account', 'Account.id', 'Language.account_id' )
  .leftJoin( 'Color', 'Color.id', 'Language.color_id' )
  .where( {
    'Language.name': record.name,
    'Account.id': record.account_id
  } )
  .first();

  if( existing === undefined ) {
    // Color lookup
    let color = await req.db
    .select( 'id' )
    .from( 'Color' )
    .where( 'uuid', record.color_uuid )
    .first();
    record.color_id = color.id;

    // SQLite does not support date objects
    // Store as string
    if( req.db.client.config.client === 'sqlite3' ) {
      record.created_at = record.created_at.toISOString();
      record.updated_at = record.updated_at.toISOString();
    }  

    // Insert
    await req.db( 'Language' )
    .insert( {
      id: record.id,
      uuid: record.uuid,
      created_at: record.created_at,
      updated_at: record.updated_at,
      account_id: record.account_id,
      name: record.name,
      color_id: record.color_id
    } );

    // Response
    record = {
      id: record.uuid,
      created_at: record.created_at,
      updated_at: record.updated_at,
      account_id: req.account.uuid,
      name: record.name,
      color_id: record.color_uuid
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
    color_uuid: req.body.color_id
  };

  // Color lookup
  let color = await req.db
  .select( 'id' )
  .from( 'Color' )
  .where( 'uuid', record.color_uuid )
  .first();
  record.color_id = color.id;

  // SQLite does not support date objects
  // Store as string
  if( req.db.client.config.client === 'sqlite3' ) {
    record.updated_at = record.updated_at.toISOString();
  }

  // Update
  await req.db( 'Language' )
  .update( {
    updated_at: record.updated_at,
    name: record.name,
    color_id: record.color_id
  } )
  .where( {
    uuid: record.uuid
  } );

  // Return includes created date
  record = await req.db
  .select( 
    'Language.uuid AS id',
    'Language.created_at',
    'Language.updated_at',
    'Account.uuid AS account_id',
    'Language.name',
    'Color.uuid AS color_id',
    'Color.foreground',
    'Color.background'
  )
  .from( 'Language' )
  .leftJoin( 'Account', 'Account.id', 'Language.account_id' )
  .leftJoin( 'Color', 'Color.id', 'Language.color_id' )
  .where( {
    'Language.uuid': record.uuid,
    'Account.id': record.account_id
  } )
  .orWhere( 'Language.account_id', null )
  .first();

  res.json( record );  
} );

// Delete record
router.delete( '/:id', async ( req, res ) => {
  await req.db( 'Language' )
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
