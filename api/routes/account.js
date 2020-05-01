var bcrypt = require( 'bcryptjs' );
const express = require( 'express' );
const uuidv4 = require( 'uuid' );

// Router
let router = express.Router();

// Test
router.get( '/test', ( req, res ) => {    
  res.json( {account: 'Test'} );
} );

// Check if account exists
router.post( '/email', async ( req, res ) => {
  let record = await req.db
  .select(
    'Account.uuid AS id',
    'Account.created_at',
    'Account.updated_at',
    'Owner.uuid AS owner',
    'Account.email',
    'Account.password',
    'Account.role',
    'Account.token'
  )
  .from( 'Account' )
  .leftJoin( 'Account AS Owner', 'Account.owner', 'Owner.id' )
  .where( {
    'Account.email': req.body.email
  } )
  .first();  

  // No matching
  if( record === undefined ) {
    res.json( {
      email: req.body.email,
      found: false
    } );
  } else {
    res.json( {
      email: req.body.email,
      found: true
    } );
  }
} );

// Login
router.post( '/login', async ( req, res ) => {
  let record = await req.db
  .select(
    'Account.uuid AS id',
    'Account.created_at',
    'Account.updated_at',
    'Owner.uuid AS owner',
    'Account.email',
    'Account.password',
    'Account.role',
    'Account.token'
  )
  .from( 'Account' )
  .leftJoin( 'Account AS Owner', 'Account.owner', 'Owner.id' )
  .where( {
    'Account.email': req.body.email
  } )
  .first();  

  // No matching
  if( record === undefined ) {
    res.json( {
      email: req.body.email,
      found: false
    } );
  } else {
    // Password is valid
    if( bcrypt.compareSync( req.body.password, record.password ) ) {
      // Do not send password back
      delete record.password;

      // Response
      res.json( record );
    } else {
      res.json( {
        email: req.body.email,
        found: false
      } );
    }
  }
} );

// Refresh token
router.get( '/:id/token/refresh', async ( req, res ) => {
  let record = {
    updated_at: new Date(),
    token: uuidv4(),
    uuid: req.params.id
  };

  // SQLite does not support date objects
  // Store as string
  if( req.db.client.config.client === 'sqlite3' ) {
    record.updated_at = record.updated_at.toISOString();
  }

  await req.db( 'Account' )
  .update( {
    updated_at: record.updated_at,
    token: record.token
  } )
  .where( {
    uuid: record.uuid
   } );

   res.json( {
     token: record.token
   } );
} );

// Read single record by ID
// Omit password
router.get( '/:id', async ( req, res ) => {
  let record = await req.db
  .select(
    'Account.uuid AS id',
    'Account.created_at',
    'Account.updated_at',
    'Owner.uuid AS owner',
    'Account.email',
    'Account.role',
    'Account.token'
  )
  .from( 'Account' )
  .leftJoin( 'Account AS Owner', 'Account.owner', 'Owner.id' )
  .where( {
    'Account.uuid': req.params.id
  } )
  .first();

  if( record === undefined ) {
    record = null;
  }

  res.json( record );
} );

// Read single record by email address
// Omit password
router.get( '/email/:email', async ( req, res ) => {
  let record = await req.db
  .select(
    'Account.uuid AS id',
    'Account.created_at',
    'Account.updated_at',
    'Owner.uuid AS owner',
    'Account.email',
    'Account.role',
    'Account.token'
  )
  .from( 'Account' )
  .leftJoin( 'Account AS Owner', 'Account.owner', 'Owner.id' )
  .where( {
    'Account.email': req.params.email
  } )
  .first();

  if( record === undefined ) {
    record = null;
  }

  res.json( record );
} );

// Read single record by token
// Omit password
router.get( '/token/:token', async ( req, res ) => {
  let record = await req.db
  .select(
    'Account.uuid AS id',
    'Account.created_at',
    'Account.updated_at',
    'Owner.uuid AS owner',
    'Account.email',
    'Account.role',
    'Account.token'
  )
  .from( 'Account' )
  .leftJoin( 'Account AS Owner', 'Account.owner', 'Owner.id' )
  .where( {
    'Account.token': req.params.token
  } )
  .first();

  if( record === undefined ) {
    record = null;
  }

  res.json( record );
} );

// Read all records
// Omit password
router.get( '/', async ( req, res ) => {
  let records = await req.db
  .select(
    'Account.uuid AS id',
    'Account.created_at',
    'Account.updated_at',
    'Owner.uuid AS owner',
    'Account.email',
    'Account.role',
    'Account.token'
  )
  .from( 'Account' )
  .leftJoin( 'Account AS Owner', 'Account.owner', 'Owner.id' )
  .orderBy( 'Account.email', 'asc' );

  res.json( records );
} );

// Create record
router.post( '/', async ( req, res ) => {
  let record = {
    id: null,
    uuid: uuidv4(),
    created_at: new Date(),
    updated_at: new Date(),
    owner_uuid: req.body.owner,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role,
    token: uuidv4()
  };

  // No duplicate email addresses
  let existing = await req.db
  .select(
    'Account.uuid AS id',
    'Account.created_at',
    'Account.updated_at',
    'Owner.uuid AS owner',
    'Account.email',
    'Account.role',
    'Account.token'
  )
  .from( 'Account' )
  .leftJoin( 'Account AS Owner', 'Account.owner', 'Owner.id' )
  .where( {
    'Account.email': record.email
  } )
  .first();

  if( existing === undefined ) {
    // Hash password
    const salt = bcrypt.genSaltSync( 10 );
    record.password = bcrypt.hashSync( record.password, salt );

    // Get owner if needed
    if( record.owner_uuid !== null ) {
      let owner = await req
      .db( 'Account' )
      .where( {uuid: record.owner_uuid } )
      .first();
      record.owner = owner.id;
    }

    // SQLite does not support date objects
    // Store as string
    if( req.db.client.config.client === 'sqlite3' ) {
      record.created_at = record.created_at.toISOString();
      record.updated_at = record.updated_at.toISOString();
    }

    // Insert
    await req.db( 'Account' )
    .insert( {
      id: record.id,
      uuid: record.uuid,
      created_at: record.created_at,   
      updated_at: record.updated_at,
      owner: record.owner,
      email: record.email,
      password: record.password,
      role: record.role,
      token: record.token
    } );

    // Response
    record = {
      id: record.uuid,
      created_at: record.created_at,
      updated_at: record.updated_at,
      owner: record.owner_uuid,
      email: record.email,
      role: record.role,
      token: record.token
    };
  } else {
    // Respond with existing
    record = existing;
  }

  res.json( record );
} );

// Update record
router.put( '/:id', async ( req, res ) => {
  let record = {
    uuid: req.params.id,
    updated_at: new Date(),
    email: req.body.email,
    owner_uuid: req.body.owner,
    role: req.body.role,
    password: req.body.password
  };

  // SQLite does not support date objects
  // Store as string
  if( req.db.client.config.client === 'sqlite3' ) {
    record.updated_at = record.updated_at.toISOString();
  }

  // Null owner is owner of account
  // Otherwise account association
  if( record.owner_uuid !== null ) {
    let owner = await req.db
    .select( 'id' )
    .from( 'Account' )
    .where( {
      uuid: record.owner_uuid
    } )
    .first();

    record.owner = owner.id;
  } else {
    record.owner = null;
  }

  // Some password value provided
  // Consider it an update and hash
  // Null when no update is desired
  if( record.password !== null ) {
    const salt = bcrypt.genSaltSync( 10 );
    record.password = bcrypt.hashSync( record.password, salt );    

    await req.db( 'Account' )
    .update( {
      updated_at: record.updated_at,
      owner: record.owner,      
      email: record.email,
      password: record.password,
      role: record.role,
      token: record.token
    } )
    .where( {
      uuid: record.uuid
    } );    
  } else {
    await req.db( 'Account' )
    .update( {
      updated_at: record.updated_at,      
      owner: record.owner,      
      email: record.email,
      role: record.role,
      token: record.token
    } )
    .where( {
      uuid: record.uuid
    } );    
  }

  record = await req.db
  .select(
    'Account.uuid AS id',
    'Account.created_at',
    'Account.updated_at',
    'Owner.uuid AS owner',
    'Account.email',
    'Account.role',
    'Account.token'
  )
  .from( 'Account' )
  .leftJoin( 'Account AS Owner', 'Account.owner', 'Owner.id' )
  .where( {
    'Account.uuid': record.uuid
  } )
  .first();

  res.json( record );  
} );

// Delete record
router.delete( '/:id', async ( req, res ) => {
  await req.db( 'Account' )
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
