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

      # Build contribution
      contribution = {
        'developer_id': hub['developer_id'],
        'contributed_at': record['published_at'],              
        'description': record['event_name'] + ': ' + record['repository_name'],
        'public': 1
      }

      # Different capacity for events
      # Push, Pull, Comment
      if record['event_name'] == 'PullRequestEvent':
        contribution['capacity_id'] = '93e5878d-e384-44c7-9128-11c0fcffddd7'
        contribution['link'] = event['payload']['pull_request']['html_url']        
      elif record['event_name'] == 'IssueCommentEvent':
        contribution['capacity_id'] = 'fff7b4ce-c245-49f4-b4df-23afecac7271'
        contribution['link'] = event['payload']['comment']['html_url']
      elif record['event_name'] == 'PushEvent':
        contribution['capacity_id'] = 'c61057a8-1e2c-4d08-bd53-805026a54084' 
        contribution['link'] = None       
      else:
        contribution['capacity_id'] = None
        contribution['link'] = None

      # Create contribution
      # Where maps to capacity
      if contribution['capacity_id'] != None:
        req = requests.post( api + '/contribution', json = contribution )
        contribution = req.json()

        print( 'Cont: ' + contribution['id'] )

      print( 'Make: ' + insert['id'] )
    else:
      print( 'None: ' + matches['id'] )
