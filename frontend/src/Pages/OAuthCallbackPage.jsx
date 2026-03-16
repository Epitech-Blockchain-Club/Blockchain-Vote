import React, { useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const OAuthCallbackPage = () => {
    useEffect(() => {
        const handleOAuthCallback = async () => {
            try {
                // Parse parameters from both hash (Implicit Flow) and search
                const hash = window.location.hash.substring(1);
                const hashParams = new URLSearchParams(hash);
                const urlParams = new URLSearchParams(window.location.search);

                const accessToken = hashParams.get('access_token') || urlParams.get('access_token');
                const error = hashParams.get('error') || urlParams.get('error');
                let state = hashParams.get('state') || urlParams.get('state');
                let scrutinId = hashParams.get('scrutin') || urlParams.get('scrutin') || urlParams.get('state')?.split('|')[1];
                const voterEmail = urlParams.get('email');

                if (window.opener) {
                    if (accessToken) {
                        // Determine if this is a voter authentication flow
                        const isVoterFlow = state?.includes('google') || state?.includes('microsoft') || scrutinId || voterEmail;

                        if (isVoterFlow) {
                            // Handle voter authentication flow
                            try {
                                // Verify the OAuth token and get user profile
                                let userProfile = null;

                                // Determine provider based on token characteristics or state
                                const provider = state?.includes('google') ? 'google' :
                                    state?.includes('microsoft') ? 'microsoft' : 'google';

                                if (provider === 'google') {
                                    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                                        headers: { Authorization: `Bearer ${accessToken}` }
                                    });
                                    userProfile = await response.json();
                                } else if (provider === 'microsoft') {
                                    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
                                        headers: { Authorization: `Bearer ${accessToken}` }
                                    });
                                    const msData = await response.json();
                                    userProfile = {
                                        email: msData.mail || msData.userPrincipalName,
                                        name: msData.displayName,
                                        verified_email: true
                                    };
                                }

                                if (userProfile && userProfile.email) {
                                    // Verify voter authorization if scrutinId is provided
                                    if (scrutinId) {
                                        const authResponse = await fetch(`${API_BASE}/auth/verify-voter`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                email: userProfile.email,
                                                scrutinId: scrutinId
                                            })
                                        });

                                        const authResult = await authResponse.json();

                                        if (authResult.success && authResult.authorized) {
                                            // Send success with voter data
                                            window.opener.postMessage({
                                                type: 'oauth-voter-success',
                                                token: accessToken,
                                                userProfile: userProfile,
                                                scrutinId: scrutinId,
                                                sessions: authResult.sessions,
                                                hasVoted: authResult.hasVoted
                                            }, '*');
                                        } else {
                                            // Voter not authorized
                                            window.opener.postMessage({
                                                type: 'oauth-voter-unauthorized',
                                                error: 'Voter not authorized for this scrutin',
                                                email: userProfile.email,
                                                scrutinId: scrutinId
                                            }, '*');
                                        }
                                    } else {
                                        // General voter authentication without specific scrutin
                                        window.opener.postMessage({
                                            type: 'oauth-voter-success',
                                            token: accessToken,
                                            userProfile: userProfile
                                        }, '*');
                                    }
                                } else {
                                    window.opener.postMessage({
                                        type: 'oauth-error',
                                        error: 'Failed to get user profile from OAuth provider'
                                    }, '*');
                                }
                            } catch (authError) {
                                console.error('Voter authentication error:', authError);
                                window.opener.postMessage({
                                    type: 'oauth-error',
                                    error: 'Authentication verification failed'
                                }, '*');
                            }
                        } else {
                            // Standard OAuth success for non-voter flows
                            window.opener.postMessage({ type: 'oauth-success', token: accessToken }, '*');
                        }
                    } else if (error) {
                        window.opener.postMessage({ type: 'oauth-error', error }, '*');
                    } else {
                        window.opener.postMessage({
                            type: 'oauth-error',
                            error: 'No access token received'
                        }, '*');
                    }

                    // Close the popup firmly
                    window.close();
                } else {
                    // Handle direct navigation (not popup)
                    console.log('OAuth callback received without opener window');
                }
            } catch (error) {
                console.error('OAuth callback error:', error);
                if (window.opener) {
                    window.opener.postMessage({
                        type: 'oauth-error',
                        error: 'Callback processing failed'
                    }, '*');
                    window.close();
                }
            }
        };

        handleOAuthCallback();
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-slate-500 font-medium">Finalisation de l'authentification...</p>
            <p className="text-slate-400 text-sm mt-2">Vérification des autorisations...</p>
        </div>
    );
};

export default OAuthCallbackPage;
