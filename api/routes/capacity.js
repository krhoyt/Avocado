const express = require( 'express' );
const uuidv4 = require( 'uuid' );

// Router
let router = express.Router();

// Test
router.get( '/test', ( req, res ) => {    
  res.json( {capacity: 'Test'} );
} );

// Read supported entities
router.get( '/entities', ( req, res ) => {
  res.json( [
    {label: 'Blog Post', path: '/blog/post', description: 'title', link: 'link', contributed: 'published_at'},
    {label: 'Dev.to Post', path: '/dev/post', description: 'title', link: 'link', contributed: 'published_at'},
    {label: 'GitHub Event', path: '/github/event', description: 'event_name,: ,repository_name', contributed: 'published_at', link: null},
    {label: 'Medium Post', path: '/medium/post', description: 'title', link: 'link', contributed: 'published_at'},
    {label: 'Stack Overflow Answer', path: '/so/answer', description: 'title', link: 'link', contributed: 'active_at'},            
    {label: 'Twitter Status', path: '/twitter/status', description: 'full_text', link: 'link', contributed: 'published_at'},
    {label: 'YouTube Video', path: '/youtube/video', description: 'title', link: 'link', contributed: 'published_at'}
  ] );
} );

// Read supported fields
router.get( '/fields', async ( req, res ) => {
  res.json( {
    'Blog Post': [
      {label: 'Title', column: 'title'},
      {label: 'Summary', column: 'summary'},
      {label: 'Category', column: 'category'},
      {label: 'Keywords', column: 'keywords'}
    ],
    'Dev.to Post': [
      {label: 'Title', column: 'title'},
      {label: 'Summary', column: 'summary'},
      {label: 'Keywords', column: 'keywords'}        
    ],
    'GitHub Event': [
      {label: 'Event Name', column: 'event_name'},
      {label: 'Repository Name', column: 'repository_name'},
    ],
    'Medium Post': [
      {label: 'Title', column: 'title'},
      {label: 'Summary', column: 'summary'},
      {label: 'Category', column: 'category'},
      {label: 'Keywords', column: 'keywords'}        
    ],
    'Stack Overflow Answer': [
      {label: 'Accepted', column: 'accepted'},
      {label: 'Title', column: 'title'},
      {label: 'Tags', column: 'tags'},
      {label: 'Keywords', column: 'keywords'}
    ],
    'Twitter Status': [
      {label: 'Body', column: 'full_text'},
      {label: 'Hashtags', column: 'hashtags'},
      {label: 'Mentions', column: 'mentions'},
      {label: 'URLs', column: 'urls'}
    ],
    'YouTube Video': [
      {label: 'Title', column: 'title'},
      {label: 'Duration (sec)', column: 'duration'},
      {label: 'Summary', column: 'summary'}
    ]
  } );
} );

// Read single record by ID
router.get( '/:id', async ( req, res ) => {
  let record = await req.db
  .select(
    'Capacity.uuid AS id',
    'Capacity.created_at',
    'Capacity.updated_at',
    'Capacity.name',
    'Color.uuid AS color_id',
    'Color.foreground',
    'Color.background',
    'Capacity.weight',
    'Capacity.criteria'
  )
  .from( 'Capacity' )
  .leftJoin( 'Color', 'Color.id', 'Capacity.color_id' )
  .leftJoin( 'Account', 'Account.id', 'Capacity.account_id' )
  .where( {
    'Capacity.uuid': req.params.id
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
    'Capacity.uuid AS id',
    'Capacity.created_at',
    'Capacity.updated_at',
    'Capacity.name',
    'Color.uuid AS color_id',
    'Color.foreground',
    'Color.background',
    'Capacity.weight',
    'Capacity.criteria'
  )
  .from( 'Capacity' )
  .leftJoin( 'Account', 'Account.id', 'Capacity.account_id' ) 
  .leftJoin( 'Color', 'Color.id', 'Capacity.color_id' )
  .where( 'Capacity.name', 'like', `${req.params.prefix}%` )
  .where( {
    'Capacity.account_id': req.account.id
   } )
  .orWhere( 'Capacity.account_id', null );

  res.json( records );
} );

// Read all records
// Includes count of contributions
router.get( '/', async ( req, res ) => {
  let records = await req.db
  .select( 
    'Capacity.uuid AS id',
    'Capacity.created_at',
    'Capacity.updated_at',
    'Account.uuid AS account_id',
    'Capacity.name',
    'Color.uuid AS color_id',
    'Color.foreground',
    'Color.background',
    'Capacity.weight',
    'Capacity.criteria'
  )
  .count( 'Contribution.id AS count' )
  .from( 'Capacity' )
  .leftJoin( 'Contribution', 'Contribution.capacity_id', 'Capacity.id' )
  .leftJoin( 'Account', 'Account.id', 'Capacity.account_id' )
  .leftJoin( 'Color', 'Color.id', 'Capacity.color_id' )
  .where( {
    'Capacity.account_id': req.account.id,
  } )
  .orWhere( 'Capacity.account_id', null )
  .groupBy( 'Capacity.id' )
  .orderBy( 'Capacity.name', 'asc' );

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
        'Capacity.uuid AS id',
        'Capacity.created_at',
        'Capacity.updated_at',
        'Account.uuid AS account_id',
        'Capacity.name',
        'Color.uuid AS color_id',
        'Color.foreground',
        'Color.background',
        'Capacity.weight',
        'Capacity.criteria'
      )
      .from( 'Capacity' )
      .leftJoin( 'Account', 'Account.id', 'Capacity.account_id' )
      .leftJoin( 'Color', 'Color.id', 'Capacity.color_id' )
      .where( {
        'Capacity.name': record.name,
        'Capacity.account_id': record.account_id
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
    await req.db( 'Capacity' )
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
  await req.db( 'Capacity' )
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
    'Capacity.uuid AS id',
    'Capacity.created_at',
    'Capacity.updated_at',
    'Account.uuid AS account_id',
    'Capacity.name',
    'Color.uuid AS color_id',
    'Color.foreground',
    'Color.background',
    'Capacity.weight',
    'Capacity.criteria'
  )
  .from( 'Capacity' )
  .leftJoin( 'Account', 'Account.id', 'Capacity.account_id' )
  .leftJoin( 'Color', 'Color.id', 'Capacity.color_id' )
  .where( {
    'Capacity.uuid': record.uuid
  } )
  .first();

  res.json( record );  
} );

// Delete record
router.delete( '/:id', async ( req, res ) => {
  await req.db( 'Capacity' )
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
