var Aries = window.Aries || {};
Aries.Plugins = window.Aries.Plugins || {};
Aries.Plugins.ImageGallery = (function ($, undefined) {

    var _loop, _slides, _slidesData, _currentSlide = 0, _loopFirstTime = true, _fallbackSlideShow, _slidesList;
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

    var _nextTransitionSlide = function() {};

    var _prevTransitionSlide = function() {};

    var _nextSlide = function(e) {
        if(e.preventDefault)
            e.preventDefault();

        if(e.stopPropagation)
            e.stopPropagation();

        _resetWidth();

        var jqoGalleryItems = $('.viewer .gallery-item', '#demoGallery');
        var iGallerySize = jqoGalleryItems.length;
        var iNextIndex = _iCurrentSlideIndex + 1;

        if(iNextIndex < iGallerySize) {
            _iCurrentSlideIndex++;
            console.log(_iCurrentSlideIndex);

            if(Modernizr.csstransitions && Modernizr.csstransforms) {
                var jqoListItems = $('.viewer ul li', '#demoGallery');
                var itemWidth = jqoListItems.width().valueOf();
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
                console.log('next: no css transitions');
                var iValue = (_iCurrentSlideIndex * 100);
                var sPosition = iValue == 0 ? 0 : '-' + iValue + '%';
                //$('.viewer .track', '#demoGallery').attr('style', 'left: ' + sPosition);
                $('.viewer .track', '#demoGallery').animate({ left: sPosition }, 600, "easeInOutCubic", function () { });
            }
        }
    }
    var _prevSlide = function(e) {
        if(e.preventDefault)
            e.preventDefault();

        if(e.stopPropagation)
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

        // set gallery
        // var $items = $('.viewer li', '#demoGallery');
        // $items.each(function(index,val){
        //     var imageSrc = $(val).find('img').attr('src');
        //     var sCSSValue = 'background: url('+imageSrc+') left top no-repeat; -webkit-background-size:cover; background-size:cover;';
        //     val.setAttribute("style",sCSSValue);
        //     console.log(val.style);
        //     $(val).find('img').attr('style', 'visibility:hidden;');
        // });

        $('.controls .next', '#demoGallery').bind('click', _nextSlide);
        $('.controls .prev', '#demoGallery').bind('click', _prevSlide);
        //-_resetWidth();

        $(window).on('resize', _resetWidth);

        $("#demoGallery .viewer").swipe({
            //Generic swipe handler for all directions
            swipe:function(event, direction, distance, duration, fingerCount, fingerData) {
                  //$(this).text("You swiped " + direction );  
                  var sDirection = direction;
                  console.log(sDirection);
                  console.log(event);
                  console.log(fingerData);

                if(sDirection == 'left') {
                    _nextSlide({});
                }
                if(sDirection == 'right') {
                    _prevSlide({});
                }
            },
            swipeStatus:function(event, phase, direction, distance, duration, fingerCount)
            {
              //Here we can check the:
              //phase : 'start', 'move', 'end', 'cancel'
              //direction : 'left', 'right', 'up', 'down'
              //distance : Distance finger is from initial touch point in px
              //duration : Length of swipe in MS 
              //fingerCount : the number of fingers used
            },
            triggerOnTouchEnd: true,
            allowPageScroll: "vertical",
            threshold:30,
            fingers:1
        });

        console.log('gallery ready');

        $('#csstransitions label').text(Modernizr.csstransitions);
        $('#csstransforms label').text(Modernizr.csstransforms);

        //Modernizr.video = false;
        //if (Modernizr.video) {
        //    console.log("Video feature present");
        //} else {
        //    _videoFallbackCallback();
        //}
/*
        _videoFallbackCallback();

        _slides = new Array();
        _getSlidesReferences();
        _initSlidesData();
        _transitionInNextSlide();
        _loop = setInterval(function () {
            _transitionOutCurrentSlide();
        }, 12000);
*/
    };

    return {
        Init: _init
    }

})(jQuery, undefined);