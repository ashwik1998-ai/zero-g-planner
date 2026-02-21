declare global {
    interface Window {
        OneSignalDeferred: any[];
        OneSignal: any;
    }
}

// NOTE: You'll need to create an account at onesignal.com 
// and insert your App ID here for full functionality.
const ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID || '';

export class NotificationService {
    private static initialized = false;

    static initialize(): void {
        if (this.initialized || !ONESIGNAL_APP_ID) {
            if (!ONESIGNAL_APP_ID) console.warn("OneSignal App ID is missing in .env.");
            return;
        }

        window.OneSignalDeferred = window.OneSignalDeferred || [];
        window.OneSignalDeferred.push(async function (OneSignal: any) {
            await OneSignal.init({
                appId: ONESIGNAL_APP_ID,
                allowLocalhostAsSecureOrigin: true, // Needed for local dev
            });
            console.log("🔔 Vanilla OneSignal Initialized");
        });

        this.initialized = true;
    }

    static async requestPermission(): Promise<boolean> {
        if (window.OneSignal && window.OneSignal.Notifications) {
            try {
                // We directly request native permission because Chrome requires 
                // this to stay synchronous with the user's click event.
                await window.OneSignal.Notifications.requestPermission();
                const permission = window.OneSignal.Notifications.permission;
                return permission === true || permission === 'granted';
            } catch (e) {
                console.error("Push prompt error:", e);
                return false;
            }
        }

        // Fallback for slow loads
        return new Promise((resolve) => {
            window.OneSignalDeferred.push(async function (OneSignal: any) {
                try {
                    await OneSignal.Notifications.requestPermission();
                    const permission = OneSignal.Notifications ? OneSignal.Notifications.permission : false;
                    resolve(permission === true || permission === 'granted');
                } catch (e) {
                    console.error("Push prompt error:", e);
                    resolve(false);
                }
            });
        });
    }

    // Set the user identifier in OneSignal to tie push tokens to the Clerk User ID
    static loginUser(userId: string): void {
        window.OneSignalDeferred.push(async function (OneSignal: any) {
            try {
                if (OneSignal.User && OneSignal.User.PushSubscription) {
                    await OneSignal.login(userId);
                    console.log(`👤 Linked OneSignal to User ID: ${userId}`);
                }
            } catch (error) {
                console.error("❌ OneSignal Login Error:", error);
            }
        });
    }

    // Sync external contact info for multi-channel targeting
    // (Email/SMS logic removed per user request)

    // Since Push is managed backend-side via OneSignal API, we remove the local timeout-based scheduling
    // and instead use this space to prepare for backend interaction. 
    //
    // For now, keeping semantic stubs so app logic doesn't break.
    static scheduleForTask(_taskId: string, _title: string, _deadline: Date, _offsetMinutes?: number): void {
        // Not needed for OneSignal: Push scheduling should happen on the backend server
    }

    static cancelForTask(_taskId: string): void {
        // Handled by backend
    }

    static cancelAll(): void {
        // Handled by backend
    }

    static scheduleAll(_tasks: any[]): void {
        // Handled by backend syncing
    }
}
