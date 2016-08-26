(function(self){
	self.addEventListener('message', function(e) {

		// cache settings 
		var oSettings = JSON.parse(e.data);	//console.log('ww_prerender- data:'); console.log(data);

		// concat all
		var sMarkup = _createGallery(oSettings);

		// post result
        self.postMessage(sMarkup);

	}, false);

	var _createGallery = function(data) {

        // cache data
        var oData = data,
            oGalleryItems = oData.data,
            iGalleryLength = oGalleryItems.length;

		// cache all settings
        var sID = oData.id,
            bAutoplay = oData.autoplay,
            oAnimation = oData.animation,
            bCaptions = oData.captions,
            oControls = oData.controls,
            sPlaceholderPath = oData.placeholderPath,
            bSwipe = oData.swipe,
            oThumbnails = oData.thumbnails,
            oViewer = oData.viewer;

        var arrVideos = new Array();
        var sViewerItems = '';
        var sThumbnailsItems = '';
        var oTrackRenderingValues;
        var iVideosCount = 0;

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
                iVideosCount++;

                //generate viewer item
                sViewerItems += _buildVideoItem(oItemData, iVideosCount);

                //generate thumbnail item
                if(oThumbnails.visible == 'always' || oThumbnails.visible == 'desktop') {
                    var oThumbnailsSettings = {
                            galleryID: sID,
                            thumbnails: oThumbnails,
                            placeholderPath: sPlaceholderPath,
                            queryString: oViewer.optimizationQueryString
                    };
                    sThumbnailsItems += _buildVideoThumbnail(oItemData, oThumbnailsSettings);
                }
            }
        }

        var sGalleryControls,
            sGalleryPreloader,
            sGalleryThumbnails, 
            sGalleryViewer =    '<div class="viewer"><ul class="list-inline clearfix track">'+sViewerItems+'</ul></div>';

        var sThumbnails = oThumbnails.visible;

        if(sThumbnails == 'always' || sThumbnails == 'desktop') {
            var iThumbnailsClusterSize = oThumbnails.clusterSize;
            oTrackRenderingValues = _calculateRenderingValues(iGalleryLength, iThumbnailsClusterSize);

            sGalleryThumbnails = '<div class="thumbnails items-'+oTrackRenderingValues.ItemsPerCluster.toString()+'"><div class="track"><ul class="list-inline clearfix">'+sThumbnailsItems+'</ul></div></div>';

            //console.log(sGalleryThumbnails);
        }

        var sNextCustom = '<button type="button" class="prev">Prev</button>';
        var sPrevCustom = '<button type="button" class="next">Next</button>';
        if(oControls.custom) {
            sPrevCustom = oControls.custom.prev;
            sNextCustom = oControls.custom.prev;
        }
        sGalleryControls =  '<div class="controls">'+
                                '<button type="button" class="prev">'+sPrevCustom+'</button>'+
                                '<button type="button" class="next">'+sNextCustom+'</button>'+
                            '</div>';

        sGalleryPreloader = '<div class="layer-load loading-gallery">'+
                                '<div>'+
                                    '<span>'+
                                        '<span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span>'+
                                    '<span>'+
                                    '<span>Cargando...</span>'+
                                '</div>'+
                            '</div>';

        sGallery = sGalleryViewer + sGalleryThumbnails + sGalleryControls;

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

    var _buildImageItem = function(oData, oSettings) {
        var oItemData = oData;
        var oOptions = oSettings;
        var sAspectRatio = oOptions.viewer.aspectRatio,
            sAspectRatioFileString = _getAspectRatioFileString(sAspectRatio),
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
            var sPlaceholderImagePath = sPlaceholderImagePath + sAspectRatioFileString;
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
        var iVideoNumber = iAmountOfVideos;
        var sGalleryID = oData.galleryID;
        var sItemMarkup =  '<li>'+
                                '<figure class="gallery-item">'+
                                        '<div class="video-wrapper embed-responsive embed-responsive-16by9">'+
                                            '<button class="hidden ytp-large-play-button ytp-button" aria-label="Watch Nissan Altima 2017, una mejor compra que una X-Trail"><svg height="100%" version="1.1" viewBox="0 0 68 48" width="100%"><path class="ytp-large-play-button-bg" d="m .66,37.62 c 0,0 .66,4.70 2.70,6.77 2.58,2.71 5.98,2.63 7.49,2.91 5.43,.52 23.10,.68 23.12,.68 .00,-1.3e-5 14.29,-0.02 23.81,-0.71 1.32,-0.15 4.22,-0.17 6.81,-2.89 2.03,-2.07 2.70,-6.77 2.70,-6.77 0,0 .67,-5.52 .67,-11.04 l 0,-5.17 c 0,-5.52 -0.67,-11.04 -0.67,-11.04 0,0 -0.66,-4.70 -2.70,-6.77 C 62.03,.86 59.13,.84 57.80,.69 48.28,0 34.00,0 34.00,0 33.97,0 19.69,0 10.18,.69 8.85,.84 5.95,.86 3.36,3.58 1.32,5.65 .66,10.35 .66,10.35 c 0,0 -0.55,4.50 -0.66,9.45 l 0,8.36 c .10,4.94 .66,9.45 .66,9.45 z" fill="#1f1f1e" fill-opacity="0.81"></path><path d="m 26.96,13.67 18.37,9.62 -18.37,9.55 -0.00,-19.17 z" fill="#fff"></path><path d="M 45.02,23.46 45.32,23.28 26.96,13.67 43.32,24.34 45.02,23.46 z" fill="#ccc"></path></svg></button>'+
                                            '<div id="'+sGalleryID+'-video-'+iVideoNumber+'" data-ytid="'+sYTVideoID+'" class="yt-player"></div>'+
                                        '</div>'+
                                '</figure>'+
                            '</li>';
        return sItemMarkup;
    };

    var _buildImageThumbnail = function (oData, oSettings) {

        var oItemData = oData;
        var oOptions = oSettings;
        var sAspectRatio = oOptions.thumbnails.aspectRatio,
            sAspectRatioFileString = _getAspectRatioFileString(sAspectRatio),
            sPlaceholderImagePath = oOptions.placeholderPath,
            sQueryString = oOptions.queryString,
            sImageURL = oItemData.imageUrl,
            sImageAlt = oItemData.alt,
            sItemMarkup = '';

        var sPlaceholderImagePath = sPlaceholderImagePath + sAspectRatioFileString;
            sItemMarkup =   '<li>'+
                                '<figure class="thumbnail">'+
                                    '<img src="'+sPlaceholderImagePath+'" class="img-responsive optimize-aspect" alt="'+sImageAlt+'" style="visibility:visible; background-image:url('+sImageURL+')"/>'+
                                '</figure>'+
                            '</li>';

        return sItemMarkup;        
    };

    var _buildVideoThumbnail = function (oData, oSettings) {
        var oItemData = oData;
        var oOptions = oSettings;
        var sAspectRatio = oOptions.thumbnails.aspectRatio,
            sAspectRatioFileString = _getAspectRatioFileString(sAspectRatio),
            sPlaceholderImagePath = oOptions.placeholderPath,
            sImageAlt = oItemData.alt,
            sItemMarkup = '';
        
        var sYTVideoID = oItemData.videoID;
        var sYTVideoThumbnailURL = 'http://img.youtube.com/vi/'+sYTVideoID+'/default.jpg' || 'http://img.youtube.com/vi/'+sYTVideoID+'/3.jpg';        
        var sPlaceholderImagePath = sPlaceholderImagePath + sAspectRatioFileString;
            sItemMarkup =   '<li>' +
                                '<figure class="thumbnail">'+
                                    '<img src="'+sPlaceholderImagePath+'" class="img-responsive" alt="'+sImageAlt+'" style="background-image:url('+sYTVideoThumbnailURL+')" />'+
                                '</figure>'+
                            '</li>';

        return sItemMarkup;
    };

    var _getAspectRatioFileString = function(sAspectRatio) {
        var sFileName;

        switch(sAspectRatio) {
            case '21:9':
                sFileName = 'img21-9.png';
                break;
            case '16:9':
                sFileName = 'img16-9.png';
                break;
            case '4:3':
                sFileName = 'img4-3.png';
                break;
            default:
                sFileName = 'img16-9.png';
                break;
        }

        return sFileName;
    };

})(this);