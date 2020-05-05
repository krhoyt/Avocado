const express = require( 'express' );
const rp = require( 'request-promise-native' );
const uuidv4 = require( 'uuid' );

// Router
let router = express.Router();

// Token authentication
router.use( (req, res, next ) => {
  if( req.account === null ) {
    res.status( 401 ).send( 'API token required for this resource.' );
  } else {
    next();
  }
} );

// Test
router.get( '/test', ( req, res ) => {    
  res.json( {developer: 'Test'} );
} );

// Developers for a given organization
router.get( '/organization/:id', async ( req, res ) => {
  let fields = '';
  let private = false;

  if( req.query.fields ) {
    fields = req.query.fields;
  }

  if( req.query.private ) {
    if( req.query.private === 'true' ) {
      private = true;
    }
  }

  let records = await req.db
  .select(
    'Developer.uuid AS id',
    'Developer.created_at', 
    'Developer.updated_at',
    'Account.uuid AS account_id',
    'Level.uuid AS level_id',
    'Developer.name',
    'Developer.email',
    'Developer.title',
    'Developer.description',
    'Developer.image',
    'Developer.location',
    'Developer.latitude',
    'Developer.longitude',
    'Developer.address',
    'Developer.city',
    'Developer.country',
    'Developer.region',
    'Developer.postal',
    'Developer.public',
    'Developer.internal'
  )
  .from( 'Developer' )
  .leftJoin( 'DeveloperOrganization', 'DeveloperOrganization.developer_id', 'Developer.id' )
  .leftJoin( 'Organization', 'Organization.id', 'DeveloperOrganization.organization_id' )
  .leftJoin( 'Account', 'Account.id', 'Developer.account_id' )
  .leftJoin( 'Level', 'Level.id', 'Developer.level_id' )  
  .where( {
    'Account.id': req.account.id,
    'Organization.uuid': req.params.id
  } )
  .where( 
    'Developer.public', 
    private ? '>=' : '=',
    private ? 0 : 1 
  )
  .orderBy( 'Developer.name' );

  if( records === undefined ) {
    records = [];
  }

  res.json( records );
} );

// Social channels for given developer
// Requires manual update for new channels
router.get( '/:id/social', async ( req, res ) => {
  let developer = await req.db
  .select( 'id' )
  .from( 'Developer' )
  .where( {
    uuid: req.params.id
  } )
  .first();

  let channels = [
    {table: 'Blog', field: 'url', label: 'Blog', path: 'blog'},
    {table: 'Dev', field: 'user_name', label: 'Dev.to', path: 'dev'},
    {table: 'GitHub', field: 'login', label: 'GitHub', path: 'github'},
    {table: 'LinkedIn', field: 'profile', label: 'LinkedIn', path: 'linkedin'},    
    {table: 'Medium', field: 'user_name', label: 'Medium', path: 'medium'},
    {table: 'Reddit', field: 'name', label: 'Reddit', path: 'reddit'},
    {table: 'StackOverflow', field: 'user', label: 'Stack Overflow', path: 'so'},
    {table: 'Twitter', field: 'screen_name', label: 'Twitter', path: 'twitter'},
    {table: 'Website', field: 'url', label: 'Website', path: 'website'},
    {table: 'YouTube', field: 'channel', label: 'YouTube', path: 'youtube'} 
  ];

  let results = [];

  for( let c = 0; c < channels.length; c++ ) {
    let social = await req.db
    .select()
    .from( channels[c].table )
    .where( {
      developer_id: developer.id
    } );

    for( let s = 0; s < social.length; s++ ) {
      results.push( {
        id: social[s].uuid,
        channel: channels[c].label,
        endpoint: social[s][channels[c].field],
        developer_id: req.params.id,
        entity: channels[c].path
      } );
    }
  }

  res.json( results );
} );

router.get( '/:id/stream', async ( req, res ) => {
  let now = new Date();
  now.setDate( now.getDate() - 5 );

  let results = [];

  // Blog
  let channel = await req.db
  .select( 
    'BlogPost.title AS title',
    'BlogPost.published_at AS published',
    'BlogPost.link',
    'BlogPost.summary AS body'
  )
  .from( 'BlogPost' )
  .leftJoin( 'Blog', 'Blog.id', 'BlogPost.blog_id' )
  .leftJoin( 'Developer', 'Developer.id', 'Blog.developer_id' )
  .where( 'Developer.uuid', req.params.id )
  .where( 'BlogPost.published_at', '>', now )
  .orderBy( 'BlogPost.published_at' ); 

  for( let c = 0; c < channel.length; c++ ) {
    channel[c].mark = null;
    channel[c].favorite = null;
    channel[c].other = null;
    channel[c].type = 'blog';
  }  

  results = results.concat( channel );

  // Dev.to
  channel = await req.db
  .select( 
    'DevPost.title AS title',
    'DevPost.published_at AS published',
    'DevPost.link',
    'DevPost.summary AS body',
    'DevPost.likes AS mark',
    'DevPost.reading AS forward',
    'DevPost.unicorn AS other'
  )
  .from( 'DevPost' )
  .leftJoin( 'Dev', 'Dev.id', 'DevPost.dev_id' )
  .leftJoin( 'Developer', 'Developer.id', 'Dev.developer_id' )
  .where( 'Developer.uuid', req.params.id )
  .where( 'DevPost.published_at', '>', now )
  .orderBy( 'DevPost.published_at' ); 

  for( let c = 0; c < channel.length; c++ ) {
    channel[c].type = 'dev';
  }  

  results = results.concat( channel );  

  // GitHub
  channel = await req.db
  .select( 
    'GitHubEvent.event_name AS title',
    'GitHubEvent.repository_name AS body',
    'GitHubEvent.published_at AS published'
  )
  .from( 'GitHubEvent' )
  .leftJoin( 'GitHub', 'GitHub.id', 'GitHubEvent.github_id' )
  .leftJoin( 'Developer', 'Developer.id', 'GitHub.developer_id' )
  .where( 'Developer.uuid', req.params.id )
  .where( 'GitHubEvent.published_at', '>', now )
  .orderBy( 'GitHubEvent.published_at' );

  for( let c = 0; c < channel.length; c++ ) {
    channel[c].mark = null;
    channel[c].forward = null;
    channel[c].other = null;
    channel[c].type = 'github';
  }  

  results = results.concat( channel );

  // Medium
  channel = await req.db
  .select( 
    'MediumPost.title',
    'MediumPost.published_at AS published',
    'MediumPost.link',
    'MediumPost.summary AS body',
    'MediumPost.claps AS mark'
  )
  .from( 'MediumPost' )
  .leftJoin( 'Medium', 'Medium.id', 'MediumPost.medium_id' )
  .leftJoin( 'Developer', 'Developer.id', 'Medium.developer_id' )
  .where( 'Developer.uuid', req.params.id )
  .where( 'MediumPost.published_at', '>', now )
  .orderBy( 'MediumPost.published_at' );

  for( let c = 0; c < channel.length; c++ ) {
    channel[c].forward = null;
    channel[c].other = null;
    channel[c].type = 'medium';
  }  

  results = results.concat( channel );

  // Stack Overflow
  channel = await req.db
  .select( 
    'StackOverflowAnswer.active_at AS published',
    'StackOverflowAnswer.link',
    'StackOverflowAnswer.title',
    'StackOverflowAnswer.accepted AS forward',
    'StackOverflowAnswer.score AS mark',
    'StackOverflowAnswer.views AS other'
  )
  .from( 'StackOverflowAnswer' )
  .leftJoin( 'StackOverflow', 'StackOverflow.id', 'StackOverflowAnswer.so_id' )
  .leftJoin( 'Developer', 'Developer.id', 'StackOverflow.developer_id' )
  .where( 'Developer.uuid', req.params.id )
  .where( 'StackOverflowAnswer.active_at', '>', now )
  .orderBy( 'StackOverflowAnswer.active_at' );

  for( let c = 0; c < channel.length; c++ ) {
    channel[c].body = null;
    channel[c].type = 'so';
  }

  results = results.concat( channel );

  // Twitter
  channel = await req.db
  .select( 
    'Twitter.screen_name AS title',
    'TwitterStatus.published_at AS published',
    'TwitterStatus.link',
    'TwitterStatus.full_text AS body',
    'TwitterStatus.favorite AS mark',
    'TwitterStatus.retweet AS forward'
  )
  .from( 'TwitterStatus' )
  .leftJoin( 'Twitter', 'Twitter.id', 'TwitterStatus.twitter_id' )
  .leftJoin( 'Developer', 'Developer.id', 'Twitter.developer_id' )
  .where( 'Developer.uuid', req.params.id )
  .where( 'TwitterStatus.published_at', '>', now )
  .orderBy( 'TwitterStatus.published_at' );

  for( let c = 0; c < channel.length; c++ ) {
    channel[c].title = '@' + channel[c].title;
    channel[c].other = null;
    channel[c].type = 'twitter';
  }

  results = results.concat( channel );

  // YouTube
  channel = await req.db
  .select( 
    'YouTubeVideo.title',
    'YouTubeVideo.published_at AS published',
    'YouTubeVideo.link',
    'YouTubeVideo.summary AS body',
    'YouTubeVideo.views AS forward',
    'YouTubeVideo.stars AS mark'
  )
  .from( 'YouTubeVideo' )
  .leftJoin( 'YouTube', 'YouTube.id', 'YouTubeVideo.youtube_id' )
  .leftJoin( 'Developer', 'Developer.id', 'YouTube.developer_id' )
  .where( 'Developer.uuid', req.params.id )
  .where( 'YouTubeVideo.published_at', '>', now )
  .orderBy( 'YouTubeVideo.published_at' );

  for( let c = 0; c < channel.length; c++ ) {
    channel[c].other = null;
    channel[c].type = 'youtube';
  }

  results = results.concat( channel );  

  results.sort( ( a, b ) => {
    let one = Date.parse( a.published );
    let two = Date.parse( b.published );

    if( one > two ) return -1;
    if( one < two ) return 1;
    return 0;
  } );

  res.json( results );
} );

// Read relations for given developer
// Language
// Organization
// Role
// Skill
router.get( '/:id/:model', async ( req, res ) => {
  const field = req.params.model.toLowerCase();
  const entity = field.replace( /^\w/, c => c.toUpperCase() );

  let listing = await req.db
  .select( 
    `${entity}.uuid AS id`,
    `${entity}.created_at`, 
    `${entity}.updated_at`, 
    `${entity}.name`    
  )
  .from( entity )
  .leftJoin( `Developer${entity}`, `Developer${entity}.${field}_id`, `${entity}.id` ) 
  .leftJoin( 'Developer', 'Developer.id',  `Developer${entity}.developer_id` )
  .where( {
    'Developer.uuid': req.params.id
  } );

  res.json( listing );
} );

// Read single developer by ID
router.get( '/:id', async ( req, res ) => {
  let  developer = await req.db
  .select(
    'Developer.uuid AS id',
    'Developer.created_at', 
    'Developer.updated_at',
    'Account.uuid AS account_id',
    'Level.uuid AS level_id',
    'Developer.name',
    'Developer.email',
    'Developer.title',
    'Developer.description',
    'Developer.image',
    'Developer.location',
    'Developer.latitude',
    'Developer.longitude',
    'Developer.address',
    'Developer.city',
    'Developer.country',
    'Developer.region',
    'Developer.postal',      
    'Developer.public',
    'Developer.internal'
  )
  .from( 'Developer' )
  .leftJoin( 'Account', 'Account.id', 'Developer.account_id' )
  .leftJoin( 'Level', 'Level.id', 'Developer.level_id' )
  .where( {
    'Developer.uuid': req.params.id,
    'Account.id': req.account.id
  } )
  .first();

  developer.organizations = await req.db
  .select(
    'Organization.uuid AS id',
    'Organization.created_at',
    'Organization.updated_at',
    'Account.uuid AS account_id',
    'Organization.name',
    'Color.uuid AS color_id',
    'Color.foreground',
    'Color.background'
  )
  .from( 'Organization' )
  .leftJoin( 'Color', 'Color.id', 'Organization.color_id' )
  .leftJoin( 'DeveloperOrganization', 'DeveloperOrganization.organization_id', 'Organization.id' )
  .leftJoin( 'Developer', 'Developer.id', 'DeveloperOrganization.developer_id' )
  .leftJoin( 'Account', 'Account.id', 'Developer.account_id' )
  .where( {
    'Developer.uuid': req.params.id 
  } );

  developer.roles = await req.db
  .select(
    'Role.uuid AS id',
    'Role.created_at',
    'Role.updated_at',
    'Account.uuid AS account_id',
    'Role.name',
    'Color.uuid AS color_id',
    'Color.foreground',
    'Color.background'
  )
  .from( 'Role' )
  .leftJoin( 'Color', 'Color.id', 'Role.color_id' )
  .leftJoin( 'DeveloperRole', 'DeveloperRole.role_id', 'Role.id' )
  .leftJoin( 'Developer', 'Developer.id', 'DeveloperRole.developer_id' )
  .leftJoin( 'Account', 'Account.id', 'Developer.account_id' )
  .where( {
    'Developer.uuid': req.params.id 
  } );    

  developer.languages = await req.db
  .select(
    'Language.uuid AS id',
    'Language.created_at',
    'Language.updated_at',
    'Account.uuid AS account_id',
    'Language.name',
    'Color.uuid AS color_id',
    'Color.foreground',
    'Color.background'
  )
  .from( 'Language' )
  .leftJoin( 'Color', 'Color.id', 'Language.color_id' )
  .leftJoin( 'DeveloperLanguage', 'DeveloperLanguage.language_id', 'Language.id' )
  .leftJoin( 'Developer', 'Developer.id', 'DeveloperLanguage.developer_id' )
  .leftJoin( 'Account', 'Account.id', 'Developer.account_id' )
  .where( {
    'Developer.uuid': req.params.id 
  } );        

  developer.skills = await req.db
  .select(
    'Skill.uuid AS id',
    'Skill.created_at',
    'Skill.updated_at',
    'Account.uuid AS account_id',
    'Skill.name',
    'Color.uuid AS color_id',
    'Color.foreground',
    'Color.background'
  )
  .from( 'Skill' )
  .leftJoin( 'Color', 'Color.id', 'Skill.color_id' )
  .leftJoin( 'DeveloperSkill', 'DeveloperSkill.skill_id', 'Skill.id' )
  .leftJoin( 'Developer', 'Developer.id', 'DeveloperSkill.developer_id' )
  .leftJoin( 'Account', 'Account.id', 'Developer.account_id' )
  .where( {
    'Developer.uuid': req.params.id 
  } ); 

  developer.relationships = await req.db
  .select(
    'Relationship.uuid AS id',
    'Relationship.created_at',
    'Relationship.updated_at',
    'Account.uuid AS account_id',
    'Relationship.name',
    'Color.uuid AS color_id',
    'Color.foreground',
    'Color.background'      
  )
  .from( 'Relationship' )
  .leftJoin( 'DeveloperRelationship', 'DeveloperRelationship.relationship_id', 'Relationship.id' )
  .leftJoin( 'Developer', 'Developer.id', 'DeveloperRelationship.developer_id' )
  .leftJoin( 'Account', 'Account.id', 'Developer.account_id' )
  .leftJoin( 'Color', 'Color.id', 'Relationship.color_id' )
  .where( {
    'Developer.uuid': req.params.id 
  } );      

  res.json( developer );
} );

// Read all developers
router.get( '/', async ( req, res ) => {
  let private = false;

  if( req.query.private ) {
    if( req.query.private === 'true' ) {
      private = true;
    }
  }

  let developer = await req.db
  .select(
    'Developer.uuid AS id',
    'Developer.created_at', 
    'Developer.updated_at',
    'Account.uuid AS account_id',
    'Level.uuid AS level_id',
    'Developer.name',
    'Developer.email',
    'Developer.title',
    'Developer.description',
    'Developer.image',
    'Developer.location',
    'Developer.latitude',
    'Developer.longitude',
    'Developer.address',
    'Developer.city',
    'Developer.country',
    'Developer.region',
    'Developer.postal',    
    'Developer.public',
    'Developer.internal'   
  )
  .from( 'Developer' )
  .leftJoin( 'Account', 'Account.id', 'Developer.account_id' )
  .leftJoin( 'Level', 'Level.id', 'Developer.level_id' )
  .where( 
    'Developer.public',
    private ? '>=' : '=',
    private ? 0 : 1
  )
  .where( {
    'Account.uuid': req.account.uuid
  } )
  .orderBy( 'Developer.name' );

  res.json( developer );
} );

// Associate developer with model
// Single association per invocation
// Language
// Organization
// Role
// Skill
router.post( '/:id/:model', async ( req, res ) => {
  const field = req.params.model.toLowerCase();
  const entity = field.replace( /^\w/, c => c.toUpperCase() );

  let record = {
    id: null,
    created_at: new Date(),
    updated_at: new Date(),
    developer_uuid: req.params.id,
    name: req.body.name.trim()
  };
  record[`${field}_uuid`] = req.body.id;

  // Skill reference not defined
  // Check and see if it exists by name
  if( record[`${field}_uuid`] === null ) {
    let match = await req.db
    .select(
      'id',
      'uuid'
    )
    .from( entity )
    .whereRaw( `LOWER( name ) = ?`, [record.name.toLowerCase()] ) 
    .first(); 

    // Nope
    if( match === undefined ) {
      // Establish UUID
      record[`${field}_uuid`] = uuidv4();

      // Created, updated
      let stamp = new Date();

      // Insert
      let info = await req.db( entity )
      .insert( {
        id: null,
        uuid: record[`${field}_uuid`],
        created_at: stamp,
        updated_at: stamp,
        account_id: req.account.id,
        name: req.body.name.trim()
      } );

      // Row ID
      record[`${field}_id`] = info[0];
    } else {
      // Yes
      // Use that existing skill
      record[`${field}_uuid`] = match.uuid;
      record[`${field}_id`] = match.id;
    }
  }

  let existing = await req.db
  .select(
    `${entity}.uuid AS ${field}_id`,    
    `${entity}.name`    
  )
  .from( entity )
  .leftJoin( `Developer${entity}`, `Developer${entity}.${field}_id`, `${entity}.id` )
  .leftJoin( 'Developer', 'Developer.id', `Developer${entity}.developer_id` )
  .where( 'Developer.uuid', record.developer_uuid )
  .where( `${entity}.uuid`, record[`${field}_uuid`] )
  .first();

  // Nope
  if( existing === undefined ) {
    // Lookup developer ID
    let developer = await req.db
    .select( 'id' )
    .from( 'Developer' )
    .where( {
      uuid: record.developer_uuid
    } )
    .first();

    // Lookup skill ID
    let key = await req.db
    .select( 'id' )
    .from( entity )
    .where( {
      uuid: record[`${field}_uuid`]
    } )
    .first();    
    record[`${field}_id`] = key.id;

    // Form record to insert
    let stamp = new Date();
    let relationship = uuidv4();

    let row = {
      id: null,
      uuid: relationship,
      created_at: stamp,
      updated_at: stamp,
      developer_id: developer.id
    };
    row[`${field}_id`] = record[`${field}_id`];

    // Insert relation
    await req.db( `Developer${entity}` )
    .insert( row );

    // Resulting skill
    // Not relationship
    record = {
      id: record[`${field}_uuid`],
      name: record.name
    };
  } else {
    record = {
      id: record[`${field}_uuid`],
      name: record.name
    };
  }

  res.json( record );
} );

// Create developer
router.post( '/', async ( req, res ) => {
  let record = {
    id: null,
    uuid: uuidv4(),
    created_at: new Date(),
    updated_at: new Date(),
    account_id: req.account.id,
    account_uuid: req.account.uuid,
    level_uuid: req.body.level_id,
    name: req.body.name,
    email: req.body.email,
    title: req.body.title,
    description: req.body.description,
    image: req.body.image,
    location: req.body.location,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    address: req.body.address,
    city: req.body.city,
    country: req.body.country,
    region: req.body.region,
    postal: req.body.postal,
    public: req.body.public,
    internal: req.body.internal
  };

  // Lookup level ID as needed
  if( record.level_uuid !== null ) {
    let level = await req.db
    .select( 'id' )
    .from( 'level' )
    .where( 'uuid', record.level_uuid )
    .first()
    record.level_id = level.id;
  } else {
    record.level_id = null;
  }

  // Location provided
  if( record.location !== null ) {
    // But specifics are unknown
    // Lookup some data
    if( record.latitude === null ) {
      // Get access token
      // Tokens only good for two hours
      let auth = await rp( 'https://www.arcgis.com/sharing/rest/oauth2/token', {
        method: 'POST',
        form: {
          client_id: req.config.esri.client_id,
          client_secret: req.config.esri.client_secret,
          grant_type: 'client_credentials'
        },
        json: true
      } );

      // Geocode provided location
      let results = await rp( 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates', {
        qs: {
          f: 'json',
          SingleLine: record.location,
          forStorage: req.config.esri.storage,
          outFields: 'StAddr,City,Country,Region,RegionAbbr,Postal',                
          token: auth.access_token
        },
        json: true
      } );

      // TODO: What if there are no location results

      // Geolocation
      record.latitude = results.candidates[0].location.y;
      record.longitude = results.candidates[0].location.x;
      record.address = results.candidates[0].attributes.StAddr.length === 0 ? null : results.candidates[0].attributes.StAddr;
      record.city = results.candidates[0].attributes.City.length === 0 ? null : results.candidates[0].attributes.City;      
      record.region = results.candidates[0].attributes.Region.length === 0 ? null : results.candidates[0].attributes.Region;
      record.postal = results.candidates[0].attributes.Postal.length === 0 ? null : results.candidates[0].attributes.Postal;      
      record.country = results.candidates[0].attributes.Country.length === 0 ? null : results.candidates[0].attributes.Country;
    }
  }

  await req.db( 'Developer' )
  .insert( {
    id: record.id,
    uuid: record.uuid,
    created_at: record.created_at,
    updated_at: record.updated_at,
    account_id: record.account_id,
    level_id: record.level_id,
    name: record.name,
    email: record.email,
    title: record.title,
    description: record.description,
    image: record.image,
    location: record.location,
    latitude: record.latitude,
    longitude: record.longitude,
    address: record.address,
    city: record.city,
    region: record.region,
    postal: record.postal,
    country: record.country,
    public: record.public,
    internal: record.internal
  } );

  res.json( {
    id: record.uuid,
    created_at: record.created_at,
    updated_at: record.updated_at,
    account_id: record.account_uuid,
    level_id: record.level_uuid,
    name: record.name,
    email: record.email,
    title: record.title,
    description: record.description,
    image: record.image,
    location: record.location,
    latitude: record.latitude,
    longitude: record.longitude,
    address: record.address,
    city: record.city,
    region: record.region,
    postal: record.postal,
    country: record.country,    
    public: record.public,
    internal: record.internal
  } );
} );

// Update developer relations
// Language
// Organization
// Role
// Skill
router.put( '/:id/:model', async ( req, res ) => {
  const field = req.params.model.toLowerCase();
  const entity = field.replace( /^\w/, c => c.toUpperCase() );

  let listing = [];

  // Preserve existing relationships
  // Between developer and model
  let relationships = await req.db
  .select(
    `Developer${entity}.id`,
    `${entity}.uuid AS ${field}_id`
  )
  .from( entity )
  .leftJoin( `Developer${entity}`, `Developer${entity}.${field}_id`, `${entity}.id` )
  .leftJoin( 'Developer', 'Developer.id', `Developer${entity}.developer_id` )
  .where( {
    'Developer.uuid': req.params.id
  } );

  // Loop through model items provided as array
  for( let a = 0; a < req.body.length; a++ ) {
    let record = {
      id: null,
      developer_uuid: req.params.id,
      name: req.body[a].name
    }
    record[`${field}_uuid`] = req.body[a].id;

    // Check if model item exists
    // By name
    // Case-insensitive
    let existing = await req.db
    .select(
      'uuid AS id',
      'created_at',
      'updated_at',
      'name'
    )
    .from( entity )
    .whereRaw( 'LOWER( name ) = ?', [record.name.trim().toLowerCase()] )
    .first();

    // Model item does not exist
    if( existing === undefined ) {
      // Assign external UUID
      // Assign created and updated stamps
      record[`${field}_uuid`] = uuidv4();
      record.created_at = new Date();
      record.updated_at = new Date();

      // Create model item
      await req.db( entity )
      .insert( {
        id: record.id,
        uuid: record[`${field}_uuid`],
        created_at: record.created_at,
        updated_at: record.updated_at,
        account_id: req.account.id,
        name: record.name
      } );
    } else {
      // Carry over existing model item data
      record[`${field}_uuid`] = existing.id;
      record.created_at = existing.created_at;
      record.updated_at = existing.updated_at;        
      record.account_id = req.account.id;
      record.name = existing.name;
    }

    // Model item exists
    // Check if relationship to developer exists
    let relates = await req.db
    .select(
      `Developer${entity}.uuid AS id`,
      `Developer${entity}.created_at`,
      `Developer${entity}.updated_at`,
      `Developer.uuid AS developer_id`,
      `${entity}.uuid AS ${field}_id`,
      `${entity}.name`
    )
    .from( entity )
    .leftJoin( `Developer${entity}`, `Developer${entity}.${field}_id`, `${entity}.id` )    
    .leftJoin( 'Developer', 'Developer.id', `Developer${entity}.developer_id` )
    .where( 'Developer.uuid', record.developer_uuid )
    .where( `${entity}.uuid`, record[`${field}_uuid`] )
    .first();

    // No existing relationship
    if( relates === undefined ) {
      // Get internal IDs
      let developer = await req.db
      .select( 'id' )
      .from( 'Developer' )
      .where( {
        uuid: record.developer_uuid
      } )
      .first();

      let key = await req.db
      .select( 'id' )
      .from( entity )
      .where( {
        uuid: record[`${field}_uuid`]
      } )
      .first(); 

      // Assign IDs
      record.developer_id = developer.id;
      record[`${field}_id`] = key.id;
      record.relation_uuid = uuidv4();

      let row = {
        id: record.id,
        uuid: record.relation_uuid,
        created_at: record.created_at,
        updated_at: record.updated_at,
        developer_id: record.developer_id
      };
      row[`${field}_id`] = record[`${field}_id`];

      // Create relationship
      await req.db( `Developer${entity}` )
      .insert( row );
    }
    
    // Mirror model item
    // Hydrated with complete details
    listing.push( {
      id: record[`${field}_uuid`],
      created_at: record.created_at,
      updated_at: record.updated_at,
      developer_id: record.developer_uuid,
      name: record.name
    } );
  }

  // Now check for orphans
  // Model items that used to have an association
  // That are no longer desired to have an association
  for( let a = 0; a < relationships.length; a++ ) {
    let found = false;

    // Name matches
    for( let b = 0; b < listing.length; b++ ) {
      if( relationships[a][`${field}_id`] === listing[b].id ) {
        found = true;
        break;
      }
    }

    // Not found in new associations
    if( !found ) {
      await req.db( `Developer${entity}` )
      .where( {
        id: relationships[a].id
      } )
      .del();
    }
  }

  res.json( listing );
} );

// Update developer
router.put( '/:id', async ( req, res ) => {
  let record = {
    uuid: req.params.id,
    updated_at: new Date(),
    account_id: req.account.id,
    account_uuid: req.account.uuid,
    level_uuid: req.body.level_id,
    name: req.body.name,
    email: req.body.email,
    title: req.body.title,
    description: req.body.description,
    image: req.body.image,
    location: req.body.location,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    address: req.body.address,
    city: req.body.city,
    region: req.body.region,
    postal: req.body.postal,
    country: req.body.country,
    public: req.body.public,
    internal: req.body.internal    
  };

  if( record.level_uuid !== null ) {
    let level = await req.db
    .select( 'id' )
    .from( 'level' )
    .where( 'uuid', record.level_uuid )
    .first();
    record.level_id = level.id;
  } else {
    record.level_id = null;
  }

  // Location provided
  if( record.location !== null ) {
    let existing = {
      location: ''
    };

    if( req.query.hasOwnProperty( 'existing') ) {
      if( req.query.existing === 'true' ) {
        // What is currently stored
        let existing = await req.db
        .select( 'location' )
        .from( 'Developer' )
        .where( {
          uuid: record.uuid
        } )
        .first();
        
        // May be null in the database
        // Force to empty string for easy compare
        if( existing.location === null ) {
          existing.location = '';
        }
      }
    }

    // If the location entries do not match (case-insensitive)
    // Then update geolocation (latitude, longitude)
    if( existing.location.trim().toLowerCase() !== record.location.trim().toLowerCase() ) {
      // Get access token
      // Tokens only good for two hours
      let auth = await rp( 'https://www.arcgis.com/sharing/rest/oauth2/token', {
        method: 'POST',
        form: {
          client_id: req.config.esri.client_id,
          client_secret: req.config.esri.client_secret,
          grant_type: 'client_credentials'
        },
        json: true
      } );

      // Geocode provided location
      let results = await rp( 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates', {
        qs: {
          f: 'json',
          SingleLine: record.location,
          forStorage: req.config.esri.storage,
          outFields: 'StAddr,City,Country,Region,RegionAbbr,Postal',                
          token: auth.access_token
        },
        json: true
      } );
      
      // Geolocation
      record.latitude = results.candidates[0].location.y;
      record.longitude = results.candidates[0].location.x;
      record.address = results.candidates[0].attributes.StAddr.length === 0 ? null : results.candidates[0].attributes.StAddr;
      record.city = results.candidates[0].attributes.City.length === 0 ? null : results.candidates[0].attributes.City;      
      record.region = results.candidates[0].attributes.Region.length === 0 ? null : results.candidates[0].attributes.Region;
      record.postal = results.candidates[0].attributes.Postal.length === 0 ? null : results.candidates[0].attributes.Postal;      
      record.country = results.candidates[0].attributes.Country.length === 0 ? null : results.candidates[0].attributes.Country;      
    }
  }

  await req.db( 'Developer' )
  .update( {
    updated_at: record.updated_at,
    level_id: record.level_id,
    name: record.name,
    email: record.email,
    title: record.title,
    description: record.description,
    image: record.image,
    location: record.location,
    latitude: record.latitude,
    longitude: record.longitude,
    address: record.address,
    city: record.city,
    region: record.region,
    postal: record.postal,
    country: record.country,
    public: record.public,
    internal: record.internal
  } )
  .where( {
    uuid: record.uuid
  } );

  record = await req.db
  .select(
    'Developer.uuid AS id',
    'Developer.created_at',
    'Developer.updated_at',
    'Account.uuid AS account_id',
    'Level.uuid AS level_id',
    'Developer.name',
    'Developer.email',
    'Developer.title',
    'Developer.description',
    'Developer.image',
    'Developer.location',
    'Developer.latitude',
    'Developer.longitude',
    'Developer.address',
    'Developer.city',
    'Developer.region',
    'Developer.postal',
    'Developer.country',
    'Developer.public',
    'Developer.internal'    
  )
  .from( 'Developer' )
  .leftJoin( 'Account', 'Account.id', 'Developer.account_id' )
  .leftJoin( 'Level', 'Level.id', 'Developer.level_id' )  
  .where( {
    'Developer.uuid': record.uuid,
    'Account.id': record.account_id
  } )
  .first();  

  res.json( record );  
} );

// Remove developer relation
// Single relation
// Language
// Organization
// Role
// Skill
router.delete( '/:developer_id/:model/:model_id', async ( req, res ) => {
  const field = req.params.model.toLowerCase();
  const entity = field.replace( /^\w/, c => c.toUpperCase() );

  let developer = await req.db
  .select( 'id' )
  .from( 'Developer' )
  .where( {
    uuid: req.params.developer_id
  } )
  .first();

  let key = await req.db
  .select( 'id' )
  .from( entity )
  .where( {
    uuid: req.params.model_id
  } )
  .first();

  await req.db( `Developer${entity}` )
  .where( `Developer${entity}.developer_id`, developer.id )
  .where( `Developer${entity}.${field}_id`, key.id )
  .del();

  let result = {
    developer_id: req.params.id,
    model: req.params.model
  };
  result[`${field}_id`] = req.params.model_id;

  res.json( result );
} );

// Remove developer relation
// All relations from given model
// Language
// Organization
// Role
// Skill
router.delete( '/:id/:model', async ( req, res ) => {
  const field = req.params.model.toLowerCase();
  const entity = field.replace( /^\w/, c => c.toUpperCase() );

  let developer = await req.db
  .select( 'id' )
  .from( 'Developer' )
  .where( {
    uuid: req.params.id
  } )
  .first();

  await req.db( `Developer${entity}` )
  .where( {
    developer_id: developer.id
  } )
  .del();

  let result = {
    id: req.params.id,
    model: req.params.model
  };

  res.json( result );
} );

// Delete developer
router.delete( '/:id', async ( req, res ) => {
  let deep = true;

  if( req.query.deep ) {
    if( req.query.deep === 'false' ) {
      deep = false;
    }
  }

  // Get developer ID (not UUID)
  let developer = await req.db
  .select( 'id', 'account_id' )
  .from( 'Developer' )
  .where( {
    uuid: req.params.id
  } )
  .first();

  // Languages
  await req.db( 'DeveloperLanguage' )
  .where( {
    developer_id: developer.id
  } )
  .del();
  
  // Organizations
  await req.db( 'DeveloperOrganization' )
  .where( {
    developer_id: developer.id
  } )
  .del();

  // Relationships
  await req.db( 'DeveloperRelationship' )
  .where( {
    developer_id: developer.id
  } )
  .del();  

  // Roles
  await req.db( 'DeveloperRole' )
  .where( {
    developer_id: developer.id
  } )
  .del();

  // Notes
  await req.db( 'Note' )
  .where( {
    developer_id: developer.id
  } )
  .del();
  
  // Skills
  await req.db( 'DeveloperSkill' )
  .where( {
    developer_id: developer.id
  } )
  .del();

  // Account
  await req.db( 'Developer' )
  .where( {
    id: developer.id
  } )
  .del();

  // LinkedIn
  await req.db( 'LinkedIn' )
  .where( {
    developer_id: developer.id
  } )
  .del();  

  // Website
  await req.db( 'Website' )
  .where( {
    developer_id: developer.id
  } )
  .del();

  // Deep deletion
  // Defaults to true
  if( deep ) {
    // Other sources
    let source = [{
      social: 'Blog',
      post: 'BlogPost',
      media: 'BlogPostMedia'
    }, {    
      social: 'Dev',
      post: 'DevPost',
      media: 'DevPostMedia'
    }, {    
      social: 'Medium',
      post: 'MediumPost',
      media: 'MediumPostMedia'
    }, {
      social: 'GitHub',
      post: 'GitHubEvent'
    }, {
      social: 'Reddit',
      post: 'RedditPost'
    }, {
      social: 'StackOverflow',
      short: 'so',
      post: 'StackOverflowAnswer'
    }, {
      social: 'Twitter',
      post: 'TwitterStatus',
      media: 'TwitterStatusMedia'
    }, {
      social: 'YouTube',
      post: 'YouTubeVideo'
    }];

    // Iterate sources
    for( let s = 0; s < source.length; s++ ) {
      // StackOverflow shortened to "so"
      // Otherwise lowercase post entity
      let key = source[s].short !== undefined ? source[s].short : source[s].social.toLowerCase();

      // Get details
      let content = await req.db
      .select(
        `${source[s].social}.id AS record_id`, 
        `${source[s].post}.id AS post_id`        
      )
      .from( source[s].social )
      .leftJoin( `${source[s].post}`, `${source[s].post}.${key}_id`, `${source[s].social}.id` )
      .where( `${source[s].social}.developer_id`, developer.id )
      .first();

      // Content exists
      if( content ) {
        // If there is media storage
        if( source[s].media !== undefined ) {
          // Remove media
          // TODO: DELETE Media
          // TODO: Then DELETE PostMedia
          // TODO: May require a SELECT
          await req.db( `${source[s].media}` )
          .where( `${source[s].media}.post_id`, content.post_id )
          .del();
        }

        // Remove posts
        await req.db( `${source[s].post}` )
        .where( `${source[s].post}.${key}_id`, content.record_id )
        .del(); 

        // Remove social
        await req.db( `${source[s].social}` ) 
        .where( `${source[s].social}.id`, content.record_id )
        .del();
      }      
    }
  }

  res.json( {
    id: req.params.id
  } );
} );

// Export
module.exports = router;
