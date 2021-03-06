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
  res.json( {relationship: 'Test'} );
} );

// Read single record by ID
router.get( '/:id', async ( req, res ) => {
  let record = await req.db
  .select(
    'Relationship.uuid AS id',
    'Relationship.created_at',
    'Relationship.updated_at',
    'Relationship.name',
    'Color.uuid AS color_id',
    'Color.foreground',
    'Color.background'
  )
  .from( 'Relationship' )
  .leftJoin( 'Account', 'Account.id', 'Relationship.account_id' )
  .leftJoin( 'Color', 'Color.id', 'Relationship.color_id' )
  .where( {
    'Relationship.uuid': req.params.id,
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
    'Relationship.uuid AS id',
    'Relationship.created_at',
    'Relationship.updated_at',
    'Account.uuid AS account_id',
    'Relationship.name',
    'Color.uuid AS color_id',
    'Color.foreground',
    'Color.background'
  )
  .from( 'Relationship' )
  .leftJoin( 'Account', 'Account.id', 'Relationship.account_id' )
  .leftJoin( 'Color', 'Color.id', 'Relationship.color_id' )
  .where( 'Relationship.name', 'like', `${req.params.prefix}%` )
  .where( 'Account.id', req.account.id )
  .orWhere( 'Relationship.account_id', null );

  res.json( records );
} );

// Read all records
// Includes count of developers
router.get( '/', async ( req, res ) => {
  let records = await req.db
  .select( 
    'Relationship.uuid AS id',
    'Relationship.created_at',
    'Relationship.updated_at',
    'Account.uuid AS account_id',
    'Relationship.name',
    'Color.uuid AS color_id',
    'Color.foreground',
    'Color.background'
  )
  .count( 'DeveloperRelationship.id AS count' )
  .from( 'Relationship' )
  .leftJoin( 'DeveloperRelationship', 'Relationship.id', 'DeveloperRelationship.relationship_id' )
  .leftJoin( 'Account', 'Account.id', 'Relationship.account_id' )
  .leftJoin( 'Color', 'Color.id', 'Relationship.color_id' )
  .where( 'Account.id', req.account.id )
  .orWhere( 'Account.id', null )
  .groupBy( 'Relationship.id' )
  .orderBy( 'Relationship.name', 'asc' );

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
    account_uuid: req.body.account_id,
    name: req.body.name.trim(),
    color_uuid: req.body.color_id
  };

  let existing = await req.db
  .select( 
    'Relationship.uuid AS id',
    'Relationship.created_at',
    'Relationship.updated_at',
    'Account.uuid AS account_id',
    'Relationship.name',
    'Color.uuid AS color_id'
  )
  .from( 'Relationship' )
  .leftJoin( 'Account', 'Account.id', 'Relationship.id' )
  .leftJoin( 'Color', 'Color.id', 'Relationship.color_id' )
  .where( {
    'Relationship.name': record.name,
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
    await req.db( 'Relationship' )
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
    account_uuid: req.body.account_id,
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
  await req.db( 'Relationship' )
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
    'Relationship.uuid AS id',
    'Relationship.created_at',
    'Relationship.updated_at',
    'Account.uuid AS account_id',
    'Relationship.name',
    'Color.uuid AS color_id'
  )
  .from( 'Relationship' )
  .leftJoin( 'Account', 'Account.id', 'Relationship.account_id' )
  .leftJoin( 'Color', 'Color.id', 'Relationship.color_id' )
  .where( {
    'Relationship.uuid': record.uuid,
    'Account.id': record.account_id
  } )
  .first();

  res.json( record );  
} );

// Delete record
router.delete( '/:id', async ( req, res ) => {
  await req.db( 'Relationship' )
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
