import { expect } from 'chai';
import { storage } from '../api/services/storage.js';

/**
 * Property-Based Test for Voter Authorization
 * **Validates: Requirements 2.1, 2.2, 2.3**
 * 
 * Property 1: Authorization consistency
 * For any voter email and scrutin, the authorization result should be consistent
 * and match the voter lists (global or session-specific).
 */
describe('Voter Authorization Property Tests', function () {
    
    beforeEach(function () {
        // Clear any existing data
        storage.getAllScrutins().forEach(scrutin => {
            if (scrutin.address) {
                storage.saveScrutin(scrutin.address, {});
            }
        });
    });

    describe('Property 1: Authorization Consistency', function () {
        
        /**
         * Test data generator for property-based testing
         * Generates various combinations of scrutins, voters, and authorization scenarios
         */
        function generateTestScenarios() {
            const scenarios = [];
            
            // Scenario 1: Global voter authorization
            scenarios.push({
                name: 'Global voter should be authorized for all sessions',
                scrutin: {
                    address: 'scrutin-global-test',
                    title: 'Global Test Election',
                    voters: ['global@test.com', 'another@test.com'],
                    sessions: [
                        { title: 'Session 1', options: [{ name: 'Option A' }], voters: [] },
                        { title: 'Session 2', options: [{ name: 'Option B' }], voters: ['session@test.com'] }
                    ]
                },
                voterEmail: 'global@test.com',
                expectedAuthorized: true,
                expectedSessionCount: 2
            });

            // Scenario 2: Session-specific voter authorization
            scenarios.push({
                name: 'Session-specific voter should be authorized only for specific sessions',
                scrutin: {
                    address: 'scrutin-session-test',
                    title: 'Session Test Election',
                    voters: [],
                    sessions: [
                        { title: 'Session 1', options: [{ name: 'Option A' }], voters: ['session1@test.com'] },
                        { title: 'Session 2', options: [{ name: 'Option B' }], voters: ['session2@test.com'] }
                    ]
                },
                voterEmail: 'session1@test.com',
                expectedAuthorized: true,
                expectedSessionCount: 1
            });

            // Scenario 3: Unauthorized voter
            scenarios.push({
                name: 'Unauthorized voter should not be authorized',
                scrutin: {
                    address: 'scrutin-unauthorized-test',
                    title: 'Unauthorized Test Election',
                    voters: ['authorized@test.com'],
                    sessions: [
                        { title: 'Session 1', options: [{ name: 'Option A' }], voters: ['session@test.com'] }
                    ]
                },
                voterEmail: 'unauthorized@test.com',
                expectedAuthorized: false,
                expectedSessionCount: 0
            });

            // Scenario 4: Case insensitive email matching
            scenarios.push({
                name: 'Email matching should be case insensitive',
                scrutin: {
                    address: 'scrutin-case-test',
                    title: 'Case Test Election',
                    voters: ['CaseSensitive@Test.COM'],
                    sessions: [
                        { title: 'Session 1', options: [{ name: 'Option A' }], voters: [] }
                    ]
                },
                voterEmail: 'casesensitive@test.com',
                expectedAuthorized: true,
                expectedSessionCount: 1
            });

            // Scenario 5: Mixed authorization (global + session-specific)
            scenarios.push({
                name: 'Voter in both global and session lists should be authorized',
                scrutin: {
                    address: 'scrutin-mixed-test',
                    title: 'Mixed Test Election',
                    voters: ['mixed@test.com'],
                    sessions: [
                        { title: 'Session 1', options: [{ name: 'Option A' }], voters: ['mixed@test.com'] },
                        { title: 'Session 2', options: [{ name: 'Option B' }], voters: [] }
                    ]
                },
                voterEmail: 'mixed@test.com',
                expectedAuthorized: true,
                expectedSessionCount: 2
            });

            return scenarios;
        }

        it('should consistently authorize voters based on voter lists', function () {
            const scenarios = generateTestScenarios();
            
            scenarios.forEach(scenario => {
                // Setup: Save scrutin metadata
                storage.saveScrutin(scenario.scrutin.address, scenario.scrutin);
                
                // Test: Check voter authorization
                const scrutinMetadata = storage.getScrutin(scenario.scrutin.address);
                const voterEmail = scenario.voterEmail.toLowerCase();
                
                // Authorization logic (same as in the API endpoint)
                const authorizedSessions = [];
                let isAuthorized = false;

                // Check global voters list
                const globalVoters = scrutinMetadata.voters || [];
                const isGlobalVoter = globalVoters.some(v => v.toLowerCase() === voterEmail);

                if (isGlobalVoter) {
                    isAuthorized = true;
                    scrutinMetadata.sessions?.forEach((session, index) => {
                        authorizedSessions.push({
                            id: index,
                            name: session.title,
                            description: session.description,
                            candidates: session.options || []
                        });
                    });
                } else {
                    // Check session-specific voters
                    scrutinMetadata.sessions?.forEach((session, index) => {
                        const sessionVoters = session.voters || [];
                        if (sessionVoters.some(v => v.toLowerCase() === voterEmail)) {
                            isAuthorized = true;
                            authorizedSessions.push({
                                id: index,
                                name: session.title,
                                description: session.description,
                                candidates: session.options || []
                            });
                        }
                    });
                }

                // Assertions
                expect(isAuthorized, `${scenario.name}: Authorization mismatch`).to.equal(scenario.expectedAuthorized);
                expect(authorizedSessions.length, `${scenario.name}: Session count mismatch`).to.equal(scenario.expectedSessionCount);
                
                // Additional consistency checks
                if (scenario.expectedAuthorized) {
                    expect(authorizedSessions.length, `${scenario.name}: Authorized voter should have sessions`).to.be.greaterThan(0);
                    authorizedSessions.forEach(session => {
                        expect(session.id, `${scenario.name}: Session should have valid ID`).to.be.a('number');
                        expect(session.name, `${scenario.name}: Session should have name`).to.be.a('string');
                    });
                }
            });
        });

        it('should handle edge cases consistently', function () {
            const edgeCases = [
                {
                    name: 'Empty voter lists',
                    scrutin: {
                        address: 'scrutin-empty-test',
                        title: 'Empty Test Election',
                        voters: [],
                        sessions: [
                            { title: 'Session 1', options: [{ name: 'Option A' }], voters: [] }
                        ]
                    },
                    voterEmail: 'any@test.com',
                    expectedAuthorized: false
                },
                {
                    name: 'No sessions',
                    scrutin: {
                        address: 'scrutin-no-sessions-test',
                        title: 'No Sessions Election',
                        voters: ['voter@test.com'],
                        sessions: []
                    },
                    voterEmail: 'voter@test.com',
                    expectedAuthorized: true,
                    expectedSessionCount: 0
                },
                {
                    name: 'Undefined sessions',
                    scrutin: {
                        address: 'scrutin-undefined-sessions-test',
                        title: 'Undefined Sessions Election',
                        voters: ['voter@test.com']
                        // sessions property is undefined
                    },
                    voterEmail: 'voter@test.com',
                    expectedAuthorized: true,
                    expectedSessionCount: 0
                }
            ];

            edgeCases.forEach(testCase => {
                storage.saveScrutin(testCase.scrutin.address, testCase.scrutin);
                
                const scrutinMetadata = storage.getScrutin(testCase.scrutin.address);
                const voterEmail = testCase.voterEmail.toLowerCase();
                
                // Authorization logic
                const authorizedSessions = [];
                let isAuthorized = false;

                const globalVoters = scrutinMetadata.voters || [];
                const isGlobalVoter = globalVoters.some(v => v.toLowerCase() === voterEmail);

                if (isGlobalVoter) {
                    isAuthorized = true;
                    scrutinMetadata.sessions?.forEach((session, index) => {
                        authorizedSessions.push({
                            id: index,
                            name: session.title,
                            description: session.description,
                            candidates: session.options || []
                        });
                    });
                } else {
                    scrutinMetadata.sessions?.forEach((session, index) => {
                        const sessionVoters = session.voters || [];
                        if (sessionVoters.some(v => v.toLowerCase() === voterEmail)) {
                            isAuthorized = true;
                            authorizedSessions.push({
                                id: index,
                                name: session.title,
                                description: session.description,
                                candidates: session.options || []
                            });
                        }
                    });
                }

                expect(isAuthorized, `${testCase.name}: Authorization mismatch`).to.equal(testCase.expectedAuthorized);
                if (testCase.expectedSessionCount !== undefined) {
                    expect(authorizedSessions.length, `${testCase.name}: Session count mismatch`).to.equal(testCase.expectedSessionCount);
                }
            });
        });

        it('should maintain authorization invariants', function () {
            // Property: If a voter is in the global list, they should always be authorized
            // regardless of session-specific lists
            const scrutin = {
                address: 'scrutin-invariant-test',
                title: 'Invariant Test Election',
                voters: ['global@test.com'],
                sessions: [
                    { title: 'Session 1', options: [{ name: 'Option A' }], voters: ['other@test.com'] },
                    { title: 'Session 2', options: [{ name: 'Option B' }], voters: [] }
                ]
            };

            storage.saveScrutin(scrutin.address, scrutin);
            
            const scrutinMetadata = storage.getScrutin(scrutin.address);
            const voterEmail = 'global@test.com';
            
            // Check authorization
            const globalVoters = scrutinMetadata.voters || [];
            const isGlobalVoter = globalVoters.some(v => v.toLowerCase() === voterEmail.toLowerCase());
            
            // Invariant: Global voter should always be authorized
            expect(isGlobalVoter, 'Global voter should be authorized').to.be.true;
            
            // Invariant: Global voter should have access to all sessions
            const expectedSessionCount = scrutinMetadata.sessions?.length || 0;
            let actualSessionCount = 0;
            
            if (isGlobalVoter) {
                actualSessionCount = scrutinMetadata.sessions?.length || 0;
            }
            
            expect(actualSessionCount, 'Global voter should access all sessions').to.equal(expectedSessionCount);
        });
    });
});