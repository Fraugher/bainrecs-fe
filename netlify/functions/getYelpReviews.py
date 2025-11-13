import json
import os
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError


def handler(event, context):
    """
    Netlify serverless function to search Yelp businesses
    
    Query parameters:
    - location (required): Location to search in
    - term: Search term (default: 'restaurants')
    - radius: Search radius in meters (default: 10000)
    - categories: Comma-separated list of category filters
    - price: Comma-separated pricing levels (1=cheap, 2, 3, 4=expensive)
    - attributes: Business attributes like 'ambiance'
    - sort_by: Sort results by (default: 'rating')
    """
    
    # Get Yelp API key from environment variables
    api_key = os.environ.get('YELP_API_KEY')
    
    if not api_key:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': json.dumps({
                'error': 'Configuration Error',
                'message': 'YELP_API_KEY not configured in environment variables.'
            })
        }
    
    # Parse query parameters from the request
    params = event.get('queryStringParameters', {})
    
    # Validate required parameters
    if not params.get('location'):
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': json.dumps({
                'error': 'Missing Required Parameter',
                'message': 'The "location" parameter is required.'
            })
        }
    
    # Build Yelp API query parameters
    yelp_params = {
        'location': params.get('location'),
        'term': 'restaurants',
        'radius': int(params.get('radius', 10000)),
        'sort_by': 'rating'
    }
    
    # Add optional parameters if provided
    if params.get('categories'):
        yelp_params['categories'] = params.get('categories')
    
    if params.get('price'):
        yelp_params['price'] = params.get('price')
    
    if params.get('attributes'):
        yelp_params['attributes'] = params.get('attributes')
    
    # Build the URL with query parameters
    base_url = 'https://api.yelp.com/v3/businesses/search'
    url = f"{base_url}?{urlencode(yelp_params)}"
    
    # Create request with authorization header
    headers = {
        'Authorization': f'Bearer {api_key}'
    }
    
    try:
        # Make the request to Yelp API
        request = Request(url, headers=headers)
        with urlopen(request) as response:
            data = json.loads(response.read().decode('utf-8'))
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',  # Enable CORS
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
                'body': json.dumps(data)
            }
    
    except HTTPError as e:
        error_body = e.read().decode('utf-8')
        
        # Parse error response if JSON
        try:
            error_data = json.loads(error_body)
        except:
            error_data = {'message': error_body}
        
        # Handle specific Yelp API error codes
        error_messages = {
            400: {
                'error': 'Bad Request',
                'message': 'Invalid request parameters. Please check your query parameters.',
                'details': error_data
            },
            401: {
                'error': 'Unauthorized',
                'message': 'The API key has either expired or doesn\'t have the required scope to query this endpoint.',
                'details': error_data,
                'possible_causes': [
                    'UNAUTHORIZED_API_KEY: The API key provided is not currently able to query this endpoint.',
                    'TOKEN_INVALID: Invalid API key or authorization header.'
                ]
            },
            403: {
                'error': 'Forbidden',
                'message': 'The API key provided is not currently able to query this endpoint.',
                'details': error_data
            },
            404: {
                'error': 'Resource Not Found',
                'message': 'The requested resource was not found. Please check the endpoint URL.',
                'details': error_data
            },
            413: {
                'error': 'Request Entity Too Large',
                'message': 'The length of the request exceeded the maximum allowed.',
                'details': error_data
            },
            429: {
                'error': 'Too Many Requests',
                'message': 'You have either exceeded your daily quota, or have exceeded the queries-per-second limit for this endpoint. Try reducing the rate at which you make queries.',
                'details': error_data
            },
            500: {
                'error': 'Internal Server Error',
                'message': 'Yelp API is experiencing internal server errors. Please try again later.',
                'details': error_data
            },
            503: {
                'error': 'Service Unavailable',
                'message': 'Yelp API service is temporarily unavailable. Please try again later.',
                'details': error_data
            }
        }
        
        # Get specific error message or use generic one
        error_response = error_messages.get(e.code, {
            'error': f'Yelp API Error ({e.code})',
            'message': e.reason,
            'details': error_data
        })
        
        return {
            'statusCode': e.code,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': json.dumps(error_response)
        }
    
    except URLError as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': json.dumps({
                'error': 'Network error',
                'message': 'Unable to reach Yelp API. Please check your connection.',
                'details': str(e.reason)
            })
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': json.dumps({
                'error': 'Internal server error',
                'message': 'An unexpected error occurred.',
                'details': str(e)
            })
        }
