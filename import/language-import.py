import json
import requests

api = 'http://localhost:3000/api'
languages = []

# List of languages
with open( 'languages.json' ) as json_file:
  languages = json.load( json_file )

for language in languages:
  print( 'Language: ' + language )

  # Save to database
  req = requests.post( api + '/language', json = {
    'name': language
  } )
  record = req.json()

  print( 'Make: ' + record['id'] )
