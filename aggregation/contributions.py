import requests

api = 'http://localhost:3000/api'
history = 30

# Create contribution record in database
def create( entity, item, rule = None ):
  # Parse record ID
  path = entity['path'].split( '/' )
  id = item[path[1] + '_id'].lower()
  
  # Check existance
  req = requests.get( api + '/contribution/reference/' + item['id'] )
  existing = req.json()

  # Already exists
  if existing != None:
    # Even in the same capacity
    if existing['capacity_id'] == rule: 
      # No more additional credit
      print( 'Exist: ' + item['id'] )
      return

  # To get developer ID from parent
  req = requests.get( api + '/' + path[1] + '/' + id , headers = {
    'X-Avocado': account['token']    
  } )
  owner = req.json()

  # Format complex descriptions
  if entity['description'].find( ',' ) >= 0:
    parts = entity['description'].split( ',' )
    
    # Seed
    description = ''
    index = 0

    # Populate
    for part in parts:
      # Odd numbers are appended
      # Even numbers are evaluated
      # TODO: More robust handling
      if index % 2 == 0:
        description = description + item[part]
      else:
        description = description + part

      index = index + 1 
  else:
    # Simple title
    # Single field
    description = item[entity['description']]

  # Link may be NULL
  # Specifically in GitHub events
  # TODO: Consider adding link to GitHubEvent
  # TODO: Not available in all cases
  link = None

  if entity['link'] != None:
    link = item[entity['link']]

  # Build contribution record
  record = {
    'developer_id': owner['developer_id'],
    'contributed_at': item[entity['contributed']],
    'description': description,
    'link': link,
    'public': 1,
    'capacity_id': rule,
    'reference_id': item['id']
  }
  
  # Commit to database
  req = requests.post( api + '/contribution', json = record )
  resolved = req.json()

  print( 'Make: ' + resolved['id'] )

# Evaluate two values based on a condition
# Condition and values are dynamic
def evaluate( condition, current, value ):
  result = False

  # Contains
  # Assumes strings
  if condition == 0:
    result = True if current.lower().find( value.lower() ) >= 0 else False

  # Exists
  if condition == 1:
    result = True

  # Equals
  # Handle integers and strings
  if condition == 2:
    if current.isnumeric() and value.isnumeric():
      result = True if int( current ) == int( value ) else False
    else:
      result = True if current == value else False      

  # Not equal
  # Handle integers and strings
  if condition == 3:
    if current.isnumeric() and value.isnumeric():
      result = False if int( current ) == int( value ) else True
    else:
      result = False if current != value else True

  # Greater than
  # Numeric only
  if condition == 4:
    result = True if int( current ) > int( value ) else False

  # Less than
  # Numeric only  
  if condition == 5:
    result = False if int( current ) > int( value ) else True

  # Greater than or equal
  # Numeric only  
  if condition == 6:
    result = True if int( current ) >= int( value ) else False

  # Less than or equal
  # Numeric only  
  if condition == 7:
    result = False if int( current ) >= int( value ) else True        

  return result

# Entities
req = requests.get( api + '/capacity/entities' )
entities = req.json()

# Fields
req = requests.get( api + '/capacity/fields' )
fields = req.json()

# Accounts
req = requests.get( api + '/account' )
accounts = req.json()

for account in accounts:
  # Rules for account
  req = requests.get( api + '/capacity', headers = {
    'X-Avocado': account['token']
  } )
  rules = req.json()

  for rule in rules:
    # Non-automated
    if rule['criteria'] == None:
      continue

    # Criteria and entity
    criteria = rule['criteria'].split( ',' )
    entity = entities[int( criteria[0] )]
  
    # Get content for rule type (entity)
    req = requests.get( api + entity['path'] )
    items = req.json()

    # Evaluate content against rule
    for item in items:
      # Grab pertinent parts
      field = fields[entity['label']][int( criteria[1] )]
      compare = int( criteria[2] )

      # Evalute first half of criteria
      # Second half may yet exist
      condition_one = evaluate( compare, item[field['column']], criteria[3] )

      # Check for second criteria
      if len( criteria ) > 4:

        # Grab pertinent parts
        clause = int( criteria[4] )
        field = fields[entity['label']][int( criteria[5] )]
        compare = int( criteria[6] )
        
        # Evaluate second half of criteria
        condition_two = evaluate( compare, item[field['column']], criteria[7] )

        # And
        if clause == 0:
          # print( item[field['column']] + ' AND ' + criteria[7] )
          # print( str( condition_one ) + ' AND ' + str( condition_two ) )
          if condition_one and condition_two:
            create( entity, item, rule['id'] )

        # Or
        if clause == 1:
          if condition_one or condition_two:
            create( entity, item, rule['id'] )

      else:
        # Only one criteria
        if condition_one == True:
          create( entity, item, rule['id'] )
