from datetime import datetime, timezone

import base64
import configparser
import feedparser
import iso8601
import requests
import time

import utility

# Optional features
config = configparser.ConfigParser()
config.read( './features.ini' )

api = 'http://localhost:3000/api'

# List of Dev accounts
req = requests.get( api + '/dev' )
devs = req.json()

for dev in devs:
  # Parse feed (RSS/ATOM)
  print( 'Load: ' + dev['id'] )
  feed = feedparser.parse( 'https://dev.to/feed/' + dev['user_name'] )

  # Look at each entry
  for entry in feed['entries']:

    # ISO published date
    published = time.strftime( '%Y-%m-%dT%H:%M:%SZ', entry['published_parsed'] )

    # Formalize entity
    record = {
      'dev_id': dev['id'],
      'published_at': published,
      'guid': entry['id'],
      'article': 0,
      'link': entry['link'],
      'title': entry['title'],
      'summary': utility.remove_html_tags( entry['summary'] ),
      'likes': 0,
      'reading': 0,
      'unicorn': 0,
      'keywords': None,
      'concepts': None,
      'entities': None
    }

    # Ignore empty entry
    if len( record['summary'].strip() ) == 0:
      continue

    # Check database
    encoded = base64.urlsafe_b64encode( record['guid'].encode( 'utf-8' ) )
    req = requests.get( api + '/dev/post/guid/' + str( encoded, 'utf-8' ) )    
    matches = req.json()

    # Does not exist
    if matches == None:
      # Get post reactions
      # Start with getting the body of the post
      req = requests.get( record['link'] )

      # Then parse out the article ID
      ARTICLE_ID = 'data-article-id="'
      start = req.text.find( ARTICLE_ID ) + len( ARTICLE_ID )
      end = req.text.find( '"', start )
      part = req.text[start:end]

      # Add article to record
      # Useful to updates to post reactions
      record['article'] = int( part )

      # Get reaction counts
      req = requests.get( 'https://dev.to/reactions', params = {
        'article_id': record['article']
      } )
      reactions = req.json()

      # Reactions is an array
      # Iterate to find specific data points
      for reaction in reactions['article_reaction_counts']:
        # Populate reactions
        if reaction['category'] == 'like':
          record['likes'] = reaction['count']

        if reaction['category'] == 'readinglist':
          record['reading'] = reaction['count']         

        if reaction['category'] == 'unicorn':
          record['unicorn'] = reaction['count']                    

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
      req = requests.post( api + '/dev/post', json = record )
      insert = req.json()

      # Extract unique images
      # Analyze if needed
      # Store new images 
      # Make associations with post
      utility.unique_images( 
        insert['link'], 
        'dev', 
        insert['id'], 
        config['WATSON'].getboolean( 'Vision' ) 
      )

      print( 'Make: ' + insert['id'] )
    else:
      # How long since published
      published = iso8601.parse_date( matches['published_at'] ) 
      now = datetime.now( timezone.utc )
      duration = now - published
      days = duration.days

      # Only track for first 7-days
      # TODO: Check up in 30-day increments after
      if days < 7:
        # Update reaction counts
        req = requests.get( 'https://dev.to/reactions', params = {
          'article_id': matches['article']
        } )
        reactions = req.json()

        # Reactions is an array
        # Iterate to find specific data points
        for reaction in reactions['article_reaction_counts']:
          # Populate reactions
          if reaction['category'] == 'like':
            matches['likes'] = reaction['count']

          if reaction['category'] == 'readinglist':
            matches['reading'] = reaction['count']         

          if reaction['category'] == 'unicorn':
            matches['unicorn'] = reaction['count']                  

        # Update database
        req = requests.put( api + '/dev/post/id/' + matches['id'], json = matches )
        
        print( 'Edit: ' + matches['id'] )
      else:
        print( 'None: ' + matches['id'] )
