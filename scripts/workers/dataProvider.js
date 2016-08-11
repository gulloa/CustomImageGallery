(function(self){
	self.addEventListener('message', function(e) {
		var sDummyJSON = e.data;
		var objDummyJSON = JSON.parse(sDummyJSON);
		// console.log('objDummyJSON:');
		// console.log(objDummyJSON);

		var arrResult = new Array();
		var iDataLength = objDummyJSON.length;

		for(var i = 0; i < iDataLength; i++) {
			arrResult.push(objDummyJSON[i].ContenidoPopup);
			console.log('item at index '+ i +':');
			console.log(objDummyJSON[i].ContenidoPopup);
		}
		// console.log('arrResult:');
		// console.log(arrResult);

		var sJSONResult = JSON.stringify(arrResult);
		self.postMessage(sJSONResult);
	}, false);
})(this);
// console.log('this:');
// console.log(this);