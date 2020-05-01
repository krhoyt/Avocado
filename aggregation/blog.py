import base64
import configparser
import feedparser
import requests
import time

import utility

# Optional features
config = configparser.ConfigParser()
config.read( './features.ini' )

api = 'http://localhost:3000/api'

# List of blogs
req = requests.get( api + '/blog' )
blogs = req.json()

for blog in blogs:
  # Parse feed (RSS/ATOM)
  print( 'Load: ' + blog['id'] )
  feed = feedparser.parse( blog['url'] )

  # Look at each entry
  for entry in feed['entries']:
    # Formalize entity
    record = {
      'blog_id': blog['id'],
      'published_at': None,
      'guid': entry['id'],
      'link': entry['link'],
      'title': entry['title'],
      'summary': entry['summary'],
      'category': [],
      'keywords': [],
      'concepts': [],
      'entities': []
    }

    # Categories
    if 'tags' in entry:
      for tag in entry['tags']:
        record['category'].append( tag.term )

    # ISO published date
    # Not all feed use published field
    # Some use updated field
    if 'published_parsed' in entry:
      record['published_at'] = time.strftime( '%Y-%m-%dT%H:%M:%SZ', entry['published_parsed'] )
    else:
      record['published_at'] = time.strftime( '%Y-%m-%dT%H:%M:%SZ', entry['updated_parsed'] )        

    # Check database
    encoded = base64.urlsafe_b64encode( record['guid'].encode( 'utf-8' ) )
    req = requests.get( api + '/blog/post/guid/' + str( encoded, 'utf-8' ) )
    match = req.json()

    # Does not exist
    if match == None:
      # Analyze content
      # Optional feature
      if config['WATSON'].getboolean( 'Language' ) == True:
        encoded = base64.urlsafe_b64encode( record['link'].encode( 'utf-8' ) )        
        req = requests.get( api + '/watson/language/' + str( encoded, 'utf-8' ) )
        language = req.json()

        record['keywords'] = language['keywords']
        record['concepts'] = language['concepts']
        record['entities'] = language['entities']

      # Create post
      req = requests.post( api + '/blog/post', json = record )
      insert = req.json()

      # Build contribution
      contribution = {
        'developer_id': blog['developer_id'],
        'contributed_at': record['published_at'],              
        'description': record['title'],
        'link': record['link'],
        'public': 1
      }

      # Check for 'ibm' mention
      try:
        index = record['summary'].lower().index( 'ibm' )
      except:
        index = -1

      # Different capacity for mention
      # Contains string 'ibm'
      # Does not contain string 'ibm'
      if index >= 0:
        contribution['capacity_id'] = 'a940c77e-c02c-4cf9-9bd1-b2a4895a5911'
      else:
        contribution['capacity_id'] = '027734bc-dfe8-4fa6-bcd4-79b5903f330c'

      # Create contribution
      req = requests.post( api + '/contribution', json = contribution )
      contribution = req.json()

      print( 'Cont: ' + contribution['id'] )

      # Extract unique images
      # Analyze if needed
      # Store new images 
      # Make associations with post

      # TODO: Temporarily disabled
      # TODO: Not handling 404 error
      # TODO: On the Watson Vision (Node.js) side
      # utility.unique_images( 
      #   insert['link'], 
      #   'blog', 
      #   insert['id'], 
      #   config['WATSON'].getboolean( 'Vision' ) 
      # )

      print( 'Make: ' + insert['id'] )
    else:
      print( 'None: ' + match['id'] )
