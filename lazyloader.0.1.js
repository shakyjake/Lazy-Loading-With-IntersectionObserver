/*
	Copyright (c) 2018-01-30 Jake Nicholson
*/

function NoNoScript(NoScript, bLazy){
	if(typeof(NoScript.textContent) === 'undefined'){
		/* IE8 */
		var oFB;
		oFB = document.createElement('img');
		oFB.src = NoScript.getAttribute('data-fallback');
		NoScript.parentNode.replaceChild(oFB, NoScript);
	} else {
		var oSurrogate, oChild;
		oSurrogate = document.createElement('div');
		oSurrogate.innerHTML = NoScript.textContent;
		if(bLazy){
			var oSrc, oImg;
			oSrc = oSurrogate.querySelectorAll('source');
			oSrc.forEach(function(Src){
				Src.dataset.srcset = Src.srcset;
				Src.srcset = '';
			});
			oImg = oSurrogate.querySelectorAll('img');
			oImg.forEach(function(Img){
				Img.dataset.src = Img.src;
				Img.src = '';
			});
		}
		oChild = oSurrogate.childNodes[0];/* Lazy (ha), but noscript only ever has one child */
		NoScript.parentNode.replaceChild(oChild, NoScript);
	}
}

function DunLoadin(o){
	o.target.className = 'lazy-loaded';
}

function LazyLoadImg(oImg){
	oImg.className = 'lazy-loading';
	oImg.addEventListener('load', DunLoadin);
	oImg.src = oImg.dataset.src;
}

function LazyLoadPic(oPic){
	oPic.className = 'lazy-loaded';
	var Sources;
	Sources = oPic.querySelectorAll('source');
	Sources.forEach(function(Source){
		Source.srcset = Source.dataset.srcset;
	});
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
	
	var aNS;
	aNS = document.querySelectorAll('.nojs-image');

	if(typeof(IntersectionObserver) === 'undefined'){
	
		/* Tip: Update your browser to receive lazy loading benefits */
	
		var iNS;
		iNS = aNS.length;
		while(!!iNS){
			iNS -= 1;
			NoNoScript(aNS[iNS], false);
		}
	
	} else {
		
		if(!!aNS.length){
		
			aNS.forEach(function(NoScript){
				NoNoScript(NoScript, true);
			});
	
			var LazyLoader, aPics;
			LazyLoader = new IntersectionObserver(LazyLoad, {
				root: null,
				rootMargin: '200px',/* load image before we get to it */
				threshold: 0
			});
			aPics = document.querySelectorAll('picture,img');
			aPics.forEach(function(Pic){
				LazyLoader.observe(Pic);
			});
		
		}
	
	}

})();