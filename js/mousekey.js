var units;
var pageSetup, pageLayout, pageOrder, pageAlt;
var pageAltArr = [];
var pageSavedArr = [];
var unitScale = {'in': 1, 'px': 96, 'mm': 25.4};

var mode = 'landing';
var placeMode = 'none';
var placeClicked = false;
var cellHover = {'bool':false, 'r':0, 'c':0};
var cellSelected = {'r': 0, 'c': 0, 'r2': 0, 'c2': 0};
var elementSelectedID = '';
var elementMove = false;
var elementScale = false;
var elementScaleCorner = 0;
var elementTransform = false;
var elementPos = {'x':0, 'y':0};
var elementSize = {'w':0, 'h':0};
var elementCount = 0;
var elementOrderID = {'a':'', 'b':''};

var cellHighlightCol = 'rgba(0, 255, 150, 0.3)';
var cellSelectedCol = 'rgba(0, 255, 150, 0.6)';

var mouseInWarningLeave = false;
var mouseInColorPicker = false;
var mouseInLayer = false;
var mouseInSavedAltDiv = false;
var mouseInHelpDiv = false;
var altJustAdded = false;
var colorPicking = false;
var mousePos = {'x':0, 'y':0};
var rememberMousePos = {'x':0, 'y':0};
var cornerSize = 12;
var boundingBoxSize = 3;

var bgDark = false;

window.onbeforeunload = function(e) {
  var dialogText = 'Have you saved your work?';
  e.returnValue = dialogText;
  return dialogText;
};

$(document).scroll(function(e) {
	if ($('body').width() > 1200) {
		var h1 = $('#saved_alt_list').outerHeight();
		var h2 = $('#saved_alt_title').outerHeight();
		var h = 0;
		if ($('#saved_alt_div').hasClass('active') && $('#saved_alt_div').hasClass('open')) {
			h = h1 + h2;
		}
		switch (mode) {
			case 'pageLayout':
				if (!$('#view_fullscreen').hasClass('active')) {
					var sT = $(window).scrollTop() + $('#page_layout_page .page_container .page').height();
					if (sT < $(document).height()-400-h) {
						$('#page_layout_page .page_container').css('margin-top', $(window).scrollTop()*0.95 + 'px');
					}
				}
				break;
			// case 'pageOrder':
			// 	var sT = $(window).scrollTop() + $('#page_order_page .page_container .page').height();
			// 	if (sT < $(document).height()-400-h) {
			// 		$('#page_order_page .page_container').css('margin-top', $(window).scrollTop() + 'px');
			// 	}
			// 	break;
			case 'pageAlt':
				var sT = $(window).scrollTop() + $('#page_alt_page .page_container .page').height();
				if (sT < $(document).height()-400-h) {
					$('#page_alt_page .page_container').css('margin-top', $(window).scrollTop() + 'px');
				}
				break;
		}
	}
});

$(document).keyup(function(e) {
	switch(e.which) {
		case 27: // escape key maps to keycode `27`
			if ($('#help_container').hasClass('active')) {
				$('#help_container').removeClass('active');
				logEvent(mode);
			}
	        if ($('#warning_div').hasClass('active')) {
	        	$('#warning_div.active').toggleClass('active');
	        	$('#warning_leave').css('display', 'block');
	        } else {
	        	if (!$('#color_picker_div').hasClass('hide')) {
	        		$('#color_picker_div').addClass('hide');
	        	} else {
		        	switch (mode) {
		        		case 'pageLayout':
		        			$(window).scrollTop(0);
		        			clearLayoutSelection();
		        			if ($('#view_fullscreen').hasClass('active')) {
					        	$('#view_fullscreen').toggleClass('active');
					        	placeMode = 'none';
					        	logEvent(mode);
					        }
		        			break;
		        		case 'pageOrder':
		        			editOrderMenu('', '');
		        			break;
		        		case 'pageAlt':
		        			if ($('#view_fullscreen').hasClass('active')) {
					        	$('#view_fullscreen').toggleClass('active');
					        	logEvent(mode);
					        	if ($('.page_box.clicked').length > 0) {
						        	$('html,body').animate({
							          scrollTop: $('.page_box.clicked').offset().top-150
							        }, 100);
						        }
					        } else {
					        	$('.page_box.clicked').toggleClass('clicked');
					        }
		        			break;
		        	}
		        }
	        }
        	break;
        case 13: //enter
        	if (mode=='landing') {
        		$('#landing_start').toggleClass('active');
        		setTimeout(function() {
        			$('#landing_start.active').toggleClass('active');
        		}, 100);

        		landingStartClick();
        	}
        	break;
        case 37:
        	var count = 0;
        	$('input').each(function() {
        		if ($(this).is(':focus')) {
	        		count++;
	        	}
        	});
        	$('textarea').each(function() {
        		if ($(this).is(':focus')) {
	        		count++;
	        	}
        	});
        	if (count <= 0 && !$('#view_fullscreen').hasClass('active')) {
        		if (!$('#warning_div').hasClass('active')) {
	        		$('#back_button').click();
	        	}
	        }
        	break;
        case 39:
			var count = 0;
        	$('input').each(function() {
        		if ($(this).is(':focus')) {
	        		count++;
	        	}
        	});
        	$('textarea').each(function() {
        		if ($(this).is(':focus')) {
	        		count++;
	        	}
        	});
        	if (count <= 0 && !$('#view_fullscreen').hasClass('active')) {
        		if (!$('#warning_div').hasClass('active')) {
	        		$('#next_button').click();
	        	}
	        }        	
	        break;
	}
});


/////////////////////////
//                     //
//  MOUSE MOVE EVENTS  //
//                     //
/////////////////////////

$(document).mousemove(function(e) {
	mousePos.x = e.pageX;
	mousePos.y = e.pageY;
	switch (mode) {
		case 'pageLayout':
			if (placeMode!='none') {
				$('.cell.highlight:not(.selected)').css('background', 'none');
				if (placeMode!='edit' && placeMode!='content' && !placeClicked) {
					$('.cell.highlight').css('background', cellHighlightCol);
					$('.cell:not(.highlight)').css('background', 'none');
				} else if (placeMode!='edit' && placeMode!='content' && placeClicked) {
					cellSelected.c2 = cellHover.c;
					cellSelected.r2 = cellHover.r;
					pageLayout.renderCellArea('page_layout_page', cellSelected.c, cellSelected.r, cellSelected.c2, cellSelected.r2);
					var marginOffset = $('#page_layout_page .page_container .page .margin').offset();
					var xOffset = mousePos.x - marginOffset.left;
					var yOffset = mousePos.y - marginOffset.top;
					pageLayout.renderSelectionBox('page_layout_page', xOffset, yOffset, cellSelected.c, cellSelected.r);
				} else if (placeMode=='edit' || placeMode=='content') {
					if (elementMove && !elementScale && elementSelectedID!='') {
						pageLayout.renderElementMove('page_layout_page', elementSelectedID);
						checkNewOrder(elementSelectedID);
					} else if (elementScale) {
						pageLayout.renderElementScale('page_layout_page', elementSelectedID);
						checkNewOrder(elementSelectedID);
					}
				}
			}
			break;
	}
});

function checkNewOrder(eID) {
	var elemID = eID.split('_')[0];
	var delArr = [];
	for (i in pageLayout.order) {
		var elemAID = '';
		var elemBID = '';
		if (pageLayout.order[i].a==elemID || pageLayout.order[i].b==elemID) {
			elemAID = pageLayout.order[i].a;
			elemBID = pageLayout.order[i].b;
		}
		if (elemAID!='' && elemBID!='') {
			var indexA = -1;
			var indexB = -1;
			for (j in pageLayout.element) {
				if (elemAID==pageLayout.element[j].id) {
					indexA = j;
				}
				if (elemBID==pageLayout.element[j].id) {
					indexB = j;
				}
			}
			if (indexA != -1 && indexB != -1) {
				var stateX = pageLayout.order[i].state.x;
				var stateY = pageLayout.order[i].state.y;
				switch (stateX) {
					case '-1':
						if (pageLayout.element[indexA].pos.x > pageLayout.element[indexB].pos.x) {
							pageLayout.order[i].state.x = '1';
						}
						break;
					case '0':
						if (pageLayout.element[indexA].pos.x != pageLayout.element[indexB].pos.x) {
							pageLayout.order[i].state.x = 'false';
						}
						break;
					case '1':
						if (pageLayout.element[indexA].pos.x < pageLayout.element[indexB].pos.x) {
							pageLayout.order[i].state.x = '-1';
						}
						break;
					case 'false':
						break;
				}
				switch (stateY) {
					case '-1':
						if (pageLayout.element[indexA].pos.y > pageLayout.element[indexB].pos.y) {
							pageLayout.order[i].state.y= '1';
						}
						break;
					case '0':
						if (pageLayout.element[indexA].pos.y != pageLayout.element[indexB].pos.y) {
							pageLayout.order[i].state.y = 'false';
						}
						break;
					case '1':
						if (pageLayout.element[indexA].pos.y < pageLayout.element[indexB].pos.y) {
							pageLayout.order[i].state.y = '-1';
						}
						break;
					case 'false':
						break;
				}
				if (pageLayout.order[i].state.x=='false' && pageLayout.order[i].state.y=='false') {
					delArr.push(i);
				}
			}
		}
	}
	delArr.sort(function(a, b) {
	  return b - a;
	});
	for (var i=0; i<delArr.length; i++) {
		pageLayout.order.splice(delArr[i], 1);
	}
}

var mouseDown = false;

$(document).mouseup(function(e) {
	mouseDown = false;
	if (elementMove) {
		logEvent('pageLayout-elementMoved');
	}
	if (elementScale) {
		logEvent('pageLayout-elementScaled');
	}
	if (elementMove || elementScale) {
		elementMove = false;
		elementScale = false;
		elementTransform = true;
	}
	switch(mode) {
		case 'pageLayout':
			switch(placeMode) {
				case 'edit':
					$('#temp_box').remove();
					break;
				case 'content':
					$('#temp_box').remove();
					break;
			}
			break;
	}
	$('body').css('cursor', 'default');
});

$(document).mousedown(function(e) {
	mouseDown = true;
});





//////////////////////////
//                      //
//  MOUSE CLICK EVENTS  //
//                      //
//////////////////////////

$(document).on('click', function(e) {

	if (mode=='landing') {
		$('.initial').removeClass('initial');
	}

	if (!mouseInColorPicker && !colorPicking) {
		$('#color_picker_div').addClass('hide');
	} else if (colorPicking) {
		colorPicking = false;
	}

	if (!mouseInSavedAltDiv && $('#saved_alt_div').hasClass('open') && !altJustAdded) {
		$('#saved_alt_div').removeClass('open');
		updatePageHeight();
	} else if (altJustAdded) {
		altJustAdded = false;
	}

	switch (mode) {
		case 'pageLayout':
			switch (placeMode) {
				case 'text':
					if (cellHover.bool && !placeClicked) {
						cellSelected.r = cellHover.r;
						cellSelected.r2 = cellHover.r;
						cellSelected.c = cellHover.c;
						cellSelected.c2 = cellHover.c;
						$('.cell.row_'+cellHover.r+'.col_'+cellHover.c).toggleClass('selected');
						$('.cell.selected').css('background', cellSelectedCol);
						pageLayout.renderCellArea('page_layout_page', cellSelected.c, cellSelected.r, cellSelected.c2, cellSelected.r2);
						placeClicked = true;
						$('#layout_instructions').html('<p>Select object area.</p>');
					} else if (placeClicked) {
						var cStart = cellSelected.c <= cellSelected.c2 ? cellSelected.c : cellSelected.c2;
				        var cEnd = cellSelected.c <= cellSelected.c2 ? cellSelected.c2 : cellSelected.c;
				        var rStart = cellSelected.r <= cellSelected.r2 ? cellSelected.r : cellSelected.r2;
				        var rEnd = cellSelected.r <= cellSelected.r2 ? cellSelected.r2 : cellSelected.r;
				        var tAlign = 'left';
				        var vAlign = 'flex-start';
				        switch($('#type_align .type_option_button.active').attr('id')) {
							case 'align_left':
								tAlign = 'left';
								break;
							case 'align_center':
								tAlign = 'center';
								break;
							case 'align_right':
								tAlign = 'right';
								break;
						}
						switch($('#type_vertical .type_option_button.active').attr('id')) {
							case 'vertical_top':
								vAlign = 'flex-start';
								break;
							case 'vertical_center':
								vAlign = 'center';
								break;
							case 'vertical_bottom':
								vAlign = 'flex-end';
								break;
						}
						pageLayout.element.push(
							new elementText(
								'textObject-'+elementCount, 'Text Object',
								cStart, rStart, cEnd-cStart+1, rEnd-rStart+1,
								$('#typeface_div select').val(),
								$('input[name=font_size]').val(),
								$('input[name=font_weight]').val(),
								'none',
								'none',
								$('input[name=letter_spacing]').val(),
								$('input[name=line_height]').val(),
								tAlign,
								vAlign,
								$('input[name=font_color]').val(),
								$('input[name=bg_color]').val(),
								$('input[name=padding]').val()
							)
						);
						logEvent('pageLayout-elementAdded-text-'+pageLayout.element.length);
						elementCount++;
						clearLayoutSelection();
						pageLayout.renderElements('page_layout_page');
						if ($('.display_blocks').hasClass('active')) {
							$('.element').addClass('background');
						}
						elementSelectedID = pageLayout.element[pageLayout.element.length-1].id+'_element';
						$('#'+elementSelectedID).toggleClass('selected');
						placeMode = 'content';
						editContentClick(elementSelectedID, true);
						pageLayout.renderTransformBox('page_layout_page', elementSelectedID);
						$('#layout_toolbar .active').toggleClass('active');
						$('#edit_content').addClass('active');
						$('.cell').css('pointer-events', 'none');
						$('.element').css('cursor', 'pointer');
					}
					break;
				case 'image':
					if (cellHover.bool && !placeClicked) {
						cellSelected.r = cellHover.r;
						cellSelected.r2 = cellHover.r;
						cellSelected.c = cellHover.c;
						cellSelected.c2 = cellHover.c;
						$('.cell.row_'+cellHover.r+'.col_'+cellHover.c).toggleClass('selected');
						$('.cell.selected').css('background', cellSelectedCol);
						pageLayout.renderCellArea('page_layout_page', cellSelected.c, cellSelected.r, cellSelected.c2, cellSelected.r2);
						placeClicked = true;
						$('#layout_instructions').html('<p>Select object area.</p>');
					} else if (placeClicked) {
						var cStart = cellSelected.c <= cellSelected.c2 ? cellSelected.c : cellSelected.c2;
				        var cEnd = cellSelected.c <= cellSelected.c2 ? cellSelected.c2 : cellSelected.c;
				        var rStart = cellSelected.r <= cellSelected.r2 ? cellSelected.r : cellSelected.r2;
				        var rEnd = cellSelected.r <= cellSelected.r2 ? cellSelected.r2 : cellSelected.r;
						pageLayout.element.push(
							new elementImage(
								'imageObject-'+elementCount, 'https://source.unsplash.com/random?sig='+parseInt(Math.random()*1000),
								cStart, rStart, cEnd-cStart+1, rEnd-rStart+1
							)
						);
						logEvent('pageLayout-elementAdded-image-'+pageLayout.element.length);
						elementCount++;
						clearLayoutSelection();
						pageLayout.renderElements('page_layout_page');
						if ($('.display_blocks').hasClass('active')) {
							$('.element').addClass('background');
						}
						elementSelectedID = pageLayout.element[pageLayout.element.length-1].id+'_element';
						$('#'+elementSelectedID).toggleClass('selected');
						placeMode = 'content';
						editContentClick(elementSelectedID, true);
						pageLayout.renderTransformBox('page_layout_page', elementSelectedID);
						$('#layout_toolbar .active').toggleClass('active');
						$('#edit_content').addClass('active');
						$('.cell').css('pointer-events', 'none');
						$('.element').css('cursor', 'pointer');
					}
					break;
				// case 'edit':
				// 	if ($('#page_layout_page .page_container .page .element.highlight').length > 0 && !elementTransform) {
				// 		elementSelectedID = $('#page_layout_page .page_container .page .element.highlight').eq(0).attr('id');
				// 		$('#'+elementSelectedID).css('cursor', 'move');
				// 		if ($('.element.selected').length > 0 && !$('#'+elementSelectedID).hasClass('selected')) {
				// 			$('.element.selected').toggleClass('selected');
				// 			$('.element .highlight_box').empty();
				// 		}
				// 		$('#'+elementSelectedID).toggleClass('selected');
				// 		if ($('#'+elementSelectedID).hasClass('selected')) {
				// 			pageLayout.renderTransformBox(elementSelectedID);
				// 		} else {
				// 			$('.element .highlight_box').empty();
				// 		}
				// 	}
				// 	var d = Math.pow(Math.pow(mousePos.x-rememberMousePos.x, 2)+Math.pow(mousePos.y-rememberMousePos.y, 2), 0.5);
				// 	if (d<2 && elementTransform && $('.element.selected').length>0) {
				// 		$('#'+elementSelectedID+'.selected').css('cursor', 'pointer');
				// 		$('#'+elementSelectedID+'.selected').toggleClass('selected');
				// 		$('.highlight_box').off();
    // 					$('.highlight_box div').off();
				// 	}
				// 	elementTransform = false;
				// 	break;
				case 'content':
					if ($('#page_layout_page .page_container .page .element.highlight').length > 0  && !elementTransform) {
						elementSelectedID = $('#page_layout_page .page_container .page .element.highlight').eq(0).attr('id');
						$('#page_layout_page #'+elementSelectedID).css('cursor', 'move');
						if ($('.element.selected').length > 0 && !$('#'+elementSelectedID).hasClass('selected')) {
							$('.element.selected').toggleClass('selected');
							$('.element .highlight_box').empty();
						}
						$('#page_layout_page #'+elementSelectedID).toggleClass('selected');
						if ($('#page_layout_page #'+elementSelectedID).hasClass('selected')) {
							editContentClick(elementSelectedID, true);
							pageLayout.renderTransformBox('page_layout_page', elementSelectedID);
						} else {
							$('.element .highlight_box').empty();
							editContentClick(elementSelectedID, false);
						}
					}
					if ($('#page_layout_page .page_container .page .element.highlight').length > 0) {

					}
					var d = Math.pow(Math.pow(mousePos.x-rememberMousePos.x, 2)+Math.pow(mousePos.y-rememberMousePos.y, 2), 0.5);
					if (d<2 && elementTransform && $('.element.selected').length>0 && !mouseInLayer) {
						$(window).scrollTop(0);
						editContentClick(elementSelectedID, false);
						$('#'+elementSelectedID+'.selected').css('cursor', 'pointer');
						$('#'+elementSelectedID+'.selected').toggleClass('selected');
						$('.element .highlight_box').empty();
						$('.highlight_box').off();
				        $('.highlight_box .corner').off();
				        $('.highlight_box .change_layer #layer_up').off();
				        $('.highlight_box .change_layer #layer_down').off();
					}
					elementTransform = false;
					break;
			}
			break;
		case 'pageOrder':
			var elementOrderIDTemp = $('#page_order_page .element.highlight').length==1 ? $('#page_order_page .element.highlight').attr('id') : '';
			if (elementOrderIDTemp!='') {
				editOrderMenu('', elementOrderIDTemp);
			}
			break;
	}
});

$(document).on('dblclick', function() {
	switch (mode) {
		case 'pageOrder':
			elementOrderIDTemp = $('#page_order_page .element.highlight').length==1 ? $('#page_order_page .element.highlight').attr('id') : '';
			editOrderMenu(elementOrderIDTemp, '');
			break;
	}
});

function editOrderMenu(dblClickElem, clickElem) {
	if (dblClickElem=='' && clickElem=='') {
		elementOrderID.a = '';
		elementOrderID.b = '';
	} else if (dblClickElem!='' && clickElem=='') {
		if (dblClickElem==elementOrderID.a) {
			elementOrderID.a = '';
			elementOrderID.b = '';
			$('#edit_order_div.active').toggleClass('active');
		} else {
			elementOrderID.a = dblClickElem;
			elementOrderID.b = '';
		}
	} else if (dblClickElem=='' && clickElem!='') {
		if (elementOrderID.a!='' && elementOrderID.a!=clickElem) {
			elementOrderID.b = clickElem;
		}
	} else if (dblClickElem!='' && clickElem!='') {
		elementOrderID.a = dblClickElem;
		elementOrderID.b = clickElem;
	}

	$('.edit_order_icon.active').toggleClass('active');
	$('.edit_order_icon.selected').toggleClass('selected');
	$('#order_list li.selected').toggleClass('selected');

	if (elementOrderID.a=='' && elementOrderID.b=='') {
		$('#edit_order_div.active').toggleClass('active');
		$('#order_instructions').html('<p>Double click on page object to start.</p>');
		$('.selected_black').toggleClass('selected_black');
		$('.selected_grey').toggleClass('selected_grey');
		$('#edit_order_elements #element_A').empty();
		$('#edit_order_elements #element_B').empty();
	} else {
		$('#edit_order_div:not(.active)').toggleClass('active');
		$('#order_instructions').html('<p>Select another page object to define relation.</p>');
		$('.selected_black').toggleClass('selected_black');
		$('.selected_grey').toggleClass('selected_grey');
		var indexA = (elementOrderID.a.split('_')[0]).split('-')[1];
		var objectNameA = elementOrderID.a.charAt(0)=='t' ? 'Text' : 'Image';
		$('#edit_order_elements #element_A').html(objectNameA + ' ' + indexA);
		$('#edit_order_elements #element_B').empty();
		$('#page_order_page #'+elementOrderID.a+':not(.selected_black)').toggleClass('selected_black');

		if (elementOrderID.b != '') {
			var indexB = (elementOrderID.b.split('_')[0]).split('-')[1];
			var objectNameB = elementOrderID.b.charAt(0)=='t' ? 'Text' : 'Image';
			$('#edit_order_elements #element_B').html(objectNameB + ' ' + indexB);
			$('#page_order_page #'+elementOrderID.b+':not(.selected_grey)').toggleClass('selected_grey');

			var elementIDA = elementOrderID.a.split('_')[0];
			var elementIDB = elementOrderID.b.split('_')[0];
			var iA, iB;
			for (i in pageOrder.element) {
				if (pageOrder.element[i].id==elementIDA) {
					iA = i;
				}
				if (pageOrder.element[i].id==elementIDB) {
					iB = i;
				}
			}
			if (iA && iB) {
				var orderArr = returnOrderPossibility(pageOrder.element[iA].pos, pageOrder.element[iB].pos);
				for (i in orderArr) {
					$('#order-'+orderArr[i]).toggleClass('active');
				}
				var newItem = true;
				for (i in pageOrder.order) {
					if (pageOrder.order[i].a==elementIDA && pageOrder.order[i].b==elementIDB) {
						$('#order-'+pageOrder.order[i].state.x+'_'+pageOrder.order[i].state.y).toggleClass('selected');
						var orderListItem = $('#order_list li').eq(i);
						orderListItem.toggleClass('selected');
						newItem = false;
						break;
					} else if (pageOrder.order[i].a==elementIDB && pageOrder.order[i].b==elementIDA) {
						var stateX = pageOrder.order[i].state.x<0 ? 1 : pageOrder.order[i].state.x>0 ? -1 : pageOrder.order[i].state.x;
						var stateY = pageOrder.order[i].state.y<0 ? 1 : pageOrder.order[i].state.y>0 ? -1 : pageOrder.order[i].state.y;
						$('#order-'+stateX+'_'+stateY).toggleClass('selected');
						var orderListItem = $('#order_list li').eq(i);
						orderListItem.toggleClass('selected');
						newItem = false;
						break;
					}
				}
				if (newItem) {
					$('#order-false_false').toggleClass('selected');
				}
			}
		} else {
			$('.selected_grey').toggleClass('selected_grey');
		}
	}
}

function returnOrderPossibility(posA, posB) {
	var arrX = [];
	var arrY = [];
	var arr = [];
	if (posA.x < posB.x) {
		arrX.push(-1, false);
	} else if (posA.x == posB.x) {
		arrX.push(1, -1, 0, false);
	} else {
		arrX.push(1, false);
	}
	if (posA.y < posB.y) {
		arrY.push(-1, false);
	} else if (posA.y == posB.y) {
		arrY.push(1, -1, 0, false);
	} else {
		arrY.push(1, false);
	}
	for (i in arrX) {
		for (j in arrY) {
			arr.push(arrX[i]+'_'+arrY[j]);
		}
	}
	return arr;
}

function consoleLogBG() {
	var s = '';
	for (i in pageLayout.element) {
		s = s + pageLayout.element[i].id + ':' + pageLayout.element[i].bgColor + ' , ';
	}
	console.log(s);
}

function editContentClick(elementID, bool) {
	if (bool) {
		$('#layout_content_edit:not(.active)').toggleClass('active');
		$('.update_content_button').off();
		$('.delete_content_button').off();

		if ($('#page_layout_page #'+elementID).hasClass('imageObject')) {

			$('#layout_content_edit .edit_title').html('Edit image');
			$('#layout_content_edit .edit_image:not(.active)').toggleClass('active');
			$('#layout_content_edit .edit_text.active').toggleClass('active');
			var elemID = elementID.split('_')[0];
			var elementObject = false;
			for (i in pageLayout.element) {
	            if (pageLayout.element[i].id==elemID) {
	                elementObject = $.extend(true, {}, pageLayout.element[i]);
	                break;
	            }
	        }
	        if (elementObject) {
				$('input[name=image_url]').val(elementObject.src);
				$('input[name=img_opacity]').val(elementObject.opacity);
				$('input[name=ibg_color]').val(elementObject.bgColor);
				$('#bg_size_div select').val(elementObject.bgSize);
			}

			$('#layout_content_edit .edit_image .edit_button_div div .update_content_button').on('click', function() {
				var newUrl = $('input[name=image_url]').val();
				$('#page_layout_page #'+elementID+' .image').css('background-image', 'url('+newUrl+')');
				var elemID = elementID.split('_')[0];
				for (i in pageLayout.element) {
		            if (pageLayout.element[i].id==elemID) {
		                pageLayout.element[i].src = newUrl;
		                break;
		            }
		        }
			});
			$('#layout_content_edit .edit_image .edit_button_div div .delete_content_button').on('click', function() {
				$('#page_layout_page #'+elementID).remove();
				var elemID = elementID.split('_')[0];
				for (i in pageLayout.element) {
		            if (pageLayout.element[i].id==elemID) {
		            	for (var j=pageLayout.order.length-1; j>=0; j--) {
		            		if (pageLayout.order[j].a==elemID || pageLayout.order[j].b==elemID) {
		            			pageLayout.order.splice(j, 1);
		            		}
		            	}
		                pageLayout.element.splice(i, 1);
		                break;
		            }
		        }
		        logEvent('pageLayout-elementDeleted-'+pageLayout.element.length);
		        $('#layout_content_edit.active').toggleClass('active');
		        $('#layout_content_edit .edit_image.active').toggleClass('active');
		        $('#layout_content_edit .edit_text.active').toggleClass('active');
			});

		} else if ($('#page_layout_page #'+elementID).hasClass('textObject')) {
			$('#layout_content_edit .edit_title').html('Edit text');
			$('#layout_content_edit .edit_text:not(.active)').toggleClass('active');
			$('#layout_content_edit .edit_image.active').toggleClass('active');
			var elemID = elementID.split('_')[0];
			var elementObject = false;
			for (i in pageLayout.element) {
	            if (pageLayout.element[i].id==elemID) {
	                elementObject = $.extend(true, {}, pageLayout.element[i]);
	                break;
	            }
	        }
			if (elementObject) {
				$('#typeface_div select').val(elementObject.fontFamily);
				$('#typeface_div select').css('font-family', elementObject.fontFamily);
				$('input[name=font_size]').val(elementObject.fontSize);
				$('input[name=font_weight]').val(elementObject.fontWeight);
				$('input[name=line_height]').val(elementObject.lineHeight);
				$('input[name=letter_spacing]').val(elementObject.letterSpacing);
				$('input[name=font_color]').val(elementObject.color);
				$('input[name=bg_color]').val(elementObject.bgColor);
				$('input[name=padding]').val(elementObject.padding);
				$('#text_content textarea').val(elementObject.copy);
				updateTextarea(elementObject);
				$('#type_style #italic_option.active').toggleClass('active');
				$('#type_style #underline_option.active').toggleClass('active');
				if (elementObject.fontStyle=='italic') {
					$('#type_style #italic_option').toggleClass('active');
				}
				if (elementObject.textDecoration=='underline') {
					$('#type_style #underline_option').toggleClass('active');
				}

				$('#type_align .type_option_button.active').toggleClass('active');
				switch(elementObject.textAlign) {
					case 'left':
						$('#align_left').toggleClass('active');
						break;
					case 'center':
						$('#align_center').toggleClass('active');
						break;
					case 'right':
						$('#align_right').toggleClass('active');
						break;
				}

				$('#type_vertical .type_option_button.active').toggleClass('active');
				switch(elementObject.verticalAlign) {
					case 'flex-start':
						$('#vertical_top').toggleClass('active');
						break;
					case 'center':
						$('#vertical_center').toggleClass('active');
						break;
					case 'flex-end':
						$('#vertical_bottom').toggleClass('active');
						break;
				}
			}

			$('#layout_content_edit .edit_text .edit_button_div div .update_content_button').on('click', function() {
				updateTextObject(elementID);
			});

			$('#layout_content_edit .edit_text .edit_button_div div .delete_content_button').on('click', function() {
				$('#page_layout_page #'+elementID).remove();
				var elemID = elementID.split('_')[0];
				for (i in pageLayout.element) {
		            if (pageLayout.element[i].id==elemID) {
		            	for (var j=pageLayout.order.length-1; j>=0; j--) {
		            		if (pageLayout.order[j].a==elemID || pageLayout.order[j].b==elemID) {
		            			pageLayout.order.splice(j, 1);
		            		}
		            	}
		                pageLayout.element.splice(i, 1);
		                break;
		            }
		        }
		        $('#layout_content_edit.active').toggleClass('active');
		        $('#layout_content_edit .edit_image.active').toggleClass('active');
		        $('#layout_content_edit .edit_text.active').toggleClass('active');
			});
		}
	} else {
		$('#layout_content_edit.active').toggleClass('active');
	}
}

function updateTextarea(ele) {
	$('#text_content textarea').css({
		//'background' : ele.bgColor,
		'font-family': ele.fontFamily,
		//'font-size' : ele.fontSize+'pt',
		'line-height' : ele.lineHeight,
		'letter-spacing': ele.letterSpacing,
		'font-weight' : ele.fontWeight
		//'color' : ele.color
	});
}

function updateImgObject(elementID) {
	var elemID = elementID.split('_')[0];
	for (i in pageLayout.element) {
		if (pageLayout.element[i].id==elemID) {
			pageLayout.element[i].bgColor = $('input[name=ibg_color]').val();
			pageLayout.element[i].bgSize = $('#bg_size_div select').val();
			pageLayout.element[i].opacity = $('input[name=img_opacity]').val();
			$('#page_layout_page #'+elementID).css('background', pageLayout.element[i].bgColor);
			$('#page_layout_page #'+elementID+' .image').css('background-size', pageLayout.element[i].bgSize);
			$('#page_layout_page #'+elementID+' .image').css('opacity', pageLayout.element[i].opacity);
			break;
		}
	}
}

function updateTextObject(elementID) {
	var elemID = elementID.split('_')[0];
	for (i in pageLayout.element) {
        if (pageLayout.element[i].id==elemID) {
        	pageLayout.element[i].fontFamily = $('#typeface_div select').val();
        	pageLayout.element[i].fontSize = $('input[name=font_size]').val();
        	pageLayout.element[i].fontWeight = $('input[name=font_weight]').val();
        	pageLayout.element[i].lineHeight = $('input[name=line_height]').val();
        	pageLayout.element[i].letterSpacing = $('input[name=letter_spacing]').val();
        	pageLayout.element[i].color = $('input[name=font_color]').val();
        	pageLayout.element[i].bgColor = $('input[name=bg_color]').val();
        	pageLayout.element[i].padding = $('input[name=padding]').val();
        	updateTextarea(pageLayout.element[i]);
        	pageLayout.element[i].copy = $('#text_content textarea').val();


        	if ($('#type_style #italic_option').hasClass('active')) {
				pageLayout.element[i].fontStyle = 'italic';
			} else {
				pageLayout.element[i].fontStyle = 'normal';
			}
			if ($('#type_style #underline_option').hasClass('active')) {
				pageLayout.element[i].textDecoration = 'underline';
			} else {
				pageLayout.element[i].textDecoration = 'none';
			}
			switch($('#type_align .type_option_button.active').attr('id')) {
				case 'align_left':
					pageLayout.element[i].textAlign = 'left';
					break;
				case 'align_center':
					pageLayout.element[i].textAlign = 'center';
					break;
				case 'align_right':
					pageLayout.element[i].textAlign = 'right';
					break;
			}
			switch($('#type_vertical .type_option_button.active').attr('id')) {
				case 'vertical_top':
					pageLayout.element[i].verticalAlign = 'flex-start';
					break;
				case 'vertical_center':
					pageLayout.element[i].verticalAlign = 'center';
					break;
				case 'vertical_bottom':
					pageLayout.element[i].verticalAlign = 'flex-end';
					break;
			}
			var copyVal = pageLayout.element[i].copy;
			$('#page_layout_page #'+elementID+' .text .copy').html(copyVal);
			var pageScale = $('#page_layout_page .page_container .page').width()/(pageLayout.w * 72 * 4/3);
            var textSize = (pageLayout.element[i].fontSize*4/3 * pageScale);

            $('#page_layout_page #'+elementID).css({
                'align-items': pageLayout.element[i].verticalAlign,
                'padding': pageLayout.element[i].padding+'em'
            });

            $('#page_layout_page #'+elementID+' .copy').css({
                'font-family': pageLayout.element[i].fontFamily,
                'color': pageLayout.element[i].color,
                'font-size': textSize + 'px',
                'font-weight': pageLayout.element[i].fontWeight,
                'font-style': pageLayout.element[i].fontStyle,
                'line-height': pageLayout.element[i].lineHeight,
                'text-align': pageLayout.element[i].textAlign,
                'text-decoration': pageLayout.element[i].textDecoration,
                'letter-spacing': pageLayout.element[i].letterSpacing+'em'
            });

            $('#page_layout_page #'+elementID).css('background', pageLayout.element[i].bgColor);
            break;
        }
    }
}



////////////
//        //
//  INIT  //
//        //
////////////

function cellMarginBlockDisplay() {
	if ($('.display_margin').hasClass('active')) {
		$('.margin:not(.active)').toggleClass('active');
		$('.page').css('overflow', 'visible');
	} else {
		$('.margin.active').toggleClass('active');
		$('.page').css('overflow', 'hidden');
	}

	if ($('.display_cells').hasClass('active')) {
		$('.cell:not(.active)').toggleClass('active');
	} else {
		$('.cell.active').toggleClass('active');
	}

	if ($('.display_blocks').hasClass('active')) {
		$('.element:not(.background)').toggleClass('background');
	} else {
		$('.element.background').toggleClass('background');
	}
}


function init() {

	setTimeout(function() {
		$('.headline.initial').removeClass('initial');
	}, 300);
	$('.step').each(function(i) {
		setTimeout(function() {
			$('.step').eq(i).removeClass('initial');
		}, 600*i+1200);
		if (i==3) {
			setTimeout(function() {
				$('#landing_nav.initial').removeClass('initial');
			}, 600*i+1700);
		}
	});

	$('#pm_setup').on('click', function() {
		if (pageSetup) {
			goToScreen(mode, 'pageSetup');
		}
	});
	$('#pm_layout').on('click', function() {
		if (pageLayout) {
			goToScreen(mode, 'pageLayout');
		}
	});
	$('#pm_order').on('click', function() {
		if (pageOrder) {
			goToScreen(mode, 'pageOrder');
		}
	});
	$('#pm_alt').on('click', function() {
		if (pageAlt) {
			goToScreen(mode, 'pageAlt');
		}
	});

	$('#help_window').on('mouseenter', function() {
		mouseInHelpDiv = true;
	});
	$('#help_window').on('mouseleave', function() {
		mouseInHelpDiv = false;
	});
	$('#help_container').on('click', function() {
		if (!mouseInHelpDiv) {
			$('#help_container').removeClass('active');
			logEvent(mode);
		}
	});
	$('#close_help').on('click', function() {
		$('#help_container').removeClass('active');
		logEvent(mode);
	});
	$('.help_button').on('click', function() {
		$('#help_container').addClass('active');
		logEvent(mode+'-help');
		switch(mode) {
			case 'pageSetup':
				$('.help_item.active').toggleClass('active');
				$('#help_structure').addClass('active');
				break;
			case 'pageLayout':
				$('.help_item.active').toggleClass('active');
				$('#help_content').addClass('active');
				break;
			case 'pageOrder':
				$('.help_item.active').toggleClass('active');
				$('#help_relations').addClass('active');
				break;
			case 'pageAlt':
				$('.help_item.active').toggleClass('active');
				$('#help_alt').addClass('active');
				break;
		}
		$('#help_window').scrollTop(0);
	});

	$('#back_button').on('click', function() {
		$('#help_container').removeClass('active');
		$('#next_button').removeClass('hide');
		switch (mode) {
			case 'pageSetup':
				$('#warning_div.active').toggleClass('active');
				$('#warning_div').toggleClass('active');
				$('#warning_div .warning_text p').html('Changes made will not be saved.<br/>Do you want to proceed?');	
				$('#saved_alt_div').removeClass('open');
				updatePageHeight();
				break;
			case 'pageLayout':
				updateAllPages(pageLayout);
				$('.cell').css('cursor', 'default');
				$('.element').css('cursor', 'default');
				placeMode = 'none';
				$('#layout_toolbar div.active').toggleClass('active');
				mode = 'pageSetup';
				$('#warning_div.active').toggleClass('active');
				$('#page_layout').css('left', '100%');
				clearLayoutSelection();
				resetCellHighlight();
				if (pageSavedArr.length > 0) {
					updateSavedPage(pageLayout);
				}
				setTimeout(function() {
					cellMarginBlockDisplay();
					$('.ui_screen.active').toggleClass('active');
					$('.progress_mark.active').toggleClass('active');
					$('.progress_mark').eq(0).toggleClass('active');
					$('#page_setup').toggleClass('active');
					$('#page_setup').css('left', '0');
				}, 300);
				break;
			case 'pageOrder':
				updateAllPages(pageOrder);
				$('.cell').css('cursor', 'default');
				$('.element').css('cursor', 'default');
				placeMode = 'none';
				$('#layout_toolbar div.active').toggleClass('active');
				mode = 'pageLayout';
				$('#warning_div.active').toggleClass('active');
				$('#page_order').css('left', '100%');
				clearLayoutSelection();
				resetCellHighlight();
				editOrderMenu('', '');
				if (pageSavedArr.length > 0) {
					updateSavedPage(pageOrder);
				}
				setTimeout(function() {
					cellMarginBlockDisplay();
					$('.ui_screen.active').toggleClass('active');
					$('.progress_mark.active').toggleClass('active');
					$('.progress_mark').eq(1).toggleClass('active');
					$('#page_layout').toggleClass('active');
					$('#page_layout').css('left', '0');
				}, 300);
				break;
			case 'pageAlt':
				updateAllPages(pageAlt);
				$('.cell').css('cursor', 'default');
				$('.element').css('cursor', 'default');
				placeMode = 'none';
				$('#layout_toolbar div.active').toggleClass('active');
				mode = 'pageOrder';
				$('#warning_div.active').toggleClass('active');
				$('#page_alt').css('left', '100%');
				refreshElementOrderList();
				if (pageSavedArr.length > 0) {
					$('#pageAlt_savedpage:not(.edited)').toggleClass('edited');
				}
				setTimeout(function() {
					cellMarginBlockDisplay();
					$('.ui_screen.active').toggleClass('active');
					$('.progress_mark.active').toggleClass('active');
					$('.progress_mark').eq(2).toggleClass('active');
					$('#page_order').toggleClass('active');
					$('#page_order').css('left', '0');
				}, 300);
				break;
		}
		logEvent(mode);
	});

	$('#next_button').on('click', function() {
		$('#help_container').removeClass('active');
		$('#next_button').removeClass('hide');
		switch(mode) {
			case 'pageSetup':
				updateAllPages(pageSetup);
				mode = 'pageLayout';
				$('#page_setup').css('left', '-100%');
				$('.progress_mark.active').toggleClass('active');
				$('.progress_mark').eq(1).toggleClass('active');
				renderPageSetup();
				renderPageLayout();
				if (pageSavedArr.length > 0) {
					updateSavedPage(pageSetup);
				}
				setTimeout(function() {
					$('.ui_screen.active').toggleClass('active');
					$('#page_layout').toggleClass('active');
					$('#page_layout').css('left', '0');
				}, 300);
				break;
			case 'pageLayout':
				if (pageLayout.element.length > 0) {
					updateAllPages(pageLayout);
					mode = 'pageOrder';
					$('#page_layout').css('left', '-100%');
					$('.progress_mark.active').toggleClass('active');
					$('.progress_mark').eq(2).toggleClass('active');
					renderPageOrder();
					pageOrder.order = [];
					pageOrder.order = dupPageOrder(pageLayout);
					refreshElementOrderList();
					if (pageSavedArr.length > 0) {
						updateSavedPage(pageLayout);
					}
					setTimeout(function() {
						$('.ui_screen.active').toggleClass('active');
						$('#page_order').toggleClass('active');
						$('#page_order').css('left', '0');
					}, 300);
				} else {
					$('#warning_div.active').toggleClass('active');
					$('#warning_div').toggleClass('active');
					$('#warning_div .warning_text p').html('Page is empty.<br/>Please place images or text to proceed.');
					$('#warning_leave').css('display', 'none');
				}
				break;
			case 'pageOrder':
				updateAllPages(pageOrder);
				mode = 'pageAlt';
				$('#page_order').css('left', '-100%');
				$('.progress_mark.active').toggleClass('active');
				$('.progress_mark').eq(3).toggleClass('active');
				clearLayoutSelection();
				resetCellHighlight();
				editOrderMenu('', '');
				if (pageSavedArr.length > 0) {
					updateSavedPage(pageLayout);
				}
				$('#next_button').addClass('hide');
				setTimeout(function() {
					$('.ui_screen.active').toggleClass('active');
					$('#page_alt').toggleClass('active');
					$('#page_alt').css('left', '0');
					renderPageAlt();
				}, 300);
				break;
		}
		logEvent(mode);
	});

	$('#warning_div').on('click', function() {
		if (!mouseInWarningLeave) {
			$('#warning_div.active').toggleClass('active');
			$('#warning_leave').css('display', 'block');
		}
	});
	$('#warning_leave').on('mouseenter', function() {
		mouseInWarningLeave = true;
	});
	$('#warning_leave').on('mouseleave', function() {
		mouseInWarningLeave = false;
	});
	$('#warning_leave').on('click', function() {
		switch(mode) {
			case 'pageSetup':
				pageSetup = {};
				pageLayout = {};
				pageOrder = {};
				pageAlt = {};
				pageSavedArr = [];
				$('#saved_alt_div').removeClass('active');
				mode = 'landing';
				$('#warning_div.active').toggleClass('active');
				$('#page_setup').css('left', '100%');
				$('.nav_bar.hidden').toggleClass('hidden');
				$('.nav_bar').toggleClass('hidden');
				setTimeout(function() {
					$('#export_project').removeClass('active');
					$('.ui_screen.active').toggleClass('active');
					$('#landing').toggleClass('active');
					$('#landing').css('left', '0');
				}, 300);
				updatePageHeight();
				break;
			// case 'pageLayout':
			// 	$('.margin:not(.active)').toggleClass('active');
			// 	$('.cell:not(.active)').toggleClass('active');
			// 	$('.display_margin:not(.active)').toggleClass('active');
			// 	$('.page').css('overflow', 'visible');
			// 	$('.display_cells:not(.active)').toggleClass('active');
			// 	$('.display_blocks.active').toggleClass('active');
			// 	$('.element.background').toggleClass('background');
			// 	$('.cell').css('cursor', 'default');
			// 	$('.element').css('cursor', 'default');
			// 	placeMode = 'none';
			// 	$('#layout_toolbar div.active').toggleClass('active');
			// 	mode = 'pageSetup';
			// 	$('#warning_div.active').toggleClass('active');
			// 	$('#page_layout').css('left', '100%');
			// 	clearLayoutSelection();
			// 	$('#saved_alt_div').removeClass('active');
			// 	$('#saved_alt_div').removeClass('open');
			// 	setTimeout(function() {
			// 		$('.ui_screen.active').toggleClass('active');
			// 		$('.progress_mark.active').toggleClass('active');
			// 		$('.progress_mark').eq(0).toggleClass('active');
			// 		$('#page_setup').toggleClass('active');
			// 		$('#page_setup').css('left', '0');
			// 	}, 300);
			// 	break;
		}
		logEvent(mode);
	});

	$('.display_margin').on('click', function() {
		$('.margin').toggleClass('active');
		if ($('.margin').hasClass('active')) {
			$('.display_margin.active').toggleClass('active');
			$('.display_margin').toggleClass('active');
			$('.page').css('overflow', 'visible');
			logEvent(mode+'-margin-on');
		} else {
			$('.display_margin.active').toggleClass('active');
			$('.page').css('overflow', 'hidden');
			logEvent(mode+'-margin-off');
		}
	});

	$('.display_cells').on('click', function() {
		$('.cell').toggleClass('active');
		if ($('.cell').hasClass('active')) {
			$('.display_cells.active').toggleClass('active');
			$('.display_cells').toggleClass('active');
			logEvent(mode+'-cell-on');
		} else {
			$('.display_cells.active').toggleClass('active');
			logEvent(mode+'-cell-off');
		}
	});

	$('.display_blocks').on('click', function() {
		if ($('.element').length==0) {
			$('.display_blocks').css('border-color', '#F80');
			setTimeout(function() {
				$('.display_blocks').css('border-color', '#AAA');
			}, 200);
		} else {
			$('.element').toggleClass('background');
			if ($('.element').hasClass('background')) {
				$('.display_blocks.active').toggleClass('active');
				$('.display_blocks').toggleClass('active');
				logEvent(mode+'-blocks-on');
			} else {
				$('.display_blocks.active').toggleClass('active');
				logEvent(mode+'-blocks-off');
			}
		}
	});

	initPageSetup();
	initPageLayout();
	initPageOrder();
	initPageAlt();

	$('#export_project').on('click', function() {
		exportProject();
	});

	$('#landing_load').change(function() {
		if (this.files.length) {
			var file = this.files[0];
			var reader = new FileReader();
			var filename = file.name;
			var ext = filename.split('.');
			var name = ext[0];
			if (ext[ext.length-1]=='whitespace') {
				reader.readAsText(file);
				$(reader).on('load', loadProject);
			} else {
				alert('Invalid whitespace file');
			}
		} else {

		} 
	});
}

function goToScreen(m, goTo) {
	$('#next_button').removeClass('hide');
	switch (m) {
		case 'pageSetup':
			updateAllPages(pageSetup);
			break;
		case 'pageLayout':
			updateAllPages(pageLayout);
			break;
		case 'pageOrder':
			updateAllPages(pageOrder);
			break;
		case 'pageAlt':
			updateAllPages(pageAlt);
			break;
	}
	mode = goTo;
	editContentClick('', false);
	switch (goTo) {
		case 'pageSetup':
			$('#page_layout').css('left', '100%');
			$('#page_order').css('left', '100%');
			$('#page_alt').css('left', '100%');
			$('.progress_mark.active').toggleClass('active');
			$('.progress_mark').eq(0).toggleClass('active');
			break;
		case 'pageLayout':
			$('#page_setup').css('left', '-100%');
			$('#page_order').css('left', '100%');
			$('#page_alt').css('left', '100%');
			$('.progress_mark.active').toggleClass('active');
			$('.progress_mark').eq(1).toggleClass('active');
			break;
		case 'pageOrder':
			$('#page_setup').css('left', '-100%');
			$('#page_layout').css('left', '-100%');
			$('#page_alt').css('left', '100%');
			$('.progress_mark.active').toggleClass('active');
			$('.progress_mark').eq(2).toggleClass('active');
			break;
		case 'pageAlt':
			$('#next_button').addClass('hide');
			$('#page_setup').css('left', '-100%');
			$('#page_layout').css('left', '-100%');
			$('#page_order').css('left', '-100%');
			$('.progress_mark.active').toggleClass('active');
			$('.progress_mark').eq(3).toggleClass('active');
			break;
	}
	logEvent(mode);
	if (pageSavedArr.length > 0) {
		updateSavedPage(pageSetup);
	}
	resetCellHighlight();
	cellMarginBlockDisplay();
	$('#layout_toolbar .active').removeClass('active');
	setTimeout(function() {
		$('.ui_screen.active').toggleClass('active');
		switch (goTo) {
		case 'pageSetup':
			$('#page_setup').toggleClass('active');
			$('#page_setup').css('left', '0');
			break;
		case 'pageLayout':
			$('#page_layout').toggleClass('active');
			$('#page_layout').css('left', '0');
			break;
		case 'pageOrder':
			$('#page_order').toggleClass('active');
			$('#page_order').css('left', '0');
			break;
		case 'pageAlt':
			$('#page_alt').toggleClass('active');
			$('#page_alt').css('left', '0');
			break;
		}
	}, 300);
}

function dupPageOrder(pageID) {
	var orderArray = [];
	for (var i=0; i<pageID.order.length; i++) {
		orderArray.push($.extend(true, {}, pageID.order[i]));
	}
	return orderArray;
}

function refreshElementOrderList() {
	if (!$.isEmptyObject(pageOrder)) {
		$('#order_list').empty();
		$('#order_list .selected').toggleClass('selected');
		for (i in pageOrder.order) {
			var element1 = pageOrder.order[i].a;
			var element2 = pageOrder.order[i].b;
			var liHTML = '<li>';
			if ((element1+'_element'==elementOrderID.a && element2+'_element'==elementOrderID.b) ||
				(element2+'_element'==elementOrderID.a && element1+'_element'==elementOrderID.b)) {
				var liHTML = '<li class="selected">';
			}
			var orderConc = pageOrder.order[i].state.x + '_' + pageOrder.order[i].state.y;
			liHTML = liHTML + '<span class="icon"><img src="images/order-'+orderConc+'.svg"></span>';
			var index1 = element1.split('-')[1];
			var index2 = element2.split('-')[1];
			var name1 = element1.charAt(0)=='t' ? 'Text' : 'Image';
			var name2 = element2.charAt(0)=='t' ? 'Text' : 'Image';
			liHTML = liHTML + '<span class="black" name="'+element1+'">'+name1+' '+index1+'</span>';
			liHTML = liHTML + '<span class="grey" name="'+element2+'">'+name2+' '+index2+'</span>';
			liHTML = liHTML + '<span class="delete">&times;</span>';
			liHTML = liHTML + '</li>';
			$('#order_list').append(liHTML);
		}

		$('#order_list li').on('mouseenter', function() {
			$('#page_order_page .element.black').toggleClass('black');
			$('#page_order_page .element.grey').toggleClass('grey');
			var id1 = $(this).children('.black').attr('name');
			var id2 = $(this).children('.grey').attr('name');
			$('#page_order_page #'+id1+'_element').toggleClass('black');
			$('#page_order_page #'+id2+'_element').toggleClass('grey');
		});
		$('#order_list li').on('mouseleave', function() {
			$('#page_order_page .element.black').toggleClass('black');
			$('#page_order_page .element.grey').toggleClass('grey');
		});
		$('#order_list li').on('click', function() {
			if ($(this).hasClass('selected')) {
				$('#order_list li.selected').toggleClass('selected');
				editOrderMenu('', '');
			} else {
				$('#order_list li.selected').toggleClass('selected');
				$(this).toggleClass('selected');
				elementOrderID.a = $(this).children('span.black').attr('name')+'_element';
				elementOrderID.b = $(this).children('span.grey').attr('name')+'_element';
				editOrderMenu(elementOrderID.a, elementOrderID.b);
			}
		});
		$('#order_list li span.delete').on('click', function() {
			$('#page_order_page .element.black').toggleClass('black');
			$('#page_order_page .element.grey').toggleClass('grey');
			var id1 = $(this).parent().children('.black').attr('name');
			var id2 = $(this).parent().children('.grey').attr('name');
			for (i in pageOrder.order) {
				if ((pageOrder.order[i].a == id1 && pageOrder.order[i].b == id2) ||
					(pageOrder.order[i].b == id1 && pageOrder.order[i].a == id2)) {
					pageOrder.order.splice(i, 1);
					break;
				}
			}
			if ($(this).parent().hasClass('selected')) {
				editOrderMenu('', '');
			}
			$(this).parent().remove();
		});
	}
}

function returnElementOrderX(elem1, elem2) {
	if (elem1.pos.x > elem2.pos.x) {
		return 1;
	} else if (elem1.pos.x == elem2.pos.x) {
		return 0;
	} else {
		return -1;
	}
}

function returnElementOrderY(elem1, elem2) {
	if (elem1.pos.y > elem2.pos.y) {
		return 1;
	} else if (elem1.pos.y == elem2.pos.y) {
		return 0;
	} else {
		return -1;
	}
}

function renderFullscreenPage(divID, pageObject) {

	logEvent(mode+'-fullscreen');
	$('html, body').animate({ scrollTop: 0 }, 'fast');
	$('#view_fullscreen:not(.active)').toggleClass('active');
	$('#fullscreen_page').css('width', 50 + '%');
	$('#fullscreen_ruler').css('width', 50 + '%');

	var fullscreenPage = $.extend(true, {}, pageObject);
	fullscreenPage.render(divID);
	fullscreenPage.renderElements(divID);
	cellMarginBlockDisplay();

	$('#view_fullscreen #fullscreen_ruler').empty();
	var tickCount = 0;
	var tickSize = 0;
	var tickStep = 0;
	switch(units) {
		case 'in':
			var w = fullscreenPage.w;
			var wPx = $('#fullscreen_page').width();
			tickCount = Math.ceil(w);
			tickSize = (wPx/w)/wPx;
			tickStep = 1;
			break;
		case 'mm':
			var w = fullscreenPage.w*unitScale['mm'];
			var wPx = $('#fullscreen_page').width();
			tickStep = 10;
			tickCount = Math.ceil(w/tickStep);
			tickSize = (wPx/(w/tickStep))/wPx;
			break;
		case 'px':
			var w = fullscreenPage.w*unitScale['px'];
			var wPx = $('#fullscreen_page').width();
			tickStep = 100;
			tickCount = Math.ceil(w/tickStep);
			tickSize = (wPx/(w/tickStep))/wPx;
			break;
	}
	for (var i=0; i<tickCount; i++) {
		if (i==0) {
			$('#view_fullscreen #fullscreen_ruler').append('<div class="ruler_mark">'+(tickStep*(i+1))+' '+units+'</div>');
		} else {
			$('#view_fullscreen #fullscreen_ruler').append('<div class="ruler_mark">'+(tickStep*(i+1))+'</div>');
		}
	}
	$('#view_fullscreen #fullscreen_ruler .ruler_mark').css({
		'width': tickSize*100 + "%"
	});

	$('#zoom_in').off();
	$('#zoom_out').off();
	$('#exit_fullscreen').off();
	$('#print_fullscreen').off();

	$('#zoom_in').on('click', function() {
		var w = $('#fullscreen_page').width();
		var wRatio = w/$('#view_fullscreen').width();
		$('#fullscreen_page').css('width', wRatio*110 + '%');
		$('#fullscreen_ruler').css('width', wRatio*110 + '%');
		fullscreenPage.renderElements(divID);
	});
	$('#zoom_out').on('click', function() {
		var w = $('#fullscreen_page').width();
		var wRatio = w/$('#view_fullscreen').width();
		$('#fullscreen_page').css('width', wRatio*90 + '%');
		$('#fullscreen_ruler').css('width', wRatio*90 + '%');
		fullscreenPage.renderElements(divID);
	});
	$('#exit_fullscreen').on('click', function() {
		$('#view_fullscreen').toggleClass('active');
		placeMode = 'none';
		logEvent(mode);
	});
	$('#view_fullscreen').css('min-height', $(document).outerHeight()+'px');

	$('#print_fullscreen').on('click', function() {
		$('#print_div').empty();
		var w = $('#fullscreen_page').width();
		var h = $('#fullscreen_page').height();
		var wUnit = pageSetup.w + 'in';
		var hUnit = pageSetup.h + 'in';
		// $('#print_div').html(pageDiv.parent().parent().html());
		$('#print_div').css({
			'width' : wUnit,
			'height' : hUnit
		});
		pageObject.render('print_div');
		pageObject.renderElements('print_div');
		cellMarginBlockDisplay();
		$('#print_div .page_box').remove();
		$('#print_div .highlight_box').remove();
		$('#print_div .highlight_name').remove();
		$('style#print_style').html(''+
			'@page {'+
				'size:'+wUnit+' '+hUnit+';'+
				'margin: 0;'+
			'}'+
			'@media print {'+
				'#print_div {'+
					'width: '+100+'%;'+
					'height: '+100+'%;'+
				'}'+
			'}'

		);
		$("#print_div").css('left', 0);
		setTimeout(function() {
			$("#print_div").print({						
			});
			setTimeout(function() {
				$("#print_div").css('left', 200+'vw');
			}, 250);
		}, 250);
	});
}

function landingStartClick() {
	logEvent('start');
	mode = 'pageSetup';
	$('#landing').css('left', '-100%');
	$('.nav_bar.hidden').toggleClass('hidden');
	$('.progress_mark.active').toggleClass('active');
	$('.progress_mark').eq(0).toggleClass('active');
	setTimeout(function() {
		$('.ui_screen.active').toggleClass('active');
		$('#page_setup').toggleClass('active');
		$('#page_setup').css('left', '0');
		renderPageSetup();
	}, 300);
	$('#export_project').addClass('active');
	logEvent('pageSetup');
}

function initPageSetup() {
	units = $('#units_list input[name=units]:checked').val();
	$('.number_units').html(units);

	$('#units_list input[name=units]').on('change', function() {
		var oldUnits = units;
		units = $('#units_list input[name=units]:checked').val();
		$('.number_units').html(units);
		var factor = 1/unitScale[oldUnits] * unitScale[units];
		var pW = parseFloat($('input[name=page_width]').val())*factor;
		var pH = parseFloat($('input[name=page_height]').val())*factor;
		var m1 = parseFloat($('input[name=margin_top]').val())*factor;
		var m2 = parseFloat($('input[name=margin_right]').val())*factor;
		var m3 = parseFloat($('input[name=margin_bottom]').val())*factor;
		var m4 = parseFloat($('input[name=margin_left]').val())*factor;
		var g = parseFloat($('input[name=gutter]').val())*factor;
		$('input[name=page_width]').val(pW.toFixed(2));
		$('input[name=page_height]').val(pH.toFixed(2));
		$('input[name=margin_top]').val(m1.toFixed(2));
		$('input[name=margin_right]').val(m2.toFixed(2));
		$('input[name=margin_bottom]').val(m3.toFixed(2));
		$('input[name=margin_left]').val(m4.toFixed(2));
		$('input[name=gutter]').val(g.toFixed(2));
	});

	$('input[name=page_width]').on('change', function() {
		var val = parseFloat($(this).val());
		var val2 = parseFloat($('input[name=margin_right]').val()) +
		parseFloat($('input[name=margin_left]').val()) +
		parseFloat($('input[name=column_count]').val())*parseFloat($('input[name=gutter]').val());
		if (val <= val2) {
			$(this).val(val2);
		}
	});

	$('input[name=page_height]').on('change', function() {
		var val = parseFloat($(this).val());
		var val2 = parseFloat($('input[name=margin_top]').val()) +
		parseFloat($('input[name=margin_bottom]').val()) +
		parseFloat($('input[name=row_count]').val())*parseFloat($('input[name=gutter]').val());
		if (val <= val2) {
			$(this).val(val2);
		}
	});

	$('input[name=margin_top]').on('change', function() {
		var val = parseFloat($(this).val());
		var val2 = parseFloat($('input[name=page_height]').val()) -
		(parseFloat($('input[name=margin_bottom]').val()) +
		parseFloat($('input[name=row_count]').val())*parseFloat($('input[name=gutter]').val()));
		if (val >= val2) {
			$(this).val(val2);
		}
	});

	$('input[name=margin_bottom]').on('change', function() {
		var val = parseFloat($(this).val());
		var val2 = parseFloat($('input[name=page_height]').val()) -
		(parseFloat($('input[name=margin_top]').val()) +
		parseFloat($('input[name=row_count]').val())*parseFloat($('input[name=gutter]').val()));
		if (val >= val2) {
			$(this).val(val2);
		}
	});

	$('input[name=margin_left]').on('change', function() {
		var val = parseFloat($(this).val());
		var val2 = parseFloat($('input[name=page_width]').val()) -
		(parseFloat($('input[name=margin_right]').val()) +
		parseFloat($('input[name=column_count]').val())*parseFloat($('input[name=gutter]').val()));
		if (val >= val2) {
			$(this).val(val2);
		}
	});

	$('input[name=margin_right]').on('change', function() {
		var val = parseFloat($(this).val());
		var val2 = parseFloat($('input[name=page_width]').val()) -
		(parseFloat($('input[name=margin_left]').val()) +
		parseFloat($('input[name=column_count]').val())*parseFloat($('input[name=gutter]').val()));
		if (val >= val2) {
			$(this).val(val2);
		}
	});

	$('input[name=gutter]').on('change', function() {
		var val = parseFloat($(this).val());
		var val2 = (parseFloat($('input[name=page_width]').val())-
		(parseFloat($('input[name=margin_left]').val()) + parseFloat($('input[name=margin_right]').val())))/
		parseFloat($('input[name=column_count]').val());
		var val3 = (parseFloat($('input[name=page_height]').val())-
		(parseFloat($('input[name=margin_top]').val()) + parseFloat($('input[name=margin_bottom]').val())))/
		parseFloat($('input[name=row_count]').val());
		if (val >= val2) {
			$(this).val(val2);
		} else if (val >= val3) {
			$(this).val(val3);
		}
		if (val < 0) {
			$(this).val(0);
		}
	});

	$('input[name=column_count]').on('change', function() {
		var val = parseInt($(this).val());
		if (val < 2) {
			$(this).val(1);
		}
	});

	$('input[name=row_count]').on('change', function() {
		var val = parseInt($(this).val());
		if (val < 2) {
			$(this).val(1);
		}
	});

	$('.param input[type=number]').on('change', function() {
		logEvent(mode+'-'+$(this).attr('name'));
		renderPageSetup();
	});
	$('.param input[name=pbg_color]').on('change', function() {
		logEvent(mode+'-'+$(this).attr('name'));
		renderPageSetup();
	});
}

function updateSetupParam(pageObj) {
	var factor = unitScale[units];
	var pW = parseFloat(pageObj.w)*factor;
	var pH = parseFloat(pageObj.h)*factor;
	var m1 = parseFloat(pageObj.marginDim[0])*factor;
	var m2 = parseFloat(pageObj.marginDim[1])*factor;
	var m3 = parseFloat(pageObj.marginDim[2])*factor;
	var m4 = parseFloat(pageObj.marginDim[3])*factor;
	var g = parseFloat(pageObj.gutter)*factor;
	var rC = pageObj.rowCount;
	var cC = pageObj.colCount;
	$('input[name=page_width]').val(pW.toFixed(2));
	$('input[name=page_height]').val(pH.toFixed(2));
	$('input[name=margin_top]').val(m1.toFixed(2));
	$('input[name=margin_right]').val(m2.toFixed(2));
	$('input[name=margin_bottom]').val(m3.toFixed(2));
	$('input[name=margin_left]').val(m4.toFixed(2));
	$('input[name=gutter]').val(g.toFixed(2));
	$('input[name=row_count]').val(rC);
	$('input[name=column_count]').val(cC);
}

function initPageLayout() {

	$('#place_text').on('click', function() {
		$('#layout_toolbar div.active:not(#place_text)').toggleClass('active');
		$('#place_text').toggleClass('active');
		$('.cell').css('cursor', 'default');
		$('.element').css('cursor', 'default');
		clearLayoutSelection();
		if ($('#place_text').hasClass('active')) {
			placeMode = 'text';
			$('.cell').css('cursor', 'pointer');
			$('#layout_instructions').html('<p>Select cell to place text.</p>');
			$('.cell').css('pointer-events', 'auto');
		} else {
			placeMode = 'none';
			$('#layout_instructions').empty();
		}
	});

	$('#place_image').on('click', function() {
		$('#layout_toolbar div.active:not(#place_image)').toggleClass('active');
		$('#place_image').toggleClass('active');
		$('.cell').css('cursor', 'default');
		$('.element').css('cursor', 'default');
		clearLayoutSelection();
		if ($('#place_image').hasClass('active')) {
			placeMode = 'image';
			$('.cell').css('cursor', 'pointer');
			$('#layout_instructions').html('<p>Select cell to place image.</p>');
			$('.cell').css('pointer-events', 'auto');
		} else {
			placeMode = 'none';
			$('#layout_instructions').empty();
		}
	});

	$('#place_edit').on('click', function() {
		$('#layout_toolbar div.active:not(#place_edit)').toggleClass('active');
		$('#place_edit').toggleClass('active');
		$('.cell').css('cursor', 'default');
		$('.element').css('cursor', 'default');
		clearLayoutSelection();
		if ($('#place_edit').hasClass('active')) {
			placeMode = 'edit';
			$('.element').css('cursor', 'pointer');
			$('#layout_instructions').html('<p>Select object to edit placement.</p>');
			$('.cell').css('pointer-events', 'none');
		} else {
			placeMode = 'none';
			$('#layout_instructions').empty();
		}
	});

	$('#edit_content').on('click', function() {
		$('#layout_toolbar div.active:not(#edit_content)').toggleClass('active');
		$('#edit_content').toggleClass('active');
		$('.cell').css('cursor', 'default');
		$('.element').css('cursor', 'default');
		clearLayoutSelection();
		if ($('#edit_content').hasClass('active')) {
			placeMode = 'content';
			$('.element').css('cursor', 'pointer');
			$('#layout_instructions').html('<p>Select object to edit content, size and position.</p>');
			$('.cell').css('pointer-events', 'none');
		} else {
			placeMode = 'none';
			$('#layout_instructions').empty();
		}
	});

	$('#edit_view').on('click', function() {
		$('#layout_toolbar div.active:not(#edit_view)').toggleClass('active');
		$('.cell').css('cursor', 'default');
		$('.element').css('cursor', 'default');
		clearLayoutSelection();
		renderFullscreenPage('fullscreen_page', pageLayout);
		placeMode = 'view';
	});

	$('#save_dup').on('click', function() {
		var tempPage = $.extend(true, {}, pageLayout);
		tempPage.id = 'pageAlt_saved_'+Date.now();
		tempPage.element = [];
		for (i in pageLayout.element) {
			tempPage.element.push($.extend(true, {}, pageLayout.element[i]));
		}
		tempPage.order = [];
		for (i in pageLayout.order) {
			tempPage.order.push($.extend(true, {}, pageLayout.order[i]));
		}
		updateSavedPage(pageLayout);
		addSavedPage(tempPage);
		renderSavedPages(pageSavedArr);
		altJustAdded = true;
		$('#saved_alt_div').addClass('open');
		updatePageHeight();
		logEvent(mode+'-'+'addSavedPage-'+pageSavedArr.length);
	});

	$('#bg_size_div select').on('change', function() {
		logEvent(mode+'-'+'imageBgSize');
		var typeVal = $('#bg_size_div select option:selected').val();
		updateImgObject($('.element.imageObject.selected').attr('id'));
	});

	$('#typeface_div select').on('change', function() {
		logEvent(mode+'-'+'typeface');
		var typeVal = $('#typeface_div select option:selected').val();
		$(this).css('font-family', typeVal);
		if ($('.element.textObject.selected').length > 0) {
			updateTextObject($('.element.textObject.selected').attr('id'));
		}
	});

	$('#italic_option').on('click', function(){
		$(this).toggleClass('active');
		if ($('.element.textObject.selected').length > 0) {
			updateTextObject($('.element.textObject.selected').attr('id'));
		}
	});

	$('#underline_option').on('click', function(){
		$(this).toggleClass('active');
		if ($('.element.textObject.selected').length > 0) {
			updateTextObject($('.element.textObject.selected').attr('id'));
		}
	});

	$('#type_align .type_option_button').on('click', function() {
		logEvent(mode+'-'+'typeAlign');
		$('#type_align .type_option_button.active').toggleClass('active');
		$(this).toggleClass('active');
		if ($('.element.textObject.selected').length > 0) {
			updateTextObject($('.element.textObject.selected').attr('id'));
		}
	});

	$('#type_vertical .type_option_button').on('click', function(){
		logEvent(mode+'-'+'typeVertical');
		$('#type_vertical .type_option_button.active').toggleClass('active');
		$(this).toggleClass('active');
		if ($('.element.textObject.selected').length > 0) {
			updateTextObject($('.element.textObject.selected').attr('id'));
		}
	});

	$('.image_option input').on('change', function(){
		logEvent(mode+'-'+$(this).attr('name'));
		if ($('.element.imageObject.selected').length > 0) {
			updateImgObject($('.element.imageObject.selected').attr('id'));
		}
	});

	$('.type_option input').on('change', function(){
		logEvent(mode+'-'+$(this).attr('name'));
		if ($('.element.textObject.selected').length > 0) {
			updateTextObject($('.element.textObject.selected').attr('id'));
		}
	});

	$('#color_rect').on('mousemove', function(e) {
		var thisOffset = $(this).offset();
		var cX = e.pageX - thisOffset.left;
		var cY = e.pageY - thisOffset.top;
		var cW = $(this).width();
		var cH = $(this).height();
		var hue = Math.round((cX/cW)*360);
		var sat = Math.round((cY/cH)*100);
		var val = rgb2hsv($('input[name=R_val]').val(), $('input[name=G_val]').val(), $('input[name=B_val]').val()).v;
		hue = hue > 360 ? 360 : hue < 0 ? 0 : hue;
		sat = sat > 100 ? 100 : sat < 0 ? 0 : sat;
		var rgb = HSVtoRGB(hue, sat, val);
		if (mouseDown) {
			colorPicking = true;
			if (cX/cW >= -0.01 && cX/cW <= 1.01 && cY/cH >= -0.01 && cY/cH <= 1.01) {
				$('#color_cursor').css({
					'top' : 'calc('+(cY/cH*100)+'% - 4px)',
					'left' : 'calc('+(cX/cW*100)+'% - 4px)',
					'border-color' : 'rgba('+(255-rgb.r)+','+(255-rgb.g)+','+(255-rgb.b)+',0.9)'
				});
				$('#chosen_color').css({
					'background' : 'rgba('+(rgb.r)+','+(rgb.g)+','+(rgb.b)+','+$('input[name=A_val]').val()+')'
				});
				$('input[name=R_val]').val(rgb.r);
				$('input[name=G_val]').val(rgb.g);
				$('input[name=B_val]').val(rgb.b);
				updateColorInput();
			}
		}
	});

	$('#color_rect').on('click', function(e) {
		var thisOffset = $(this).offset();
		var cX = e.pageX - thisOffset.left;
		var cY = e.pageY - thisOffset.top;
		var cW = $(this).width();
		var cH = $(this).height();
		var hue = Math.round((cX/cW)*360);
		var sat = Math.round((cY/cH)*100);
		var val = rgb2hsv($('input[name=R_val]').val(), $('input[name=G_val]').val(), $('input[name=B_val]').val()).v;
		hue = hue > 360 ? 360 : hue < 0 ? 0 : hue;
		sat = sat > 100 ? 100 : sat < 0 ? 0 : sat;
		val = val > 100 ? 100 : val < 0 ? 0 : val;
		var rgb = HSVtoRGB(hue, sat, val);
		if (cX/cW >= -0.01 && cX/cW <= 1.01 && cY/cH >= -0.01 && cY/cH <= 1.01) {
			$('#color_cursor').css({
				'top' : 'calc('+(cY/cH*100)+'% - 4px)',
				'left' : 'calc('+(cX/cW*100)+'% - 4px)',
				'border-color' : 'rgba('+(255-rgb.r)+','+(255-rgb.g)+','+(255-rgb.b)+',0.9)'
			});
			$('#chosen_color').css({
				'background' : 'rgba('+(rgb.r)+','+(rgb.g)+','+(rgb.b)+','+$('input[name=A_val]').val()+')'
			});
			$('input[name=R_val]').val(rgb.r);
			$('input[name=G_val]').val(rgb.g);
			$('input[name=B_val]').val(rgb.b);
		}
		updateColorInput();
	});

	$('#grey_rect').on('mousemove', function(e) {
		var thisOffset = $(this).offset();
		var cX = e.pageX - thisOffset.left;
		var cW = $(this).width();
		var hue = rgb2hsv($('input[name=R_val]').val(), $('input[name=G_val]').val(), $('input[name=B_val]').val()).h;
		var sat = rgb2hsv($('input[name=R_val]').val(), $('input[name=G_val]').val(), $('input[name=B_val]').val()).s;
		var val = Math.round((cX/cW)*100);
		hue = hue > 360 ? 360 : hue < 0 ? 0 : hue;
		sat = sat > 100 ? 100 : sat < 0 ? 0 : sat;
		val = val > 100 ? 100 : val < 0 ? 0 : val;
		var rgb = HSVtoRGB(hue, sat, val);
		if (mouseDown) {
			colorPicking = true;
			if (cX/cW >= -0.00 && cX/cW <= 1.00) {
				$('#grey_cursor').css({
					'left' : 'calc('+(cX/cW*100)+'% - 4px)',
				});
				$('#color_cursor').css({
					'border-color' : 'rgba('+(255-rgb.r)+','+(255-rgb.g)+','+(255-rgb.b)+',0.9)'
				});
				$('#chosen_color').css({
					'background' : 'rgba('+(rgb.r)+','+(rgb.g)+','+(rgb.b)+','+$('input[name=A_val]').val()+')'
				});
				$('input[name=R_val]').val(rgb.r);
				$('input[name=G_val]').val(rgb.g);
				$('input[name=B_val]').val(rgb.b);
				$('#color_rect img').css({
					'opacity' : val/100,
				});

				updateColorInput();
			}
		}
	});

	$('#grey_rect').on('click', function(e) {
		var thisOffset = $(this).offset();
		var cX = e.pageX - thisOffset.left;
		var cW = $(this).width();
		var hue = rgb2hsv($('input[name=R_val]').val(), $('input[name=G_val]').val(), $('input[name=B_val]').val()).h;
		var sat = rgb2hsv($('input[name=R_val]').val(), $('input[name=G_val]').val(), $('input[name=B_val]').val()).s;
		var val = Math.round((cX/cW)*100);
		hue = hue > 360 ? 360 : hue < 0 ? 0 : hue;
		sat = sat > 100 ? 100 : sat < 0 ? 0 : sat;
		val = val > 100 ? 100 : val < 0 ? 0 : val;
		var rgb = HSVtoRGB(hue, sat, val);
		if (cX/cW >= -0.01 && cX/cW <= 1.01) {
			$('#grey_cursor').css({
				'left' : 'calc('+(cX/cW*100)+'% - 4px)',
			});
			$('#color_cursor').css({
				'border-color' : 'rgba('+(255-rgb.r)+','+(255-rgb.g)+','+(255-rgb.b)+',0.9)'
			});
			$('#chosen_color').css({
				'background' : 'rgba('+(rgb.r)+','+(rgb.g)+','+(rgb.b)+','+$('input[name=A_val]').val()+')'
			});
			$('input[name=R_val]').val(rgb.r);
			$('input[name=G_val]').val(rgb.g);
			$('input[name=B_val]').val(rgb.b);
			$('#color_rect img').css({
				'opacity' : val/100,
			});
		}
		updateColorInput();
	});

	$('.color_input input').on('change', function() {
		var r = $('input[name=R_val]').val();
		var g = $('input[name=G_val]').val();
		var b = $('input[name=B_val]').val();
		var a = $('input[name=A_val]').val();
		returnColorRectPos(r, g, b);
		$('#chosen_color').css({
			'background' : 'rgba('+r+','+g+','+b+','+a+')'
		});
		if (a <= 0) {
			$('input[name=A_val]').css('color', '#E00');
		} else {
			$('input[name=A_val]').css('color', '#000');
		}
		updateColorInput();
	});

	$('#color_picker_div').mouseenter(function() {
		mouseInColorPicker = true;
	});
	$('#color_picker_div').mouseleave(function() {
		mouseInColorPicker = false;
	});

	$('#font_color_dropper').on('click', function(e) {
		$('#color_picker_div').css({
			'top': $(this).offset().top + 15 +'px',
			'left': $(this).offset().left - 300 + 'px'
		});
		updateColorPicker('input[name=font_color]', $('.element.selected .text .copy').css('color'));
		$('#color_picker_div').removeClass('hide');
		e.stopImmediatePropagation();
	});
	$('#bg_color_dropper').on('click', function(e) {
		$('#color_picker_div').css({
			'top': $(this).offset().top + 15 +'px',
			'left': $(this).offset().left - 300 + 'px'
		});
		updateColorPicker('input[name=bg_color]', $('.element.selected').css('background'));
		$('#color_picker_div').removeClass('hide');
		e.stopImmediatePropagation();
	});
	$('#ibg_color_dropper').on('click', function(e) {
		$('#color_picker_div').css({
			'top': $(this).offset().top + 15 +'px',
			'left': $(this).offset().left - 300 + 'px'
		});
		updateColorPicker('input[name=ibg_color]', $('input[name=ibg_color]').val());
		$('#color_picker_div').removeClass('hide');
		e.stopImmediatePropagation();
	});
	$('#pbg_color_dropper').on('click', function(e) {
		$('#color_picker_div').css({
			'top': $(this).offset().top - 350 +'px',
			'left': $(this).offset().left - 0 + 'px'
		});
		updateColorPicker('input[name=pbg_color]', $('input[name=pbg_color]').val());
		$('#color_picker_div').removeClass('hide');
		e.stopImmediatePropagation();
	});
}

function initPageOrder() {
	$('#set_all_order').on('click', function() {
		editOrderMenu('', '');
		pageOrder.order = [];
		for (var i=0; i<pageOrder.element.length; i++) {
			for (var j=0; j<pageOrder.element.length; j++) {
				if (i != j) {
					var orderX = returnElementOrderX(pageOrder.element[i], pageOrder.element[j]);
					var orderY = returnElementOrderY(pageOrder.element[i], pageOrder.element[j]);
					//ORDERSTATE: 0=EQUALS, -1/1=EQUALS LESS/GREATER
					pageOrder.setElementOrder(pageOrder.element[i].id, pageOrder.element[j].id, orderX, orderY);
				}
			}	
		}
		logEvent(mode+'-'+'setAllOrder-'+pageOrder.order.length);
		refreshElementOrderList();
		pageLayout.order = dupPageOrder(pageOrder);
		logEvent(mode+'-'+'orderChanged-'+pageOrder.order.length);
	});

	$('#clear_all_order').on('click', function() {
		editOrderMenu('', '');
		pageOrder.order = [];
		refreshElementOrderList();
		pageLayout.order = dupPageOrder(pageOrder);
		logEvent(mode+'-'+'orderChanged-'+pageOrder.order.length);
	});

	$('.edit_order_icon').on('click', function() {
		$('.edit_order_icon.selected').toggleClass('selected');
		$(this).toggleClass('selected');
		var stateString = $(this).attr('id').split('order-')[1];
		var stateX = stateString.split('_')[0];
		var stateY = stateString.split('_')[1];
		if (elementOrderID.a != '' && elementOrderID.b != '') {
			var elementIDA = elementOrderID.a.split('_')[0];
			var elementIDB = elementOrderID.b.split('_')[0];
			pageOrder.setElementOrder(elementIDA, elementIDB, stateX, stateY);
			refreshElementOrderList();
		}
		logEvent(mode+'-'+'orderChanged-'+pageOrder.order.length);
	});
}

function initPageAlt() {
	$('#refresh_alternatives').on('click', function() {
		updateAltMessage(true);
		logEvent(mode+'-'+'refreshedAlternatives');
		setTimeout(function() {
			pageAltArr = [];
			pageAltArr = generateAlternatives(pageAlt, 12);
			renderAltPages(pageAltArr);
		}, 200);
	});

	$('#saved_alt_title').on('click', function() {
		$('#saved_alt_div').toggleClass('open');
		updatePageHeight();
	});

	$('#saved_alt_div').on('mouseenter', function() {
		mouseInSavedAltDiv = true;
	});

	$('#saved_alt_div').on('mouseleave', function() {
		mouseInSavedAltDiv = false;
	});
}

function renderPageSetup() {
	$('.cell').off();
	units = $('#units_list input[name=units]:checked').val();
	var factor = 1 / unitScale[units];
	var pW = parseFloat($('input[name=page_width]').val())*factor;
	var pH = parseFloat($('input[name=page_height]').val())*factor;
	var m1 = parseFloat($('input[name=margin_top]').val())*factor;
	var m2 = parseFloat($('input[name=margin_right]').val())*factor;
	var m3 = parseFloat($('input[name=margin_bottom]').val())*factor;
	var m4 = parseFloat($('input[name=margin_left]').val())*factor;
	var cC = Math.floor(parseFloat($('input[name=column_count]').val()));
	var rC = Math.floor(parseFloat($('input[name=row_count]').val()));
	var g = parseFloat($('input[name=gutter]').val())*factor;
	var bg = $('input[name=pbg_color]').val();

	if ($.isEmptyObject(pageSetup)) {
		pageSetup = new page('pageSetup', pW, pH, m1, m2, m3, m4, rC, cC, g, bg);
		pageSetup.render('page_setup_page');
	} else {
		pageSetup.w = pW;
		pageSetup.h = pH;
		pageSetup.marginDim[0] = m1;
		pageSetup.marginDim[1] = m2;
		pageSetup.marginDim[2] = m3;
		pageSetup.marginDim[3] = m4;
		pageSetup.rowCount = rC;
		pageSetup.colCount = cC;
		pageSetup.gutter = g;
		pageSetup.bgColor = bg;
		pageSetup.calDim();
		updateAllPages(pageSetup);
	}

	$('.margin:not(.active)').toggleClass('active');
	$('.cell:not(.active)').toggleClass('active');
	$('#pm_setup').addClass('progress');
	calContrast();

	savePage(pageSetup);
}

function setPageStructure() {
	renderPageSetup();
}

function renderPageLayout() {
	$('.cell').off();

	if ($.isEmptyObject(pageLayout)) {
		var pW = pageSetup.w;
		var pH = pageSetup.h;
		var m1 = pageSetup.marginDim[0];
		var m2 = pageSetup.marginDim[1];
		var m3 = pageSetup.marginDim[2];
		var m4 = pageSetup.marginDim[3];
		var cC = pageSetup.colCount;
		var rC = pageSetup.rowCount;
		var g = pageSetup.gutter;
		var bg = pageSetup.bgColor;
		pageLayout = new page('pageLayout', pW, pH, m1, m2, m3, m4, rC, cC, g, bg);
		pageLayout.render('page_layout_page');
	}

	resetCellHighlight();
	cellMarginBlockDisplay();
	$('#pm_layout').addClass('progress');
	calContrast();
}

function resetCellHighlight() {
	$('.cell').off();
	$('.cell').on('mouseenter', function() {
		$(this).toggleClass('highlight');
		var classNames = $(this).attr('class').toString().split(' ');
		var r = classNames[2].split('_')[1];
		var c = classNames[1].split('_')[1];
		cellHover.r = parseInt(r);
		cellHover.c = parseInt(c);
		cellHover.bool = true;
	});
	$('.cell').on('mouseleave', function() {
		$(this).toggleClass('highlight');
		cellHover.bool = false;
	});
}

function renderPageOrder() {
	$('.cell').off();

	if ($.isEmptyObject(pageOrder)) {
		var pW = pageSetup.w;
		var pH = pageSetup.h;
		var m1 = pageSetup.marginDim[0];
		var m2 = pageSetup.marginDim[1];
		var m3 = pageSetup.marginDim[2];
		var m4 = pageSetup.marginDim[3];
		var cC = pageSetup.colCount;
		var rC = pageSetup.rowCount;
		var g = pageSetup.gutter;
		var bg = pageSetup.bgColor;
		pageOrder = new page('pageOrder', pW, pH, m1, m2, m3, m4, rC, cC, g, bg);
		pageOrder.render('page_order_page');
		pageOrder.element = [];
		for (i in pageLayout.element) {
			pageOrder.element.push($.extend(true, {}, pageLayout.element[i]));
		}
		pageOrder.renderElements('page_order_page');
	}

	refreshElementOrderList();
	cellMarginBlockDisplay();
	$('#pm_order').addClass('progress');
	calContrast();
}

function renderPageAlt() {
	$('.cell').off();

	if ($.isEmptyObject(pageAlt)) {
		var pW = pageSetup.w;
		var pH = pageSetup.h;
		var m1 = pageSetup.marginDim[0];
		var m2 = pageSetup.marginDim[1];
		var m3 = pageSetup.marginDim[2];
		var m4 = pageSetup.marginDim[3];
		var cC = pageSetup.colCount;
		var rC = pageSetup.rowCount;
		var g = pageSetup.gutter;
		var bg = pageSetup.bgColor;

		if (!pageAlt) {
			pageAlt = new page('pageAlt', pW, pH, m1, m2, m3, m4, rC, cC, g, bg);
		}
		pageAlt.render('page_alt_page');

		pageAlt.element = [];
		for (i in pageOrder.element) {
			pageAlt.element.push($.extend(true, {}, pageOrder.element[i]));
		}
		pageAlt.order = [];
		for (i in pageOrder.order) {
			pageAlt.order.push($.extend(true, {}, pageOrder.order[i]));
		}
		pageAlt.renderElements('page_alt_page');
	}

	altHighlightUI($('#page_alt_page .page_container .page'), pageAlt, 'main');

	savePage(pageAlt);

	setTimeout(function() {
		updateAltMessage(true);
		setTimeout(function() {
			pageAltArr = [];
			pageAltArr = generateAlternatives(pageAlt, 12);
			renderAltPages(pageAltArr);
		}, 200);
	}, 600);

	cellMarginBlockDisplay();
	$('#pm_alt').addClass('progress');
	calContrast();
}

function altHighlightUI(pageDiv, pageObj, UImode) {
	if (pageDiv.children('.page_box').length==0) {
		pageDiv.append('<div class="page_box"></div>')
	}

	if (pageDiv.children('.page_box').length==1) {
		switch (UImode) {
			case 'main':
				pageDiv.children('.page_box').append(
					'<div class="view"><img src="images/icon_view.svg"></div>'
				);
				pageDiv.find('.page_box .view').off();
				pageDiv.find('.page_box .view').on('click', function() {
					renderFullscreenPage('fullscreen_page', pageObj);
				});
				break;
			case 'alt':
				pageDiv.children('.page_box').append(
					'<div class="view"><img src="images/icon_view.svg"></div>'
				);
				pageDiv.find('.page_box .view').off();
				pageDiv.find('.page_box .view').on('click', function() {
					renderFullscreenPage('fullscreen_page', pageObj);
					$('.page_box.clicked').toggleClass('clicked');
					pageDiv.find('.page_box').toggleClass('clicked');
				});

				pageDiv.children('.page_box').append(
					'<div class="save"><img src="images/save_icon.svg"></div>'
				);
				for (i in pageSavedArr) {
					if (pageSavedArr[i].id==pageObj.id) {
						pageDiv.find('.page_box .save:not(.saved)').toggleClass('saved');
						break;
					}
				}
				pageDiv.find('.page_box .save').off();
				pageDiv.find('.page_box .save:not(.saved)').on('click', function() {
					addSavedPage(pageObj);
					renderSavedPages(pageSavedArr);
					$(this).toggleClass('saved');
					$('.page_box.clicked').toggleClass('clicked');
					pageDiv.find('.page_box').toggleClass('clicked');
					$('#saved_alt_div.active').addClass('open');
					updatePageHeight();
					altJustAdded = true;
					logEvent(mode+'-'+'addSavedPage-'+pageSavedArr.length);
				});
				break;
			case 'saved':
				pageDiv.children('.page_box').append(
					'<div class="view"><img src="images/icon_view.svg"></div>'
				);
				pageDiv.find('.page_box .view').off();
				pageDiv.find('.page_box .view').on('click', function() {
					renderFullscreenPage('fullscreen_page', pageObj);
					$('.page_box.clicked').toggleClass('clicked');
					pageDiv.find('.page_box').toggleClass('clicked');
				});

				pageDiv.children('.page_box').append(
					'<div class="delete">&times;</div>'
				);
				pageDiv.find('.page_box .delete').off();
				pageDiv.find('.page_box .delete').on('click', function() {
					for (i in pageSavedArr) {
						if (pageSavedArr[i].id==pageObj.id) {
							pageSavedArr.splice(i, 1);
							break;
						}
					}
					for (i in pageAltArr) {
						if (pageAltArr[i].id==pageObj.id) {
							$('#'+pageAltArr[i].id+'_page .page_box .save.saved').toggleClass('saved');
							break;
						}
					}
					renderSavedPages(pageSavedArr);
					logEvent(mode+'-'+'removedSavedPage-'+pageSavedArr.length);
				});

				pageDiv.children('.page_box').append(
					'<div class="edit"><img src="images/icon_edit.svg"></div>'
				);
				pageDiv.find('.page_box .edit').off();
				pageDiv.find('.page_box .edit').on('click', function() {
					if (pageObj.id != pageAlt.id) {
						switch(mode) {
							case 'pageLayout':
								updateSavedPage(pageLayout);
								break;
							case 'pageOrder':
								updateSavedPage(pageOrder);
								break;
						}
						var replaceID = 'pageAlt_saved_'+Date.now();
						pageAlt.id = replaceID;
						for (i in pageSavedArr) {
							if (pageSavedArr[i].id=='pageAlt') {
								pageSavedArr[i].id = replaceID;
							}
							if (pageSavedArr[i].id==pageObj.id) {
								pageSavedArr[i].id = 'pageAlt';
							}
						}
						renderSavedPages(pageSavedArr);
						updateAllPages(pageObj);
						updateSetupParam(pageObj);
						refreshElementOrderList();
						clearLayoutSelection();

						goToScreen(mode, 'pageLayout');
						logEvent(mode+'-'+'editSavedPage');

						if (mode != 'pageAlt') {
							$('#pageAlt_savedpage').toggleClass('edited');
						}
					}
				});

				pageDiv.children('.page_box').append(
					'<div class="print"><img src="images/icon_print.svg"></div>'
				);
				pageDiv.find('.page_box .print').off();
				pageDiv.find('.page_box .print').on('click', function() {
					$('#print_div').empty();
					var w = pageDiv.parent().parent().width();
					var h = pageDiv.parent().parent().height();
					var wUnit = pageSetup.w + 'in';
					var hUnit = pageSetup.h + 'in';
					// $('#print_div').html(pageDiv.parent().parent().html());
					$('#print_div').css({
						'width' : wUnit,
						'height' : hUnit
					});
					pageObj.render('print_div');
					pageObj.renderElements('print_div');
					cellMarginBlockDisplay();
					$('#print_div .page_box').remove();
					$('#print_div .highlight_box').remove();
					$('#print_div .highlight_name').remove();
					$('style#print_style').html(''+
						'@page {'+
							'size:'+wUnit+' '+hUnit+';'+
							'margin: 0;'+
						'}'+
						'@media print {'+
							'#print_div {'+
								'width: '+100+'%;'+
								'height: '+100+'%;'+
							'}'+
						'}'

					);
					$("#print_div").css('left', 0);
					setTimeout(function() {
						$("#print_div").print({						
						});
						setTimeout(function() {
							$("#print_div").css('left', 200+'vw');
						}, 250);
					}, 250);
				});

				break;
		}
	}
}

function updateAltMessage(clear, ite, fil, ret) {
	if (clear) {
		$('#alt_message div.active').toggleClass('active');
		$('#alt_loading').toggleClass('active');
	} else {
		$('#iteration_count').html(ite);
		$('#filtered_count').html(fil);
		$('#return_count').html(ret);
		$('.fork_message.active').toggleClass('active');
		if (ret==0) {
			$('#alt_zero').toggleClass('active');
		} else {
			$('#alt_present').toggleClass('active');
		}
		$('#alt_message div.active').toggleClass('active');
		$('#alt_details').toggleClass('active');
	}
}


//GENERATE PAGE ALTERNATIVES
function generateAlternatives(pageObj, altCount) {
	var cutOff = 1-$('input[name=whitespace_val]').val();
	var spawnZone = [];
	for (i in pageObj.element) {
		var wE = pageObj.element[i].size.w < pageObj.colCount ? pageObj.element[i].size.w : pageObj.colCount;
		var hE = pageObj.element[i].size.h < pageObj.rowCount ? pageObj.element[i].size.h : pageObj.rowCount;
		spawnZone.push({
			'x':pageObj.colCount-wE,
			'y':pageObj.rowCount-hE
		});
	}
	var loopLimit = 1500*(pageObj.element.length+1);
	var loopCount = loopLimit;
	var loopBool = true;
	var randomArr = [];

	var pageObjIntersect = 0;
	var iterationCount = 0;

	for (var i=0; i<pageObj.element.length-1; i++) {
		for (var j=i+1; j<pageObj.element.length; j++) {
			var x1 = pageObj.element[i].pos.x;
			var x2 = pageObj.element[i].pos.x + pageObj.element[i].size.w;
			var y1 = pageObj.element[i].pos.y;
			var y2 = pageObj.element[i].pos.y + pageObj.element[i].size.h;
			var u1 = pageObj.element[j].pos.x;
			var u2 = pageObj.element[j].pos.x + pageObj.element[j].size.w;
			var w1 = pageObj.element[j].pos.y;
			var w2 = pageObj.element[j].pos.y + pageObj.element[j].size.h;
			if (u1 < x2 && u2 > x1 && w1 < y2 && w2 > y1) {
				pageObjIntersect++;
			}
		}	
	}

	while(loopCount>0 && loopBool) {
		var arr = [];
		for (i in pageObj.element) {
			var xPos = Math.round(Math.random()*spawnZone[i].x);
			var yPos = Math.round(Math.random()*spawnZone[i].y);
			arr.push({'id':pageObj.element[i].id, 'index':i, 'x':xPos, 'y':yPos, 'w':pageObj.element[i].size.w, 'h':pageObj.element[i].size.h});
		}
		var intersectCount = 0;
		for (var i=0; i<arr.length-1; i++) {
			for (var j=i+1; j<arr.length; j++) {
				var x1 = arr[i].x;
				var x2 = arr[i].x + arr[i].w;
				var y1 = arr[i].y;
				var y2 = arr[i].y + arr[i].h;
				var u1 = arr[j].x;
				var u2 = arr[j].x + arr[j].w;
				var w1 = arr[j].y;
				var w2 = arr[j].y + arr[j].h;
				if (u1 < x2 && u2 > x1 && w1 < y2 && w2 > y1) {
					intersectCount++;
				}
			}	
		}
		if (intersectCount <= pageObjIntersect + pageObj.element.length*cutOff) {
			randomArr.push(arr);
			loopCount--;
		} else {
			loopCount = loopCount - 0.05;
		}
		iterationCount++;
	}
	console.log('iterations: ', iterationCount);
	
	var filterArr = [];
	for (var i=0; i<randomArr.length; i++) {
		var checkOrder = true;
		for (var j=0; j<randomArr[i].length; j++) {
			for (var k=(j+1); k<randomArr[i].length; k++) {
				for (o in pageObj.order) {
					var elemA = false;
					var elemB = false;
					if (pageObj.order[o].a==randomArr[i][j].id && pageObj.order[o].b==randomArr[i][k].id) {
						elemA = $.extend(true, {}, randomArr[i][j]);
						elemB = $.extend(true, {}, randomArr[i][k]);
					} else if (pageObj.order[o].a==randomArr[i][k].id && pageObj.order[o].b==randomArr[i][j].id) {
						elemB = $.extend(true, {}, randomArr[i][j]);
						elemA = $.extend(true, {}, randomArr[i][k]);
					}
					if (elemA && elemB) {
						switch(pageObj.order[o].state.x) {
							case '0':
								if (elemA.x!=elemB.x) {
									checkOrder = false;
								}
								break;
							case '1':
								if (elemA.x<elemB.x) {
									checkOrder = false;
								}
								break;
							case '-1':
								if (elemA.x>elemB.x) {
									checkOrder = false;
								}
								break;
						}
						switch(pageObj.order[o].state.y) {
							case '0':
								if (elemA.y!=elemB.y) {
									checkOrder = false;
								}
								break;
							case '1':
								if (elemA.y<elemB.y) {
									checkOrder = false;
								}
								break;
							case '-1':
								if (elemA.y>elemB.y) {
									checkOrder = false;
								}
								break;
						}
						break;
					}
				}
				if (!checkOrder) {
					break;
				}
			}
			if (!checkOrder) {
				break;
			}		
		}
		if (checkOrder) {
			var array = [];
			for (j in randomArr[i]) {
				array.push($.extend(true, {}, randomArr[i][j]));
			}
			filterArr.push(array);
		}
	}
	console.log('filtered alternatives: ', filterArr.length);
	var distArr = [];
	for (var i=0; i<filterArr.length; i++) {
		var d = 0;
		var oA = 0;
		for (var j=0; j<filterArr[i].length; j++) {
			
			/***DISTANCE FROM ORIGINAL***/
			// var xPos = pageObj.element[filterArr[i][j].index].pos.x;
			// var yPos = pageObj.element[filterArr[i][j].index].pos.y;
			// var xPos2 = filterArr[i][j].x;
			// var yPos2 = filterArr[i][j].y;
			// d = d + Math.pow(Math.pow(xPos-xPos2, 2) + Math.pow(yPos-yPos2, 2), 0.5);

			/***DISTANCE FROM EACH OTHER***/
			// for (var k=j+1; k<filterArr[i].length; k++) {
			// 	var xPos = filterArr[i][j].x;
			// 	var yPos = filterArr[i][j].y;
			// 	var xPos2 = filterArr[i][k].x;
			// 	var yPos2 = filterArr[i][k].y;
			// 	if (xPos==xPos2 && yPos==yPos2) {
			// 		d = d - 2;
			// 	} else {
			// 		d = d + Math.pow(Math.pow(xPos-xPos2, 2) + Math.pow(yPos-yPos2, 2), 0.5);
			// 	}
			// }

			/***DISTANCE FROM EACH OTHER WITH OVERLAPPING WEIGHT***/
			for (var k=j+1; k<filterArr[i].length; k++) {
				var xPos = filterArr[i][j].x;
				var yPos = filterArr[i][j].y;
				var xW = filterArr[i][j].x+filterArr[i][j].w;
				var yH = filterArr[i][j].y+filterArr[i][j].h;
				var xPos2 = filterArr[i][k].x;
				var yPos2 = filterArr[i][k].y;
				var xW2 = filterArr[i][k].x+filterArr[i][k].w;
				var yH2 = filterArr[i][k].y+filterArr[i][k].h;
				var compXPos = xPos < xPos2 ? xPos2 : xPos;
				var compXW = xPos < xPos2 ? xW : xW2;
				var compYPos = yPos < yPos2 ? yPos2 : yPos;
				var compYH = yPos < yPos2 ? yH : yH2;
				d = d + Math.pow(Math.pow(xPos-xPos2, 2) + Math.pow(yPos-yPos2, 2), 0.125);
				if ((compXW > compXPos && compYH > compYPos)) {
					//d = d - Math.pow(Math.pow(pageSetup.rowCount, 2) + Math.pow(pageSetup.colCount, 2), 1.0);
					oA++;
				} else {
					//d = d + Math.pow(Math.pow(xPos-xPos2, 2) + Math.pow(yPos-yPos2, 2), 0.125);
				}
			}
		}
		d = d/filterArr[i].length;
		distArr.push({'d':d, 'index':i, 'o':oA});
	}
	distArr.sort(function(a, b) {
		return b.d - a.d;
	});
	var largestD = distArr.length > 0 ? distArr[0].d : 0;
	for (var i=0; i<distArr.length; i++) {
		distArr[i].d = distArr[i].d - distArr[i].o*largestD;
	}
	distArr.sort(function(a, b) {
		return b.d - a.d;
	});
	
	var resultArr = [];

	var resultCount = altCount > filterArr.length ? filterArr.length : altCount;
	//var gap = Math.ceil(filterArr.length*cutOff/resultCount);
	var gap = filterArr.length/resultCount;
	
	for (var i=0; i<resultCount; i++) {
		resultArr.push(Math.floor((i*gap)+Math.random()*gap));
	}
	
	var returnArr = [];
	var timeStamp = Date.now();
	for (var i=0; i<resultCount; i++) {
		var pW = pageSetup.w;
		var pH = pageSetup.h;
		var m1 = pageSetup.marginDim[0];
		var m2 = pageSetup.marginDim[1];
		var m3 = pageSetup.marginDim[2];
		var m4 = pageSetup.marginDim[3];
		var cC = pageSetup.colCount;
		var rC = pageSetup.rowCount;
		var g = pageSetup.gutter;
		var bg = pageSetup.bgColor;

		var tempPage = new page('pageAlt_'+timeStamp+'_'+i, pW, pH, m1, m2, m3, m4, rC, cC, g, bg);
		var elePos = $.extend(true, {}, filterArr[distArr[resultArr[i]].index]);

		tempPage.element = [];
		for (j in pageObj.element) {
			tempPage.element.push($.extend(true, {}, pageObj.element[j]));
		}
		for (j in pageObj.element) {
			tempPage.element[j].pos.x = elePos[j].x;
			tempPage.element[j].pos.y = elePos[j].y;
		}
		
		tempPage.order = [];
		for (j in pageObj.order) {
			tempPage.order.push($.extend(true, {}, pageObj.order[j]));
		}
		
		returnArr.push(tempPage);
	}

	updateAltMessage(false, iterationCount, filterArr.length, returnArr.length);

	return returnArr;
}

function renderAltPages(pageArr) {
	$('#alt_list').empty();
	for (i in pageArr) {
		var divID = pageArr[i].id+'_page';
		$('#alt_list').append('<div class="page_parent" id="'+divID+'"></div>');
		pageArr[i].render(divID);
		pageArr[i].renderElements(divID);
		altHighlightUI($('#'+divID+' .page_container .page'), pageArr[i], 'alt');
	}

	cellMarginBlockDisplay();

	var h1 = $('#alt_div #alt_list_div').outerHeight();
	var h2 = $('#alt_div #alt_title').outerHeight();

	$.each($('#alt_list .page_parent'), function(i, el) {
		setTimeout(function() {
			$(el).toggleClass('active');
		}, 500+i*100);
	});

	calContrast();
}

function addSavedPage(pageObj) {
	var insertIndex = -1;
	for (i in pageSavedArr) {
		if (pageSavedArr[i].id==pageObj.id) {
			insertIndex = i;
		}
	}
	if (insertIndex == -1) {
		pageSavedArr.push($.extend(true, {}, pageObj));
	} else {
		pageSavedArr.splice(insertIndex, 1, $.extend(true, {}, pageObj));
	}
}

function updateSavedPage(pageObj) {
	var insertIndex = -1;
	for (i in pageSavedArr) {
		if (pageSavedArr[i].id=="pageAlt") {
			insertIndex = i;
		}
	}
	if (insertIndex != -1) {
		pageSavedArr.splice(insertIndex, 1, $.extend(true, {}, pageObj));
		pageSavedArr[insertIndex].id = "pageAlt";
	}
	renderSavedPages(pageSavedArr);
}

function savePage(pageObj) {
	if ($.isEmptyObject(pageAlt)) {
		pageAlt = $.extend(true, {}, pageObj);
		pageAlt.id = 'pageAlt';
	}
	addSavedPage(pageAlt);
	renderSavedPages(pageSavedArr);
	if (pageSavedArr.length > 0) {
		$('#saved_alt_div').addClass('active');
	}
}

function renderSavedPages(pageArr) {
	$('#saved_alt_list').empty();
	if (pageArr.length==0) {
		$('#saved_alt_list').append('<div class="no_item">no saved pages</div>');
	}
	for (i in pageArr) {
		var divID = pageArr[i].id+'_savedpage';
		$('#saved_alt_list').append('<div class="page_parent" id="'+divID+'"></div>');
		pageArr[i].render(divID);
		pageArr[i].renderElements(divID);
		altHighlightUI($('#'+divID+' .page_container .page'), pageArr[i], 'saved');
	}
	
	cellMarginBlockDisplay();
	calContrast();
}

function updatePageHeight() {
	var h1 = $('#saved_alt_list').outerHeight();
	var h2 = $('#saved_alt_title').outerHeight();
	$('.ui_screen').css('margin-bottom', '0px');
	if (!$('#saved_alt_div').hasClass('open')) {
		$('#saved_alt_div').css('max-height', h2+'px');
		$('.ui_screen').css('margin-bottom', h2+'px');
	} else {
		$('#saved_alt_div').css('max-height', h1+h2+'px');
		$('.ui_screen').css('margin-bottom', h1+h2+'px');
	}
}


function setPageStructure() {
	renderPageSetup();
}

function clearLayoutSelection() {
	$('body').css('cursor', 'default');
	$('.cell.selected').toggleClass('selected');
	$('.cell').css('background', 'none');
	placeClicked = false;
	$('#layout_instructions').empty();
	$('#temp_box').remove();
	$('#element_selection_area').remove();
	$('.element.selected').toggleClass('selected');
	$('.element.highlight').toggleClass('highlight');
	$('.element .highlight_box').empty();
	elementMove = false;
	elementScale = false;
	$('.highlight_box').off();
    $('.highlight_box div').off();
    $('#layout_content_edit.active').toggleClass('active');
    $('#layout_content_edit .edit_image.active').toggleClass('active');
    $('#layout_content_edit .edit_text.active').toggleClass('active');
	elementSelectedID = '';
	switch(placeMode) {
		case 'text':
			$('#layout_instructions').html('<p>Select cell to place text.</p>');
			break;
		case 'image':
			$('#layout_instructions').html('<p>Select cell to place image.</p>');
			break;
		case 'edit':
			$('#layout_instructions').html('<p>Select object to edit placement.</p>');
			$('.element').css('cursor', 'pointer');
			break;
		case 'content':
			$('#layout_instructions').html('<p>Select object to edit content.</p>');
			$('.element').css('cursor', 'pointer');
			break;
	}
}

function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    h = h/360;
    s = s/100;
    v = v/100;
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

function rgb2hsv () {
    var rr, gg, bb,
        r = arguments[0] / 255,
        g = arguments[1] / 255,
        b = arguments[2] / 255,
        h, s,
        v = Math.max(r, g, b),
        diff = v - Math.min(r, g, b),
        diffc = function(c){
            return (v - c) / 6 / diff + 1 / 2;
        };

    if (diff == 0) {
        h = s = 0;
    } else {
        s = diff / v;
        rr = diffc(r);
        gg = diffc(g);
        bb = diffc(b);

        if (r === v) {
            h = bb - gg;
        }else if (g === v) {
            h = (1 / 3) + rr - bb;
        }else if (b === v) {
            h = (2 / 3) + gg - rr;
        }
        if (h < 0) {
            h += 1;
        }else if (h > 1) {
            h -= 1;
        }
    }
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        v: Math.round(v * 100)
    };
}

function returnColorRectPos(r, g, b) {
	var hsv = rgb2hsv(r, g, b);
	$('#color_cursor').css({
		'top' : 'calc('+hsv.s+'% - 4px)',
		'left' : 'calc('+(hsv.h/360*100)+'% - 4px)',
		'border-color' : 'rgba('+(255-r)+','+(255-g)+','+(255-b)+',0.9)'
	});
	$('#grey_cursor').css({
		'left' : 'calc('+hsv.v+'% - 4px)',
	});
	$('#color_rect img').css({
		'opacity' : hsv.v/100,
	});
}

var colorPickerInputSel = '';

function updateColorPicker(inputObj, col) {
	$('body').append('<div id="dummy_color"></div');
	$('#dummy_color').css('background', col);
	var c = $('#dummy_color').css('background');
	$('#dummy_color').remove();
	var rgb = c.split('(')[1].split(')')[0].split(',');
	switch(rgb.length) {
		case 3:
			$('input[name=R_val]').val(parseInt(rgb[0]));
			$('input[name=G_val]').val(parseInt(rgb[1]));
			$('input[name=B_val]').val(parseInt(rgb[2]));
			$('input[name=A_val]').val(1.0);
			$('input[name=A_val]').css('color', '#000');
			break;
		case 4:
			$('input[name=R_val]').val(parseInt(rgb[0]));
			$('input[name=G_val]').val(parseInt(rgb[1]));
			$('input[name=B_val]').val(parseInt(rgb[2]));
			$('input[name=A_val]').val(parseFloat(rgb[3]));
			if (rgb[3] <= 0) {
				$('input[name=A_val]').css('color', '#E00');
			} else {
				$('input[name=A_val]').css('color', '#000');
			}
			break;
	}
	if (rgb.length >= 3) {
		returnColorRectPos(rgb[0], rgb[1], rgb[2]);
		$('#chosen_color').css({
			'background' : 'rgba('+(rgb[0])+','+(rgb[1])+','+(rgb[2])+','+$('input[name=A_val]').val()+')'
		});
	}
	colorPickerInputSel = inputObj;
	updateColorFormat($('input[name=R_val]').val(), $('input[name=G_val]').val(), $('input[name=B_val]').val());
}

function calContrast() {
	if (!$.isEmptyObject(pageSetup)) {
		var cTemp = pageSetup.bgColor;	
		$('body').append('<div id="dummy_color"></div');
		$('#dummy_color').css('background', cTemp);
		var c = $('#dummy_color').css('background');
		$('#dummy_color').remove();
		var rgb = c.split('(')[1].split(')')[0].split(',');
		switch(rgb.length) {
			case 3:
				var v = rgb2hsv(rgb[0], rgb[1], rgb[2]).v;
				bgDark = v < 70 ? true : false;
				break;
			case 4:
				var v = rgb2hsv(rgb[0], rgb[1], rgb[2]).v;
				bgDark = rgb[3] < 0.5 ? false : v < 70 ? true : false;
				break;
		}
	}
	if (bgDark) {
		$('.page').addClass('dark');
	} else {
		$('.page').removeClass('dark');
	}
}

function updateColorInput() {
	if (!$('#color_picker_div').hasClass('hide')) {
		var colVal = 'rgba('+$('input[name=R_val]').val()+','+$('input[name=G_val]').val()+','+$('input[name=B_val]').val()+','+$('input[name=A_val]').val()+')';
		$(colorPickerInputSel).val(colVal);
		$(colorPickerInputSel).change();
	}
	updateColorFormat($('input[name=R_val]').val(), $('input[name=G_val]').val(), $('input[name=B_val]').val());
}

function componentToHex(c) {
    var hex = (+c).toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function updateColorFormat(r, g, b) {
	var hexVal = rgbToHex(r, g, b);
	var hsvVal = rgb2hsv(r, g, b);
	$('#color_hex').html(hexVal);
	$('#color_hsv').html('H:'+hsvVal.h+'&nbsp;&nbsp;S:'+hsvVal.s+'&nbsp;&nbsp;V:'+hsvVal.v);
}

function exportProject() {
	logEvent(mode+'-'+'export');
	var projectObj = {
		'mode': mode,
		'pageSetup' : $.extend(true, {}, pageSetup),
		'pageLayout' : $.extend(true, {}, pageLayout),
		'pageOrder' : $.extend(true, {}, pageOrder),
		'pageAlt' : $.extend(true, {}, pageAlt),
		'pageSavedArr' : [],
		'elementCount' : elementCount,
		'eventLog' : []
	};
	for (i in pageSavedArr) {
		projectObj.pageSavedArr.push($.extend(true, {}, pageSavedArr[i]));
	}
	for (i in eventLog) {
		projectObj.eventLog.push($.extend(true, {}, eventLog[i]));
	}
	var saveText = JSON.stringify(projectObj);
	var blob = new Blob([saveText], {type: "text/plain;charset=utf-8"});
	var d = new Date();
	saveAs(blob, 'whitespace_save_'+d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()+'_'+d.getHours()+'.'+d.getMinutes()+'.'+d.getSeconds()+'.whitespace');
}

function loadProject(e) {
    var file = e.target.result,
        results;
    if (file && file.length) {
		var JSONfile = JSON.parse(file);
		elementCount = JSONfile.elementCount;
		var count = 0;
		if (!$.isEmptyObject(JSONfile.pageSetup)) {
			count++;
			if (!$.isEmptyObject(JSONfile.pageLayout)) {
				count++;
				if (!$.isEmptyObject(JSONfile.pageOrder)) {
					count++;
					if (!$.isEmptyObject(JSONfile.pageAlt)) {
						count++;
					}
				}
			}
		}
		for (i in JSONfile.eventLog) {
			eventLog.push(JSONfile.eventLog[i]);
		}
		switch(count) {
			case 1:
				landingStartClick();
				loadPageSetup(JSONfile);
				break;
			case 2:
				landingStartClick();
				loadPageSetup(JSONfile);
				setTimeout(function() {
					$('#next_button').click();
					loadPageLayout(JSONfile);
				}, 300);
				break;
			case 3:
				landingStartClick();
				loadPageSetup(JSONfile);
				setTimeout(function() {
					$('#next_button').click();
					loadPageLayout(JSONfile);
					setTimeout(function() {
						$('#next_button').click();
						loadPageOrder(JSONfile);
					}, 300);
				}, 300);
				break;
			case 4:
				landingStartClick();
				loadPageSetup(JSONfile);
				setTimeout(function() {
					$('#next_button').click();
					loadPageLayout(JSONfile);
					setTimeout(function() {
						$('#next_button').click();
						loadPageOrder(JSONfile);
						setTimeout(function() {
							$('#next_button').click();
							loadPageAlt(JSONfile);
						}, 300);
					}, 300);
				}, 300);
				break;
		}
	}
}

function loadPageSetup(f) {
	$('input[name=page_width]').val(f.pageSetup.w);
	$('input[name=page_height]').val(f.pageSetup.h);
	$('input[name=margin_top]').val(f.pageSetup.marginDim[0]);
	$('input[name=margin_right]').val(f.pageSetup.marginDim[1]);
	$('input[name=margin_bottom]').val(f.pageSetup.marginDim[2]);
	$('input[name=margin_left]').val(f.pageSetup.marginDim[3]);
	$('input[name=column_count]').val(f.pageSetup.colCount);
	$('input[name=row_count]').val(f.pageSetup.rowCount);
	$('input[name=gutter]').val(f.pageSetup.gutter);
	renderPageSetup();
}

function loadPageLayout(f) {
	pageLayout.element = [];
	for (i in f.pageLayout.element) {
		pageLayout.element.push($.extend(true, {}, f.pageLayout.element[i]));
	}
	pageLayout.renderElements('page_layout_page');
}

function loadPageOrder(f) {
	pageOrder.order = [];
	for (i in f.pageOrder.order) {
		pageOrder.order.push($.extend(true, {}, f.pageOrder.order[i]));
	}
	refreshElementOrderList();
}

function loadPageAlt(f) {
	pageSavedArr = [];
	for (i in f.pageSavedArr) {
		var pW = f.pageSavedArr[i].w;
		var pH = f.pageSavedArr[i].h;
		var m1 = f.pageSavedArr[i].marginDim[0];
		var m2 = f.pageSavedArr[i].marginDim[1];
		var m3 = f.pageSavedArr[i].marginDim[2];
		var m4 = f.pageSavedArr[i].marginDim[3];
		var cC = f.pageSavedArr[i].colCount;
		var rC = f.pageSavedArr[i].rowCount;
		var g = f.pageSavedArr[i].gutter;
		var bg = f.pageSavedArr[i].bgColor;
		var tempPage = new page(f.pageSavedArr[i].id, pW, pH, m1, m2, m3, m4, rC, cC, g, bg);
		for (j in f.pageSavedArr[i].element) {
			tempPage.element.push($.extend(true, {}, f.pageSavedArr[i].element[j]));
		}
		for (j in f.pageSavedArr[i].order) {
			tempPage.order.push($.extend(true, {}, f.pageSavedArr[i].order[j]));
		}
		pageSavedArr.push($.extend(true, {}, tempPage));
	}
	renderSavedPages(pageSavedArr);
}

function updateAllPages(pageObj) {
	if (!$.isEmptyObject(pageSetup)) {
		pageSetup = $.extend(true, {}, pageObj);
		pageSetup.id = 'pageSetup';
		pageSetup.render('page_setup_page');
		pageSetup.renderElements('page_setup_page');
	}
	if (!$.isEmptyObject(pageLayout)) {
		pageLayout = $.extend(true, {}, pageObj);
		pageLayout.id = 'pageLayout';
		pageLayout.render('page_layout_page');
		pageLayout.renderElements('page_layout_page');
	}
	if (!$.isEmptyObject(pageOrder)) {
		pageOrder = $.extend(true, {}, pageObj);
		pageOrder.id = 'pageOrder';
		pageOrder.render('page_order_page');
		pageOrder.renderElements('page_order_page');

	}
	if (!$.isEmptyObject(pageAlt)) {
		pageAlt = $.extend(true, {}, pageObj);
		pageAlt.id = 'pageAlt';
		pageAlt.render('page_alt_page');
		pageAlt.renderElements('page_alt_page');
	}
	cellMarginBlockDisplay();
}

var eventLog = [];

function logEvent(s) {
	var evt = {'time':Date.now(), 'event':s};
	eventLog.push(evt);
}