const express = require( 'express' );
const uuidv4 = require( 'uuid' );

// Router
let router = express.Router();

// Test
router.get( '/test', ( req, res ) => {    
  res.json( {contribution: 'Test'} );
} );

// Read all contributions for given developer
router.get( '/developer/:id', async ( req, res ) => {
  let month = new Date();
  month.setDate( month.getDate() - 30 );

  let records = await req.db
  .select(
    'Contribution.uuid AS id',
    'Contribution.created_at',
    'Contribution.updated_at',
    'Developer.uuid AS developer_id',
    'Contribution.contributed_at',
    'Contribution.description',
    'Contribution.link',
    'Contribution.public',
    'Capacity.uuid AS capacity_id',
    'Capacity.name AS capacity_name',
    'Contribution.reference_id'
  )
  .from( 'Contribution' )
  .leftJoin( 'Capacity', 'Contribution.capacity_id', 'Capacity.id' )
  .leftJoin( 'Developer', 'Contribution.developer_id', 'Developer.id' )
  .where( {
    'Developer.uuid': req.params.id
  } )
  .where( 'Contribution.contributed_at', '>', month )
  .orderBy( 'Contribution.contributed_at', 'desc' );  

  for( let r = 0; r < records.length; r++ ) {
    /*
    let listing = await req.db
    .select( 
      'Role.uuid AS id',
      'Role.created_at', 
      'Role.updated_at', 
      'Role.name',
      'Color.uuid AS color_id',
      'Color.foreground',
      'Color.background'
    )
    .from( 'Role' )
    .leftJoin( 'Color', 'Color.id', 'Role.color_id' )
    .leftJoin( 'ContributionRole', 'ContributionRole.role_id', 'Role.id' ) 
    .leftJoin( 'Contribution', 'Contribution.id',  'ContributionRole.contribution_id' )
    .where( {
      'Contribution.uuid': records[r].id
    } );    

    records[r].roles = listing.slice();
    */
   records[r].roles = [];
  }

  res.json( records );
} );

// Read single record by reference ID
router.get( '/reference/:id', async ( req, res ) => {
  let record = await req.db
  .select( 
    'Contribution.uuid AS id',
    'Contribution.created_at',
    'Contribution.updated_at',
    'Developer.uuid AS developer_id',
    'Contribution.contributed_at',
    'Contribution.description',
    'Contribution.link',
    'Contribution.public',
    'Capacity.uuid AS capacity_id',
    'Capacity.name AS capacity_name',
    'Contribution.reference_id'
  )
  .from( 'Contribution' )
  .leftJoin( 'Developer', 'Contribution.developer_id', 'Developer.id' )
  .leftJoin( 'Capacity', 'Contribution.capacity_id', 'Capacity.id' )
  .where( {
    'Contribution.reference_id': req.params.id
  } )
  .first();

  if( record === undefined ) {
    record = null;
  } else {
    let listing = await req.db
    .select( 
      'Role.uuid AS id',
      'Role.created_at', 
      'Role.updated_at', 
      'Role.name'    
    )
    .from( 'Role' )
    .leftJoin( 'ContributionRole', 'ContributionRole.role_id', 'Role.id' ) 
    .leftJoin( 'Contribution', 'Contribution.id',  'ContributionRole.contribution_id' )
    .where( {
      'Contribution.uuid': req.params.id
    } );    

    record.roles = listing.slice();    
  }

  res.json( record );
} );

// Read roles
router.get( '/:id/role', async ( req, res ) => {
  let listing = await req.db
  .select( 
    'Role.uuid AS id',
    'Role.created_at', 
    'Role.updated_at', 
    'Role.name'    
  )
  .from( 'Role' )
  .leftJoin( 'ContributionRole', 'ContributionRole.role_id', 'Role.id' ) 
  .leftJoin( 'Contribution', 'Contribution.id',  'ContributionRole.contribution_id' )
  .where( {
    'Contribution.uuid': records[r].id
  } );    

  res.json( listing );
} );

// Read single record by ID
router.get( '/:id', async ( req, res ) => {
  let record = await req.db
  .select( 
    'Contribution.uuid AS id',
    'Contribution.created_at',
    'Contribution.updated_at',
    'Developer.uuid AS developer_id',
    'Contribution.contributed_at',
    'Contribution.description',
    'Contribution.link',
    'Contribution.public',
    'Capacity.uuid AS capacity_id',
    'Capacity.name AS capacity_name',
    'Contribution.reference_id'
  )
  .from( 'Contribution' )
  .leftJoin( 'Developer', 'Contribution.developer_id', 'Developer.id' )
  .leftJoin( 'Capacity', 'Contribution.capacity_id', 'Capacity.id' )
  .where( {
    'Contribution.uuid': req.params.id
  } )
  .first();

  if( record === undefined ) {
    record = null;
  } else {
    let listing = await req.db
    .select( 
      'Role.uuid AS id',
      'Role.created_at', 
      'Role.updated_at', 
      'Role.name'    
    )
    .from( 'Role' )
    .leftJoin( 'ContributionRole', 'ContributionRole.role_id', 'Role.id' ) 
    .leftJoin( 'Contribution', 'Contribution.id',  'ContributionRole.contribution_id' )
    .where( {
      'Contribution.uuid': req.params.id
    } );    

    record.roles = listing.slice();    
  }

  res.json( record );
} );

// Read all records
router.get( '/', async ( req, res ) => {
  let records = await req.db
  .select(
    'Contribution.uuid AS id',
    'Contribution.created_at',
    'Contribution.updated_at',
    'Developer.uuid AS developer_id',
    'Contribution.contributed_at',
    'Contribution.description',
    'Contribution.link',
    'Contribution.public',
    'Capacity.uuid AS capacity_id',
    'Capacity.name AS capacity_name',
    'Contribution.reference_id'
  )
  .from( 'Contribution' )
  .leftJoin( 'Developer', 'Contribution.developer_id', 'Developer.id' )
  .leftJoin( 'Capacity', 'Contribution.capacity_id', 'Capacity.id' )
  .orderBy( 'Contribution.contributed_at' );

  res.json( records );
} );

// Associate contribution with role
router.post( '/:id/role', async ( req, res ) => {
  let record = {
    id: null,
    created_at: new Date(),
    updated_at: new Date(),
    contribution_uuid: req.params.id,
    name: req.body.name.trim()
  };
  record['role_uuid'] = req.body.id;

  // Reference not defined
  // Check and see if it exists by name
  if( record['role_uuid'] === null ) {
    let match = await req.db
    .select(
      'id',
      'uuid'
    )
    .from( 'Role' )
    .whereRaw( 'LOWER( name ) = ?', [record.name.toLowerCase()] ) 
    .first(); 

    // Nope
    if( match === undefined ) {
      // Establish UUID
      record['role_uuid'] = uuidv4();

      // Created, updated
      let stamp = new Date();

      // Insert
      let info = await req.db( 'Role' )
      .insert( {
        id: null,
        uuid: record['role_uuid'],
        created_at: stamp,
        updated_at: stamp,
        name: req.body.name.trim()
      } )
      .returning( 'id' );

      // Row ID
      record['role_id'] = info[0];
    } else {
      // Yes
      // Use that existing skill
      record['role_uuid'] = match.uuid;
      record['role_id'] = match.id;
    }
  }

  let existing = await req.db
  .select(
    'Role.uuid AS role_id',    
    'Role.name'
  )
  .from( 'Role' )
  .leftJoin( 'ContributionRole', 'ContributionRole.role_id', 'Role.id' )
  .leftJoin( 'Contribution', 'Contribution.id', 'ContributionRole.contribution_id' )
  .where( 'Contribution.uuid', record.contribution_uuid )
  .where( 'Role.uuid', record['role_uuid'] )
  .first();

  // Nope
  if( existing === undefined ) {
    // Lookup developer ID
    let contribution = await req.db
    .select( 'id' )
    .from( 'Contribution' )
    .where( {
      uuid: record.contribution_uuid
    } )
    .first();

    // Lookup ID
    let key = await req.db
    .select( 'id' )
    .from( 'Role' )
    .where( {
      uuid: record['role_uuid']
    } )
    .first();    
    record['role_id'] = key.id;

    // Form record to insert
    let stamp = new Date();
    let relationship = uuidv4();

    let row = {
      id: null,
      uuid: relationship,
      created_at: stamp,
      updated_at: stamp,
      contribution_id: contribution.id
    };
    row['role_id'] = record['role_id'];

    // Insert relation
    await req.db( 'ContributionRole' )
    .insert( row );

    // Result
    // Not relationship
    record = {
      id: record['role_uuid'],
      name: record.name
    };
  } else {
    record = {
      id: record['role_uuid'],
      name: record.name
    };
  }

  res.json( record );
} );

// Create
router.post( '/', async ( req, res ) => {
  let record = {
    id: null,
    uuid: uuidv4(),
    created_at: new Date(),
    updated_at: new Date(),
    developer_uuid: req.body.developer_id,
    contributed_at: new Date( req.body.contributed_at ),
    description: req.body.description,
    link: req.body.link,
    public: req.body.public,
    capacity_uuid: req.body.capacity_id,
    reference_id: req.body.reference_id
  };

  let developer = await req.db
  .select( 'id' )
  .from( 'Developer' )
  .where( {
    uuid: record.developer_uuid
   } )
  .first();
  record.developer_id = developer.id;

  let capacity = await req.db
  .select( 'id', 'name' )
  .from( 'Capacity' )
  .where( {
    uuid: record.capacity_uuid
   } )
  .first();
  record.capacity_id = capacity.id;
  record.capacity_name = capacity.name;

  // SQLite does not support date objects
  // Store as string
  if( req.db.client.config.client === 'sqlite3' ) {
    record.created_at = record.created_at.toISOString();
    record.updated_at = record.updated_at.toISOString();
    record.contributed_at = record.contributed_at.toISOString();    
  }  

  await req.db( 'Contribution' )
  .insert( {
    id: record.id,
    uuid: record.uuid,
    created_at: record.created_at,
    updated_at: record.updated_at,
    developer_id: record.developer_id,
    contributed_at: record.contributed_at,
    description: record.description,
    link: record.link,
    public: record.public,
    capacity_id: record.capacity_id,
    reference_id: record.reference_id
  } );
    
  record = {
    id: record.uuid,
    created_at: record.created_at,
    updated_at: record.updated_at,
    developer_id: record.developer_uuid,
    contributed_at: record.contributed_at,
    description: record.description,
    link: record.link,
    public: record.public,
    capacity_id: record.capacity_uuid,
    capacity_name: record.capacity_name,
    reference_id: record.reference_id
  };

  res.json( record );
} );

// Update roles
// Outright sets roles
// Removes existing
// Array
router.put( '/:id/role', async ( req, res ) => {
  let listing = []; 

  // Preserve existing relationships
  // Between developer and model
  let relationships = await req.db
  .select(
    'ContributionRole.id',
    'Role.uuid AS role_id'
  )
  .from( 'Role' )
  .leftJoin( 'ContributionRole', 'ContributionRole.role_id', 'Role.id' )
  .leftJoin( 'Contribution', 'Contribution.id', 'ContributionRole.contribution_id' )
  .where( {
    'Contribution.uuid': req.params.id
  } );

  // Loop through model items provided as array
  for( let a = 0; a < req.body.length; a++ ) {
    let record = {
      id: null,
      contribution_uuid: req.params.id,
      account_uuid: req.body[a].account_id,
      name: req.body[a].name,
      color_uuid: req.body[a].color_id,
      foreground: req.body[a].foreground,
      background: req.body[a].background,
      count: req.body[a].count      
    }
    record['role_uuid'] = req.body[a].id;

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
    .from( 'Role' )
    .whereRaw( 'LOWER( name ) = ?', [record.name.trim().toLowerCase()] )
    .first();

    // Model item does not exist
    if( existing === undefined ) {
      // Assign external UUID
      // Assign created and updated stamps
      record['role_uuid'] = uuidv4();
      record.created_at = new Date();
      record.updated_at = new Date();

      // Create model item
      await req.db( 'Role' )
      .insert( {
        id: record.id,
        uuid: record['role_uuid'],
        created_at: record.created_at,
        updated_at: record.updated_at,
        name: record.name
      } );
    } else {
      // Carry over existing model item data
      record['role_uuid'] = existing.id;
      record.created_at = existing.created_at;
      record.updated_at = existing.updated_at;        
      record.name = existing.name;
    }

    // Model item exists
    // Check if relationship to contribution exists
    let relates = await req.db
    .select(
      'ContributionRole.uuid AS id',
      'ContributionRole.created_at',
      'ContributionRole.updated_at',
      'Contribution.uuid AS contribution_id',
      'Role.uuid AS role_id',
      'Role.name'
    )
    .from( 'Role' )
    .leftJoin( 'ContributionRole', 'ContributionRole.role_id', 'Role.id' )    
    .leftJoin( 'Contribution', 'Contribution.id', 'ContributionRole.contribution_id' )
    .where( 'Contribution.uuid', record.contribution_uuid )
    .where( 'Role.uuid', record['role_uuid'] )
    .first();

    // No existing relationship
    if( relates === undefined ) {
      // Get internal IDs
      let contribution = await req.db
      .select( 'id' )
      .from( 'Contribution' )
      .where( {
        uuid: record.contribution_uuid
      } )
      .first();

      let key = await req.db
      .select( 'id' )
      .from( 'Role' )
      .where( {
        uuid: record['role_uuid']
      } )
      .first(); 

      // Assign IDs
      record.contribution_id = contribution.id;
      record['role_id'] = key.id;
      record.relation_uuid = uuidv4();

      let row = {
        id: record.id,
        uuid: record.relation_uuid,
        created_at: record.created_at,
        updated_at: record.updated_at,
        contribution_id: record.contribution_id
      };
      row['role_id'] = record['role_id'];

      // Create relationship
      await req.db( 'ContributionRole' )
      .insert( row );
    }
    
    // Mirror model item
    // Hydrated with complete details
    listing.push( {
      id: record['role_uuid'],
      created_at: record.created_at,
      updated_at: record.updated_at,
      account_id: record.account_uuid,
      contribution_id: record.contribution_uuid,
      name: record.name,
      color_id: record.color_uuid,
      foreground: record.foreground,
      background: record.background,
      count: record.count      
    } );
  }

  // Now check for orphans
  // Model items that used to have an association
  // That are no longer desired to have an association
  for( let a = 0; a < relationships.length; a++ ) {
    let found = false;

    // Name matches
    for( let b = 0; b < listing.length; b++ ) {
      if( relationships[a]['role_id'] === listing[b].id ) {
        found = true;
        break;
      }
    }

    // Not found in new associations
    if( !found ) {
      await req.db( 'ContributionRole' )
      .where( {
        id: relationships[a].id
      } )
      .del();
    }
  }

  res.json( listing );
} );

// Update
router.put( '/:id', async ( req, res ) => {
  let record = {
    uuid: req.params.id,
    updated_at: new Date(),
    developer_uuid: req.body.developer_id,
    contributed_at: new Date( req.body.contributed_at ),
    description: req.body.description,
    link: req.body.link,
    public: req.body.public,
    capacity_uuid: req.body.capacity_id,
    reference_id: req.body.reference_id
  };

  let developer = await req.db
  .select( 'id' )
  .from( 'Developer' )
  .where( {
    uuid: record.developer_uuid
  } )
  .first();
  record.developer_id = developer.id;

  let capacity = await req.db
  .select( 'id' )
  .from( 'Capacity' )
  .where( {
    uuid: record.capacity_uuid
  } )
  .first();
  record.capacity_id = capacity.id;  

  // SQLite does not support date objects
  // Store as string
  if( req.db.client.config.client === 'sqlite3' ) {
    record.updated_at = record.updated_at.toISOString();
    record.contributed_at = record.contributed_at.toISOString();    
  }

  await req.db( 'Contribution' )
  .update( {
    updated_at: record.updated_at,
    developer_id: record.developer_id,
    contributed_at: record.contributed_at,
    description: record.description,
    link: record.link,
    public: record.public,
    capacity_id: record.capacity_id,
    reference_id: record.reference_id
  } )
  .where( {
    uuid: record.uuid
  } );

  record = await req.db
  .select(
    'Contribution.uuid AS id',
    'Contribution.created_at',
    'Contribution.updated_at',
    'Developer.uuid AS developer_id',
    'Contribution.contributed_at',
    'Contribution.description',
    'Contribution.link',
    'Contribution.public',
    'Capacity.uuid AS capacity_id',
    'Capacity.name AS capacity_name',
    'Contribution.reference_id'
  )
  .from( 'Contribution' )
  .leftJoin( 'Developer', 'Contribution.developer_id', 'Developer.id' )
  .leftJoin( 'Capacity', 'Contribution.capacity_id', 'Capacity.id' )
  .where( {
    'Contribution.uuid': record.uuid
  } )
  .first();

  res.json( record );  
} );

// Remove role association
// Single relation
router.delete( '/:contribution_id/role/:role_id', async ( req, res ) => {
  let contribution = await req.db
  .select( 'id' )
  .from( 'Contribution' )
  .where( {
    uuid: req.params.contribution_id
  } )
  .first();

  let key = await req.db
  .select( 'id' )
  .from( 'Role' )
  .where( {
    uuid: req.params.role_id
  } )
  .first();

  await req.db( 'ContributionRole' )
  .where( 'ContributionRole.contribution_id', contribution.id )
  .where( `ContributionRole.role_id`, key.id )
  .del();

  let result = {
    contribution_id: req.params.id
  };
  result['role_id'] = req.params.role_id;

  res.json( result );
} );

// Remove all role associations
router.delete( '/:id/role', async ( req, res ) => {
  let contribution = await req.db
  .select( 'id' )
  .from( 'Contribution' )
  .where( {
    uuid: req.params.id
  } )
  .first();

  await req.db( 'ContributionRole' )
  .where( {
    contribution_id: contribution.id
  } )
  .del();

  let result = {
    id: req.params.id
  };

  res.json( result );
} );

// Delete
router.delete( '/:id', async ( req, res ) => {
  await req.db( 'Contribution' )
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
