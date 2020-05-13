const express = require( 'express' );
const uuidv4 = require( 'uuid' );

// Router
let router = express.Router();

// Test
router.get( '/test', ( req, res ) => {    
  res.json( {dev: 'Test'} );
} );

// Read single record by ID
router.get( '/:id', async ( req, res ) => {
  let record = await req.db
  .select( 
    'Dev.uuid AS id',
    'Dev.created_at',
    'Dev.updated_at',
    'Developer.uuid AS developer_id',
    'Dev.user_name'
  )
  .from( 'Dev' )
  .leftJoin( 'Developer', 'Dev.developer_id', 'Developer.id' )
  .where( {
    'Dev.uuid': req.params.id
  } )
  .first();

  if( record === undefined ) {
    record = null;
  }

  res.json( record );
} );

// Read all records
router.get( '/', async ( req, res ) => {
  let records = await req.db
  .select(
    'Dev.uuid AS id',
    'Dev.created_at',
    'Dev.updated_at',
    'Developer.uuid AS developer_id',
    'Dev.user_name'
  )
  .from( 'Dev' )
  .leftJoin( 'Developer', 'Dev.developer_id', 'Developer.id' )
  .orderBy( 'Dev.updated_at' );

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
    user_name: req.body.user_name
  };

  let existing = null;

  if( req.query.hasOwnProperty( 'existing' ) ) {
    if( req.query.existing === 'true' ) {
      existing = await req.db
      .select( 
        'Dev.uuid AS id',
        'Dev.created_at',
        'Dev.updated_at',
        'Developer.uuid AS developer_id',
        'Dev.user_name'
      )
      .from( 'Dev' )
      .leftJoin( 'Developer', 'Dev.developer_id', 'Developer.id' )
      .where( {
        'Dev.user_name': record.user_name
      } )
      .first();

      if( existing === undefined ) {
        existing = null;
      }
    }
  }

  if( existing === null ) {
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

    await req.db( 'Dev' )
    .insert( {
      id: record.id,
      uuid: record.uuid,
      created_at: record.created_at,
      updated_at: record.updated_at,
      developer_id: record.developer_id,
      user_name: record.user_name
    } );
    
    record = {
      id: record.uuid,
      created_at: record.created_at,
      updated_at: record.updated_at,
      developer_id: record.developer_uuid,
      user_name: record.user_name
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
    user_name: req.body.user_name
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

  await req.db( 'Dev' )
  .update( {
    updated_at: record.updated_at,
    developer_id: record.developer_id,
    user_name: record.user_name
  } )
  .where( {
    uuid: record.uuid
  } );

  record = await req.db
  .select(
    'Dev.uuid AS id',
    'Dev.created_at',
    'Dev.updated_at',
    'Developer.uuid AS developer_id',
    'Dev.user_name'
  )
  .from( 'Dev' )
  .leftJoin( 'Developer', 'Dev.developer_id', 'Developer.id' )
  .where( {
    'Dev.uuid': record.uuid
  } )
  .first();

  res.json( record );  
} );

// Update partial
router.patch( '/:id', async ( req, res ) => {
  let record = {
    uuid: req.params.id,
    updated_at: new Date(),
    user_name: req.body.user_name
  };

  // SQLite does not support date objects
  // Store as string
  if( req.db.client.config.client === 'sqlite3' ) {
    record.updated_at = record.updated_at.toISOString();
  }

  await req.db( 'Dev' )
  .update( {
    updated_at: record.updated_at,
    user_name: record.user_name
  } )
  .where( {
    uuid: record.uuid
  } );

  record = await req.db
  .select(
    'Dev.uuid AS id',
    'Dev.created_at',
    'Dev.updated_at',
    'Developer.uuid AS developer_id',
    'Dev.user_name'
  )
  .from( 'Dev' )
  .leftJoin( 'Developer', 'Dev.developer_id', 'Developer.id' )
  .where( {
    'Dev.uuid': record.uuid
  } )
  .first();

  res.json( record );  
} );

// Delete
router.delete( '/:id', async ( req, res ) => {
  await req.db( 'Dev' )
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
