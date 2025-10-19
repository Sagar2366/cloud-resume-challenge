import json
import logging
import boto3

# Configure logging for better CloudWatch integration (INFO level for views, ERROR for issues)
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize DynamoDB resource and reference the table
# Ensure the table 'resume-challenge' exists with partition key 'id' (String)
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('resume-challenge')

def lambda_handler(event, context):
    """
    Lambda handler for incrementing and returning a view counter stored in DynamoDB.
    
    Args:
        event: The AWS Lambda event object (typically empty for GET requests).
        context: The AWS Lambda context object (provides runtime info).
    
    Returns:
        dict: JSON response with status code, CORS headers, and view count.
    """
    try:
        # Perform atomic increment: Creates entry if missing, adds 1 to 'views', returns new value
        # This avoids race conditions in concurrent requests (no separate GET + PUT needed)
        response = table.update_item(
            Key={'id': '0'},  # Fixed key for the single counter item
            UpdateExpression='SET views = if_not_exists(views, :start) + :incr',
            ExpressionAttributeValues={
                ':start': 0,  # Default starting value if 'views' doesn't exist
                ':incr': 1   # Increment amount
            },
            ReturnValues='UPDATED_NEW'  # Returns the new/updated attributes
        )
        
        # Extract the updated view count from the response
        views = response['Attributes']['views']
        logger.info(f"Views updated to: {views}")  # Log success for monitoring
        
        # Return 200 OK with CORS headers for client-side fetch
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',  # Allow all origins (adjust for production)
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
            },
            'body': json.dumps({
                'views': views  # JSON-serialized count for JS fetch
            })
        }
        
    except Exception as e:
        # Catch any errors (e.g., table missing, IAM issues, network)
        logger.error(f"Error updating views: {str(e)}")  # Log full details server-side
        
        # Return generic 500 error to client (no sensitive info exposed)
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Internal server error'
            })
        }