# Branch Setup Documentation

## Overview
This repository uses 'main' as its default branch following Git best practices. This document outlines the branch strategy, protection rules, and implementation process for establishing our main branch through proper PR process.

## Branch Strategy
- Default branch: main (to be established)
- Feature branches: devin/{timestamp}-{feature-name}

## Branch Protection Rules

1. Required Reviews
   - Minimum of 1 reviewer approval required
   - Dismiss stale pull request approvals when new commits are pushed
   - Require review from Code Owners

2. Status Checks
   - Require status checks to pass before merging
   - Require branches to be up to date before merging
   - Required checks:
     - Build validation
     - Test suite completion
     - Code coverage thresholds
     - Linting standards

3. Branch Restrictions
   - Block force pushes to matching branches
   - Prevent deletion of matching branches
   - Require linear history
   - Require signed commits

## Setup Process
1. Create feature branch
2. Review and approve PR
3. Establish main as default branch
4. Configure branch protection with above rules
5. Update all existing PRs to target main

## Implementation Steps
1. Review and approve this PR
2. Set as default branch
3. Configure branch protection with above rules
4. Verify protection settings are active
