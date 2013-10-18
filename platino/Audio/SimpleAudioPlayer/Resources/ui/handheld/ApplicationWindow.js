var almixerproxy = require('co.lanica.almixer');
var ALmixer      = co_lanica_almixer;
var ALmixer_Initialized = false;

var SUPPORTED_AUDIO_FORMAT = {
	wav:true,
	aac:true,
	m4a:true,
	mp3:true,
	mp4:true,
	ogg:true
};

var getExtention = function(str) {
	var idx = str.lastIndexOf(".");
	if (idx > 0) {
		return str.substring(idx+1);
	} else {
		return str;
	}
};

//Application Window Component Constructor
function ApplicationWindow() {
	var currentPlayingAudioData = null;

	//create component instance
	var self = Ti.UI.createWindow({
		backgroundColor:'#fff'
	});
		
	//construct UI
	var view = Ti.UI.createView({layout:'vertical', top:20, width:Ti.UI.FILL, height:Ti.UI.FILL});
	var headerLabel = Ti.UI.createLabel({text:'Audio Player', color:'#000'});
	var tableRows = [];

	var files = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory).getDirectoryListing();
	for (var i = 0; i < files.length; i++) {
		if (SUPPORTED_AUDIO_FORMAT[getExtention(files[i])]) {
			tableRows.push({title:files[i]});
		}
	}

	var tableView = Ti.UI.createTableView({data:tableRows});

	tableView.addEventListener('click', function(e) {
		if (currentPlayingAudioData !== null) {
			ALmixer.HaltChannel(0);
			currentPlayingAudioData = null;
		}
		if (Ti.Platform.osname == 'android') {
			currentPlayingAudioData = ALmixer.LoadAll("Resources/" + e.source.title, 0);
			Ti.API.info("Loading file: '" + e.source.title + "' " + ALmixer.GetError());
		} else {
			var resource = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, e.source.title);
			currentPlayingAudioData = ALmixer.LoadAll(resource.resolve(), 0);
			Ti.API.info("Loading file: '" + resource.resolve() + "' " + ALmixer.GetError());
		}
		if (currentPlayingAudioData !== null) {
			var res = ALmixer.PlayChannelTimed(0, currentPlayingAudioData, 0, -1);
			if (res < 0) {
				alert("ALmixer.PlayChannel failed for " + e.source.title + " [" + res + "]\n" + ALmixer.GetError());
			}
		}
	});

	view.add(headerLabel);
	view.add(tableView);

	self.add(view);

    self.addEventListener('android:back', function(){
		self.close();
    });
    self.addEventListener('close', function(){
		if (currentPlayingAudioData !== null) {
			ALmixer.HaltChannel(0);
			currentPlayingAudioData = null;
		}
		ALmixer.Quit();
    });

	if (!ALmixer_Initialized && !ALmixer.Init(0, 0, 0)) {
		alert("ALmixer.Init failed!");
	} else {
		ALmixer_Initialized = true;
	}

	return self;
}

//make constructor function the public component interface
module.exports = ApplicationWindow;
