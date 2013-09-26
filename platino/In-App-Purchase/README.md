###May 29, 2013: IAP update

####Instructions:

Unzip both [co.lanica.purchase.google](Google%20Play/co.lanica.purchase.google.zip) and [co.lanica.purchase.amazon](Amazon/co.lanica.purchase.amazon.zip), and place the unzipped modules into Library/Application Support/Titanium/modules/android or or your app's /modules/android folder.

####Amazon
1 - Look at the Amazon [example app](Amazon/FirstView.js).

2 - Setup json products as shown here: https://developer.amazon.com/sdk/in-app-purchasing/documentation/testing-iap.html

3 - Download the amazonSDKTester.apk from amazon and Install it by typing the following command in Terminal:
./android-sdk/platform-tools/install -r AmazonSDKTester.apk

4 - Copy the json from step 2 to the sdcard using:
./android-sdk/platform-tools/adb push amazon.sdktester.json /mnt/sdcard

5 - Run the app on the device itself, not the emulator.

####Google Play
1 - Check out the Google Play [example app](Google%20Play/FirstView.js).

2 - Setup products in the Google Play Store (see http://developer.android.com/google/play/billing/billing_admin.html - Creating A Product List.)

3 - Add your key from the Google Play Store to your app

4 - Create a full signed APK and upload an unpublished build to the Google Play Store to test

####Apple App Store (iOS)
Coming soon

