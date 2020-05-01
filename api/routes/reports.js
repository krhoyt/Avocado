const express = require( 'express' );

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
  res.json( {reports: 'Test'} );
} );

// Orbit
router.get( '/orbit', async ( req, res ) => {
  const developers = await req.db
  .select(
    'Developer.uuid AS id', 
    'Account.uuid AS account_id',
    'Developer.name',
    'Developer.email',
    'Developer.location',
    'Developer.region',
    'Developer.country',
    'Twitter.followers AS twitter',
    'GitHub.followers AS github',
    'Medium.followed_by AS medium'
  )
  .from( 'Developer' )
  .leftJoin( 'Account', 'Account.id', 'Developer.account_id' )
  .leftJoin( 'Twitter', 'Twitter.developer_id', 'Developer.id' )
  .leftJoin( 'GitHub', 'GitHub.developer_id', 'Developer.id' )
  .leftJoin( 'Medium', 'Medium.developer_id', 'Developer.id' )
  .where( {
    'Developer.account_id': req.account.id
  } )
  .orderBy( 'Developer.name' );

  const start = new Date();
  start.setDate( start.getDate() - 30 );

  for( let d = 0; d < developers.length; d++ ) {
    const contributions = await req.db
    .select(
      'Contribution.uuid AS id',
      'Contribution.created_at',
      'Contribution.updated_at',
      'Developer.uuid AS developer_id',
      'Contribution.contributed_at',
      'Contribution.description',
      'Capacity.uuid AS capacity_id',
      'Capacity.name',
      'Color.uuid AS color_id',
      'Color.foreground',
      'Color.background',
      'Capacity.weight'

    )
    .from( 'Contribution' )
    .leftJoin( 'Developer', 'Developer.id', 'Contribution.developer_id' )
    .leftJoin( 'Capacity', 'Capacity.id', 'Contribution.capacity_id' )
    .leftJoin( 'Color', 'Color.id', 'Capacity.color_id' )
    .where( 'Developer.uuid', developers[d].id )
    .where( 'Contribution.contributed_at', '>', start )
    .orderBy( 'Contribution.contributed_at', 'desc' );

    // Love
    // Activity
    let maximum = 0;
    let sum = 0;

    for( let c = 0; c < contributions.length; c++ ) {
      maximum = Math.max( contributions[c].weight, maximum );
      sum = contributions[c].weight + sum;
    }

    developers[d].love = maximum,
    developers[d].activity = sum;
    developers[d].reach = 0;

    // Reach
    if( developers[d].twitter > 1000 ) {
      developers[d].reach = developers[d].reach + 1;
    }

    if( developers[d].github > 100 ) {
      developers[d].reach = developers[d].reach + 1;
    }    

    if( developers[d].medium > 100 ) {
      developers[d].reach = developers[d].reach + 1;
    }    

    if( developers[d].medium > 300 ) {
      developers[d].reach = developers[d].reach + 2;
    }     

    // Gravity
    developers[d].gravity = developers[d].love * developers[d].reach;
    
    // Levels
    developers[d].level = 0;

    if( developers[d].love >= 0 && developers[d].love <= 2 ) {
      developers[d].level = 4;
    } else if( developers[d].love >= 3 && developers[d].love <= 6 ) {
      developers[d].level = 3;
    } else if( developers[d].love >= 7 && developers[d].love <= 8 ) {
      developers[d].level = 2;
    } else if( developers[d].love >= 9 && developers[d].love <= 10 ) {
      developers[d].level = 1;
    }
  }

  res.json( developers );
} );

// Directory
// Including geolocation data
router.get( '/directory', async ( req, res ) => {
  const developers = await req.db
  .select(
    'Developer.uuid AS id', 
    'Developer.name',
    'Developer.email',
    'Developer.location',
    'Developer.latitude',
    'Developer.longitude',
    'Developer.country'
  )
  .from( 'Developer' )
  .orderBy( 'Developer.name' );

  for( let d = 0; d < developers.length; d++ ) {
    developers[d].roles = await req.db
    .select( 'Role.name' )
    .from( 'Role' )
    .leftJoin( 'DeveloperRole', 'DeveloperRole.role_id', 'Role.id' )
    .leftJoin( 'Developer', 'Developer.id', 'DeveloperRole.developer_id' )
    .where( 'Developer.uuid', developers[d].id )
    .orderBy( 'Role.name' );
    developers[d].area = developers[d].roles.length > 0 ? developers[d].roles[0] : null;
  }

  res.json( developers );
} );

// Export
module.exports = router;
