(function(self){
	self.addEventListener('message', function(e) {

		// cache settings 
		var oSettings = JSON.parse(e.data);	//console.log('ww_prerender- data:'); console.log(data);

		// concat all
		var sMarkup = _createGallery(oSettings);

		// post result
		//-self.postMessage(JSON.stringify(sMarkup));
        self.postMessage(sMarkup);

	}, false);

	var _createGallery = function(data) {

		// cache data
		var arrItemsCollection = data.data,
			iGalleryLength = arrItemsCollection.length; console.log(data.thumbnails.visible + ' show thumbnails');

		// cache all settings
		var bAutoplay = data.autoplay,
			bCaptions = data.captions,
			sId = data.id,
			sThumbnails = data.thumbnails.visible != undefined ? data.thumbnails.visible : 'never', 
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
        var sViewerItems = '';
        var sThumbnailsItems = '';

        for(var i=0; i<iGalleryLength; i++) {
            var oItemData = arrItemsCollection[i];
            var sViewType = oItemData.videoID != null ? 'video' : 'image';

            if(sViewType && sViewType == 'image') {

                //generate viewer item
                sViewerItems += _buildImageItem(bCaptions, oItemData);

                //generate thumbnail item
                sThumbnailsItems += _buildImageThumbnail(oItemData);
            }
            if(sViewType && sViewType == 'video') {

                //add video ID to collection
                arrVideos.push(oItemData.videoID);

                //generate viewer item
                sViewerItems += _buildVideoItem(oItemData, arrVideos.length);

                //generate thumbnail item
                sThumbnailsItems += _buildVideoThumbnail(oItemData);
            }
        }

        var sGalleryControls,
            sGalleryThumbnails, 
            sGalleryViewer =    '<div class="viewer"><ul class="list-inline clearfix track">'+sViewerItems+'</ul></div>';

        // determine how track will be built (if enabled)
        if(sThumbnails == 'always' || sThumbnails == 'desktop') {
            oTrackRenderingValues = _calculateRenderingValues(iGalleryLength, iThumbnailsClusterSize);

            sGalleryThumbnails = '<div class="thumbnails items-'+oTrackRenderingValues.ItemsPerCluster.toString()+'"><div class="track"><ul class="list-inline clearfix">'+sThumbnailsItems+'</ul></div></div>';

            console.log(sGalleryThumbnails);
        }

        sGalleryControls = '<div class="controls"><button type="button" class="prev">prev</button><button type="button" class="next">next</button></div>';

        sGallery = sGalleryViewer + sGalleryThumbnails + sGalleryControls;
        //console.log(sGallery);

        return sGallery;
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
        var sItemMarkup =  '<li>'+
                                '<figure class="gallery-item">'+ 
                                    '<img src="'+oItemData.imageUrl+'" class="img-responsive" alt="'+oItemData.alt+'"/>'+sItemCaption+'</figure></li>';
        return sItemMarkup;
    };

    var _buildVideoItem = function(oData, iAmountOfVideos) {
    	// TO DO
        var oItemData = oData;
        var sYTVideoID = oData.videoID;
        var iVideoNumber = iAmountOfVideos + 1;
        var sItemMarkup =  '<li>'+
                                '<figure class="gallery-item">'+
                                    '<div id="video-'+iVideoNumber+'" data-ytid="'+sYTVideoID+'">'+
                                        '<div class="video-wrapper embed-responsive embed-responsive-16by9"></div></div></figure></li>';
        return sItemMarkup;
    };

    var _buildImageThumbnail = function (oData) {
        var oItemData = oData;
        var sItemMarkup =  '<li>' +
                                '<figure class="thumbnail">' +
                                    '<img src="'+oItemData.imageUrl+'" class="img-responsive" alt="'+oItemData.alt+'" />' +
                                '</figure></li>';
        return sItemMarkup;
    };

    var _buildVideoThumbnail = function (oData) {
        var oItemData = oData;
        var sYTVideoID = oItemData.videoID;
        var sYTVideoThumbnailURL = 'http://img.youtube.com/vi/'+sYTVideoID+'/default.jpg' || 'http://img.youtube.com/vi/'+sYTVideoID+'/3.jpg';
        var sItemMarkup =  '<li>' +
                                '<figure class="thumbnail">' +
                                    '<img src="'+sYTVideoThumbnailURL+'" class="img-responsive" alt="'+oItemData.alt+'" />' +
                                '</figure></li>';
        return sItemMarkup;
    };

})(this);