#!/bin/bash

# Hostelpulse - Pre-Deployment Check Script
# Ensures deployment requirements are met before proceeding

set -e  # Exit on any error

# Force English locale for consistent outputs
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check current branch
check_branch() {
    local current_branch=$(git branch --show-current)
    print_status "Current branch: $current_branch"

    if [ "$current_branch" != "main" ]; then
        print_warning "Not on main branch. This is a production deployment requirement."
        print_status "Please switch to main branch or use a different deployment command."
        print_status "Current branch: $current_branch"
        exit 1
    fi

    print_success "On main branch - proceeding with production deployment"
}

# Function to check for uncommitted changes
check_clean_repo() {
    if ! git diff --quiet || ! git diff --staged --quiet; then
        print_error "Repository has uncommitted changes!"
        print_status "Please commit or stash your changes before deploying."
        git status --short
        exit 1
    fi

    print_success "Repository is clean"
}

# Function to run tests
run_tests() {
    print_status "Running test suite..."
    if npm test; then
        print_success "All tests passed!"
    else
        print_error "Tests failed! Cannot proceed with deployment."
        exit 1
    fi
}

# Function to check environment
check_environment() {
    print_status "Checking deployment environment..."

    # Check Bun version
    if ! command -v bun >/dev/null 2>&1; then
        print_error "Bun is not installed!"
        exit 1
    fi

    BUN_VERSION=$(bun --version)
    REQUIRED_BUN="1.0.0"

    if ! [ "$(printf '%s\n' "$REQUIRED_BUN" "$BUN_VERSION" | sort -V | head -n1)" = "$REQUIRED_BUN" ]; then
        print_error "Bun version $BUN_VERSION is below required $REQUIRED_BUN"
        exit 1
    fi

    print_success "Bun version: $BUN_VERSION"

    # Check Git
    if ! command -v git >/dev/null 2>&1; then
        print_error "Git is not installed!"
        exit 1
    fi

    GIT_VERSION=$(git --version | sed 's/git version //')
    print_success "Git version: $GIT_VERSION"
}

# Function to check required files
check_files() {
    print_status "Checking required files..."

    required_files=("package.json" "next.config.js" "tailwind.config.js" "postcss.config.js")

    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            print_error "Required file missing: $file"
            exit 1
        fi
    done

    print_success "All required files present"
}

# Function to check memory bank completeness
check_memory_bank() {
    print_status "Checking memory bank completeness..."

    memory_bank_files=(".kilocode/rules/memory-bank/brief.md" ".kilocode/rules/memory-bank/product.md" ".kilocode/rules/memory-bank/context.md" ".kilocode/rules/memory-bank/architecture.md" ".kilocode/rules/memory-bank/tech.md")

    for file in "${memory_bank_files[@]}"; do
        if [ ! -f "$file" ]; then
            print_error "Memory bank file missing: $file"
            print_status "Please ensure all memory bank files are created before deployment."
            exit 1
        fi
    done

    print_success "Memory bank files are present"
}

# Main function
main() {
    print_status "Starting pre-deployment checks for Hostelpulse..."

    check_environment
    check_branch
    check_clean_repo
    check_files
    check_memory_bank
    run_tests

    print_success "All pre-deployment checks passed!"
    print_status "Ready for deployment"
}

# Run main function
main "$@"