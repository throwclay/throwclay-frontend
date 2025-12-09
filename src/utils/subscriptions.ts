import type { SubscriptionLimits, User } from "@/types";

// Subscription limits helper function
export function getSubscriptionLimits(subscription?: User["subscription"]): SubscriptionLimits {
    switch (subscription) {
        case "free":
            return {
                projects: 2,
                throwsPerProject: 10,
                additionalThrows: 5,
                canCollaborate: false,
                canExport: false,
                prioritySupport: false,
                maxPagesPerThrow: 3,
                canUploadPhotos: false,
                maxPhotoSize: 5,
                canAnnotatePhotos: false,
                canUsePremiumTools: false
            };
        case "passion":
            return {
                projects: 10,
                throwsPerProject: 25,
                additionalThrows: 15,
                canCollaborate: true,
                canExport: true,
                prioritySupport: false,
                maxPagesPerThrow: 10,
                canUploadPhotos: true,
                maxPhotoSize: 25,
                canAnnotatePhotos: true,
                canUsePremiumTools: true
            };
        case "small-artist":
            return {
                projects: 25,
                throwsPerProject: 50,
                additionalThrows: 30,
                canCollaborate: true,
                canExport: true,
                prioritySupport: true,
                maxPagesPerThrow: 20,
                canUploadPhotos: true,
                maxPhotoSize: 50,
                canAnnotatePhotos: true,
                canUsePremiumTools: true
            };
        case "studio-pro":
            return {
                projects: -1, // unlimited
                throwsPerProject: -1, // unlimited
                additionalThrows: -1, // unlimited
                canCollaborate: true,
                canExport: true,
                prioritySupport: true,
                maxPagesPerThrow: -1, // unlimited
                canUploadPhotos: true,
                maxPhotoSize: 100,
                canAnnotatePhotos: true,
                canUsePremiumTools: true
            };
        default:
            return {
                projects: 2,
                throwsPerProject: 10,
                additionalThrows: 5,
                canCollaborate: false,
                canExport: false,
                prioritySupport: false,
                maxPagesPerThrow: 3,
                canUploadPhotos: false,
                maxPhotoSize: 5,
                canAnnotatePhotos: false,
                canUsePremiumTools: false
            };
    }
}
