# Employee Management System (EMS)

A professional Employee Management System with React frontend and Firebase backend!

## Setup Instructions

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Firebase Authentication** (Email/Password provider)
4. Enable **Cloud Firestore** (Database)
5. Enable **Firebase Storage** (for file uploads)
6. Get your Firebase config from Project Settings → Add app → Web app

### 2. Configure Firebase in the App

Update `frontend/src/firebase/config.ts` with your Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 3. Firestore Security Rules

Add these security rules in Firebase Console → Firestore Database → Rules:

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    
    match /profiles/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    
    match /notifications/{id} {
      allow read, write: if request.auth != null && resource.data.uid == request.auth.uid;
    }
    
    // Admin can manage everything
    match /{document=**} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### 4. Run the App

```bash
# Frontend
cd frontend
npm install
npm start
```

## Login Credentials (after creating users in Firebase)

- Admin: Create with role `admin`
- Manager: Create with role `manager`
- Employee: Create with role `employee`
