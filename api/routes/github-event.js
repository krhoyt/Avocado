const express = require( 'express' );
const uuidv4 = require( 'uuid' );

// Router
let router = express.Router();

// Test 
router.get( '/test', ( req, res ) => {    
  res.json( {github_event: 'Test'} );
} );

// Read single GitHub event by ID
router.get( '/:id', async ( req, res ) => {
  let record = await req.db
  .select( 
    'GitHubEvent.uuid AS id',
    'GitHubEvent.created_at',
    'GitHubEvent.updated_at',
    'GitHub.uuid AS github_id',
    'GitHubEvent.published_at',
    'GitHubEvent.event',
    'GitHubEvent.event_name',
    'GitHubEvent.repository',
    'GitHubEvent.repository_name',
  )
  .from( 'GitHubEvent' )
  .leftJoin( 'GitHub', 'GitHubEvent.github_id', 'GitHub.id' )
  .where( {
    'GitHubEvent.uuid': req.params.id
  } )
  .first();

  if( record === undefined ) {
    record = null;
  }

  res.json( record );
} );

// Read single event by GitHub ID
router.get( '/id/:id', async ( req, res ) => {
  let record = await req.db
  .select( 
    'GitHubEvent.uuid AS id',
    'GitHubEvent.created_at',
    'GitHubEvent.updated_at',
    'GitHub.uuid AS github_id',
    'GitHubEvent.published_at',
    'GitHubEvent.event',
    'GitHubEvent.event_name',
    'GitHubEvent.repository',
    'GitHubEvent.repository_name',
  )
  .from( 'GitHubEvent' )
  .leftJoin( 'GitHub', 'GitHubEvent.github_id', 'GitHub.id' )
  .where( {
    'GitHubEvent.event': req.params.id
  } )
  .first();  

  if( record === undefined ) {
    record = null;
  }

  res.json( record );
} );

// Read all events
router.get( '/', async ( req, res ) => {
  let records = await req.db
  .select( 
    'GitHubEvent.uuid AS id',
    'GitHubEvent.created_at',
    'GitHubEvent.updated_at',
    'GitHub.uuid AS github_id',
    'GitHubEvent.published_at',
    'GitHubEvent.event',
    'GitHubEvent.event_name',
    'GitHubEvent.repository',
    'GitHubEvent.repository_name',
  )
  .from( 'GitHubEvent' )
  .leftJoin( 'GitHub', 'GitHubEvent.github_id', 'GitHub.id' )
  .orderBy( 'GitHubEvent.published_at' );

  res.json( records );
} );

// Create
router.post( '/', async ( req, res ) => {
  let record = {
    id: null,
    uuid: uuidv4(),
    created_at: new Date(),
    updated_at: new Date(),
    github_uuid: req.body.github_id,
    published_at: new Date( req.body.published_at ),
    event: req.body.event,
    event_name: req.body.event_name,
    repository: req.body.repository,
    repository_name: req.body.repository_name
  };

  let github = await req.db
  .select( 'id' )
  .from( 'GitHub' )
  .where( {
    uuid: record.github_uuid
  } )
  .first();
  record.github_id = github.id;

  // SQLite does not support date objects
  // Store as string
  if( req.db.client.config.client === 'sqlite3' ) {
    record.created_at = record.created_at.toISOString();
    record.updated_at = record.updated_at.toISOString();
    record.published_at = record.published_at.toISOString();
  }  

  await req.db( 'GitHubEvent' )
  .insert( {
    id: record.id,
    uuid: record.uuid,
    created_at: record.created_at,
    updated_at: record.updated_at,
    github_id: record.github_id,
    published_at: record.published_at,
    event: record.event,
    event_name: record.event_name,
    repository: record.repository,
    repository_name: record.repository_name
  } );

  res.json( {
    id: record.uuid,
    created_at: record.created_at,
    updated_at: record.updated_at,
    github_id: record.github_uuid,
    published_at: record.published_at,
    event: record.event,
    event_name: record.event_name,
    repository: record.repository,
    repository_name: record.repository_name
  } );
} );

// Update
router.put( '/:id', async ( req, res ) => {
  let record = {
    uuid: req.params.id,
    updated_at: new Date(),
    github_uuid: req.body.github_id,
    published_at: new Date( req.body.published_at ),
    event: req.body.event,
    event_name: req.body.event_name,
    repository: req.body.repository,
    repository_name: req.body.repository_name
  };

  let github = await req.db
  .select( 'id' )
  .from( 'GitHub' )
  .where( {
    uuid: record.github_uuid
  } )
  .first();
  record.github_id = github.id;

  // SQLite does not support date objects
  // Store as string
  if( req.db.client.config.client === 'sqlite3' ) {
    record.updated_at = record.updated_at.toISOString();
    record.published_at = record.published_at.toISOString();
  }  

  await req.db( 'GitHubEvent' )
  .update( {
    updated_at: record.updated_at,
    github_id: record.github_id,
    published_at: record.published_at,
    event: record.event,
    event_name: record.event_name,
    repository: record.repository,
    repository_name: record.repository_name
  } )
  .where( {
    uuid: record.uuid
  } );

  record = await req.db
  .select( 
    'GitHubEvent.uuid AS id',
    'GitHubEvent.created_at',
    'GitHubEvent.updated_at',
    'GitHub.uuid AS github_id',
    'GitHubEvent.published_at',
    'GitHubEvent.event',
    'GitHubEvent.event_name',
    'GitHubEvent.repository',
    'GitHubEvent.repository_name',
  )
  .from( 'GitHubEvent' )
  .leftJoin( 'GitHub', 'GitHubEvent.github_id', 'GitHub.id' )
  .where( {
    'GitHubEvent.uuid': record.uuid
  } )
  .first();

  res.json( record );  
} );

// Delete
router.delete( '/:id', async ( req, res ) => {
  await req.db( 'GitHubEvent' )
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
