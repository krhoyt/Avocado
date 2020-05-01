const express = require( 'express' );
const rp = require( 'request-promise-native' );
const uuidv4 = require( 'uuid' );

// Router
let router = express.Router();

// Test
router.get( '/test', ( req, res ) => {    
  res.json( {repository: 'Test'} );
} );

// Read single repository by ID
router.get( '/:id', async ( req, res ) => {
  let record = await req.db
  .select(
    'uuid AS id',
    'created_at', 
    'updated_at',
    'repository',
    'name',
    'full_name',
    'description',
    'is_fork',
    'started_at',
    'pushed_at',
    'size',
    'stargazers',
    'watchers',
    'forks',
    'issues',
    'network',
    'subscribers'
  )
  .from( 'Repository' )
  .where( {
    uuid: req.params.id
  } )
  .first();

  if( record === undefined ) {
    record = null;
  } else {
    record.is_fork = new Boolean( record.is_fork );
  }

  res.json( record );
} );

// Read all repositories
router.get( '/', async ( req, res ) => {
  let records = await req.db
  .select(
    'uuid AS id',
    'created_at', 
    'updated_at',
    'repository',
    'name',
    'full_name',
    'description',
    'is_fork',
    'started_at',
    'pushed_at',
    'size',
    'stargazers',
    'watchers',
    'forks',
    'issues',
    'network',
    'subscribers'
  )
  .from( 'Repository' )
  .orderBy( 'name' );

  for( let r = 0; r < records.length; r++ ) {
    records[r].is_fork = new Boolean( records[r].is_fork );    
  }

  res.json( records );
} );

// Create
router.post( '/', async ( req, res ) => {
  let record = {
    id: null,
    uuid: uuidv4(),
    created_at: new Date(),
    updated_at: new Date(),
    repository: null,
    name: null,
    full_name: req.body.full_name,
    description: null,
    is_fork: 0,
    started_at: null,
    pushed_at: null,
    size: 0,
    stargazers: 0,
    watchers: 0,
    forks: 0,
    issues: 0,
    network: 0,
    subscribers: 0
  };

  let existing = await req.db
  .select(
    'uuid AS id',
    'created_at', 
    'updated_at',
    'repository',
    'name',
    'full_name',
    'description',
    'is_fork',
    'started_at',
    'pushed_at',
    'size',
    'stargazers',
    'watchers',
    'forks',
    'issues',
    'network',
    'subscribers'
  )
  .from( 'Repository' )
  .where( {
    full_name: record.full_name
  } )
  .first();

  if( existing === undefined ) {
    let details = await rp( {
      url: `https://api.github.com/repos/${record.full_name}`,
      method: 'GET',
      headers: {
        'User-Agent': 'IBM Developer'
      },    
      qs: {
        access_token: req.config.github.access_token
      },
      json: true
    } );
  
    record.repository = details.id;
    record.name = details.name;
    record.description = details.description;
    record.is_fork = details.fork ? 1 : 0;
    record.started_at = new Date( details.created_at );
    record.pushed_at = new Date( details.pushed_at );
    record.size = details.size;
    record.stargazers = details.stargazers_count;
    record.watchers = details.watchers_count;
    record.forks = details.forks_count;
    record.issues = details.open_issues_count;
    record.network = details.network_count;
    record.subscribers = details.subscribers_count;

    await req.db( 'Repository' )
    .insert( {
      id: record.id,
      uuid: record.uuid,
      created_at: record.created_at,
      updated_at: record.updated_at,
      repository: record.repository,
      name: record.name,
      full_name: record.full_name,
      description: record.description,
      is_fork: record.is_fork,
      started_at: record.started_at,
      pushed_at: record.pushed_at,
      size: record.size,
      stargazers: record.stargazers,
      watchers: record.watchers,
      forks: record.forks,
      issues: record.issues,
      network: record.network,
      subscribers: record.subscribers
    } );
  
    record = {
      id: record.uuid,
      created_at: record.created_at,
      updated_at: record.updated_at,
      repository: record.repository,
      name: record.name,
      full_name: record.full_name,
      description: record.description,
      is_fork: new Boolean( record.is_fork ),
      started_at: record.started_at,
      pushed_at: record.pushed_at,
      size: record.size,
      stargazers: record.stargazers,
      watchers: record.watchers,
      forks: record.forks,
      issues: record.issues,
      network: record.network,
      subscribers: record.subscribers
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
    'uuid AS id',
    'created_at', 
    'updated_at',
    'repository',
    'name',
    'full_name',
    'description',
    'is_fork',
    'started_at',
    'pushed_at',
    'size',
    'stargazers',
    'watchers',
    'forks',
    'issues',
    'network',
    'subscribers'
  )
  .from( 'Repository' )
  .where( {
    uuid: req.params.id
  } )
  .first();

  let details = await rp( {
    url: `https://api.github.com/repos/${record.full_name}`,
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
  record.description = details.description;
  record.is_fork = new Boolean( record.is_fork );
  record.pushed_at = new Date( details.pushed_at );
  record.size = details.size;
  record.stargazers = details.stargazers_count;
  record.watchers = details.watchers_count;
  record.forks = details.forks_count;
  record.issues = details.open_issues_count;
  record.network = details.network_count;
  record.subscribers = details.subscribers_count;

  await req.db( 'Repository' )
  .update( {
    updated_at: record.updated_at,
    description: record.description,
    pushed_at: record.pushed_at,
    size: record.size,
    stargazers: record.stargazers,
    watchers: record.watchers,
    forks: record.forks,
    issues: record.issues,
    network: record.network,
    subscribers: record.subscribers
  } )
  .where( {
    uuid: record.id
  } );

  res.json( record );    
} );

// Update directly
router.put( '/:id', async ( req, res ) => {
  let record = {
    id: req.params.id,
    updated_at: new Date(),
    repository: req.body.repository,
    name: req.body.name,
    full_name: req.body.full_name,
    description: req.body.description,
    is_fork: req.body.is_fork ? 1 : 0,
    started_at: new Date( req.body.started_at ),
    pushed_at: new Date( req.body.pushed_at ),
    size: req.body.size,
    stargazers: req.body.stargazers,
    watchers: req.body.watchers,
    forks: req.body.forks,
    issues: req.body.issues,
    network: req.body.network,
    subscribers: req.body.subscribers
  };

  await req.db( 'Repository' )
  .update( {
    updated_at: record.updated_at,
    repository: record.repository,
    name: record.name,
    full_name: record.full_name,
    description: record.description,
    is_fork: record.is_fork,
    started_at: record.started_at,
    pushed_at: record.pushed_at,
    size: record.size,
    stargazers: record.stargazers,
    watchers: record.watchers,
    forks: record.forks,
    issues: record.issues,
    network: record.network,
    subscribers: record.subscribers
  } )
  .where( {
    uuid: record.id
  } );

  record = await req.db
  .select(
    'uuid AS id',
    'created_at', 
    'updated_at',
    'repository',
    'name',
    'full_name',
    'description',
    'is_fork',
    'started_at',
    'pushed_at',
    'size',
    'stargazers',
    'watchers',
    'forks',
    'issues',
    'network',
    'subscribers'
  )
  .from( 'Repository' )
  .where( {
    uuid: record.id
  } )
  .first();

  record.is_fork = new Boolean( record.is_fork );

  res.json( record );  
} );

// Delete
router.delete( '/:id', async ( req, res ) => {
  await req.db( 'Repository' )
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
