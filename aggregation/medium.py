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

# List of Medium accounts
req = requests.get( api + '/medium' )
mediums = req.json()

for medium in mediums:
  # How long since updated
  updated = iso8601.parse_date( medium['updated_at'] ) 
  now = datetime.now( timezone.utc )
  duration = now - updated
  days = duration.days

  # Update account statistics
  # If not updated in some time
  if days > 7:
    req = requests.patch( api + '/medium/' + medium['id'] )
    info = req.json()

    print( 'Acct: ' + info['id'] )    

  # Parse feed (RSS/ATOM)
  print( 'Load: ' + medium['id'] )
  feed = feedparser.parse( 'https://medium.com/feed/@' + medium['user_name'] )

  # Look at each entry
  for entry in feed['entries']:
    # Medium includes comments as feed items
    # Comments will not have category tags
    # Disregard comments
    # TODO: Store in separate table?
    if 'tags' not in entry:
      print( 'Said: ' + entry['link'][0:36] )
      continue

    # Article not on Medium proper
    if entry['link'].find( 'medium.com' ) < 0:
      print( 'Nope: ' + entry['link'][0:36] )
      continue

    # Formalize entity
    record = {
      'medium_id': medium['id'],
      'published_at': None,
      'guid': entry['id'],
      'link': entry['link'],
      'title': entry['title'],
      'summary': utility.remove_html_tags( entry['summary'] ),
      'claps': 0,
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
    record['published_at'] = time.strftime( '%Y-%m-%dT%H:%M:%SZ', entry['published_parsed'] )

    # Check database
    encoded = base64.urlsafe_b64encode( record['guid'].encode( 'utf-8' ) )
    req = requests.get( api + '/medium/post/guid/' + str( encoded, 'utf-8' ) )        
    matches = req.json()

    # How to find claps value
    CLAPS = 'clapCount":'

    # Does not exist
    if matches == None:
      # Get claps count
      # Start by getting article page
      req = requests.get( record['link'] )

      # Parse claps value
      start = req.text.find( CLAPS ) + len( CLAPS )
      end = req.text.find( ',', start )
      part = req.text[start:end]

      # Populate claps
      record['claps'] = int( part )

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
      req = requests.post( api + '/medium/post', json = record )
      insert = req.json()

      # Build contribution
      contribution = {
        'developer_id': medium['developer_id'],
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
      utility.unique_images( 
        insert['link'], 
        'medium', 
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
        # Load current claps
        # Start by getting article page
        req = requests.get( record['link'] )

        start = req.text.find( CLAPS ) + len( CLAPS )
        end = req.text.find( ',', start )
        part = req.text[start:end]

        # Update claps
        matches['claps'] = int( part )

        # Update database
        req = requests.put( api + '/medium/post/' + matches['id'], json = matches )
        
        print( 'Edit: ' + matches['id'] )
      else:
        print( 'None: ' + matches['id'] )
