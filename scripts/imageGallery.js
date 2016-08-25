var App = window.App || {};  
App.Plugins = window.App.Plugins || {};
App.Plugins = (function(){

    var CustomImageGallery = function(){

        var _oSettings, _sGalleryID, _arrVideosReady, _arrVideos, _webworkersSupported = window.Modernizr ? Modernizr.webworkers : typeof(window.Worker) !== "undefined";
        var _wkDataParser, _wkItemBuilder, _wkPreRender;
        var _iCurrentSlideIndex = 0, _iThumbsClusterSize;


        //helper functions
        var _getIEVersion = function() {
            var sIE11Token = "rv:11.0";
            var sIE10Token = "MSIE 10.0";
            var sUserAgentString = navigator.userAgent;
            var bIsIE11 = sUserAgentString.indexOf(sIE11Token) > -1;
            var bIsIE10 = sUserAgentString.indexOf(sIE10Token) > -1;

            if(bIsIE11) {
                return "11"
            }
            else if(bIsIE10) {
                return "10"
            }
            else {
                return false;
            }
        }
        var _extendJQueryEasing = function () {
            jQuery.extend(jQuery.easing, {
                easeInQuad: function (x, t, b, c, d) {
                    return c * (t /= d) * t + b;
                },
                easeOutQuad: function (x, t, b, c, d) {
                    return -c * (t /= d) * (t - 2) + b;
                },
                easeInOutQuad: function (x, t, b, c, d) {
                    if ((t /= d / 2) < 1) return c / 2 * t * t + b;
                    return -c / 2 * ((--t) * (t - 2) - 1) + b;
                },
                easeInCubic: function (x, t, b, c, d) {
                    return c * (t /= d) * t * t + b;
                },
                easeOutCubic: function (x, t, b, c, d) {
                    return c * ((t = t / d - 1) * t * t + 1) + b;
                },
                easeInOutCubic: function (x, t, b, c, d) {
                    if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
                    return c / 2 * ((t -= 2) * t * t + 2) + b;
                },
                easeInQuart: function (x, t, b, c, d) {
                    return c * (t /= d) * t * t * t + b;
                },
                easeOutQuart: function (x, t, b, c, d) {
                    return -c * ((t = t / d - 1) * t * t * t - 1) + b;
                },
                easeInOutQuart: function (x, t, b, c, d) {
                    if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
                    return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
                },
                easeInQuint: function (x, t, b, c, d) {
                    return c * (t /= d) * t * t * t * t + b;
                },
                easeOutQuint: function (x, t, b, c, d) {
                    return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
                },
                easeInOutQuint: function (x, t, b, c, d) {
                    if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
                    return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
                },
                easeInSine: function (x, t, b, c, d) {
                    return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
                },
                easeOutSine: function (x, t, b, c, d) {
                    return c * Math.sin(t / d * (Math.PI / 2)) + b;
                },
                easeInOutSine: function (x, t, b, c, d) {
                    return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
                },
                easeInExpo: function (x, t, b, c, d) {
                    return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
                },
                easeOutExpo: function (x, t, b, c, d) {
                    return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
                },
                easeInOutExpo: function (x, t, b, c, d) {
                    if (t == 0) return b;
                    if (t == d) return b + c;
                    if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
                    return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
                }
            });
        };

        //exposed methods
        var _nextSlide = function() {
            //-document.getElementById(_sGalleryID).querySelector('.controls .next').click();
            _next();
        };
        var _previousSlide = function() {
            //-document.getElementById(_sGalleryID).querySelector('.controls .prev').click();
            _previous();
        };
        var _slideToIndex = function(iTargetIndex) {
            var iIndex = parseInt(iTargetIndex);
            if(iIndex > 0 && iIndex < window.App.Cache.YTVideos.length) {
                _goToSlide(iIndex);
            }            
        };
        var _pause = function() {};
        var _play = function() {};
        var _togglePlayback = function() {};
        var _preload = function() {};

        //playback controllers 
        var _next = function(event) {
            _slideViewer(event, "next");
            _slideThumbnails(event, "next");
        };
        var _previous = function(event) {
            _slideViewer(event, "prev");
            _slideThumbnails(event, "prev");
        };
        var _goToSlide = function(iTargetIndex) {
            var sJQSelector = '#'+_sGalleryID;
            var jqoTrack= $('.viewer .track', sJQSelector);
            var jqoListItems = $('.viewer ul li', sJQSelector);
            var itemWidth = Math.abs(jqoListItems.width()); 
            var jqoTrack= $('.viewer .track', sJQSelector);
            var iTrackWidth = Math.abs(jqoTrack.width()); 
            var isIE = _getIEVersion();
            var bCSSTransitions = Modernizr.csstransitions;
            var bCSSTransforms = Modernizr.csstransforms;
            var bCSSAnimation = bCSSTransitions && bCSSTransforms; 

            if(bCSSAnimation) {
                _iCurrentSlideIndex = iTargetIndex;
                var iValue = (iTargetIndex * itemWidth);
                var nPercentage = (iValue * 100) / iTrackWidth; 
                var sPosition = iValue == 0 ? 0 : '-' + Math.round(nPercentage);
                var nDuration = 0.6;

                if(!isIE) {
                    _setAnimationProperties(jqoTrack, nDuration, sPosition, true);
                } else {
                    _setAnimationProperties(jqoTrack, nDuration, sPosition, true);
                }
                _iCurrentSlideIndex = iTargetIndex;
                _OnChangeSlide();
            } 
            else {
                _iCurrentSlideIndex = iTargetIndex;
                var iValue = (_iCurrentSlideIndex * 100);
                var sPosition = iValue == 0 ? 0 : '-' + iValue + '%';
                jqoTrack.animate({ left: sPosition }, 600, "easeInOutCubic", function () { 
                    _OnChangeSlide();
                });
            }
        };

        //slide animation
        var _setAnimationProperties = function(jqo, duration, position, usePercentage) {
            var sCSSTransitionDuration, sCSSTransform, sCSSValue, bIsIE, jqoTrack, iDuration, sPosition, bUsePercentage;
            _nTranslateX = position; 

            iDuration = duration;
            sPosition = !usePercentage ? position.toString() + 'px' : position.toString() + '%';
            jqoTrack = jqo;
            bIsIE = _getIEVersion();
            bUsePercentage = usePercentage ? usePercentage : false;
            sCSSTransitionDuration =    '-webkit-transition-duration: ' + iDuration + 's;' + 
                                            '-moz-transition-duration: ' + iDuration + 's;' + 
                                            'transition-duration: ' + iDuration + 's;'; 
            sCSSTransform =     '-webkit-transform: translate(' + sPosition + ',0);' + 
                                    '-moz-transform: translate(' + sPosition + ',0);' + 
                                    'transform: translate(' + sPosition + ',0);'; 
            sCSSValue = sCSSTransitionDuration + sCSSTransform;

            
            if(bIsIE == false) {
                jqoTrack.attr('style', sCSSValue);
            } else {
                sCSSTransitionDuration =    '-ms-transition-duration: ' + iDuration + 's;' + 
                                                'transition-duration: ' + iDuration + 's;';
                sCSSTransform =     '-ms-transform: translate(' + sPosition + ',0);' + 
                                        'transform: translate(' + sPosition + ',0);';
                sCSSValue = sCSSTransitionDuration + sCSSTransform;
                jqoTrack.attr('style', sCSSValue);
            }
        }
        var _slideViewer = function(e, direction) {
            if(e && e.preventDefault)
                e.preventDefault();

            if(e && e.stopPropagation)
                e.stopPropagation();

            var sJQSelector = '#'+_sGalleryID;
            var jqoGalleryItems = $('.viewer .gallery-item', sJQSelector);
            var iGallerySize = jqoGalleryItems.length;
            var iNextIndex = direction == "next" ? parseInt(_iCurrentSlideIndex) + 1 : parseInt(_iCurrentSlideIndex) - 1; 
            var bCanSwipeNextIndex = direction == "next" ? (iNextIndex < iGallerySize) : iNextIndex >= 0; 

            if (bCanSwipeNextIndex) {
                var jqoListItems = $('.viewer ul li', sJQSelector);
                var itemWidth = Math.abs(jqoListItems.width()); 
                var jqoTrack= $('.viewer .track', sJQSelector);
                var iTrackWidth = Math.abs(jqoTrack.width()); 
                var isIE = _getIEVersion();
                var bCSSTransitions = Modernizr.csstransitions;
                var bCSSTransforms = Modernizr.csstransforms;
                var bCSSAnimation = bCSSTransitions && bCSSTransforms; 

                if(bCSSAnimation) {
                    _iCurrentSlideIndex = iNextIndex;
                    var iValue = (parseInt(_iCurrentSlideIndex) * itemWidth);
                    var nPercentage = (iValue * 100) / iTrackWidth; 
                    var sPosition = iValue == 0 ? 0 : '-' + Math.round(nPercentage);
                    var nDuration = 0.6;

                    if(!isIE) {
                        _setAnimationProperties(jqoTrack, nDuration, sPosition, true);
                    } else {
                        _setAnimationProperties(jqoTrack, nDuration, sPosition, true);
                    }
                    if(direction == "next") {_OnNextSlide();}
                    if(direction == "prev") {_OnPrevSlide();}
                    _OnChangeSlide();
                } 
                else {
                    _iCurrentSlideIndex = iNextIndex;
                    var iValue = (_iCurrentSlideIndex * 100);
                    var sPosition = iValue == 0 ? 0 : '-' + iValue.toString() + '%';
                    jqoTrack.animate({ left: sPosition }, 600, "easeInOutCubic", function () { 
                        if(direction == "next") {_OnNextSlide();}
                        if(direction == "prev") {_OnPrevSlide();}
                        _OnChangeSlide();
                    });
                }
            }
        };        
        var _slideThumbnails = function(e, direction) {
            if(e && e.preventDefault)
                e.preventDefault();

            if(e && e.stopPropagation)
                e.stopPropagation();

            var sJQSelector = '#'+_sGalleryID;
            var jqoGalleryItems = $('.thumbnails .thumbnail', sJQSelector);
            var iGallerySize = jqoGalleryItems.length;
            var iNextIndex = direction == "next" ? parseInt(_iCurrentSlideIndex) : parseInt(_iCurrentSlideIndex); 
            var bCanSwipeNextIndex = direction == "next" ? (iNextIndex < iGallerySize) : iNextIndex >= 0; 

            if (bCanSwipeNextIndex) {
                var jqoListItems = $('.thumbnails ul li', sJQSelector);
                var itemWidth = Math.abs(jqoListItems.width()); 
                var jqoTrack= $('.thumbnails .track', sJQSelector);
                var iTrackWidth = Math.abs(jqoTrack.width()); 
                var isIE = _getIEVersion();
                var bCSSTransitions = Modernizr.csstransitions;
                var bCSSTransforms = Modernizr.csstransforms;
                var bCSSAnimation = bCSSTransitions && bCSSTransforms; 

                if(bCSSAnimation) {
                    var iValue = (parseInt(_iCurrentSlideIndex) * itemWidth);
                    var nPercentage = (iValue * 100) / iTrackWidth; 
                    var sPosition = iValue == 0 ? 0 : '-' + Math.round(nPercentage);
                    var nDuration = 0.6;

                    if(!isIE) {
                        _setAnimationProperties(jqoTrack, nDuration, sPosition, true);
                    } else {
                        _setAnimationProperties(jqoTrack, nDuration, sPosition, true);
                    }
                } 
                else {
                    var iValue = (_iCurrentSlideIndex * 100);
                    var sPosition = iValue == 0 ? 0 : '-' + iValue.toString() + '%';
                    jqoTrack.animate({ left: sPosition }, 600, "easeInOutCubic", function () { });
                }
            }
        };
        var _swipeCallback = function(event, phase, direction, distance) {
            var sPhase = phase; 

            switch(sPhase) {
                case "end":
                    var sDirection = direction;
                    if(sDirection == "left") {
                        _slideViewer(event, "next");
                        _slideThumbnails(event, "next");
                    }
                    else if(sDirection == "right") {
                        _slideViewer(event, "prev");
                        _slideThumbnails(event, "prev");
                    }
                    break;
                case "move":
                case "cancel":
                default:
                    break;
            }
        };
        var _bindSwipe = function (oSettings) {
            _extendJQueryEasing();
            var oInteractionSettings = oSettings;
            _iThumbsClusterSize = oInteractionSettings.thumbnails.clusterSize;

            document.getElementById(_sGalleryID).querySelector('.controls .next').addEventListener('click', _next);
            document.getElementById(_sGalleryID).querySelector('.controls .prev').addEventListener('click', _previous);

            $('#csstransitions label').text(Modernizr.csstransitions);
            $('#csstransforms label').text(Modernizr.csstransforms);

            var arrThumbnails = document.getElementById(_sGalleryID).querySelectorAll('.thumbnail');
            var iThumbsLength = arrThumbnails.length;
            for(var i = 0; i<iThumbsLength; i++){
                var oItem = arrThumbnails[i];
                oItem.setAttribute('data-id', i);
                oItem.addEventListener('click', function(e){
                    var iTarget = this.getAttribute('data-id');
                    _goToSlide(iTarget);
                });
            }

            var swipeOptions = {
                triggerOnTouchEnd: false,
                swipeStatus: _swipeCallback, 
                allowPageScroll: "vertical",
                threshold: 90
            };

            var oViewer = document.getElementById(_sGalleryID).querySelector('.viewer');
            $(oViewer).swipe(swipeOptions);
            _OnSwipeReady();
        };

        //youtube api
        var _bindYouTubeVideo = function (sTargetID) { 
            window.App.Cache = window.App.Cache || {};
            window.App.Cache.YTVideos = window.App.Cache.YTVideos || []; 
            _arrVideosReady = new Array();

            var sGalleryId = sTargetID;
            var oGallery = document.getElementById(sGalleryId);
            var oVideoWrappers = oGallery.querySelectorAll('.video-wrapper');  
            var iVideoWrappersLength = oVideoWrappers.length; 
            var bPlayerAPIReady = typeof window.YT.Player === 'function' ? true : false;

            for(var i = 0; i < iVideoWrappersLength; i++) {
                var sID = sGalleryId+'-video-' + (i+1);
                var oElem = oVideoWrappers[i].querySelector('.yt-player');
                var sYTvideoID = oElem.getAttribute("data-ytid");
                var iVideosLenght = iVideoWrappersLength; 

                _arrVideos[i] = sYTvideoID;
                oElem.setAttribute('id', sID);

                if(bPlayerAPIReady) {
                    var oVideo = {
                        id: sYTvideoID,
                        player: new YT.Player(sID, {
                            height: '390',
                            width: '640',
                            videoId: sYTvideoID,
                            playerVars: {
                                showinfo: 0,
                                modestbranding: 0,
                                rel: 0,
                                enablejsapi: 1,
                                origin: window.location.hostname+':8080'
                            },
                            events: {
                                'onStateChange': function (event) {
                                    if (event.data == YT.PlayerState.ENDED) 
                                        event.target.stopVideo();
                                },
                                'onReady': function (event) {
                                    var sElemID = event.target.a.id || event.target.a.getAttribute('data-ytid');
                                    _arrVideosReady.push(sElemID);
                                    // console.log('pushed: '); console.log(sElemID);
                                    // console.log('_arrVideosReady.length: '+_arrVideosReady.length); 
                                    // console.log('window.App.Cache.YTVideos.length: '+window.App.Cache.YTVideos.length); 
                                    if(_arrVideosReady.length == window.App.Cache.YTVideos.length) {
                                        _OnGalleryReady();
                                        console.log('GalleryReady');
                                    }
                                }
                            }
                        })
                    };
                    window.App.Cache.YTVideos[i] = oVideo;
                }
                else {
                    console.log("YT object doesn't exist");
                    _createYTObject();
                    return;
                }
            }
        };
        var _createYTObject = function () {
            var tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        };

        //rendering functions
        var _render = function(sStringifiedJSON) {
            console.log('rendering...');
            var sData = sStringifiedJSON;
            var oGallery = document.getElementById(_sGalleryID).querySelector('.stage');
            oGallery.innerHTML = sData;
        };
        var _preRender = function(sStringifiedJSON) {
            var sData = sStringifiedJSON; 
            _wkPreRender.postMessage(sData); 
        };
        var _startWorkers = function() {
            if(_webworkersSupported) {
                _wkPreRender = new Worker('/scripts/workers/prerender.js');
            } else {
                console.log('Sorry, webworkers not suported on this browser')
            }
        };
        var _init = function(oSettings) {

            _oSettings = {
                id: oSettings.id || 'gallery-'+Math.random(),
                autoplay: oSettings.autoplay === undefined ? true : oSettings.autoplay, // boolean
                animation: {
                    holdTime: oSettings.animation.holdTime || 3000, // milliseconds
                    transitionTime: oSettings.animation.transitionTime || 600 // milliseconds
                },
                captions: oSettings.captions === undefined ? false : oSettings.captions, // boolean
                controls: {
                    visible: oSettings.controls.visible === undefined ? true : oSettings.controls.visible, // boolean
                    custom: {
                        prev: oSettings.controls.custom.prev || 'default', // string | default
                        next: oSettings.controls.custom.next || 'default' // string | default
                    } || 'default' // object | false
                },
                placeholderPath: oSettings.placeholderPath || false, // string || false
                swipe: oSettings.swipe === undefined ? true : oSettings.swipe, // boolean
                thumbnails: {
                    aspectRatio: oSettings.thumbnails.aspectRatio || '4:3', // 4:3 | 16:9 | 21:9
                    clusterSize: oSettings.thumbnails.clusterSize || 5,
                    visible: oSettings.thumbnails.visible || 'desktop' // 'always' | 'never' | 'desktop' 
                },
                viewer: {
                    aspectRatio: oSettings.viewer.aspectRatio || '4:3', // 4:3 | 16:9 | 21:9 
                    optimizationQueryString: oSettings.viewer.optimizationQueryString || false // '?queryStringParameters' || false
                },
                data: oSettings.data
            }
            _sGalleryID = _oSettings.id;
            _arrVideosReady = new Array();
            _arrVideos = new Array();

            if(_oSettings.data != null) {
                //_createYTObject();

                if(_webworkersSupported) {

                    _startWorkers();

                    _wkPreRender.addEventListener('message', function(e) {

                        //render markup
                        var sMarkup = e.data; 
                        _render(sMarkup); 

                        //calculate images sizing (dynamic sizing)


                        //bind videos: a click to an image will trigger video initialization (on demand init)
                        window.onYouTubeIframeAPIReady = function() {
                            console.log('YT API ready');
                            console.log('window.YT: '+ window.YT);
                            console.log('window.YT.Player: '+ window.YT.Player);

                            _bindYouTubeVideo(_oSettings.id);
                        };
                        
                        //gallery ready
                        var oGallery = document.getElementById(_sGalleryID);
                        oGallery.addEventListener('OnGalleryReady', function(e) {
                            var oPreloader = document.getElementById(_sGalleryID).querySelector('.loading-gallery');
                            oPreloader.setAttribute('class', 'layer-load loading-gallery-off hidden');

                            var oThis = e.target;
                            oThis.classList.add('gallery-ready');

                            //init swipe binding
                            var slideSettings = {
                                autoplay: _oSettings.autoplay,
                                animation: _oSettings.animation,
                                controls: _oSettings.controls,
                                swipe: _oSettings.swipe,
                                thumbnails: _oSettings.thumbnails
                            };
                            _bindSwipe(slideSettings);

                            //bind controls and swipe events

                        });

                    }, false);

                    var sData = JSON.stringify(_oSettings);
                    _preRender(sData);
                }
                else {
                    //workers fallback
                    console.log('Browser Antiquity: workers not supported');
                    var oGallery = document.getElementById(_sGalleryID); 
                    var oDataPanel = oGallery.nextSibling;
                    oDataPanel.innerHTML = '<p>Browser Antiquity: workers not supported</p>';
                }
            } else {
                console.log('Error: no data input was provided');
                var oGallery = document.getElementById(_sGalleryID); 
                var oDataPanel = oGallery.nextSibling;
                oDataPanel.innerHTML = '<p>Error: no data input was provided</p>';
                return;
            }
        };
        var _destroy  = function() {};

        //events constructors
        var _OnGalleryReady = function() {
            // Create the event.
            var customEvent = document.createEvent('HTMLEvents');

            // Define that the event name is 'build'.
            customEvent.initEvent('OnGalleryReady', true, true);

            var elem = document.getElementById(_sGalleryID);
            elem.dispatchEvent(customEvent); //console.log('Event fired: OnGalleryReady');
        };
        var _OnNextSlide = function() {
            // Create the event.
            var customEvent = document.createEvent('HTMLEvents');

            // Define that the event name is 'build'.
            customEvent.initEvent('OnNextSlide', true, true);

            var elem = document.getElementById(_sGalleryID);
            elem.dispatchEvent(customEvent);
            console.log('next');
        };
        var _OnPrevSlide = function() {
            // Create the event.
            var customEvent = document.createEvent('HTMLEvents');

            // Define that the event name is 'build'.
            customEvent.initEvent('OnPrevSlide', true, true);

            var elem = document.getElementById(_sGalleryID);
            elem.dispatchEvent(customEvent);
            console.log('prev');
        };
        var _OnChangeSlide = function() {
            // Create the event.
            var customEvent = document.createEvent('HTMLEvents');

            // Define that the event name is 'build'.
            customEvent.initEvent('onChangeSlide', true, true);

            var elem = document.getElementById(_sGalleryID);
            elem.dispatchEvent(customEvent);
            console.log('change slide');
        };
        var _OnPausePlayback = function() {
            // Create the event.
            var customEvent = document.createEvent('HTMLEvents');

            // Define that the event name is 'build'.
            customEvent.initEvent('OnPausePlayback', true, true);

            var elem = document.getElementById(_sGalleryID);
            elem.dispatchEvent(customEvent);
        };
        var _OnResumePlayback = function() {
            // Create the event.
            var customEvent = document.createEvent('HTMLEvents');

            // Define that the event name is 'build'.
            customEvent.initEvent('OnResumePlayback', true, true);

            var elem = document.getElementById(_sGalleryID);
            elem.dispatchEvent(customEvent);
        };
        var _OnGalleryDestroyed = function() {
            // Create the event.
            var customEvent = document.createEvent('HTMLEvents');

            // Define that the event name is 'build'.
            customEvent.initEvent('OnGalleryDestroyed', true, true);

            var elem = document.getElementById(_sGalleryID);
            elem.dispatchEvent(customEvent);
        };
        var _OnSwipeReady = function() {
            // Create the event.
            var customEvent = document.createEvent('HTMLEvents');

            // Define that the event name is 'build'.
            customEvent.initEvent('OnSwipeReady', true, true);

            var elem = document.getElementById(_sGalleryID);
            elem.dispatchEvent(customEvent); 
        };

        //expose methods
        return {
            NextSlide: _nextSlide,
            PreviousSlide: _previousSlide,
            GoToSlide: _slideToIndex,
            PausePlayback: _pause,
            Destroy: _destroy,
            Init: _init
        }
    }

    return {
        CustomImageGallery: CustomImageGallery
    }
    
})();