const express = require( 'express' );
const uuidv4 = require( 'uuid' );

// Router
let router = express.Router();

// Test
router.get( '/test', ( req, res ) => {    
  res.json( {linkedin: 'Test'} );
} );

// Read single record by ID
router.get( '/:id', async ( req, res ) => {
  let record = await req.db
  .select( 
    'LinkedIn.uuid AS id',
    'LinkedIn.created_at',
    'LinkedIn.updated_at',
    'Developer.uuid AS developer_id',
    'LinkedIn.profile'
  )
  .from( 'LinkedIn' )
  .leftJoin( 'Developer', 'LinkedIn.developer_id', 'Developer.id' )
  .where( {
    'LinkedIn.uuid': req.params.id
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
    'LinkedIn.uuid AS id',
    'LinkedIn.created_at',
    'LinkedIn.updated_at',
    'Developer.uuid AS developer_id',
    'LinkedIn.profile'
  )
  .from( 'LinkedIn' )
  .leftJoin( 'Developer', 'LinkedIn.developer_id', 'Developer.id' )
  .orderBy( 'LinkedIn.updated_at' );

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
    profile: req.body.profile
  };

  let existing = null;

  if( req.query.hasOwnProperty( 'existing' ) ) {
    if( req.query.existing === 'true' ) {
      existing = await req.db
      .select( 
        'LinkedIn.uuid AS id',
        'LinkedIn.created_at',
        'LinkedIn.updated_at',
        'Developer.uuid AS developer_id',
        'LinkedIn.profile'
      )
      .from( 'LinkedIn' )
      .leftJoin( 'Developer', 'LinkedIn.developer_id', 'Developer.id' )
      .where( {
        'LinkedIn.profile': record.profile
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

    await req.db( 'LinkedIn' )
    .insert( {
      id: record.id,
      uuid: record.uuid,
      created_at: record.created_at,
      updated_at: record.updated_at,
      developer_id: record.developer_id,
      profile: record.profile
    } );
    
    record = {
      id: record.uuid,
      created_at: record.created_at,
      updated_at: record.updated_at,
      developer_id: record.developer_uuid,
      profile: record.profile
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
    profile: req.body.profile
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

  await req.db( 'LinkedIn' )
  .update( {
    updated_at: record.updated_at,
    developer_id: record.developer_id,
    profile: record.profile
  } )
  .where( {
    uuid: record.uuid
  } );

  record = await req.db
  .select(
    'LinkedIn.uuid AS id',
    'LinkedIn.created_at',
    'LinkedIn.updated_at',
    'Developer.uuid AS developer_id',
    'LinkedIn.profile'
  )
  .from( 'LinkedIn' )
  .leftJoin( 'Developer', 'LinkedIn.developer_id', 'Developer.id' )
  .where( {
    'LinkedIn.uuid': record.uuid
  } )
  .first();

  res.json( record );  
} );

router.patch( '/:id', async ( req, res ) => {
  let record = {
    uuid: req.params.id,
    updated_at: new Date(),
    profile: req.body.profile
  };

  // SQLite does not support date objects
  // Store as string
  if( req.db.client.config.client === 'sqlite3' ) {
    record.updated_at = record.updated_at.toISOString();
  }

  await req.db( 'LinkedIn' )
  .update( {
    updated_at: record.updated_at,
    profile: record.profile
  } )
  .where( {
    uuid: record.uuid
  } );

  record = await req.db
  .select(
    'LinkedIn.uuid AS id',
    'LinkedIn.created_at',
    'LinkedIn.updated_at',
    'Developer.uuid AS developer_id',
    'LinkedIn.profile'
  )
  .from( 'LinkedIn' )
  .leftJoin( 'Developer', 'LinkedIn.developer_id', 'Developer.id' )
  .where( {
    'LinkedIn.uuid': record.uuid
  } )
  .first();

  res.json( record );    
} );

// Delete
router.delete( '/:id', async ( req, res ) => {
  await req.db( 'LinkedIn' )
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
