# Implementation Plan: Voter Authentication and Voting System

## Overview

This implementation plan creates a secure voter authentication and multi-session voting system that integrates OAuth2 authentication with blockchain-based vote recording. The system supports two entry flows: direct link access and home page entry with scrutin selection, following existing EpiVote patterns and UI design inspiration.

## Tasks

- [x] 1. Set up backend API endpoints for voter authorization
  - [x] 1.1 Create voter authorization verification endpoint
    - Add GET /api/scrutins/available endpoint to return active scrutins for voter email
    - Add POST /api/auth/verify-voter endpoint to verify voter authorization and return accessible sessions
    - Implement voter authorization logic checking both global and session-specific voter lists
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 10.1, 10.2, 10.3, 10.4, 10.5_

  - [x] 1.2 Write property test for voter authorization
    - **Property 1: Authorization consistency**
    - **Validates: Requirements 2.1, 2.2, 2.3**

  - [x] 1.3 Implement double voting prevention logic
    - Add voter record tracking in authorization service
    - Implement checkDoubleVoting and markVoterAsVoted methods
    - Update existing /api/votes/cast endpoint to prevent double voting per scrutin
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ] 1.4 Write unit tests for double voting prevention
    - Test double voting rejection scenarios
    - Test voter record tracking
    - _Requirements: 8.1, 8.2, 8.3_

- [ ] 2. Enhance OAuth2 authentication system
  - [x] 2.1 Update OAuth2 callback handling for voter flow
    - Modify OAuthCallbackPage to handle voter authentication flow
    - Add voter-specific redirect logic after successful authentication
    - Integrate with voter authorization verification
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ] 2.2 Write property test for OAuth2 integration
    - **Property 2: Authentication state consistency**
    - **Validates: Requirements 1.1, 1.2**

  - [-] 2.3 Add voter authentication context
    - Extend AuthContext to support voter authentication state
    - Add voter authorization status tracking
    - Implement voter session management
    - _Requirements: 1.1, 1.2, 3.2, 4.4_

- [x] 3. Checkpoint - Ensure authentication and authorization tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Create home page voter entry interface
  - [-] 4.1 Add voter entry section to HomePage
    - Create email input field for voter entry
    - Add scrutin selection dropdown with country information
    - Implement available scrutins fetching based on voter email
    - Style according to EpiVote design patterns
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ]* 4.2 Write unit tests for home page voter entry
    - Test email validation and scrutin fetching
    - Test dropdown population and selection
    - _Requirements: 4.1, 4.2, 4.3_

  - [-] 4.3 Implement error handling for unauthorized voters
    - Add error messages for voters with no available scrutins
    - Create unauthorized access error page with "Back to Home" button
    - Style error states consistently with existing patterns
    - _Requirements: 4.6, 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 5. Create VoterPortalPage component
  - [ ] 5.1 Build multi-session voting interface
    - Create VoterPortalPage component following ModeratorPortalPage patterns
    - Implement session list view showing all authorized sessions
    - Add session cards with candidate information and selection states
    - Include progress tracking across all sessions
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 5.2 Write property test for session display
    - **Property 3: Session visibility consistency**
    - **Validates: Requirements 5.1, 5.2**

  - [ ] 5.3 Implement candidate selection interface
    - Create candidate cards with photos and selection states
    - Add hover tooltips for candidate details
    - Implement single selection per session logic
    - Style according to UI design inspiration with EpiVote branding
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]* 5.4 Write unit tests for candidate selection
    - Test selection state management
    - Test single selection enforcement per session
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [-] 6. Implement global vote submission
  - [ ] 6.1 Create global vote submission logic
    - Add global submit button that activates when all sessions have selections
    - Implement vote transaction creation with all session votes
    - Add confirmation dialog before submission
    - Integrate with existing blockchain vote casting endpoint
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [ ]* 6.2 Write property test for vote submission
    - **Property 4: Vote transaction completeness**
    - **Validates: Requirements 7.1, 7.2, 7.3**

  - [ ] 6.3 Add vote confirmation and success states
    - Create vote confirmation modal with selected candidates summary
    - Add success page after successful vote submission
    - Implement "already voted" state display
    - Style confirmation flows consistently with existing patterns
    - _Requirements: 7.5, 7.6, 8.3, 9.4_

- [ ] 7. Checkpoint - Ensure voting interface tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement direct link access flow
  - [ ] 8.1 Create direct link routing and authentication
    - Add route handling for direct voting links with scrutin ID
    - Implement automatic OAuth2 redirect for direct access
    - Add voter authorization verification for direct links
    - Handle unauthorized access with appropriate error messages
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 8.2 Write unit tests for direct link access
    - Test direct link parsing and routing
    - Test unauthorized access handling
    - _Requirements: 3.1, 3.4, 3.5_

  - [ ] 8.3 Integrate OAuth2 verification with voting interface
    - Add OAuth2 identity verification requirement before voting
    - Implement Google and Office 365 verification buttons
    - Add verification status tracking and UI feedback
    - Style verification interface according to existing patterns
    - _Requirements: 1.1, 1.3, 1.4, 6.5, 7.1_

- [ ] 9. Add comprehensive error handling
  - [ ] 9.1 Implement error states and user feedback
    - Add error handling for authentication failures
    - Create error messages for vote submission failures
    - Add network error handling and retry mechanisms
    - Implement loading states for all async operations
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ]* 9.2 Write unit tests for error handling
    - Test error message display
    - Test retry mechanisms
    - _Requirements: 9.1, 9.2, 9.3_

- [ ] 10. Integration and final wiring
  - [ ] 10.1 Connect all components and flows
    - Wire home page entry to voter portal
    - Connect direct link access to voting interface
    - Integrate OAuth2 verification with vote submission
    - Ensure proper navigation between all states
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

  - [ ]* 10.2 Write integration tests
    - Test complete voter authentication and voting flow
    - Test both entry paths (home page and direct link)
    - Test error scenarios and recovery
    - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.2, 4.3_

- [ ] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Implementation follows existing EpiVote patterns and UI design inspiration
- OAuth2 integration leverages existing authentication infrastructure
- Blockchain integration uses existing vote casting endpoints
- All components styled with EpiVote branding and professional design patterns