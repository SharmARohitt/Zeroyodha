#!/bin/bash

# ============================================================================
# ZEROYODHA PRODUCTION VALIDATION CHECKLIST
# ============================================================================
# Run this script before deploying to production
# Usage: chmod +x production-checklist.sh && ./production-checklist.sh
# ============================================================================

echo ""
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║     ZEROYODHA BACKEND - PRODUCTION VALIDATION CHECKLIST            ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0
WARNINGS=0

# Helper functions
pass() {
    echo -e "${GREEN}✅ PASS${NC}: $1"
    ((PASSED++))
}

fail() {
    echo -e "${RED}❌ FAIL${NC}: $1"
    ((FAILED++))
}

warn() {
    echo -e "${YELLOW}⚠️  WARN${NC}: $1"
    ((WARNINGS++))
}

info() {
    echo -e "${BLUE}ℹ️  INFO${NC}: $1"
}

# ============================================================================
# Section 1: File Structure Validation
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📁 File Structure Validation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

FILES=(
    "server.js"
    "package.json"
    ".env.example"
    ".gitignore"
    "config/firebaseAdmin.js"
    "middleware/authMiddleware.js"
    "middleware/errorHandler.js"
    "middleware/rateLimiter.js"
    "middleware/validator.js"
    "middleware/cacheManager.js"
    "middleware/webhookValidator.js"
    "routes/marketRoutes.js"
    "routes/authRoutes.js"
    "services/dhanService.js"
    "utils/asyncHandler.js"
    "utils/tokenManager.js"
    "utils/healthMonitor.js"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        pass "File exists: $file"
    else
        fail "File missing: $file"
    fi
done

# ============================================================================
# Section 2: Security Validation
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 Security Validation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check for hardcoded secrets in code
if grep -r "AKIA\|sk_live_\|pk_live_\|mysql://\|password:" --include="*.js" . 2>/dev/null | grep -v node_modules | grep -v ".env"; then
    fail "Potential hardcoded secrets found in code"
else
    pass "No obvious hardcoded secrets detected"
fi

# Check .gitignore
if grep -q "serviceAccountKey.json" .gitignore; then
    pass ".gitignore excludes Firebase service account key"
else
    fail ".gitignore does not exclude serviceAccountKey.json"
fi

if grep -q "\.env" .gitignore; then
    pass ".gitignore excludes .env files"
else
    fail ".gitignore does not exclude .env files"
fi

# Check for x-powered-by disabled
if grep -q "app.disable('x-powered-by')" server.js; then
    pass "x-powered-by header disabled"
else
    fail "x-powered-by header NOT disabled"
fi

# Check for Helmet
if grep -q "helmet" server.js; then
    pass "Helmet security middleware configured"
else
    fail "Helmet security middleware NOT found"
fi

# Check for trust proxy
if grep -q "trust proxy" server.js; then
    pass "Trust proxy configured for Render"
else
    fail "Trust proxy NOT configured"
fi

# ============================================================================
# Section 3: Environment Variables
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Environment Variables"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ENV_VARS=(
    "NODE_ENV"
    "PORT"
    "FIREBASE_PROJECT_ID"
    "DHAN_CLIENT_ID"
    "DHAN_ACCESS_TOKEN"
    "ALLOWED_ORIGINS"
)

for var in "${ENV_VARS[@]}"; do
    if grep -q "$var" .env.example; then
        pass "Environment variable template includes: $var"
    else
        warn "Environment variable missing from .env.example: $var"
    fi
done

# Check for .env file (should NOT be in git)
if [ -f ".env" ]; then
    warn ".env file found locally (should not be in production)"
fi

# ============================================================================
# Section 4: Authentication & Authorization
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔑 Authentication & Authorization"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check for auth middleware usage
if grep -q "authMiddleware" routes/marketRoutes.js; then
    pass "Market routes protected with authMiddleware"
else
    fail "Market routes NOT protected with authMiddleware"
fi

if grep -q "authMiddleware" routes/authRoutes.js; then
    pass "OAuth routes protected with authMiddleware"
else
    warn "Some OAuth routes may not require authentication (expected)"
fi

# Check for Firebase Admin initialization
if grep -q "initializeFirebaseAdmin" config/firebaseAdmin.js; then
    pass "Firebase Admin SDK initialization exists"
else
    fail "Firebase Admin SDK initialization NOT found"
fi

# ============================================================================
# Section 5: OAuth & Token Management
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 OAuth & Token Management"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check for auth routes
if grep -q "router.get('/dhan/login'" routes/authRoutes.js; then
    pass "Dhan OAuth login route exists"
else
    fail "Dhan OAuth login route NOT found"
fi

# Check for token manager
if grep -q "class TokenManager" utils/tokenManager.js; then
    pass "Token Manager class implemented"
else
    fail "Token Manager class NOT found"
fi

# Check for webhook validator
if grep -q "validateWebhookSignature" middleware/webhookValidator.js; then
    pass "Webhook signature validation implemented"
else
    fail "Webhook signature validation NOT found"
fi

# ============================================================================
# Section 6: Rate Limiting & Caching
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚡ Performance & Protection"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check for rate limiting
if grep -q "apiLimiter" middleware/rateLimiter.js; then
    pass "Rate limiter middleware exists"
else
    fail "Rate limiter middleware NOT found"
fi

# Check for caching
if grep -q "CacheManager\|MarketQuoteCache" middleware/cacheManager.js; then
    pass "Response caching implemented"
else
    fail "Response caching NOT found"
fi

# Check for input validation
if grep -q "validateQuoteQuery\|validatePlaceOrder" middleware/validator.js; then
    pass "Input validation middleware exists"
else
    fail "Input validation middleware NOT found"
fi

# ============================================================================
# Section 7: Error Handling & Logging
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Error Handling & Logging"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check for error handler
if grep -q "errorHandler\|notFoundHandler" middleware/errorHandler.js; then
    pass "Global error handler implemented"
else
    fail "Global error handler NOT found"
fi

# Check for morgan logging
if grep -q "morgan" server.js; then
    pass "Morgan HTTP logging configured"
else
    fail "Morgan HTTP logging NOT found"
fi

# Check for async error wrapper
if grep -q "asyncHandler" utils/asyncHandler.js; then
    pass "Async error wrapper implemented"
else
    fail "Async error wrapper NOT found"
fi

# ============================================================================
# Section 8: Health Monitoring
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🏥 Health Monitoring"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check for health endpoints
if grep -q "app.get\('/health'" server.js; then
    pass "Health check endpoint exists"
else
    fail "Health check endpoint NOT found"
fi

if grep -q "app.get\('/api/system/status'" server.js; then
    pass "System status endpoint exists"
else
    fail "System status endpoint NOT found"
fi

# Check for health monitor
if grep -q "getHealthStatus" utils/healthMonitor.js; then
    pass "Health monitoring utility exists"
else
    fail "Health monitoring utility NOT found"
fi

# ============================================================================
# Section 9: Dependencies
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Dependencies"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

DEPS=(
    "express"
    "firebase-admin"
    "axios"
    "cors"
    "helmet"
    "morgan"
    "dotenv"
    "express-rate-limit"
    "express-validator"
    "node-cache"
)

for dep in "${DEPS[@]}"; do
    if grep -q "\"$dep\"" package.json; then
        pass "Dependency installed: $dep"
    else
        warn "Dependency NOT found: $dep"
    fi
done

# Check Node version requirement
if grep -q "\"node\"" package.json; then
    pass "Node.js version specified"
else
    warn "Node.js version requirement not specified"
fi

# ============================================================================
# Section 10: Documentation
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📚 Documentation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

DOCS=(
    "README.md"
    "FINAL_PRODUCTION_SETUP.md"
    "PRODUCTION_HARDENING.md"
    "QUICK_REFERENCE.md"
)

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        pass "Documentation exists: $doc"
    else
        warn "Documentation missing: $doc"
    fi
done

# ============================================================================
# Final Summary
# ============================================================================
echo ""
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                         VALIDATION SUMMARY                         ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo -e "${YELLOW}⚠️  Warnings: $WARNINGS${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}🎉 READY FOR PRODUCTION DEPLOYMENT!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Configure environment variables in Render"
    echo "2. Set up Dhan OAuth in Dhan Dashboard"
    echo "3. Configure webhook URL in Dhan Dashboard"
    echo "4. Push code to GitHub"
    echo "5. Render will auto-deploy"
    echo ""
    exit 0
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}⚠️  VALIDATION FAILED - PLEASE FIX ISSUES ABOVE${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    exit 1
fi
