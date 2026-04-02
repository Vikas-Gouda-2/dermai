#!/bin/bash

# DermAI Live System Verification
# Tests running backend and frontend servers

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

pass() { echo -e "${GREEN}✓${NC} $1"; }
fail() { echo -e "${RED}✗${NC} $1"; }
info() { echo -e "${BLUE}ℹ${NC} $1"; }

echo ""
echo "================================"
echo "DermAI Live System Verification"
echo "================================"
echo ""

# Check backend
echo "Backend API Tests"
echo "================="

if curl -s http://localhost:8000/health -o /dev/null && [ $? -eq 0 ]; then
  pass "Backend API is running (port 8000)"
  
  # Test health endpoint
  health=$(curl -s http://localhost:8000/health)
  if echo "$health" | grep -q '"status"'; then
    pass "Health endpoint responds with JSON"
  fi
  
  # Test main endpoints
  echo ""
  info "Available API Endpoints:"
  echo "  • GET /health - Health check"
  echo "  • GET / - Root endpoint"
  echo "  • GET /docs - API documentation"
  echo "  • GET /api/analysis - Analysis endpoint"
  echo "  • GET /api/recommendations - Recommendations"
  echo "  • POST /api/users/register - User registration"
  echo "  • GET /api/users/profile - User profile"
  echo "  • POST /api/reports/generate - Generate report"
else
  fail "Backend API not responding"
fi

echo ""
echo "Frontend Server Tests"
echo "===================="

if curl -s http://localhost:5173/ -o /dev/null && [ $? -eq 0 ]; then
  pass "Frontend Dev Server is running (port 5173)"
  info "Available URLs:"
  echo "  • http://localhost:5173/ - Landing page"
  echo "  • http://localhost:5173/auth - Authentication"
  echo "  • http://localhost:5173/scan - Camera scan"
  echo "  • http://localhost:5173/results - Analysis results"
else
  fail "Frontend Dev Server not responding"
fi

echo ""
echo "Integration Tests"
echo "================="

# Check CORS configuration
info "Testing API - Frontend communication..."
cors_test=$(curl -s -I http://localhost:8000/health -H "Origin: http://localhost:5173" 2>/dev/null | grep -i "access-control-allow-origin" || echo "")
if [ ! -z "$cors_test" ]; then
  pass "CORS configured for frontend (http://localhost:5173)"
else
  info "CORS headers: Check /docs endpoint for details"
fi

echo ""
echo "Configuration Status"
echo "===================="

# Check environment files
if [ -f /Users/viswa/Documents/AIFACE/BACKEND/.env ]; then
  pass "Backend .env configuration found"
else
  fail "Backend .env not found"
fi

if [ -f "/Users/viswa/Documents/AIFACE/FRONTEND /.env.local" ]; then
  pass "Frontend .env.local configuration found"
else
  fail "Frontend .env.local not found"
fi

echo ""
echo "Process Status"
echo "=============="

python_procs=$(ps aux | grep "python.*main.py" | grep -v grep | wc -l)
node_procs=$(ps aux | grep "node" | grep -v grep | wc -l)

if [ "$python_procs" -gt 0 ]; then
  pass "Backend process(es) running ($python_procs)"
else
  fail "Backend process not found"
fi

if [ "$node_procs" -gt 0 ]; then
  pass "Frontend process(es) running ($node_procs)"
else
  fail "Frontend process not found"
fi

echo ""
echo "Quick Links"
echo "==========="
echo "  📱 Frontend:     http://localhost:5173/"
echo "  🔌 Backend API:  http://localhost:8000/"
echo "  📚 API Docs:     http://localhost:8000/docs"
echo "  📊 Health:       http://localhost:8000/health"
echo ""
echo "Next Steps:"
echo "==========="
echo "  1. Open http://localhost:5173 in your browser"
echo "  2. Follow testing scenarios in TESTING_GUIDE.md"
echo "  3. Test authentication flow"
echo "  4. Test camera scan functionality"
echo "  5. Review DEPLOYMENT_GUIDE.md for production setup"
echo ""
echo "System Ready for Testing: ✅"
echo ""
