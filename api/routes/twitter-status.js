const express = require( 'express' );
const uuidv4 = require( 'uuid' );

// Router
let router = express.Router();

// Test
router.get( '/test', ( req, res ) => {    
  res.json( {twitter_status: 'Test'} );
} );

// Read single record by ID
router.get( '/:id', async ( req, res ) => {
  let record = await req.db
  .select(
    'TwitterStatus.uuid AS id',
    'TwitterStatus.created_at',
    'TwitterStatus.updated_at',
    'Twitter.uuid AS twitter_id',
    'TwitterStatus.published_at',
    'TwitterStatus.status',
    'TwitterStatus.link',
    'TwitterStatus.full_text',
    'TwitterStatus.favorite',
    'TwitterStatus.retweet',
    'TwitterStatus.hashtags',
    'TwitterStatus.mentions',
    'TwitterStatus.urls'
  )
  .from( 'TwitterStatus' )
  .leftJoin( 'Twitter', 'TwitterStatus.twitter_id', 'Twitter.id' )
  .where( {
    'TwitterStatus.uuid': req.params.id
  } )
  .first();

  if( record === undefined ) {
    record = null;
  } else {
    if( record.hashtags === null ) {
      record.hashtags = [];
    } else {
      record.hashtags = record.hashtags.split( ',' );
    }

    if( record.mentions === null ) {
      record.mentions = [];
    } else {
      record.mentions = record.mentions.split( ',' );
    }

    if( record.urls === null ) {
      record.urls = [];
    } else {
      record.urls = record.urls.split( ',' );
    }    
  }

  res.json( record );
} );

// Read all media for specific status
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
  .leftJoin( 'TwitterStatus', 'Media.id', 'TwitterStatus.media_id' )
  .leftJoin( 'TwitterStatusMedia', 'TwitterStatusMedia.status_id', 'TwitterStatus.id' )
  .where( {
    'TwitterStatus.uuid': req.params.id 
  } ); 

  /*
  let medias = req.db.prepare( `
    SELECT
      Media.uuid AS "id",
      Media.created_at,
      Media.updated_at,
      Media.url,
      Media.keywords
    FROM 
      Media,
      TwitterStatus,
      TwitterStatusMedia
    WHERE 
      Media.id = TwitterStatusMedia.media_id AND
      TwitterStatusMedia.status_id = TwitterStatus.id AND
      TwitterStatus.uuid = ?
  ` )
  .all( 
    req.params.id 
  );
  */

  for( let r = 0; r < records.length; r++ ) {
    if( records[r].keywords === null ) {
      records[r].keywords = [];
    } else {
      records[r].keywords = records[r].keywords.split( ',' );
    }
  }

  res.json( records );
} );

// Read single status by Twitter's status ID
router.get( '/id/:id', async ( req, res ) => {
  let record = await req.db
  .select( 
    'TwitterStatus.uuid AS id',
    'TwitterStatus.created_at',
    'TwitterStatus.updated_at',
    'Twitter.uuid AS twitter_id',
    'TwitterStatus.published_at',
    'TwitterStatus.status',
    'TwitterStatus.link',
    'TwitterStatus.full_text',
    'TwitterStatus.favorite',
    'TwitterStatus.retweet',
    'TwitterStatus.hashtags',
    'TwitterStatus.mentions',
    'TwitterStatus.urls'
  )
  .from( 'TwitterStatus' )
  .leftJoin( 'Twitter', 'TwitterStatus.twitter_id', 'Twitter.id' )
  .where( {
    'TwitterStatus.status': req.params.id
   } )
  .first();

  if( record === undefined ) {
    record = null;
  } else {
    if( record.hashtags === null ) {
      record.hashtags = [];
    } else {
      record.hashtags = record.hashtags.split( ',' );
    }

    if( record.mentions === null ) {
      record.mentions = [];
    } else {
      record.mentions = record.mentions.split( ',' );
    }

    if( record.urls === null ) {
      record.urls = [];
    } else {
      record.urls = record.urls.split( ',' );
    }    
  }

  res.json( record );
} );

// Read all status updates
router.get( '/', async ( req, res ) => {
  let records = await req.db
  .select( 
    'TwitterStatus.uuid AS id',
    'TwitterStatus.created_at',
    'TwitterStatus.updated_at',
    'Twitter.uuid AS twitter_id',
    'TwitterStatus.published_at',
    'TwitterStatus.status',
    'TwitterStatus.link',
    'TwitterStatus.full_text',
    'TwitterStatus.favorite',
    'TwitterStatus.retweet',
    'TwitterStatus.hashtags',
    'TwitterStatus.mentions',
    'TwitterStatus.urls'
  )
  .from( 'TwitterStatus' )
  .leftJoin( 'Twitter', 'TwitterStatus.twitter_id', 'Twitter.id' )
  .orderBy( 'TwitterStatus.published_at' );

  for( let r = 0; r < records.length; r++ ) {
    if( records[r].hashtags === null ) {
      records[r].hashtags = [];
    } else {
      records[r].hashtags = records[r].hashtags.split( ',' );
    }

    if( records[r].mentions === null ) {
      records[r].mentions = [];
    } else {
      records[r].mentions = records[r].mentions.split( ',' );
    }

    if( records[r].urls === null ) {
      records[r].urls = [];
    } else {
      records[r].urls = records[r].urls.split( ',' );
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
    status_uuid: req.params.id,
    media_uuid: req.body.media_id
  };

  let status = await req.db
  .select( 'id' )
  .from( 'TwitterStatus' )
  .where( {
    uuid: record.status_uuid
  } )
  .first();
  record.status_id = status.id;

  let media = await req.db
  .select( 'id' )
  .from( 'Media' )
  .where( {
    uuid: record.media_uuid
  } )
  .first();
  record.media_id = media.id;  

  await req.db( 'TwitterStatusMedia' )
  .insert( {
    id: record.id,
    uuid: record.uuid,
    created_at: record.created_at,
    updated_at: record.updated_at,
    status_id: record.status_id,
    media_id: record.media_id
  } );

  res.json( {
    id: record.uuid,
    created_at: record.created_at,
    updated_at: record.updated_at,
    status_id: record.status_uuid,
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
    twitter_uuid: req.body.twitter_id,
    published_at: new Date( req.body.published_at ),
    status: req.body.status,
    link: req.body.link,
    full_text: req.body.full_text,
    favorite: req.body.favorite,
    retweet: req.body.retweet,
    hashtags: req.body.hashtags,
    mentions: req.body.mentions,
    urls: req.body.urls
  };

  if( record.hashtags.length === 0 ) {
    record.hashtags = null;
  } else {
    record.hashtags = record.hashtags.join( ',' );
  }

  if( record.mentions.length === 0 ) {
    record.mentions = null;
  } else {
    record.mentions = record.mentions.join( ',' );
  }    

  if( record.urls.length === 0 ) {
    record.urls = null;
  } else {
    record.urls = record.urls.join( ',' );
  }      

  let twitter = await req.db
  .select( 'id' )
  .from( 'Twitter' )
  .where( {
    uuid: record.twitter_uuid
  } )
  .first();
  record.twitter_id = twitter.id;

  // SQLite does not support date objects
  // Store as string
  if( req.db.client.config.client === 'sqlite3' ) {
    record.created_at = record.created_at.toISOString();
    record.updated_at = record.updated_at.toISOString();
    record.published_at = record.published_at.toISOString();
  }  

  await req.db( 'TwitterStatus' )
  .insert( {
    id: record.id,
    uuid: record.uuid,
    created_at: record.created_at,
    updated_at: record.updated_at,
    twitter_id: record.twitter_id,
    published_at: record.published_at,
    status: record.status,
    link: record.link,
    full_text: record.full_text,
    favorite: record.favorite,
    retweet: record.retweet,
    hashtags: record.hashtags,
    mentions: record.mentions,
    urls: record.urls
  } );

  if( record.hashtags === null ) {
    record.hashtags = [];
  } else {
    record.hashtags = record.hashtags.split( ',' );
  }

  if( record.mentions === null ) {
    record.mentions = [];
  } else {    
    record.mentions = record.mentions.split( ',' );
  }  

  if( record.urls === null ) {
    record.urls = [];
  } else {    
    record.urls = record.urls.split( ',' );
  }    

  res.json( {
    id: record.uuid,
    created_at: record.created_at,
    updated_at: record.updated_at,
    twitter_id: record.twitter_uuid,
    published_at: record.published_at,
    status: record.status,
    link: record.link,
    full_text: record.full_text,
    favorite: record.favorite,
    retweet: record.retweet,
    hashtags: record.hashtags,
    mentions: record.mentions,
    urls: record.urls
  } );
} );

// Update
router.put( '/:id', async ( req, res ) => {
  let record = {
    uuid: req.params.id,
    updated_at: new Date(),
    twitter_uuid: req.body.twitter_id,
    published_at: new Date( req.body.published_at ),
    status: req.body.status,
    link: req.body.link,
    full_text: req.body.full_text,
    favorite: req.body.favorite,
    retweet: req.body.retweet,
    hashtags: req.body.hashtags,
    mentions: req.body.mentions,
    urls: req.body.urls
  };

  if( record.hashtags.length === 0 ) {
    record.hashtags = null;
  } else {
    record.hashtags = record.hashtags.join( ',' );
  }

  if( record.mentions.length === 0 ) {
    record.mentions = null;
  } else {
    record.mentions = record.mentions.join( ',' );
  }    

  if( record.urls.length === 0 ) {
    record.urls = null;
  } else {
    record.urls = record.urls.join( ',' );
  }      

  let twitter = await req.db  
  .select( 'id' )
  .from( 'Twitter' )
  .where( {
    uuid: record.twitter_uuid
  } )
  .first();
  record.twitter_id = twitter.id;

  // SQLite does not support date objects
  // Store as string
  if( req.db.client.config.client === 'sqlite3' ) {
    record.updated_at = record.updated_at.toISOString();
    record.published_at = record.published_at.toISOString();
  }  

  await req.db( 'TwitterStatus' )
  .update( {
    updated_at: record.updated_at,
    twitter_id: record.twitter_id,
    published_at: record.published_at,
    status: record.status,
    link: record.link,
    full_text: record.full_text,
    favorite: record.favorite,
    retweet: record.retweet,
    hashtags: record.hashtags,
    mentions: record.mentions,
    urls: record.urls
  } )
  .where( {
    uuid: record.uuid
  } );

  record = await req.db
  .select(
    'TwitterStatus.uuid AS id',
    'TwitterStatus.created_at',
    'TwitterStatus.updated_at',
    'Twitter.uuid AS twitter_id',
    'TwitterStatus.published_at',
    'TwitterStatus.status',
    'TwitterStatus.link',
    'TwitterStatus.full_text',
    'TwitterStatus.favorite',
    'TwitterStatus.retweet',
    'TwitterStatus.hashtags',
    'TwitterStatus.mentions',
    'TwitterStatus.urls'
  )
  .from( 'TwitterStatus' )
  .leftJoin( 'Twitter', 'TwitterStatus.twitter_id', 'Twitter.id' )
  .where( {
    'TwitterStatus.uuid': record.uuid
  } )
  .first();

  if( record.hashtags === null ) {
    record.hashtags = [];
  } else {
    record.hashtags = record.hashtags.split( ',' );
  }

  if( record.mentions === null ) {
    record.mentions = [];
  } else {    
    record.mentions = record.mentions.split( ',' );
  }  

  if( record.urls === null ) {
    record.urls = [];
  } else {    
    record.urls = record.urls.split( ',' );
  }    

  res.json( record );  
} );

// Remove media associated with post
router.delete( '/:status/media/:media', async ( req, res ) => {
  let status = await req.db
  .select( 'id' )
  .from( 'TwitterStatus' )
  .where( {
    uuid: req.params.status
  } )
  .first();

  let media = await req.db
  .select( 'id' )
  .from( 'TwitterStatusMedia' )
  .where( {
    uuid: req.params.media
  } )
  .first();  

  await req.db( 'TwitterStatusMedia' )
  .where( {
    status_id: status.id,
    media_id: media.id
  } )
  .del();

  res.json( {
    status_id: req.params.status,
    media_id: req.params.media
  } );
} );

// Delete
router.delete( '/:id', async ( req, res ) => {
  await req.db( 'TwitterStatus' )
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
