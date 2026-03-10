import { expect } from 'chai';
import { storage } from '../api/services/storage.js';

/**
 * Tests for Double Voting Prevention Logic
 * **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5**
 */
describe('Double Voting Prevention', function () {
    
    beforeEach(function () {
        // Clear voter records before each test
        const testEmails = ['voter1@test.com', 'voter2@test.com', 'voter3@test.com'];
        const testScrutins = ['scrutin-1', 'scrutin-2'];
        
        // Clear any existing voter records for test data
        testEmails.forEach(email => {
            testScrutins.forEach(scrutinId => {
                const key = `${email.toLowerCase()}:${scrutinId.toLowerCase()}`;
                // We can't directly clear from the Map, but we can test the logic
            });
        });
    });

    describe('Voter Record Tracking', function () {
        
        it('should track when a voter has not voted', function () {
            const email = 'newvoter@test.com';
            const scrutinId = 'scrutin-new';
            
            const hasVoted = storage.hasVoterVoted(email, scrutinId);
            expect(hasVoted).to.be.false;
            
            const record = storage.getVoterRecord(email, scrutinId);
            expect(record).to.be.undefined;
        });

        it('should mark voter as voted and track the record', function () {
            const email = 'voter@test.com';
            const scrutinId = 'scrutin-test';
            const txHash = '0x123abc';
            
            // Initially not voted
            expect(storage.hasVoterVoted(email, scrutinId)).to.be.false;
            
            // Mark as voted
            storage.markVoterAsVoted(email, scrutinId, txHash);
            
            // Should now show as voted
            expect(storage.hasVoterVoted(email, scrutinId)).to.be.true;
            
            // Should have a record with details
            const record = storage.getVoterRecord(email, scrutinId);
            expect(record).to.not.be.undefined;
            expect(record.hasVoted).to.be.true;
            expect(record.transactionHash).to.equal(txHash);
            expect(record.votedAt).to.be.instanceOf(Date);
        });

        it('should handle case insensitive email matching', function () {
            const email = 'CaseTest@Example.COM';
            const scrutinId = 'SCRUTIN-CASE';
            
            storage.markVoterAsVoted(email, scrutinId, '0xabc123');
            
            // Should match regardless of case
            expect(storage.hasVoterVoted('casetest@example.com', 'scrutin-case')).to.be.true;
            expect(storage.hasVoterVoted(email.toLowerCase(), scrutinId.toLowerCase())).to.be.true;
            expect(storage.hasVoterVoted(email.toUpperCase(), scrutinId.toUpperCase())).to.be.true;
        });

        it('should track votes per scrutin independently', function () {
            const email = 'voter@test.com';
            const scrutin1 = 'scrutin-1';
            const scrutin2 = 'scrutin-2';
            
            // Mark as voted in scrutin 1
            storage.markVoterAsVoted(email, scrutin1, '0x111');
            
            // Should be voted in scrutin 1 but not scrutin 2
            expect(storage.hasVoterVoted(email, scrutin1)).to.be.true;
            expect(storage.hasVoterVoted(email, scrutin2)).to.be.false;
            
            // Mark as voted in scrutin 2
            storage.markVoterAsVoted(email, scrutin2, '0x222');
            
            // Should be voted in both
            expect(storage.hasVoterVoted(email, scrutin1)).to.be.true;
            expect(storage.hasVoterVoted(email, scrutin2)).to.be.true;
            
            // Records should be independent
            const record1 = storage.getVoterRecord(email, scrutin1);
            const record2 = storage.getVoterRecord(email, scrutin2);
            
            expect(record1.transactionHash).to.equal('0x111');
            expect(record2.transactionHash).to.equal('0x222');
        });
    });

    describe('Double Voting Prevention Logic', function () {
        
        it('should prevent double voting in the same scrutin', function () {
            const email = 'doublevote@test.com';
            const scrutinId = 'scrutin-doublevote';
            
            // Simulate the vote casting logic
            function simulateVoteCast(voterEmail, scrutinId, sessionId, optionIndex) {
                // Check for double voting (as in the API endpoint)
                const hasVoted = storage.hasVoterVoted(voterEmail, scrutinId);
                if (hasVoted) {
                    return { success: false, error: 'Voter has already voted in this scrutin' };
                }
                
                // Simulate successful vote
                const txHash = `0x${Math.random().toString(16).substr(2, 8)}`;
                storage.markVoterAsVoted(voterEmail, scrutinId, txHash);
                
                return { success: true, txHash };
            }
            
            // First vote should succeed
            const firstVote = simulateVoteCast(email, scrutinId, 'session-1', 0);
            expect(firstVote.success).to.be.true;
            expect(firstVote.txHash).to.be.a('string');
            
            // Second vote should fail
            const secondVote = simulateVoteCast(email, scrutinId, 'session-2', 1);
            expect(secondVote.success).to.be.false;
            expect(secondVote.error).to.equal('Voter has already voted in this scrutin');
        });

        it('should allow voting in different scrutins', function () {
            const email = 'multiscrutin@test.com';
            const scrutin1 = 'scrutin-multi-1';
            const scrutin2 = 'scrutin-multi-2';
            
            function simulateVoteCast(voterEmail, scrutinId) {
                const hasVoted = storage.hasVoterVoted(voterEmail, scrutinId);
                if (hasVoted) {
                    return { success: false, error: 'Already voted' };
                }
                
                const txHash = `0x${Math.random().toString(16).substr(2, 8)}`;
                storage.markVoterAsVoted(voterEmail, scrutinId, txHash);
                return { success: true, txHash };
            }
            
            // Vote in first scrutin
            const vote1 = simulateVoteCast(email, scrutin1);
            expect(vote1.success).to.be.true;
            
            // Vote in second scrutin should also succeed
            const vote2 = simulateVoteCast(email, scrutin2);
            expect(vote2.success).to.be.true;
            
            // Both should be marked as voted in their respective scrutins
            expect(storage.hasVoterVoted(email, scrutin1)).to.be.true;
            expect(storage.hasVoterVoted(email, scrutin2)).to.be.true;
        });

        it('should handle multiple voters in the same scrutin', function () {
            const scrutinId = 'scrutin-multi';
            const voters = ['voter1@test.com', 'voter2@test.com', 'voter3@test.com'];
            
            function simulateVoteCast(voterEmail, scrutinId) {
                const hasVoted = storage.hasVoterVoted(voterEmail, scrutinId);
                if (hasVoted) {
                    return { success: false };
                }
                
                storage.markVoterAsVoted(voterEmail, scrutinId, `0x${voterEmail.substr(0, 8)}`);
                return { success: true };
            }
            
            // All voters should be able to vote once
            voters.forEach(email => {
                const result = simulateVoteCast(email, scrutinId);
                expect(result.success, `${email} should be able to vote`).to.be.true;
            });
            
            // All voters should be marked as voted
            voters.forEach(email => {
                expect(storage.hasVoterVoted(email, scrutinId), `${email} should be marked as voted`).to.be.true;
            });
            
            // None should be able to vote again
            voters.forEach(email => {
                const result = simulateVoteCast(email, scrutinId);
                expect(result.success, `${email} should not be able to vote again`).to.be.false;
            });
        });
    });

    describe('Integration with Vote Casting', function () {
        
        it('should integrate with the vote casting workflow', function () {
            const email = 'integration@test.com';
            const scrutinId = 'scrutin-integration';
            const sessionId = 'session-1';
            const optionIndex = 0;
            
            // Simulate the complete vote casting flow from the API
            function simulateCompleteVoteCast(sessionId, voterEmail, optionIndex, scrutinId) {
                // Parameter validation
                if (!sessionId || !voterEmail || optionIndex === undefined) {
                    return { success: false, error: "Missing parameters" };
                }

                // Double voting check
                if (scrutinId) {
                    const hasVoted = storage.hasVoterVoted(voterEmail, scrutinId);
                    if (hasVoted) {
                        return { 
                            success: false, 
                            error: "Voter has already voted in this scrutin" 
                        };
                    }
                }

                // Simulate successful blockchain transaction
                const txHash = `0x${Math.random().toString(16).substr(2, 16)}`;
                
                // Log the vote (existing functionality)
                storage.logVote({
                    sessionId,
                    voterHash: `hash_${voterEmail}`,
                    optionIndex,
                    txHash
                });

                // Mark voter as voted
                if (scrutinId) {
                    storage.markVoterAsVoted(voterEmail, scrutinId, txHash);
                }

                return { success: true, txHash };
            }
            
            // First vote should succeed
            const result1 = simulateCompleteVoteCast(sessionId, email, optionIndex, scrutinId);
            expect(result1.success).to.be.true;
            expect(result1.txHash).to.be.a('string');
            
            // Verify voter is marked as voted
            expect(storage.hasVoterVoted(email, scrutinId)).to.be.true;
            
            // Second vote attempt should fail
            const result2 = simulateCompleteVoteCast(sessionId, email, optionIndex, scrutinId);
            expect(result2.success).to.be.false;
            expect(result2.error).to.equal("Voter has already voted in this scrutin");
        });
    });
});