# Contributing to Cloud Resume Challenge

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Create a new branch for your feature/fix
4. Make your changes
5. Test locally using Docker or Python server
6. Submit a pull request

## Local Development

### Using Python
```bash
cd website
python3 -m http.server 8080
```

### Using Docker
```bash
docker-compose up -d
```

## Code Style

- Follow existing HTML/CSS/JS patterns
- Keep Terraform code clean and documented
- Update README.md for any new features

## Testing

- Test website locally before submitting PR
- Verify Terraform plan works without errors
- Check all links and functionality work

## Pull Request Guidelines

- Provide clear description of changes
- Include screenshots for UI changes
- Reference any related issues
- Ensure CI/CD pipeline passes