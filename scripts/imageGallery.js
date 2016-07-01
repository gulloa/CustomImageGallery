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
        sPosition = !usePercentage ? position.toString() + 'px' : "";
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
        var bCanSwipeNextIndex = direction == "next" ? (iNextIndex < iGallerySize) : iNextIndex >= 0;  console.log('bCanSwipeNextIndex: '+bCanSwipeNextIndex);

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
                var sPosition = iValue == 0 ? 0 : '-' + Math.round(nPercentage)+'%';

                if(!isIE) {
                    jqoTrack.attr('style', '-webkit-transform: ' + 'translate('+sPosition+',0)');
                    //_setAnimationProperties(jqoTrack, iDuration, distance);
                } else {
                    jqoTrack.attr('style', '-ms-transform: ' + 'translate('+sPosition+',0)');
                    //_setAnimationProperties(jqoTrack, iDuration, distance);
                }
            } 
            else {
                var iValue = (_iCurrentSlideIndex * 100);
                var sPosition = iValue == 0 ? 0 : '-' + iValue + '%';
                jqoTrack.animate({ left: sPosition }, 600, "easeInOutCubic", function () { });
            }
        }
    };

    var _nextSlide = function() {
        _swipeImages(event, "next");
    }
    var _prevSlide = function() {
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

    var _init = function () {
        _extendJQueryEasing();

        $('.controls .next', '#demoGallery').bind('click', _nextSlide);
        $('.controls .prev', '#demoGallery').bind('click', _prevSlide);

        $('#csstransitions label').text(Modernizr.csstransitions);
        $('#csstransforms label').text(Modernizr.csstransforms);

        var swipeOptions = {
            triggerOnTouchEnd: true,
            swipeStatus: _swipeCallback, //_swipeStatus,
            allowPageScroll: "vertical",
            threshold: 90
        };

        var jqoImgs = $("#demoGallery .viewer");
        jqoImgs.swipe(swipeOptions);

    };

    return {
        Init: _init
    }

})(jQuery, undefined);