-- Track 18: API Security Hardening (2 labs)
INSERT INTO public.course_labs (id, track_id, title, duration_minutes, difficulty, is_pro, concept_summary, initial_files, instructions, test_cases, sort_order, scaffolding, tips, lessons, exercises) VALUES
('lab-owasp-defense', 'track-18-api-security', 'OWASP Top 10 Defense Implementation', 55, 'Intermediate', false, 'Defend against OWASP Top 10 vulnerabilities: injection, XSS, SSRF, broken access control, and security misconfiguration.', '{}', '## OWASP Top 10 Defense Implementation

Implement defenses against the most critical web application security risks.

### Objectives
- Prevent SQL injection with parameterized queries
- Block XSS with output encoding and CSP headers
- Defend against SSRF with URL validation and allowlists
- Implement broken access control defenses

### Requirements
1. Fix SQL injection vulnerabilities in 3 query patterns
2. Implement Content-Security-Policy headers
3. Build SSRF protection with URL allowlist validation
4. Add rate limiting per user and per IP

`bash
npm run test:security
`', '[{"id":"tc-1","description":"Parameterized queries prevent all SQL injection attempts","order":1,"required":true},{"id":"tc-2","description":"CSP header blocks inline script execution","order":2,"required":true},{"id":"tc-3","description":"SSRF protection blocks internal network requests","order":3,"required":true}]', 1, '{"prerequisiteLabId": null, "stage": "Foundation", "estimatedHours": 6, "learningObjective": "Implement defenses against OWASP Top 10 vulnerabilities", "buildsToward": "Enterprise Security Hardening"}', '["SQL injection is still the most common vulnerability - always use parameterized queries","CSP is the strongest XSS defense - implement it first","SSRF is increasingly common as cloud services blur network boundaries","Input validation should be denylist-based for user-facing fields","Object-level authorization checks must exist at the service layer, not just routes"]', '["Input validation is not a substitute for output encoding","Rate limiting should be per-user AND per-IP for defense in depth","Security headers should be set at the edge, not just the application","ORM query builders are not immune to injection - sanitize raw query inputs","The OWASP ZAP baseline scan catches the easiest 60% of issues"]', '["Implement request signing for internal API calls","Use OWASP ZAP for automated security scanning","Add security.txt and responsible disclosure policy","Write unit tests that send malicious payloads to each endpoint","Verify that error messages do not leak stack traces or SQL syntax"]'),
('lab-security-headers', 'track-18-api-security', 'Security Headers and API Rate Limiting', 50, 'Intermediate', false, 'Implement comprehensive security headers, CORS policies, and multi-tier rate limiting.', '{}', '## Security Headers and API Rate Limiting

Implement defense-in-depth with security headers and rate limiting.

### Objectives
- Configure HSTS, X-Frame-Options, X-Content-Type-Options
- Design CORS policies for API access control
- Build multi-tier rate limiting (global, per-user, per-endpoint)

### Requirements
1. Implement all OWASP recommended security headers
2. Design CORS policy with origin allowlist
3. Build sliding window rate limiter with Redis
4. Add retry-after headers on 429 responses

`bash
npm run test:security
`', '[{"id":"tc-1","description":"Security headers present on all responses","order":1,"required":true},{"id":"tc-2","description":"CORS blocks requests from unauthorized origins","order":2,"required":true},{"id":"tc-3","description":"Rate limiter returns 429 with retry-after header","order":3,"required":true}]', 2, '{"prerequisiteLabId": "lab-owasp-defense", "stage": "Building", "estimatedHours": 5, "learningObjective": "Implement security headers and multi-tier rate limiting", "buildsToward": "Enterprise Security Hardening"}', '["HSTS requires initial HTTP to HTTPS redirect - plan the rollout","CORS preflight caches for max-age - consider this for changes","Sliding window rate limiting is more accurate than fixed window","Strict-Transport-Security max-age should start at 31536000 (1 year)","Use separate rate limits for authenticated vs anonymous users"]', '["Security headers are cheap - enable them all","CORS is not authentication - still validate auth tokens","Rate limiting should degrade gracefully under Redis failure","X-Content-Type-Options: nosniff prevents MIME type confusion attacks","Content-Security-Policy report-uri lets you monitor violations in production"]', '["Use helmet (Node) or equivalent for automatic security headers","Implement adaptive rate limiting based on endpoint sensitivity","Add abuse detection for credential stuffing patterns","Log rate-limit hits with IP and user-agent for abuse analysis","Write integration tests that verify every required header is present"]') ON CONFLICT (id) DO NOTHING;