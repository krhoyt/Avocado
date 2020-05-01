import json
import requests

api = 'http://localhost:3000/api'
organizations = []

# List of organizations
with open( 'organizations.json' ) as json_file:
  organizations = json.load( json_file )

for org in organizations:
  print( 'Organization: ' + org )

  # Save to database
  req = requests.post( api + '/organization', json = {
    'name': org
  } )
  record = req.json()

  print( 'Make: ' + record['id'] )
