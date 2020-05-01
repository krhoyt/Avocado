from datetime import datetime, timezone

import base64
import configparser
import feedparser
import iso8601
import requests
import time

import utility

api = 'http://localhost:3000/api'

# List of Reddit accounts
req = requests.get( api + '/reddit' )
redditors = req.json()

for reddit in redditors:
  # How long since updated
  updated = iso8601.parse_date( reddit['updated_at'] ) 
  now = datetime.now( timezone.utc )
  duration = now - updated
  days = duration.days

  # Update account statistics
  # If not updated in some time
  if days > 7:
    # Latest statistics from source
    req = requests.patch( api + '/reddit/' + reddit['id'] )
    info = req.json()

    print( 'Acct: ' + info['id'] )    

  # Get posts
  print( 'Load: ' + reddit['id'] )  
  req = requests.get( 'https://www.reddit.com/user/' + reddit['name'] + '.json', headers = {
    'User-Agent': 'Node:Avocado:v1'
  } )
  posts = req.json()

  # Look at each post
  for post in posts['data']['children']:
    # Formalize entity
    record = {
      'reddit_id': reddit['id'],
      'published_at': None,
      'guid': post['data']['id'],
      'author': post['data']['author'],
      'title': post['data']['link_title'],
      'body': post['data']['body'],
      'comments': post['data']['num_comments'],
      'score': post['data']['score'],
      'ups': post['data']['ups'],
      'downs': post['data']['downs'],
      'parent': post['data']['parent_id'],
      'subreddit': post['data']['subreddit'],
      'owner': post['data']['link_author'],
      'link': post['data']['link_permalink']
    }

    published = datetime.utcfromtimestamp( post['data']['created_utc'] )
    record['published_at'] = published.isoformat()    

    # Check database
    req = requests.get( api + '/reddit/post/guid/' + record['guid'] )     
    matches = req.json()

    # Does not exist
    if matches == None:
      # Create event
      req = requests.post( api + '/reddit/post', json = record )
      insert = req.json()

      print( 'Make: ' + insert['id'] )
    else:
      # Update database
      req = requests.put( api + '/reddit/post/' + matches['id'], json = matches )
        
      print( 'Edit: ' + matches['id'] )
