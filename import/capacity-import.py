import json
import requests

api = 'http://localhost:3000/api'
capacities = []

# List of capacities
with open( 'capacities.json' ) as json_file:
  capacities = json.load( json_file )

  for capacity in capacities:
    print( 'Capacity: ' + capacity )

    # Save to database
    req = requests.post( api + '/capacity', json = {
      'name': capacity
    } )
    record = req.json()

    print( 'Make: ' + record['id'] )
  