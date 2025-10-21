# AWS Cloud Resume Challenge
![Website](generated-diagrams/website.png)



This is Sagar Utekar's implementation of the AWS Cloud Resume Challenge.
What is Cloud Resume Challenge? - [The Cloud Resume Challenge](https://cloudresumechallenge.dev/) is a multiple-step resume project which helps build and demonstrate skills fundamental to pursuing a career in Cloud. The project was published by Forrest Brazeal.

## Architecture

![Architecture Diagram](generated-diagrams/architecture.png)

The architecture follows a serverless approach using AWS services:

1. **Frontend**: Static website hosted on S3 with CloudFront CDN
2. **API Layer**: API Gateway HTTP API for visitor counter endpoint
3. **Backend**: Lambda function for visitor counter logic
4. **Database**: DynamoDB for storing view counts
5. **Security**: Certificate Manager for SSL/TLS certificates
6. **DNS**: Route 53 for domain resolution

**Services Used**:

- **S3**: Static website hosting
- **CloudFront**: Global CDN with HTTPS enforcement
- **API Gateway**: HTTP API for visitor counter endpoint
- **Lambda**: Serverless function for counter logic
- **DynamoDB**: NoSQL database for view count storage
- **Certificate Manager**: SSL/TLS certificates
- **Route 53**: DNS management
- **IAM**: Security roles and policies
- **CloudWatch**: Logging and monitoring


## Project Structure

```
├── .github/workflows/      # CI/CD pipelines
├── generated-diagrams/     # Architecture diagrams
├── infra/                  # Terraform infrastructure
│   └── lambda/             # Lambda function code
├── website/                # Frontend files
│   ├── assets/             # Images and assets
│   ├── index.html
│   ├── index.js
│   └── style.css
├── docker-compose.yml
├── Dockerfile
└── README.md
```

## Prerequisites

### Required Tools & Accounts

#### 1. AWS Account
- **Purpose**: Host your serverless resume infrastructure
- **Setup**: [Create AWS Account](https://aws.amazon.com/free/)
- **Permissions**: IAM user with Lambda, DynamoDB, S3, CloudFront access

#### 2. AWS CLI (Optional for Part 1)
- **Purpose**: Command-line interface for AWS services
- **Install**: 
  ```bash
  # macOS
  brew install awscli
  # Windows
  winget install Amazon.AWSCLI
  # Linux
  curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
  ```
- **Configure**: `aws configure` (enter Access Key, Secret Key, Region)


#### 3. Amazon Q Developer
- **What is it**: AI-powered coding assistant built by AWS for developers
- **Purpose**: Provides intelligent code suggestions, AWS best practices, and debugging help
- **Features**:
  - Code completion and generation
  - AWS service recommendations
  - Security vulnerability detection
  - Code explanations and documentation
- **Setup**:
  1. Install VS Code extension: Search "Amazon Q" in VS Code Extensions
  2. Sign in with AWS Builder ID (free) or AWS IAM Identity Center
  3. Enable in VS Code settings
- **Usage**: Type code and get AI suggestions, ask questions in chat panel

#### 4. uvx (Universal eXecutable)
- **What is it**: Tool to run Python applications in isolated environments
- **Purpose**: Execute Python packages without installing them globally
- **Install**: `pip install uvx`
- **Usage**: `uvx package-name` runs packages in temporary environments
- **Benefits**: No dependency conflicts, clean system

#### 5. MCP (Model Context Protocol)

![MCP Architecture](generated-diagrams/mcp-architecture.avif)

- **What is it**: Open protocol for connecting AI assistants to external tools and data
- **Purpose**: Enables AI models to interact with various services and APIs
- **How it works**: AI assistants use MCP servers to access external functionality
- **Benefits**: Extends AI capabilities beyond text generation

#### 6. Diagram MCP Server
- **What is it**: MCP server that generates AWS architecture diagrams
- **Purpose**: Create visual diagrams programmatically using AI
- **Setup**:
  1. Create `.vscode/mcp.json` in your project root:
     ```json
     {
       "mcpServers": {
         "awslabs.core-mcp-server": {
           "command": "uvx",
           "args": ["awslabs.core-mcp-server@latest"],
           "env": {
             "FASTMCP_LOG_LEVEL": "ERROR"
           }
         }
       }
     }
     ```
  2. Restart VS Code to load MCP server
  3. Use Amazon Q Developer to generate diagrams
- **Usage**: Ask Amazon Q to "create AWS architecture diagram" and it will use the MCP server

### Setup Verification
```bash
# Test AWS connectivity (if AWS CLI installed)
aws sts get-caller-identity
```

## Part 1: Local Setup

Set up your local development environment and test the website locally before deploying to AWS.

### 1. Download Repository
Download the repository files to your local machine from GitHub.

### 2. Local Development with Docker

Test your website locally before deploying:

#### Build and Run with Docker
```bash
# Build the Docker image
docker build -t cloud-resume-challenge .

# Run the container
docker run -d -p 8080:80 --name resume-site cloud-resume-challenge

# Access the website at http://localhost:8080
```

#### Docker Commands
```bash
# Stop the container
docker stop resume-site

# Remove the container
docker rm resume-site

# Remove the image
docker rmi cloud-resume-challenge
```

#### Using Docker Compose
Use the existing `docker-compose.yml` file:
```bash
docker-compose up -d
docker-compose down
```

### 3. Test Local Website
- Visit http://localhost:8080
- Verify the website loads correctly
- Note: Visitor counter won't work locally (requires AWS backend)

---

## Part 2: Manual Cloud Setup (Learning Approach)

This section walks through creating everything manually via AWS Console to understand each component. Each step is done through point-and-click interface to learn how AWS services work together.

### 1. Manual AWS Console Setup
Create all resources step-by-step through AWS Console:

1. **Create DynamoDB Table**:
   - Go to DynamoDB Console
   - Create table named `cloud-resume-table`
   - Partition key: `id` (String)
   - Use on-demand billing
   - Add initial item: `id: "0"`, `views: 0`

2. **Create Lambda Function**:
   - Go to Lambda Console
   - Create function: `cloud-resume-lambda`
   - Runtime: Python 3.12
   - Upload `infra/lambda/func.py` code
   - Handler: `func.lambda_handler`
   - Timeout: 30 seconds

3. **Configure IAM Role for Lambda** (**Security**: Least privilege principle):
   - Create role: `cloud-resume-lambda-role`
   - Trust policy: Allow Lambda service to assume role
   - Attach policies:
     - `AWSLambdaBasicExecutionRole`
     - Custom DynamoDB policy (minimal permissions):
       ```json
       {
         "Version": "2012-10-17",
         "Statement": [
           {
             "Effect": "Allow",
             "Action": [
               "dynamodb:GetItem",
               "dynamodb:UpdateItem"
             ],
             "Resource": "arn:aws:dynamodb:*:*:table/cloud-resume-table"
           }
         ]
       }
       ```


4. **Create API Gateway (HTTP API)** (**Security**: Built-in DDoS protection):
   - Go to API Gateway Console
   - Create HTTP API
   - Name: `cloud-resume-challenge`
   - Create route: `GET /visitor` (only GET method for security)
   - Integration type: Lambda function
   - Lambda function: `cloud-resume-lambda`
   - Deploy to `$default` stage
   - Note the API endpoint URL


5. **Configure Lambda Permissions for API Gateway**:
   
   - Go to Lambda Console → Functions → cloud-resume-lambda
   - Click "Configuration" → "Permissions"
   - Under "Resource-based policy", click "Add permissions"
   - Service: API Gateway
   - Source ARN: `arn:aws:execute-api:REGION:ACCOUNT:API-ID/*/*/visitor`
   - Click "Save"


6. **Create S3 Bucket** (**Security**: Read-only public access):
   
   - Go to S3 Console → "Create bucket"
   - Bucket name: `your-unique-bucket-name`
   - Region: us-east-1 (or your preferred region)
   - Uncheck "Block all public access" (required for website hosting)
   - Click "Create bucket"
   - Click on bucket → "Properties" → "Static website hosting"
   - Enable static website hosting
   - Index document: `index.html`
   - Click "Save"
   - Go to "Permissions" → "Bucket policy"
   - Add policy (read-only for security):
     ```json
     {
       "Version": "2012-10-17",
       "Statement": [
         {
           "Sid": "PublicReadGetObject",
           "Effect": "Allow",
           "Principal": "*",
           "Action": "s3:GetObject",
           "Resource": "arn:aws:s3:::your-bucket-name/*"
         }
       ]
     }
     ```

7. **Setup CloudFront** (**Security**: HTTPS enforcement + DDoS protection):
   
   - Go to CloudFront Console → "Create distribution"
   - Origin domain: Select your S3 bucket
   - Origin access: "Origin access control settings (recommended)" (security best practice)
   - Create new OAC if needed
   - Default cache behavior: Allow GET, HEAD methods only
   - Viewer protocol policy: "Redirect HTTP to HTTPS" (enforces encryption)
   - Price class: "Use all edge locations"
   - Default root object: `index.html`
   - Click "Create distribution"
   - Update S3 bucket policy to allow CloudFront access

8. **Note API Gateway URL**:
   After manual setup, copy the API Gateway URL from:
   - API Gateway Console → Your API → Stages → $default

9. **Update Website JavaScript**:
   Update `website/index.js` with your API Gateway URL:
   ```javascript
   // Replace with your API Gateway URL
   fetch("https://your-api-id.execute-api.region.amazonaws.com/visitor")
   ```

10. **Deploy Website Manually**:
    Upload your website files to S3 using the AWS Console:
    - Go to S3 Console → Your bucket
    - Click "Upload"
    - Select all files from your website folder
    - Click "Upload"

11. **Configure Custom Domain with Route53**:
    
    **Step 1: Purchase Domain from GoDaddy**
    - Go to [GoDaddy.com](https://godaddy.com)
    - Search and purchase your domain (e.g., `yourname.com`)
    - Complete the purchase process
    
    **Step 2: Create Route 53 Hosted Zone**
    - Go to Route 53 Console → Hosted zones
    - Click "Create hosted zone"
    - Domain name: `yourname.com`
    - Type: Public hosted zone
    - Click "Create hosted zone"
    - Note the 4 name servers (NS records)
    
    **Step 3: Update GoDaddy Name Servers**
    - Log into your GoDaddy account
    - Go to "My Products" → "DNS"
    - Click "Change" next to Nameservers
    - Select "Custom" nameservers
    - Enter the 4 Route 53 name servers:
      ```
      ns-xxx.awsdns-xx.com
      ns-xxx.awsdns-xx.co.uk
      ns-xxx.awsdns-xx.net
      ns-xxx.awsdns-xx.org
      ```
    - Save changes (propagation takes 24-48 hours)
    
    **Step 4: Request SSL Certificate**
    - Go to Certificate Manager Console (us-east-1 region)
    - Click "Request a certificate"
    - Select "Request a public certificate"
    - Domain names: `yourname.com` and `www.yourname.com`
    - Validation method: DNS validation
    - Click "Request"
    
    **Step 5: Validate Certificate**
    - In Certificate Manager Console
    - Click on your certificate
    - Click "Create records in Route 53" for DNS validation
    - Click "Create records"
    - Wait for certificate status to become "Issued" (5-10 minutes)
    
    **Step 6: Update CloudFront Distribution**
    - Go to CloudFront Console
    - Click on your distribution ID
    - Click "Edit"
    - Under "Settings":
      - Alternate domain names (CNAMEs): Add `yourname.com` and `www.yourname.com`
      - Custom SSL certificate: Select your certificate from dropdown
    - Click "Save changes"
    - Wait for deployment (Status: "Deployed")
    
    **Step 7: Create Route 53 Records**
    
    **For Root Domain (yourname.com):**
    - Go to Route 53 Console → Hosted zones
    - Click on your domain
    - Click "Create record"
    - Record name: Leave blank (root domain)
    - Record type: A
    - Toggle "Alias" to ON
    - Route traffic to: "Alias to CloudFront distribution"
    - Choose distribution: Select your CloudFront distribution
    - Click "Create records"
    
    **For WWW Subdomain:**
    - Click "Create record"
    - Record name: `www`
    - Record type: CNAME
    - Value: `yourname.com`
    - TTL: 300
    - Click "Create records"

12. **Test the Manual Setup**:
    - Visit your website URL
    - Verify visitor counter increments
    - Check Lambda logs in CloudWatch

---

## Part 3: Automated Setup (Production Approach) [WIP]

![Part 2 CI/CD Pipeline](generated-diagrams/part2_cicd_pipeline.png)

This section shows how to automate everything using Terraform and GitHub Actions for a production-ready setup.

### Prerequisites for Automation
```bash
# Verify all automation tools
aws --version
terraform --version
git --version
```

### 1. Infrastructure as Code with Terraform

#### Deploy Infrastructure Automatically
```bash
cd infra
terraform init
terraform plan
terraform apply -auto-approve
```

#### Get Terraform Outputs
```bash
# Get API Gateway URL
terraform output api_gateway_url
terraform output visitor_api_url
```

### 2. Update Website with Terraform Output
Update `website/index.js` with the Terraform output URL:
```javascript
// Use the visitor_api_url from terraform output
fetch("TERRAFORM_OUTPUT_URL_HERE")
```

### 3. Setup GitHub Actions CI/CD

#### Configure GitHub Secrets
Add these secrets to your GitHub repository:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`

#### Automated Deployment
- Push changes to main branch
- GitHub Actions automatically:
  - Deploys website to S3
  - Runs Terraform for infrastructure changes
  - Invalidates CloudFront cache

### 4. Test the Automated Setup
- Visit your website URL
- Verify visitor counter increments
- Check GitHub Actions workflow logs
- Monitor CloudWatch logs

### 5. Comparison: Manual vs Automated

| Aspect | Manual Setup (Part 2) | Automated Setup (Part 3) |
|--------|----------------------|-------------------------|
| **Learning** | Understand each component | Abstracted complexity |
| **Time** | 2-3 hours | 15-30 minutes |
| **Reproducibility** | Manual steps, prone to errors | Consistent, repeatable |
| **Production Ready** | Manual updates required | CI/CD pipeline |
| **Cost** | Same AWS costs | Same AWS costs |
| **Maintenance** | Manual updates | Automated updates |
| **Best For** | Learning, understanding AWS | Production, team collaboration |

**Recommendation**: 
- **Start with Part 1** for local development
- **Use Part 2** to understand AWS services
- **Move to Part 3** for production deployments


---

## Cleanup

### Local Setup Cleanup (Part 1)
```bash
# Stop and remove Docker containers
docker-compose down
docker rmi cloud-resume-challenge
```

### Manual Setup Cleanup (Part 2)
- Delete resources manually through AWS Console in reverse order:
  1. CloudFront distribution
  2. S3 bucket contents and bucket
  3. API Gateway
  4. Lambda function
  5. DynamoDB table
  6. IAM roles
  7. Route 53 hosted zone (if created)

### Automated Setup Cleanup (Part 3)
```bash
cd infra
terraform destroy -auto-approve
```



## [Live Demo](https://cloud-resume.bossman.cloud/)

## YouTube Video

[AWS Cloud Resume Challenge - Complete Tutorial](https://youtu.be/YOUR_VIDEO_ID)

A comprehensive walkthrough covering:
- Setting up S3 and CloudFront
- Creating Lambda function and DynamoDB
- Implementing visitor counter with JavaScript
- CI/CD with GitHub Actions
- Infrastructure as Code with Terraform

 
## Author
**Sagar Utekar**
- GitHub: [sagar2366](https://github.com/sagar2366)
- LinkedIn: [sagar-utekar](https://linkedin.com/in/sagar-utekar)
  
## Stars
[![Stargazers over time](https://starchart.cc/sagar2366/cloud-resume-challenge.svg?variant=adaptive)](https://starchart.cc/sagar2366/cloud-resume-challenge)
