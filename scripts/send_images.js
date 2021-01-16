(function () {
	/* globals chrome */
	'use strict';

	const imageDownloader = {
		// Source: https://support.google.com/webmasters/answer/2598805?hl=en
		imageRegex: /(?:([^:\/?#]+):)?(?:\/\/([^\/?#]*))?([^?#]*\.(?:bmp|gif|jpe?g|png|svg|webp))(?:\?([^#]*))?(?:#(.*))?/i,

		extractEverything() {
			var listOfShares = [].slice.apply(document.querySelectorAll('span.d2edcug0.hpfvmrgz.qv66sw1b.c1et5uql.oi732d6d.ik7dh3pa.fgxwclzu.a8c37x1j.keod5gw0.nxhoafnm.aigsh9s9.d9wwppkn.fe6kdd0r.mau55g9w.c8b282yb.iv3no6db.jq4qci2q.a3bd9o3v.knj5qynh.m9osqain')).filter((val) => val.innerHTML.indexOf("Share") != -1).filter((val) => val.innerHTML != "Share a photo or write something.");

			// now grab a list of images:
			var listOfImages = [].slice.apply(document.querySelectorAll('div.pmk7jnqg.kr520xx4 > img'));

			// now map that list of images to its share
			var correctListOfShares = listOfImages.map((image) => {
				let imageParent = image.closest(".rq0escxv.l9j0dhe7.du4w35lb.hybvsw6c.ue3kfks5.pw54ja7n.uo3d90p7.l82x9zwi.ni8dbmo4.stjgntxs.k4urcfbm.sbcfpzgs");
				let singleShare = listOfShares.filter((share) => share.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement == imageParent);
				// alert(singleShare[0].innerHTML)
				return singleShare[0];
			}).filter((val) => val != undefined)

			var finalList = [];

			// now we want to append the images onto each part of the correctListOfShares:
			correctListOfShares.forEach(share => {
				// we have the share number here. Now map up to the main container:
				let parent = share.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;

				var listOfImages = [].slice.apply(document.querySelectorAll('div.pmk7jnqg.kr520xx4 > img'));

				listOfImages = listOfImages.filter((image) =>
					parent == image.closest(".rq0escxv.l9j0dhe7.du4w35lb.hybvsw6c.ue3kfks5.pw54ja7n.uo3d90p7.l82x9zwi.ni8dbmo4.stjgntxs.k4urcfbm.sbcfpzgs")
				)

				// now for galleries:
				if (listOfImages.length > 1) {
					for (let i = 0; i < listOfImages.length; i++) {
						let image = listOfImages[i];

						var listOfCaptions = [].slice.apply(document.querySelectorAll('div.kvgmc6g5.cxmmr5t8.oygrvhab.hcukyx3x.c1et5uql.ii04i59q'));

						listOfCaptions = listOfCaptions.filter((caption) =>
							parent == caption.closest(".rq0escxv.l9j0dhe7.du4w35lb.hybvsw6c.ue3kfks5.pw54ja7n.uo3d90p7.l82x9zwi.ni8dbmo4.stjgntxs.k4urcfbm.sbcfpzgs")
						)

						let thing = [{ share: share.innerHTML, src: image.src, image: image, caption: removeTags(listOfCaptions[0].firstChild.innerHTML).replace(/(<([^>]+)>)/gi, "").replace(/"/gi, "").replace(/\?/gi, "").replace(/:/gi, "").replace(/|/gi, "").replace(/~/gi, "").replace(/\*/gi, "").replace(/\//gi, "") }];
						// if (removeTags(listOfCaptions[0].firstChild.innerHTML).replace(/(<([^>]+)>)/gi, "").replace(/"/gi, "").replace(/\?/gi, "").replace(/:/gi, "").replace(/|/gi, "").replace(/~/gi, "").replace(/\*/gi, "").replace(/\//gi, "") == "This grand five-bedroom home was built in 1855 and features many original details! Plus, the third-floor tower offers breathtaking views. It's asking $152K! ") {
						// 	alert(image.src)
						// }

						finalList = finalList.concat(thing);
					}
				}
				else {

					// we also want the correct caption:
					var listOfCaptions = [].slice.apply(document.querySelectorAll('div.kvgmc6g5.cxmmr5t8.oygrvhab.hcukyx3x.c1et5uql.ii04i59q'));

					listOfCaptions = listOfCaptions.filter((caption) =>
						parent == caption.closest(".rq0escxv.l9j0dhe7.du4w35lb.hybvsw6c.ue3kfks5.pw54ja7n.uo3d90p7.l82x9zwi.ni8dbmo4.stjgntxs.k4urcfbm.sbcfpzgs")
					)

					let thing = [{ share: share.innerHTML, src: listOfImages[0].src, image: listOfImages[0], caption: removeTags(listOfCaptions[0].firstChild.innerHTML).replace(/(<([^>]+)>)/gi, "").replace(/"/gi, "").replace(/\?/gi, "").replace(/:/gi, "").replace(/|/gi, "").replace(/~/gi, "").replace(/\*/gi, "").replace(/\//gi, "") }];
					// if (removeTags(listOfCaptions[0].firstChild.innerHTML).replace(/(<([^>]+)>)/gi, "").replace(/"/gi, "").replace(/\?/gi, "").replace(/:/gi, "").replace(/|/gi, "").replace(/~/gi, "").replace(/\*/gi, "").replace(/\//gi, "") == "This grand five-bedroom home was built in 1855 and features many original details! Plus, the third-floor tower offers breathtaking views. It's asking $152K! ") {
					// 	alert(listOfImages[0].src)
					// }

					finalList = finalList.concat(thing);
					// alert(finalList)
					// return ({ share: share.innerHTML, src: listOfImages[0].src, image: listOfImages[0], caption: listOfCaptions[0].firstChild.innerHTML.replace(/(<([^>]+)>)/gi, "").replace(/"/gi, "").replace(/\?/gi, "").replace(/:/gi, "").replace(/|/gi, "").replace(/~/gi, "").replace(/\*/gi, "").replace(/\//gi, "") });
				}
			});

			return finalList;
		},

		extractImagesFromTags() {
			var listOfShares = imageDownloader.extractSharesFromTags()

			// we now map up each to their parent div:
			listOfShares = listOfShares.map((val) => { return val.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement });

			// now grab a list of images:
			var listOfImages = [].slice.apply(document.querySelectorAll('div.pmk7jnqg.kr520xx4 > img'));

			// now filter the list of images to only include those who have a parent equal to a share parent
			var listOfImages2 = listOfImages.filter((image) => listOfShares.includes(image.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement));
			var listOfImages5 = listOfImages.filter((image) => listOfShares.includes(image.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement));
			var listOfImages1 = listOfImages.filter((image) => listOfShares.includes(image.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement));
			var listOfImages4 = listOfImages.filter((image) => listOfShares.includes(image.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement));
			var listOfImages6 = listOfImages.filter((image) => listOfShares.includes(image.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement));
			var listOfImages3 = listOfImages.filter((image) => listOfShares.includes(image.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement));
			listOfImages = listOfImages1.concat(listOfImages2).concat(listOfImages3).concat(listOfImages4).concat(listOfImages5).concat(listOfImages6);

			// 15 parents till the main for both
			return listOfImages
		},

		extractSharesFromTags() {
			var listOfShares = [].slice.apply(document.querySelectorAll('span.d2edcug0.hpfvmrgz.qv66sw1b.c1et5uql.oi732d6d.ik7dh3pa.fgxwclzu.a8c37x1j.keod5gw0.nxhoafnm.aigsh9s9.d9wwppkn.fe6kdd0r.mau55g9w.c8b282yb.iv3no6db.jq4qci2q.a3bd9o3v.knj5qynh.m9osqain')).filter((val) => val.innerHTML.indexOf("Share") != -1).filter((val) => val.innerHTML != "Share a photo or write something.");


			// now grab a list of images:
			var listOfImages = [].slice.apply(document.querySelectorAll('div.pmk7jnqg.kr520xx4 > img'));

			// now grab a list of images:
			// var listOfImages2 = [].slice.apply(document.querySelectorAll('div.pmk7jnqg.kr520xx4 > img')).map((val) => { return val.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement });
			// var listOfImages5 = [].slice.apply(document.querySelectorAll('div.pmk7jnqg.kr520xx4 > img')).map((val) => { return val.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement });
			// var listOfImages1 = [].slice.apply(document.querySelectorAll('div.pmk7jnqg.kr520xx4 > img')).map((val) => { return val.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement });
			// var listOfImages6 = [].slice.apply(document.querySelectorAll('div.pmk7jnqg.kr520xx4 > img')).map((val) => { return val.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement });
			// var listOfImages4 = [].slice.apply(document.querySelectorAll('div.pmk7jnqg.kr520xx4 > img')).map((val) => { return val.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement });
			// var listOfImages3 = [].slice.apply(document.querySelectorAll('div.pmk7jnqg.kr520xx4 > img')).map((val) => { return val.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement });
			// var totalListOfImages = listOfImages1.concat(listOfImages2).concat(listOfImages3).concat(listOfImages4).concat(listOfImages5).concat(listOfImages6);

			// then we map onto each image their correct share value:
			var correctListOfShares = listOfImages.map((image) => {
				let imageParent = image.closest(".rq0escxv.l9j0dhe7.du4w35lb.hybvsw6c.ue3kfks5.pw54ja7n.uo3d90p7.l82x9zwi.ni8dbmo4.stjgntxs.k4urcfbm.sbcfpzgs");
				let singleShare = listOfShares.filter((share) => share.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement == imageParent);
				// alert(singleShare[0].innerHTML)
				return singleShare[0];
			}).filter((val) => val != undefined)

			// now filter the list of images to only include those who have a parent equal to a share parent
			// var filteredListOfShares1 = listOfShares.filter((share) => listOfImages1.includes(share.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement));
			// var filteredListOfShares2 = listOfShares.filter((share) => listOfImages2.includes(share.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement));
			// var filteredListOfShares3 = listOfShares.filter((share) => listOfImages3.includes(share.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement));
			// var filteredListOfShares4 = listOfShares.filter((share) => listOfImages4.includes(share.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement));
			// var filteredListOfShares5 = listOfShares.filter((share) => listOfImages5.includes(share.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement));
			// var filteredListOfShares6 = listOfShares.filter((share) => listOfImages6.includes(share.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement));
			// listOfShares = filteredListOfShares1.concat(filteredListOfShares2).concat(filteredListOfShares3).concat(filteredListOfShares4).concat(filteredListOfShares5).concat(filteredListOfShares6);

			return correctListOfShares
			// return listOfShares
		},

		// extractCaptionsFromTags() {
		// 	// note: this gives the element PARENT of the caption 
		// 	// var listOfCaptions = [].slice.apply(document.querySelectorAll('span.d2edcug0.hpfvmrgz.qv66sw1b.c1et5uql.oi732d6d.ik7dh3pa.fgxwclzu.a8c37x1j.keod5gw0.nxhoafnm.aigsh9s9.d9wwppkn.fe6kdd0r.mau55g9w.c8b282yb.iv3no6db.jq4qci2q.a3bd9o3v.knj5qynh.oo9gr5id'));
		// 	var listOfCaptions = [].slice.apply(document.querySelectorAll('div.kvgmc6g5.cxmmr5t8.oygrvhab.hcukyx3x.c1et5uql.ii04i59q'));

		// 	var listOfShares = [].slice.apply(document.querySelectorAll('span.d2edcug0.hpfvmrgz.qv66sw1b.c1et5uql.oi732d6d.ik7dh3pa.fgxwclzu.a8c37x1j.keod5gw0.nxhoafnm.aigsh9s9.d9wwppkn.fe6kdd0r.mau55g9w.c8b282yb.iv3no6db.jq4qci2q.a3bd9o3v.knj5qynh.m9osqain')).filter((val) =>
		// 		val.innerHTML.indexOf("Share") != -1
		// 	).filter((val) =>
		// 		val.innerHTML != "Share a photo or write something."
		// 	).map((val) => {
		// 		return val.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement
		// 	});
		// 	// now filter the list of images to only include those who have a parent equal to a share parent

		// 	var listOfParents = listOfCaptions.map((caption) => {
		// 		var array = [];
		// 		while (caption) {
		// 			array.unshift(caption);
		// 			caption = caption.parentNode;
		// 		}
		// 		return array;
		// 	})
		// 		.filter((val) => val.className = "rq0escxv l9j0dhe7 du4w35lb hybvsw6c ue3kfks5 pw54ja7n uo3d90p7 l82x9zwi ni8dbmo4 stjgntxs k4urcfbm sbcfpzgs")
		// 	// listOfCaptions = listOfCaptions.filter((caption, index) =>
		// 	// 	// alert(listOfShares.map((val) => { return val.className }))
		// 	// 	// alert(listOfParents[index].map((val) => { return val.className }))
		// 	// 	(listOfParents[index].some(r => listOfShares.indexOf(r) >= 0))
		// 	// )

		// 	// alert(listOfParents[0].map((val) => { return val.className }))
		// 	// alert(listOfParents.map((val) => { return val.map((val) => { return val.className }) }))
		// 	// alert(listOfShares.map((val) => { return val.className }))
		// 	// alert(listOfCaptions.map((val) => { return val.firstChild.innerHTML }))
		// 	return listOfCaptions
		// },

		extractCaptionsFromTags() {
			var listOfCaptions = [].slice.apply(document.querySelectorAll('div.kvgmc6g5.cxmmr5t8.oygrvhab.hcukyx3x.c1et5uql.ii04i59q'));

			var listOfImages = imageDownloader.extractImagesFromTags().map((val) => { return val.closest(".rq0escxv.l9j0dhe7.du4w35lb.hybvsw6c.ue3kfks5.pw54ja7n.uo3d90p7.l82x9zwi.ni8dbmo4.stjgntxs.k4urcfbm.sbcfpzgs") })
			// var listOfShares = imageDownloader.extractSharesFromTags().map((val) => { return val.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement });

			// now filter the list of images to only include those who have a parent equal to a share parent
			listOfCaptions = listOfCaptions.filter((caption) => listOfImages.includes(caption.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement))
			// listOfCaptions = listOfCaptions.filter((caption) => listOfShares.includes(caption.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement))


			// alert(listOfCaptions.map((val) => { return val.firstChild.innerHTML.replace(/(<([^>]+)>)/gi, "").replace(/"/gi, "").replace(/\?/gi, "").replace(/:/gi, "").replace(/|/gi, "").replace(/~/gi, "").replace(/\*/gi, "").replace(/\//gi, "") }))
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
	imageDownloader.captions = imageDownloader.extractCaptionsFromTags().map((val) => { return val.firstChild.innerHTML.replace(/(<([^>]+)>)/gi, "").replace(/"/gi, "").replace(/\?/gi, "").replace(/:/gi, "").replace(/|/gi, "").replace(/~/gi, "").replace(/\*/gi, "").replace(/\//gi, "") });


	imageDownloader.everything = imageDownloader.extractEverything()


	chrome.runtime.sendMessage({
		linkedImages: imageDownloader.linkedImages,
		images: imageDownloader.images,
		captions: imageDownloader.captions,
		shares: imageDownloader.shares,

		everything: imageDownloader.everything
	});

	imageDownloader.linkedImages = null;
	imageDownloader.images = null;
	imageDownloader.shares = null;
	imageDownloader.captions = null;

	imageDownloader.everything = null;
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

var tagBody = '(?:[^"\'>]|"[^"]*"|\'[^\']*\')*';

var tagOrComment = new RegExp(
	'<(?:'
	// Comment body.
	+ '!--(?:(?:-*[^->])*--+|-?)'
	// Special "raw text" elements whose content should be elided.
	+ '|script\\b' + tagBody + '>[\\s\\S]*?</script\\s*'
	+ '|style\\b' + tagBody + '>[\\s\\S]*?</style\\s*'
	// Regular name
	+ '|/?[a-z]'
	+ tagBody
	+ ')>',
	'gi');
function removeTags(html) {
	var oldHtml;
	do {
		oldHtml = html;
		html = html.replace(tagOrComment, '');
	} while (html !== oldHtml);
	return html.replace(/</g, '&lt;');
}

function findFirstChildByClass(element, className) {
	var foundElement = null, found;
	function recurse(element, className, found) {
		for (var i = 0; i < element.childNodes.length && !found; i++) {
			var el = element.childNodes[i];
			var classes = el.className != undefined ? el.className.split(" ") : [];
			for (var j = 0, jl = classes.length; j < jl; j++) {
				if (classes[j] == className) {
					found = true;
					foundElement = element.childNodes[i];
					break;
				}
			}
			if (found)
				break;
			recurse(element.childNodes[i], className, found);
		}
	}
	recurse(element, className, false);
	return foundElement;
}