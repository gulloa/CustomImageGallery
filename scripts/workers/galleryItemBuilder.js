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

var _calculateRenderingValues = function(q,v) {
    var nQuantityOfElements = q;
    var nQuantityOfElementsVisible = v;
    var nClusters = Math.ceil(q/v);
    var nTrackWidth, nThumnailWidth;

    nThumnailWidth = 100/nQuantityOfElementsVisible;
    nTrackWidth = nThumnailWidth * nQuantityOfElements;

    return {
        ThumbnailWidth: nThumnailWidth,
        TrackWidth: nTrackWidth,
        Clusters: nClusters,
        ItemsPerCluster: nQuantityOfElementsVisible,
        TotalItems: nQuantityOfElements
    }
};

var _createGalleryTrackCode = function(q,v) {

};
var _createGallerySlidesCode = function(q,v) {

};