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

# List of GitHub accounts
req = requests.get( api + '/github' )
githubs = req.json()

for hub in githubs:
  # How long since updated
  updated = iso8601.parse_date( hub['updated_at'] ) 
  now = datetime.now( timezone.utc )
  duration = now - updated
  days = duration.days

  # Update account statistics
  # If not updated in some time
  if days > 7:
    # Latest statistics from source
    req = requests.patch( api + '/github/' + hub['id'] )
    info = req.json()

    print( 'Acct: ' + info['id'] )    

  # Get events
  print( 'Load: ' + hub['id'] )  
  req = requests.get( api + '/github/activity/' + hub['login'] )
  events = req.json()

  # Look at each event
  for event in events:
    # Formalize entity
    record = {
      'github_id': hub['id'],
      'published_at': event['created_at'],
      'event': event['id'],
      'event_name': event['type'],
      'repository': event['repo']['id'],
      'repository_name': event['repo']['name']
    }

    # Check database
    req = requests.get( api + '/github/event/id/' + str( record['event'] ) )     
    matches = req.json()

    # Does not exist
    if matches == None:
      # Create event
      req = requests.post( api + '/github/event', json = record )
      insert = req.json()

      print( 'Make: ' + insert['id'] )
    else:
      print( 'None: ' + matches['id'] )
