import api from "../services/api";

// OAuth configuration
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
export const REDIRECT_URI = `${window.location.origin}/oauth/callback`;

// Google OAuth configuration
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_SCOPE = "email profile";

// GitHub OAuth configuration
const GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize";
const GITHUB_SCOPE = "read:user user:email";

interface OAuthPopupResult {
  access_token?: string;
  code?: string;
  state?: string;
  error?: string;
}
const toParams = (query: string): any => {
  const q = query.replace(/^\??\//, "");

  return q.split("&").reduce((values: any, param: string) => {
    const [key, value] = param.split("=");

    values[key] = value;

    return values;
  }, {});
};

// Helper function to open popup window
const openPopup = (url: string, name: string): Window | null => {
  const width = 500;
  const height = 600;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  return window.open(
    url,
    name,
    `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
  );
};

// Helper function to wait for popup result
const waitForPopupResult = (popup: Window): Promise<OAuthPopupResult> => {
  return new Promise((resolve, reject) => {
    let resolved = false;
    
    const checkClosed = setInterval(() => {
      if (popup.closed && !resolved) {
        clearInterval(checkClosed);
        reject(new Error("Authentication was cancelled"));
      }
    }, 1000);

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "OAUTH_SUCCESS") {
        console.log("OAUTH_SUCCESS", event.data);
        resolved = true;
        clearInterval(checkClosed);
        window.removeEventListener("message", handleMessage);
        
        // Give the popup a moment to finish processing before closing
        setTimeout(() => {
          if (!popup.closed) {
            popup.close();
          }
        }, 500);
        
        resolve({
          access_token: event.data.access_token,
          code: event.data.code,
          state: event.data.state,
        });
      } else if (event.data.type === "OAUTH_ERROR") {
        console.log("OAUTH_ERROR", event.data);
        resolved = true;
        clearInterval(checkClosed);
        window.removeEventListener("message", handleMessage);
        
        // Give the popup a moment to finish processing before closing
        setTimeout(() => {
          if (!popup.closed) {
            popup.close();
          }
        }, 500);
        
        reject(new Error(event.data.error || "Authentication failed"));
      }
      // Ignore unknown message types - they're usually from other sources
    };

    window.addEventListener("message", handleMessage);
  });
};

// Google OAuth flow
export const initiateGoogleAuth = async (): Promise<OAuthPopupResult> => {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error("Google Client ID not configured");
  }

  const state = Math.random().toString(36).substring(7);
  const googleAuthUrl = `${GOOGLE_AUTH_URL}?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=token&scope=${GOOGLE_SCOPE}&state=${state}`;

  const popup = openPopup(googleAuthUrl, "google-oauth");
  if (!popup) {
    throw new Error("Popup blocked. Please allow popups for this site.");
  }

  try {
    return await waitForPopupResult(popup);
  } catch (error) {
    popup.close();
    throw error;
  }
};

// GitHub OAuth flow
export const initiateGitHubAuth = async (): Promise<OAuthPopupResult> => {
  if (!GITHUB_CLIENT_ID) {
    throw new Error("GitHub Client ID not configured");
  }

  const state = Math.random().toString(36).substring(7);

  const githubAuthUrl = `${GITHUB_AUTH_URL}?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${GITHUB_SCOPE}&state=${state}`;

  const popup = openPopup(githubAuthUrl, "github-oauth");
  if (!popup) {
    throw new Error("Popup blocked. Please allow popups for this site.");
  }

  try {
    return await waitForPopupResult(popup);
  } catch (error) {
    popup.close();
    throw error;
  }
};

// Handle OAuth callback (to be called from the redirect page)
export const handleOAuthCallback = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.substring(1));

  // For Google OAuth (implicit flow)
  const accessToken = hashParams.get("access_token");
  const error = urlParams.get("error") || hashParams.get("error");

  // For GitHub OAuth (authorization code flow)
  const code = urlParams.get("code");
  const state = urlParams.get("state");

  if (error) {
    window.opener?.postMessage(
      { type: "OAUTH_ERROR", error },
      window.location.origin
    );
    window.close();
    return;
  }

  if (accessToken) {
    // Google OAuth success
    window.opener?.postMessage(
      { type: "OAUTH_SUCCESS", access_token: accessToken },
      window.location.origin
    );
    // Small delay to ensure message is processed before closing
    setTimeout(() => window.close(), 100);
    return;
  }

  // If nothing matched, just close
  window.close();
};
