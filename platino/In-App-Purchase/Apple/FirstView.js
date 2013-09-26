
//
// Definitions
//

/** Product ID for test purchase */
var TEST_PRODUCT_ID="my_lanica_levelpack";

/** Product id for test consumable purchase */
var TEST_CONSUMABLE_ID="my_lanica_spell";
	
//
// Variables
//
	
/** Instance of the Apple Purchase Plugin. */
var purchase;

/** Log Message Label */
var label;

/** Container for UI elements */
var div;

/** Track number of restored items in session */
var restoreCount=0;
var isRestoring=false;

//
// FirstView Interface
//

/** Create New View */
function FirstView() 
{	
	// import the purchase extension.
	var purchase=require('co.lanica.purchase.apple');
	
	// create the UI for this test harness.	
	// see createUI() for examples of each request function.
	var view=createUI(purchase);	
	
	log("Starting PurchaseHarness...");
	purchase.initialize();
	
	if(purchase.isStoreKitAvailable())
	{
		log("Ready.");
		div.visible=true;
	}
	else
	{
		log("Current device does not support store.");
		return view;
	}
	
	


	// add event listeners for the various storekit callbacks.
	// requests are all asynchronous, you should be prepared to handle the event listeners below
	

	/**
	 * After a request to loadProductDetails(), the PRODUCT_DETAILS_LOADED event contains detailed info about the available items.
	 * 
	 * The returned data object will contain a hash map called 'products', where each key maps to the item data,
	 * and an array of any invalid products requested, like so:
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
		log("details processing..");
		var itemCount = 0;
		var itemList = "";
		for (var k in e.products)
		{
			itemCount++;
			var nextItem=e.products[k];
			itemList+="["+nextItem.title+":"+nextItem.displayPrice+"]";
		}
		log("PRODUCT_DETAILS_LOADED: "+itemCount+" items: "+itemList+", invalid:"+e.invalidIds.join(","));
	});
	
	/**
	 * If the request to load Product Details fails, PRODUCT_DETAILS_FAILED will be dispatched instead.
	 * 
	 */
	purchase.addEventListener(purchase.PRODUCT_DETAILS_FAILED,function(e){
	
		var msg = "Product Details failed: " + e.message;
		log(msg);
	});
	

	/**
	 * After a request to purchaseItem(), a PURCHASE_SUCCEEDED event is dispatched.  Its data will contain a hash map
	 * with the key 'purchase', which contains the details of the purchased item, like so (note that this event
	 * 	can also be 'replayed' during the restore process if the user gets a new phone, etc):
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
		
		log("PURCHASE_SUCCEEDED for "+e.purchase.productId);
		
		if(isRestoring) restoreCount++;
		
	});	
	
	/**
	 * If an error occurs with the purchase, PURCHASE_FAILED is dispatched instead.
	 * 
	 */
	purchase.addEventListener(purchase.PURCHASE_FAILED, function(e){
		log("PURCHASE_FAILED: "+e.message+" for "+e.productId);
	});

	/**
	 * If a purchase is cancelled, PURCHASE_CANCELLED is dispatched instead.
	 * 
	 */
	purchase.addEventListener(purchase.PURCHASE_CANCELLED, function(e){
		log("PURCHASE_CANCELLED for "+e.productId);
	});
	
	
	/**
	 * After a request to restoreTransactions(), PURCHASE_SUCCEEDED will be 'replayed' for any
	 * managed items the user previously purchased on this account.  You can handle these
	 * appropriately in your PURCHASE_SUCCEEDED event.
	 * 
	 * When there are no more product purchases to 'replay', TRANSACTIONS_RESTORED will
	 * be dispatched.
	 * */
	purchase.addEventListener(purchase.TRANSACTIONS_RESTORED,function(e){
		
		log("Transactions were restored! ("+restoreCount+")");
		isRestoring=false;

	});	
	/**
	 * If an error occurs with the restore request, TRANSACTION_RESTORE_FAILED is dispatched instead.
	 * 
	 */
	purchase.addEventListener(purchase.TRANSACTION_RESTORE_FAILED,function(e){
		log("Restore Failed: "+e.message);
		isRestoring=false;

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


	var productDetailsBtn = Ti.UI.createButton({
	   title: 'Load Product Details'
	});
	productDetailsBtn.addEventListener('click', function(e){		
		var itemIds=[TEST_PRODUCT_ID,TEST_CONSUMABLE_ID,"my_madeup_id"];
		log("Loading product details for "+itemIds.join(","));
		
		/**
		 * loadProductDetails() takes an array of product ids, and dispatches the PRODUCT_DETAILS_LOADED callback with info about them.
		 * 
		 */
		purchase.loadProductDetails(itemIds);
	});
	div.add(productDetailsBtn);

	var restoreBtn = Ti.UI.createButton({
		title: 'Restore Transactions'
	});
	restoreBtn.addEventListener('click',function(e){
		log('Restoring transactions...');
		
		/**
		 * restoreTransactions() 'replays' any old PURCHASE_SUCCEEDEDED events for items this user had previously purchased
		 * that are managed (non-consumable.)  This is useful for when someone gets a new phone and reintsalls the app.
		 * */
		isRestoring=true;
		restoreCount=0;
		purchase.restoreTransactions();
	});
	div.add(restoreBtn);


	var purchaseBtn = Ti.UI.createButton({
		title: 'Purchase Managed Product'
	});
	purchaseBtn.addEventListener('click', function(e){
		log("Purchase Product '"+TEST_PRODUCT_ID+"...");
		
		/**
		 * purchasesProduct() starts the purchase process for the given ID, and will result in a PURCHASE_SUCCEEDED,
		 * PURCHASE_FAILED, or PURCHASE_CANCELLED event depending on the result.
		 * 
		 * (Optionally, you can purchase in quantity by passing a second param, the quantity:)
		 * purchase.purchaseProduct("jellybeans",15);
		 * 
		 */
		purchase.purchaseProduct(TEST_PRODUCT_ID);
		
	});
	div.add(purchaseBtn);

	var consumableBtn = Ti.UI.createButton({
		title: 'Purchase Consumable Product'
	});
	consumableBtn.addEventListener('click', function(e){
		log("Purchase Consumable '"+TEST_CONSUMABLE_ID+"...");
		
		/**
		 * purchasesProduct() starts the purchase process for the given ID, and will result in a PURCHASE_SUCCEEDED,
		 * PURCHASE_FAILED, or PURCHASE_CANCELLED event depending on the result.
		 * 
		 * (Optionally, you can purchase in quantity by passing a second param, the quantity:)
		 * purchase.purchaseProduct("jellybeans",2);
		 * 
		 */
		purchase.purchaseProduct(TEST_CONSUMABLE_ID,2);
		
	});
	div.add(consumableBtn);
	
	return self;
}

/** Displays a log message */
function log(msg)
{
	Ti.API.info("[APEx] "+msg);
	label.text=msg;
}

module.exports=FirstView;



