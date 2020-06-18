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

# List of Twitter accounts
req = requests.get( api + '/twitter' )
twitters = req.json()

for twitter in twitters:
  # Retrieve user timeline
  print( 'Load: ' + twitter['id'] )
  req = requests.get( api + '/twitter/timeline/' + twitter['screen_name'] )
  timeline = req.json()
  
  # User has blocked access
  # Never posted a status
  if len( timeline ) == 0:
    print( 'Skip: ' + twitter['id'] )
    continue

  # Update account statistics
  user = timeline[0]['user']

  twitter['name'] = None if len( user['name'] ) == 0 else user['name']
  twitter['image'] = None if len( user['profile_image_url_https'] ) == 0 else user['profile_image_url_https']
  twitter['followers'] = user['followers_count']
  twitter['friends'] = user['friends_count']
  twitter['favorites'] = user['favourites_count']
  twitter['count'] = user['statuses_count']
  twitter['location'] = None if len( user['location'] ) == 0 else user['location']
  twitter['description'] =  None if len( user['description'] ) == 0 else user['description']
  # twitter['url'] =  None if len( user['url'] ) == 0 else user['url']

  # Update the database
  req = requests.put( api + '/twitter/' + twitter['id'], json = twitter )
  row = req.json()

  # Look at each entry
  for status in timeline:    
    # Formalize entity
    record = {
      'twitter_id': twitter['id'],
      'published_at': status['created_at'],
      'status': status['id_str'],
      'link': 'https://twitter.com/' + twitter['screen_name'] + '/status/' + status['id_str'],
      'full_text': status['full_text'],
      'favorite': status['favorite_count'],
      'retweet': status['retweet_count'],
      'hashtags': [],
      'mentions': [],
      'urls': []
    }

    # Check database
    req = requests.get( api + '/twitter/status/id/' + str( record['status'] ) )
    matches = req.json()

    # Does not exist
    if matches == None:
      # Parse Twitter date format (RFC 2822)
      published = datetime.strptime( record['published_at'], '%a %b %d %H:%M:%S +%f %Y' )      
      record['published_at'] = published.strftime( '%Y-%m-%d %H:%M:%S' )

      # Populate hashtags
      # Array of objects
      # Not a simple join
      for hashtag in status['entities']['hashtags']:
        record['hashtags'].append( hashtag['text'] )

      # Populate mentions
      for mention in status['entities']['user_mentions']:
        record['mentions'].append( mention['screen_name'] )

      # Populate URLs
      for link in status['entities']['urls']:
        record['urls'].append( link['expanded_url'] )        

      # Create status
      req = requests.post( api + '/twitter/status', json = record )
      insert = req.json()

      # Scan media
      # Need status ID (primary key from insert) first
      # Media key from Twitter is not always present
      if 'media' in status['entities']:
        for media in status['entities']['media']:
          # Does file exist in database
          encoded = base64.urlsafe_b64encode( media['media_url_https'].encode( 'utf-8' ) )
          req = requests.get( api + '/media/url/' + str( encoded, 'utf-8' ) )        
          matches = req.json()          

          # Nope
          if matches == None:
            record = {
              'url': media['media_url_https'],
              'keywords': []
            }

            # Watson analysis always bombing
            # Dropping connections
            # Removing ML analysis temporarily
            # Not entirely sure it was ever needed
            # I just thought it was cool at some point

            # Analyze image
            # Optional feature
            # if config['WATSON'].getboolean( 'Vision' ) == True:
            #   encoded = base64.urlsafe_b64encode( record['url'].encode( 'utf-8' ) )           
            #   req = requests.get( api + '/watson/vision/' + str( encoded, 'utf-8' ) )
            #   record['keywords'] = req.json()            

            # Create media record
            req = requests.post( api + '/media', json = record )
            matches = req.json()

          # Associate with status
          req = requests.post( api + '/twitter/status/' + insert['id'] + '/media', json = {
            'media_id': matches['id']
          } )
          associate = req.json()

          print( 'Pict: ' + associate['id'] )

      print( 'Make: ' + insert['id'] )
    else:
      # How long since updated
      # In place to expedite aggregation
      # Has no impact on Twitter API usage
      published = iso8601.parse_date( matches['published_at'] ) 
      now = datetime.now( timezone.utc )
      duration = now - published
      days = duration.days

      # Update status statistics
      # If still recent status
      if days < 7:
        matches['favorite'] = record['favorite']
        matches['retweet'] = record['retweet']

        requests.put( api + '/twitter/status/' + matches['id'], json = matches )
      
        print( 'Edit: ' + matches['id'] )        
      else:
        print( 'None:'  + matches['id'] )
