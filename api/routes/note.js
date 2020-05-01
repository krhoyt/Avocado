const express = require( 'express' );
const uuidv4 = require( 'uuid' );

// Router
let router = express.Router();

// Test
router.get( '/test', ( req, res ) => {    
  res.json( {developer_note: 'Test'} );
} );

// Read all notes for given developer
router.get( '/developer/:id', async ( req, res ) => {
  let records = await req.db
  .select(
    'Note.uuid AS id',
    'Note.created_at',
    'Note.updated_at',
    'Developer.uuid AS developer_id',
    'Note.noted_at',
    'Situation.uuid AS situation_id',
    'Situation.name AS situation_name',    
    'Note.full_text'
  )
  .from( 'Note' )
  .leftJoin( 'Situation', 'Note.situation_id', 'Situation.id' )
  .leftJoin( 'Developer', 'Note.developer_id', 'Developer.id' )
  .where( {
    'Developer.uuid': req.params.id
  } )
  .orderBy( 'Note.noted_at' );  

  res.json( records );
} );

// Read single record by ID
router.get( '/:id', async ( req, res ) => {
  let record = await req.db
  .select(
    'Note.uuid AS id',
    'Note.created_at',
    'Note.updated_at',
    'Developer.uuid AS developer_id',
    'Note.noted_at',
    'Situation.uuid AS situation_id',
    'Situation.name AS situation_name',    
    'Note.full_text'
  )
  .from( 'Note' )
  .leftJoin( 'Situation', 'Note.situation_id', 'Situation.id' )
  .leftJoin( 'Developer', 'Note.developer_id', 'Developer.id' )
  .where( {
    'Note.uuid': req.params.id
  } )
  .first();  

  if( record === undefined ) {
    record = null;
  }

  res.json( record );
} );

// Read all records
router.get( '/', async ( req, res ) => {
  let records = await req.db
  .select(
    'Note.uuid AS id',
    'Note.created_at',
    'Note.updated_at',
    'Developer.uuid AS developer_id',
    'Note.noted_at',
    'Situation.uuid AS situation_id',
    'Situation.name AS situation_name',    
    'Note.full_text'
  )
  .from( 'Note' )
  .leftJoin( 'Situation', 'Note.situation_id', 'Situation.id' )
  .leftJoin( 'Developer', 'Note.developer_id', 'Developer.id' )
  .orderBy( 'Note.noted_at' );  

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
    noted_at: new Date( req.body.noted_at ),
    situation_uuid: req.body.situation_id,
    full_text: req.body.full_text
  };

  let situation = await req.db
  .select( 
    'id',
    'name'
  )
  .from( 'Situation')
  .where( {
    uuid: record.situation_uuid
  } )
  .first();
  record.situation_id = situation.id;
  record.situation_name = situation.name;  

  let developer = await req.db
  .select( 'id' )
  .from( 'Developer')
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
    record.noted_at = record.noted_at.toISOString();    
  }  

  await req.db( 'Note' )
  .insert( {
    id: record.id,
    uuid: record.uuid,
    created_at: record.created_at,
    updated_at: record.updated_at,
    developer_id: record.developer_id,
    noted_at: record.noted_at,
    situation_id: record.situation_id,
    full_text: record.full_text
  } );

  res.json( {
    id: record.uuid,
    created_at: record.created_at,
    updated_at: record.updated_at,
    developer_id: record.developer_uuid,
    noted_at: record.noted_at,
    situation_id: record.situation_uuid,
    situation_name: record.situation_name,
    full_text: record.full_text
  } );
} );

// Update
router.put( '/:id', async ( req, res ) => {
  let record = {
    uuid: req.params.id,
    updated_at: new Date(),
    developer_uuid: req.body.developer_id,
    noted_at: new Date( req.body.noted_at ),
    situation_uuid: req.body.situation_id,
    full_text: req.body.full_text
  };

  let situation = await req.db
  .select( 'id' )
  .from( 'Situation' )
  .where( {
    uuid: record.situation_uuid
  } )
  .first();
  record.situation_id = situation.id;

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
    record.noted_at = record.noted_at.toISOString();    
  }

  await req.db( 'Note' )
  .update( {
    updated_at: record.updated_at,
    developer_id: record.developer_id,
    noted_at: record.noted_at,
    situation_id: record.situation_id,
    full_text: record.full_text
  } )
  .where( {
    uuid: record.uuid
  } );

  record = await req.db
  .select(
    'Note.uuid AS id',
    'Note.created_at',
    'Note.updated_at',
    'Developer.uuid AS developer_id',
    'Note.noted_at',
    'Situation.uuid AS situation_id',
    'Situation.name AS situation_name',    
    'Note.full_text'
  )
  .from( 'Note' )
  .leftJoin( 'Situation', 'Note.situation_id', 'Situation.id' )
  .leftJoin( 'Developer', 'Note.developer_id', 'Developer.id' )
  .where( {
    'Note.uuid': record.uuid
  } )
  .first();  

  res.json( record );  
} );

// Delete
router.delete( '/:id', async ( req, res ) => {
  await req.db( 'Note' )
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
