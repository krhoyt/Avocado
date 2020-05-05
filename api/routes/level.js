const express = require( 'express' );
const uuidv4 = require( 'uuid' );

// Router
let router = express.Router();

// Test
router.get( '/test', ( req, res ) => {    
  res.json( {level: 'Test'} );
} );

// Read single record by ID
router.get( '/:id', async ( req, res ) => {
  let record = await req.db
  .select(
    'Level.uuid AS id',
    'Level.created_at',
    'Level.updated_at',
    'Account.uuid AS account_id',
    'Level.name',
    'Level.low',
    'Level.high'
  )
  .from( 'Level' )
  .leftJoin( 'Account', 'Account.id', 'Level.account_id' )
  .where( {
    uuid: req.params.id
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
    'Level.uuid AS id',
    'Level.created_at',
    'Level.updated_at',
    'Account.uuid AS account_id',
    'Level.name',
    'Level.low',
    'Level.high'
  )
  .from( 'Level' )
  .leftJoin( 'Account', 'Account.id', 'Level.account_id' ) 
  .where( 'Level.name', 'like', `${req.params.prefix}%` )
  .where( {
    'Level.account_id': req.account.id
   } )
  .orWhere( 'Level.account_id', null );

  res.json( records );
} );

// Read all records
// Includes count of contributions
router.get( '/', async ( req, res ) => {
  let records = await req.db
  .select( 
    'Level.uuid AS id',
    'Level.created_at',
    'Level.updated_at',
    'Account.uuid AS account_id',
    'Level.name',
    'Level.low',
    'Level.high'
  )
  .count( 'Developer.id AS count' )
  .from( 'Level' )
  .leftJoin( 'Developer', 'Developer.level_id', 'Level.id' )
  .leftJoin( 'Account', 'Account.id', 'Level.account_id' )
  .where( {
    'Level.account_id': req.account.id    
  } )
  .orWhere( 'Level.account_id', null )
  .groupBy( 'Level.id' )
  .orderBy( 'Level.low', 'asc' );

  res.json( records );
} );

// Create record
router.post( '/', async ( req, res ) => {
  let record = {
    id: null,
    uuid: uuidv4(),
    created_at: new Date(),
    updated_at: new Date(),
    account_uuid: req.account.uuid,
    account_id: req.account.id,
    name: req.body.name.trim(),
    low: req.body.low,
    high: req.body.high
  };

  let existing = null;

  if( req.query.hasOwnProperty( 'existing' ) ) {
    if( req.query.existing === 'true' ) {
      existing = await req.db
      .select( 
        'Level.uuid AS id',
        'Level.created_at',
        'Level.updated_at',
        'Account.uuid AS account_id',
        'Level.name',
        'Level.low',
        'Level.high'
      )
      .from( 'Level' )
      .leftJoin( 'Account', 'Account.id', 'Level.account_id' )
      .where( {
        'Level.name': record.name,
        'Level.account_id': record.account_id
      } )
      .first();

      if( existing === undefined ) {
        existing = null;
      }
    }
  }  

  if( existing === null ) {
    // SQLite does not support date objects
    // Store as string
    if( req.db.client.config.client === 'sqlite3' ) {
      record.created_at = record.created_at.toISOString();
      record.updated_at = record.updated_at.toISOString();
    }  

    // Insert
    await req.db( 'Level' )
    .insert( {
      id: record.id,
      uuid: record.uuid,
      created_at: record.created_at,
      updated_at: record.updated_at,
      account_id: record.account_id,
      name: record.name,
      low: record.low,
      high: record.high
    } );

    // Response
    record = {
      id: record.uuid,
      created_at: record.created_at,
      updated_at: record.updated_at,
      account_id: record.account_uuid,
      name: record.name,
      low: record.low,
      high: record.high
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
    account_uuid: req.body.account_id,
    account_id: req.account.id,
    name: req.body.name,
    low: req.body.low,
    high: req.body.high
  };

  // SQLite does not support date objects
  // Store as string
  if( req.db.client.config.client === 'sqlite3' ) {
    record.updated_at = record.updated_at.toISOString();
  }

  // Update
  await req.db( 'Level' )
  .update( {
    updated_at: record.updated_at,
    name: record.name,
    low: record.low,
    high: record.high
  } )
  .where( {
    uuid: record.uuid
  } );

  // Return includes created date
  record = await req.db
  .select( 
    'Level.uuid AS id',
    'Level.created_at',
    'Level.updated_at',
    'Account.uuid AS account_id',
    'Level.name',
    'Level.low',
    'Level.high'
  )
  .from( 'Level' )
  .leftJoin( 'Account', 'Account.id', 'Level.account_id' )
  .where( {
    'Level.uuid': record.uuid
  } )
  .first();

  res.json( record );  
} );

// Delete record
router.delete( '/:id', async ( req, res ) => {
  await req.db( 'Level' )
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
