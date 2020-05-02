import base64
import json
import requests

# https://github.ibm.com/stevemar/cartographer
cartographer = 'https://s3.us.cloud-object-storage.appdomain.cloud/cartographerstorage/patterns.json'

# https://insights-api.mybluemix.net/api
insights = 'http://localhost:3000/api/github/repository'

# Output file
output = '../web/public/data/patterns.json'

# Hold the final report data
# Later exported to JSON
report = []

# Get the patterns
req = requests.get( cartographer )
patterns = req.json()

for pattern in patterns['patterns']:
  # Check if public or hosted GitHub
  # Private repositories (hosted GitHub) is not supported
  if 'github.com' not in pattern['repo']:
    continue

  # URLs must be for root repository
  # Repository branches are not supported
  if '/tree/' in pattern['repo']:
    continue

  # Extract repository name from full URL
  try:
    # Look for end of GitHub URL    
    index = pattern['repo'].index( '.com/' ) + 5

    # Extract repository name
    repository_name = pattern['repo'][index:]
    
    # Remove any trailing slash
    if repository_name[len( repository_name ) - 1] == '/':
      repository_name = repository_name[0:len( repository_name ) - 1]    
  except:
    repository_name = None

  # Nope
  # Repository not on GitHub
  # Skip
  if repository_name == None:
    continue

  # Show progress
  print( repository_name )

  # Get repository details
  # WTF is up with Python encoding
  encoded = base64.urlsafe_b64encode( 
    repository_name.encode( 'utf-8' ) 
  ).decode( 'utf-8' )
  req = requests.get( insights + '/' + encoded )  
  repository = req.json()

  # Add to report
  report.append( repository )
 
# Export report as JSON
with open( output, 'w' ) as file:
  json.dump( report, file )
