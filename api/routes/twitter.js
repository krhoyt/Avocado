const express = require( 'express' );
const rp = require( 'request-promise-native' );
const uuidv4 = require( 'uuid' );

// Router
let router = express.Router();

// Test
router.get( '/test', ( req, res ) => {    
  res.json( {twitter: 'Test'} );
} );

// Read timeline for a given user
// Part of API surface due to authentication
router.get( '/timeline/:screen_name', async ( req, res ) => {
  let timeline = await rp( {
    url: 'https://api.twitter.com/1.1/statuses/user_timeline.json',
    method: 'GET',
    headers: {
      Authorization: `${req.twitter.token_type} ${req.twitter.access_token}`
    },
    qs: {
      screen_name: req.params.screen_name,
      count: 100,
      tweet_mode: 'extended'
    },
    json: true      
  } )
  .catch( ( err ) => {
    return [];
  } );

  res.json( timeline );
} );

// Read single record by ID
router.get( '/:id', async ( req, res ) => {
  let record = await req.db
  .select( 
    'Twitter.uuid AS id',
    'Twitter.created_at',
    'Twitter.updated_at',
    'Developer.uuid AS developer_id',
    'Twitter.user',
    'Twitter.joined_at',
    'Twitter.name',
    'Twitter.screen_name',
    'Twitter.image',
    'Twitter.followers',
    'Twitter.friends',
    'Twitter.favorites',
    'Twitter.count',
    'Twitter.location',
    'Twitter.description',
    'Twitter.url'
  )
  .from( 'Twitter' )
  .leftJoin( 'Developer', 'Twitter.developer_id', 'Developer.id' )
  .where( {
    'Twitter.uuid': req.params.id
  } )
  .first();

  if( record === undefined ) {
    record = null;
  }

  res.json( record );
} );

// Read all Twitter accounts
router.get( '/', async ( req, res ) => {
  let records = await req.db
  .select( 
    'Twitter.uuid AS id',
    'Twitter.created_at',
    'Twitter.updated_at',
    'Developer.uuid AS developer_id',
    'Twitter.user',
    'Twitter.joined_at',
    'Twitter.name',
    'Twitter.screen_name',
    'Twitter.image',
    'Twitter.followers',
    'Twitter.friends',
    'Twitter.favorites',
    'Twitter.count',
    'Twitter.location',
    'Twitter.description',
    'Twitter.url'
  )
  .from( 'Twitter' )
  .leftJoin( 'Developer', 'Twitter.developer_id', 'Developer.id' )
  .orderBy( 'Twitter.updated_at' );

  res.json( records );
} );

// Create
router.post( '/', async ( req, res ) => {
  let errors = false;
  let record = {
    id: null,
    uuid: uuidv4(),
    created_at: new Date(),
    updated_at: new Date(),
    developer_uuid: req.body.developer_id,
    user: 0,
    joined_at: null,
    name: null,
    screen_name: req.body.screen_name,
    image: null,
    followers: 0,
    friends: 0,
    favorites: 0,
    count: 0,
    location: null,
    description: null,
    url: null
  };  

  let existing = null;

  if( req.query.hasOwnProperty( 'existing' ) ) {
    if( req.query.existing === 'true' ) {
      existing = await req.db
      .select( 
        'Twitter.uuid AS id',
        'Twitter.created_at',
        'Twitter.updated_at',
        'Developer.uuid AS developer_id',
        'Twitter.user',
        'Twitter.joined_at',
        'Twitter.name',
        'Twitter.screen_name',
        'Twitter.image',
        'Twitter.followers',
        'Twitter.friends',
        'Twitter.favorites',
        'Twitter.count',
        'Twitter.location',
        'Twitter.description',
        'Twitter.url'
      )
      .from( 'Twitter' )
      .leftJoin( 'Developer', 'Developer.id', 'Twitter.developer_id' )
      .where( {
        'Twitter.screen_name': record.screen_name
      } )
      .first();

      if( existing === undefined ) {
        existing = null;
      }
    }
  }

  if( existing === null ) {
    let profile = await rp( {
      url: 'https://api.twitter.com/1.1/users/show.json',
      method: 'GET',
      headers: {
        Authorization: `${req.twitter.token_type} ${req.twitter.access_token}`
      },
      qs: {
        screen_name: record.screen_name
      },
      json: true
    } )
    .catch( ( error ) => {
      console.log( error );
      errors = true;
      return null;
    } );
  
    if( profile !== null ) {
      record.user = profile.id;
      record.joined_at = new Date( profile.created_at );
      record.name = profile.name;
      record.image = profile.profile_image_url_https;
      record.followers = profile.followers_count;
      record.friends = profile.friends_count;
      record.favorites = profile.favourites_count;
      record.count = profile.statuses_count;
      record.location = profile.location;
      record.description = profile.description;
      record.url = profile.url;
    
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
  
      await req.db( 'Twitter' )
      .insert( {
        id: record.id,
        uuid: record.uuid,
        created_at: record.created_at,
        updated_at: record.updated_at,
        developer_id: record.developer_id,
        user: record.user,
        joined_at: record.joined_at,
        name: record.name,
        screen_name: record.screen_name,
        image: record.image,
        followers: record.followers,
        friends: record.friends,
        favorites: record.favorites,
        count: record.count,
        location: record.location,
        description: record.description,
        url: record.url
      } );
    
      record = {
        id: record.uuid,
        created_at: record.created_at,
        updated_at: record.updated_at,
        developer_id: record.developer_uuid,
        user: record.user,
        joined_at: record.joined_at,
        name: record.name,
        screen_name: record.screen_name,
        image: record.image,
        followers: record.followers,
        friends: record.friends,
        favorites: record.favorites,
        count: record.count,
        location: record.location,
        description: record.description,
        url: record.url
      };
    }
  } else {
    record = existing;
  }

  if( errors ) {
    res.status( 404 ).send( '{"message": "Screen name does not exist."' );
  } else {
    res.json( record );
  }
} );

// Update
router.put( '/:id', async ( req, res ) => {
  let record = {
    uuid: req.params.id,
    updated_at: new Date(),
    developer_uuid: req.body.developer_id,
    user: req.body.user,
    joined_at: new Date( req.body.joined_at ),
    name: req.body.name,
    screen_name: req.body.screen_name,
    image: req.body.image,
    followers: req.body.followers,
    friends: req.body.friends,
    favorites: req.body.favorites,
    count: req.body.count,
    location: req.body.location,
    description: req.body.description,
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
    record.joined_at = record.joined_at.toISOString();
  }

  await req.db( 'Twitter' )
  .update( {
    updated_at: record.updated_at,
    developer_id: record.developer_id,
    user: record.user,
    joined_at: record.joined_at,
    name: record.name,
    screen_name: record.screen_name,
    image: record.image,
    followers: record.followers,
    friends: record.friends,
    count: record.count,
    location: record.location,
    description: record.description,
    url: record.url
  } )
  .where( {
    uuid: record.uuid
  } );

  record = await req.db
  .select( 
    'Twitter.uuid AS id',
    'Twitter.created_at',
    'Twitter.updated_at',
    'Developer.uuid AS developer_id',
    'Twitter.user',
    'Twitter.joined_at',
    'Twitter.name',
    'Twitter.screen_name',
    'Twitter.image',
    'Twitter.followers',
    'Twitter.friends',
    'Twitter.favorites',
    'Twitter.count',
    'Twitter.location',
    'Twitter.description',
    'Twitter.url'
  )
  .from( 'Twitter' )
  .leftJoin( 'Developer', 'Twitter.developer_id', 'Developer.id' )
  .where( {
    'Twitter.uuid': record.uuid
  } )
  .first();

  res.json( record );  
} );

// Update partial
router.patch( '/:id', async ( req, res ) => {
  let record = {
    uuid: req.params.id,
    updated_at: new Date(),
    screen_name: req.body.screen_name
  };

  // SQLite does not support date objects
  // Store as string
  if( req.db.client.config.client === 'sqlite3' ) {
    record.updated_at = record.updated_at.toISOString();
    record.joined_at = record.joined_at.toISOString();
  }

  await req.db( 'Twitter' )
  .update( {
    updated_at: record.updated_at,
    screen_name: record.screen_name
  } )
  .where( {
    uuid: record.uuid
  } );

  record = await req.db
  .select( 
    'Twitter.uuid AS id',
    'Twitter.created_at',
    'Twitter.updated_at',
    'Developer.uuid AS developer_id',
    'Twitter.user',
    'Twitter.joined_at',
    'Twitter.name',
    'Twitter.screen_name',
    'Twitter.image',
    'Twitter.followers',
    'Twitter.friends',
    'Twitter.favorites',
    'Twitter.count',
    'Twitter.location',
    'Twitter.description',
    'Twitter.url'
  )
  .from( 'Twitter' )
  .leftJoin( 'Developer', 'Twitter.developer_id', 'Developer.id' )
  .where( {
    'Twitter.uuid': record.uuid
  } )
  .first();

  res.json( record );  
} );

// Delete
router.delete( '/:id', async ( req, res ) => {
  await req.db( 'Twitter' )
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
