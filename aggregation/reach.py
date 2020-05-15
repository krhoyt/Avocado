import json
import requests

server = 'http://localhost:3000/api'
days = 30
output = '../web/public/data/orbit'

# Accounts
req = requests.get( server + '/account' )
accounts = req.json()

# For each account
for account in accounts:

  # Get the report
  req = requests.get( server + '/reports/orbit', headers = {
    'X-Avocado': account['token']
  } )
  report = req.json()

  # Resolve path for file output
  path = output + '-' + account['id'] + '.json'

  # Write the report to disk
  with open( path , 'w' ) as file:
    json.dump( report, file )
