const cheerio = require( 'cheerio' );
const express = require( 'express' );
const fileType = require( 'file-type' );
const fs = require( 'fs' );
const path = require( 'path' );
const rp = require( 'request-promise-native' );
const sizeOf = require( 'image-size' );
const url = require( 'url' );

// Router
let router = express.Router();

// Test
router.get( '/test', ( req, res ) => {    
  res.json( {utility: 'Test'} );
} );

// Extract images from URL
router.get( '/images/:url', async ( req, res ) => {
  let accept = null;
  let check = null;
  let limit = null;

  // Check file type
  if( !req.query.check ) {
    check = true;
  } else {
    check = new Boolean( req.query.check );
  }

  // CSV list of accepted file types
  if( !req.query.accept ) {
    // Watson acceptable types
    accept = ['jpeg', 'jpg', 'png', 'tiff', 'gif'];
  } else {
    accept = req.query.accept.split( ',' );
  }

  // Maximum image file size
  // Defaults to Watson size limit
  if( !req.query.limit ) {
    limit = 10;
  } else {
    limit = parseInt( req.query.limit );
  }  

  // Get page URL from query string
  // Base64 for safe URL encoding
  let buffer = new Buffer.from( req.params.url, 'base64' );
  let uri = buffer.toString( 'utf8' );  

  // Load page
  // Expose virtual DOM
  let body = await rp( uri );
  let $ = cheerio.load( body );

  // Get image tags
  let images = $( 'body' ).find( 'img' ).toArray();

  // Temporary image file storage
  // Removed at end of run
  let local = path.join( __dirname, '../', 'dimensions' );

  // Extracted images
  // Not necessarily results
  // That comes later
  let extracted = [];

  // For each of the images
  for( let i = 0; i < images.length; i++ ) {
    // No "src" attribute
    // No image to process
    if( !images[i].attribs.src )
      continue;

    // Resolve full path
    let remote = url.resolve( uri, images[i].attribs.src );

    // Download image file
    let data = await rp( {
      method: 'GET',
      url: remote,
      encoding: null,
      resolveWithFullResponse: true
    } );

    // Decode to image bytes
    // Write to local file
    const buffer = Buffer.from( data.body, 'utf8' );
    fs.writeFileSync( local, buffer );    

    // Get image dimensions
    let dimensions = sizeOf( local );

    // Restrict for Watson minimum requirements
    if( dimensions.width < 35 || dimensions.height < 35 ) {
      continue;
    }

    // Restrict for Watson maximum file size
    let stats = fs.statSync( local )
    
    // Maximum of file to allow
    // Watson has file size limit
    if( stats.size > ( 1000000 * limit ) ) {
      continue;
    }

    // Get file type
    let info = fileType( buffer );

    // If request wants file type check
    // Defaults to true
    if( check ) {
      // See if there is a match in the accepted list
      for( let a = 0; a < accept.length; a++ ) {
        // Undefined if cannot determine type
        // No need to check
        if( info === undefined ) 
          continue;

        // Type determined
        // Look for match
        if( info.ext === accept[a] ) {
          extracted.push( remote );
          break;
        }
      }       
    } else {
      // No check requested
      extracted.push( remote );
    }
  }

  let results = [];

  // For each of the extracted images
  for( let e = 0; e < extracted.length; e++ ) {
    let found = false;

    // Already in results
    for( let r = 0; r < results.length; r++ ) {
      if( results[r] === extracted[e] ) {
        found = true;
        break;
      }
    }

    // Do not return
    if( found ) {
      continue;
    }

    // Add to return list
    results.push( extracted[e] );
  }

  // Clean up
  if( fs.existsSync( local ) ) {
    fs.unlinkSync( local );
  }

  // Return array of URL strings
  res.json( results );
} );

// Geocoding
router.get( '/geocode', async ( req, res ) => {    
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

  let location = 'Armonk, NY';

  if( req.query.location ) {
    location = req.query.location;
  }

  // Geocode provided location
  let results = await rp( 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates', {
    qs: {
      f: 'json',
      SingleLine: location,
      forStorage: req.config.esri.storage,
      outFields: 'StAddr,City,Country,Region,RegionAbbr,Postal',      
      token: auth.access_token
    },
    json: true
  } );

  // Return full results
  res.json( results );
} );

// Export
module.exports = router;
