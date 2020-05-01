const express = require( 'express' );
const uuidv4 = require( 'uuid' );

// Router
let router = express.Router();

// Test
router.get( '/test', ( req, res ) => {    
  res.json( {media: 'Test'} );
} );

// Read single media by URL
router.get( '/url/:url', async ( req, res ) => {
  let buffer = new Buffer.from( req.params.url, 'base64' );
  let url = buffer.toString( 'utf8' );  

  let record = await req.db
  .select( 
    'uuid AS id',
    'created_at',
    'updated_at',
    'url',
    'keywords'
  )
  .from( 'Media' )
  .where( {
    url: url
  } )
  .first();

  if( record === undefined ) {
    record = null;
  } else {
    if( record.keywords === null ) {
      record.keywords = [];
    } else {
      record.keywords = record.keywords.split( ',' );
    }
  }

  res.json( record );
} );

// Read single media by ID
router.get( '/:id', async ( req, res ) => {
  let record = await req.db
  .select( 
    'uuid AS id',
    'created_at',
    'updated_at',
    'url',
    'keywords'
  )
  .from( 'Media' )
  .where( {
    uuid: req.params.id
  } )
  .first();

  if( record === undefined ) {
    record = null;
  } else {
    if( record.keywords === null ) {
      record.keywords = [];
    } else {
      record.keywords = record.keywords.split( ',' );
    }
  }

  res.json( record );
} );

// Read all media
router.get( '/', async ( req, res ) => {
  let records = await req.db
  .select( 
    'uuid AS id',
    'created_at',
    'updated_at',
    'url',
    'keywords'
  )
  .from( 'Media' )
  .orderBy( 'updated_at' );

  for( let r = 0; r < records.length; r++ ) {
    if( records[r].keywords === null ) {
      records[r].keywords = [];
    } else {
      records[r].keywords = records[r].keywords.split( ',' );
    }
  }

  res.json( records );
} );

// Create
router.post( '/', async ( req, res ) => {
  let record = {
    id: null,
    uuid: uuidv4(),
    created_at: new Date(),
    updated_at: new Date(),
    url: req.body.url,
    keywords: req.body.keywords
  };

  if( record.keywords.length === 0 ) {
    record.keywords = null;
  } else {
    record.keywords = record.keywords.join( ',' );
  }

  await req.db( 'Media' )
  .insert( {
    id: record.id,
    uuid: record.uuid,
    created_at: record.created_at,
    updated_at: record.updated_at,
    url: record.url,
    keywords: record.keywords
  } );

  if( record.keywords === null ) {
    record.keywords = [];
  } else {
    record.keywords = record.keywords.split( ',' );
  }

  res.json( {
    id: record.uuid,
    created_at: record.created_at,
    updated_at: record.updated_at,
    url: record.url,
    keywords: record.keywords
  } );
} );

// Update
router.put( '/:id', async ( req, res ) => {
  let record = {
    uuid: req.params.id,
    updated_at: new Date(),
    url: req.body.url,
    keywords: req.body.keywords
  };

  if( record.keywords.length === 0 ) {
    record.keywords = null;
  } else {
    record.keywords = record.keywords.join( ',' );
  }

  await req.db( 'Media' )
  .update( {
    updated_at: record.updated_at,
    url: record.url,
    keywords: record.keywords
  } )
  .where( {
    uuid: record.uuid
  } );

  record = await req.db
  .select(
    'uuid AS id',
    'created_at',
    'updated_at',
    'url',
    'keywords'
  )
  .from( 'Media' )
  .where( {
    uuid: record.uuid
  } )
  .first();

  if( record.keywords === null ) {
    record.keywords = [];
  } else {
    record.keywords = record.keywords.split( ',' );
  }

  res.json( {
    id: record.id,
    created_at: record.created_at,
    updated_at: record.updated_at,
    url: record.url,
    keywords: record.keywords
  } );  
} );

// Delete
router.delete( '/:id', async ( req, res ) => {
  await req.db( 'Media' )
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
