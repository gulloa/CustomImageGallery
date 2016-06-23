var App = window.App || {};
App.Plugins = window.Aries.Plugins || {};
App.Plugins.ImageGallery = (function ($, undefined) {

    var _loop, _slides, _slidesData, _currentSlide = 0, _loopFirstTime = true, _fallbackSlideShow, _slidesList;
    var _iCurrentSlideIndex = 0;
    var _nTranslateX = 0;

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
        var sCSSTransitionDuration, sCSSTransform, sCSSValue, bIsIE, jqoTrack, iDuration, sPosition, bUsePercentage;
        iDuration = duration;
        sPosition = position;
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

    var _prev = function() {
        // currentImg = Math.max(currentImg - 1, 0);
        // scrollImages(IMG_WIDTH * currentImg, speed);

        console.log('prev');
        var iLength = _getItemsLength();
        var iWidth = _getItemWidth();
        var nDistance = iWidth * _iCurrentSlideIndex;
        var iDuration = 600;
        var iPosition;

        _iCurrentSlideIndex = Math.max(_iCurrentSlideIndex - 1, 0);
        iPosition = -1 * (iWidth * _iCurrentSlideIndex);
        _dragSlides(iPosition, iDuration);
    };

    var _next = function() {
        // currentImg = Math.min(currentImg + 1, maxImages - 1);
        // scrollImages(IMG_WIDTH * currentImg, speed);

        console.log('next');
        var iLength = _getItemsLength();
        var iWidth = _getItemWidth();
        var nDistance = iWidth * _iCurrentSlideIndex;
        var iDuration = 600;

        _iCurrentSlideIndex = Math.min(_iCurrentSlideIndex + 1, iLength - 1);
        _dragSlides('-'+ (iWidth * _iCurrentSlideIndex), iDuration);
    };

    var _dragSlides = function(distance, duration) {
        var bCSSTransitions = Modernizr.csstransitions;
        var bCSSTransforms = Modernizr.csstransforms;
        var jqoTrack = $('.viewer .track', '#demoGallery');
        var iDuration = (duration / 1000).toFixed(1); //- console.log('iDuration: '+iDuration)
        //var iDuration = duration.toFixed(1);
        //var sPosition = (iDuration > 0 ? "" : "-") + Math.abs(distance).toString() + 'px'; console.log('drag position: '+sPosition);
        //var sPosition = Math.abs(distance).toString() + 'px'; console.log('drag position: '+sPosition);
        var sPosition = distance + 'px'; //- console.log('drag position: '+sPosition);

        if(bCSSTransitions && bCSSTransforms) {
            _setAnimationProperties(jqoTrack, iDuration, sPosition);
            var iWidth = _getItemWidth();
            _nTranslateX = (iWidth * _iCurrentSlideIndex);
        }

        /*$("#demoGallery .track").css("transition-duration", (duration / 1000).toFixed(1) + "s");
        
        //inverse the number we set in the css
        var value = (distance < 0 ? "" : "-") + Math.abs(distance).toString();
        $("#demoGallery .track").css("transform", "translate(" + value + "px,0)");*/
    };

    var _swipeStatus = function(event, phase, direction, distance) {
        var sPhase = phase; 
        console.log('direction: '+direction);
        console.log('distance: '+distance);

        switch(sPhase) {
            case "move":
                var sDirection = direction;
                var iDistance = distance;
                var iDuration = 0;
                var iItemWidth = _getItemWidth();
                var iPosition;

                if(sDirection == "left") {
                    
                    //-iPosition = -1 * ((iItemWidth * _iCurrentSlideIndex) + iDistance);
                    //iPosition = _iCurrentSlideIndex == 0 ? '' : '-' + iPosition;

                    var iTrackPositionX =  _nTranslateX - distance; console.log('iTrackPositionX: '+iTrackPositionX);
                    iPosition = iTrackPositionX; console.log('iPosition: '+iPosition);
                    iPosition = -(distance);
                    _dragSlides(iPosition, iDuration); console.log('_nTranslateX: '+_nTranslateX);
                }
                else if(sDirection == "right") {
                    iPosition = -1 * ((iItemWidth * _iCurrentSlideIndex) - iDistance);
                    //iPosition = _iCurrentSlideIndex == 0 ? '' : '-' + iPosition;
                    _dragSlides(iPosition, iDuration);
                }
                break;

            case "cancel":
                var iDuration = 600;
                var iItemWidth = _getItemWidth();
                var iPosition;

                iPosition = (iItemWidth * _iCurrentSlideIndex);
                _dragSlides(iPosition, iDuration);
                break;

            case "end":
                console.log('end');

                var sDirection = direction;
                if(sDirection == "left") {
                    _next();
                    //-_nextSlide();
                }
                else if(sDirection == "right") {
                    _prev();
                    //-_prevSlide();
                }
                break;

            default:
                break;
        }
    };

    var _nextSlide = function(e, arguments) {
        if(e && e.preventDefault)
            e.preventDefault();

        if(e && e.stopPropagation)
            e.stopPropagation();

        //_resetWidth();

        //get next gallery item
        var jqoGalleryItems = $('.viewer .gallery-item', '#demoGallery');
        var iGallerySize = jqoGalleryItems.length;
        var iNextIndex = _iCurrentSlideIndex + 1;

        if(iNextIndex < iGallerySize) {
            var jqoListItems = $('.viewer ul li', '#demoGallery');
            var itemWidth = jqoListItems.width().valueOf();
            var jqoTrack= $('.viewer .track', '#demoGallery');
            var iTrackWidth = jqoTrack.width();
            var isIE = _getIEVersion();
            var bCSSTransitions = Modernizr.csstransitions;
            var bCSSTransforms = Modernizr.csstransforms;

            if(bCSSTransitions && bCSSTransforms) {
                if(arguments) {
                    console.log('has arguments: ' + arguments);
                    
                        var oArguments = arguments;
                        var iValue = (_iCurrentSlideIndex * itemWidth) + oArguments.x;
                        var nPercentage = (iValue * 100) / iTrackWidth; console.log('percentage: ' + nPercentage);
                        var sPosition = iValue == 0 ? 0 : '-' + Math.round(nPercentage)+'%';
                        var iDuration = oArguments.t;
                        var sCSSTransitionDuration =    '-webkit-transition-duration: ' + iDuration + 's;' + 
                                                        '-moz-transition-duration: ' + iDuration + 's;' + 
                                                        'transition-duration: ' + iDuration + 's;'; 

                        var sCSSTransform =     '-webkit-transform: translate(' + sPosition + ',0);' + 
                                                '-moz-transform: translate(' + sPosition + ',0);' + 
                                                'transform: translate(' + sPosition + ',0);'; 
                        var sCSSValue = sCSSTransitionDuration + sCSSTransform;
                        
                    if(isIE == false) {
                        jqoTrack.attr('style', sCSSValue);

                        // $('.viewer .track', '#demoGallery').css("transition-duration", iDuration+"s");
                        // $('.viewer .track', '#demoGallery').attr('style', '-webkit-transform: ' + 'translate('+sPosition+',0);');
                    } else {
                        sCSSTransitionDuration =    '-ms-transition-duration: ' + iDuration + 's;' + 
                                                        'transition-duration: ' + iDuration + 's;';

                        sCSSTransform =     '-ms-transform: translate(' + sPosition + ',0);' + 
                                                'transform: translate(' + sPosition + ',0);';
                        sCSSValue = sCSSTransitionDuration + sCSSTransform;

                        jqoTrack.attr('style', sCSSValue);

                        // $('.viewer .track', '#demoGallery').css("transition-duration", iDuration+"s");
                        // $('.viewer .track', '#demoGallery').attr('style', '-ms-transform: ' + 'translate('+sPosition+',0)');
                    }
                    //return;
                }
                else {
                    _iCurrentSlideIndex++;
                    console.log(_iCurrentSlideIndex);

                    var iValue = (_iCurrentSlideIndex * itemWidth);
                    var nPercentage = (iValue * 100) / iTrackWidth; console.log('percentage: ' + nPercentage);
                    //var sPosition = iValue == 0 ? 0 : '-' + iValue+'px';
                    var sPosition = iValue == 0 ? 0 : '-' + Math.round(nPercentage)+'%';
                    
                    if(isIE == false) {
                        $('.viewer .track', '#demoGallery').attr('style', '-webkit-transform: ' + 'translate('+sPosition+',0)');
                    } else {
                        $('.viewer .track', '#demoGallery').attr('style', '-ms-transform: ' + 'translate('+sPosition+',0)');
                    }
                }
            }
            else {
                console.log('next: no css transitions');
                var iValue = (_iCurrentSlideIndex * 100);
                var sPosition = iValue == 0 ? 0 : '-' + iValue + '%';
                //$('.viewer .track', '#demoGallery').attr('style', 'left: ' + sPosition);
                $('.viewer .track', '#demoGallery').animate({ left: sPosition }, 600, "easeInOutCubic", function () { });
            }
        }
    }
    var _prevSlide = function(e) {
        if(e && e.preventDefault)
            e.preventDefault();

        if(e && e.stopPropagation)
            e.stopPropagation();

        _resetWidth();

        var jqoGalleryItems = $('.viewer .gallery-item', '#demoGallery');
        var iGallerySize = jqoGalleryItems.length;
        var iNextIndex = _iCurrentSlideIndex - 1;

        if(iNextIndex >= 0) {
            _iCurrentSlideIndex--;
            console.log(_iCurrentSlideIndex);

            if(Modernizr.csstransitions && Modernizr.csstransforms) {
                var jqoListItems = $('.viewer ul li', '#demoGallery');
                var itemWidth = jqoListItems.width();
                var iValue = (_iCurrentSlideIndex * itemWidth);
                var iTrackWidth = $('.viewer .track', '#demoGallery').width();
                var nPercentage = (iValue * 100) / iTrackWidth; console.log('percentage: ' + nPercentage);
                //var sPosition = iValue == 0 ? 0 : '-' + iValue+'px';
                var sPosition = iValue == 0 ? 0 : '-' + Math.round(nPercentage)+'%';
                var isIE = _getIEVersion();
                if(isIE == false) {
                    $('.viewer .track', '#demoGallery').attr('style', '-webkit-transform: ' + 'translate('+sPosition+',0)');
                } else {
                    $('.viewer .track', '#demoGallery').attr('style', '-ms-transform: ' + 'translate('+sPosition+',0)');
                }
            }
            else {
                console.log('prev: no css transitions');
                var iValue = (_iCurrentSlideIndex * 100);
                var sPosition = iValue == 0 ? 0 : '-' + iValue + '%';
                //$('.viewer .track', '#demoGallery').attr('style', 'left: ' + sPosition);
                $('.viewer .track', '#demoGallery').animate({ left: sPosition }, 600, "easeInOutCubic", function () { });
            }
        }
    }
    var _resetWidth = function() {
        var $viewer = $('.viewer', '#demoGallery');
        var $items = $('.viewer li', '#demoGallery');
        var iItemsCount = $items.length;
        var nItemWidth = 100/iItemsCount;

        var iViewerWidth =  $viewer.width().valueOf();
        //var iViewerWidth = $viewer[0].getBoundingClientRect().round(); 

        console.log('iViewerWidth: ' + iViewerWidth);
        //$viewer.width('100%');
        //$items.attr('style', 'width: '+ iViewerWidth + 'px; max-width:'+ iViewerWidth + 'px;');
        //$items.attr('style', 'width: '+ nItemWidth + '%; max-width:'+ nItemWidth + '%;');
        //-$items.attr('style', 'width: '+ nItemWidth + '%;');

        var sCSSValue = Math.round(nItemWidth).toString() + '%;';
        console.log('css width: '+ sCSSValue);
        // $items.each(function(index,val){
        //     val.setAttribute("style",sCSSValue);
        //     console.log(val.style)
        // });
        //$viewer.width(iViewerWidth+'px');
    };

    var _init = function () {
        _extendJQueryEasing();


        $('.controls .next', '#demoGallery').bind('click', _nextSlide);
        $('.controls .prev', '#demoGallery').bind('click', _prevSlide);
        //-_resetWidth();

        $(window).on('resize', _resetWidth);

        // $("#demoGallery .viewer").swipe({
        //     //Generic swipe handler for all directions
        //     swipe:function(event, direction, distance, duration, fingerCount, fingerData) {
        //           //$(this).text("You swiped " + direction );  
        //           var sDirection = direction;
        //           console.log(sDirection);
        //           console.log(event);
        //           console.log(fingerData);

        //         if(sDirection == 'left') {
        //             _nextSlide({});
        //         }
        //         if(sDirection == 'right') {
        //             _prevSlide({});
        //         }
        //     },
        //     swipeStatus:function(event, phase, direction, distance, duration, fingerCount)
        //     {
        //       //Here we can check the:
        //       //phase : 'start', 'move', 'end', 'cancel'
        //       //direction : 'left', 'right', 'up', 'down'
        //       //distance : Distance finger is from initial touch point in px
        //       //duration : Length of swipe in MS 
        //       //fingerCount : the number of fingers used
        //     },
        //     triggerOnTouchEnd: false,
        //     allowPageScroll: "vertical",
        //     threshold:30,
        //     fingers:1
        // });

        console.log('gallery ready');

        $('#csstransitions label').text(Modernizr.csstransitions);
        $('#csstransforms label').text(Modernizr.csstransforms);



        var IMG_WIDTH = Math.round($("#demoGallery .viewer li").width());
        var currentImg = _iCurrentSlideIndex;
        var maxImages = $("#demoGallery .viewer li").length;
        var speed = 600;

        function previousImage() {
            currentImg = Math.max(currentImg - 1, 0);
            scrollImages(IMG_WIDTH * currentImg, speed);
        }

        function nextImage() {
            currentImg = Math.min(currentImg + 1, maxImages - 1);
            scrollImages(IMG_WIDTH * currentImg, speed);
        }

        function scrollImages(distance, duration) {
            $("#demoGallery .track").css("transition-duration", (duration / 1000).toFixed(1) + "s");

            //inverse the number we set in the css
            var value = (distance < 0 ? "" : "-") + Math.abs(distance).toString();
            $("#demoGallery .track").css("transform", "translate(" + value + "px,0)");
        }

        //drag and swipe
        function swipeStatus(event, phase, direction, distance) {

            //If we are moving before swipe, and we are going L or R in X mode, or U or D in Y mode then drag.
            if (phase == "move" && (direction == "left" || direction == "right")) {
                var duration = 0;

                if (direction == "left") {
                    /*IMG_WIDTH = Math.round($("#demoGallery .viewer li").width().valueOf());
                    scrollImages((IMG_WIDTH * currentImg) + distance, duration); */

                    // console.log('left d:' + distance);
                    // var arguments = {
                    //     x: distance,
                    //     t: duration
                    // }
                    // _nextSlide(event, arguments);

                    IMG_WIDTH = Math.round($("#demoGallery .viewer li").width().valueOf());
                    //_dragSlides((IMG_WIDTH * currentImg) + distance, duration);
                    _dragSlides((IMG_WIDTH * _iCurrentSlideIndex) + distance, duration);

                    /*var iItemWidth = Math.round($("#demoGallery .viewer li").width().valueOf());
                    var nDistance = (iItemWidth * _iCurrentSlideIndex) + distance;
                    _dragSlides(nDistance, duration);*/

                } else if (direction == "right") {
                    //scrollImages((IMG_WIDTH * currentImg) - distance, duration); //_prevSlide();

                    IMG_WIDTH = Math.round($("#demoGallery .viewer li").width().valueOf());
                    _dragSlides((IMG_WIDTH * _iCurrentSlideIndex) - distance, duration);
                }

            } else if (phase == "cancel") {
                //scrollImages(IMG_WIDTH * currentImg, speed);
                //-scrollImages(IMG_WIDTH * _iCurrentSlideIndex, speed);
                _dragSlides((IMG_WIDTH * _iCurrentSlideIndex), duration); console.log('duration: '+duration);
            } else if (phase == "end") {
                if (direction == "right") {
                    //previousImage();
                    _prev();
                } else if (direction == "left") {
                    //- nextImage();
                    //_nextSlide();
                    _next();
                }
            }
        }

        var swipeOptions = {
            triggerOnTouchEnd: true,
            swipeStatus: _swipeStatus,
            allowPageScroll: "vertical",
            threshold: 90
        };

        imgs = $("#demoGallery .viewer");
        imgs.swipe(swipeOptions);

    };

    return {
        Init: _init
    }

})(jQuery, undefined);