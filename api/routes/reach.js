const express = require( 'express' );
const uuidv4 = require( 'uuid' );

// Router
let router = express.Router();

// Test
router.get( '/test', ( req, res ) => {    
  res.json( {reach: 'Test'} );
} );

// Entities
// For reporting
router.get( '/entities', ( req, res ) => {
  res.json( [
    {label: 'Blog Post', table: 'BlogPost', parent: 'Blog', join: 'blog_id', contributed: 'published_at'},
    {label: 'Dev.to Post', table: 'DevPost', parent: 'Dev', join: 'dev_id', contributed: 'published_at' },
    {label: 'GitHub Account', table: 'GitHub', parent: null, join: null, contributed: null},
    {label: 'GitHub Event', table: 'GitHubEvent', parent: 'GitHub', join: 'github_id', contributed: 'published_at'},
    {label: 'Medium Account', table: 'Medium', parent: null, join: null, contributed: null},      
    {label: 'Medium Post', table: 'MediumPost', parent: 'Medium', join: 'medium_id', contributed: 'published_at'},
    {label: 'Stack Overflow Account', table: 'StackOverflow', parent: null, join: null, contributed: null},                  
    {label: 'Stack Overflow Answer', table: 'StackOverflowAnswer', parent: 'StackOverflow', join: 'so_id', contributed: 'active_at'},            
    {label: 'Twitter Account', table: 'Twitter', parent: null, join: null, contributed: null},
    {label: 'Twitter Status', table: 'TwitterStatus', parent: 'Twitter', join: 'twitter_id', contributed: 'published_at'},
    {label: 'YouTube Video', table: 'YouTubeVideo', parent: 'YouTube', join: 'youtube_id', contributed: 'published_at'}
  ] );
} );

// Fields
// For reporting
router.get( '/fields', ( req, res ) => {
  res.json( {
    'Blog Post': [
      {label: 'Post', column: 'title'}
    ],
    'Dev.to Post': [
      {label: 'Likes', column: 'likes'},
      {label: 'Post', column: 'title'},        
      {label: 'Reading', column: 'reading'},
      {label: 'Unicorn', column: 'unicorn'}        
    ],
    'GitHub Account': [
      {label: 'Followers', column: 'followers'},
      {label: 'Following', column: 'following'},        
      {label: 'Gists', column: 'gists'},
      {label: 'Repositories', column: 'repositories'}
    ],
    'GitHub Event': [
      {label: 'Event', column: 'event_name'}
    ],
    'Medium Account': [
      {label: 'Followed By', column: 'followed_by'},        
      {label: 'Following', column: 'following'}
    ],
    'Medium Post': [
      {label: 'Claps', column: 'claps'},        
      {label: 'Post', column: 'title'}
    ],
    'Stack Overflow Account': [
      {label: 'Accept Rate', column: 'accept_rate'},
      {label: 'Reputation', column: 'reputation'}
    ],
    'Stack Overflow Answer': [
      {label: 'Answer', column: 'title'},
      {label: 'Score', column: 'score'},
      {label: 'Views', column: 'views'}
    ],
    'Twitter Account': [
      {label: 'Favorites', column: 'favorites'},
      {label: 'Followers', column: 'followers'},
      {label: 'Friends', column: 'friends'},
      {label: 'Status Count', column: 'favorites'}
    ],
    'Twitter Status': [
      {label: 'Favorite', column: 'favorite'},
      {label: 'Retweet', column: 'retweet'},
      {label: 'Status', column: 'full_text'}
    ],
    'YouTube Video': [
      {label: 'Stars', column: 'stars'},        
      {label: 'Video', column: 'title'},
      {label: 'Views', column: 'views'}
    ]
  } );
} );

// Read single record by ID
router.get( '/:id', async ( req, res ) => {
  let record = await req.db
  .select(
    'Reach.uuid AS id',
    'Reach.created_at',
    'Reach.updated_at',
    'Reach.name',
    'Color.uuid AS color_id',
    'Color.foreground',
    'Color.background',
    'Reach.weight',
    'Reach.criteria'
  )
  .from( 'Reach' )
  .leftJoin( 'Color', 'Color.id', 'Reach.color_id' )
  .leftJoin( 'Account', 'Account.id', 'Reach.account_id' )
  .where( {
    'Reach.uuid': req.params.id
  } )
  .first();

  if( record === undefined ) {
    record = null;
  }

  res.json( record );
} );

// Search for records with a given start
router.get( '/name/:prefix', async ( req, res ) => {
  let records = await req.db
  .select( 
    'Reach.uuid AS id',
    'Reach.created_at',
    'Reach.updated_at',
    'Reach.name',
    'Color.uuid AS color_id',
    'Color.foreground',
    'Color.background',
    'Reach.weight',
    'Reach.criteria'
  )
  .from( 'Reach' )
  .leftJoin( 'Account', 'Account.id', 'Reach.account_id' ) 
  .leftJoin( 'Color', 'Color.id', 'Reach.color_id' )
  .where( 'Reach.name', 'like', `${req.params.prefix}%` )
  .where( {
    'Reach.account_id': req.account.id
   } )
  .orWhere( 'Reach.account_id', null );

  res.json( records );
} );

// Read all records
// Includes count of contributions
router.get( '/', async ( req, res ) => {
  let records = await req.db
  .select( 
    'Reach.uuid AS id',
    'Reach.created_at',
    'Reach.updated_at',
    'Account.uuid AS account_id',
    'Reach.name',
    'Color.uuid AS color_id',
    'Color.foreground',
    'Color.background',
    'Reach.weight',
    'Reach.criteria'
  )
  .from( 'Reach' )
  .leftJoin( 'Account', 'Account.id', 'Reach.account_id' )
  .leftJoin( 'Color', 'Color.id', 'Reach.color_id' )
  .where( {
    'Reach.account_id': req.account.id,
  } )
  .orWhere( 'Reach.account_id', null )
  .orderBy( 'Reach.name', 'asc' );

  res.json( records );
} );

// Create record
router.post( '/', async ( req, res ) => {
  let record = {
    id: null,
    uuid: uuidv4(),
    created_at: new Date(),
    updated_at: new Date(),
    account_uuid: req.account.uuid,
    account_id: req.account.id,
    name: req.body.name.trim(),
    color_uuid: req.body.color_id,
    weight: req.body.weight,
    criteria: req.body.criteria
  };

  let existing = null;

  if( req.query.hasOwnProperty( 'existing' ) ) {
    if( req.query.existing === 'true' ) {
      existing = await req.db
      .select( 
        'Reach.uuid AS id',
        'Reach.created_at',
        'Reach.updated_at',
        'Account.uuid AS account_id',
        'Reach.name',
        'Color.uuid AS color_id',
        'Color.foreground',
        'Color.background',
        'Reach.weight',
        'Reach.criteria'
      )
      .from( 'Reach' )
      .leftJoin( 'Account', 'Account.id', 'Reach.account_id' )
      .leftJoin( 'Color', 'Color.id', 'Reach.color_id' )
      .where( {
        'Reach.name': record.name,
        'Reach.account_id': record.account_id
      } )
      .first();

      if( existing === undefined ) {
        existing = null;
      }
    }
  }  

  if( existing === null ) {
    // Color lookup
    if( record.color_uuid !== null ) {
      let color = await req.db
      .select( 'id', 'foreground', 'background' )
      .from( 'Color' )
      .where( 'uuid', record.color_uuid )
      .first();

      record.color_id = color.id;
      record.foreground = color.foreground;
      record.background = color.background;
    } else {
      record.color_id = null;
      record.foreground = null;
      record.background = null;
    }

    // SQLite does not support date objects
    // Store as string
    if( req.db.client.config.client === 'sqlite3' ) {
      record.created_at = record.created_at.toISOString();
      record.updated_at = record.updated_at.toISOString();
    }  

    // Insert
    await req.db( 'Reach' )
    .insert( {
      id: record.id,
      uuid: record.uuid,
      created_at: record.created_at,
      updated_at: record.updated_at,
      account_id: record.account_id,
      name: record.name,
      color_id: record.color_id,
      weight: record.weight,
      criteria: record.criteria
    } );

    // Response
    record = {
      id: record.uuid,
      created_at: record.created_at,
      updated_at: record.updated_at,
      account_id: record.account_uuid,
      name: record.name,
      color_id: record.color_uuid,
      foreground: record.foreground,
      background: record.background,
      weight: record.weight,
      criteria: record.criteria
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
    account_uuid: req.body.account_id,
    account_id: req.account.id,
    name: req.body.name,
    color_uuid: req.body.color_id,
    weight: req.body.weight,
    criteria: req.body.criteria
  };

  // Color lookup
  if( record.color_uuid !== null ) {
    let color = await req.db
    .select( 'id' )
    .from( 'Color' )
    .where( 'uuid', record.color_uuid )
    .first();
    record.color_id = color.id;  
  } else {
    record.color_id = null;
  }

  // SQLite does not support date objects
  // Store as string
  if( req.db.client.config.client === 'sqlite3' ) {
    record.updated_at = record.updated_at.toISOString();
  }

  // Update
  await req.db( 'Reach' )
  .update( {
    updated_at: record.updated_at,
    name: record.name,
    color_id: record.color_id,
    weight: record.weight,
    criteria: record.criteria
  } )
  .where( {
    uuid: record.uuid
  } );

  // Return includes created date
  record = await req.db
  .select( 
    'Reach.uuid AS id',
    'Reach.created_at',
    'Reach.updated_at',
    'Account.uuid AS account_id',
    'Reach.name',
    'Color.uuid AS color_id',
    'Color.foreground',
    'Color.background',
    'Reach.weight',
    'Reach.criteria'
  )
  .from( 'Reach' )
  .leftJoin( 'Account', 'Account.id', 'Reach.account_id' )
  .leftJoin( 'Color', 'Color.id', 'Reach.color_id' )
  .where( {
    'Reach.uuid': record.uuid
  } )
  .first();

  res.json( record );  
} );

// Delete record
router.delete( '/:id', async ( req, res ) => {
  await req.db( 'Reach' )
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
