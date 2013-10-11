# Lanica Google Purchase Module #

Enable Google Play Billing v3 purchases using this module.

## Before You Begin ##

1. Log in to your Google Play developer account [here](http://play.google.com/apps/publish).
2. Add products definitions for your app, as described [here](http://developer.android.com/google/play/billing/billing_admin.html#billing-list-setup).
3. Add test email addresses to your account, and retrieve your app's license key, as described [here](http://developer.android.com/google/play/billing/billing_admin.html#billing-testing-setup).
4.  You are now ready to test purchases and receive callbacks from your Titanium application. 

## Using the Module API ##

The  Lanica Google Purchase module allows you to request purchase metadata, and make and manage Google Play purchases from JavaScript code.

### Initializing the Module ###

Require the module and initialize the billing service.  You will need the license key from step 3 above:

    var purchase=require("co.lanica.purchase.google");
    purchase.startBillingService("YOUR_LICENSE_KEY");

After calling `startBillingService()` , the module will dispatch the `BILLING_CONNECTION_READY` event when the SDK is ready to accept requests (or `BILLING_CONNECTION_FAILED` if something goes wrong.)


	purchase.addEventListener(purchase.BILLING_CONNECTION_READY, function(e){
		Ti.API.info("Google billing ready!");
	});	

	purchase.addEventListener(purchase.BILLING_CONNECTION_FAILED,function(e){
		Ti.API.info("Google billing connection failed: " + e.message);
	});

### Load Purchase Metadata ###

To load information about available purchases, pass an array of item skus to the `loadItemDetails` function:

    purchase.loadItemDetails(["android.test.purchased","android.test.item_unavailable"]);

The module will respond be dispatching either the `ITEM_DETAILS_LOADED` or `ITEM_DETAILS_FAILED` event listener.


After a request to `loadItemDetails()`, the `ITEM_DETAILS_LOADED` event contains detailed info about the available items.

 The returned data object will contain a hash map called 'skus', where each key maps to the item data like so:

	/**
	 * Data format returned by ITEM_DETAILS_LOADED:
	 * {
	 * 	"skus":
	 * 	{
	 * 		"android.test.purchased":
	 * 		{
	 * 			"title":"Sample Title",
	 * 			"price":"$0.99",
	 * 			"itemType:": "subs",
	 * 			"description":"Sample description for product",
	 * 		}
	 * 	}
	 * }
	 * 
	 */
	purchase.addEventListener(purchase.ITEM_DETAILS_LOADED,function(e){
		var itemCount = 0;
		var itemList = "";
		for (var k in e.skus)
		{
			itemCount++;
			itemList+="["+k+"]";
		}
		Ti.API.info("ITEM_DETAILS_LOADED: "+itemCount+" items: "+itemList);
	});
	

If the request to load Item Details fails, `ITEM_DETAILS_FAILED` will be dispatched instead:

	purchase.addEventListener(purchase.ITEM_DETAILS_FAILED,function(e){	
		Ti.API.info("Item Details failed: " + e.message);
	});

### Load the Player's Current Inventory ###

Google Play track's the state of the player's inventory - the set of item's they currently 'own' - for you.  At any time, you can make a request to `loadPlayerInventory` to get the latest inventory state.  You should update the inventory state before making or consuming a purchase for the first time.

 Set the first parameter to true if you'd also like to load the item details (price, description, etc).  The  second parameter is an optional string array of skus for which you'd like to load additional details.

		purchase.loadPlayerInventory(true, []);


After a request to `loadPlayerInventory()`, `INVENTORY_LOADED` will be dispatched.  Its data will contain a hash map called purchases, where each key maps to an object with details of each item the player currently 'owns', like so:

	/**
	 * 
	 * {
	 * 	"purchases":
	 * 	{
	 * 		"android.test.purchased":
	 * 		{
	 * 			"developerPayload":"test",
	 * 			"packageName":"co.lanica.purchase.google.harness",
	 * 			"json":"[RAW JSON OF ITEM, USEFUL FOR BACKEND VERIFICATION]",
	 * 			"token":"inapp:co.lanica.purchase.google.harness:android.test.purchased",
	 * 			"itemType":"inapp",
	 * 			"sku":"android.test.purchased",
	 * 			"signature":"",
	 * 			"purchaseState":0,
	 * 			"orderId":"transactionId.android.test.purchased",
	 * 			"purchaseTime":0
	 * 		}
	 * 	}
	 * }
	 * 
	 */
	purchase.addEventListener(purchase.INVENTORY_LOADED,function(e){
		
		var itemCount = 0;
		var itemList = "";
		for (var k in e.purchases)
		{
			itemCount++;
			itemList+="["+k+"]";
		}
		Ti.API.info( "INVENTORY_LOADED: "+itemCount+" items: "+itemList);


	});	

If an error occurs with the inventory request, LOAD_INVENTORY_FAILED is dispatched instead.

	purchase.addEventListener(purchase.LOAD_INVENTORY_FAILED,function(e){
		Ti.API.info("Load Inventory Failed: "+e.message);
	});

### Purchase an Item ###

Use `purchaseItem()` to start the transaction to buy a particular item. The first parameter is the item's sku.' The second parameter is the item type (`IN_APP_PURCHASE`, or `SUBSCRIPTION`.) The third parameter is an optional payload to associate with this purchase.  You may wish to use this for tracking the purchase flow of this item, back-end tracking, etc.

	purchase.purchaseItem('android.test.purchased', purchase.IN_APP_PURCHASE, 'payload');

If you are using subscriptions items, you can first determine if subscriptions are supported by the current OS using the `areSubscriptionsSupported` function:

	var supported = purchase.areSubscriptionsSupported();

 After a request to `purchaseItem()`, a `PURCHASE_SUCCEEDED` event is dispatched.  Its data will contain a hash map with the key 'purchase', which contains the details of the purchased item, like so:

	 /** 
	 * {
	 * 	"purchase":
	 * 	{
	 * 		"developerPayload":"test",
	 * 		"packageName":"co.lanica.purchase.google.harness",
	 * 		"json":"[RAW JSON OF ITEM, USEFUL FOR BACKEND VERIFICATION]",
	 * 		"token":"inapp:co.lanica.purchase.google.harness:android.test.purchased",
	 * 		"itemType":"inapp",
	 * 		"sku":"android.test.purchased",
	 * 		"signature":"",
	 * 		"purchaseState":0,
	 * 		"orderId":"transactionId.android.test.purchased",
	 * 		"purchaseTime":0
	 * 	}
	 * }	 
	 * 
	 */
	purchase.addEventListener(purchase.PURCHASE_SUCCEEDED, function(e){
		Ti.API.info("PURCHASE_SUCCEEDED for "+e.purchase.sku);
	});	
	
 If an error occurs with the purchase, `PURCHASE_FAILED` is dispatched instead:

	purchase.addEventListener(purchase.PURCHASE_FAILED, function(e){
		Ti.API.info("PURCHASE_FAILED: "+e.message);
	});


### Use a Consumable Item ###

Google Play manages all purchased items in the player's inventory, including consumable items.  To 'use' a consumable item, use the `consumeItem()` function:

	purchase.consumeItem('android.test.purchased');

After a request to `consumeItem()`, `CONSUME_SUCCEEDED` will be dispatched.  Its data will contain the sku of the consumed item.

	purchase.addEventListener(purchase.CONSUME_SUCCEEDED, function(e){
		Ti.API.info("CONSUME_SUCCEEDED for "+e.sku);
	});
	
If an error occurs consuming the item, CONSUME_FAILED will be dispatched instead.

	purchase.addEventListener(purchase.CONSUME_FAILED, function(e){
		Ti.API.info("CONSUME_FAILED: "+e.message);
	});

On your next request to update the inventory, the consumed item will no longer be present, and the user is free to purchase it again.