-- Track 4: Auth & Security (2 labs)
INSERT INTO public.course_labs (id, track_id, title, duration_minutes, difficulty, is_pro, concept_summary, initial_files, instructions, test_cases, sort_order, scaffolding, tips, lessons, exercises) VALUES
('lab-oauth2-pkce', 'track-4-auth-security', 'OAuth2 Authorization Code + PKCE', 55, 'Intermediate', false, 'Implement OAuth2 Authorization Code flow with PKCE, token rotation, and secure session management.', '{"src/auth/oauth2-provider.ts":"// OAuth2 provider implementation","src/auth/pkce.ts":"// PKCE code verifier/challenge","src/auth/token-store.ts":"// Token storage with encryption","src/auth/session-manager.ts":"// Session lifecycle management"}', '## OAuth2 Authorization Code + PKCE

Implement the OAuth2 Authorization Code flow with PKCE for secure authentication.

### Objectives
- Implement PKCE code verifier and challenge generation
- Build authorization endpoint with consent screen
- Implement token exchange with code verification
- Design refresh token rotation with reuse detection

### Requirements
1. Generate code_verifier and code_challenge (S256)
2. Build /authorize endpoint with state parameter
3. Implement /token endpoint with code exchange
4. Design refresh token rotation with family tracking

`bash
npm run test
npm run test:auth
`', '[{"id":"tc-1","description":"PKCE challenge verification rejects mismatched code_verifier","order":1,"required":true},{"id":"tc-2","description":"Authorization code expires after 10 minutes","order":2,"required":true},{"id":"tc-3","description":"Refresh token rotation invalidates old token family","order":3,"required":true},{"id":"tc-4","description":"State parameter prevents CSRF in authorization flow","order":4,"required":true}]', 1, '{"prerequisiteLabId": null, "stage": "Foundation", "estimatedHours": 6, "learningObjective": "Implement OAuth2 with PKCE and secure token lifecycle management", "buildsToward": "Enterprise Auth Service"}', '["Always use S256 for PKCE, never plain","State parameter must be cryptographically random, not sequential","Refresh token rotation is critical - leaked tokens become unusable","The tokens you issue here will be validated by lab-rbac-abac middleware","Store tokens encrypted at rest - use envelope encryption with a KMS"]', '["OAuth2 is not authentication - it is authorization. OpenID Connect adds auth","Token storage must encrypt at rest - never store plaintext secrets","Always validate the `aud` claim to prevent token confusion attacks","RBAC and ABAC from lab-rbac-abac authorize what the token holder can do","Token introspection is the bridge between your OAuth2 provider and resource servers"]', '["Implement token introspection endpoint for resource servers","Use DPoP (Demonstrating Proof of Possession) for sender-constrained tokens","Build a token revocation endpoint for logout flows","Create a token lifecycle diagram showing issuance, refresh, rotation, and revocation","Write security tests that attempt token replay, token theft, and code verifier guessing"]'),

('lab-rbac-abac', 'track-4-auth-security', 'RBAC & ABAC Authorization Models', 60, 'Advanced', true, 'Build Role-Based and Attribute-Based Access Control systems with policy evaluation engines.', '{"src/auth/rbac/role-manager.ts":"// Role hierarchy and assignment","src/auth/abac/policy-engine.ts":"// Attribute-based policy evaluator","src/auth/middleware/authorization.ts":"// Authorization middleware","src/auth/policies/definitions.ts":"// Policy definitions in JSON"}', '## RBAC & ABAC Authorization Models

Design sophisticated authorization systems combining roles and attributes.

### Objectives
- Implement RBAC with role hierarchy and permission inheritance
- Build ABAC policy engine with attribute conditions
- Design middleware that evaluates both RBAC and ABAC policies
- Create a policy administration interface

### Requirements
1. Implement RBAC with admin > editor > viewer hierarchy
2. Build ABAC policy engine evaluating user, resource, and environment attributes
3. Create authorization middleware combining both models
4. Write 20+ test cases covering all permission combinations

`bash
npm run test
npm run test:authz
`', '[{"id":"tc-1","description":"Admin role inherits all editor and viewer permissions","order":1,"required":true},{"id":"tc-2","description":"ABAC policy denies access when time-of-day constraint fails","order":2,"required":true},{"id":"tc-3","description":"Combined RBAC+ABAC correctly evaluates nested conditions","order":3,"required":true},{"id":"tc-4","description":"Policy changes take effect without server restart","order":4,"required":true}]', 2, '{"prerequisiteLabId": "lab-oauth2-pkce", "stage": "Building", "estimatedHours": 7, "learningObjective": "Design authorization systems with role hierarchy and attribute policies", "buildsToward": "Enterprise Auth Service"}', '["RBAC for coarse-grained access, ABAC for fine-grained conditions","Deny-by-default: explicit deny overrides any allow","Policy evaluation should be auditable with full decision traces","The tokens from lab-oauth2-pkce carry the claims your policies evaluate","Cache authorization decisions but invalidate on role or policy changes"]', '["The PDP (Policy Decision Point) pattern separates auth logic from business code","Attribute-based policies are more flexible but harder to debug","Always cache authorization decisions with short TTLs","This lab builds directly on the token claims from lab-oauth2-pkce - design them to carry what policies need","Audit logging for authorization decisions is required for SOC 2 compliance"]', '["Implement policy-as-code with version control and CI/CD","Use Cedar or OPA for production policy evaluation","Build a policy simulator for testing before deployment","Create a role hierarchy visualization tool for admins","Write integration tests that exercise every RBAC role and ABAC condition combination"]');

(End of file)
