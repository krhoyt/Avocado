const express = require( 'express' );
const moment = require( 'moment' );
const rp = require( 'request-promise-native' );
const uuidv4 = require( 'uuid' );

// Router
let router = express.Router();

// Test
router.get( '/test', ( req, res ) => {    
  res.json( {youtube_video: 'Test'} );
} );

// Read duration of video
// Provided as REST API due to authentication
router.get( '/duration/:video', async ( req, res ) => {
  let details = await rp( {
    url: 'https://www.googleapis.com/youtube/v3/videos',
    method: 'GET',
    qs: {
      id: req.params.video,
      part: 'contentDetails',
      key: req.config.google.youtube
    },
    json: true
  } );
  
  const duration = moment.duration( details.items[0].contentDetails.duration );

  res.json( {
    duration: details.items[0].contentDetails.duration,
    seconds: duration.asSeconds()
  } );
} );

// Read single video by ID
router.get( '/:id', async ( req, res ) => {
  let record = await req.db
  .select(
    'YouTubeVideo.uuid AS id',
    'YouTubeVideo.created_at',
    'YouTubeVideo.updated_at',
    'YouTube.uuid AS youtube_id',
    'YouTubeVideo.published_at',
    'YouTubeVideo.guid',
    'YouTubeVideo.video',
    'YouTubeVideo.link',
    'YouTubeVideo.title',
    'YouTubeVideo.views',
    'YouTubeVideo.stars',
    'YouTubeVideo.duration',
    'YouTubeVideo.thumbnail',
    'YouTubeVideo.summary'        
  )
  .from( 'YouTubeVideo' )
  .leftJoin( 'YouTube', 'YouTubeVideo.youtube_id', 'YouTube.id' )
  .where( {
    'YouTubeVideo.uuid': req.params.id
  } )
  .first();

  if( record === undefined ) {
    record = null;
  }

  res.json( record );
} );

// Read single video by GUID
// GUIDs are often URLs
// Base64 encoded
router.get( '/guid/:id', async ( req, res ) => {
  let buffer = new Buffer.from( req.params.id, 'base64' );
  let guid = buffer.toString( 'utf8' );  

  let record = await req.db
  .select(
    'YouTubeVideo.uuid AS id',
    'YouTubeVideo.created_at',
    'YouTubeVideo.updated_at',
    'YouTube.uuid AS youtube_id',
    'YouTubeVideo.published_at',
    'YouTubeVideo.guid',
    'YouTubeVideo.video',
    'YouTubeVideo.link',
    'YouTubeVideo.title',
    'YouTubeVideo.views',
    'YouTubeVideo.stars',
    'YouTubeVideo.duration',
    'YouTubeVideo.thumbnail',
    'YouTubeVideo.summary'        
  )
  .from( 'YouTubeVideo' )
  .leftJoin( 'YouTube', 'YouTubeVideo.youtube_id', 'YouTube.id' )
  .where( {
    'YouTubeVideo.guid': guid
  } )
  .first();

  if( record === undefined ) {
    record = null;
  }

  res.json( record );
} );

// Read all videos
router.get( '/', async ( req, res ) => {
  let records = await req.db
  .select(
    'YouTubeVideo.uuid AS id',
    'YouTubeVideo.created_at',
    'YouTubeVideo.updated_at',
    'YouTube.uuid AS youtube_id',
    'YouTubeVideo.published_at',
    'YouTubeVideo.guid',
    'YouTubeVideo.video',
    'YouTubeVideo.link',
    'YouTubeVideo.title',
    'YouTubeVideo.views',
    'YouTubeVideo.stars',
    'YouTubeVideo.duration',
    'YouTubeVideo.thumbnail',
    'YouTubeVideo.summary'        
  )
  .from( 'YouTubeVideo' )
  .leftJoin( 'YouTube', 'YouTubeVideo.youtube_id', 'YouTube.id' )
  .orderBy( 'YouTubeVideo.published_at' );

  res.json( records );
} );

// Create
router.post( '/', async ( req, res ) => {
  let record = {
    id: null,
    uuid: uuidv4(),
    created_at: new Date(),
    updated_at: new Date(),
    youtube_uuid: req.body.youtube_id,
    published_at: new Date( req.body.published_at ),
    guid: req.body.guid,
    video: req.body.video,
    link: req.body.link,
    title: req.body.title,
    views: req.body.views,
    stars: req.body.stars,
    duration: req.body.duration,
    thumbnail: req.body.thumbnail,
    summary: req.body.summary
  };

  let youtube = await req.db
  .select( 'id' )
  .from( 'YouTube' )
  .where( {
    uuid: record.youtube_uuid
  } )
  .first();
  record.youtube_id = youtube.id;

  // SQLite does not support date objects
  // Store as string
  if( req.db.client.config.client === 'sqlite3' ) {
    record.created_at = record.created_at.toISOString();
    record.updated_at = record.updated_at.toISOString();
    record.published_at = record.published_at.toISOString();
  }  

  await req.db( 'YouTubeVideo' )
  .insert( {
    id: record.id,
    uuid: record.uuid,
    created_at: record.created_at,
    updated_at: record.updated_at,
    youtube_id: record.youtube_id,
    published_at: record.published_at,
    guid: record.guid,
    video: record.video,
    link: record.link,
    title: record.title,
    views: record.views,
    stars: record.stars,
    duration: record.duration,
    thumbnail: record.thumbnail,
    summary: record.summary
  } );

  res.json( {
    id: record.uuid,
    created_at: record.created_at,
    updated_at: record.updated_at,
    youtube_id: record.youtube_uuid,
    published_at: record.published_at,
    guid: record.guid,
    video: record.video,
    link: record.link,
    title: record.title,
    views: record.views,
    stars: record.stars,
    duration: record.duration,
    thumbnail: record.thumbnail,
    summary: record.summary
  } );
} );

// Update
router.put( '/:id', async ( req, res ) => {
  let record = {
    uuid: req.params.id,
    updated_at: new Date(),
    youtube_uuid: req.body.youtube_id,
    published_at: new Date( req.body.published_at ),
    guid: req.body.guid,
    video: req.body.video,
    link: req.body.link,
    title: req.body.title,
    views: req.body.views,
    stars: req.body.stars,
    duration: req.body.duration,
    thumbnail: req.body.thumbnail,
    summary: req.body.summary
  };

  let youtube = await req.db
  .select( 'id' )
  .from( 'YouTube' )
  .where( {
    uuid: record.youtube_uuid
  } )
  .first();
  record.youtube_id = youtube.id;

  // SQLite does not support date objects
  // Store as string
  if( req.db.client.config.client === 'sqlite3' ) {
    record.updated_at = record.updated_at.toISOString();
    record.published_at = record.published_at.toISOString();
  }  

  await req.db( 'YouTubeVideo' )
  .update( {
    updated_at: record.updated_at,
    youtube_id: record.youtube_id,
    published_at: record.published_at,
    guid: record.guid,
    video: record.video,
    link: record.link,
    title: record.title,
    views: record.views,
    stars: record.stars,
    duration: record.duration,
    thumbnail: record.thumbnail,
    summary: record.summary
  } )
  .where( {
    uuid: record.uuid
  } );

  record = await req.db
  .select(
    'YouTubeVideo.uuid AS id',
    'YouTubeVideo.created_at',
    'YouTubeVideo.updated_at',
    'YouTube.uuid AS youtube_id',
    'YouTubeVideo.published_at',
    'YouTubeVideo.guid',
    'YouTubeVideo.video',
    'YouTubeVideo.link',
    'YouTubeVideo.title',
    'YouTubeVideo.views',
    'YouTubeVideo.stars',
    'YouTubeVideo.duration',
    'YouTubeVideo.thumbnail',
    'YouTubeVideo.summary'        
  )
  .from( 'YouTubeVideo' )
  .leftJoin( 'YouTube', 'YouTubeVideo.youtube_id', 'YouTube.id' )
  .where( {
    'YouTubeVideo.uuid': record.uuid
  } )
  .first();

  res.json( record );  
} );

// Delete
router.delete( '/:id', async ( req, res ) => {
  await req.db( 'YouTubeVideo' )
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
