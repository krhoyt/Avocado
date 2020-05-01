import requests

api = 'http://localhost:3000/api'

# List of repositories
req = requests.get( api + '/repository' )
repos = req.json()

for repo in repos:
  # Update repository
  req = requests.patch( api + '/repository/' + repo['id'] )
  record = req.json()

  print( 'Edit: ' + record['id'] )
