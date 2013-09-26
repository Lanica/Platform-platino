/** FirstView */
function FirstView() {

	//
	// Construct Harness UI
	//
	
	var self = Ti.UI.createView({
		layout:'vertical'
	});
	
	var label = Ti.UI.createLabel({
		backgroundColor:'#EEEEEE',
		color:'#000000',
 	   top: 10,
	   width: 300,
	   height: 100
	});
	self.add(label);
	
	var loadItemBtn;
	var nonConsumableBtn;
	var consumableBtn;
	var subscriptionBtn;
	var restoreBtn;
	
	//
	// Initialize Plugin
	//
	
	// create the plugin reference, and call initialize() to start.
	var purchase = require("co.lanica.purchase.amazon");
	purchase.initialize();
	
	//
	// Handle Async Events
	//
	
	/** 
	 * after calling initialize(), the SDK_AVAILABLE event will be dispatched.
	 * Once you receive this callback, the plugin has connected with amazon
	 * and is ready to accept requests.
	 *
	 * The event object's property sandboxMode is a bool, indicating whether
	 * you are currently running in the amazon sdk sandbox (tester).
	*/
	purchase.addEventListener(purchase.SDK_AVAILABLE, function(e){
		var msg = "AWS SDK ready, sandbox mode: " + e.sandboxMode;
		Ti.API.info(msg);	
		label.text = msg;
		loadItemBtn.visible = true;
		nonConsumableBtn.visible = true;
		consumableBtn.visible = true;
		subscriptionBtn.visible = true;
		restoreBtn.visible = true;
	});
	
	/** 
	 * After initialization, PURCHASES_UPDATED may be dispatched after a call to restoreTransactions().
	 * PURCHASES_UPDATED may also be triggered at any time after initialization by changes on the backend
	 * (such as the user making a purchase on another kindle they own, or logging in as a new kindle user.)
	 * 
	 * You should be prepared to update your app's purchase state in this listener.
	 *
	 * If something goes wrong with an update, PURCHASE_UPDATE_FAILED may be dispatched instead.
	 
	 * In the success case, the callback object will look like this:
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
		var msg = "PURCHASES_UPDATED: "+e.receipts.length+" receipts";
		Ti.API.info(msg);
		label.text = msg;
	});
	purchase.addEventListener(purchase.PURCHASES_UPDATE_FAILED, function(e){
		var msg = "PURCHASES_UPDATE_FAILED: "+e.message;
		Ti.API.info(msg);
		label.text = msg;
	});
	
	/** 
	 * A call to loadItemData(["firstsku","secondsku"]) allows you to load metadata about items you have available for purchase.
	 * 
	 * If successful, the ITEM_DATA_LOADED callback will be dispatched, with the following object format:
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
	 *  If something goes wrong, ITEM_DATA_FAILED will be dispatched.
	 *  
	 */
	purchase.addEventListener(purchase.ITEM_DATA_LOADED, function(e){
		var items = e.items;
		var itemList = "";
		for (var p in items)
		{
			itemList+=items[p].sku+",";
		}
		var msg = "item data loaded: "+itemList;
		Ti.API.info(msg);
		label.text = msg;
	});
	purchase.addEventListener(purchase.ITEM_DATA_FAILED, function(e){
		var msg = "ITEM_DATA_FAILED: "+e.message;
		Ti.API.info(msg);
		label.text = msg;
	});	

	/**
	 * To initiate a purchase, use purchaseItem("itemsku")
	 * 
	 * If successful, the PURCHASE_SUCCEEDED callback will be triggered, with data for the items receipt as follows:
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
	 * Otherwise, the PURCHASE_FAILED error callback will be dispatched.
	 * 
	 */
	purchase.addEventListener(purchase.PURCHASE_FAILED, function(e){
		var msg = "PURCHASE_FAILED: "+e.message;
		Ti.API.info(msg);
		label.text = msg;
	});
	purchase.addEventListener(purchase.PURCHASE_SUCCEEDED, function(e){
		var msg = "PURCHASE_SUCCEEDED: "+e.receipt.sku;
		Ti.API.info(msg);
		label.text = msg;
	});
	
	//
	// Add Buttons for testing all Module Methods
	//

	/** Load Item Data - the three items listed here correspond to the example tester json */
	loadItemBtn = Titanium.UI.createButton({
	   title: 'Load Item Data',
	   visible: false
	});
	loadItemBtn.addEventListener('click',function(e){
		label.text = "Loading item data...";
		var itemIds = ['my_spell','my_levelpack','my_subscription'];
		purchase.loadItemData(itemIds);
	});	
	self.add(loadItemBtn);

	/** Purchase a non-consumable item - the item sku here is marked nonconsumable in the example tester json */
	nonConsumableBtn = Titanium.UI.createButton({
	   title: 'Buy NonConsumable',
	   visible: false
	});
	nonConsumableBtn.addEventListener('click',function(e){
		label.text = "Buying Non-Consumable...";
		purchase.purchaseItem('my_levelpack');
	});	
	self.add(nonConsumableBtn);

	/** Purchase a consumable item - the item sku here is marked as consumable in the example tester json */
	consumableBtn = Titanium.UI.createButton({
	   title: 'Buy Consumable',
	   visible: false
	});
	consumableBtn.addEventListener('click',function(e){
		label.text = "Buying Consumable...";
		purchase.purchaseItem('my_spell');
	});	
	self.add(consumableBtn);

	/** Purchase subscription - the item sku here is marked as a subscription in the example tester json */
	subscriptionBtn = Titanium.UI.createButton({
	   title: 'Buy Subscription',
	   visible: false
	});
	subscriptionBtn.addEventListener('click',function(e){
		label.text = "Buying Subscription...";
		purchase.purchaseItem('my_subscription');
	});	
	self.add(subscriptionBtn);

	/** Restore transactions button- this will explicitly cause PURCHASES_UPDATED to be dispatched */
	restoreBtn = Titanium.UI.createButton({
	   title: 'Restore Purchases',
	   visible: false
	});
	restoreBtn.addEventListener('click',function(e){
		label.text = "Restoring purchases...";
		purchase.restoreTransactions();
	});	
	self.add(restoreBtn);	
	
	return self;
}

module.exports = FirstView;
