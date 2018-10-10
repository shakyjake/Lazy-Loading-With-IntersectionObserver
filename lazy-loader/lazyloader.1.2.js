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
	 - New markup (don't initialise with a "broken" image)
*/

var LazyLoader;

LazyLoader = function(Selector, RootMargin){

	var _ = this;
	
	_.Observer = null;
	
	_.Selector = Selector;
	
	_.RootMargin = typeof(RootMargin) === 'number' ? RootMargin : 50;
	
	_.ScrollThrottler = null;
	
	_.Elements = [];
	
	_.Loaded = function(event){
		var Target = event.target;
		if(Target.parentNode.nodeName.toLowerCase() === 'picture'){
			Target.parentNode.className = 'lazy-loaded';
		} else {
			Target.className = 'lazy-loaded';
		}
	};
	
	_.LoadResourceObserver = function(Holder, Observer){
		
		Observer.unobserve(Holder);
		
		_.LoadResource(Holder);
		
	};
	
	_.LoadResource = function(Holder){
		
		var Element, Responsive, Type;
		
		Responsive = Holder.querySelector('.lazy-responsive');
		
		Type = Holder.getAttribute('data-type');
		if(!Type){
			Type = 'img';
		}
		
		Element = document.createElement(Type);
		
		Element.className = 'lazy-loading';
		
		switch(Type){
			case 'img':
				Element.addEventListener('load', _.Loaded);
				Element.alt = Holder.getAttribute('data-alt');
				Element.width = Holder.getAttribute('data-width');
				Element.height = Holder.getAttribute('data-height');
				if(!!Holder.getAttribute('data-sizes')){
					Element.sizes = Holder.getAttribute('data-sizes');
				}
				Element.src = Holder.getAttribute('data-src');
				if(!!Holder.getAttribute('data-srcset')){
					Element.srcset = Holder.getAttribute('data-srcset');
				}
				break;
			case 'picture':
				var Child, i, Sources;
				Sources = Holder.Sources.length;
				while(i < Sources){
					Child = document.createElement('source');
					Child.srcset = Holder.Sources[i].Srcset;
					Child.sizes = Holder.Sources[i].Sizes;
					Element.appendChild(Child);
					i += 1;
				}
				Child = document.createElement('img');
				Child.addEventListener('load', _.Loaded);
				Child.alt = Holder.getAttribute('data-alt');
				Child.width = Holder.getAttribute('data-width');
				Child.height = Holder.getAttribute('data-height');
				Child.src = Holder.getAttribute('data-src');
				Element.appendChild(Child);
				break;
			case 'input':
				Element.addEventListener('load', _.Loaded);
				Element.alt = Holder.getAttribute('data-alt');
				Element.width = Holder.getAttribute('data-width');
				Element.height = Holder.getAttribute('data-height');
				Element.src = Holder.getAttribute('data-src');
				break;
			case 'iframe':
				Element.addEventListener('load', _.Loaded);
				Element.width = Holder.getAttribute('data-width');
				Element.height = Holder.getAttribute('data-height');
				Element.src = Holder.getAttribute('data-src');
				break;
		}
		Responsive.appendChild(Element);
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
	
	_.WindowScroll = function(){
	
		var Count;
		
		Count = _.Elements.length;
		
		if(!!Count){
		
			while(!!Count){
				Count -= 1;
				if(_.FallBackIsIntersecting(_.Elements[Count])){
					_.LoadResource(_.Elements[Count]);
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
				_.LoadResourceObserver(Target, Observer);
			}
		});
	};
	
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
	
	_.Wrap = function(Element, UsingIntersection){
		
		var StupidBoxModel, Width, Height, Sources;
		
		Sources = Element.querySelectorAll('.source');
		if(!!Sources.length){
			Element.Sources = [];
			while(!!Sources.length){
				Element.Sources.push({
					Srcset : Sources[0].getAttribute('data-srcset'),
					Sizes : Sources[0].getAttribute('data-sizes')
				});
				Sources[0].parentNode.removeChild(Sources[0]);
			}
		}
		
		Element.className = 'lazy-holder';
		StupidBoxModel = document.createElement('span');/* Padding is relative to width of parent node for some stupid reason so we need to double-bag it */
		StupidBoxModel.className = 'lazy-responsive';

		Width = parseInt(Element.getAttribute('data-width'));
		Height = parseInt(Element.getAttribute('data-height'));

		Width = !!Width ? Width : 1920;
		Height = !!Height ? Height : 1080;
	
		Element.style.width = Width + 'px';
		StupidBoxModel.style.paddingTop = ((Height / Width) * 100) + '%';
		Element.appendChild(StupidBoxModel);
		
		_.Attach(Element, UsingIntersection);
		
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