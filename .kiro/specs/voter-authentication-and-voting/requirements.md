# Requirements Document

## Introduction

This document specifies the requirements for a voter authentication and multi-session voting system within a blockchain-based voting application. The system enables voters to authenticate via OAuth2 and cast votes across multiple sessions within a single scrutin (election). The system supports two entry paths: direct link access and home page entry with scrutin selection.

## Glossary

- **Scrutin**: An election containing one or more voting sessions
- **Session**: A voting session within a scrutin, each with its own set of parties/candidates
- **Voter**: An authenticated user authorized to vote in one or more sessions
- **OAuth2_Provider**: External authentication service (Google or Office 365)
- **Authorization_Service**: Backend service that verifies voter eligibility
- **Voting_Portal**: Frontend interface where voters view sessions and cast votes
- **Vote_Transaction**: A blockchain transaction containing all votes from a voter for a scrutin
- **Authorized_Voters_List**: List of email addresses permitted to vote in specific sessions
- **Scrutin_Status**: Current state of a scrutin (in progress, completed, etc.)

## Requirements

### Requirement 1: OAuth2 Authentication

**User Story:** As a voter, I want to authenticate using my Google or Office 365 account, so that my identity is verified securely.

#### Acceptance Criteria

1. WHEN a voter accesses the voting portal, THE OAuth2_Provider SHALL authenticate the voter's identity
2. THE OAuth2_Provider SHALL return the voter's verified email address to the Authorization_Service
3. WHERE Google is selected, THE OAuth2_Provider SHALL use Google OAuth2 protocol
4. WHERE Office 365 is selected, THE OAuth2_Provider SHALL use Microsoft OAuth2 protocol
5. IF authentication fails, THEN THE Voting_Portal SHALL display an error message and prevent access

### Requirement 2: Voter Authorization Verification

**User Story:** As a system administrator, I want only authorized voters to access voting sessions, so that election integrity is maintained.

#### Acceptance Criteria

1. WHEN the Authorization_Service receives a voter email, THE Authorization_Service SHALL check if the email exists in the Authorized_Voters_List for at least one session in the scrutin
2. IF the voter email is found in the Authorized_Voters_List, THEN THE Authorization_Service SHALL return the list of sessions the voter is authorized for
3. IF the voter email is not found in the Authorized_Voters_List, THEN THE Authorization_Service SHALL return an unauthorized status
4. THE Authorization_Service SHALL verify authorization before displaying any voting interface

### Requirement 3: Direct Link Access Flow

**User Story:** As a voter, I want to access the voting portal via a direct link, so that I can quickly authenticate and vote.

#### Acceptance Criteria

1. WHEN a voter clicks a voting link, THE Voting_Portal SHALL redirect to the OAuth2_Provider for authentication
2. WHEN authentication completes, THE Authorization_Service SHALL verify the voter's authorization for the scrutin
3. IF the voter is authorized, THEN THE Voting_Portal SHALL display all sessions the voter can vote in
4. IF the voter is not authorized, THEN THE Voting_Portal SHALL display an error message with a "Back to Home" button
5. THE Voting_Portal SHALL include the scrutin identifier in the direct link

### Requirement 4: Home Page Entry Flow

**User Story:** As a voter, I want to enter my email on the home page and select a scrutin, so that I can access voting for elections where I am authorized.

#### Acceptance Criteria

1. WHEN a voter selects the "Voter" option on the home page, THE Voting_Portal SHALL display an email input field
2. WHEN a voter enters their email address, THE Authorization_Service SHALL retrieve all scrutins in progress where the voter is authorized
3. THE Voting_Portal SHALL display a "Session de vote" dropdown containing the list of available scrutins with country information
4. WHEN a voter selects a scrutin from the dropdown, THE Voting_Portal SHALL redirect to the OAuth2_Provider for authentication
5. WHEN authentication completes, THE Voting_Portal SHALL display all sessions for the selected scrutin that the voter is authorized for
6. IF no scrutins are available for the voter email, THEN THE Voting_Portal SHALL display a message indicating no active elections

### Requirement 5: Multi-Session Display

**User Story:** As a voter, I want to see all voting sessions I am authorized for in a single view, so that I can review all my voting options before making selections.

#### Acceptance Criteria

1. WHEN the Voting_Portal displays sessions, THE Voting_Portal SHALL show all sessions the voter is authorized for within the scrutin
2. FOR EACH session, THE Voting_Portal SHALL display the list of parties and candidates with their details
3. THE Voting_Portal SHALL clearly distinguish between different sessions
4. THE Voting_Portal SHALL display session information in a readable format
5. THE Voting_Portal SHALL indicate which sessions require a vote selection

### Requirement 6: Vote Selection

**User Story:** As a voter, I want to select one party or candidate for each session, so that I can express my voting preferences.

#### Acceptance Criteria

1. FOR EACH session displayed, THE Voting_Portal SHALL allow the voter to select exactly one party or candidate
2. THE Voting_Portal SHALL provide a clear selection interface for each session
3. WHEN a voter selects a party or candidate, THE Voting_Portal SHALL visually indicate the selection
4. THE Voting_Portal SHALL allow the voter to change their selection before submitting
5. THE Voting_Portal SHALL require a selection for all authorized sessions before enabling the submit button

### Requirement 7: Global Vote Submission

**User Story:** As a voter, I want to submit all my votes at once, so that my voting choices are recorded together as a single transaction.

#### Acceptance Criteria

1. WHEN a voter has selected parties or candidates for all authorized sessions, THE Voting_Portal SHALL enable the global submit button
2. WHEN the voter clicks the global submit button, THE Voting_Portal SHALL send all votes to the vote casting endpoint as a single Vote_Transaction
3. THE Vote_Transaction SHALL include the voter's email, scrutin identifier, and all session votes
4. WHEN the Vote_Transaction is submitted, THE Authorization_Service SHALL record the submission to prevent double voting
5. IF the submission succeeds, THEN THE Voting_Portal SHALL display a confirmation message
6. IF the submission fails, THEN THE Voting_Portal SHALL display an error message and allow the voter to retry

### Requirement 8: Double Voting Prevention

**User Story:** As a system administrator, I want to prevent voters from voting more than once per scrutin, so that election integrity is maintained.

#### Acceptance Criteria

1. WHEN a voter submits votes, THE Authorization_Service SHALL check if the voter has already voted in the scrutin
2. IF the voter has already voted, THEN THE Authorization_Service SHALL reject the submission and return an error
3. WHEN a voter accesses the Voting_Portal after voting, THE Voting_Portal SHALL display a message indicating they have already voted
4. THE Authorization_Service SHALL maintain a record of all voters who have submitted votes for each scrutin
5. FOR ALL voters, the Authorization_Service SHALL enforce the one-vote-per-scrutin rule

### Requirement 9: Error Handling and User Feedback

**User Story:** As a voter, I want clear error messages when something goes wrong, so that I understand what happened and what to do next.

#### Acceptance Criteria

1. WHEN an error occurs during authentication, THE Voting_Portal SHALL display a descriptive error message
2. WHEN a voter is not authorized, THE Voting_Portal SHALL display an error message with a "Back to Home" button
3. WHEN vote submission fails, THE Voting_Portal SHALL display an error message with the reason for failure
4. WHEN a voter has already voted, THE Voting_Portal SHALL display a message indicating they have already submitted their votes
5. FOR ALL error conditions, THE Voting_Portal SHALL provide actionable guidance to the voter

### Requirement 10: Session Filtering by Status

**User Story:** As a voter, I want to see only scrutins that are currently in progress, so that I don't attempt to vote in closed elections.

#### Acceptance Criteria

1. WHEN retrieving scrutins for a voter, THE Authorization_Service SHALL filter scrutins by Scrutin_Status
2. THE Authorization_Service SHALL return only scrutins with Scrutin_Status indicating "in progress"
3. THE Authorization_Service SHALL exclude scrutins that have not started or have ended
4. FOR EACH scrutin returned, THE Authorization_Service SHALL verify the voter is authorized for at least one session
5. THE Authorization_Service SHALL include country information for each scrutin in the response

### Requirement 11: Integration with Existing Systems

**User Story:** As a developer, I want the voting system to integrate with existing authentication and vote casting infrastructure, so that we leverage proven components.

#### Acceptance Criteria

1. THE Voting_Portal SHALL use the existing OAuth2 authentication system
2. WHEN submitting votes, THE Voting_Portal SHALL call the existing POST /api/votes/cast endpoint
3. THE Authorization_Service SHALL retrieve voter authorization data from existing scrutin metadata storage
4. THE Authorization_Service SHALL access both global voters and session-specific voters lists
5. THE Vote_Transaction SHALL use the existing blockchain integration with Hardhat and Ethers.js
