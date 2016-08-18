(function(self){
	self.addEventListener('message', function(e) {

		// cache settings 
		var oSettings = JSON.parse(e.data);	//console.log('ww_prerender- data:'); console.log(data);

		// concat all
		var sMarkup = _createGallery(oSettings);

		// post result
		self.postMessage(JSON.stringify(sMarkup));

	}, false);

	var _createGallery = function(data) {

		// cache data
		var arrItemsCollection = data.data,
			iGalleryLength = arrItemsCollection.length;

		// cache all settings
		var bAutoplay = data.autoplay,
			bCaptions = data.captions,
			sId = data.id,
			sThumbnails = data.thumbnails,
			iThumbnailsClusterSize = data.thumbnails.cluster,
			iAnimationHoldTime = data.animation.holdTime,
			iAnimationTransitionTime = data.animation.holdTime,
			bOptimizationEnabled = data.optimization.enable,
			bOptimizationContrainRatio,
			sOptimizationQueryString,
			oTrackRenderingValues;

		if(bOptimizationEnabled) {
			bOptimizationContrainRatio = data.optimization.constrain;
			sOptimizationQueryString = data.optimization.queryString;
		}
			
		// determine how track will be built
		if(sThumbnails == 'always' || sThumbnails == 'desktop') {
			oTrackRenderingValues = _calculateRenderingValues(iGalleryLength, iThumbnailsClusterSize);
		}		

		// var arrItemsCollection = arrData;
  //       var bUseCaptions = bCaptions;
  //       var oRenderingProperties = oRenderingProperties;
  //       var iDataLength = arrItemsCollection.length;
        var sResult = '';

        for(var i=0; i<iGalleryLength; i++) {
            var oItemData = arrItemsCollection[i];
            var sViewType = oItemData.videoID != null ? 'video' : 'image';
            var sItemMarkup = '';
            // if viewtype is image, request an inner service to render as image item. Pass captions and  data
            // if viewtype is vide, request an inner services to render as ytvideo item. Pass data   
            if(sViewType && sViewType == 'image') {
                sItemMarkup = _buildImageItem(bCaptions, oItemData);
            }
            if(sViewType && sViewType == 'video') {
                sItemMarkup = _buildVideoItem(bCaptions, oItemData);
            }
        }

	};

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

    var _buildImageItem = function() {
    	// TO DO
    };

    var _buildVideoItem = function() {
    	// TO DO
    };

})(this);