#!/bin/bash

# HostelPulse Development Environment Starter
# This script checks prerequisites, starts Supabase locally, installs dependencies, and starts the dev server

set -e  # Exit immediately if a command exits with a non-zero status

# Color codes for output formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}HostelPulse Development Setup${NC}"
echo -e "${BLUE}================================${NC}"

# Function to print status messages
print_status() {
    echo -e "${BLUE}[*] $1${NC}"
}

print_success() {
    echo -e "${GREEN}[✓] $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}[!] $1${NC}"
}

print_error() {
    echo -e "${RED}[✗] $1${NC}"
}

# Check if required tools are installed
print_status "Checking for required tools..."

if ! [ -x "$(command -v node)" ]; then
    print_error "Node.js is not installed or not in PATH"
    exit 1
fi

if ! [ -x "$(command -v npm)" ]; then
    print_error "npm is not installed or not in PATH"
    exit 1
fi

if ! [ -x "$(command -v supabase)" ]; then
    print_error "Supabase CLI is not installed or not in PATH"
    exit 1
fi

print_success "All required tools are installed"
echo

# Preliminary tests
print_status "Running preliminary tests..."

# Check if we're in the correct directory (check for package.json)
if [ ! -f "package.json" ]; then
    print_error "package.json not found in current directory. Please run this script from the project root."
    exit 1
fi

print_success "Found package.json in the current directory"

# Check if .env.local exists, if not, warn the user
if [ ! -f ".env.local" ]; then
    print_warning ".env.local file not found. You may need to create it based on .env.example"
    print_status "You can create .env.local with: cp .env.example .env.local"
else
    print_success "Found .env.local file"
fi

# Check for specific environment variables
if [ -f ".env.local" ]; then
    if ! grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
        print_error "NEXT_PUBLIC_SUPABASE_URL not found in .env.local"
    else
        print_success "Found NEXT_PUBLIC_SUPABASE_URL in .env.local"
    fi
    
    if ! grep -q "SUPABASE_SERVICE_ROLE_KEY" .env.local; then
        print_error "SUPABASE_SERVICE_ROLE_KEY not found in .env.local"
    else
        print_success "Found SUPABASE_SERVICE_ROLE_KEY in .env.local"
    fi
fi

print_success "Preliminary tests completed"
echo

# Check if Supabase is already running
print_status "Checking if Supabase is already running..."
if pgrep -f "supabase" > /dev/null; then
    print_warning "Supabase appears to be already running."
    read -p "Do you want to continue with the existing Supabase instance? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Stopping existing Supabase instance..."
        supabase stop || true
        print_status "Starting local Supabase instance..."
        supabase start
    else
        print_status "Using existing Supabase instance."
    fi
else
    print_status "Starting local Supabase instance..."
    supabase start
fi

if [ $? -eq 0 ]; then
    print_success "Supabase is running"
    print_status "API URL: http://127.0.0.1:54321"
    print_status "Studio URL: http://127.0.0.1:54323"
    print_status "Database URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres"
else
    print_error "Failed to start Supabase"
    exit 1
fi
echo

# Install dependencies
print_status "Installing project dependencies if needed..."
npm install

if [ $? -eq 0 ]; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi
echo

# Check if dev server is already running
if lsof -i:3000 > /dev/null; then
    print_warning "Development server is already running on port 3000."
    print_status "Your HostelPulse application is available at: http://localhost:3000"
    print_warning "Skipping dev server startup since one is already running."
else
    print_status "Starting development server..."
    
    # Start the dev server in background
    npm run dev > dev-server.log 2>&1 &
    
    # Wait a moment for the server to start
    sleep 5
    
    # Check if the server is running by checking the log file
    if tail -n 10 dev-server.log | grep -q "ready started server on"; then
        print_success "Development server started successfully"
        print_status "Your HostelPulse application is available at: http://localhost:3000"
    else
        print_error "Development server might not have started properly. Check dev-server.log for details"
        exit 1
    fi
fi
echo

# Print instructions
echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Testing Instructions${NC}"
echo -e "${BLUE}================================${NC}"
echo
echo "1. Visit the application at: ${BLUE}http://localhost:3000${NC}"
echo "2. Register a new account or log in"
echo "3. Test the following features:"
echo "   - Dashboard with arrivals/departures"
echo "   - Adding new guests"
echo "   - Creating bookings"
echo "   - Managing rooms"
echo "   - Housekeeping tasks"
echo
echo "4. You can access the Supabase Studio at: ${BLUE}http://127.0.0.1:54323${NC}"
echo "5. To stop the development server, run: pkill -f 'npm run dev'"
echo "6. To stop Supabase, run: supabase stop"
echo
echo -e "${GREEN}Development environment is ready!${NC}"