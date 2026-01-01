import { config } from "dotenv";

config({ path: ".env.local" });

console.log("Env loaded:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "Yes" : "No");

async function createTestUsers() {

  const { signUpWithEmail } = await import("../lib/authService");
  console.log("Creating test users...");

  
  for (let i = 1; i <= 10; i++) {
    const email = `test${i}@example.com`;
    const password = `test${i}@`;
    const displayName = `Test User ${i}`;

    try {
      console.log(`Creating user: ${email}...`);
      await signUpWithEmail(email, password, displayName);
      console.log(`✅ Created ${email}`);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`⚠️ User ${email} already exists.`);
      } else {
        console.error(`❌ Failed to create ${email}:`, error.message);
      }
    }
  }

  console.log("Done.");
  process.exit(0);
}

createTestUsers();
