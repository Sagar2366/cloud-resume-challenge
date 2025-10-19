# Terraform Outputs
# These values are displayed after successful deployment

# Lambda Function URL Output
# Use this URL in your website JavaScript to call the visitor counter API
output "lambda_function_url" {
  description = "URL of the Lambda function for visitor counter"
  value       = aws_lambda_function_url.url1.function_url
}

# DynamoDB Table Name Output
# Reference for the table storing visitor count data
output "dynamodb_table_name" {
  description = "Name of the DynamoDB table storing visitor counts"
  value       = aws_dynamodb_table.resume_challenge.name
}