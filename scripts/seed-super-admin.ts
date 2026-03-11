import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

// Load environment variables
dotenv.config();

// Define exactly what the admin credentials look like
const serviceAccountPath = path.resolve(__dirname, "../../backend-server/serviceAccountKey.json");

if (!fs.existsSync(serviceAccountPath)) {
    console.error("❌ serviceAccountKey.json not found at expected path:", serviceAccountPath);
    console.error("Please ensure the backend-server has the Firebase Admin credentials.");
    process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));

// Initialize Firebase Admin
initializeApp({
    credential: cert(serviceAccount),
    databaseURL: process.env.VITE_FIREBASE_DATABASE_URL
});

const adminStoreAuth = getAuth();

async function seedSuperAdmin() {
    const adminEmail = process.env.VITE_ADMIN_EMAILS?.split(',')[0];

    if (!adminEmail) {
        console.error("❌ VITE_ADMIN_EMAILS is not defined in your .env file.");
        process.exit(1);
    }

    // Provide a default strong password for the initial seed
    const defaultPassword = "SuperAdminPassword123!";

    try {
        console.log(`🔍 Checking if user ${adminEmail} exists...`);
        let userRecord;

        try {
            userRecord = await adminStoreAuth.getUserByEmail(adminEmail);
            console.log(`✅ User ${adminEmail} already exists. ID: ${userRecord.uid}`);
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                console.log(`👤 User doesn't exist. Creating new user ${adminEmail}...`);
                userRecord = await adminStoreAuth.createUser({
                    email: adminEmail,
                    password: defaultPassword,
                    emailVerified: true,
                    displayName: "Super Admin",
                });
                console.log(`✅ Created user ${adminEmail} successfully. Expected password: ${defaultPassword}`);
            } else {
                throw error;
            }
        }

        console.log(`🔐 Setting custom claims for ${adminEmail}...`);
        // Set both admin and super_admin claims for this root user
        await adminStoreAuth.setCustomUserClaims(userRecord.uid, {
            admin: true,
            super_admin: true
        });

        console.log(`🎉 Success! User ${adminEmail} is now a super admin.`);
        console.log(`Wait a few minutes for the token to propagate, or force log out and log back in.`);
        process.exit(0);

    } catch (error) {
        console.error("❌ Error seeding super admin:", error);
        process.exit(1);
    }
}

seedSuperAdmin();
