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
			
        var arrVideos = new Array();
        var sItemsPreRendered = '';

        for(var i=0; i<iGalleryLength; i++) {
            var oItemData = arrItemsCollection[i];
            var sViewType = oItemData.videoID != null ? 'video' : 'image';
            var sItemMarkup = '';

            if(sViewType && sViewType == 'image') {
                sItemMarkup = _buildImageItem(bCaptions, oItemData);
            }
            if(sViewType && sViewType == 'video') {
                arrVideos.push(oItemData.videoID);
                sItemMarkup = _buildVideoItem(oItemData, arrVideos.length);
            }

            sItemsPreRendered += sItemMarkup;
        }

        var sGalleryTrack, 
            sGalleryViewer =    '<div class="viewer">
                                    <ul class="list-inline clearfix track">'+sItemsPreRendered+'</ul>'
                                '</div>';

        // determine how track will be built (if enabled)
        if(sThumbnails == 'always' || sThumbnails == 'desktop') {
            oTrackRenderingValues = _calculateRenderingValues(iGalleryLength, iThumbnailsClusterSize);

            sGalleryTrack = '<div class="viewer">
                                <ul class="list-inline clearfix track">'+sItemsPreRendered+'</ul>'
                            '</div>';
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

    var _buildImageItem = function(bUseCaptions, oData) {
        var oItemData = oData;
        var sItemCaption = bUseCaptions ? '<figcaption>'+oItemData.caption+'</figcaption>' : '';
        var sItemMarkup =  '<li>
                                <figure class="gallery-item">
                                    <img src="'+oItemData.imageUrl+'" class="img-responsive" alt="'+oItemData.alt+'">'+sItemCaption+' />
                                </figure>
                            </li>';
        return sItemMarkup;
    };

    var _buildVideoItem = function(oData, iAmountOfVideos) {
    	// TO DO
        var oItemData = oData;
        var sYTVideoID = oData.videoID;
        var iVideoNumber = iAmountOfVideos + 1;
        var sItemMarkup =  '<li>
                                <figure class="gallery-item">
                                    <div id="video-'+iVideoNumber+'" data-ytid="'+sYTVideoID+'">
                                        <div class="video-wrapper embed-responsive embed-responsive-16by9"></div>
                                    </div>
                                </figure>
                            </li>';
        return sItemMarkup;
    };

})(this);