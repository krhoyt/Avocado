const express = require( 'express' );
const rp = require( 'request-promise-native' )

// Router
let router = express.Router();

// Test
router.get( '/test', ( req, res ) => {    
  res.json( {so_question: 'Test'} );
} );

// Read single question by Stack Overflow question ID
router.get( '/id/:id', async ( req, res ) => {
  let question = await rp( {
    url: `https://api.stackexchange.com/2.2/questions/${req.params.id}`,
    method: 'GET',
    qs: {
      order: 'desc',
      sort: 'activity',
      site: 'stackoverflow',
      key: req.config.stackoverflow.key
    },
    gzip: true,
    json: true
  } );

  res.json( question.items[0] );
} );

// Export
module.exports = router;
