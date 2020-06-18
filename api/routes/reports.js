const express = require( 'express' );
const rp = require( 'request-promise-native' );

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

// Orbit
router.get( '/orbit', async ( req, res ) => {
  let days = 30;
  let server = 'http://localhost:3000/api';

  // User-provided parameter for duration
  if( req.query.hasOwnProperty( 'days' ) ) {
    days = parseInt( req.query.days );
  }

  // Duration to query
  const start = new Date();
  start.setDate( start.getDate() - days );

  // User-provided parameter for server location
  // Default to localhost
  if( req.query.hasOwnProperty( 'server' ) ) {
    server = req.query.server;
  }

  // Develoopers
  // Including interesting metrics
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

  // Rules for account
  const rules = await req.db
  .select(
    'Reach.uuid AS id',
    'Account.uuid AS account_id',
    'Reach.name',
    'Color.uuid AS color_id',
    'Color.foreground',
    'Color.background',
    'Reach.weight',
    'Reach.criteria'
  )
  .from( 'Reach' )
  .leftJoin( 'Account', 'Account.id', 'Reach.account_id' )
  .leftJoin( 'Color', 'Color.id', 'Reach.color_id' )
  .where( {
    'Reach.account_id': req.account.id
  } );

  // Entities
  const entities = await rp( server + '/reach/entities', {
    json: true
  } );

  // Fields
  const fields = await rp( server + '/reach/fields', {
    json: true
  } );

  // Operators
  const operators = ['LIKE', null, '=', '!=', '>', '<', '>=', '<='];

  // For every developer belonging to this account
  for( let d = 0; d < developers.length; d++ ) {
    // Seed values
    developers[d].love = 0;
    developers[d].activity = 0;
    developers[d].reach = 0;
    developers[d].gravity = 0;
    developers[d].level = 0;

    // Reach rules
    for( let r = 0; r < rules.length; r++ ) {
      // No query specified
      // Next rule, please!
      if( rules[r].criteria === null ) {
        continue;
      }

      // Query parts
      const criteria = rules[r].criteria.split( ',' );     
      
      // Columns
      const columns = [];

      // Break down to query parts
      // Mostly for code readability
      const query = [{
        clause: null,
        entity: entities[parseInt( criteria[0] )],
        field: fields[entities[parseInt( criteria[0] )].label][parseInt( criteria[1] )],
        compare: parseInt( criteria[2] ),
        value: criteria[3]
      }];
      columns.push( query[0].entity.table + '.' + query[0].field.column );

      // Two-part query
      if( criteria > 4 ) {
        query.push( {
          clause: parseInt( criteria[4] ),
          entity: entities[parseInt( criteria[0] )],
          field: fields[entities[parseInt( criteria[0] )].label][parseInt( criteria[5] )],
          compare: parseInt( criteria[6] ),
          value: criteria[7]
        } );
        columns.push( query[0].entity.table + '.' + query[1].field.column );        
      }

      // Prepare distinct parts
      for( let q = 0; q < query.length; q++ ) {
        switch( query[q].compare ) {
          case 0:
            query[q].field = query[q].entity.table + '.' + query[q].field.column;
            query[q].compare = 'LIKE';
            query[q].value = `%${query[q].value}%`;
            break;

          case 1:
            query[q].field = query[q].entity.table + '.' + query[q].entity.contributed;
            query[q].compare = '>';
            query[q].value = start;
            break;

          default:
            query[q].field = query[q].field.column;
            query[q].compare = operators[query[q].compare];
            query[q].value = parseInt( query[q].value );            
        }
      }

      // Run query
      // Inline modifications
      const check = await req.db
      .select( columns )
      .from( query[0].entity.table )
      .modify( ( builder ) => {
        // Relate to developer
        if( query[0].entity.parent === null ) {
          builder.leftJoin( 'Developer', 'Developer.id', query[0].entity.table + '.developer_id' );
        } else {
          builder.leftJoin( query[0].entity.parent, query[0].entity.parent + '.id', query[0].entity.table + '.' + query[0].entity.join );
          builder.leftJoin( 'Developer', 'Developer.id', query[0].entity.parent + '.developer_id' );          
        }

        // Match to developer
        builder.where( 'Developer.uuid', '=', developers[d].id )        

        // Match to criteria
        for( let q = 0; q < query.length; q++ ) {
          if( q === 0 ) {
            builder.andWhere( query[q].field, query[q].compare, query[q].value );        
          } else {
            if( query[q].clause === 0 ) {
              builder.andWhere( query[q].field, query[q].compare, query[q].value );        
            } else {
              builder.orWhere( query[q].field, query[q].compare, query[q].value );        
            }
          }
        }
      } )
      .first();

      // Add score to reach
      if( check !== undefined ) {
        developers[d].reach = developers[d].reach + rules[r].weight;
      }
    }

    // Moving on to contributions
    // For this developer
    // Over specified period of time
    // TODO: Parameterize period
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
    for( let c = 0; c < contributions.length; c++ ) {
      developers[d].love = Math.max( contributions[c].weight, developers[d].love );
      developers[d].activity = contributions[c].weight + developers[d].activity;
    }

    // Gravity
    developers[d].gravity = developers[d].love * developers[d].reach;    
    
    // Levels
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

// Export
module.exports = router;
