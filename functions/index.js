/* eslint-env node */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.initiateBackgroundCheck = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated"
    );
  }

  // In a real implementation, we would call Checkr API here
  // For demo purposes, we'll simulate background check processing
  const userId = context.auth.uid;
  const userDoc = admin.firestore().doc(`users/${userId}`);
  
  // Update user status to "pending"
  await userDoc.update({
    "verification.backgroundCheckStatus": "pending",
    "verification.backgroundCheckRequested": admin.firestore.FieldValue.serverTimestamp()
  });

  // Simulate background check processing
  return new Promise((resolve) => {
    setTimeout(async () => {
      // Update user status to "completed"
      await userDoc.update({
        "verification.backgroundCheckStatus": "completed",
        "verification.backgroundCheckCompleted": admin.firestore.FieldValue.serverTimestamp(),
        "verification.backgroundChecked": true
      });
      resolve({ status: "completed" });
    }, 5000); // 5 second delay for simulation
  });
});

// Update user demographic information
exports.updateUserDemographics = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated"
    );
  }

  const userId = context.auth.uid;
  const { age, gender, location } = data;
  
  // Validate input
  if (!age || !gender || !location) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing required demographic fields"
    );
  }

  // Update user document with demographic info
  await admin.firestore().doc(`users/${userId}`).update({
    demographics: {
      age,
      gender,
      location,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    }
  });

  return { status: "success" };
});

// Handle user reputation updates (thumbs up/down)
exports.updateUserReputation = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated"
    );
  }

  const { targetUserId, rating } = data; // rating: 1 for up, -1 for down
  const sourceUserId = context.auth.uid;

  // Prevent self-rating
  if (targetUserId === sourceUserId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Cannot rate yourself"
    );
  }

  // Create rating document
  const ratingRef = admin.firestore().collection("ratings").doc();
  await ratingRef.set({
    sourceUserId,
    targetUserId,
    rating,
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });

  // Update target user's reputation score
  const userRef = admin.firestore().doc(`users/${targetUserId}`);
  await userRef.update({
    reputation: admin.firestore.FieldValue.increment(rating),
    lastReputationUpdate: admin.firestore.FieldValue.serverTimestamp()
  });

  return { status: "success" };
});

// Handle user reporting
exports.reportUser = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated"
    );
  }

  const { targetUserId, reason } = data;
  const sourceUserId = context.auth.uid;

  // Prevent self-reporting
  if (targetUserId === sourceUserId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Cannot report yourself"
    );
  }

  // Create report document
  const reportRef = admin.firestore().collection("reports").doc();
  await reportRef.set({
    sourceUserId,
    targetUserId,
    reason,
    status: "pending",
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });

  return { status: "success", reportId: reportRef.id };
});