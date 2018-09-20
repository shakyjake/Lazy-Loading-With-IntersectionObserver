/*
	Lazy loader w/ IntersectionObserver
	- 2018-05-25 Jake Nicholson (www.eskdale.net)
	
	This is free and unencumbered software released into the public domain.

	Anyone is free to copy, modify, publish, use, compile, sell, or
	distribute this software, either in source code form or as a compiled
	binary, for any purpose, commercial or non-commercial, and by any
	means.
	
	In jurisdictions that recognize copyright laws, the author or authors
	of this software dedicate any and all copyright interest in the
	software to the public domain. We make this dedication for the benefit
	of the public at large and to the detriment of our heirs and
	successors. We intend this dedication to be an overt act of
	relinquishment in perpetuity of all present and future rights to this
	software under copyright law.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
	IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
	OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
	ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
	OTHER DEALINGS IN THE SOFTWARE.
	
	For more information, please refer to <http://unlicense.org/>
	
	What's new in this version?
	 - Now lazy-loads on ancient browsers that don't support IntersectionObserver (i.e. IE)
*/

var LazyLoader = function(Selector, RootMargin){

	var _ = this;
	
	_.Observer = null;
	
	_.Selector = Selector;
	
	_.RootMargin = typeof(RootMargin) === 'number' ? RootMargin : 50;
	
	_.ScrollThrottler = null;
	
	_.Elements = [];
	
	_.Attach = function(Img, bLazy){

		if(bLazy){
			
			if(Img.parentNode.nodeName.toLowerCase() === 'picture'){
				
				_.Observer.observe(Img);
				
			} else {
				
				var IsPic, FallBack;
				
				IsPic = Img.nodeName.toLowerCase() === 'picture';
		
				_.Observer.observe(Img);
				
				if(IsPic){
					FallBack = Img.querySelectorAll('img');
					if(!!FallBack.length){
						FallBack.forEach(function(ToWatch){
							_.Observer.observe(ToWatch);
						});
					}
				}
			}
		}
	
	};
	
	_.Loaded = function(event){
		event.target.className = 'lazy-loaded';
	};
	
	_.LoadImage = function(oImg, Observer){
		if(oImg.nodeName.toLowerCase() === 'img'){
			oImg.className = 'lazy-loading';
			oImg.addEventListener('load', _.Loaded);
		}
		var SameSources;
		SameSources = document.querySelectorAll('[data-src=\'' + oImg.dataset.src + '\']');
		SameSources.forEach(function(ToDo){
			Observer.unobserve(ToDo);
			if(!!ToDo.dataset.src.length){
				ToDo.className = ToDo.className === 'lazy-loading' ? 'lazy-loading' : 'lazy-loaded';
				ToDo.src = ToDo.dataset.src;
				ToDo.dataset.src = '';
				if('srcset' in ToDo.dataset){
					if(!!ToDo.dataset.srcset.length){
						ToDo.srcset = ToDo.dataset.srcset;
						ToDo.dataset.srcset = '';
					}
				}
			} else {
				ToDo.className = 'lazy-loaded';
			}
			if('alt' in ToDo.dataset){
				if(!!ToDo.dataset.alt.length){
					ToDo.alt = ToDo.dataset.alt;
					ToDo.dataset.alt = '';
				}
			}
		});
	};
	
	_.LoadPicture = function(oPic, Observer){
		var Sources, SameSources;
		Sources = oPic.querySelectorAll('source');
		Sources.forEach(function(Source){
			SameSources = document.querySelectorAll('[data-srcset=\'' + Source.dataset.srcset + '\']');
			SameSources.forEach(function(ToDo){
				Observer.unobserve(ToDo);
				ToDo.parentNode.className = 'lazy-loaded';
				if(!!ToDo.dataset.srcset.length){
					ToDo.srcset = ToDo.dataset.srcset;
					ToDo.dataset.srcset = '';
				}
			});
		});
	};
	
	_.FallBackLoadImage = function(oImg){
		if(oImg.nodeName.toLowerCase() === 'img'){
			oImg.className = 'lazy-loading';
			oImg.addEventListener('load', _.Loaded);
		}
		var SameSources, SSCount;
		SameSources = document.querySelectorAll('[data-src=\'' + oImg.getAttribute('data-src') + '\']');
		SSCount = SameSources.length;
		while(!!SSCount){
			SSCount -= 1;
			if(!!SameSources[SSCount].getAttribute('data-src').length){
				SameSources[SSCount].className = SameSources[SSCount].className === 'lazy-loading' ? 'lazy-loading' : 'lazy-loaded';
				SameSources[SSCount].src = SameSources[SSCount].getAttribute('data-src');
				SameSources[SSCount].setAttribute('data-src', '');
				if(!!SameSources[SSCount].getAttribute('data-srcset')){
					if(!!SameSources[SSCount].getAttribute('data-srcset').length){
						SameSources[SSCount].srcset = SameSources[SSCount].getAttribute('data-srcset');
						SameSources[SSCount].removeAttribute('data-srcset');
					}
				}
			} else {
				SameSources[SSCount].className = 'lazy-loaded';
			}
			if(!!SameSources[SSCount].getAttribute('data-alt')){
				if(!!SameSources[SSCount].getAttribute('data-alt').length){
					SameSources[SSCount].alt = SameSources[SSCount].getAttribute('data-alt');
					SameSources[SSCount].removeAttribute('data-alt');
				}
			}
		}
		_.Elements = document.querySelectorAll(_.Selector);
	};
	
	_.FallBackLoadPicture = function(oPic){
		oPic.className = 'lazy-loaded';
		var Sources, Source, SameSources, SameSource;
		Sources = oPic.querySelectorAll('source');
		Source = Sources.length;
		while(!!Source){
			Source -= 1;
			SameSources = document.querySelectorAll('[data-srcset="' + Sources[Source].getAttribute('data-srcset') + '"]');
			SameSource = SameSources.length;
			while(!!SameSource){
				SameSource -= 1;
				if(!!SameSources[SameSource].getAttribute('data-srcset').length){
					SameSources[SameSource].srcset = SameSources[SameSource].getAttribute('data-srcset');
					SameSources[SameSource].removeAttribute('data-srcset');
				}
			}
		}
		_.Elements = document.querySelectorAll(_.Selector);
	};
	
	_.DebugFullOffset = function(Element){
		var s;
		s = Element.nodeName.toLowerCase() + ' (' + Element.offsetTop + ')';
		if(!!Element.offsetParent && Element.offsetParent.nodeName.toLowerCase() !== 'body'){
			s = s + ' < ' + _.DebugFullOffset(Element.offsetParent);
		}
		return s;
	};
	
	_.GetFullOffset = function(Element){
		var iOffset;
		iOffset = Element.offsetTop;
		if(!!Element.offsetParent && Element.offsetParent.nodeName.toLowerCase() !== 'body'){
			iOffset += _.GetFullOffset(Element.offsetParent);
		}
		return parseInt(iOffset);
	};
	
	_.FallBackIsIntersecting = function(Element){
		var WindowTop, WindowBottom, ElementTop, ElementBottom;
		WindowTop = (typeof(window.scrollY) === 'undefined' ? document.documentElement.scrollTop : window.scrollY) - _.RootMargin;
		WindowBottom = WindowTop + window.innerHeight + (_.RootMargin * 2);
		ElementTop = _.GetFullOffset(Element);
		ElementBottom = ElementTop + Element.clientHeight;
		
		return ((ElementTop >= WindowTop && ElementTop <= WindowBottom) || (ElementBottom >= WindowTop && ElementBottom <= WindowBottom));
	};
	
	_.FallBackLazyLoad = function(Element){
		if(Element.nodeName.toLowerCase() === 'picture'){
			_.FallBackLoadPicture(Element);
		} else {
			_.FallBackLoadImage(Element);
		}
	};
	
	_.WindowScroll = function(){
	
		var Count;
		
		Count = _.Elements.length;
		
		if(!!Count){
		
			while(!!Count){
				Count -= 1;
				if(_.FallBackIsIntersecting(_.Elements[Count])){
					_.FallBackLazyLoad(_.Elements[Count]);
				}
			}
		
		} else {
			window.removeEventListener('scroll', _.WindowScrollThrottle);
		}
	
	};
	
	_.WindowScrollThrottle = function(){
		clearTimeout(_.ScrollThrottler);
		_.ScrollThrottler = setTimeout(_.WindowScroll, 30);
	};
	
	_.LazyLoad = function(IOE, Observer){
		IOE.forEach(function(Observed){
			if(typeof(Observed.isIntersecting) === 'undefined'){/* cheers for implementing half an API you unrepentant arseholes */
				Observed.isIntersecting = !!Observed.intersectionRatio;
			}
			if(Observed.isIntersecting){
				var Target;
				Target = Observed.target;
				if(Target.nodeName.toLowerCase() === 'picture'){
					_.LoadPicture(Target, Observer);
				} else {
					_.LoadImage(Target, Observer);
				}
			}
		});
	};
	
	_.Wrap = function(Element, bLazy){
		
		var Holder, StupidBoxModel, Width, Height, IsPic, FallBack;
		
		IsPic = Element.nodeName.toLowerCase() === 'picture';
		
		Holder = document.createElement('span');
		Holder.className = 'lazy-holder';
		StupidBoxModel = document.createElement('span');/* Padding is relative to width of parent node for some stupid reason so we need to double-bag it */
		StupidBoxModel.className = 'lazy-responsive';

		if(IsPic){

			FallBack = Element.querySelectorAll('img');
			
			if(!!FallBack.length){

				FallBack = FallBack[0];

				Width = FallBack.getAttribute('width');/* .width/height gives live dimensions, we just want the value of the attribute */
				Height = FallBack.getAttribute('height');

				Width = !!Width ? Width : 1920;
				Height = !!Height ? Height : 1080;

			}

		} else {

			Width = Element.getAttribute('width');
			Height = Element.getAttribute('height');

			Width = !!Width ? Width : 1920;
			Height = !!Height ? Height : 1080;

		}
		
		Holder.style.width = Width + 'px';
		StupidBoxModel.style.width = Width + 'px';
		StupidBoxModel.style.paddingTop = ((Height / Width) * 100) + '%';
		Holder.appendChild(StupidBoxModel);
		StupidBoxModel.appendChild(Element.cloneNode(true));
		Element.parentNode.replaceChild(Holder, Element);
		
		_.Attach(StupidBoxModel.childNodes[0], bLazy);
		
	};
	
	_.Init = function(){
		
		_.Elements = document.querySelectorAll(_.Selector);
		
		if(typeof(IntersectionObserver) !== 'undefined'){
			
			_.Observer = new IntersectionObserver(_.LazyLoad, {
				root: null,
				rootMargin: _.RootMargin + 'px',/* load image before we get to it */
				threshold: 0
			});

			_.Elements.forEach(function(Img){
				_.Wrap(Img, true);
			});
			
		} else {
		
			var Count;
			Count = _.Elements.length;

			while(!!Count){
				Count -= 1;
				_.Wrap(_.Elements[Count], false);
			}
		
			_.Elements = document.querySelectorAll(_.Selector);
			
			window.addEventListener('scroll', _.WindowScrollThrottle);
			 _.WindowScroll();
		}
		
	};
	
	_.Init();

};

(function(){

	window.LazyLoadHandler = new LazyLoader('.js-image,iframe[data-src]');

})();