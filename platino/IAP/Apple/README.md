# Lanica Apple iOS Purchase Module #

Enable iOS purchases using this module.

## Before You Begin ##

1. Log in to your iTunes Connect account [here](https://itunesconnect.apple.com).
2. Under Contracts, Tax, and Banking, be sure you've 'agreed' to all pending contracts and agreements.
3. Select Manage Users > Test User > Add New User.  The user you create will be valid for testing purchases in the sandbox environment.
4. Select Mange Your Apps and select your application.  Select Manage In-App Purchase and create the set of product IDs you wish to sell.
5. On your test device, go to Settings > Store and Log Out of the Store.  This ensures that when your sandbox app starts up, you can login to the sandbox using the Test User you created.
## Using the Module API ##

The  Lanica Apple iOS Purchase module allows you to request purchase metadata, restore transactions, and make and manage iOS In-App Purchases purchases from JavaScript code.

### Initializing the Module ###

Require the module and initialize it:

    var purchase=require("co.lanica.purchase.apple");
    purchase.initialize();


### Load Purchase Metadata ###

To load information about available purchases, pass an array of product IDs to the `loadProductDetails` function:

    purchase.loadProductDetails(["first_item","second_item"]);

The module will respond be dispatching either the `PRODUCT_DETAILS_LOADED` or `PRODUCT_DETAILS_FAILED` event listener.

	/**
	 * After a request to loadProductDetails(), the PRODUCT_DETAILS_LOADED 
	 * event contains detailed info about the available items.
	 * 
	 * The returned data object will contain a hash map called 'products',
	 *  where each key maps to the item data,
	 *  and an array of any invalid products requested, like so:
	 * 
	 * {
	 * 	"products":
	 * 	{
	 * 		"myproductid":
	 * 		{
	 * 			"title":"Sample Title",
	 * 			"displayPrice":"$0.99",
	 * 			"price":0.99,
	 * 			"description":"Sample description for product",
	 * 		}
	 * 	},
	 *  "invalidIds": ["madeupid","invalidid"]
	 * }
	 * 
	 */
	purchase.addEventListener(purchase.PRODUCT_DETAILS_LOADED,function(e){

		var itemCount = 0;
		var itemList = "";
		for (var k in e.products)
		{
			itemCount++;
			var nextItem=e.products[k];
			itemList+="["+nextItem.title+":"+nextItem.displayPrice+"]";
		}
		Ti.API.info("PRODUCT_DETAILS_LOADED: "+itemCount+" items: "+itemList+", invalid:"+e.invalidIds.join(","));
	});
	
	/**
	 * If the request to load Product Details fails, PRODUCT_DETAILS_FAILED will be dispatched instead.
	 * 
	 */
	purchase.addEventListener(purchase.PRODUCT_DETAILS_FAILED,function(e){
	
		var msg = "Product Details failed: " + e.message;
		log(msg);
	});



### Purchase a Product ###

Pass a product ID to the `purchaseProduct` function to begin the purchase flow:

    purchase.purchaseProduct("first_item");

Optionally, you may also pass a quantity to purchase as the second parameter:

	purchase.purchaseProduct("ammo", 20);

The module will respond by dispatching either the `PURCHASE_SUCCEEDED`, `PURCHASE_CANCELLED` or `PURCHASE_FAILED` event listener.

	/**
	 * After a request to purchaseItem(), a PURCHASE_SUCCEEDED event is dispatched. 
	 *  Its data will contain a hash map with the key 'purchase', which contains
	 *  the details of the purchased item, like so (note that this event
	 *  can also be 'replayed' during the restore process if the user gets a new phone, etc):
	 * 
	 * {
	 * 	"purchase":
	 * 	{
	 * 		"productId":"myproductid",
	 * 		"transactionId":"abc123456",
	 * 		"receipt":"[RAW RECEIPT DATA]
	 * 	}
	 * }	 
	 * 
	 */
	purchase.addEventListener(purchase.PURCHASE_SUCCEEDED, function(e){
		
		Ti.API.info("PURCHASE_SUCCEEDED for "+e.purchase.productId);
		
	});	
	
	/**
	 * If an error occurs with the purchase, PURCHASE_FAILED is dispatched instead.
	 * 
	 */
	purchase.addEventListener(purchase.PURCHASE_FAILED, function(e){
		Ti.API.info("PURCHASE_FAILED: "+e.message+" for "+e.productId);
	});

	/**
	 * If a purchase is cancelled, PURCHASE_CANCELLED is dispatched instead.
	 * 
	 */
	purchase.addEventListener(purchase.PURCHASE_CANCELLED, function(e){
		Ti.API.info("PURCHASE_CANCELLED for "+e.productId);
	});

### Restore Transactions ###

For apps that allow the purchase of non-consumable goods, Apple requires that you include a button in your UI to Restore Transactions.  This is useful for customers who purchase in-app products in your app, then reinstall it on a new device, and need to restore their old purchases:

	purchase.restoreTransactions();

 By triggering the `restoreTransactions()` method, any `PURCHASE_SUCCEEDED` events for previously purchased non-consumable items will be "replayed"- and your listeners should respond accordingly by granting the items to the user.

When there are no previous `PURCHASE_SUCCEEDED` events left to be replayed, `TRANSACTIONS_RESTORED` will be dispatched, indicating the process or complete.  (Or `TRANSACTION_RESTORE_FAILED`, if something goes wrong):

	/**
	 * After a request to restoreTransactions(), PURCHASE_SUCCEEDED will be 'replayed' for any
	 * managed items the user previously purchased on this account.  You can handle these
	 * appropriately in your PURCHASE_SUCCEEDED event.
	 * 
	 * When there are no more product purchases to 'replay', TRANSACTIONS_RESTORED will
	 * be dispatched.
	 * */
	purchase.addEventListener(purchase.TRANSACTIONS_RESTORED,function(e){
		
		Ti.API.info("Transactions were restored!");

	});	
	/**
	 * If an error occurs with the restore request, TRANSACTION_RESTORE_FAILED is dispatched instead.
	 * 
	 */
	purchase.addEventListener(purchase.TRANSACTION_RESTORE_FAILED,function(e){
		Ti.API.info("Restore Failed: "+e.message);
	});

### Manually Verifying Store Receipts ###

The `purchase.receipt` property a `PURCHASE_SUCCEEDED` event may be used to verify Apple Store Receipts from your own server, as described [here](http://developer.apple.com/library/ios/#documentation/NetworkingInternet/Conceptual/StoreKitGuide/VerifyingStoreReceipts/VerifyingStoreReceipts.html).

By default, the module will automatically close all transactions once they have completed.  For apps with a simple client-side model for unlocking content, this is usually simpler.

However, if your app is delivering content from the server side after verifying receipts remotely, you can switch to manual transaction mode with the `setManualTransactionMode` method:

	purchase.setManualTransactionMode(true);

Once you do so, **you become responsible** for 'finishing' each and every purchase transaction after the content has been delivered by your server, by passing the transactionId (retrieved from `purchase.transactionId` in a `PURCHASE_SUCCEEDED` event) to `manualFinishTransaction()`:

	purchase.manualFinishTransaction(transactionIdOfDeliveredPurchase);

If you enable Manual Transaction Mode, but fail to call `manualFinishTransaction` for a completed purchase, iOS will attempt to redispatch the `PURCHASE_SUCCEEDED` event on the next load until you mark the transaction complete.

----------------------------------
This Lanica sample code is licensed under the provisions also known as the MIT License, as shown:

[http://lanica.co/company/legal/license-for-sample-code/](http://lanica.co/company/legal/license-for-sample-code/)

Copyright © 2013 Lanica Inc. All Rights Reserved.