self.addEventListener('message', function(e) {
	var sData = e.data;
	console.log('sData: '+ sData);

	var arrData = sData.split(',');
	var iDataLength = arrData.length;

	for(var i = 0; i<iDataLength; i++) {
		var sItem = arrData[i];
		console.log('sItem: '+ sItem);
	}

	console.log('data logged in console');
	self.postMessage(JSON.stringify(arrData));

}, false);