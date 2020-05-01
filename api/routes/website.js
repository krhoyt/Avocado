const express = require( 'express' );
const uuidv4 = require( 'uuid' );

// Router
let router = express.Router();

// Test
router.get( '/test', ( req, res ) => {    
  res.json( {website: 'Test'} );
} );

// Read single record by ID
router.get( '/:id', async ( req, res ) => {
  let record = await req.db
  .select( 
    'Website.uuid AS id',
    'Website.created_at',
    'Website.updated_at',
    'Developer.uuid AS developer_id',
    'Website.url'
  )
  .from( 'Website' )
  .leftJoin( 'Developer', 'Website.developer_id', 'Developer.id' )
  .where( {
    'Website.uuid': req.params.id
  } );

  if( record === undefined ) {
    record = null;
  }

  res.json( record );
} );

// Read all records
router.get( '/', async ( req, res ) => {
  let records = await req.db
  .select(
    'Website.uuid AS id',
    'Website.created_at',
    'Website.updated_at',
    'Developer.uuid AS developer_id',
    'Website.url'
  )
  .from( 'Website' )
  .leftJoin( 'Developer', 'Website.developer_id', 'Developer.id' )
  .orderBy( 'Website.updated_at' );

  res.json( records );
} );

// Create
router.post( '/', async ( req, res ) => {
  let record = {
    id: null,
    uuid: uuidv4(),
    created_at: new Date(),
    updated_at: new Date(),
    developer_uuid: req.body.developer_id,
    url: req.body.url
  };

  let existing = await req.db
  .select( 
    'Website.uuid AS id',
    'Website.created_at',
    'Website.updated_at',
    'Developer.uuid AS developer_id',
    'Website.url'
  )
  .from( 'Website' )
  .leftJoin( 'Developer', 'Website.developer_id', 'Developer.id' )
  .where( {
    'Website.url': record.url
  } )
  .first();

  if( existing === undefined ) {
    let developer = await req.db
    .select( 'id' )
    .from( 'Developer' )
    .where( {
      uuid: record.developer_uuid
    } )
    .first();
    record.developer_id = developer.id;

    // SQLite does not support date objects
    // Store as string
    if( req.db.client.config.client === 'sqlite3' ) {
      record.created_at = record.created_at.toISOString();
      record.updated_at = record.updated_at.toISOString();
    }  

    await req.db( 'Website' )
    .insert( {
      id: record.id,
      uuid: record.uuid,
      created_at: record.created_at,
      updated_at: record.updated_at,
      developer_id: record.developer_id,
      url: record.url
    } );
    
    record = {
      id: record.uuid,
      created_at: record.created_at,
      updated_at: record.updated_at,
      developer_id: record.developer_uuid,
      url: record.url
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
    developer_uuid: req.body.developer_id,
    url: req.body.url
  };

  let developer = await req.db
  .select( 'id' )
  .from( 'Developer' )
  .where( {
    uuid: record.developer_uuid
  } )
  .first();
  record.developer_id = developer.id;

  // SQLite does not support date objects
  // Store as string
  if( req.db.client.config.client === 'sqlite3' ) {
    record.updated_at = record.updated_at.toISOString();
  }

  await req.db( 'Website' )
  .update( {
    updated_at: record.updated_at,
    developer_id: record.developer_id,
    url: record.url
  } )
  .where( {
    uuid: record.uuid
  } );

  record = await req.db
  .select(
    'Website.uuid AS id',
    'Website.created_at',
    'Website.updated_at',
    'Developer.uuid AS developer_id',
    'Website.url'
  )
  .from( 'Website' )
  .leftJoin( 'Developer', 'Website.developer_id', 'Developer.id' )
  .where( {
    'Website.uuid': record.uuid
  } )
  .first();

  res.json( record );  
} );

// Update partial
router.patch( '/:id', async ( req, res ) => {
  let record = {
    uuid: req.params.id,
    updated_at: new Date(),
    url: req.body.url
  };

  // SQLite does not support date objects
  // Store as string
  if( req.db.client.config.client === 'sqlite3' ) {
    record.updated_at = record.updated_at.toISOString();
  }

  await req.db( 'Website' )
  .update( {
    updated_at: record.updated_at,
    url: record.url
  } )
  .where( {
    uuid: record.uuid
  } );

  record = await req.db
  .select(
    'Website.uuid AS id',
    'Website.created_at',
    'Website.updated_at',
    'Developer.uuid AS developer_id',
    'Website.url'
  )
  .from( 'Website' )
  .leftJoin( 'Developer', 'Website.developer_id', 'Developer.id' )
  .where( {
    'Website.uuid': record.uuid
  } )
  .first();

  res.json( record );  
} );

// Delete
router.delete( '/:id', async ( req, res ) => {
  await req.db( 'Website' )
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
