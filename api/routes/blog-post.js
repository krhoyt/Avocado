const express = require( 'express' );
const uuidv4 = require( 'uuid' );

// Router
let router = express.Router();

// Test
router.get( '/test', ( req, res ) => {    
  res.json( {blog_post: 'Test'} );
} );

// Read single record by ID
router.get( '/:id', async ( req, res ) => {
  let record = await req.db
  .select(
    'BlogPost.uuid AS id',
    'BlogPost.created_at',
    'BlogPost.updated_at',
    'Blog.uuid AS blog_id',
    'BlogPost.published_at',
    'BlogPost.guid',
    'BlogPost.link',
    'BlogPost.title',
    'BlogPost.summary',
    'BlogPost.category',
    'BlogPost.keywords',
    'BlogPost.concepts',
    'BlogPost.entities'
  )
  .from( 'BlogPost' )
  .leftJoin( 'Blog', 'BlogPost.blog_id', 'Blog.id' )
  .where( {
    'BlogPost.uuid': req.params.id
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
  .leftJoin( 'BlogPostMedia', 'Media.id', 'BlogPostMedia.media_id' )
  .leftJoin( 'BlogPost', 'BlogPostMedia.post_id', 'BlogPost.id' )
  .where( {
    'BlogPost.uuid': req.params.id
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

// Read single record by GUID
// GUIDs are often URLs
// Base64 encoded
router.get( '/guid/:id', async ( req, res ) => {
  let buffer = new Buffer.from( req.params.id, 'base64' );
  let guid = buffer.toString( 'utf8' );  

  let record = await req.db
  .select( 
    'BlogPost.uuid AS id',
    'BlogPost.created_at',
    'BlogPost.updated_at',
    'Blog.uuid AS blog_id',
    'BlogPost.published_at',
    'BlogPost.guid',
    'BlogPost.link',
    'BlogPost.title',
    'BlogPost.summary',
    'BlogPost.category',
    'BlogPost.keywords',
    'BlogPost.concepts',
    'BlogPost.entities'
  )
  .from( 'BlogPost' )
  .leftJoin( 'Blog', 'BlogPost.blog_id', 'Blog.id' )
  .where( {
    'BlogPost.guid': guid
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
    'BlogPost.uuid AS id',
    'BlogPost.created_at',
    'BlogPost.updated_at',
    'Blog.uuid AS blog_id',
    'BlogPost.published_at',
    'BlogPost.guid',
    'BlogPost.link',
    'BlogPost.title',
    'BlogPost.summary',
    'BlogPost.category',
    'BlogPost.keywords',
    'BlogPost.concepts',
    'BlogPost.entities'
  )
  .from( 'BlogPost' )
  .leftJoin( 'Blog', 'BlogPost.blog_id', 'Blog.id' )
  .orderBy( 'BlogPost.published_at' )
  .modify( ( builder ) => {
    if( req.query.hasOwnProperty( 'days' ) ) {
      let days = parseInt( req.query.days );
      
      let start = new Date();
      start.setDate( start.getDate() - days );

      builder.where( 'BlogPost.published_at', '>', start );
    }
  } );

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
  .from( 'BlogPost' )
  .where( {
    'BlogPost.uuid': record.post_uuid
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

  await req.db( 'BlogPostMedia' )
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
    blog_uuid: req.body.blog_id,
    published_at: new Date( req.body.published_at ),
    guid: req.body.guid,
    link: req.body.link,
    title: req.body.title,
    summary: req.body.summary,
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

  let blog = await req.db
  .select( 'id' )
  .from( 'Blog' )
  .where( {
    uuid: record.blog_uuid
  } )
  .first();
  record.blog_id = blog.id;

  // SQLite does not support date objects
  // Store as string
  if( req.db.client.config.client === 'sqlite3' ) {
    record.created_at = record.created_at.toISOString();
    record.updated_at = record.updated_at.toISOString();
    record.published_at = record.published_at.toISOString();
  }  

  await req.db( 'BlogPost' )
  .insert( {
    id: record.id,
    uuid: record.uuid,
    created_at: record.created_at,
    updated_at: record.updated_at,
    blog_id: record.blog_id,
    published_at: record.published_at,
    guid: record.guid,
    link: record.link,
    title: record.title,
    summary: record.summary,
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
    blog_id: record.blog_uuid,
    published_at: record.published_at,
    guid: record.guid,
    link: record.link,
    title: record.title,
    summary: record.summary,
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
    blog_uuid: req.body.blog_id,
    published_at: new Date( req.body.published_at ),
    guid: req.body.guid,
    link: req.body.link,
    title: req.body.title,
    summary: req.body.summary,
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

  let blog = await req.db
  .select( 'id' )
  .from( 'Blog' )
  .where( {
    uuid: record.blog_uuid
  } )
  .first();
  record.blog_id = blog.id;

  // SQLite does not support date objects
  // Store as string
  if( req.db.client.config.client === 'sqlite3' ) {
    record.updated_at = record.updated_at.toISOString();
    record.published_at = record.published_at.toISOString();
  }  

  await req.db( 'BlogPost')
  .update( {
    updated_at: record.updated_at,
    blog_id: record.blog_id,
    published_at: record.published_at,
    guid: record.guid,
    link: record.link,
    title: record.title,
    summary: record.summary,
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
    'BlogPost.uuid AS id',
    'BlogPost.created_at',
    'BlogPost.updated_at',
    'Blog.uuid AS blog_id',
    'BlogPost.published_at',
    'BlogPost.guid',
    'BlogPost.link',
    'BlogPost.title',
    'BlogPost.summary',
    'BlogPost.category',
    'BlogPost.keywords',
    'BlogPost.concepts',
    'BlogPost.entities'
  )
  .from( 'BlogPost' )
  .leftJoin( 'Blog', 'BlogPost.blog_id', 'Blog.id' )
  .where( {
    'BlogPost.uuid': record.uuid
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
  .from( 'BlogPost' )
  .where( {
    uuid: req.params.status
  } )
  .first();

  let media = await req.db
  .select( 'id' )
  .from( 'BlogPostMedia' )
  .where( {
    uuid: req.params.media
  } )
  .first();  

  await req.db( 'BlogPostMedia' )
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
  await req.db( 'BlogPost' )
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
