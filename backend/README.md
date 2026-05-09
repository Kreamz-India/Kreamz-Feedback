# Kreamz Feedback — Backend

This project uses **Firebase Firestore** as the backend database.
There is no separate Node.js/Express server.

## Firebase Project
- Project ID: kreamz-feedback
- Firestore Database: stores all feedback submissions
- Collection: `feedbacks`

## Firestore Rules
Set these rules in Firebase Console → Firestore → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /feedbacks/{doc} {
      allow write: if true;   // customers can submit feedback
      allow read: if true;    // admin dashboard can read
    }
  }
}
```

## Feedback Document Schema
Each feedback document stored in Firestore contains:

| Field        | Type      | Description                          |
|-------------|-----------|--------------------------------------|
| storeId     | string    | e.g. "KRZ-001"                       |
| store       | string    | Outlet name                          |
| location    | string    | AFE zone name                        |
| whoAreYou   | string    | Customer / Internal Team / Franchise Owner / Store Member |
| ratings     | object    | { taste, presentation, service, value } — each 1-5 |
| overall     | number    | Overall score 1-10                   |
| recommend   | number    | 0=Yes, 1=Maybe, 2=No                 |
| name        | string    | Customer name                        |
| phone       | string    | Phone number                         |
| email       | string    | Email (optional)                     |
| birthday    | string    | Date string (optional)               |
| anniversary | string    | Date string (optional)               |
| improve     | string    | What to improve (required)           |
| avgRating   | number    | Average of ratings                   |
| createdAt   | timestamp | Server timestamp                     |
| source      | string    | "kreamz-qr"                          |
