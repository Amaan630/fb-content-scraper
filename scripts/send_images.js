(function () {
	/* globals chrome */
	'use strict';

	const imageDownloader = {
		// Source: https://support.google.com/webmasters/answer/2598805?hl=en
		imageRegex: /(?:([^:\/?#]+):)?(?:\/\/([^\/?#]*))?([^?#]*\.(?:bmp|gif|jpe?g|png|svg|webp))(?:\?([^#]*))?(?:#(.*))?/i,

		extractImagesFromTags() {
			var listOfShares = imageDownloader.extractSharesFromTags()

			// we now map up each to their parent div:
			listOfShares = listOfShares.map((val) => { return val.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement });

			// now grab a list of images:
			var listOfImages = [].slice.apply(document.querySelectorAll('div.pmk7jnqg.kr520xx4 > img'));

			// now filter the list of images to only include those who have a parent equal to a share parent
			listOfImages = listOfImages.filter((image) => listOfShares.includes(image.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement));

			// 15 parents till the main for both
			return listOfImages
		},

		extractSharesFromTags() {
			// return [].slice.apply(document.querySelectorAll('span.d2edcug0.hpfvmrgz.qv66sw1b.c1et5uql.oi732d6d.ik7dh3pa.fgxwclzu.a8c37x1j.keod5gw0.nxhoafnm.aigsh9s9.d9wwppkn.fe6kdd0r.mau55g9w.c8b282yb.iv3no6db.jq4qci2q.a3bd9o3v.knj5qynh.m9osqain')).filter((val) => val.innerHTML.indexOf("Share") != -1).filter((val) => val.innerHTML != "Share a photo or write something.");
			var listOfShares = [].slice.apply(document.querySelectorAll('span.d2edcug0.hpfvmrgz.qv66sw1b.c1et5uql.oi732d6d.ik7dh3pa.fgxwclzu.a8c37x1j.keod5gw0.nxhoafnm.aigsh9s9.d9wwppkn.fe6kdd0r.mau55g9w.c8b282yb.iv3no6db.jq4qci2q.a3bd9o3v.knj5qynh.m9osqain')).filter((val) => val.innerHTML.indexOf("Share") != -1).filter((val) => val.innerHTML != "Share a photo or write something.");

			// we now want to filter out the list to remove the ones who apply to videos:
			// - we need to check if the 15th parent 

			// now grab a list of images:
			var listOfImages = [].slice.apply(document.querySelectorAll('div.pmk7jnqg.kr520xx4 > img')).map((val) => { return val.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement });

			// now filter the list of images to only include those who have a parent equal to a share parent
			listOfShares = listOfShares.filter((share) => listOfImages.includes(share.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement));

			// 15 parents till the main for both
			return listOfShares
		},

		extractCaptionsFromTags() {
			var listOfShares = imageDownloader.extractSharesFromTags()

			// we now map up each to their parent div:
			listOfShares = listOfShares.map((val) => { return val.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement });

			// note: this gives the element PARENT of the caption 
			var listOfCaptions = [].slice.apply(document.querySelectorAll('div.kvgmc6g5.cxmmr5t8.oygrvhab.hcukyx3x.c1et5uql.ii04i59q'));

			// now filter the list of images to only include those who have a parent equal to a share parent
			var mappedLOC = listOfCaptions.map((val) => { return val.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement });

			alert(mappedLOC)
			listOfCaptions = mappedLOC.filter((caption) => listOfShares.includes(caption));

			// 11 parents till the main for the caption
			return listOfCaptions
		},

		extractImagesFromStyles() {
			const imagesFromStyles = [];
			for (let i = 0; i < document.styleSheets.length; i++) {
				const styleSheet = document.styleSheets[i];
				// Prevents `Failed to read the 'cssRules' property from 'CSSStyleSheet': Cannot access rules` error. Also see:
				// https://github.com/vdsabev/image-downloader/issues/37
				// https://github.com/odoo/odoo/issues/22517
				if (styleSheet.hasOwnProperty('cssRules')) {
					const { cssRules } = styleSheet;
					for (let j = 0; j < cssRules.length; j++) {
						const style = cssRules[j].style;
						if (style && style.backgroundImage) {
							const url = imageDownloader.extractURLFromStyle(style.backgroundImage);
							if (imageDownloader.isImageURL(url)) {
								imagesFromStyles.push(url);
							}
						}
					}
				}
			}

			return imagesFromStyles;
		},

		extractURLFromStyle(url) {
			return url.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
		},

		isImageURL(url) {
			return url.indexOf('data:image') === 0 || imageDownloader.imageRegex.test(url);
		},

		removeDuplicateOrEmpty(images) {
			const hash = {};
			for (let i = 0; i < images.length; i++) {
				hash[images[i]] = 0;
			}

			const result = [];
			for (let key in hash) {
				if (key !== '') {
					result.push(key);
				}
			}

			return result;
		}
	};

	imageDownloader.linkedImages = {}; // TODO: Avoid mutating this object in `extractImageFromElement`
	imageDownloader.images = imageDownloader.removeDuplicateOrEmpty(
		[].concat(
			imageDownloader.extractImagesFromTags().map(extractImageFromElement),
			imageDownloader.extractImagesFromStyles(),
		).map(relativeUrlToAbsolute)
	);
	imageDownloader.shares = imageDownloader.extractSharesFromTags().map((val) => { return val.innerHTML });
	// imageDownloader.captions = imageDownloader.extractCaptionsFromTags().map((val) => { return val.firstChild.innerHTML });

	chrome.runtime.sendMessage({
		linkedImages: imageDownloader.linkedImages,
		images: imageDownloader.images,
		// captions: imageDownloader.captions,
		shares: imageDownloader.shares,
	});

	imageDownloader.linkedImages = null;
	imageDownloader.images = null;
	imageDownloader.shares = null;
	imageDownloader.captions = null;
}());

function extractImageFromElement(element) {
	if (element.tagName.toLowerCase() === 'img') {
		let src = element.src;
		const hashIndex = src.indexOf('#');
		if (hashIndex >= 0) {
			src = src.substr(0, hashIndex);
		}
		return src;
	}

	if (element.tagName.toLowerCase() === 'a') {
		const href = element.href;
		if (imageDownloader.isImageURL(href)) {
			imageDownloader.linkedImages[href] = '0';
			return href;
		}
	}

	const backgroundImage = window.getComputedStyle(element).backgroundImage;
	if (backgroundImage) {
		const parsedURL = imageDownloader.extractURLFromStyle(backgroundImage);
		if (imageDownloader.isImageURL(parsedURL)) {
			return parsedURL;
		}
	}

	return '';
};

function relativeUrlToAbsolute(url) {
	return url.indexOf('/') === 0 ? `${window.location.origin}${url}` : url;
};