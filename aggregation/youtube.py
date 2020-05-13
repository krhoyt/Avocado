import base64
import configparser
import feedparser
import requests
import time

api = 'http://localhost:3000/api'

# List of YouTube accounts
req = requests.get( api + '/youtube' )
tubes = req.json()

for tuber in tubes:
  # Parse feed (RSS/ATOM)
  print( 'Load: ' + tuber['id'] )
  feed = feedparser.parse( 'https://www.youtube.com/feeds/videos.xml?channel_id=' + tuber['channel'] )

  # Look at each entry
  for entry in feed['entries']:
    # Formalize entity
    record = {
      'youtube_id': tuber['id'],
      'published_at': time.strftime( '%Y-%m-%dT%H:%M:%SZ', entry['published_parsed'] ),
      'guid': entry['id'],
      'video': entry['yt_videoid'],
      'link': entry['link'],
      'title': entry['title'],
      'views': entry['media_statistics']['views'],
      'stars': entry['media_starrating']['count'],
      'duration': 0,
      'thumbnail': entry['media_thumbnail'][0]['url'],
      'summary': entry['summary']
    }

    # Check database
    encoded = base64.urlsafe_b64encode( record['guid'].encode( 'utf-8' ) )
    req = requests.get( api + '/youtube/video/guid/' + str( encoded, 'utf-8' ) )
    match = req.json()    

    # Does not exist
    if match == None:
      # Get duration of video
      # REST API due to authentication
      req = requests.get( api + '/youtube/video/duration/' + record['video'] )
      timing = req.json()
      record['duration'] = timing['seconds']

      # Create video
      req = requests.post( api + '/youtube/video', json = record )
      insert = req.json()

      print( 'Make: ' + insert['id'] )
    else:
      # Map updated statistics
      match['views'] = entry['media_statistics']['views']
      match['stars'] = entry['media_starrating']['count']

      # Update database
      req = requests.put( api + '/youtube/video/' + match['id'], json = match )      

      print( 'Edit: ' + match['id'] )

