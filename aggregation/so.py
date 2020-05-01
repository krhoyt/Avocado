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

# List of Stack Overflow accounts
req = requests.get( api + '/so' )
sos = req.json()

for stack in sos:
  # How long since updated
  updated = iso8601.parse_date( stack['updated_at'] ) 
  now = datetime.now( timezone.utc )
  duration = now - updated
  days = duration.days

  # Update account statistics
  # If not updated in some time
  if days > 7:
    # Latest statistics from source
    req = requests.patch( api + '/so/' + stack['id'] )
    info = req.json()

    print( 'Acct: ' + info['id'] )    

  # Get answers
  print( 'Load: ' + stack['id'] )  
  req = requests.get( api + '/so/answers/' + str( stack['user'] ) )
  answers = req.json()

  # Look at each answer
  for answer in answers:
    # Formalize entity
    record = {
      'so_id': stack['id'],
      'answer': answer['answer_id'],
      'question': answer['question_id'],
      'active_at': None,
      'accepted': 1 if answer['is_accepted'] == True else 0,
      'score': answer['score'],
      'views': None,
      'link': None,
      'title': None,
      'tags': [],
      'keywords': [],
      'concepts': [],
      'entities': []
    }

    active = datetime.utcfromtimestamp( answer['last_activity_date'] )
    record['active_at'] = active.isoformat()

    # Check database
    req = requests.get( api + '/so/answer/id/' + str( record['answer'] ) )     
    matches = req.json()

    # Does not exist
    if matches == None:
      # Get additional details from question
      # Wait to call until we know we need it
      # Helps with API usage limits
      req = requests.get( api + '/so/question/id/' + str( record['question'] ) )
      question = req.json()

      # Updated record details
      record['link'] = question['link']
      record['title'] = question['title']
      record['views'] = question['view_count']

      # Including topic tags
      for tag in question['tags']:
        record['tags'].append( tag )

      # Analyze content
      # Optional feature
      if config['WATSON'].getboolean( 'Language' ) == True:
        encoded = base64.urlsafe_b64encode( record['link'].encode( 'utf-8' ) )
        req = requests.get( api + '/watson/language/' + str( encoded, 'utf-8' ) )
        language = req.json()
        
        record['keywords'] = language['keywords']
        record['concepts'] = language['concepts']
        record['entities'] = language['entities']

      # Create answer
      req = requests.post( api + '/so/answer', json = record )
      insert = req.json()

      print( 'Make: ' + insert['id'] )
    else:
      # How long since published
      published = iso8601.parse_date( matches['updated_at'] ) 
      now = datetime.now( timezone.utc )
      duration = now - published
      days = duration.days

      # Update once per week
      # May need to revise at scale
      if days > 7:
        # Get view count from question record
        req = requests.get( api + '/so/question/id/' + str( matches['question'] ) )
        question = req.json()        

        # Update statistics from loaded answer
        matches['accepted'] = 1 if answer['is_accepted'] == True else 0
        matches['score'] = answer['score']
        matches['views'] = question['view_count']

        # Update database
        req = requests.put( api + '/so/answer/' + matches['id'], json = matches )
        
        print( 'Edit: ' + matches['id'] )
      else:
        print( 'None: ' + matches['id'] )
