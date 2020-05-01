import json
import requests

api = 'http://localhost:3000/api'
roles = []

# List of roles
with open( 'roles.json' ) as json_file:
  roles = json.load( json_file )

for role in roles:
  print( 'Role: ' + role )

  # Save to database
  req = requests.post( api + '/role', json = {
    'name': role
  } )
  record = req.json()

  print( 'Make: ' + record['id'] )
