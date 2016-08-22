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

        var oData = data;

		// cache data
        /*
		var arrItemsCollection = data.data,
			iGalleryLength = arrItemsCollection.length; //console.log(data.thumbnails.visible + ' show thumbnails');
        */
		// cache all settings
        /*
		var bAutoplay = data.autoplay,
			bCaptions = data.captions,
			sId = data.id,
			sThumbnails = data.thumbnails.visible != undefined ? data.thumbnails.visible : 'never', 
			iThumbnailsClusterSize = data.thumbnails.cluster,
			iAnimationHoldTime = data.animation.holdTime,
			iAnimationTransitionTime = data.animation.holdTime,
			bOptimizationEnabled = data.optimization.enable,
			bOptimizationAspectRatio,
			sOptimizationQueryString,
			oTrackRenderingValues;
            */

        var sID = oData.id,
            bAutoplay = oData.autoplay,
            oAnimation = oData.animation,
            bCaptions = oData.captions,
            oControls = oData.controls,
            sPlaceholderPath = oData.placeholderPath,
            bSwipe = oData.swipe,
            oThumbnails = oData.thumbnails,
            oViewer = oData.viewer,
            oGalleryItems = oData.data;
        var iGalleryLength = oGalleryItems.length;
        var arrVideos = new Array();
        var sViewerItems = '';
        var sThumbnailsItems = '';
        var oTrackRenderingValues;

        //process data
        for(var i=0; i<iGalleryLength; i++) {
            var oItemData = oGalleryItems[i];
            var sViewType = oItemData.videoID != null ? 'video' : 'image';

            if(sViewType && sViewType == 'image') {

                //generate viewer item
                var oViewerSettings = {
                    viewer: oViewer,
                    placeholderPath: sPlaceholderPath, 
                    captions: bCaptions
                };
                sViewerItems += _buildImageItem(oItemData, oViewerSettings);

                //generate thumbnail item
                if(oThumbnails.visible == 'always' || oThumbnails.visible == 'desktop') {
                    var oThumbnailsSettings = {
                        thumbnails: oThumbnails,
                        placeholderPath: sPlaceholderPath,
                        queryString: oViewer.optimizationQueryString
                    };
                    sThumbnailsItems += _buildImageThumbnail(oItemData, oThumbnailsSettings);
                }
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

        var sThumbnails = oThumbnails.visible;
        if(sThumbnails == 'always' || sThumbnails == 'desktop') {
            var iThumbnailsClusterSize = oThumbnails.clusterSize;
            oTrackRenderingValues = _calculateRenderingValues(iGalleryLength, iThumbnailsClusterSize);

            sGalleryThumbnails = '<div class="thumbnails items-'+oTrackRenderingValues.ItemsPerCluster.toString()+'"><div class="track"><ul class="list-inline clearfix">'+sThumbnailsItems+'</ul></div></div>';

            //console.log(sGalleryThumbnails);
        }
        sGalleryControls = '<div class="controls"><button type="button" class="prev">prev</button><button type="button" class="next">next</button></div>';

        sGallery = sGalleryViewer + sGalleryThumbnails + sGalleryControls;

        return sGallery;

        /*
		if(bOptimizationEnabled) {
			bOptimizationAspectRatio = data.optimization.constrain || null;
			sOptimizationQueryString = data.optimization.queryString || null;
		}
			
        var arrVideos = new Array();
        var sViewerItems = '';
        var sThumbnailsItems = '';

        for(var i=0; i<iGalleryLength; i++) {
            var oItemData = arrItemsCollection[i];
            var sViewType = oItemData.videoID != null ? 'video' : 'image';

            if(sViewType && sViewType == 'image') {

                var oSettings = {
                    aspectRatio: bOptimizationAspectRatio,
                    queryString: sOptimizationQueryString
                }

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

            //console.log(sGalleryThumbnails);
        }

        sGalleryControls = '<div class="controls"><button type="button" class="prev">prev</button><button type="button" class="next">next</button></div>';

        sGallery = sGalleryViewer + sGalleryThumbnails + sGalleryControls;
        //console.log(sGallery);

        return sGallery;
        */


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

    var _buildImageItem = function(oData, oSettings) {
        /*
        var oItemData = oData;
        var sItemCaption = bUseCaptions ? '<figcaption>'+oItemData.caption+'</figcaption>' : '';
        var sItemMarkup =  '<li>'+
                                '<figure class="gallery-item">'+ 
                                    '<img src="'+oItemData.imageUrl+'" class="img-responsive" alt="'+oItemData.alt+'"/>'+sItemCaption+'</figure></li>';
        sItemMarkup = '<li>'+
                            '<figure class="gallery-item" style="background-image:url('+oItemData.imageUrl+')">'+
                                '<img src="content/img/img16-9.png" class="img-responsive" alt="'+oItemData.alt+'" style="visibility:hidden"/>'+sItemCaption+
                            '</figure>'+
                        '</li>';
        sItemMarkup = '<li>'+
                            '<figure class="gallery-item">'+
                                '<img src="content/img/img16-9.png" class="img-responsive" alt="'+oItemData.alt+'" style="visibility:visible; background-image:url('+oItemData.imageUrl+')"/>'+sItemCaption+
                            '</figure>'+
                        '</li>'
        */

        var oItemData = oData;
        var oOptions = oSettings;
        var sAspectRatio = oOptions.viewer.aspectRatio,
            sCaptions = oOptions.captions,
            sPlaceholderImagePath = oOptions.placeholderPath,
            sQueryString = oOptions.viewer.optimizationQueryString,
            sImageURL = oItemData.imageUrl,
            sImageAlt = oItemData.alt;
            sItemMarkup = '';

        var sItemCaption = sCaptions ? '<figcaption>'+oItemData.caption+'</figcaption>' : '';

        if(sQueryString && sQueryString.length > 0) {
            sImageURL += sQueryString;
            sItemMarkup =   '<li>'+
                                '<figure class="gallery-item">'+
                                    '<img src="'+sImageURL+'" class="img-responsive" alt="'+sImageAlt+'" />'+sItemCaption+
                                '</figure>'+
                            '</li>';
        } else {
            var sPlaceholderImagePath = sPlaceholderImagePath + sAspectRatio + '.png'
            sItemMarkup =   '<li>'+
                                '<figure class="gallery-item">'+
                                    '<img src="'+sPlaceholderImagePath+'" class="img-responsive optimize-aspect" alt="'+sImageAlt+'" style="background-image:url('+sImageURL+')"/>'+sItemCaption+
                                '</figure>'+
                            '</li>';
        }

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

    var _buildImageThumbnail = function (oData, oSettings) {
        /*
        var oItemData = oData;
        var sItemMarkup =  '<li>' +
                                '<figure class="thumbnail">' +
                                    '<img src="'+oItemData.imageUrl+'" class="img-responsive" alt="'+oItemData.alt+'" />' +
                                '</figure></li>';

        // if aspect ratio is 16-9
        sItemMarkup =  '<li>' +
                                '<figure class="thumbnail">' +
                                    '<img src="content/img/img16-9.png" class="img-responsive" alt="'+oItemData.alt+'" style="visibility:visible; background-image:url('+oItemData.imageUrl+')" />' +
                                '</figure></li>';
        return sItemMarkup;
        */
        var oItemData = oData;
        var oOptions = oSettings;
        var sAspectRatio = oOptions.thumbnails.aspectRatio,
            sPlaceholderImagePath = oOptions.placeholderPath,
            sQueryString = oOptions.queryString,
            sImageURL = oItemData.imageUrl,
            sImageAlt = oItemData.alt;
            sItemMarkup = '';

        //var sItemCaption = sCaptions ? '<figcaption>'+oItemData.caption+'</figcaption>' : '';

        if(sQueryString && sQueryString.length > 0) {
            sImageURL += sQueryString;
            sItemMarkup =   '<li>'+
                                '<figure class="thumbnail">'+
                                    '<img src="'+sImageURL+'" class="img-responsive" alt="'+sImageAlt+'" />'+
                                '</figure>'+
                            '</li>';
        } else {
            var sPlaceholderImagePath = sPlaceholderImagePath + sAspectRatio + '.png'
            sItemMarkup =   '<li>'+
                                '<figure class="gallery-item">'+
                                    '<img src="'+sPlaceholderImagePath+'" class="img-responsive optimize-aspect" alt="'+sImageAlt+'" style="background-image:url('+sImageURL+')"/>'+ //sItemCaption+
                                '</figure>'+
                            '</li>';
        }

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

        // if aspect ratio is 16-9
        sItemMarkup =  '<li>' +
                                '<figure class="thumbnail">' +
                                    '<img src="content/img/img16-9.png" class="img-responsive" alt="'+oItemData.alt+'" style="visibility:visible; background-image:url('+sYTVideoThumbnailURL+')" />' +
                                '</figure></li>';
        return sItemMarkup;
    };

})(this);