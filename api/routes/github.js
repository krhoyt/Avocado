const express = require( 'express' );
const rp = require( 'request-promise-native' );
const uuidv4 = require( 'uuid' );

// Router
let router = express.Router();

// Test
router.get( '/test', ( req, res ) => {    
  res.json( {github: 'Test'} );
} );

// Read activity (events) for a given login
// Part of API surface due to authentication
router.get( '/activity/:login', async ( req, res ) => {
  let events = await rp( {
    url: `https://api.github.com/users/${req.params.login}/events/public`,
    headers: {
      'User-Agent': 'IBM Developer'
    },
    method: 'GET',
    qs: {
      access_token: req.config.github.access_token
    },
    json: true      
  } );

  res.json( events );
} );

// Read single GitHub account by ID
router.get( '/:id', async ( req, res ) => {
  let record = await req.db
  .select( 
    'GitHub.uuid AS id',
    'GitHub.created_at',
    'GitHub.updated_at',
    'Developer.uuid AS developer_id',
    'GitHub.login',
    'GitHub.name',
    'GitHub.company',
    'GitHub.blog',
    'GitHub.location',
    'GitHub.email',
    'GitHub.hireable',
    'GitHub.repositories',
    'GitHub.gists',
    'GitHub.followers',
    'GitHub.following'
  )
  .from( 'GitHub' )
  .leftJoin( 'Developer', 'GitHub.developer_id', 'Developer.id' )
  .where( {
    'GitHub.uuid': req.params.id
  } )
  .first();

  if( record === undefined ) {
    record = null;
  }

  res.json( record );
} );

// Read all GitHub accounts
router.get( '/', async ( req, res ) => {
  let records = await req.db
  .select( 
    'GitHub.uuid AS id',
    'GitHub.created_at',
    'GitHub.updated_at',
    'Developer.uuid AS developer_id',
    'GitHub.login',
    'GitHub.name',
    'GitHub.company',
    'GitHub.blog',
    'GitHub.location',
    'GitHub.email',
    'GitHub.hireable',
    'GitHub.repositories',
    'GitHub.gists',
    'GitHub.followers',
    'GitHub.following'
  )
  .from( 'GitHub' )
  .leftJoin( 'Developer', 'GitHub.developer_id', 'Developer.id' )
  .orderBy( 'GitHub.updated_at' );

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
    login: req.body.login,
    name: null,
    company: null,
    blog: null,
    location: null,
    email: null,
    hireable: 0,
    repositories: 0,
    gists: 0,
    followers: 0,
    following: 0
  };

  let existing = null;

  if( req.query.hasOwnProperty( 'existing' ) ) {
    if( req.query.existing === 'true' ) {
      existing = await req.db
      .select(
        'GitHub.uuid AS id',
        'GitHub.created_at',
        'GitHub.updated_at',
        'Developer.uuid AS developer_id',
        'GitHub.login',
        'GitHub.name',
        'GitHub.company',
        'GitHub.blog',
        'GitHub.location',
        'GitHub.email',
        'GitHub.hireable',
        'GitHub.repositories',
        'GitHub.gists',
        'GitHub.followers',
        'GitHub.following'
      )
      .from( 'GitHub' )
      .leftJoin( 'Developer', 'GitHub.developer_id', 'Developer.id' )
      .where( {
        'GitHub.login': record.login
      } )
      .first();

      if( existing === undefined ) {
        existing = null;
      }
    }
  }    

  if( existing === null ) {
    let profile = await rp( {
      url: `https://api.github.com/users/${record.login}`,
      method: 'GET',
      headers: {
        'User-Agent': 'IBM Developer'
      },
      qs: {
        access_token: req.config.github.access_token
      },
      json: true
    } );
  
    record.name = profile.name;
    record.company = profile.company;
    record.blog = profile.blog;
    record.location = profile.location;
    record.email = profile.email;
    record.hireable = profile.hireable === null ? 0 : 1;
    record.repositories = profile.public_repos;
    record.gists = profile.public_gists;
    record.followers = profile.followers;
    record.following = profile.following;
  
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
    }  

    await req.db( 'GitHub' )
    .insert( {
      id: record.id,
      uuid: record.uuid,
      created_at: record.created_at,
      updated_at: record.updated_at,
      developer_id: record.developer_id,
      login: record.login,
      name: record.name,
      company: record.company,
      blog: record.blog,
      location: record.location,
      email: record.email,
      hireable: record.hireable,
      repositories: record.repositories,
      gists: record.gists,
      followers: record.followers,
      following: record.following
    } );
  
    record = {
      id: record.uuid,
      created_at: record.created_at,
      updated_at: record.updated_at,
      developer_id: record.developer_uuid,
      login: record.login,
      name: record.name,
      company: record.company,
      blog: record.blog,
      location: record.location,
      email: record.email,
      hireable: record.hireable,
      repositories: record.repositories,
      gists: record.gists,
      followers: record.followers,
      following: record.following
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
    'GitHub.uuid AS id',
    'GitHub.created_at',
    'GitHub.updated_at',
    'Developer.uuid AS developer_id',
    'GitHub.login',
    'GitHub.name',
    'GitHub.company',
    'GitHub.blog',
    'GitHub.location',
    'GitHub.email',
    'GitHub.hireable',
    'GitHub.repositories',
    'GitHub.gists',
    'GitHub.followers',
    'GitHub.following'
  )
  .from( 'GitHub' )
  .leftJoin( 'Developer', 'GitHub.developer_id', 'Developer.id' )
  .where( {
    'GitHub.uuid': req.params.id
  } )
  .first();

  if( req.body.hasOwnProperty( 'login' ) ) {
    record.login = req.body.login;
  }

  let profile = await rp( {
    url: `https://api.github.com/users/${record.login}`,
    method: 'GET',
    headers: {
      'User-Agent': 'IBM Developer'
    },
    qs: {
      access_token: req.config.github.access_token
    },
    json: true
  } );

  record.updated_at = new Date();
  record.name = profile.name;
  record.company = profile.company;
  record.blog = profile.blog;
  record.location = profile.location;
  record.email = profile.email;
  record.hireable = profile.hireable === null ? 0 : 1;
  record.repositories = profile.public_repos;
  record.gists = profile.public_gists;
  record.followers = profile.followers;
  record.following = profile.following;

  await req.db( 'GitHub' )
  .update( {
    updated_at: record.updated_at,
    login: record.login,
    name: record.name,
    company: record.company,
    blog: record.blog,
    location: record.location,
    email: record.email,
    hireable: record.hireable,
    repositories: record.repositories,
    gists: record.gists,
    followers: record.followers,
    following: record.following
  } )
  .where( {
    uuid: req.params.id
  } );

  res.json( record );    
} );

// Update directly
router.put( '/:id', async ( req, res ) => {
  let record = {
    uuid: req.params.id,
    updated_at: new Date(),
    developer_uuid: req.body.developer_id,
    login: req.body.login,
    name: req.body.name,
    company: req.body.company,
    blog: req.body.blog,
    location: req.body.location,
    email: req.body.email,
    hireable: req.body.hireable,
    repositories: req.body.repositories,
    gists: req.body.gists,
    followers: req.body.followers,
    following: req.body.following
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
  }

  await req.db( 'GitHub' )
  .update( {
    updated_at: record.updated_at,
    developer_id: record.developer_id,
    login: record.login,
    name: record.name,
    company: record.company,
    blog: record.blog,
    location: record.location,
    email: record.email,
    hireable: record.hireable,
    repositories: record.repositories,
    gists: record.gists,
    followers: record.followers,
    following: record.following
  } )
  .where( {
    uuid: record.uuid
  } );

  record = await req.db
  .select( 
    'GitHub.uuid AS id',
    'GitHub.created_at',
    'GitHub.updated_at',
    'Developer.uuid AS developer_id',
    'GitHub.login',
    'GitHub.name',
    'GitHub.company',
    'GitHub.blog',
    'GitHub.location',
    'GitHub.email',
    'GitHub.hireable',
    'GitHub.repositories',
    'GitHub.gists',
    'GitHub.followers',
    'GitHub.following'
  )
  .from( 'GitHub' )
  .leftJoin( 'Developer', 'GitHub.developer_id', 'Developer.id' )
  .where( {
    'GitHub.uuid': record.uuid
  } )
  .first();

  res.json( record );  
} );

// Delete
router.delete( '/:id', async ( req, res ) => {
  await req.db( 'GitHub' )
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
