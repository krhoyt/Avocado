const express = require( 'express' );
const uuidv4 = require( 'uuid' );

// Router
let router = express.Router();

// Test
router.get( '/test', ( req, res ) => {    
  res.json( {so_answer: 'Test'} );
} );

// Read single answer by ID
router.get( '/:id', async ( req, res ) => {
  let record = await req.db
  .select(
    'StackOverflowAnswer.uuid AS id',
    'StackOverflowAnswer.created_at',
    'StackOverflowAnswer.updated_at',
    'StackOverflow.uuid AS so_id',
    'StackOverflowAnswer.answer',
    'StackOverflowAnswer.question',
    'StackOverflowAnswer.active_at',
    'StackOverflowAnswer.accepted',
    'StackOverflowAnswer.score',
    'StackOverflowAnswer.views',      
    'StackOverflowAnswer.link',
    'StackOverflowAnswer.title',
    'StackOverflowAnswer.tags',
    'StackOverflowAnswer.keywords',
    'StackOverflowAnswer.concepts',
    'StackOverflowAnswer.entities'
  )
  .from( 'StackOverflowAnswer' )
  .leftJoin( 'StackOverflow', 'StackOverflowAnswer.so_id', 'StackOverflow.id' )
  .where( {
    'StackOverflowAnswer.uuid': req.params.id
  } )
  .first();

  if( record === undefined ) {
    record = null;
  } else {
    if( record.tags === null ) {
      record.tags = [];
    } else {
      record.tags = record.tags.split( ',' );
    }

    if( record.keywords === null ) {
      record.keywords = [];
    } else {
      record.keywords = record.keywords.split( ',' );
    }
    
    if( record.concepts === null ) {
      record.concepts = [];
    } else {
      record.concepts = record.concepts.split( ',' );
    }
    
    if( record.entities === null ) {
      record.entities = [];
    } else {
      record.entities = record.entities.split( ',' );
    }    
  }

  res.json( record );
} );

// Read single answer by Stack Overflow answer ID
router.get( '/id/:id', async ( req, res ) => {
  let record = await req.db
  .select(
    'StackOverflowAnswer.uuid AS id',
    'StackOverflowAnswer.created_at',
    'StackOverflowAnswer.updated_at',
    'StackOverflow.uuid AS so_id',
    'StackOverflowAnswer.answer',
    'StackOverflowAnswer.question',
    'StackOverflowAnswer.active_at',
    'StackOverflowAnswer.accepted',
    'StackOverflowAnswer.score',
    'StackOverflowAnswer.views',      
    'StackOverflowAnswer.link',
    'StackOverflowAnswer.title',
    'StackOverflowAnswer.tags',
    'StackOverflowAnswer.keywords',
    'StackOverflowAnswer.concepts',
    'StackOverflowAnswer.entities'
  )
  .from( 'StackOverflowAnswer' )
  .leftJoin( 'StackOverflow', 'StackOverflowAnswer.so_id', 'StackOverflow.id' )
  .where( {
    'StackOverflowAnswer.answer': req.params.id
  } )
  .first();

  if( record === undefined ) {
    record = null;
  } else {
    if( record.tags === null ) {
      record.tags = [];
    } else {
      record.tags = record.tags.split( ',' );
    }

    if( record.keywords === null ) {
      record.keywords = [];
    } else {
      record.keywords = record.keywords.split( ',' );
    }
    
    if( record.concepts === null ) {
      record.concepts = [];
    } else {
      record.concepts = record.concepts.split( ',' );
    }
    
    if( record.entities === null ) {
      record.entities = [];
    } else {
      record.entities = record.entities.split( ',' );
    } 
  }

  res.json( record );
} );

// Read all answers
router.get( '/', async ( req, res ) => {
  let records = await req.db
  .select(
    'StackOverflowAnswer.uuid AS id',
    'StackOverflowAnswer.created_at',
    'StackOverflowAnswer.updated_at',
    'StackOverflow.uuid AS so_id',
    'StackOverflowAnswer.answer',
    'StackOverflowAnswer.question',
    'StackOverflowAnswer.active_at',
    'StackOverflowAnswer.accepted',
    'StackOverflowAnswer.score',
    'StackOverflowAnswer.views',      
    'StackOverflowAnswer.link',
    'StackOverflowAnswer.title',
    'StackOverflowAnswer.tags',
    'StackOverflowAnswer.keywords',
    'StackOverflowAnswer.concepts',
    'StackOverflowAnswer.entities'
  )
  .from( 'StackOverflowAnswer' )
  .leftJoin( 'StackOverflow', 'StackOverflowAnswer.so_id', 'StackOverflow.id' )
  .orderBy( 'StackOverflowAnswer.active_at' );

  for( let r = 0; r < records.length; r++ ) {
    if( records[r].tags === null ) {
      records[r].tags = [];
    } else {
      records[r].tags = records[r].tags.split( ',' );
    }

    if( records[r].keywords === null ) {
      records[r].keywords = [];
    } else {
      records[r].keywords = records[r].keywords.split( ',' );
    }
    
    if( records[r].concepts === null ) {
      records[r].concepts = [];
    } else {
      records[r].concepts = records[r].concepts.split( ',' );
    }
    
    if( records[r].entities === null ) {
      records[r].entities = [];
    } else {
      records[r].entities = records[r].entities.split( ',' );
    }    
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
    so_uuid: req.body.so_id,
    answer: req.body.answer,
    question: req.body.question,
    active_at: new Date( req.body.active_at ),
    accepted: req.body.accepted,
    score: req.body.score,
    views: req.body.views,
    link: req.body.link,
    title: req.body.title,
    tags: req.body.tags,
    keywords: req.body.keywords,
    concepts: req.body.concepts,
    entities: req.body.entities
  };

  if( record.tags.length === 0 ) {
    record.tags = null;
  } else {
    record.tags = record.tags.join( ',' );
  }    

  if( record.keywords.length === 0 ) {
    record.keywords = null;
  } else {
    record.keywords = record.keywords.join( ',' );
  }    

  if( record.concepts.length === 0 ) {
    record.concepts = null;
  } else {
    record.concepts = record.concepts.join( ',' );
  }    
  
  if( record.entities.length === 0 ) {
    record.entities = null;
  } else {
    record.entities = record.entities.join( ',' );
  }    

  let so = await req.db
  .select( 'id' )
  .from( 'StackOverflow' )
  .where( {
    uuid: record.so_uuid
  } )
  .first();
  record.so_id = so.id;

  // SQLite does not support date objects
  // Store as string
  if( req.db.client.config.client === 'sqlite3' ) {
    record.created_at = record.created_at.toISOString();
    record.updated_at = record.updated_at.toISOString();
    record.active_at = record.published_at.toISOString();
  } 

  await req.db( 'StackOverflowAnswer' )
  .insert( { 
    id: record.id,
    uuid: record.uuid,
    created_at: record.created_at,
    updated_at: record.updated_at,
    so_id: record.so_id,
    answer: record.answer,
    question: record.question,
    active_at: record.active_at,
    accepted: record.accepted,
    score: record.score,
    views: record.views,
    link: record.link,
    title: record.title,
    tags: record.tags,
    keywords: record.keywords,
    concepts: record.concepts,
    entities: record.entities    
  } );

  if( record.tags === null ) {
    record.tags = [];
  } else {    
    record.tags = record.tags.split( ',' );
  }  

  if( record.keywords === null ) {
    record.keywords = [];
  } else {    
    record.keywords = record.keywords.split( ',' );
  }  

  if( record.concepts === null ) {
    record.concepts = [];
  } else {    
    record.concepts = record.concepts.split( ',' );
  }

  if( record.entities === null ) {
      record.entities = [];
  } else {    
    record.entities = record.entities.split( ',' );
  }  

  res.json( {
    id: record.uuid,
    created_at: record.created_at,
    updated_at: record.updated_at,
    so_id: record.so_uuid,
    answer: record.answer,
    question: record.question,
    active_at: record.active_at,
    accepted: record.accepted,
    score: record.score,
    views: record.views,
    link: record.link,
    title: record.title,
    tags: record.tags,
    keywords: record.keywords,
    concepts: record.concepts,
    entities: record.entities
  } );
} );

// Update
router.put( '/:id', async ( req, res ) => {
  let record = {
    uuid: req.params.id,
    updated_at: new Date(),
    so_uuid: req.body.so_id,
    answer: req.body.answer,
    question: req.body.question,
    active_at: new Date( req.body.active_at ),
    accepted: req.body.accepted,
    score: req.body.score,
    views: req.body.views,
    link: req.body.link,
    title: req.body.title,
    tags: req.body.tags,
    keywords: req.body.keywords,
    concepts: req.body.concepts,
    entities: req.body.entities
  };

  if( record.tags.length === 0 ) {
    record.tags = null;
  } else {
    record.tags = record.tags.join( ',' );
  }    

  if( record.keywords.length === 0 ) {
    record.keywords = null;
  } else {
    record.keywords = record.keywords.join( ',' );
  }    

  if( record.concepts.length === 0 ) {
    record.concepts = null;
  } else {
    record.concepts = record.concepts.join( ',' );
  }    
  
  if( record.entities.length === 0 ) {
    record.entities = null;
  } else {
    record.entities = record.entities.join( ',' );
  }    

  let so = await req.db
  .select( 'id' )
  .from( 'StackOverflow' )
  .where( {
    uuid: record.so_uuid
  } )
  .first();
  record.so_id = so.id;

  // SQLite does not support date objects
  // Store as string
  if( req.db.client.config.client === 'sqlite3' ) {
    record.updated_at = record.updated_at.toISOString();
    record.active_at = record.active_at.toISOString();
  }  

  await req.db( 'StackOverflowAnswer' )
  .update( {
    updated_at: record.updated_at,
    so_id: record.so_id,
    answer: record.answer,
    question: record.question,
    active_at: record.active_at,
    accepted: record.accepted,
    score: record.score,
    views: record.views,
    link: record.link,
    title: record.title,
    tags: record.tags,
    keywords: record.keywords,
    concepts: record.concepts,
    entities: record.entities
  } )
  .where( {
    uuid: record.uuid
  } );

  record = await req.db
  .select(
    'StackOverflowAnswer.uuid AS id',
    'StackOverflowAnswer.created_at',
    'StackOverflowAnswer.updated_at',
    'StackOverflow.uuid AS so_id',
    'StackOverflowAnswer.answer',
    'StackOverflowAnswer.question',
    'StackOverflowAnswer.active_at',
    'StackOverflowAnswer.accepted',
    'StackOverflowAnswer.score',
    'StackOverflowAnswer.views',      
    'StackOverflowAnswer.link',
    'StackOverflowAnswer.title',
    'StackOverflowAnswer.tags',
    'StackOverflowAnswer.keywords',
    'StackOverflowAnswer.concepts',
    'StackOverflowAnswer.entities'
  )
  .from( 'StackOverflowAnswer' )
  .leftJoin( 'StackOverflow', 'StackOverflowAnswer.so_id', 'StackOverflow.id' )
  .where( {
    'StackOverflowAnswer.uuid': record.uuid
  } )
  .first();

  if( record.tags === null ) {
    record.tags = [];
  } else {    
    record.tags = record.tags.split( ',' );
  }  

  if( record.keywords === null ) {
    record.keywords = [];
  } else {    
    record.keywords = record.keywords.split( ',' );
  }  

  if( record.concepts === null ) {
    record.concepts = [];
  } else {    
    record.concepts = record.concepts.split( ',' );
  }

  if( record.entities === null ) {
      record.entities = [];
  } else {    
    record.entities = record.entities.split( ',' );
  }

  res.json( record );  
} );

// Delete
router.delete( '/:id', async ( req, res ) => {
  await req.db( 'StackOverflowAnswer' )
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
