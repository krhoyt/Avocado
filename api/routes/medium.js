const express = require( 'express' );
const rp = require( 'request-promise-native' );
const uuidv4 = require( 'uuid' );

// Router
let router = express.Router();

// Test
router.get( '/test', ( req, res ) => {    
  res.json( {medium: 'Test'} );
} );

// Read single Medium account by ID
router.get( '/:id', async ( req, res ) => {
  let record = await req.db
  .select( 
    'Medium.uuid AS id',
    'Medium.created_at',
    'Medium.updated_at',
    'Developer.uuid AS developer_id',
    'Medium.user_name',
    'Medium.following',
    'Medium.followed_by'
  )
  .from( 'Medium' )
  .leftJoin( 'Developer', 'Medium.developer_id', 'Developer.id' )
  .where( {
    'Medium.uuid': req.params.id
  } )
  .first();

  if( record === undefined ) {
    record = null;
  }

  res.json( record );
} );

// Read all Medium accounts
router.get( '/', async ( req, res ) => {
  let records = await req.db
  .select( 
    'Medium.uuid AS id',
    'Medium.created_at',
    'Medium.updated_at',
    'Developer.uuid AS developer_id',
    'Medium.user_name',
    'Medium.following',
    'Medium.followed_by'
  )
  .from( 'Medium' )
  .leftJoin( 'Developer', 'Medium.developer_id', 'Developer.id' )
  .orderBy( 'Medium.updated_at' );

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
    user_name: req.body.user_name,
    following: 0,
    followed_by: 0
  };

  let existing = null;

  if( req.query.hasOwnProperty( 'existing' ) ) {
    if( req.query.existing === 'true' ) {
      existing = await req.db
      .select(
        'Medium.uuid AS id',
        'Medium.created_at',
        'Medium.updated_at',
        'Developer.uuid AS developer_id',
        'Medium.user_name',
        'Medium.following',
        'Medium.followed_by'
      )
      .from( 'Medium' )
      .leftJoin( 'Developer', 'Medium.developer_id', 'Developer.id' )
      .where( {
        'Medium.user_name': record.user_name
      } )
      .first();

      if( existing === undefined ) {
        existing = null;
      }
    }
  }

  if( existing === null ) {
    let developer = await req.db
    .select( 'id' )
    .from( 'Developer' )
    .where( {
      uuid: record.developer_uuid
    } )
    .first();
    record.developer_id = developer.id;

    let statistics = await rp( {
      url: `https://medium.com/@${record.user_name}`,
      method: 'GET'
    } );

    const FOLLOWING = 'followingCount":';
    const FOLLOWED = 'followerCount":';

    let start = statistics.indexOf( FOLLOWING ) + FOLLOWING.length;
    let end = statistics.indexOf( ',', start );
    record.following = parseInt( statistics.substring( start, end ) );

    start = statistics.indexOf( FOLLOWED ) + FOLLOWED.length;
    end = statistics.indexOf( ',', start );
    record.followed_by = parseInt( statistics.substring( start, end ) );

    // SQLite does not support date objects
    // Store as string
    if( req.db.client.config.client === 'sqlite3' ) {
      record.created_at = record.created_at.toISOString();
      record.updated_at = record.updated_at.toISOString();
    }  

    await req.db( 'Medium' )
    .insert( {
      id: record.id,
      uuid: record.uuid,
      created_at: record.created_at,
      updated_at: record.updated_at,
      developer_id: record.developer_id,
      user_name: record.user_name,
      following: record.following,
      followed_by: record.followed_by
    } );

    record = {
      id: record.uuid,
      created_at: record.created_at,
      updated_at: record.updated_at,
      developer_id: record.developer_uuid,
      user_name: record.user_name,
      following: record.following,
      followed_by: record.followed_by
    };
  } else {
    record = existing;
  }

  res.json( record );
} );

// Update by scraping statistics
router.patch( '/:id', async ( req, res ) => {
  let record = await req.db
  .select( 
    'Medium.uuid AS id',
    'Medium.created_at',
    'Medium.updated_at',
    'Developer.uuid AS developer_id',
    'Medium.user_name',
    'Medium.following',
    'Medium.followed_by'
  )
  .from( 'Medium' )
  .leftJoin( 'Developer', 'Medium.developer_id', 'Developer.id' )
  .where( {
    'Medium.uuid': req.params.id
  } )
  .first();

  if( req.body.hasOwnProperty( 'user_name' ) ) {
    record.user_name = req.body.user_name;
  }

  record.updated_at = new Date();

  let statistics = await rp( {
    url: `https://medium.com/@${record.user_name}`,
    method: 'GET'
  } );

  const FOLLOWING = 'followingCount":';
  const FOLLOWED = 'followerCount":';

  let start = statistics.indexOf( FOLLOWING ) + FOLLOWING.length;
  let end = statistics.indexOf( ',', start );
  record.following = parseInt( statistics.substring( start, end ) );

  start = statistics.indexOf( FOLLOWED ) + FOLLOWED.length;
  end = statistics.indexOf( ',', start );
  record.followed_by = parseInt( statistics.substring( start, end ) );  

  // SQLite does not support date objects
  // Store as string
  if( req.db.client.config.client === 'sqlite3' ) {
    record.updated_at = record.updated_at.toISOString();
  }  

  await req.db( 'Medium' )
  .update( {
    updated_at: record.updated_at,
    user_name: record.user_name,
    following: record.following,
    followed_by: record.followed_by
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
    user_name: req.body.user_name,
    following: req.body.following,
    followed_by: req.body.followed_by
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

  await req.db( 'Medium' )
  .update( {
    updated_at: record.updated_at,
    developer_id: record.developer_id,
    user_name: record.user_name,
    following: record.following,
    followed_by: record.followed_by
  } )
  .where( {
    uuid: record.uuid
  } );

  record = await req.db
  .select( 
    'Medium.uuid AS id',
    'Medium.created_at',
    'Medium.updated_at',
    'Developer.uuid AS developer_id',
    'Medium.user_name',
    'Medium.following',
    'Medium.followed_by'
  )
  .from( 'Medium' )
  .leftJoin( 'Developer', 'Medium.developer_id', 'Developer.id' )
  .where( {
    'Medium.uuid': record.uuid
  } )
  .first();

  res.json( record );  
} );

// Delete
router.delete( '/:id', async ( req, res ) => {
  await req.db( 'Medium' )
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
