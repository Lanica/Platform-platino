//
// Definitions
//
	
/** Google Purchase Public Key - from the Google Play developer site. */
var GOOGLE_PUBLIC_KEY='PUT_YOUR_KEY_HERE!';

/** The ID Of the test item */
var TEST_ITEM_ID="android.test.purchased";
	
/** The ID of the 'unavailable' test item */
var UNAVAILABLE_TEST_ITEM_ID="android.test.item_unavailable";

//
// Variables
//
	
/** Instance of the Google Purchase Plugin. */
var purchase;

/** Log Message Label */
var label;

/** Container for UI elements */
var div;

//
// FirstView Interface
//

/** Create New View */
function FirstView() 
{	
	// import the purchase extension.
	var purchase=require('co.lanica.purchase.google');
	
	// create the UI for this test harness.	
	// see createUI() for examples of each request function.
	var view=createUI(purchase);	

	// start the billing service with your public key.  The BILLING_CONNECTION_READY indicates you can begin using the plugin;
	// BILLING_CONNECTION_FAILED will indicate an error has occurred.
	purchase.startBillingService(GOOGLE_PUBLIC_KEY);
	
	
	// add event listeners for the various google callbacks.
	// requests to Google Purchase are all asynchronous, you should be prepared to handle the event listeners below
	
	
	/**
	 * the BILLING_CONNECTION_READY event means google play service is working and you can start making requests.
	 */
	purchase.addEventListener(purchase.BILLING_CONNECTION_READY, function(e){
		log("Google billing ready!");
		div.visible = true;
	});
	
	/**
	 * The BILLING_CONNECTION_FAILED event indicates an error connecting to the service.
	 */
	purchase.addEventListener(purchase.BILLING_CONNECTION_FAILED,function(e){
		log("Google billing connection failed: " + e.message);
		div.visible = false;
	});
	

	/**
	 * After a request to loadItemDetails(), the ITEM_DETAILS_LOADED event contains detailed info about the available items.
	 * 
	 * The returned data object will contain a hash map called 'skus', where each key maps to the item data like so:
	 * 
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
		log("ITEM_DETAILS_LOADED: "+itemCount+" items: "+itemList);
	});
	
	/**
	 * If the request to load Item Details fails, ITEM_DETAILS_FAILED will be dispatched instead.
	 * 
	 */
	purchase.addEventListener(purchase.ITEM_DETAILS_FAILED,function(e){
	
		var msg = "Item Details failed: " + e.message;
		Ti.API.info(msg);	
		label.text = msg;
	});
	
	
	/**
	 * After a request to loadPlayerInventory(), INVENTORY_LOADED will be dispatched.  Its data will contain a hash map called
	 * purchases, where each key maps to an object with details of each item the player currently 'owns', like so:
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
		var msg = "INVENTORY_LOADED: "+itemCount+" items: "+itemList;
		log(msg);

	});	
	/**
	 * If an error occurs with the inventory request, LOAD_INVENTORY_FAILED is dispatched instead.
	 * 
	 */
	purchase.addEventListener(purchase.LOAD_INVENTORY_FAILED,function(e){
		log("Load Inventory Failed: "+e.message);

	});

	/**
	 * After a request to purchaseItem(), a PURCHASE_SUCCEEDED event is dispatched.  Its data will contain a hash map
	 * with the key 'purchase', which contains the details of the purchased item, like so:
	 * 
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
		log("PURCHASE_SUCCEEDED for "+e.purchase.sku);
	});	
	
	/**
	 * If an error occurs with the purchase, PURCHASE_FAILED is dispatched instead.
	 * 
	 */
	purchase.addEventListener(purchase.PURCHASE_FAILED, function(e){
		log("PURCHASE_FAILED: "+e.message);
	});

	/**
	 * After a request to consumeItem(), CONSUME_SUCCEEDED will be dispatched.  Its data will contain the sku of the consumed item.
	 * 
	 *  {
	 * 		"sku":"android.test.purchased"
	 * 	} 
	 * 
	 */
	purchase.addEventListener(purchase.CONSUME_SUCCEEDED, function(e){
		log("CONSUME_SUCCEEDED for "+e.sku);
	});
	
	/**
	 * If an error occurs consuming the item, CONSUME_FAILED will be dispatched instead.
	 * 
	 */
	purchase.addEventListener(purchase.CONSUME_FAILED, function(e){
		log("CONSUME_FAILED: "+e.message);
	});

	
	return view;
}
	
//
// Implementation
//

/** Creates the Test Harness UI and adds buttons to test the Purchase functions. */
function createUI(purchase)
{
	Ti.API.info("Crreating ui for purchase:"+purchase);
	var self = Ti.UI.createView({
		layout:'vertical'
	});
	
	label = Ti.UI.createLabel({
		backgroundColor:'#EEEEEE',
		color:'#000000',
 	   top: 10,
	   width: 300,
	   height: 100
	});
	self.add(label);
	
	div = Ti.UI.createView({
		layout: 'vertical',
		visible: false
	});
	self.add(div);


	var subscriptionBtn = Titanium.UI.createButton({
	   title: 'Subscriptions Supported?'
	});
	subscriptionBtn.addEventListener('click',function(e){
		
		/**
		 * The areSubscriptionsSupported() function returns true if the device supports subscription purchases.
		 * 
		 */
		var supported = purchase.areSubscriptionsSupported();
		
		log("Subscriptions supported: "+supported);
	});	
	div.add(subscriptionBtn);
	
	var itemDetailsBtn = Ti.UI.createButton({
	   title: 'Load Item Details'
	});
	itemDetailsBtn.addEventListener('click', function(e){		
		var itemSkus=[TEST_ITEM_ID,UNAVAILABLE_TEST_ITEM_ID];
		log("Loading item details for "+itemSkus.join(","));
		
		/**
		 * loadItemDetails() takes an array of itemSkus, and dispatches the ITEM_DETAILS_LOADED callback with info about them.
		 * 
		 */
		purchase.loadItemDetails(itemSkus);
	});
	div.add(itemDetailsBtn);

	var playerInventoryBtn = Ti.UI.createButton({
		title: 'Load Player Inventory'
	});
	playerInventoryBtn.addEventListener('click',function(e){
		log('Loading Player Inventory...');
		
		/**
		 * loadPlayerInventory() loads a list of items the player currently 'owns'.  Set the first parameter to true
		 * if you'd also like to load the item details (price, description, etc).
		 * 
		 * The optional second parameter is a string array of skus for which you'd like to load additional details.
		 * 
		 */
		purchase.loadPlayerInventory(true, []);
	});
	div.add(playerInventoryBtn);


	var purchaseBtn = Ti.UI.createButton({
		title: 'Purchase Item'
	});
	purchaseBtn.addEventListener('click', function(e){
		log("Purchase Item '"+TEST_ITEM_ID+"...");
		
		/**
		 * use purchaseItem() to start the transaction to buy a particular item.
		 * The first parameter is the item's sku.'
		 * the second parameter is the item type (IN_APP_PURCHASE, or SUBSCRIPTION.)
		 * the third parameter is an optional payload to associate with this purchase.  you may wish to use this for 
		 * tracking the purchase flow of this item, back-end tracking, etc.
		 * 
		 */
		purchase.purchaseItem(TEST_ITEM_ID, purchase.IN_APP_PURCHASE, '');
		
	});
	div.add(purchaseBtn);

	var consumableBtn = Titanium.UI.createButton({
	   title: 'Consume Item'
	});
	consumableBtn.addEventListener('click',function(e){
		log("Consuming item "+TEST_ITEM_ID+"...");
		
		/**
		 * Use the consumeItem() function on an item Sku to 'consume' it- this will remove the item from the inventory, allowing for it to be purchased again.
		 */
		purchase.consumeItem(TEST_ITEM_ID);
	});	
	div.add(consumableBtn);

	var loggingBtn = Ti.UI.createButton({
		title: 'Enable Logging'
	});
	
	loggingBtn.addEventListener('click', function(e){
		
		/**
		 * the setLoggingEnabled() function allows you to turn additional android logcat debugging on or off for the plugin.
		 * 
		 */
		purchase.setLoggingEnabled(true);
		log("Plugin android logging is ON.");
	});
	div.add(loggingBtn);

	var noLoggingBtn = Ti.UI.createButton({
		title: 'Disable Logging'
	});
	noLoggingBtn.addEventListener('click', function(e){
		purchase.setLoggingEnabled(false);
		log("Plugin android logging is OFF.");
	});
	div.add(noLoggingBtn);
	
	return self;
}

/** Displays a log message */
function log(msg)
{
	Ti.API.info("[GPEx] "+msg);
	label.text=msg;
}



module.exports = FirstView;
