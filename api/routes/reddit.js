const express = require( 'express' );
const rp = require( 'request-promise-native' );
const uuidv4 = require( 'uuid' );

// Router
let router = express.Router();

// Test
router.get( '/test', ( req, res ) => {    
  res.json( {reddit: 'Test'} );
} );

// Read single Reddit account by ID
router.get( '/:id', async ( req, res ) => {
  let record = await req.db
  .select(
    'Reddit.uuid AS id',
    'Reddit.created_at',
    'Reddit.updated_at',
    'Developer.uuid AS developer_id',
    'Reddit.user',
    'Reddit.name',
    'Reddit.joined_at',
    'Reddit.image',
    'Reddit.link',
    'Reddit.comment'    
  )
  .from( 'Reddit' )
  .leftJoin( 'Developer', 'Reddit.developer_id', 'Developer.id' )
  .where( {
    'Reddit.uuid': req.params.id
  } )
  .first();

  if( record === undefined ) {
    record = null;
  }

  res.json( record );
} );

// Read all Reddit accounts
router.get( '/', async ( req, res ) => {
  let records = await req.db
  .select(
    'Reddit.uuid AS id',
    'Reddit.created_at',
    'Reddit.updated_at',
    'Developer.uuid AS developer_id',
    'Reddit.user',
    'Reddit.name',
    'Reddit.joined_at',
    'Reddit.image',
    'Reddit.link',
    'Reddit.comment'    
  )
  .from( 'Reddit' )
  .leftJoin( 'Developer', 'Reddit.developer_id', 'Developer.id' )
  .orderBy( 'Reddit.updated_at' );

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
    user: null,
    name: req.body.name,
    joined_at: null,
    image: null,
    link: 0,
    comment: 0
  };

  let existing = null;

  if( req.query.hasOwnProperty( 'existing' ) ) {
    if( req.query.existing === 'true' ) {
      existing = await req.db
      .select(
        'Reddit.uuid AS id',
        'Reddit.created_at',
        'Reddit.updated_at',
        'Developer.uuid AS developer_id',
        'Reddit.user',
        'Reddit.name',
        'Reddit.joined_at',
        'Reddit.image',
        'Reddit.link',
        'Reddit.comment'    
      )
      .from( 'Reddit' )
      .leftJoin( 'Developer', 'Reddit.developer_id', 'Developer.id' )
      .where( {
        'Reddit.name': record.name
      } )
      .first();

      if( existing === undefined ) {
        existing = null;
      }
    }
  }  

  if( existing === null ) {
    let profile = await rp( {
      url: `https://www.reddit.com/user/${record.name}/about.json`,
      method: 'GET',
      headers: {
        'User-Agent': 'Node:Avocado:v1'
      },
      json: true
    } );
  
    record.user = profile.data.id;
    record.joined_at = new Date( profile.data.created_utc * 1000 );
    record.image = profile.data.icon_img;
    record.link = profile.data.link_karma;
    record.comment = profile.data.comment_karma;
 
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
      record.joined_at = record.joined_at.toISOString();
    }  

    await req.db( 'Reddit' )
    .insert( {
      id: record.id,
      uuid: record.uuid,
      created_at: record.created_at,
      updated_at: record.updated_at,
      developer_id: record.developer_id,
      user: record.user,
      name: record.name,
      joined_at: record.joined_at,
      image: record.image,
      link: record.link,
      comment: record.comment
    } );
  
    record = {
      id: record.uuid,
      created_at: record.created_at,
      updated_at: record.updated_at,
      developer_id: record.developer_uuid,
      user: record.user,
      name: record.name,
      joined_at: record.joined_at,
      image: record.image,
      link: record.link,
      comment: record.comment
    };
  } else {
    record = existing;
  }

  res.json( record );
} );

// Update using API
router.patch( '/:id', async ( req, res ) => {
  let record = await req.db
  .select(
    'Reddit.uuid AS id',
    'Reddit.created_at',
    'Reddit.updated_at',
    'Developer.uuid AS developer_id',
    'Reddit.user',
    'Reddit.name',
    'Reddit.joined_at',
    'Reddit.image',
    'Reddit.link',
    'Reddit.comment'    
  )
  .from( 'Reddit' )
  .leftJoin( 'Developer', 'Reddit.developer_id', 'Developer.id' )
  .where( {
    'Reddit.uuid': req.params.id
  } )
  .first();

  if( req.body.hasOwnProperty( 'name' ) ) {
    record.name = req.body.name;
  }

  let profile = await rp( {
    url: `https://www.reddit.com/user/${record.name}/about.json`,
    method: 'GET',
    headers: {
      'User-Agent': 'Node:Avocado:v1'
    },
    json: true
  } );

  record.updated_at = new Date();
  record.user = profile.data.id;
  record.joined_at = new Date( profile.data.created_utc * 1000 );
  record.image = profile.data.icon_img;
  record.link = profile.data.link_karma;
  record.comment = profile.data.comment_karma;

  // SQLite does not support date objects
  // Store as string
  if( req.db.client.config.client === 'sqlite3' ) {
    record.updated_at = record.updated_at.toISOString();
    record.joined_at = record.joined_at.toISOString();
  }  

  await req.db( 'Reddit' )
  .update( {
    updated_at: record.updated_at,
    name: record.name,
    image: record.image,
    link: record.link,
    comment: record.comment
  } )
  .where( {
    id: req.params.id
  } ); 

  res.json( record );    
} );

// Update directly
router.put( '/:id', async ( req, res ) => {
  let record = {
    uuid: req.params.id,
    updated_at: new Date(),
    developer_uuid: req.body.developer_id,
    user: req.body.user,
    name: req.body.name,
    joined_at: new Date( req.body.joined_at ),
    image: req.body.image,
    link: req.body.link,
    comment: req.body.comment
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
    record.joined_at = record.joined_at.toISOString();
  }  

  await req.db( 'Reddit' )
  .update( {
    updated_at: record.updated_at,
    developer_id: record.developer_id,
    user: record.user,
    name: record.name,
    joined_at: record.joined_at,
    image: record.image,
    link: record.link,
    comment: record.comment
  } )
  .where( {
    uuid: record.uuid
  } ); 

  record = await req.db
  .select(
    'Reddit.uuid AS id',
    'Reddit.created_at', 
    'Reddit.updated_at',
    'Developer.uuid AS developer_id',
    'Reddit.user',
    'Reddit.name',
    'Reddit.joined_at',
    'Reddit.image',
    'Reddit.link',
    'Reddit.comment' 
  )
  .from( 'Reddit' )
  .leftJoin( 'Developer', 'Reddit.developer_id', 'Developer.id' )
  .where( {
    'Reddit.uuid': record.uuid
  } )
  .first();

  res.json( record );  
} );

// Delete
router.delete( '/:id', async ( req, res ) => {
  await req.db( 'Reddit' )
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
