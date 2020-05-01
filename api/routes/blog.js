const express = require( 'express' );
const uuidv4 = require( 'uuid' );

// Router
let router = express.Router();

// Test
router.get( '/test', ( req, res ) => {    
  res.json( {blog: 'Test'} );
} );

// Read single record by ID
router.get( '/:id', async ( req, res ) => {
  let record = await req.db
  .select( 
    'Blog.uuid AS id',
    'Blog.created_at',
    'Blog.updated_at',
    'Developer.uuid AS developer_id',
    'Blog.url'
  )
  .from( 'Blog' )
  .leftJoin( 'Developer', 'Blog.developer_id', 'Developer.id' )
  .where( {
    'Blog.uuid': req.params.id
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
    'Blog.uuid AS id',
    'Blog.created_at',
    'Blog.updated_at',
    'Developer.uuid AS developer_id',
    'Blog.url'
  )
  .from( 'Blog' )
  .leftJoin( 'Developer', 'Blog.developer_id', 'Developer.id' )
  .orderBy( 'Blog.updated_at' );

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

  let existing = null;

  if( req.query.hasOwnProperty( 'existing' ) ) {
    if( req.query.existing === 'true' ) {
      existing = await req.db
      .select( 
        'Blog.uuid AS id',
        'Blog.created_at',
        'Blog.updated_at',
        'Developer.uuid AS developer_id',
        'Blog.url'
      )
      .from( 'Blog' )
      .leftJoin( 'Developer', 'Blog.developer_id', 'Developer.id' )
      .where( {
        'Blog.url': record.url
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

    await req.db( 'Blog' )
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

  await req.db( 'Blog' )
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
    'Blog.uuid AS id',
    'Blog.created_at',
    'Blog.updated_at',
    'Developer.uuid AS developer_id',
    'Blog.url'
  )
  .from( 'Blog' )
  .leftJoin( 'Developer', 'Blog.developer_id', 'Developer.id' )
  .where( {
    'Blog.uuid': record.uuid
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

  await req.db( 'Blog' )
  .update( {
    updated_at: record.updated_at,
    url: record.url
  } )
  .where( {
    uuid: record.uuid
  } );

  record = await req.db
  .select(
    'Blog.uuid AS id',
    'Blog.created_at',
    'Blog.updated_at',
    'Developer.uuid AS developer_id',
    'Blog.url'
  )
  .from( 'Blog' )
  .leftJoin( 'Developer', 'Blog.developer_id', 'Developer.id' )
  .where( {
    'Blog.uuid': record.uuid
  } )
  .first();

  res.json( record );  
} );

// Delete
router.delete( '/:id', async ( req, res ) => {
  await req.db( 'Blog' )
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
