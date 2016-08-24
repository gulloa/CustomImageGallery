var App = window.App || {};  
App.Plugins = window.App.Plugins || {};
App.Plugins = (function(){

    var SwipeImageGallery = function(){
        var _iCurrentSlideIndex = 0, _sTargetID, _iThumbsClusterSize, _iCurrentCluster = 0;

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

        // var _getItemsLength = function() {
        //     var jqoItems = $("#demoGallery .viewer li"); 
        //     var iItemsLength = jqoItems.length;
        //     return iItemsLength;
        // };
        //-
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
        //-
        var _swipeImages = function(e, direction) {
            console.log('_iCurrentSlideIndex: '+_iCurrentSlideIndex);

            if(e && e.preventDefault)
                e.preventDefault();

            if(e && e.stopPropagation)
                e.stopPropagation();

            var sJQSelector = '#'+_sTargetID;
            var jqoGalleryItems = $('.viewer .gallery-item', sJQSelector);
            var iGallerySize = jqoGalleryItems.length;
            var iNextIndex = direction == "next" ? parseInt(_iCurrentSlideIndex) + 1 : parseInt(_iCurrentSlideIndex) - 1;   console.log('from button iNextIndex: '+iNextIndex);
            var bCanSwipeNextIndex = direction == "next" ? (iNextIndex < iGallerySize) : iNextIndex >= 0;  //-console.log('bCanSwipeNextIndex: '+bCanSwipeNextIndex);

            if (bCanSwipeNextIndex) {
                var jqoListItems = $('.viewer ul li', sJQSelector);
                var itemWidth = Math.abs(jqoListItems.width()); 
                var jqoTrack= $('.viewer .track', sJQSelector);
                var iTrackWidth = Math.abs(jqoTrack.width()); 
                var isIE = _getIEVersion();
                var bCSSTransitions = Modernizr.csstransitions;
                var bCSSTransforms = Modernizr.csstransforms;
                var bCSSAnimation = bCSSTransitions && bCSSTransforms;      console.log('bCSSAnimation: '+bCSSAnimation);

                if(bCSSAnimation) {
                    _iCurrentSlideIndex = iNextIndex;
                    var iValue = (parseInt(_iCurrentSlideIndex) * itemWidth);
                    var nPercentage = (iValue * 100) / iTrackWidth;         console.log('percentage: ' + nPercentage);
                    var sPosition = iValue == 0 ? 0 : '-' + Math.round(nPercentage);
                    var nDuration = 0.6;

                    if(!isIE) {
                        _setAnimationProperties(jqoTrack, nDuration, sPosition, true);
                    } else {
                        _setAnimationProperties(jqoTrack, nDuration, sPosition, true);
                    }
                } 
                else {
                    _iCurrentSlideIndex = iNextIndex;
                    var iValue = (_iCurrentSlideIndex * 100);
                    var sPosition = iValue == 0 ? 0 : '-' + iValue.toString() + '%';
                    jqoTrack.animate({ left: sPosition }, 600, "easeInOutCubic", function () { });
                }
            }

            // Create the event.
            var customEvent = document.createEvent('HTMLEvents');

            // Define that the event name is 'build'.
            customEvent.initEvent('onSlide', true, true);

            var elem = document.getElementById(_sTargetID);
            elem.dispatchEvent(customEvent);
        };
        //-
        var _nextSlide = function(event) {
            _swipeImages(event, "next");
            _swipeTrackImages(event, "next");
        }
        //-
        var _prevSlide = function(event) {
            _swipeImages(event, "prev");
            _swipeTrackImages(event, "prev");
        }
        //-
        var _goToSlide = function(iTargetIndex) {
            console.log('iTargetIndex: '+iTargetIndex);

            var sJQSelector = '#'+_sTargetID;
            var jqoTrack= $('.viewer .track', sJQSelector);
            var jqoListItems = $('.viewer ul li', sJQSelector);
            var itemWidth = Math.abs(jqoListItems.width()); 
            var jqoTrack= $('.viewer .track', sJQSelector);
            var iTrackWidth = Math.abs(jqoTrack.width()); 
            var isIE = _getIEVersion();
            var bCSSTransitions = Modernizr.csstransitions;
            var bCSSTransforms = Modernizr.csstransforms;
            var bCSSAnimation = bCSSTransitions && bCSSTransforms; console.log('bCSSAnimation: '+bCSSAnimation);

            if(bCSSAnimation) {
                _iCurrentSlideIndex = iTargetIndex;
                var iValue = (iTargetIndex * itemWidth);
                var nPercentage = (iValue * 100) / iTrackWidth; console.log('percentage: ' + nPercentage);
                var sPosition = iValue == 0 ? 0 : '-' + Math.round(nPercentage);
                var nDuration = 0.6;

                if(!isIE) {
                    _setAnimationProperties(jqoTrack, nDuration, sPosition, true);
                } else {
                    _setAnimationProperties(jqoTrack, nDuration, sPosition, true);
                }
                _iCurrentSlideIndex = iTargetIndex;
            } 
            else {
                _iCurrentSlideIndex = iTargetIndex;
                var iValue = (_iCurrentSlideIndex * 100);
                var sPosition = iValue == 0 ? 0 : '-' + iValue + '%';
                jqoTrack.animate({ left: sPosition }, 600, "easeInOutCubic", function () { });
            }
        };
        //-
        var _swipeTrackImages = function(e, direction) {
            console.log('_swipeTrackImages ---------------------------');
            console.log('_iCurrentSlideIndex: '+_iCurrentSlideIndex);

            if(e && e.preventDefault)
                e.preventDefault();

            if(e && e.stopPropagation)
                e.stopPropagation();

            var sJQSelector = '#'+_sTargetID;
            var jqoGalleryItems = $('.thumbnails .thumbnail', sJQSelector);
            var iGallerySize = jqoGalleryItems.length;
            var iNextIndex = direction == "next" ? parseInt(_iCurrentSlideIndex) : parseInt(_iCurrentSlideIndex);   console.log('from button iNextIndex: '+iNextIndex);
            var bCanSwipeNextIndex = direction == "next" ? (iNextIndex < iGallerySize) : iNextIndex >= 0;  //-console.log('bCanSwipeNextIndex: '+bCanSwipeNextIndex);

            if (bCanSwipeNextIndex) {
                var jqoListItems = $('.thumbnails ul li', sJQSelector);
                var itemWidth = Math.abs(jqoListItems.width()); 
                var jqoTrack= $('.thumbnails .track', sJQSelector);
                var iTrackWidth = Math.abs(jqoTrack.width()); 
                var isIE = _getIEVersion();
                var bCSSTransitions = Modernizr.csstransitions;
                var bCSSTransforms = Modernizr.csstransforms;
                var bCSSAnimation = bCSSTransitions && bCSSTransforms;      console.log('bCSSAnimation: '+bCSSAnimation);

                if(bCSSAnimation) {
                    //_iCurrentSlideIndex = iNextIndex;
                    var iValue = (parseInt(_iCurrentSlideIndex) * itemWidth);
                    var nPercentage = (iValue * 100) / iTrackWidth;         console.log('percentage: ' + nPercentage);
                    var sPosition = iValue == 0 ? 0 : '-' + Math.round(nPercentage);
                    var nDuration = 0.6;

                    if(!isIE) {
                        _setAnimationProperties(jqoTrack, nDuration, sPosition, true);
                    } else {
                        _setAnimationProperties(jqoTrack, nDuration, sPosition, true);
                    }
                } 
                else {
                    //_iCurrentSlideIndex = iNextIndex;
                    var iValue = (_iCurrentSlideIndex * 100);
                    var sPosition = iValue == 0 ? 0 : '-' + iValue.toString() + '%';
                    jqoTrack.animate({ left: sPosition }, 600, "easeInOutCubic", function () { });
                }
            }

            // Create the event.
            var customEvent = document.createEvent('HTMLEvents');

            // Define that the event name is 'build'.
            customEvent.initEvent('onSlide', true, true);

            var elem = document.getElementById(_sTargetID);
            elem.dispatchEvent(customEvent);

            console.log('---------------------------');
        };
        //-
        var _swipeCallback = function(event, phase, direction, distance) {
            var sPhase = phase; 

            switch(sPhase) {
                case "end":
                    console.log('end');

                    var sDirection = direction;
                    if(sDirection == "left") {
                        _swipeImages(event, "next");
                        _swipeTrackImages(event, "next");
                    }
                    else if(sDirection == "right") {
                        _swipeImages(event, "prev");
                        _swipeTrackImages(event, "prev");
                    }
                    break;
                case "move":
                case "cancel":
                default:
                    break;
            }
        };
        //-
        var _init = function (sTarget) {
            if(!sTarget) {
                return;
            }

            _extendJQueryEasing();

            _sTargetID = sTarget;
            var sGallerySelector = '#'+_sTargetID;

            _iThumbsClusterSize = 5; //-hardcoded

            $('.controls .next', sGallerySelector).bind('click', _nextSlide);
            $('.controls .prev', sGallerySelector).bind('click', _prevSlide);

            $('#csstransitions label').text(Modernizr.csstransitions);
            $('#csstransforms label').text(Modernizr.csstransforms);

            var $tumbnails = $(sGallerySelector).find('.thumbnail');
            $.each($tumbnails, function(key, value){
                console.log( key + ": " + value );
                var oItem = value;
                oItem.setAttribute('data-id', key);
                oItem.addEventListener('click', function(e){
                    var iTarget = this.getAttribute('data-id');
                    _goToSlide(iTarget);
                });
            });

            var swipeOptions = {
                triggerOnTouchEnd: false,
                swipeStatus: _swipeCallback, //_swipeStatus,
                allowPageScroll: "vertical",
                threshold: 90
            };

            var jqoImgs = $(sGallerySelector+" .viewer");
            jqoImgs.swipe(swipeOptions);

            console.log("view initialized");
            _OnSwipeReady();
        };

        //events constructors
        var _OnSwipeReady = function() {
            // Create the event.
            var customEvent = document.createEvent('HTMLEvents');

            // Define that the event name is 'build'.
            customEvent.initEvent('OnSwipeReady', true, true);

            var elem = document.getElementById(_sTargetID);
            elem.dispatchEvent(customEvent); 
        };

        return {
            Init: _init
        }
    }

    var CustomImageGallery = function(){

        var _oSettings, _sGalleryID, _arrVideosReady, _arrVideos, _webworkersSupported = window.Modernizr ? Modernizr.webworkers : typeof(window.Worker) !== "undefined";
        var _wkDataParser, _wkItemBuilder, _wkPreRender;
        var _oSwipeGallery;

        var _iCurrentSlideIndex = 0, _sTargetID, _iThumbsClusterSize, _iCurrentCluster = 0;

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

        //controllers
        var _next = function(event) {
            _swipeImages(event, "next");
            _swipeTrackImages(event, "next");
        };
        var _previous = function(event) {
            _swipeImages(event, "prev");
            _swipeTrackImages(event, "prev");
        };
        var _goToSlide = function(iTargetIndex) {
            console.log('iTargetIndex: '+iTargetIndex);

            var sJQSelector = '#'+_sTargetID;
            var jqoTrack= $('.viewer .track', sJQSelector);
            var jqoListItems = $('.viewer ul li', sJQSelector);
            var itemWidth = Math.abs(jqoListItems.width()); 
            var jqoTrack= $('.viewer .track', sJQSelector);
            var iTrackWidth = Math.abs(jqoTrack.width()); 
            var isIE = _getIEVersion();
            var bCSSTransitions = Modernizr.csstransitions;
            var bCSSTransforms = Modernizr.csstransforms;
            var bCSSAnimation = bCSSTransitions && bCSSTransforms; console.log('bCSSAnimation: '+bCSSAnimation);

            if(bCSSAnimation) {
                _iCurrentSlideIndex = iTargetIndex;
                var iValue = (iTargetIndex * itemWidth);
                var nPercentage = (iValue * 100) / iTrackWidth; console.log('percentage: ' + nPercentage);
                var sPosition = iValue == 0 ? 0 : '-' + Math.round(nPercentage);
                var nDuration = 0.6;

                if(!isIE) {
                    _setAnimationProperties(jqoTrack, nDuration, sPosition, true);
                } else {
                    _setAnimationProperties(jqoTrack, nDuration, sPosition, true);
                }
                _iCurrentSlideIndex = iTargetIndex;
            } 
            else {
                _iCurrentSlideIndex = iTargetIndex;
                var iValue = (_iCurrentSlideIndex * 100);
                var sPosition = iValue == 0 ? 0 : '-' + iValue + '%';
                jqoTrack.animate({ left: sPosition }, 600, "easeInOutCubic", function () { });
            }
        };
        var _pause = function() {};
        var _play = function() {};
        var _togglePlayback = function() {};
        var _preload = function() {};

        //slide animation
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
            console.log('_iCurrentSlideIndex: '+_iCurrentSlideIndex);

            if(e && e.preventDefault)
                e.preventDefault();

            if(e && e.stopPropagation)
                e.stopPropagation();

            var sJQSelector = '#'+_sTargetID;
            var jqoGalleryItems = $('.viewer .gallery-item', sJQSelector);
            var iGallerySize = jqoGalleryItems.length;
            var iNextIndex = direction == "next" ? parseInt(_iCurrentSlideIndex) + 1 : parseInt(_iCurrentSlideIndex) - 1;   console.log('from button iNextIndex: '+iNextIndex);
            var bCanSwipeNextIndex = direction == "next" ? (iNextIndex < iGallerySize) : iNextIndex >= 0;  //-console.log('bCanSwipeNextIndex: '+bCanSwipeNextIndex);

            if (bCanSwipeNextIndex) {
                var jqoListItems = $('.viewer ul li', sJQSelector);
                var itemWidth = Math.abs(jqoListItems.width()); 
                var jqoTrack= $('.viewer .track', sJQSelector);
                var iTrackWidth = Math.abs(jqoTrack.width()); 
                var isIE = _getIEVersion();
                var bCSSTransitions = Modernizr.csstransitions;
                var bCSSTransforms = Modernizr.csstransforms;
                var bCSSAnimation = bCSSTransitions && bCSSTransforms;      console.log('bCSSAnimation: '+bCSSAnimation);

                if(bCSSAnimation) {
                    _iCurrentSlideIndex = iNextIndex;
                    var iValue = (parseInt(_iCurrentSlideIndex) * itemWidth);
                    var nPercentage = (iValue * 100) / iTrackWidth;         console.log('percentage: ' + nPercentage);
                    var sPosition = iValue == 0 ? 0 : '-' + Math.round(nPercentage);
                    var nDuration = 0.6;

                    if(!isIE) {
                        _setAnimationProperties(jqoTrack, nDuration, sPosition, true);
                    } else {
                        _setAnimationProperties(jqoTrack, nDuration, sPosition, true);
                    }
                } 
                else {
                    _iCurrentSlideIndex = iNextIndex;
                    var iValue = (_iCurrentSlideIndex * 100);
                    var sPosition = iValue == 0 ? 0 : '-' + iValue.toString() + '%';
                    jqoTrack.animate({ left: sPosition }, 600, "easeInOutCubic", function () { });
                }
            }

            // Create the event.
            var customEvent = document.createEvent('HTMLEvents');

            // Define that the event name is 'build'.
            customEvent.initEvent('onSlide', true, true);

            var elem = document.getElementById(_sTargetID);
            elem.dispatchEvent(customEvent);
        };        
        var _swipeTrackImages = function(e, direction) {
            console.log('_swipeTrackImages ---------------------------');
            console.log('_iCurrentSlideIndex: '+_iCurrentSlideIndex);

            if(e && e.preventDefault)
                e.preventDefault();

            if(e && e.stopPropagation)
                e.stopPropagation();

            var sJQSelector = '#'+_sTargetID;
            var jqoGalleryItems = $('.thumbnails .thumbnail', sJQSelector);
            var iGallerySize = jqoGalleryItems.length;
            var iNextIndex = direction == "next" ? parseInt(_iCurrentSlideIndex) : parseInt(_iCurrentSlideIndex);   console.log('from button iNextIndex: '+iNextIndex);
            var bCanSwipeNextIndex = direction == "next" ? (iNextIndex < iGallerySize) : iNextIndex >= 0;  //-console.log('bCanSwipeNextIndex: '+bCanSwipeNextIndex);

            if (bCanSwipeNextIndex) {
                var jqoListItems = $('.thumbnails ul li', sJQSelector);
                var itemWidth = Math.abs(jqoListItems.width()); 
                var jqoTrack= $('.thumbnails .track', sJQSelector);
                var iTrackWidth = Math.abs(jqoTrack.width()); 
                var isIE = _getIEVersion();
                var bCSSTransitions = Modernizr.csstransitions;
                var bCSSTransforms = Modernizr.csstransforms;
                var bCSSAnimation = bCSSTransitions && bCSSTransforms;      console.log('bCSSAnimation: '+bCSSAnimation);

                if(bCSSAnimation) {
                    //_iCurrentSlideIndex = iNextIndex;
                    var iValue = (parseInt(_iCurrentSlideIndex) * itemWidth);
                    var nPercentage = (iValue * 100) / iTrackWidth;         console.log('percentage: ' + nPercentage);
                    var sPosition = iValue == 0 ? 0 : '-' + Math.round(nPercentage);
                    var nDuration = 0.6;

                    if(!isIE) {
                        _setAnimationProperties(jqoTrack, nDuration, sPosition, true);
                    } else {
                        _setAnimationProperties(jqoTrack, nDuration, sPosition, true);
                    }
                } 
                else {
                    //_iCurrentSlideIndex = iNextIndex;
                    var iValue = (_iCurrentSlideIndex * 100);
                    var sPosition = iValue == 0 ? 0 : '-' + iValue.toString() + '%';
                    jqoTrack.animate({ left: sPosition }, 600, "easeInOutCubic", function () { });
                }
            }

            // Create the event.
            var customEvent = document.createEvent('HTMLEvents');

            // Define that the event name is 'build'.
            customEvent.initEvent('onSlide', true, true);

            var elem = document.getElementById(_sTargetID);
            elem.dispatchEvent(customEvent);

            console.log('---------------------------');
        };
        var _swipeCallback = function(event, phase, direction, distance) {
            var sPhase = phase; 

            switch(sPhase) {
                case "end":
                    console.log('end');

                    var sDirection = direction;
                    if(sDirection == "left") {
                        _swipeImages(event, "next");
                        _swipeTrackImages(event, "next");
                    }
                    else if(sDirection == "right") {
                        _swipeImages(event, "prev");
                        _swipeTrackImages(event, "prev");
                    }
                    break;
                case "move":
                case "cancel":
                default:
                    break;
            }
        };
        var _bindSwipe = function (sTarget) {
            if(!sTarget) {
                return;
            }

            _extendJQueryEasing();

            _sTargetID = sTarget;
            var sGallerySelector = '#'+_sTargetID;

            _iThumbsClusterSize = 5; //-hardcoded

            $('.controls .next', sGallerySelector).bind('click', _next);
            $('.controls .prev', sGallerySelector).bind('click', _previous);

            $('#csstransitions label').text(Modernizr.csstransitions);
            $('#csstransforms label').text(Modernizr.csstransforms);

            var $tumbnails = $(sGallerySelector).find('.thumbnail');
            $.each($tumbnails, function(key, value){
                console.log( key + ": " + value );
                var oItem = value;
                oItem.setAttribute('data-id', key);
                oItem.addEventListener('click', function(e){
                    var iTarget = this.getAttribute('data-id');
                    _goToSlide(iTarget);
                });
            });

            var swipeOptions = {
                triggerOnTouchEnd: false,
                swipeStatus: _swipeCallback, //_swipeStatus,
                allowPageScroll: "vertical",
                threshold: 90
            };

            var jqoImgs = $(sGallerySelector+" .viewer");
            jqoImgs.swipe(swipeOptions);

            console.log("view initialized");
            _OnSwipeReady();
        };

        //youtube api
        var _bindYouTubeVideo = function (sGalleryID) { //console.log('_bindYouTubeVideo');
            window.App.Cache = window.App.Cache || {};
            window.App.Cache.YTVideos = window.App.Cache.YTVideos || [];  console.log('YTVideos length: '+window.App.Cache.YTVideos.length);

            var sGalleryId = sGalleryID;
            var oGallery = document.getElementById(sGalleryId);
            var oVideoWrappers = oGallery.querySelectorAll('.video-wrapper');  
            var iVideoWrappersLength = oVideoWrappers.length;   console.log('wrappers length: '+iVideoWrappersLength);
            //var arrYTVideos = window.App.Cache.YTVideos;        console.log('YTVideos length: '+arrYTVideos.length);
            var bPlayerAPIReady = typeof window.YT.Player === 'function' ? true : false;
            _arrVideosReady = new Array();

            //arrYTVideos = window.App.Cache.YTVideos;
            console.log('wrappers:');
            console.log(oVideoWrappers);

            for(var i = 0; i < iVideoWrappersLength; i++) {
                var sID = sGalleryId+'-video-' + (i+1);
                var oElem = oVideoWrappers[i].querySelector('.yt-player');
                var sYTvideoID = oElem.getAttribute("data-ytid");

                // arrYTVideos[i] = sYTvideoID; 
                // console.log('YTVideos Push length: '+arrYTVideos.length);
                // console.log('YTVideos value at index '+i+': '+arrYTVideos[i]);
                _arrVideos[i] = sYTvideoID; 
                console.log('_arrVideos length: '+_arrVideos.length);

                console.log('YTVideos length: '+window.App.Cache.YTVideos.length);
                
                var iVideosLenght = oVideoWrappers.length; 
                //var iArrayIndex = iVideosLenght > 0 ? iVideosLenght + i : i;

                oElem.setAttribute('id', sID);
                if(bPlayerAPIReady) {
                //if (typeof window.YT.Player === 'function') {
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
                                    console.log('pushed: '); console.log(sElemID);
                                    console.log('_arrVideosReady.length: '+_arrVideosReady.length); 
                                    console.log('window.App.Cache.YTVideos.length: '+window.App.Cache.YTVideos.length); 
                                    if(_arrVideosReady.length == window.App.Cache.YTVideos.length) {
                                        _OnGalleryReady();
                                        console.log('GalleryReady');
                                    }
                                }
                            }
                        })
                    };
                    window.App.Cache.YTVideos[i] = oVideo;
                    /*
                    window.App.Cache.YTVideos[iArrayIndex].id = sYTvideoID;
                    window.App.Cache.YTVideos[iArrayIndex].player = new YT.Player(sID, {
                        height: '390',
                        width: '640',
                        videoId: sYTvideoID,
                        playerVars: {
                            showinfo: 0,
                            modestbranding: 0,
                            rel: 0,
                            enablejsapi: 0,
                            origin: window.location.hostname+':8080'
                        },
                        events: {
                            'onStateChange': function (event) {
                                if (event.data == YT.PlayerState.ENDED) 
                                    event.target.stopVideo();
                            },
                            'onReady': function (event) {
                                _arrVideosReady.push(sYTvideoID);
                                console.log('event: '); console.log(event);
                                // console.log('Event fired: YT onReady');
                                // console.log('_arrVideosReady.length: '+_arrVideosReady.length);
                                // console.log('_arrVideos.length: '+_arrVideos.length);

                                if(_arrVideosReady.length == _arrVideos.length) {
                                    _OnGalleryReady();
                                    // var oPreloader = document.getElementById(_sGalleryID).querySelector('.loading-gallery');
                                    // oPreloader.setAttribute('class', 'layer-load loading-gallery hidden');
                                    // console.log('preloader removed');
                                }
                            }
                        }
                    });
                    */
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
                        var sMarkup = e.data;  //console.log('e.data: '); console.log(e.data);
                        _render(sMarkup); //return;

                        //calculate images sizing (dynamic sizing)


                        //bind videos: a click to an image will trigger video initialization (on demand init)
                        window.onYouTubeIframeAPIReady = function() {
                            console.log('YT API ready');
                            console.log('window.YT: '+ window.YT);
                            console.log('window.YT.Player: '+ window.YT.Player);

                            _bindYouTubeVideo(_oSettings.id);
                        };
                        

                        //gallery ready:  _OnGalleryReady();
                        var oGallery = document.getElementById(_sGalleryID);
                        oGallery.addEventListener('OnGalleryReady', function(e) {
                            var oPreloader = document.getElementById(_sGalleryID).querySelector('.loading-gallery');
                            oPreloader.setAttribute('class', 'layer-load loading-gallery-off hidden');

                            var oThis = e.target;
                            oThis.classList.add('gallery-ready');

                            //init swipe binding
                            // _oSwipeGallery = new App.Plugins.SwipeGallery();
                            // _oSwipeGallery.Init(_sGalleryID);

                            _bindSwipe(_sGalleryID);

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
        var _OnSwipeReady = function() {
            // Create the event.
            var customEvent = document.createEvent('HTMLEvents');

            // Define that the event name is 'build'.
            customEvent.initEvent('OnSwipeReady', true, true);

            var elem = document.getElementById(_sTargetID);
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
        SwipeGallery: SwipeImageGallery,
        CustomImageGallery: CustomImageGallery
    }
})();