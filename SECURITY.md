# Security Policy

## Supported Versions

Currently supported versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in cidadao.ai-frontend, please report it responsibly:

1. **DO NOT** open a public issue
2. Email: anderson.ufrj@gmail.com
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Response Time

- Initial response: Within 48 hours
- Status update: Within 7 days
- Fix timeline: Depends on severity (critical: 24-72h, high: 1-2 weeks)

## Security Measures

### Authentication

- Supabase OAuth integration
- JWT token-based sessions
- Secure cookie handling with httpOnly flags

### Data Protection

- Content sanitization (DOMPurify)
- XSS prevention
- CSRF protection
- Rate limiting

### Infrastructure

- HTTPS only
- Security headers (CSP, X-Frame-Options, etc.)
- Regular dependency updates via Renovate
- Automated security scanning

## Acknowledgments

We appreciate security researchers who responsibly disclose vulnerabilities.
