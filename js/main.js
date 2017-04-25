function page(name, width, height, topMargin, rightMargin, bottomMargin, leftMargin, rC, cC, gut, bg) {

	this.id = name;
    this.w = width;
    this.h = height;
    this.bgColor = bg;
    this.marginDim = [topMargin, rightMargin, bottomMargin, leftMargin];
    this.marginPos = [
    	{'x': leftMargin/width, 'y': topMargin/height}, //TOP-LEFT
    	{'x': 1-rightMargin/width, 'y': topMargin/height}, //TOP-RIGHT
    	{'x': 1-rightMargin/width, 'y': 1-bottomMargin/height}, //BOTTOM-RIGHT
    	{'x': leftMargin/width, 'y': 1-bottomMargin/height} //BOTTOM-LEFT
    ];
    this.rowCount = rC;
    this.colCount = cC;
    this.gutter = gut;
    this.cellWidth = (width-leftMargin-rightMargin-(cC-1)*gut)/cC;
    this.cellHeight = (height-topMargin-bottomMargin-(rC-1)*gut)/rC;
    this.cellSize = {
    	'w': ((width-leftMargin-rightMargin-(cC-1)*gut)/cC)/(width-leftMargin-rightMargin),
    	'h': ((height-topMargin-bottomMargin-(rC-1)*gut)/rC)/(height-topMargin-bottomMargin),
    	'wp' : ((width-leftMargin-rightMargin-(cC-1)*gut)/cC + gut)/(width-leftMargin-rightMargin),
    	'hp' : ((height-topMargin-bottomMargin-(rC-1)*gut)/rC + gut)/(height-topMargin-bottomMargin),
    };

    this.element = [];
    this.order = [];

    this.calDim = function() {
        this.marginPos = [
            {'x': this.marginDim[3]/this.w, 'y': this.marginDim[0]/this.h}, //TOP-LEFT
            {'x': 1-this.marginDim[1]/this.w, 'y': this.marginDim[0]/this.h}, //TOP-RIGHT
            {'x': 1-this.marginDim[1]/this.w, 'y': 1-this.marginDim[2]/this.h}, //BOTTOM-RIGHT
            {'x': this.marginDim[3]/this.w, 'y': 1-this.marginDim[2]/this.h} //BOTTOM-LEFT
        ];
        this.cellWidth = (this.w-this.marginDim[3]-this.marginDim[1]-(this.colCount-1)*this.gutter)/this.colCount;
        this.cellHeight = (this.h-this.marginDim[0]-this.marginDim[2]-(this.rowCount-1)*this.gutter)/this.rowCount;
        this.cellSize = {
            'w': ((this.w-this.marginDim[3]-this.marginDim[1]-(this.colCount-1)*this.gutter)/this.colCount)/(this.w-this.marginDim[3]-this.marginDim[1]),
            'h': ((this.h-this.marginDim[0]-this.marginDim[2]-(this.rowCount-1)*this.gutter)/this.rowCount)/(this.h-this.marginDim[0]-this.marginDim[2]),
            'wp' : ((this.w-this.marginDim[3]-this.marginDim[1]-(this.colCount-1)*this.gutter)/this.colCount + this.gutter)/(this.w-this.marginDim[3]-this.marginDim[1]),
            'hp' : ((this.h-this.marginDim[0]-this.marginDim[2]-(this.rowCount-1)*this.gutter)/this.rowCount + this.gutter)/(this.h-this.marginDim[0]-this.marginDim[2]),
        };
    }

    this.render = function(divID) {
    	$('#'+divID).empty();
    	$('#'+divID).append('<div class="page_container"></div>');
    	var divW = $('#'+divID).width();
    	var divH = this.h/this.w * 100;
    	$('#'+divID+' .page_container').css('padding-bottom', divH+'%');
        if (bgDark) {
            $('#'+divID+' .page_container').append('<div class="page dark"></div>');
        } else {
            $('#'+divID+' .page_container').append('<div class="page"></div>');
        }
    	$('#'+divID+' .page_container .page').append('<div class="margin"></div>');
        $('#'+divID+' .page_container .page').css({
            'background': this.bgColor
        });
    	$('#'+divID+' .page_container .page .margin').css({
    		'position': 'absolute',
    		'width': (this.w-(this.marginDim[1]+this.marginDim[3]))/this.w * 100 + '%',
    		'height': (this.h-(this.marginDim[0]+this.marginDim[2]))/this.h * 100 + '%',
    		'top': this.marginPos[0].y * 100 + '%',
    		'left': this.marginPos[0].x * 100 + '%'
    	});

    	for (var j=0; j<this.rowCount; j++) {
    		for (var i=0; i<this.colCount; i++) {
    			$('#'+divID+' .page_container .page .margin').append('<div class="cell col_'+i+' row_'+j+'"></div>');
    			$('#'+divID+' .page_container .page .margin .cell.col_'+i+'.row_'+j).css({
    				'position': 'absolute',
		    		'width': this.cellSize.w * 100 + '%',
		    		'height': this.cellSize.h * 100 + '%',
		    		'top': j * this.cellSize.hp * 100 + '%',
		    		'left': i * this.cellSize.wp * 100 + '%',
    			});
    		}
    	}
    }

    this.renderElements = function(divID) {
        $('#'+divID+' .page_container .page .element').remove();
        for (var i in this.element) {
            $('#'+divID+' .page_container .page .margin').before('<div class="element" id="'+this.element[i].id+'_element'+'"></div>');
            var wSize = this.element[i].size.w <= this.colCount ? this.element[i].size.w : this.colCount;
            var hSize = this.element[i].size.h <= this.rowCount ? this.element[i].size.h : this.rowCount;
            var elementW = wSize*this.cellWidth + (wSize-1)*this.gutter;
            var elementH = hSize*this.cellHeight + (hSize-1)*this.gutter;
            var xPos = this.element[i].pos.x <= (this.colCount-wSize) ? this.element[i].pos.x : this.colCount-wSize;
            var yPos = this.element[i].pos.y <= (this.rowCount-hSize) ? this.element[i].pos.y : this.rowCount-hSize;
            var elementTop = yPos*this.cellHeight + yPos*this.gutter  + this.marginDim[0];
            var elementLeft = xPos*this.cellWidth + xPos*this.gutter + this.marginDim[3];
            $('#'+divID+' #'+this.element[i].id+'_element').css ({
                'position': 'absolute',
                'width': elementW / this.w * 100 + '%',
                'height': elementH / this.h * 100 + '%',
                'left': elementLeft / this.w * 100 + '%',
                'top': elementTop / this.h * 100 + '%',
                'z-index': this.element[i].layer
            });
            switch(this.element[i].type) {
                case 'text':
                    $('#'+divID+' #'+this.element[i].id+'_element').addClass('textObject');
                    var copyVal = this.element[i].copy;
                    $('#'+divID+' #'+this.element[i].id+'_element').html('<div class="text"><div class="copy">'+copyVal+'</div></div>');
                    var pageScale = $('#'+divID+' .page_container .page').width()/(this.w * 72 * 4/3);
                    var textSize = (this.element[i].fontSize*4/3 * pageScale);

                    $('#'+divID+' #'+this.element[i].id+'_element').css({
                        'align-items': this.element[i].verticalAlign,
                        'padding': this.element[i].padding+'em'
                    });

                    $('#'+divID+' #'+this.element[i].id+'_element .copy').css({
                        'font-family': this.element[i].fontFamily,
                        'font-size': textSize + 'px',
                        'font-weight': this.element[i].fontWeight,
                        'font-style': this.element[i].fontStyle,
                        'line-height': this.element[i].lineHeight,
                        'text-align': this.element[i].textAlign,
                        'text-decoration': this.element[i].textDecoration,
                        'color': this.element[i].color,
                        'letter-spacing': this.element[i].letterSpacing+'em'
                    });
                    $('#'+divID+' #'+this.element[i].id+'_element').css('background', this.element[i].bgColor);

                    var index = this.element[i].id.split('-')[1];
                    $('#'+divID+' #'+this.element[i].id+'_element').append('<div class="highlight_name">Text '+index+'</div>');
                    break;

                case 'image':
                    $('#'+divID+' #'+this.element[i].id+'_element').addClass('imageObject');
                    $('#'+divID+' #'+this.element[i].id+'_element').html('<div class="image_text">Image Object</div><div class="image"></div>');
                    $('#'+divID+' #'+this.element[i].id+'_element').css({
                        'background': this.element[i].bgColor
                    });
                    $('#'+divID+' #'+this.element[i].id+'_element .image').css({
                        'background-image': 'url('+this.element[i].src+')',
                        'background-repeat': 'no-repeat',
                        'background-position': 'center center',
                        '-webkit-background-size': this.element[i].bgSize,
                        '-moz-background-size': this.element[i].bgSize,
                        '-o-background-size': this.element[i].bgSize,
                        'background-size': this.element[i].bgSize,
                        'opacity': this.element[i].opacity
                    });
                    var index = this.element[i].id.split('-')[1];
                    $('#'+divID+' #'+this.element[i].id+'_element').append('<div class="highlight_name">Image '+index+'</div>');
                    break;
            }
            $('#'+divID+' #'+this.element[i].id+'_element').append('<div class="highlight_box"></div>');
        }
        $('#'+divID+' .element').on('mouseenter', function() {
            $('#'+divID+' .element.highlight').toggleClass('highlight');
            $(this).toggleClass('highlight');
        });
        $('#'+divID+' .element').on('mouseleave', function() {
            $('#'+divID+' .element.highlight').toggleClass('highlight');
        });
    }

    this.renderCellArea = function(divID, c, r, c2, r2) {
        $('#element_selection_area').remove();
        $('#'+divID+' .page_container .page .margin').prepend('<div id="element_selection_area"></div>');
        var cStart = c <= c2 ? c : c2;
        var cEnd = c <= c2 ? c2 : c;
        var rStart = r <= r2 ? r : r2;
        var rEnd = r <= r2 ? r2 : r;
        var areaW = (cEnd-cStart)*this.cellSize.wp + this.cellSize.w;
        var areaH = (rEnd-rStart)*this.cellSize.hp + this.cellSize.h;
        $('#element_selection_area').css({
            'position': 'absolute',
            'width': areaW * 100 + '%',
            'height': areaH * 100 + '%',
            'top': rStart * this.cellSize.hp * 100 + '%',
            'left': cStart * this.cellSize.wp * 100 + '%'
        });
    }

    this.renderSelectionBox = function(divID, x, y, c, r) {
        if ($('#temp_box').length == 0) {
            $('#'+divID+' .page_container .page .margin').append('<div id="temp_box"></div>');
        }
        var wW =  $('#'+divID+' .page_container .page .margin').eq(0).width();
        var hH =  $('#'+divID+' .page_container .page .margin').eq(0).height();
        var l1 = x;
        var t1 = y;
        l1 = l1 <= 0 ? 0 : l1 >= wW ? wW : l1;
        t1 = t1 <= 0 ? 0 : t1 >= hH ? hH : t1;
        var l2 = c * this.cellSize.wp * wW;
        var t2 = r * this.cellSize.hp * hH;
        var leftVal = l1 > l2 ? l2 : l1;
        var topVal = t1 > t2 ? t2 : t1;
        var wVal = Math.abs(l1-l2);
        var hVal = Math.abs(t1-t2);
        $('#temp_box').css({
            'position': 'absolute',
            'width': wVal + 'px',
            'height': hVal + 'px',
            'top': topVal + 'px',
            'left': leftVal + 'px'
        });
    }

    this.renderTransformBox = function(divID, elementID) {
        $('.highlight_box').off();
        $('.highlight_box .corner').off();
        $('.highlight_box .change_layer #layer_up').off();
        $('.highlight_box .change_layer #layer_down').off();

        $('#'+divID+' #'+elementID+' .highlight_box').html('<div class="corner top_left"></div><div class="corner top_right"></div><div class="corner bottom_right"></div><div class="corner bottom_left"></div><div class="change_layer"><div title="bring forward" class="layer_up layer_button"></div><div title="bring backward" class="layer_down layer_button"></div></div>');
        $('#'+divID+' #'+elementID+' .highlight_box .corner').css({
            'position': 'absolute',
            'width': cornerSize + 'px',
            'height': cornerSize + 'px',
            'border-radius': cornerSize/2 + 'px'
        });

        $('#'+divID+' #'+elementID+' .highlight_box .change_layer .layer_button').on('mouseenter', function() {
           mouseInLayer = true;
        });
        $('#'+divID+' #'+elementID+' .highlight_box .change_layer .layer_button').on('mouseleave', function() {
           mouseInLayer = false;
        });

        $('#'+divID+' #'+elementID+' .highlight_box .change_layer .layer_up').on('click', function() {
            var elemID = elementID.split('_')[0];
            for (i in pageLayout.element) {
                if (pageLayout.element[i].id==elemID) {
                    pageLayout.element[i].layer = pageLayout.element[i].layer + 1;
                    $('#'+divID+' #'+elementID).css('z-index', pageLayout.element[i].layer);
                    break;
                }
            }
        });

        $('#'+divID+' #'+elementID+' .highlight_box .change_layer .layer_down').on('click', function() {
            var elemID = elementID.split('_')[0];
            for (i in pageLayout.element) {
                if (pageLayout.element[i].id==elemID) {
                    pageLayout.element[i].layer = pageLayout.element[i].layer - 1;
                    pageLayout.element[i].layer = pageLayout.element[i].layer < 0 ? 0 : pageLayout.element[i].layer;
                    $('#'+divID+' #'+elementID).css('z-index', pageLayout.element[i].layer);
                    break;
                }
            }
        });


        $('#'+divID+' #'+elementID+' .highlight_box').on('mousedown', function() {
            if (!elementMove) {
                elementMove = true;
                rememberMousePos = {'x':mousePos.x, 'y':mousePos.y};
                elementPos.x = $('#'+divID+' #'+elementID).position().left;
                elementPos.y = $('#'+divID+' #'+elementID).position().top;
            }
        });
        $('#'+divID+' #'+elementID+' .highlight_box .corner').on('mousedown', function() {
            if (!elementScale) {
                elementScale = true;
                rememberMousePos = {'x':mousePos.x, 'y':mousePos.y};
                elementPos.x = $('#'+divID+' #'+elementID).position().left;
                elementPos.y = $('#'+divID+' #'+elementID).position().top;
                elementSize.w = $('#'+divID+' #'+elementID).width();
                elementSize.h = $('#'+divID+' #'+elementID).height();
                if ($(this).hasClass('top_left')) {
                    elementScaleCorner = 0;
                }
                if ($(this).hasClass('top_right')) {
                    elementScaleCorner = 1;
                }
                if ($(this).hasClass('bottom_left')) {
                    elementScaleCorner = 3;
                }
                if ($(this).hasClass('bottom_right')) {
                    elementScaleCorner = 2;
                }
            }
        });
    }

    this.renderElementMove = function(divID, elementID) {
        if ($('#temp_box').length == 0) {
            $('#'+divID+' .page_container .page .margin').append('<div id="temp_box"></div>');
        }
        var deltaX = mousePos.x - rememberMousePos.x;
        var deltaY = mousePos.y - rememberMousePos.y;
        var wVal = $('#'+divID+' #'+elementID).width();
        var hVal = $('#'+divID+' #'+elementID).height();
        var marginTop = $('#'+divID+' .page_container .page .margin').position().top;
        var marginLeft = $('#'+divID+' .page_container .page .margin').position().left;
        var marginWidth = $('#'+divID+' .page_container .page .margin').width();
        var marginHeight = $('#'+divID+' .page_container .page .margin').height();
        var topVal = elementPos.y + deltaY - marginTop;
        var leftVal = elementPos.x + deltaX - marginLeft;
        topVal = topVal <= 0 ? 0 : (topVal >= marginHeight - hVal) ? marginHeight - hVal : topVal;
        leftVal = leftVal <= 0 ? 0 : (leftVal >= marginWidth - wVal) ? marginWidth - wVal : leftVal; 
        var topRatio = topVal / marginHeight;
        var leftRatio = leftVal / marginWidth;
        var rowIndex = Math.round(topRatio / this.cellSize.hp);
        var colIndex = Math.round(leftRatio / this.cellSize.wp);
        var leftElem = (colIndex * this.cellSize.wp * marginWidth + marginLeft) / $('#'+divID+' .page_container .page').width();
        var topElem = (rowIndex * this.cellSize.hp * marginHeight + marginTop) / $('#'+divID+' .page_container .page').height();
        $('#temp_box').css({
            'position': 'absolute',
            'width': wVal + 'px',
            'height': hVal + 'px',
            'top': topVal + 'px',
            'left': leftVal + 'px'
        });
        $('#'+divID+' #'+elementID).css ({
            'position': 'absolute',
            'left': leftElem * 100 + '%',
            'top': topElem * 100 + '%'
        });
        var elemID = elementID.split('_')[0];
        for (i in this.element) {
            if (this.element[i].id==elemID) {
                this.element[i].pos.x = colIndex;
                this.element[i].pos.y = rowIndex;
                break;
            }
        }
    }

    this.renderElementScale = function(divID, elementID) {
        if ($('#temp_box').length == 0) {
            $('#'+divID+' .page_container .page .margin').append('<div id="temp_box"></div>');
        }
        var deltaX = mousePos.x - rememberMousePos.x;
        var deltaY = mousePos.y - rememberMousePos.y;
        var marginTop = $('#'+divID+' .page_container .page .margin').position().top;
        var marginLeft = $('#'+divID+' .page_container .page .margin').position().left;
        var marginWidth = $('#'+divID+' .page_container .page .margin').width();
        var marginHeight = $('#'+divID+' .page_container .page .margin').height();
        var x1 = elementPos.x;
        var y1 = elementPos.y;
        var x2 = elementPos.x + elementSize.w;
        var y2 = elementPos.y + elementSize.h;
        var x1d = x1, y1d = y1, x2d = x2, y2d = y2;
        switch(elementScaleCorner) {
            case 0:
                x1d = x1 + deltaX;
                y1d = y1 + deltaY;
                break;
            case 1:
                x2d = x2 + deltaX;
                y1d = y1 + deltaY;
                break;
            case 2:
                x2d = x2 + deltaX;
                y2d = y2 + deltaY;
                break;
            case 3:
                x1d = x1 + deltaX;
                y2d = y2 + deltaY;
                break;
        }

        x1d = x1d <= marginLeft ? marginLeft : x1d >= x2 ? x2 : x1d;
        y1d = y1d <= marginTop ? marginTop : y1d >= y2 ? y2 : y1d;
        x2d = x2d <= x1 ? x1 : x2d >= marginWidth+marginLeft ? marginWidth+marginLeft : x2d;
        y2d = y2d <= y1 ? y1 : y2d >= marginHeight+marginTop ? marginHeight+marginTop : y2d;

        var elemTop = Math.round(((y1d-marginTop)/marginHeight)/this.cellSize.hp);
        var elemLeft = Math.round(((x1d-marginLeft)/marginWidth)/this.cellSize.wp);
        var elemBottom = Math.round(((y2d-marginTop)/marginHeight)/this.cellSize.hp);
        var elemRight = Math.round(((x2d-marginLeft)/marginWidth)/this.cellSize.wp);

        switch(elementScaleCorner) {
            case 0:
                elemTop = elemBottom-elemTop <= 0 ? elemTop-1 : elemTop;
                elemLeft = elemRight-elemLeft <= 0 ? elemLeft-1 : elemLeft;
                break;
            case 1:
                elemTop = elemBottom-elemTop <= 0 ? elemTop-1 : elemTop;
                elemRight = elemRight-elemLeft <= 0 ? elemRight+1 : elemRight;
                break;
            case 2:
                elemBottom = elemBottom-elemTop <= 0 ? elemBottom+1 : elemBottom;
                elemRight = elemRight-elemLeft <= 0 ? elemRight+1 : elemRight;
                break;
            case 3:
                elemBottom = elemBottom-elemTop <= 0 ? elemBottom+1 : elemBottom;
                elemLeft = elemRight-elemLeft <= 0 ? elemLeft-1 : elemLeft;
                break;
        }

        $('#temp_box').css({
            'position': 'absolute',
            'width': Math.abs(x1d - x2d) + 'px',
            'height': Math.abs(y1d - y2d) + 'px',
            'top': y1d - marginTop + 'px',
            'left': x1d - marginLeft + 'px'
        });

        var leftElem = (elemLeft*this.cellSize.wp*marginWidth+marginLeft)/$('#'+divID+' .page_container .page').width();
        var topElem = (elemTop*this.cellSize.hp*marginHeight+marginTop)/$('#'+divID+' .page_container .page').height();
        var widthElem = ((elemRight-elemLeft-1)*this.cellSize.wp + this.cellSize.w)*(this.w-this.marginDim[1]-this.marginDim[3])/this.w;
        var heightElem = ((elemBottom-elemTop-1)*this.cellSize.hp + this.cellSize.h)*(this.h-this.marginDim[0]-this.marginDim[2])/this.h;

        $('#'+divID+' #'+elementID).css ({
            'position': 'absolute',
            'left': leftElem * 100 + '%',
            'top': topElem * 100 + '%',
            'width': widthElem * 100 + '%',
            'height': heightElem * 100 + '%'
        });
        
        var elemID = elementID.split('_')[0];
        for (i in this.element) {
            if (this.element[i].id==elemID) {
                this.element[i].pos.x = elemLeft;
                this.element[i].pos.y = elemTop;
                this.element[i].size.w = elemRight-elemLeft;
                this.element[i].size.h = elemBottom-elemTop;
                break;
            }
        }
    }

    //ORDERSTATE: 0=NO ORDER, -1/1=EQUALS LESS/GREATER
    this.setElementOrder = function(elem1, elem2, orderStateX, orderStateY) {
        var orderIndex = false;
        var oX = orderStateX.toString();
        var oY = orderStateY.toString();
        for (i in this.order) {
            if ((this.order[i].a == elem1 && this.order[i].b == elem2) ||
                (this.order[i].a == elem2 && this.order[i].b == elem1)) {
                this.order[i].a = elem1; //A IS THE SUBJECT ELEMENT
                this.order[i].b = elem2; //B IS THE CONTROL ELEMENT
                this.order[i].state.x = oX;
                this.order[i].state.y = oY;
                orderIndex = i;
                if (oX=='false' && oY=='false') {
                    this.order.splice(i, 1);
                }
                break;
            }
        }
        if (!orderIndex) {
            if (!(oX=='false' && oY=='false')) {
                this.order.push({'a':elem1, 'b':elem2, 'state': {'x':oX, 'y':oY}});
            }
        }
    }
}

function elementImage(name, source, x, y, w, h) {
	this.id = name;
    this.layer = 0;
	this.type = 'image';
	this.src = source;
	this.pos = {'x': x, 'y': y};
	this.size = {'w': w, 'h': h};
    this.bgColor = 'none';
    this.bgSize = 'cover';
    this.opacity = '1.0';
}

function elementText(name, content, x, y, w, h, fFamily, fSize, fWeight, fStyle, tDeco, lSpace, lHeight, alignH, alignV, c, bgc, pad) {
	this.id = name;
    this.layer = 1;
	this.type = 'text';
	this.copy = content;
	this.pos = {'x': x, 'y': y};
	this.size = {'w': w, 'h': h};
    this.fontFamily = fFamily;
	this.fontSize = fSize;
	this.fontWeight = fWeight;
	this.fontStyle = fStyle;
    this.textDecoration = tDeco;
	this.lineHeight = lHeight;
	this.textAlign = alignH;
	this.verticalAlign = alignV;
    this.color = c;
    this.bgColor = bgc;
    this.letterSpacing = lSpace;
    this.padding = pad;
}

$(window).on('resize', function() {
});