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
        if (!ONESIGNAL_APP_ID) {
            return false;
        }

        if (window.OneSignal && window.OneSignal.Notifications) {
            const currentPermission = window.OneSignal.Notifications.permission;
            console.log("Current OneSignal permission:", currentPermission);

            if (currentPermission === 'denied' || currentPermission === false) {
                return false;
            }

            try {
                const permissionPromise = window.OneSignal.Notifications.requestPermission();
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Native Push Prompt Timed Out.")), 8000)
                );

                await Promise.race([permissionPromise, timeoutPromise]);
                const finalPermission = window.OneSignal.Notifications.permission;
                return finalPermission === true || finalPermission === 'granted';
            } catch (e: any) {
                console.error("Push prompt error:", e);
                return false;
            }
        }

        // Fallback for slow loads
        return new Promise((resolve) => {
            const timeoutId = setTimeout(() => {
                resolve(false);
            }, 8000);

            window.OneSignalDeferred.push(async function (OneSignal: any) {
                clearTimeout(timeoutId);
                try {
                    const perm = OneSignal.Notifications.permission;
                    if (perm === 'denied' || perm === false) {
                        resolve(false);
                        return;
                    }
                    await OneSignal.Notifications.requestPermission();
                    const finalPerm = OneSignal.Notifications.permission;
                    resolve(finalPerm === true || finalPerm === 'granted');
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
