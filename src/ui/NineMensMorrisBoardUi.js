import {fabric} from 'fabric-webpack';
import {EventEmitter} from '../helpers/EventEmitter.js';

export class NineMensMorrisBoardUi extends EventEmitter {

  constructor(canvas_element, settings = {}) {
    super();

		const _settings = Object.assign({
			totalHeight:720,
		  totalWidth:600,
			paddingTop:60,
			paddingLeft:20,
			paddingRight:20,
			paddingBottom:60,
			onStoneMove: (from,to) => {}
		},settings);


    this.canvas = new fabric.Canvas(canvas_element, {selection: false});
		this.onStoneMove = _settings.onStoneMove;
    this.paddingTop = _settings.paddingTop;
    this.paddingLeft = _settings.paddingLeft;
    this.paddingRight = _settings.paddingRight;
    this.paddingBottom = _settings.paddingBottom;

    this.totalHeight = _settings.totalHeight;
    this.totalWidth = _settings.totalWidth;

    this.boardHeight = this.totalHeight - this.paddingTop - this.paddingBottom;
    this.boardWidth = this.totalWidth - this.paddingLeft - this.paddingRight;

    this.canvas.setHeight(this.totalHeight);
    this.canvas.setWidth(this.totalWidth);

    this._setupGrid();
    this._setupStones();
    this._setupOverlays();
  }


  _setupOverlays()
  {
    this.textOverlayWhiteWon = new fabric.Text('WHITE\nwins!', {
      originX: 'center',
      originY: 'center',
      selectable: false,
      left: 0, //Take the block's position
      top: 0,
      fill: 'white',
      stroke: 'black',
      textAlign: 'center',
      fontFamily: 'Sans',
      fontWeight: 'bold',
      fontSize: '35',
      hasControls: false,
      hasBorders: false,
      strokeWidth: 1,
      opacity: 0,
    });

    this.textOverlayMill = new fabric.Text('Mill!', {
      originX: 'center',
      originY: 'center',
      selectable: false,
      left: 0, //Take the block's position
      top: 0,
      fill: 'white',
      stroke: 'black',
      textAlign: 'center',
      fontFamily: 'Sans',
      fontWeight: 'bold',
      fontSize: '35',
      hasControls: false,
      hasBorders: false,
      strokeWidth: 1,
      opacity: 0,
    });

    this.textOverlayBlackWon = new fabric.Text('BLACK\nwins!', {
      originX: 'center',
      originY: 'center',
      selectable: false,
      left: 0, //Take the block's position
      top: 0,
      fill: 'black',
      stroke: 'black',
      textAlign: 'center',
      fontFamily: 'Sans',
      fontWeight: 'bold',
      fontSize: '35',
      hasControls: false,
      hasBorders: false,
      strokeWidth: 1,
      opacity: 0,
    });

    this.textOverlayDraw = new fabric.Text('DRAW!', {
      originX: 'center',
      originY: 'center',
      selectable: false,
      left: 0, //Take the block's position
      top: 0,
      fill: 'black',
      stroke: 'black',
      textAlign: 'center',
      fontFamily: 'Sans',
      fontWeight: 'bold',
      fontStyle: 'italic',
      fontSize: '35',
      hasControls: false,
      hasBorders: false,
      strokeWidth: 1,
      opacity: 0,
    });

    this.canvas.add(this.textOverlayWhiteWon);
    this.canvas.centerObject(this.textOverlayWhiteWon);

    this.canvas.add(this.textOverlayBlackWon);
    this.canvas.centerObject(this.textOverlayBlackWon);

    this.canvas.add(this.textOverlayDraw);
    this.canvas.centerObject(this.textOverlayDraw);

    this.canvas.add(this.textOverlayMill);
    this.canvas.centerObject(this.textOverlayMill);
  }

  _setupGrid() {
    const strokeWidth = 4;
    const lineColor = '#000000';
    const boardFillColor = '#FFF1C1';

    let rectangleProto = new fabric.Rect({
      selectable: false,
      fill: boardFillColor,
      angle: 0,
      strokeWidth: strokeWidth,
      stroke: lineColor,
      evented: false,
      hasControls: false,
      hasBorders: false
    });

    let outerRectangle = fabric.util.object.clone(rectangleProto);
    outerRectangle.set(
      {left: this.paddingLeft,
        top: this.paddingTop,
      width: this.boardWidth,
      height: this.boardHeight}
    );
    this.canvas.add(outerRectangle);

    let innerRectangle1 = fabric.util.object.clone(rectangleProto);
    innerRectangle1.set({
      left: this.paddingLeft + this.boardWidth / 6,
      top: this.paddingTop + this.boardHeight / 6,
      width: this.boardWidth - this.boardWidth / 3,
      height: this.boardHeight - this.boardHeight / 3
    });
    this.canvas.add(innerRectangle1);

    let innerRectangle2 = fabric.util.object.clone(rectangleProto);
    innerRectangle2.set({
      left: this.paddingLeft + 2 * this.boardWidth / 6,
      top: this.paddingTop + 2 * this.boardHeight / 6,
      width: this.boardWidth / 3,
      height: this.boardHeight / 3
    });
    this.canvas.add(innerRectangle2);

    const lineParams = {
      fill: lineColor,
      stroke: lineColor,
      strokeWidth: strokeWidth,
      selectable: false
    };
    let vertGridLine1 = new fabric.Line([
      this.paddingLeft + this.boardWidth / 2,
      this.paddingTop,
      this.paddingLeft + this.boardWidth / 2,
      this.paddingTop + this.boardHeight / 3
    ], lineParams);
    this.canvas.add(vertGridLine1);

    let vertGridLine2 = new fabric.Line([
      this.paddingLeft + this.boardWidth / 2,
      this.paddingTop + this.boardHeight - this.boardHeight / 3,
      this.paddingLeft + this.boardWidth / 2,
      this.paddingTop + this.boardHeight
    ], lineParams);
    this.canvas.add(vertGridLine2);

    let horizontalGridLine1 = new fabric.Line([
      this.paddingLeft, this.paddingTop + this.boardHeight / 2,
      this.paddingLeft + this.boardWidth / 3,
      this.paddingTop + this.boardHeight / 2
    ], lineParams);
    this.canvas.add(horizontalGridLine1);

    let horizontalGridLine2 = new fabric.Line([
      this.paddingLeft + this.boardWidth - this.boardWidth / 3,
      this.paddingTop + this.boardHeight / 2,
      this.paddingLeft + this.boardWidth,
      this.paddingTop + this.boardHeight / 2
    ], lineParams);
    this.canvas.add(horizontalGridLine2);

    const circleParams = {
      strokeWidth: 2,
      radius: 6,
      fill: '#000',
      stroke: '#000',
      originX: 'center',
      originY: 'center',
      selectable: false
    };

    const hintCircleParams = {
      strokeWidth: 2,
      radius: 10,

      colorAllowed: '#6dff05',
      colorNotAllowed: '#ff0000',
      colorHighlight: 'orange',

      fillWhenActive: 'orange',
      fillWhenInactive: '#6dff05',

      stroke: '#000',
      originX: 'center',
      originY: 'center',
      selectable: false
    };

    this.hintCircles = new fabric.Group();
    this.hintCircles.setOpacity(0.0);

    this.removalIndicators = [];


    for (let level = 0; level < 3; level++)
    {

      const positionsTop = {
        "top": this.paddingTop + strokeWidth / 2 + this.boardHeight * (level) / 6,
        "center": this.paddingTop + strokeWidth / 2 + this.boardHeight / 2,
        "bottom": this.paddingTop + strokeWidth / 2 + this.boardHeight * (6 - level) / 6
      };
      const positionsLeft = {
        "left": this.paddingLeft + strokeWidth / 2 + this.boardWidth * (level) / 6,
        "center": this.paddingLeft + strokeWidth / 2 + this.boardWidth / 2,
        "right":this.paddingLeft + strokeWidth / 2 + this.boardWidth - this.boardWidth * (level) / 6
      };

      const circlePositions = [ [ positionsLeft.left, positionsTop.top ],
                                [ positionsLeft.center, positionsTop.top ],
                                [ positionsLeft.right, positionsTop.top ],
                                [ positionsLeft.right, positionsTop.center ],
                                [ positionsLeft.right, positionsTop.bottom ],
                                [ positionsLeft.center, positionsTop.bottom ],
                                [ positionsLeft.left, positionsTop.bottom ],
                                [ positionsLeft.left, positionsTop.center ]
      ];

      for( let i=0; i<8; i++ )
      {
        const currentPositionIndex = level * 8 + i;

        let intersectionCircle = new fabric.Circle(Object.assign({
          left: circlePositions[i][0],
          top:  circlePositions[i][1],
        }, circleParams));

        intersectionCircle.hasControls = intersectionCircle.hasBorders = false;
        intersectionCircle.positionIndex = currentPositionIndex;
        this.canvas.add(intersectionCircle);


        let hintCircle = new fabric.Circle(Object.assign({
          left: circlePositions[i][0],
          top:  circlePositions[i][1],
        }, hintCircleParams));

        hintCircle.hasControls = hintCircle.hasBorders = false;
        hintCircle.positionIndex = currentPositionIndex;
        this.hintCircles.add(hintCircle);


        let removableSign = this._createRemovalSign(circlePositions[i]);
        removableSign.positionIndex = currentPositionIndex;
        this.removalIndicators.push(removableSign);
      }

    }

    this.canvas.add(this.hintCircles);

  }

  setAllowedHints(allowed_positions)
  {
    this.hintCircles.forEachObject((obj) => {
      if(allowed_positions.indexOf(obj.positionIndex) !== -1)
      {
        obj.fillWhenActive = obj.colorHighlight;
        obj.fillWhenInactive = obj.colorAllowed;
      }
      else
      {
        obj.fillWhenActive = obj.colorNotAllowed;
        obj.fillWhenInactive = obj.colorNotAllowed;
      }
    });
  }



  _createRemovalSign(position,offset=8)
  {
    const removalCircleParams = {
      strokeWidth: 4,
      radius: 10,
      stroke: 'rgba(255,0,0,0.8)',
      fill: 'rgba(0,0,0,0)', //transparent
      originX: 'center',
      originY: 'center',
      selectable: true
    };

    let removalCircle = new fabric.Circle(Object.assign({
      left: position[0],
      top:  position[1],
    }, removalCircleParams));

    let removalLineX1 = new fabric.Line([
      position[0]-offset,
      position[1]-offset,
      position[0]+offset,
      position[1]+offset
    ], {
      originX: 'center',
      originY: 'center',
      stroke: 'rgba(255,0,0,0.8)',
      strokeWidth: 4,
    });

    let removalLineX2 = new fabric.Line([
      position[0]+offset,
      position[1]-offset,
      position[0]-offset,
      position[1]+offset
    ], {
      originX: 'center',
      originY: 'center',
      stroke: 'rgba(255,0,0,0.8)',
      strokeWidth: 4,
    });

    let removableSign = new fabric.Group(
      [removalCircle,removalLineX2,removalLineX1],
      {
        hasControls: false,
        hasBorders: false,
        lockMovementX : true,
        lockMovementY : true
      }
    );

    return removableSign;
  }

  _setStones(target, placedStones,numRemoved)
  {
    this.canvas.remove(...target);
    let idx = 0;

    for(;idx<placedStones.length;idx++)
    {

      target[idx].isRemoved = false;
      target[idx].currentPositionIndex = placedStones[idx];
      this.canvas.add(target[idx]);

    }

    for(;idx<9;idx++)
    {

      target[idx].isRemoved = (idx - placedStones.length) < numRemoved;
      target[idx].currentPositionIndex = null;

      if( !target[idx].isRemoved )
      {
        this.canvas.add(target[idx]);
      }

    }

  }


  setStones(placedWhiteStones, placedBlackStones, numRemovedStonesWhite, numRemovedStonesBlack)
  {
    this._setStones(this.whiteStones,placedWhiteStones,numRemovedStonesWhite);
    this._setStones(this.blackStones,placedBlackStones,numRemovedStonesBlack);
    this._alignFreeStonePositions();
    this._alignPlacedStonesPositions();
    this.canvas.renderAll();
  }


  _alignPlacedStonesPositions()
  {
    for(let stone of this.whiteStones.concat(this.blackStones))
    {
      stone.hoverObject = null;
      if(stone.currentPositionIndex !== null)
      {
          stone.set({'top': this.hintCircles.item(stone.currentPositionIndex).top,
                     'left': this.hintCircles.item(stone.currentPositionIndex).left}).setCoords();
      }
    }

  }


  _setupStones() {

    this.whiteStones = [];
    this.blackStones = [];

    for (let i = 0; i < 9; i++) {
      let whiteStone = new fabric.Circle({
        originX: 'center',
        originY: 'center',
        radius: 14 //TODO
      });
      whiteStone.setGradient('fill', {
        type: 'radial',
        r1: 50,
        r2: 40,
        x1: 45,
        y1: 45,
        x2: 52,
        y2: 50,
        colorStops: {
          0: 'rgb(255,255,255,1)',
          1: 'rgba(244, 244, 244,1)'
        }
      });
      whiteStone.setShadow({color: 'rgba(0,0,0,0.3)', offsetX: 2, offsetY: 2, blur: 5});
      whiteStone.hasControls = whiteStone.hasBorders = false;
      whiteStone.currentPositionIndex = null;
      whiteStone.isRemoved = false;
      whiteStone.player = 0;
      this.whiteStones.push(whiteStone);

      let blackStone = new fabric.Circle({originX: 'center', originY: 'center', radius: 14}); //TODO
      blackStone.setGradient('fill', {
        type: 'radial',
        r1: 30,
        y1: 5,
        x2: 52,
        y2: 50,
        colorStops: {
          0: 'rgb(255,255,255,1)',
          1: 'rgba(0, 0, 0,1)'
        }
      });
      blackStone.setShadow({color: 'rgba(0,0,0,0.3)', offsetX: 2, offsetY: 2, blur: 5});
      blackStone.hasControls = blackStone.hasBorders = false;
      blackStone.currentPositionIndex = null;
      blackStone.isRemoved = false;
      blackStone.player = 1;
      this.blackStones.push(blackStone);
    }

    this.canvas.add(...this.whiteStones);
    this.canvas.add(...this.blackStones);

    this._alignFreeStonePositions();

		let _this = this;

		this.canvas.on('object:moving', (e) => {
			let stone = e.target;
      _this.hintCircles.stopOutAnimation = true;

      if(this.removalIndicators.indexOf(e.target) !== -1)
      {
        //This is a security precaution.
        return;
      }

      if(!!!stone.wasMovingFired)
      {
        stone.wasMovingFired = true;
        _this.hintCircles.setOpacity(1.0);
        this.triggerEvent('stone:begin_move',stone.player,stone.currentPositionIndex);
      }

      stone.setOpacity(0.7);
      stone.setCoords();

			let hoverObject = null;
			_this.hintCircles.forEachObject((obj) => {

        obj.setCoords();

        if (obj.intersectsWithObject(stone) || obj.isContainedWithinObject(stone))
        {
					hoverObject = obj;
					obj.set({fill: obj.fillWhenActive});
          obj.setRadius(12);
				}
        else
        {
					obj.set({fill: obj.fillWhenInactive});
          obj.setRadius(10);
				}

			});

			if (hoverObject !== null)
      {
				stone.hoverObject = hoverObject;
			}
      else
      {
				stone.hoverObject = null;
			}

		});

    this.canvas.on('object:selected', (e) => {
      let clickedRemovalIndicator = e.target;
      if(this.removalIndicators.indexOf(clickedRemovalIndicator) === -1)
      {
        return;
      }

      if(this.triggerEvent('stone:remove',clickedRemovalIndicator.positionIndex))
      {

        for(let stoneId = 0; stoneId < 9; stoneId++)
        {

          if(this.whiteStones[stoneId].currentPositionIndex === clickedRemovalIndicator.positionIndex)
          {

            this.whiteStones[stoneId].isRemoved = true;
            this.canvas.remove(this.whiteStones[stoneId]);
            break;

          }

          if(this.blackStones[stoneId].currentPositionIndex === clickedRemovalIndicator.positionIndex)
          {
            this.blackStones[stoneId].isRemoved = true;
            this.canvas.remove(this.blackStones[stoneId]);
            break;
          }

        }

        this.removalIndicators.forEach( (obj) => {
            this.canvas.remove(obj);
        });
      }

    });

		this.canvas.on('mouse:up', (e) =>	{
        let stone = e.target;
        if(stone)
        {
          stone.wasMovingFired = false;
        }
			}
		);

		this.canvas.on('object:modified', (e) => {

      let stone = e.target;

			stone.setOpacity(1);

      if ((stone.player !== 0 && stone.player !== 1) ||
           stone.hoverObject === null ||
           stone.hoverObject.positionIndex === undefined ||
           !this.triggerEvent("stone:moved", stone.player,
                                              stone.currentPositionIndex,
                                              stone.hoverObject.positionIndex))
      {
        if (stone.currentPositionIndex !== null)
        {
          _this.hintCircles.forEachObject((obj) => {
            if (obj.positionIndex === stone.currentPositionIndex)
            {
              stone.set({'top': obj.top, 'left': obj.left}).setCoords();
            }
          });
        }
			}

      this._alignFreeStonePositions();

      _this.hintCircles.stopOutAnimation = false;
			_this.hintCircles.animate('opacity', 0.0,{
        duration:250,
        onChange: _this.canvas.renderAll.bind(_this.canvas),
        abort: function(){
          return _this.hintCircles.stopOutAnimation;
        }

      });
		});


  }



  _alignFreeStonePositions()
  {
    let atTop = 0;
    const stoneOffset = 20;

    //Adjust White Stones
    for (let i = 0; i < 9; i++) {
      let curItem = this.whiteStones[i];
      if (curItem.isRemoved !== true && curItem.currentPositionIndex === null)
      {
        curItem.set({
          'top': this.paddingTop / 2,
          'left': this.paddingLeft + atTop * stoneOffset
        }).setCoords();
        atTop += 1;
      }
    }

    atTop = 0;
    //Adjust Black Stones
    for (let i = 0; i < 9; i++) {
      let curItem = this.blackStones[i];
      if (curItem.isRemoved !== true && curItem.currentPositionIndex === null)
      {
        curItem.set({
          'top': this.paddingTop / 2,
          'left': this.paddingLeft + this.boardWidth - atTop * stoneOffset
        }).setCoords();
        atTop += 1;
      }
    }

    this.canvas.renderAll();
  }

  enableRemovalIndicatorsFor(positionIndices)
  {
    this.activeRemovalIndicators = positionIndices;
  }

	//Ui states.
  static get WHITE_MOVE() {
    return 0;
  }

  static get WHITE_REMOVE() {
    return 1;
  }

  static get BLACK_MOVE() {
    return 2;
  }

  static get BLACK_REMOVE() {
    return 3;
  }

	static get NO_TURN() { //Draw or Win
    return 4;
  }

  static get OVERLAY_WHITE_WON() {
    return 5;
  }

  static get OVERLAY_BLACK_WON() {
    return 6;
  }

  static get OVERLAY_DRAW() {
    return 7;
  }

  static get OVERLAY_MILL() {
    return 8;
  }


  hideOverlays()
  {
    this.textOverlayDraw.setOpacity(0);
    this.textOverlayBlackWon.setOpacity(0);
    this.textOverlayWhiteWon.setOpacity(0);
    this.textOverlayMill.setOpacity(0);
  }

  setOverlay(overlay,typeOfDraw=null)
  {
    let overlayObject = null;

    if(overlay === NineMensMorrisBoardUi.OVERLAY_WHITE_WON)
    {
      overlayObject = this.textOverlayWhiteWon;
    }
    else if (overlay === NineMensMorrisBoardUi.OVERLAY_BLACK_WON)
    {
      overlayObject = this.textOverlayBlackWon;
    }
    else if (overlay === NineMensMorrisBoardUi.OVERLAY_DRAW)
    {
      overlayObject = this.textOverlayDraw;
    }
    else if(overlay === NineMensMorrisBoardUi.OVERLAY_MILL)
    {
      overlayObject = this.textOverlayMill;
    }

    if(overlayObject !== null)
    {
      overlayObject.animate('opacity', 1.0, {
        duration:250,
        onChange:this.canvas.renderAll.bind(this.canvas)
        }
      );
    }
    else
    {
      this.hideOverlays();
    }
    this.canvas.renderAll();

  }

  setTurn(turn) {
    for (let i = 0; i < 9; i++)
    {
				this.whiteStones[i].selectable =
						(turn === NineMensMorrisBoardUi.WHITE_MOVE);
				this.blackStones[i].selectable =
						(turn === NineMensMorrisBoardUi.BLACK_MOVE);
    }

    if( turn === NineMensMorrisBoardUi.WHITE_REMOVE ||
        turn === NineMensMorrisBoardUi.BLACK_REMOVE )
    {
      this.removalIndicators.forEach((group) => {

        if(this.activeRemovalIndicators.indexOf(group.positionIndex) !== -1)
        {
          group.setOpacity(1.0);
          group.selectable = true;
        }
        else
        {
          group.setOpacity(0.0);
          group.selectable = false;
        }

        this.canvas.add(group);

        group.bringToFront();
      });

    }
    else{
      this.removalIndicators.forEach((group) => {
        group.setOpacity(0.0);
        group.selectable = false;
      });
      this.canvas.remove(...this.removalIndicators);
    }

    this.currentTurn = turn;
	}
}
