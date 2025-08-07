#!/bin/bash

# Test Setup Runner
# This script runs the test setup to verify the environment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Running Test Setup${NC}"

# Check if we're in the right directory
if [ ! -f "requirements.txt" ]; then
    echo -e "${RED}❌ Error: requirements.txt not found. Please run this script from the backend directory.${NC}"
    exit 1
fi

# Setup environment
echo -e "${YELLOW}📦 Setting up environment...${NC}"
export HF_HOME=./.hf_cache
source .venv/bin/activate

# Check if virtual environment is activated
if [ -z "$VIRTUAL_ENV" ]; then
    echo -e "${RED}❌ Error: Virtual environment not activated${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment ready${NC}"

# Run the test setup script
echo -e "${YELLOW}🧪 Running test setup...${NC}"
python scripts/test_setup.py

echo -e "${GREEN}✅ Test setup completed!${NC}"
