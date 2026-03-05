import React, { useEffect } from 'react';

const OAuthCallbackPage = () => {
    useEffect(() => {
        // Parse the hash parameters
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const error = params.get('error');

        if (window.opener) {
            if (accessToken) {
                window.opener.postMessage({ type: 'oauth-success', token: accessToken }, '*');
            } else if (error) {
                window.opener.postMessage({ type: 'oauth-error', error }, '*');
            }
            // Close the popup after a short delay
            setTimeout(() => {
                window.close();
            }, 500);
        }
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-slate-500 font-medium">Finalisation de l'authentification...</p>
        </div>
    );
};

export default OAuthCallbackPage;
