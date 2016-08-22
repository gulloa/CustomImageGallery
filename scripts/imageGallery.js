var App = window.App || {};  
App.Plugins = window.App.Plugins || {};
App.Plugins.ImageGallery = (function ($, undefined) {

    //var _loop, _slides, _slidesData, _currentSlide = 0, _loopFirstTime = true, _fallbackSlideShow, _slidesList;
    var _iCurrentSlideIndex = 0;

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

    var _getItemWidth = function() {
        var jqoItems = $("#demoGallery .viewer li"); 
        //var iItemWidth = Math.round(jqoItems.width().valueOf());
        var iItemWidth = Math.abs(jqoItems.width()); console.log('iItemWidth: '+iItemWidth);
        return iItemWidth;
    };

    var _getItemsLength = function() {
        var jqoItems = $("#demoGallery .viewer li"); 
        var iItemsLength = jqoItems.length;
        return iItemsLength;
    };

    var _setAnimationProperties = function(jqo, duration, position, usePercentage) {
        console.log('Inside of setAnimationProperties');
        var sCSSTransitionDuration, sCSSTransform, sCSSValue, bIsIE, jqoTrack, iDuration, sPosition, bUsePercentage;
        _nTranslateX = position; console.log('translateX set to: '+_nTranslateX);

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

    var _swipeImages = function(e, direction) {
        if(e && e.preventDefault)
            e.preventDefault();

        if(e && e.stopPropagation)
            e.stopPropagation();

        var jqoGalleryItems = $('.viewer .gallery-item', '#demoGallery');
        var iGallerySize = jqoGalleryItems.length;
        var iNextIndex = direction == "next" ? _iCurrentSlideIndex + 1 : _iCurrentSlideIndex - 1;
        var bCanSwipeNextIndex = direction == "next" ? (iNextIndex < iGallerySize) : iNextIndex >= 0;  //-console.log('bCanSwipeNextIndex: '+bCanSwipeNextIndex);

        if (bCanSwipeNextIndex) {
            var jqoListItems = $('.viewer ul li', '#demoGallery');
            var itemWidth = Math.abs(jqoListItems.width()); 
            var jqoTrack= $('.viewer .track', '#demoGallery');
            var iTrackWidth = Math.abs(jqoTrack.width()); 
            var isIE = _getIEVersion();
            var bCSSTransitions = Modernizr.csstransitions;
            var bCSSTransforms = Modernizr.csstransforms;
            var bCSSAnimation = bCSSTransitions && bCSSTransforms; console.log('bCSSAnimation: '+bCSSAnimation);

            if(bCSSAnimation) {
                _iCurrentSlideIndex = iNextIndex;
                var iValue = (_iCurrentSlideIndex * itemWidth);
                var nPercentage = (iValue * 100) / iTrackWidth; console.log('percentage: ' + nPercentage);
                var sPosition = iValue == 0 ? 0 : '-' + Math.round(nPercentage);
                var nDuration = 0.6;

                if(!isIE) {
                    //jqoTrack.attr('style', '-webkit-transform: ' + 'translate('+sPosition+',0)');
                    _setAnimationProperties(jqoTrack, nDuration, sPosition, true);
                } else {
                    //jqoTrack.attr('style', '-ms-transform: ' + 'translate('+sPosition+',0)');
                    //_setAnimationProperties(jqoTrack, iDuration, distance);
                    _setAnimationProperties(jqoTrack, nDuration, sPosition, true);
                }
            } 
            else {
                var iValue = (_iCurrentSlideIndex * 100);
                var sPosition = iValue == 0 ? 0 : '-' + iValue + '%';
                jqoTrack.animate({ left: sPosition }, 600, "easeInOutCubic", function () { });
            }
        }

        // Create the event.
        var customEvent = document.createEvent('HTMLEvents');

        // Define that the event name is 'build'.
        customEvent.initEvent('onSlide', true, true);

        var elem = document.getElementById('demoGallery');
        elem.dispatchEvent(customEvent);
    };

    var _nextSlide = function(event) {
        _swipeImages(event, "next");
    }

    var _prevSlide = function(event) {
        _swipeImages(event, "prev");
    }

    var _swipeCallback = function(event, phase, direction, distance) {
        var sPhase = phase; 

        switch(sPhase) {
            case "end":
                console.log('end');

                var sDirection = direction;
                if(sDirection == "left") {
                    _swipeImages(event, "next");
                }
                else if(sDirection == "right") {
                    _swipeImages(event, "prev");
                }
                break;
            case "move":
            case "cancel":
            default:
                break;
        }
    };

    var _swipeTrackCallback = function(event, phase, direction, distance) {
        var sPhase = phase; 

        switch(sPhase) {
            case "end":
                console.log('end');

                var sDirection = direction;
                if(sDirection == "left") {
                    _swipeImages(event, "next");
                }
                else if(sDirection == "right") {
                    _swipeImages(event, "prev");
                }
                break;
            case "move":
            case "cancel":
            default:
                break;
        }
    };

    var _swipeTrackImages = function(e, direction) {
        if(e && e.preventDefault)
            e.preventDefault();

        if(e && e.stopPropagation)
            e.stopPropagation();

        var jqoGalleryItems = $('.viewer .thumbnail', '#demoGallery');
        var iGallerySize = jqoGalleryItems.length;
        var iNextIndex = direction == "next" ? _iCurrentSlideIndex + 1 : _iCurrentSlideIndex - 1;
        var bCanSwipeNextIndex = direction == "next" ? (iNextIndex < iGallerySize) : iNextIndex >= 0;  //-console.log('bCanSwipeNextIndex: '+bCanSwipeNextIndex);

        if (bCanSwipeNextIndex) {
            var jqoListItems = $('.thumbnails ul li', '#demoGallery');
            var itemWidth = Math.abs(jqoListItems.width()); 
            var jqoTrack= $('.viewer .track', '#demoGallery');
            var iTrackWidth = Math.abs(jqoTrack.width()); 
            var isIE = _getIEVersion();
            var bCSSTransitions = Modernizr.csstransitions;
            var bCSSTransforms = Modernizr.csstransforms;
            var bCSSAnimation = bCSSTransitions && bCSSTransforms; console.log('bCSSAnimation: '+bCSSAnimation);

            if(bCSSAnimation) {
                _iCurrentSlideIndex = iNextIndex;
                var iValue = (_iCurrentSlideIndex * itemWidth);
                var nPercentage = (iValue * 100) / iTrackWidth; console.log('percentage: ' + nPercentage);
                var sPosition = iValue == 0 ? 0 : '-' + Math.round(nPercentage);
                var nDuration = 0.6;

                if(!isIE) {
                    //jqoTrack.attr('style', '-webkit-transform: ' + 'translate('+sPosition+',0)');
                    _setAnimationProperties(jqoTrack, nDuration, sPosition, true);
                } else {
                    //jqoTrack.attr('style', '-ms-transform: ' + 'translate('+sPosition+',0)');
                    //_setAnimationProperties(jqoTrack, iDuration, distance);
                    _setAnimationProperties(jqoTrack, nDuration, sPosition, true);
                }
            } 
            else {
                var iValue = (_iCurrentSlideIndex * 100);
                var sPosition = iValue == 0 ? 0 : '-' + iValue + '%';
                jqoTrack.animate({ left: sPosition }, 600, "easeInOutCubic", function () { });
            }
        }
    };

    var _parseArrayToString = function(array) {

    };

    var _initImages = function(arrData) {
        var arrImages = arrData;
        var sImages = arrImages.toString();

        if (typeof(Worker) !== "undefined") {
            var wkItemBuilder = new Worker('/scripts/workers/galleryItemBuilder.js');
            var obj = null;
            
            wkItemBuilder.addEventListener('message', function(e) {
              console.log(e.data);
            }, false);

            wkItemBuilder.postMessage(sImages); // Send data to our worker.
        } else {
            // Sorry! No Web Worker support..
        }
    }

    var _init = function (arrImagesURLs) {
        _extendJQueryEasing();

        $('.controls .next', '#demoGallery').bind('click', _nextSlide);
        $('.controls .prev', '#demoGallery').bind('click', _prevSlide);

        $('#csstransitions label').text(Modernizr.csstransitions);
        $('#csstransforms label').text(Modernizr.csstransforms);

        // var oNode = document.getElementById('csstransitions'); 
        // var sNodeText = oNode.textContent; 
        // var oChildNode = oNode.querySelector('label');
        // var sChildNodeText = oChildNode.textContent;
        // console.log("sNodeText: "+sNodeText);
        // console.log("sChildNodeText: "+sChildNodeText);
        // oNode.textContent = "Supports css transitions?: ";
        // oNode.appendChild(oChildNode);

        // var sNodeValue = oNode.firstChild.nodeValue;
        // console.log("Node value: "+sNodeValue);


        var arrImagesURLs = arrImagesURLs || new Array();
        if (arrImagesURLs.length == 0) {
            arrImagesURLs.push('001.jpg');
            arrImagesURLs.push('002.jpg');
            arrImagesURLs.push('003.jpg');
            arrImagesURLs.push('004.jpg');
            arrImagesURLs.push('005.jpg');
            arrImagesURLs.push('006.jpg');
            arrImagesURLs.push('007.jpg');
            arrImagesURLs.push('008.jpg');
            arrImagesURLs.push('009.jpg');
        }
        _initImages(arrImagesURLs);


        var swipeOptions = {
            triggerOnTouchEnd: false,
            swipeStatus: _swipeCallback, //_swipeStatus,
            allowPageScroll: "vertical",
            threshold: 90
        };

        var jqoImgs = $("#demoGallery .viewer");
        jqoImgs.swipe(swipeOptions);

        var jqoThumbnails = $("#demoGallery .thumbnails");
        jqoImgs.swipe(swipeOptions);

        console.log("view initialized");

        // var evObj = document.createEvent('HTMLEvents');
        // document.body.addEventListener('OnGalleryReady', function(e){ alert(e === evObj); },true);
        // evObj.initEvent('OnGalleryReady', true, true);

        // Create the event.
        // var event = document.createEvent('Event');

        // Define that the event name is 'build'.
        // event.initEvent('onSlide', true, true);

        // Listen for the event.
        var elem = document.getElementById('demoGallery');
        elem.addEventListener('onSlide', function (e) {
          // e.target matches elem
          var evt  = e;
          console.log(e);
        }, false);

        // target can be any Element or other EventTarget.
        //elem.dispatchEvent(event);

    };

    return {
        Init: _init
    }

})(jQuery, undefined);

App.Plugins.CustomImageGallery = (function(){

    var _oSettings, _sGalleryID = 'demoGallery';

    //construct instance
    (function(){
        // var evObj = document.createEvent('HTMLEvents');
        // document.body.addEventListener('OnGalleryReady', function(e){ alert(e === evObj); },true);
        // evObj.initEvent('OnGalleryReady', true, true);
        //document.body.dispatchEvent(evObj); // Shows alert, "true"
    })();

    //controllers
    var _next = function() {};
    var _previous = function() {};
    var _goToSlide = function() {};
    var _pause = function() {};
    var _play = function() {};
    var _togglePlayback = function() {};
    var _preload = function() {};
    var _getImages = function() {};
    var _createGalleryItems = function() {};
    var _renderItems = function() {};
    var _init = function(oSettings) {
        _oSettings = {
            DataProvider: null, //oSettings.DataProvider;
            Track: {
                visible: 'always', // 'always' | 'never' | 'desktop'
                cluster: 5, // 3 - 10
                swipe: true  // true | false
            },
            Autoplay: true, // true | false
            HoldTime: 3000, // milliseconds
            TransitionTime: 600, // milliseconds
            UseImageOptimization: true, // true | false
            ImageOptimization: {
                width: 800,  //pixels | auto
                height: 600, //pixels | auto
                constrain: true, // true | false
                queryString: '?weight=800&height=300&crop&Constrain=true' // '?queryStringParameters' || false
            }

        }
    };
    var _destroy  = function() {};

    //events handlers
    var _OnGalleryReady = function() {
        // Create the event.
        var customEvent = document.createEvent('HTMLEvents');

        // Define that the event name is 'build'.
        customEvent.initEvent('OnGalleryReady', true, true);

        var elem = document.getElementById(_sGalleryID);
        elem.dispatchEvent(customEvent);
    };
    var _OnNextSlide = function() {
        // Create the event.
        var customEvent = document.createEvent('HTMLEvents');

        // Define that the event name is 'build'.
        customEvent.initEvent('OnNextSlide', true, true);

        var elem = document.getElementById(_sGalleryID);
        elem.dispatchEvent(customEvent);
    };
    var _OnPrevSlide = function() {
        // Create the event.
        var customEvent = document.createEvent('HTMLEvents');

        // Define that the event name is 'build'.
        customEvent.initEvent('OnPrevSlide', true, true);

        var elem = document.getElementById(_sGalleryID);
        elem.dispatchEvent(customEvent);
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


    //exposed methods
    return {
        NextSlide: _next,
        PreviousSlide: _previous,
        GoToSlide: _goToSlide,
        PausePlayback: _pause,
        Destroy: _destroy,
        Init: _init
    }

})();


App.Plugins = (function(){

    var CustomImageGallery = function(){

        var _oSettings, _sGalleryID = 'demoGallery', _webworkersSupported = window.Modernizr ? Modernizr.webworkers : typeof(window.Worker) !== "undefined";
        var _wkDataParser, _wkItemBuilder, _wkPreRender;

        //controllers
        var _next = function() {};
        var _previous = function() {};
        var _goToSlide = function() {};
        var _pause = function() {};
        var _play = function() {};
        var _togglePlayback = function() {};
        var _preload = function() {};

        var bindYouTubeVideo = function () {
            var sGallerySelector = '#carousel-' + oModalSettings.id;
            var $videoWrappers = $(sGallerySelector).find('.video-wrapper');
            window.videos = window.videos || [];
            window.YT = window.YT || undefined;

            if (window.YT == undefined) {
                createYTObject();
            }

            $videoWrappers.each(function (index, elem) {
                var sID = 'video-' + index;
                var sYTvideoID = $(this).attr("data-ytid");
                var arrVideosLenght = window.videos.length;
                var iArrayIndex = arrVideosLenght > 0 ? arrVideosLenght + index : index;

                $(elem).attr('id', sID);

                if (typeof window.YT.Player === 'function') {
                    window.videos[iArrayIndex] = new YT.Player(sID, {
                        height: '390',
                        width: '640',
                        videoId: sYTvideoID,
                        events: {
                            'onStateChange': function (event) {
                                if (event.data == YT.PlayerState.ENDED)
                                    event.target.stopVideo();
                            }
                        }
                    });
                }
                else {
                    console.log("YT object doesn't exist");
                    return;
                }
            });
        };
        var createYTObject = function () {
            var tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        };

        var _render = function(sStringifiedJSON) {
            var sData = sStringifiedJSON;
            //_wkPreRender.postMessage(sData); 

            console.log('RECEIVED String');
            console.log(sData);

            var oGallery = document.getElementById('demoGallery');
            oGallery.innerHTML = sData;

            //calculate images sizing (dynamic sizing)

            //bind videos: a click to an image will trigger video initialization (on demand init)

            //gallery ready:  _OnGalleryReady();

        };
        var _preRender = function(sStringifiedJSON) {
            var sData = sStringifiedJSON; 
            _wkPreRender.postMessage(sData); 
        };
        var _startWorkers = function() {
            if(_webworkersSupported) {
                // _wkDataParser = new Worker('/scripts/workers/dataProvider.js'); 
                // _wkItemBuilder = new Worker('/scripts/workers/galleryItemBuilder.js');
                _wkPreRender = new Worker('/scripts/workers/prerender.js');
            } else {
                console.log('Sorry, webworkers not suported on this browser')
            }
        };
        var _init = function(oSettings) {
            /*
            _oSettings = {
                data: null || oSettings.data, // array of objects
                id: '01',
                captions: true || oSettings.captions,  // true | false
                autoplay: true || oSettings.autoplay,  // true | false
                thumbnails: {
                    visible: 'always' || oSettings.thumbnails.visible, // 'always' | 'never' | 'desktop'
                    cluster: 5 || oSettings.thumbnails.cluster // 3 - 10
                },
                animation: {
                    holdTime: 3000 || oSettings.animation.holdTime, // milliseconds
                    transitionTime: 600 || oSettings.animation.transitionTime // milliseconds
                },
                optimization: {
                    enable: true || oSettings.optimization.enable, // true | false
                    constrain: true || oSettings.optimization.constrain, // true | falses
                    dynamic: true || oSettings.optimization.dynamic, // true | false
                    queryString: null || oSettings.optimization.queryString // '?queryStringParameters' || false
                }
            }
            */

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

            console.log('init- settings');
            console.log(_oSettings);

            if(_oSettings.data != null) {
                if(_webworkersSupported) {
                    _startWorkers();

                    _wkPreRender.addEventListener('message', function(e) {
                        var sMarkup = e.data;  console.log('e.data: '); console.log(e.data);
                        _render(sMarkup);
                    }, false);

                    var sData = JSON.stringify(_oSettings);
                    _preRender(sData);
                }
                else {
                    //workers fallback
                }
            } else {
                console.log('Error: no data input was provided');
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
            elem.dispatchEvent(customEvent);
        };
        var _OnNextSlide = function() {
            // Create the event.
            var customEvent = document.createEvent('HTMLEvents');

            // Define that the event name is 'build'.
            customEvent.initEvent('OnNextSlide', true, true);

            var elem = document.getElementById(_sGalleryID);
            elem.dispatchEvent(customEvent);
        };
        var _OnPrevSlide = function() {
            // Create the event.
            var customEvent = document.createEvent('HTMLEvents');

            // Define that the event name is 'build'.
            customEvent.initEvent('OnPrevSlide', true, true);

            var elem = document.getElementById(_sGalleryID);
            elem.dispatchEvent(customEvent);
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

        //expose methods
        return {
            NextSlide: _next,
            PreviousSlide: _previous,
            GoToSlide: _goToSlide,
            PausePlayback: _pause,
            Destroy: _destroy,
            Init: _init
        }
    }

    return {
        CustomImageGallery: CustomImageGallery
    }

})();