# Sub4Sub App

A React Native mobile application built with Expo designed to help creators grow their channels through community engagement, featuring Firebase for backend services, Google AdMob for monetization, and RevenueCat for in-app purchases.

## Features

*   **Firebase Integration:** Authentication and Firestore database to securely manage users and campaigns.
*   **Monetization (AdMob):** Integrated Google Mobile Ads for rewarded and banner advertisements.
*   **In-App Purchases (RevenueCat):** Premium subscriptions and coin packages.
*   **Modern UI:** Built with Expo Router and custom UI components for a smooth user experience.

## Tech Stack

*   **Framework:** React Native / [Expo](https://expo.dev/) (v56)
*   **Backend:** Firebase (Auth, Firestore)
*   **Navigation:** Expo Router
*   **Monetization:** Google AdMob & RevenueCat
*   **Language:** TypeScript

## Getting Started

### 1. Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/fts18/sub4sub.git
cd sub4sub
npm install
```

### 2. Environment Setup

For security, API keys are hidden. You must create a `.env` file in the root directory and add your Firebase configuration:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 3. Running the App

Start the Expo development server:

```bash
npx expo start
```

Press `a` to run on an Android emulator, `i` to run on an iOS simulator, or scan the QR code with the Expo Go app on your physical device.
