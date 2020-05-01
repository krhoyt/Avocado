import base64
import re
import requests

api = 'http://localhost:3000/api'

# Remove HTML tags from content
def remove_html_tags( text ):
  clean = re.compile( '<.*?>' )
  return re.sub( clean, '', text ).strip()

# Extract unique images
# Once per presence in content
# Check for existing in database
# Analyze with Watson if requested
# Store in respective table
def unique_images( url, model, id, watson = False ):
  encoded = base64.urlsafe_b64encode( url.encode( 'utf-8' ) ) 
  req = requests.get( api + '/utility/images/' + str( encoded, 'utf-8' ) )
  images = req.json()

  for image in images:
    record = {
      'url': image,
      'keywords': None
    }

    # Check if image exists in the database
    encoded = base64.urlsafe_b64encode( record['url'].encode( 'utf-8' ) ) 
    req = requests.get( api + '/media/url/' + str( encoded, 'utf-8' ) )
    media = req.json()

    if media == None:
      # Analyze image
      # Optional feature
      if watson == True:
        encoded = base64.urlsafe_b64encode( record['url'].encode( 'utf-8' ) )           
        req = requests.get( api + '/watson/vision/' + str( encoded, 'utf-8' ) )
        record['keywords'] = req.json()

      # Create media record
      req = requests.post( api + '/media', json = record )
      media = req.json()

    # Associate with post
    req = requests.post( api + '/' + model + '/post/' + id + '/media', json = {
      'media_id': media['id']
    } )
    associate = req.json()

    print( 'Pict: ' + associate['id'] )
  