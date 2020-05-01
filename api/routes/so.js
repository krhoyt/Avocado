const express = require( 'express' );
const rp = require( 'request-promise-native' );
const uuidv4 = require( 'uuid' );

// Router
let router = express.Router();

// Test
router.get( '/test', ( req, res ) => {    
  res.json( {so: 'Test'} );
} );

// Read answers for a given user
// Part of API surface due to authentication
router.get( '/answers/:account', async ( req, res ) => {
  let answers = await rp( {
    url: `https://api.stackexchange.com/2.2/users/${req.params.account}/answers`,
    method: 'GET',
    headers: {
      Authorization: `${req.twitter.token_type} ${req.twitter.access_token}`
    },
    qs: {
      order: 'desc',
      sort: 'activity',
      site: 'stackoverflow',
      pagesize: 100,
      key: req.config.stackoverflow.key
    },
    gzip: true,
    json: true      
  } );

  res.json( answers.items );
} );

// Read single Stack Overflow account by ID
router.get( '/:id', async ( req, res ) => {
  let record = await req.db
  .select(
    'StackOverflow.uuid AS id',
    'StackOverflow.created_at', 
    'StackOverflow.updated_at',
    'Developer.uuid AS developer_id',
    'StackOverflow.user',
    'StackOverflow.account',
    'StackOverflow.joined_at',
    'StackOverflow.reputation',
    'StackOverflow.accept_rate',
    'StackOverflow.name',
    'StackOverflow.location',
    'StackOverflow.website',
    'StackOverflow.link',
    'StackOverflow.image'    
  )
  .from( 'StackOverflow' )
  .leftJoin( 'Developer', 'StackOverflow.developer_id', 'Developer.id' )
  .where( {
    'StackOverflow.uuid': req.params.id
  } )
  .first();

  if( record === undefined ) {
    record = null;
  }

  res.json( record );
} );

// Read all Stack Overflow accounts
router.get( '/', async ( req, res ) => {
  let records = await req.db
  .select(
    'StackOverflow.uuid AS id',
    'StackOverflow.created_at', 
    'StackOverflow.updated_at',
    'Developer.uuid AS developer_id',
    'StackOverflow.user',
    'StackOverflow.account',
    'StackOverflow.joined_at',
    'StackOverflow.reputation',
    'StackOverflow.accept_rate',
    'StackOverflow.name',
    'StackOverflow.location',
    'StackOverflow.website',
    'StackOverflow.link',
    'StackOverflow.image'   
  )
  .from( 'StackOverflow' )
  .leftJoin( 'Developer', 'StackOverflow.developer_id', 'Developer.id' )
  .orderBy( 'StackOverflow.updated_at' );

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
    user: req.body.user,
    account: 0,
    joined_at: null,
    reputation: 0,
    accept_rate: 0,
    name: null,
    location: null,
    website: null,
    link: null,
    image: null
  };

  let existing = null;

  if( req.query.hasOwnProperty( 'existing' ) ) {
    if( req.query.existing === 'true' ) {
      existing = await req.db
      .select(
        'StackOverflow.uuid AS id',
        'StackOverflow.created_at', 
        'StackOverflow.updated_at',
        'Developer.uuid AS developer_id',
        'StackOverflow.user',
        'StackOverflow.account',
        'StackOverflow.joined_at',
        'StackOverflow.reputation',
        'StackOverflow.accept_rate',
        'StackOverflow.name',
        'StackOverflow.location',
        'StackOverflow.website',
        'StackOverflow.link',
        'StackOverflow.image'    
      )
      .from( 'StackOverflow' )
      .leftJoin( 'Developer', 'StackOverflow.developer_id', 'Developer.id' )
      .where( {
        'StackOverflow.user': record.user
      } )
      .first();

      if( existing === undefined ) {
        existing = null;
      }
    }
  }  

  if( existing === null ) {
    let profile = await rp( {
      url: `https://api.stackexchange.com/2.2/users/${req.body.user}`,
      method: 'GET',
      qs: {
        order: 'desc',
        sort: 'reputation',
        site: 'stackoverflow',
        key: req.config.stackoverflow.key
      },
      gzip: true,
      json: true
    } );
  
    record.account = profile.items[0].account_id;
    record.joined_at = new Date( profile.items[0].creation_date * 1000 );
    record.reputation = profile.items[0].reputation;
    record.accept_rate = profile.items[0].accept_rate ? profile.items[0].accept_rate : 0;
    record.name = profile.items[0].display_name;
    record.location = profile.items[0].location;
    record.website = profile.items[0].website_url;
    record.link = profile.items[0].link;
    record.image = profile.items[0].profile_image;
  
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
      record.published_at = record.published_at.toISOString();
    }  

    await req.db( 'StackOverflow' )
    .insert( {
      id: record.id,
      uuid: record.uuid,
      created_at: record.created_at,
      updated_at: record.updated_at,
      developer_id: record.developer_id,
      user: record.user,
      account: record.account,
      joined_at: record.joined_at,
      reputation: record.reputation,
      accept_rate: record.accept_rate,
      name: record.name,
      location: record.location,
      website: record.website,
      link: record.link,
      image: record.image
    } );

    record = {
      id: record.uuid,
      created_at: record.created_at,
      updated_at: record.updated_at,
      developer_id: record.developer_uuid,
      user: record.user,
      account: record.account,
      joined_at: record.joined_at,
      reputation: record.reputation,
      accept_rate: record.accept_rate,
      name: record.name,
      location: record.location,
      website: record.website,
      link: record.link,
      image: record.image
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
    'StackOverflow.uuid AS id',
    'StackOverflow.created_at', 
    'StackOverflow.updated_at',
    'Developer.uuid AS developer_id',
    'StackOverflow.user',
    'StackOverflow.account',
    'StackOverflow.joined_at',
    'StackOverflow.reputation',
    'StackOverflow.accept_rate',
    'StackOverflow.name',
    'StackOverflow.location',
    'StackOverflow.website',
    'StackOverflow.link',
    'StackOverflow.image'    
  )
  .from( 'StackOverflow' )
  .leftJoin( 'Developer', 'StackOverflow.developer_id', 'Developer.id' )
  .where( {
    'StackOverflow.uuid': req.params.id
  } )
  .first();

  if( req.body.hasOwnProperty( 'user' ) ) {
    record.user = req.body.user;
  }

  let profile = await rp( {
    url: `https://api.stackexchange.com/2.2/users/${record.user}`,
    method: 'GET',
    qs: {
      order: 'desc',
      sort: 'reputation',
      site: 'stackoverflow',
      key: req.config.stackoverflow.key
    },
    gzip: true,
    json: true
  } );

  record.updated_at = new Date();
  record.reputation = profile.items[0].reputation;
  record.accept_rate = profile.items[0].accept_rate ? profile.items[0].accept_rate : 0;
  record.name = profile.items[0].display_name;
  record.location = profile.items[0].location;
  record.website = profile.items[0].website_url;
  record.link = profile.items[0].link;
  record.image = profile.items[0].profile_image;

  // SQLite does not support date objects
  // Store as string
  if( req.db.client.config.client === 'sqlite3' ) {
    record.updated_at = record.updated_at.toISOString();
  }  

  await req.db( 'StackOverflow' )
  .update( {
    updated_at: record.updated_at,
    user: record.user,
    reputation: record.reputation,
    accept_rate: record.accept_rate,
    name: record.name,
    location: record.location,
    website: record.website,
    link: record.link,
    image: record.image
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
    account: req.body.account,
    joined_at: new Date( req.body.joined_at ),
    reputation: req.body.reputation,
    accept_rate: req.body.accept_rate,
    name: req.body.name,
    location: req.body.location,
    website: req.body.website,
    link: req.body.link,
    image: req.body.image
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
    record.joined_at = record.published_at.toISOString();
  }  

  await req.db( 'StackOverflow' )
  .update( {
    updated_at: record.updated_at,
    developer_id: record.developer_id,
    user: record.user,
    account: record.account,
    joined_at: record.joined_at,
    reputation: record.reputation,
    accept_rate: record.accept_rate,
    name: record.name,
    location: record.location,
    website: record.website,
    link: record.link,
    image: record.image
  } )
  .where( {
    uuid: record.uuid
  } );

  record = await req.db
  .select(
    'StackOverflow.uuid AS id',
    'StackOverflow.created_at', 
    'StackOverflow.updated_at',
    'Developer.uuid AS developer_id',
    'StackOverflow.user',
    'StackOverflow.account',
    'StackOverflow.joined_at',
    'StackOverflow.reputation',
    'StackOverflow.accept_rate',
    'StackOverflow.name',
    'StackOverflow.location',
    'StackOverflow.website',
    'StackOverflow.link',
    'StackOverflow.image'    
  )
  .from( 'StackOverflow' )
  .leftJoin( 'Developer', 'StackOverflow.developer_id', 'Developer.id' )
  .where( {
    'StackOverflow.uuid': record.uuid
  } )
  .first();

  res.json( record );  
} );

// Delete
router.delete( '/:id', async ( req, res ) => {
  await req.db( 'StackOverflow' )
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
