/*
	Copyright (c) 2018-01-30 Jake Nicholson
*/

var LazyLoader;
if(typeof(IntersectionObserver) !== 'undefined'){
	LazyLoader = new IntersectionObserver(LazyLoad, {
		root: null,
		rootMargin: '50px',/* load image before we get to it */
		threshold: 0
	});
}

function SetupLazyLoading(Img, bLazy){

	if(bLazy){
		
		if(Img.parentNode.nodeName.toLowerCase() === 'picture'){
			LazyLoader.observe(Img);
		} else {
			
			var Holder, StupidBoxModel, Width, Height, IsPic, FallBack;
			
			IsPic = Img.nodeName.toLowerCase() === 'picture';
			
			Holder = document.createElement('span');
			Holder.className = 'lazy-holder';
			StupidBoxModel = document.createElement('span');
			StupidBoxModel.className = 'lazy-responsive';
	
			if(IsPic){
	
				FallBack = Img.querySelectorAll('img');
				if(!!FallBack.length){
	
					FallBack = FallBack[0];
	
					Width = FallBack.getAttribute('width');/* .width/height gives live dimensions, we just want the value of the attribute */
					Height = FallBack.getAttribute('height');
	
					Width = !!Width ? Width : 1920;
					Height = !!Height ? Height : 1080;
	
				}
	
			} else {
	
				Width = Img.getAttribute('width');
				Height = Img.getAttribute('height');
	
				Width = !!Width ? Width : 1920;
				Height = !!Height ? Height : 1080;
	
			}
			
			Holder.style.width = Width + 'px';
			StupidBoxModel.style.width = Width + 'px';
			StupidBoxModel.style.paddingTop = ((Height / Width) * 100) + '%';
			Holder.appendChild(StupidBoxModel);
			StupidBoxModel.appendChild(Img.cloneNode(true));
			Img.parentNode.replaceChild(Holder, Img);
	
			LazyLoader.observe(StupidBoxModel.childNodes[0]);
			
			if(IsPic){
				FallBack = StupidBoxModel.childNodes[0].querySelectorAll('img');
				if(!!FallBack.length){
					FallBack.forEach(function(ToWatch){
						LazyLoader.observe(ToWatch);
					});
				}
			}
		}

	} else {
		if(Img.nodeName.toLowerCase() === 'img'){
			ActiveLoadImg(Img);
		} else {
			ActiveLoadPic(Img);
		}
	}

}

function DunLoadin(e){
	e.target.className = 'lazy-loaded';
}

function LazyLoadImg(oImg){
	oImg.className = 'lazy-loading';
	oImg.addEventListener('load', DunLoadin);
	oImg.src = oImg.dataset.src;
	oImg.dataset.src = '';
}

function LazyLoadPic(oPic){
	oPic.className = 'lazy-loaded';
	var Sources;
	Sources = oPic.querySelectorAll('source');
	Sources.forEach(function(Source){
		Source.srcset = Source.dataset.srcset;
		Source.dataset.srcset = '';
	});
}

function ActiveLoadImg(oImg){
	oImg.className = 'lazy-loaded';
	oImg.src = oImg.getAttribute('data-src');
}

function ActiveLoadPic(oPic){
	oPic.className = 'lazy-loaded';
	var Sources, Source;
	Sources = oPic.querySelectorAll('source');
	Source = Sources.length;
	while(!!Source){
		Source -= 1;
		Sources[Source].srcset = Sources[Source].getAttribute('data-srcset');
	}
}

function LazyLoad(IOE, Observer){
	IOE.forEach(function(Observed){
		if(Observed.isIntersecting){
			var Target;
			Target = Observed.target;
			if(Target.nodeName.toLowerCase() === 'img'){
				LazyLoadImg(Target);
			} else {
				LazyLoadPic(Target);
			}
			Observer.unobserve(Target);
		}
	});
}

(function(){

	var ToLoad, iToLoad;
	ToLoad = document.querySelectorAll('.js-image');
	iToLoad = ToLoad.length;

	if(typeof(IntersectionObserver) === 'undefined'){

		/* Get outta here, crap browsers */

		while(!!iToLoad){
			iToLoad -= 1;
			SetupLazyLoading(ToLoad[iToLoad], false);
		}

	} else {

		if(!!iToLoad){

			ToLoad.forEach(function(Img){
				SetupLazyLoading(Img, true);
			});

		}

	}

})();