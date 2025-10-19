# Lambda Function for Visitor Counter
# This function handles API requests to increment and return visitor count
resource "aws_lambda_function" "myfunc" {
  filename         = data.archive_file.zip_the_python_code.output_path
  source_code_hash = data.archive_file.zip_the_python_code.output_base64sha256
  function_name    = "cloud-resume-lambda"
  role             = aws_iam_role.iam_for_lambda.arn
  handler          = "func.lambda_handler"
  runtime          = "python3.12"
  timeout          = 30

  tags = {
    Name = "ResumeVisitorCounter"
  }
}

# IAM Role for Lambda Function
# Allows Lambda service to assume this role
resource "aws_iam_role" "iam_for_lambda" {
  name = "iam_for_lambda"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

# IAM Policy for Lambda Function
# Grants permissions for CloudWatch Logs and DynamoDB access
resource "aws_iam_policy" "iam_policy_for_resume_project" {
  name        = "aws_iam_policy_for_terraform_resume_project_policy"
  path        = "/"
  description = "AWS IAM Policy for managing the resume project role"
  
  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        # CloudWatch Logs permissions for Lambda function logging
        "Action" : [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        "Resource" : "arn:aws:logs:*:*:*",
        "Effect" : "Allow"
      },
      {
        # DynamoDB permissions for visitor counter operations
        "Effect" : "Allow",
        "Action" : [
          "dynamodb:UpdateItem",
          "dynamodb:GetItem"
        ],
        "Resource" : "arn:aws:dynamodb:*:*:table/cloud-resume-table"
      },
    ]
  })
}

# Attach IAM Policy to IAM Role
resource "aws_iam_role_policy_attachment" "attach_iam_policy_to_iam_role" {
  role       = aws_iam_role.iam_for_lambda.name
  policy_arn = aws_iam_policy.iam_policy_for_resume_project.arn
}

# Archive Lambda Function Code
# Creates a zip file from the Python source code
data "archive_file" "zip_the_python_code" {
  type        = "zip"
  source_file = "${path.module}/lambda/func.py"
  output_path = "${path.module}/lambda/func.zip"
}

# API Gateway HTTP API
# Creates a managed API endpoint for the Lambda function
resource "aws_apigatewayv2_api" "lambda_api" {
  name          = "cloud-resume-challenge"
  protocol_type = "HTTP"
  description   = "HTTP API for cloud resume challenge visitor counter"

  cors_configuration {
    allow_credentials = false
    allow_headers     = ["content-type", "x-amz-date", "authorization", "x-api-key", "x-amz-security-token", "x-amz-user-agent"]
    allow_methods     = ["*"]
    allow_origins     = ["*"]
    expose_headers    = ["date", "keep-alive"]
    max_age           = 86400
  }
}

# API Gateway Integration
# Connects the API Gateway to the Lambda function
resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id             = aws_apigatewayv2_api.lambda_api.id
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
  integration_uri    = aws_lambda_function.myfunc.invoke_arn
  payload_format_version = "2.0"
}

# API Gateway Route
# Defines the /visitor endpoint
resource "aws_apigatewayv2_route" "visitor_route" {
  api_id    = aws_apigatewayv2_api.lambda_api.id
  route_key = "GET /visitor"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

# API Gateway Stage
# Deploys the API to the $default stage
resource "aws_apigatewayv2_stage" "default_stage" {
  api_id      = aws_apigatewayv2_api.lambda_api.id
  name        = "$default"
  auto_deploy = true
}

# Lambda Permission for API Gateway
# Allows API Gateway to invoke the Lambda function
resource "aws_lambda_permission" "api_gateway_invoke" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.myfunc.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.lambda_api.execution_arn}/*/*/visitor"
}

# DynamoDB Table for Visitor Counter
# Stores the visitor count data with pay-per-request billing
resource "aws_dynamodb_table" "resume_challenge" {
  name         = "cloud-resume-table"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  tags = {
    Name = "ResumeChallenge"
  }
}

# Output the API Gateway URL
output "api_gateway_url" {
  description = "API Gateway endpoint URL for visitor counter"
  value       = aws_apigatewayv2_api.lambda_api.api_endpoint
}

output "visitor_api_url" {
  description = "Complete URL for visitor counter API"
  value       = "${aws_apigatewayv2_api.lambda_api.api_endpoint}/visitor"
}