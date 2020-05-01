const express = require( 'express' );
const uuidv4 = require( 'uuid' );

// Router
let router = express.Router();

// Test
router.get( '/test', ( req, res ) => {
  res.json( {reddit_post: 'Test'} );
} );

// Read single post by ID
router.get( '/:id', async ( req, res ) => {
  let record = await req.db
  .select(
    'RedditPost.uuid AS id',
    'RedditPost.created_at',
    'RedditPost.updated_at',
    'Reddit.uuid AS reddit_id',
    'RedditPost.published_at',
    'RedditPost.guid',
    'RedditPost.author',
    'RedditPost.title',
    'RedditPost.body',
    'RedditPost.comments',
    'RedditPost.score',
    'RedditPost.ups',
    'RedditPost.downs',
    'RedditPost.parent',
    'RedditPost.subreddit',
    'RedditPost.owner',
    'RedditPost.link'   
  )
  .from( 'RedditPost' )
  .leftJoin( 'Reddit', 'RedditPost.reddit_id', 'Reddit.id' )
  .where( {
    'RedditPost.uuid': req.params.id
  } )
  .first();

  if( record === undefined ) {
    record = null;
  }

  res.json( record );
} );

// Read single post by GUID
// Technically Reddit post ID
router.get( '/guid/:id', async ( req, res ) => {
  let record = await req.db
  .select(
    'RedditPost.uuid AS id',
    'RedditPost.created_at',
    'RedditPost.updated_at',
    'Reddit.uuid AS reddit_id',
    'RedditPost.published_at',
    'RedditPost.guid',
    'RedditPost.author',
    'RedditPost.title',
    'RedditPost.body',
    'RedditPost.comments',
    'RedditPost.score',
    'RedditPost.ups',
    'RedditPost.downs',
    'RedditPost.parent',
    'RedditPost.subreddit',
    'RedditPost.owner',
    'RedditPost.link'   
  )
  .from( 'RedditPost' )
  .leftJoin( 'Reddit', 'RedditPost.reddit_id', 'Reddit.id' )
  .where( {
    'RedditPost.guid': req.params.id
  } )
  .first();

  if( record === undefined ) {
    record = null;
  }

  res.json( record );
} );

// Read all posts
router.get( '/', async ( req, res ) => {
  let records = await req.db
  .select(
    'RedditPost.uuid AS id',
    'RedditPost.created_at',
    'RedditPost.updated_at',
    'Reddit.uuid AS reddit_id',
    'RedditPost.published_at',
    'RedditPost.guid',
    'RedditPost.author',
    'RedditPost.title',
    'RedditPost.body',
    'RedditPost.comments',
    'RedditPost.score',
    'RedditPost.ups',
    'RedditPost.downs',
    'RedditPost.parent',
    'RedditPost.subreddit',
    'RedditPost.owner',
    'RedditPost.link'   
  )
  .from( 'RedditPost' )
  .leftJoin( 'Reddit', 'RedditPost.reddit_id', 'Reddit.id' )
  .orderBy( 'RedditPost.published_at' );

  res.json( records );
} );

// Create
router.post( '/', async ( req, res ) => {
  let record = {
    id: null,
    uuid: uuidv4(),
    created_at: new Date(),
    updated_at: new Date(),
    reddit_uuid: req.body.reddit_id,
    published_at: new Date( req.body.published_at ),
    guid: req.body.guid,
    author: req.body.author,
    title: req.body.title,
    body: req.body.body,
    comments: req.body.comments,
    score: req.body.score,
    ups: req.body.ups,
    downs: req.body.downs,
    parent: req.body.parent,
    subreddit: req.body.subreddit,
    owner: req.body.owner,
    link: req.body.link
  };

  let reddit = await req.db
  .select( 'id' )
  .from( 'Reddit' )
  .where( {
    uuid: record.reddit_uuid
  } )
  .first();
  record.reddit_id = reddit.id;

  // SQLite does not support date objects
  // Store as string
  if( req.db.client.config.client === 'sqlite3' ) {
    record.updated_at = record.updated_at.toISOString();
    record.published_at = record.published_at.toISOString();
  }  

  await req.db( 'RedditPost' )
  .insert( {
    id: record.id,
    uuid: record.uuid,
    created_at: record.created_at,
    updated_at: record.updated_at,
    reddit_id: record.reddit_id,
    published_at: record.published_at,
    guid: record.guid,
    author: record.author,
    title: record.title,
    body: record.body,
    comments: record.comments,
    score: record.score,
    ups: record.ups,
    downs: record.downs,
    parent: record.parent,
    subreddit: record.subreddit,
    owner: record.owner,
    link: record.link
  } );

  res.json( {
    id: record.uuid,
    created_at: record.created_at,
    updated_at: record.updated_at,
    reddit_id: record.reddit_uuid,
    published_at: record.published_at,
    guid: record.guid,
    author: record.author,
    title: record.title,
    body: record.body,
    comments: record.comments,
    score: record.score,
    ups: record.ups,
    downs: record.downs,
    parent: record.parent,
    subreddit: record.subreddit,
    owner: record.owner,
    link: record.link
  } );
} );

// Update
router.put( '/:id', async ( req, res ) => {
  let record = {
    uuid: req.params.id,
    updated_at: new Date(),
    reddit_uuid: req.body.reddit_id,
    published_at: new Date( req.body.published_at ),
    guid: req.body.guid,
    author: req.body.author,
    title: req.body.title,
    body: req.body.body,
    comments: req.body.comments,
    score: req.body.score,
    ups: req.body.ups,
    downs: req.body.downs,
    parent: req.body.parent,
    subreddit: req.body.subreddit,
    owner: req.body.owner,
    link: req.body.link
  };

  let reddit = await req.db
  .select( 'id' )
  .from( 'Reddit' )
  .where( {
    uuid: record.reddit_uuid
  } )
  .first(); 
  record.reddit_id = reddit.id;

  // SQLite does not support date objects
  // Store as string
  if( req.db.client.config.client === 'sqlite3' ) {
    record.updated_at = record.updated_at.toISOString();
    record.published_at = record.published_at.toISOString();
  }  

  await req.db( 'RedditPost' )
  .update( {
    updated_at: record.updated_at,
    reddit_id: record.reddit_id,
    published_at: record.published_at,
    guid: record.guid,
    author: record.author,
    title: record.title,
    body: record.body,
    comments: record.comments,
    score: record.score,
    ups: record.ups,
    downs: record.downs,
    parent: record.parent,
    subreddit: record.subreddit,
    owner: record.owner,
    link: record.link
  } )
  .where( {
    uuid: record.uuid
  } );

  record = await req.db
  .select(
    'RedditPost.uuid AS id',
    'RedditPost.created_at',
    'RedditPost.updated_at',
    'Reddit.uuid AS reddit_id',
    'RedditPost.published_at',
    'RedditPost.guid',
    'RedditPost.author',
    'RedditPost.title',
    'RedditPost.body',
    'RedditPost.comments',
    'RedditPost.score',
    'RedditPost.ups',
    'RedditPost.downs',
    'RedditPost.parent',
    'RedditPost.subreddit',
    'RedditPost.owner',
    'RedditPost.link'   
  )
  .from( 'RedditPost' )
  .leftJoin( 'Reddit', 'RedditPost.reddit_id', 'Reddit.id' )
  .where( {
    'RedditPost.uuid': record.uuid
  } )
  .first();

  res.json( record );
} );

// Delete
router.delete( '/:id', async ( req, res ) => {
  await req.db( 'RedditPost' )
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
