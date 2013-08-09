# Lanica Amazon Purchase Module #

Enable Amazon purchases using this module.

## Before You Begin ##

1. Log in to your Amazon developer account [here](https://developer.amazon.com/welcome.html).
2. Download the Amazon Mobile App SDK from [here](https://developer.amazon.com/sdk.html).
3. Install the Amazon SDK Tester Application from the SDK package.  This will enable you to test purchases in a sandbox environment:

    `./android-sdk/platform-tools/adb install -r AmazonSDKTester.apk`

4.  Create an amazon.sdktester.json file that defines your purchase scheme.  You can learn more about the sdktester json format [here](https://developer.amazon.com/sdk/in-app-purchasing/documentation/testing-iap.html#Create%20JSON).
5.  Install the amazon.sdktester.json to your Android device:

    `./android-sdk/platform-tools/adb push amazon.sdktester.json /mnt/sdcard`

6. You are now ready to test purchases and receive callbacks from your Titanium application.  This will work on both Kindle devices and standard Android phones.

## Using the Module API ##

The  Lanica Amazon Purchase module allows you to request purchase metadata, and make and manage Amazon purchases from JavaScript code.

### Initializing the Module ###

Require the module and initialize it:

    var purchase=require("co.lanica.purchase.amazon");
    purchase.initialize();

After calling initialize() , the module will dispatch the `SDK_AVAILABLE` event when the SDK is ready to accept requests:

	purchase.addEventListener(purchase.SDK_AVAILABLE, function(e){
		Ti.API.info("Ready to use Amazon Purchases!");
	});

### Load Purchase Metadata ###

To load information about available purchases, pass an array of item IDs to the `loadItemData` function:

    purchase.loadItemData(["first_item","second_item"]);

The module will respond be dispatching either the `ITEM_DATA_LOADED` or `ITEM_DATA_FAILED` event listener.

	/** 
	 * ITEM_DATA_LOADED's response holds metadata in the following format:
	 * 
	 * 		 * {"items":
		 * 		[
		 * 			{
		 * 			"sku":"skuhere",
		 * 			"type":"typehere",
		 * 			"price":"pricehere",
		 * 			"title":"titlehere",
		 * 			"description":"description here"
		 * 			}
		 * 		],
		 *  "unavailableSkus":
		 *  	[
		 *  		"badSku",
		 *  		"otherBadSku"
		 *  	]
		 *  }
		 * 
	 *  
	 */
	purchase.addEventListener(purchase.ITEM_DATA_LOADED, function(e){
		var items = e.items;
		var itemList = "";
		for (var p in items)
		{
			itemList+=items[p].sku+",";
		}
		Ti.API.info("item data loaded: "+itemList);

	});

	purchase.addEventListener(purchase.ITEM_DATA_FAILED, function(e){
		Ti.API.info("ITEM_DATA_FAILED: "+e.message);

	});	


### Purchase an Item ###

Pass an item ID to the purchaseItem function to begin the purchase flow:

    purchase.purchaseItem("first_item");

The module will respond by dispatching either the `PURCHASE_SUCCEEDED` or `PURCHASE_FAILED` event listener.

	/**
	 * PURCHASE_SUCCEEDED response holds receipt data in the following format:
	 * 
	 * 	 *  {"receipt":
		 * 		{
		 * 			"sku":"sku here",
		 * 			"type":"type here",
		 * 			"token":"purchaseTokenHere",
		 * 			"subStart":subscriptionstarttimems,
		 * 			"subEnd": subscriptionenddatems
		 * 		}
		 * }
	 * 
	 */
	purchase.addEventListener(purchase.PURCHASE_SUCCEEDED, function(e){
		Ti.API.info("PURCHASE_SUCCEEDED: "+e.receipt.sku);
	});

	purchase.addEventListener(purchase.PURCHASE_FAILED, function(e){
		Ti.API.info("PURCHASE_FAILED: "+e.message);
	});

### Listen for Purchase Update Events ###

After initialization, the module may dispatch update events if the state of user purchases changes - such as when a new item is acquired or used, or the current user changes.  You may monitor the `PURCHASES_UPDATED` event for notifications about such changes:

	/** 
	 * The data of a PURCHASES_UPDATED event is formatted as such:
	 * 
		 * {
		 * 		"receipts":
		 * 			[		 			
		 * 				{
		 * 					"sku":"sku here",
		 * 					"type":"type here",
		 * 					"token":"purchaseTokenHere",
		 * 					"subStart":subscriptionstarttimems,
		 * 					"subEnd": subscriptionenddatems
		 * 				}
		 * 			],
		 * 		"revokedSkus":
		 * 			[
		 * 				"revokedSkuHere",
		 * 				"anotherRevokedSku"
		 * 			]
		 * }
		 * 	
		 * 					
		 *
	 */
	purchase.addEventListener(purchase.PURCHASES_UPDATED, function(e){
		Ti.API.info("PURCHASES_UPDATED: "+e.receipts.length+" receipts");
	});
	purchase.addEventListener(purchase.PURCHASES_UPDATE_FAILED, function(e){
		Ti.API.info("PURCHASES_UPDATE_FAILED: "+e.message);
	});

You may trigger a purchase update directly by calling the restoreTransactions function:

		purchase.restoreTransactions();