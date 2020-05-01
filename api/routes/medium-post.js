const express = require( 'express' );
const uuidv4 = require( 'uuid' );

// Router
let router = express.Router();

// Test
router.get( '/test', ( req, res ) => {    
  res.json( {medium_post: 'Test'} );
} );

// Read single post by ID
router.get( '/:id', async ( req, res ) => {
  let record = await req.db
  .select(
    'MediumPost.uuid AS id',
    'MediumPost.created_at',
    'MediumPost.updated_at',
    'Medium.uuid AS medium_id',
    'MediumPost.published_at',
    'MediumPost.guid',
    'MediumPost.link',
    'MediumPost.title',
    'MediumPost.summary',
    'MediumPost.claps',
    'MediumPost.category',
    'MediumPost.keywords',
    'MediumPost.concepts',
    'MediumPost.entities'
  )
  .from( 'MediumPost' )
  .leftJoin( 'Medium', 'MediumPost.medium_id', 'Medium.id' )
  .where( {
    'MediumPost.uuid': req.params.id
  } )
  .first();

  if( record === undefined ) {
    record = null;
  } else {
    if( record.category === null ) {
      record.category = [];
    } else {
      record.category = record.category.split( ',' );
    }

    if( record.keywords === null ) {
      record.keywords = [];
    } else {
      record.keywords = record.keywords.split( ',' );
    }
    
    if( record.concepts === null ) {
      record.concepts = [];
    } else {
      record.concepts = record.concepts.split( ',' );
    }
    
    if( record.entities === null ) {
      record.entities = [];
    } else {
      record.entities = record.entities.split( ',' );
    }    
  }

  res.json( record );
} );

// Read all media for specific post
router.get( '/:id/media', async ( req, res ) => {
  let records = await req.db
  .select(
    'Media.uuid AS id',
    'Media.created_at',
    'Media.updated_at',
    'Media.url',
    'Media.keywords'
  )
  .from( 'Media' )
  .leftJoin( 'MediumPostMedia', 'Media.id', 'MediumPostMedia.media_id' )
  .leftJoin( 'MediumPost', 'MediumPostMedia.post_id', 'MediumPost.id' )
  .where( {
    'MediumPost.uuid': req.params.id
  } );

  for( let r = 0; r < records.length; r++ ) {
    if( records[r].keywords === null ) {
      records[r].keywords = [];
    } else {
      records[r].keywords = records[r].keywords.split( ',' );
    }
  }

  res.json( records );
} );

// Read single post by GUID
// GUIDs are often URLs
// Base64 encoded
router.get( '/guid/:id', async ( req, res ) => {
  let buffer = new Buffer.from( req.params.id, 'base64' );
  let guid = buffer.toString( 'utf8' );  

  let record = await req.db
  .select(
    'MediumPost.uuid AS id',
    'MediumPost.created_at',
    'MediumPost.updated_at',
    'Medium.uuid AS medium_id',
    'MediumPost.published_at',
    'MediumPost.guid',
    'MediumPost.link',
    'MediumPost.title',
    'MediumPost.summary',
    'MediumPost.claps',
    'MediumPost.category',
    'MediumPost.keywords',
    'MediumPost.concepts',
    'MediumPost.entities'
  )
  .from( 'MediumPost' )
  .leftJoin( 'Medium', 'MediumPost.medium_id', 'Medium.id' )
  .where( {
    'MediumPost.guid': guid
  } )
  .first();

  if( record === undefined ) {
    record = null;
  } else {
    if( record.category === null ) {
      record.category = [];
    } else {
      record.category = record.category.split( ',' );
    }

    if( record.keywords === null ) {
      record.keywords = [];
    } else {
      record.keywords = record.keywords.split( ',' );
    }
    
    if( record.concepts === null ) {
      record.concepts = [];
    } else {
      record.concepts = record.concepts.split( ',' );
    }
    
    if( record.entities === null ) {
      record.entities = [];
    } else {
      record.entities = record.entities.split( ',' );
    }    
  }

  res.json( record );
} );

// Read all posts
router.get( '/', async ( req, res ) => {
  let records = await req.db
  .select(
    'MediumPost.uuid AS id',
    'MediumPost.created_at',
    'MediumPost.updated_at',
    'Medium.uuid AS medium_id',
    'MediumPost.published_at',
    'MediumPost.guid',
    'MediumPost.link',
    'MediumPost.title',
    'MediumPost.summary',
    'MediumPost.claps',
    'MediumPost.category',
    'MediumPost.keywords',
    'MediumPost.concepts',
    'MediumPost.entities'
  )
  .from( 'MediumPost' )
  .leftJoin( 'Medium', 'MediumPost.medium_id', 'Medium.id' )
  .orderBy( 'MediumPost.published_at' );

  for( let r = 0; r < records.length; r++ ) {
    if( records[r].category === null ) {
      records[r].category = [];
    } else {
      records[r].category = records[r].category.split( ',' );
    }

    if( records[r].keywords === null ) {
      records[r].keywords = [];
    } else {
      records[r].keywords = records[r].keywords.split( ',' );
    }
    
    if( records[r].concepts === null ) {
      records[r].concepts = [];
    } else {
      records[r].concepts = records[r].concepts.split( ',' );
    }
    
    if( records[r].entities === null ) {
      records[r].entities = [];
    } else {
      records[r].entities = records[r].entities.split( ',' );
    }    
  }

  res.json( records );
} );

// Associate media with post
router.post( '/:id/media', async ( req, res ) => {
  let record = {
    id: null,
    uuid: uuidv4(),
    created_at: new Date(),
    updated_at: new Date(),
    post_uuid: req.params.id,
    media_uuid: req.body.media_id
  };

  let post = await req.db
  .select( 'id' )
  .from( 'MediumPost' )
  .where( {
    'MediumPost.uuid': record.post_uuid
  } )
  .first();
  record.post_id = post.id;  

  let media = await req.db
  .select( 'id' )
  .from( 'Media' )
  .where( {
    'Media.uuid': record.media_uuid
  } )
  .first();
  record.media_id = media.id;    

  await req.db( 'MediumPostMedia' )
  .insert( {
    id: record.id,
    uuid: record.uuid,
    created_at: record.created_at,
    updated_at: record.updated_at,
    post_id: record.post_id,
    media_id: record.media_id
  } );

  res.json( {
    id: record.uuid,
    created_at: record.created_at,
    updated_at: record.updated_at,
    post_id: record.post_uuid,
    media_id: record.media_uuid
  } );  
} );

// Create
router.post( '/', async ( req, res ) => {
  let record = {
    id: null,
    uuid: uuidv4(),
    created_at: new Date(),
    updated_at: new Date(),
    medium_uuid: req.body.medium_id,
    published_at: new Date( req.body.published_at ),
    guid: req.body.guid,
    link: req.body.link,
    title: req.body.title,
    summary: req.body.summary,
    claps: req.body.claps,
    category: req.body.category,
    keywords: req.body.keywords,
    concepts: req.body.concepts,
    entities: req.body.entities
  };

  if( record.category.length === 0 ) {
    record.category = null;
  } else {
    record.category = record.category.join( ',' );
  }

  if( record.keywords.length === 0 ) {
    record.keywords = null;
  } else {
    record.keywords = record.keywords.join( ',' );
  }    

  if( record.concepts.length === 0 ) {
    record.concepts = null;
  } else {
    record.concepts = record.concepts.join( ',' );
  }    
  
  if( record.entities.length === 0 ) {
    record.entities = null;
  } else {
    record.entities = record.entities.join( ',' );
  }    

  let medium = await req.db
  .select( 'id' )
  .from( 'Medium' )
  .where( {
    uuid: record.medium_uuid
  } )
  .first();
  record.medium_id = medium.id;

  // SQLite does not support date objects
  // Store as string
  if( req.db.client.config.client === 'sqlite3' ) {
    record.created_at = record.created_at.toISOString();
    record.updated_at = record.updated_at.toISOString();
    record.published_at = record.published_at.toISOString();
  }  

  await req.db( 'MediumPost' )
  .insert( {    
    id: record.id,
    uuid: record.uuid,
    created_at: record.created_at,
    updated_at: record.updated_at,
    medium_id: record.medium_id,
    published_at: record.published_at,
    guid: record.guid,
    link: record.link,
    title: record.title,
    summary: record.summary,
    claps: record.claps,
    category: record.category,
    keywords: record.keywords,
    concepts: record.concepts,
    entities: record.entities
  } );

  if( record.category === null ) {
    record.category = [];
  } else {
    record.category = record.category.split( ',' );
  }

  if( record.keywords === null ) {
    record.keywords = [];
  } else {    
    record.keywords = record.keywords.split( ',' );
  }  

  if( record.concepts === null ) {
    record.concepts = [];
  } else {    
    record.concepts = record.concepts.split( ',' );
  }

  if( record.entities === null ) {
      record.entities = [];
  } else {    
    record.entities = record.entities.split( ',' );
  }  

  res.json( {
    id: record.uuid,
    created_at: record.created_at,
    updated_at: record.updated_at,
    medium_id: record.medium_uuid,
    published_at: record.published_at,
    guid: record.guid,
    link: record.link,
    title: record.title,
    summary: record.summary,
    claps: record.claps,
    category: record.category,
    keywords: record.keywords,
    concepts: record.concepts,
    entities: record.entities
  } );
} );

// Update
router.put( '/:id', async ( req, res ) => {
  let record = {
    uuid: req.params.id,
    updated_at: new Date(),
    medium_uuid: req.body.medium_id,
    published_at: new Date( req.body.published_at ),
    guid: req.body.guid,
    link: req.body.link,
    title: req.body.title,
    summary: req.body.summary,
    claps: req.body.claps,
    category: req.body.category,
    keywords: req.body.keywords,
    concepts: req.body.concepts,
    entities: req.body.entities    
  };

  if( record.category.length === 0 ) {
    record.category = null;
  } else {
    record.category = record.category.join( ',' );
  }

  if( record.keywords.length === 0 ) {
    record.keywords = null;
  } else {
    record.keywords = record.keywords.join( ',' );
  }    

  if( record.concepts.length === 0 ) {
    record.concepts = null;
  } else {
    record.concepts = record.concepts.join( ',' );
  }    
  
  if( record.entities.length === 0 ) {
    record.entities = null;
  } else {
    record.entities = record.entities.join( ',' );
  }    

  let medium = await req.db
  .select( 'id' )
  .from( 'Medium' )
  .where( {
    uuid: record.medium_uuid
  } )
  .first();
  record.medium_id = medium.id;

  // SQLite does not support date objects
  // Store as string
  if( req.db.client.config.client === 'sqlite3' ) {
    record.updated_at = record.updated_at.toISOString();
    record.published_at = record.published_at.toISOString();
  }   

  await req.db( 'MediumPost')
  .update( {
    updated_at: record.updated_at,
    medium_id: record.medium_id,
    published_at: record.published_at,
    guid: record.guid,
    link: record.link,
    title: record.title,
    summary: record.summary,
    claps: record.claps,
    category: record.category,
    keywords: record.keywords,
    concepts: record.concepts,
    entities: record.entities
  } )
  .where( {
    uuid: record.uuid
  } );

  record = await req.db
  .select(
    'MediumPost.uuid AS id',
    'MediumPost.created_at',
    'MediumPost.updated_at',
    'Medium.uuid AS medium_id',
    'MediumPost.published_at',
    'MediumPost.guid',
    'MediumPost.link',
    'MediumPost.title',
    'MediumPost.summary',
    'MediumPost.claps',
    'MediumPost.category',
    'MediumPost.keywords',
    'MediumPost.concepts',
    'MediumPost.entities'
  )
  .from( 'MediumPost' )
  .leftJoin( 'Medium', 'MediumPost.medium_id', 'Medium.id' )
  .where( {
    'MediumPost.uuid': record.uuid
  } )
  .first();

  if( record.category === null ) {
    record.category = [];
  } else {
    record.category = record.category.split( ',' );
  }

  if( record.keywords === null ) {
    record.keywords = [];
  } else {    
    record.keywords = record.keywords.split( ',' );
  }  

  if( record.concepts === null ) {
    record.concepts = [];
  } else {    
    record.concepts = record.concepts.split( ',' );
  }

  if( record.entities === null ) {
      record.entities = [];
  } else {    
    record.entities = record.entities.split( ',' );
  }

  res.json( record );  
} );

// Remove media associated with post
router.delete( '/:post/media/:media', async ( req, res ) => {
  let post = await req.db
  .select( 'id' )
  .from( 'MediumPost' )
  .where( {
    uuid: req.params.status
  } )
  .first();

  let media = await req.db
  .select( 'id' )
  .from( 'MediumPostMedia' )
  .where( {
    uuid: req.params.media
  } )
  .first();  

  await req.db( 'MediumPostMedia' )
  .where( {
    post_id: post.id,
    media_id: media.id
  } )
  .del();

  res.json( {
    post_id: req.params.post,
    media_id: req.params.media
  } );
} );

// Delete
router.delete( '/:id', async ( req, res ) => {
  await req.db( 'MediumPost' )
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
