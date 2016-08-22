(function(self){
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
    var _createGalleryTrackCode = function(q,v) {};
    var _createGallerySlidesCode = function(oData, bUseCaptions, oRenderingProperties) {
        var arrItemsCollection = oData;
        var bUseCaptions = bUseCaptions;
        var oRenderingProperties = oRenderingProperties;
        var iDataLength = arrItemsCollection.length;
        var sResult = '';

        for(var i=0; i<iDataLength; i++) {
            var oItemData = arrItemsCollection[i];
            var sViewType = oItemData.viewtype;
            var sItemMarkup = '';
            // if viewtype is image, request an inner service to render as image item. Pass captions and  data
            // if viewtype is vide, request an inner services to render as ytvideo item. Pass data   
            if(sViewType && sViewType == 'image') {
                sItemMarkup = _buildImageItem(bUseCaptions, oItemData);
            }
            if(sViewType && sViewType == 'video') {
                sItemMarkup = _buildVideoItem(bUseCaptions, oItemData);
            }
        }
    };
    var _buildImageItem = function() {};
    var _buildVideoItem = function() {};

    var _createSlideItems = function() {};
    var _concatFullTrackMarkup = function() {};
    var _wrapIntoViewer = function() {};

    self.addEventListener('message', function(e) {
        var oData = JSON.parse(e.data);
        var oConfig = oData.settings;
        var sImages = oData.data;
        console.log('PRE-RENDERING');
        console.log('oConfig: ');
        console.log(oConfig);
        // console.log('sImages length: ' + sImages.length);
        // console.log('sImages');
        // console.log(sImages);

        
        var arrData = JSON.parse(sImages);
        console.log('arrData: ');
        console.log(arrData);

        //take a look to configuration and find out what the developer needs to be rendered
        // first, lets see how much items we will have to pre-render
        var oRenderingProperties = _calculateRenderingValues(arrData.length, 1);
        console.log('oRenderingProperties: ');
        console.log(oRenderingProperties);

        //pre-render items
        _createGallerySlidesCode(arrData, oConfig.captions, oRenderingProperties);
        


        return;

        var arrData = sData.split(',');
        var iDataLength = arrData.length;

        for(var i = 0; i<iDataLength; i++) {
            var sItem = arrData[i];
            console.log('sItem: '+ sItem);
        }

        console.log('data logged in console');
        self.postMessage(JSON.stringify(arrData));

    }, false);
})(this);