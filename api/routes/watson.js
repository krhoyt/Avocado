const express = require( 'express' );
const fs = require( 'fs' );
const path = require( 'path' );
const rp = require( 'request-promise-native' );

// Router
let router = express.Router();

// Test
router.get( '/test', ( req, res ) => {    
  res.json( {watson: 'Test'} );
} );

// Analyze a document
router.get( '/language/:url', async ( req, res ) => {
  let buffer = new Buffer.from( req.params.url, 'base64' );
  let url = buffer.toString( 'utf8' );    

  let analysis = await rp( {
    method: 'GET',
    url: 'https://gateway.watsonplatform.net/natural-language-understanding/api/v1/analyze',
    auth: {
      username: req.config.watson.language.key,
      password: req.config.watson.language.secret
    },
    qs: {
      version: '2019-07-12',
      features: 'keywords,concepts,entities',
      url: url
    },
    json: true
  } );

  res.json( {
    keywords: reduce( analysis.keywords ),
    concepts: reduce( analysis.concepts ),
    entities: reduce( analysis.entities )
  } );
} );

// Analyze an image file
router.get( '/vision/:url', async ( req, res ) => {
  let buffer = new Buffer.from( req.params.url, 'base64' );
  let url = buffer.toString( 'utf8' );    

  let data = await rp( {
    url: 'https://gateway.watsonplatform.net/visual-recognition/api/v3/classify',
    method: 'GET',
    auth: {
      user: req.config.watson.vision.key,
      pass: req.config.watson.vision.secret
    },
    qs: {
      url: url,
      version: '2018-03-19'
    },
    json: true
  } );

  let results = [];

  for( let i = 0; i < data.images.length; i++ ) {
    if( !data.images[i].classifiers ) {
      continue;
    }

    for( let c = 0; c < data.images[i].classifiers.length; c++ ) {
      for( let s = 0; s < data.images[i].classifiers[c].classes.length; s++ ) {
        results.push( data.images[i].classifiers[c].classes[s].class.toLowerCase() );
      }
    }
  }

  res.json( results );
} );

function reduce( values ) {
  const listing = fs.readFileSync( path.join( __dirname, '../stopwords.txt' ) ).toString();
  const stopwords = listing.split( '\n' );

  let combined = [];

  for( let v = 0; v < values.length; v++ ) {
    if( values[v].relevance < 0.50 ) {
      continue;
    }

    values[v].text = values[v].text.toLowerCase();

    if( values[v].text.indexOf( ' ' ) > -1 ) {
      let parts = values[v].text.split( ' ' );

      for( let p = 0; p < parts.length; p++ ) {
        combined.push( parts[p].trim() );
      }
    } else {
      combined.push( values[v].text );
    }
  }

  let unique = [];

  for( let c = 0; c < combined.length; c++ ) {
    let found = false;

    for( let u = 0; u < unique.length; u++ ) {
      if( unique[u] === combined[c] ) {
        found = true;
        break;
      }
    }

    for( let s = 0; s < stopwords.length; s++ ) {
      if( stopwords[s] === combined[c] ) {
        found = true;
        break;
      }
    }

    if( !found ) {
      unique.push( combined[c] );
    }
  }

  return unique;

  /*
  let csv = unique.join( ',' );

  if( csv.length > 255 ) {
    csv = csv.substr( 0, 255 );
    let index = csv.lastIndexOf( ',' );
    csv = csv.substr( 0, index );
  }
  */

  // return csv;
}   

// Export
module.exports = router;
