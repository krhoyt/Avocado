import json
import requests

api = 'http://localhost:3000/api'
skills = []

# List of skills
with open( 'skills.json' ) as json_file:
  roles = json.load( json_file )

for skill in skills:
  print( 'Skill: ' + skill )

  # Save to database
  req = requests.post( api + '/skill', json = {
    'name': skill
  } )
  record = req.json()

  print( 'Make: ' + record['id'] )
