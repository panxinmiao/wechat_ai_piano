
function scale(value, inMin, inMax, min, max){
	return ((value - inMin) / (inMax - inMin)) * (max - min) + min
}

class RollClass {
	constructor(canvas){

    this._canvasId = canvas
    
    //this._height;
    var that = this;
    // wx.createSelectorQuery().select("#keyboard").boundingClientRect(function (box) {
    //   that._box = box
    // }).exec();


    this._shownNotes = []
    this._shownAiNotes = []
		this._currentNotes = {}

		//window.camera = this._camera

		//start the loop
		this._lastUpdate = Date.now()
		this._boundLoop = this._loop.bind(this)
		
		//window.addEventListener('resize', this._resize.bind(this))
	}


	get bottom(){
    return this._box.height
		//return this._element.clientHeight + this._camera.position.y
	}

  setBox(box){
    this._box = box
  }

  startRoll(box){
    this._box = box;
    this._context = wx.createCanvasContext(this._canvasId)
    this._context.setStrokeStyle('red')
    this._context.setFillStyle('red')
    this._context.save()
    this._frame = 0
    this._startTime = Date.now()
    this._boundLoop();
  }
	// appendTo(container){
	// 	container.appendChild(this._element)
	// 	this._resize()
	// }

	add(roll_note){
		//this._scene.add(element)
    if(roll_note.ai){
      this._shownAiNotes.push(roll_note)
    }else{
      this._shownNotes.push(roll_note)
    }
	}


	_loop(){
    this._frame ++;
    const delta = Date.now() - this._lastUpdate
		this._lastUpdate = Date.now()
    //this._context.fillRect(10, 400, 150, 100)
    //this._context.draw(true)

    //console.log(delta)

    const ctx = this._context

    ctx.setFillStyle('#1FB7EC')

    for (var i = 0; i < this._shownNotes.length; i++){
      var rollnote = this._shownNotes[i]
      //console.log(rollnote);
      rollnote.pos.y += 1 / 10 * delta;

      if (rollnote.off && rollnote.pos.y - rollnote.pos.height >= this.bottom){
        this._shownNotes.splice(i,1)
        i=i-1;
      }else{
        var x = rollnote.pos.x
        var y = this.bottom - rollnote.pos.y
        var w = rollnote.pos.width
        var h = rollnote.off ? rollnote.pos.height : rollnote.pos.y
        ctx.fillRect(x, y, w, h)
      }
    }


    ctx.setFillStyle('#FFB729')
    for (var i = 0; i < this._shownAiNotes.length; i++) {
      var rollnote = this._shownAiNotes[i]
      //console.log(rollnote);
      rollnote.pos.y += 1 / 10 * delta;

      if (rollnote.off && rollnote.pos.y - rollnote.pos.height >= this.bottom) {
        this._shownAiNotes.splice(i, 1)
        i = i - 1;
      } else {
        var x = rollnote.pos.x
        var y = this.bottom - rollnote.pos.y
        var w = rollnote.pos.width
        var h = rollnote.off ? rollnote.pos.height : rollnote.pos.y
        ctx.fillRect(x, y, w, h)
      }
    }

    //console.log("_shownNotes: " + this._shownNotes.length)
    //console.log("_shownAiNotes: " + this._shownAiNotes.length)
    ctx.draw()

    //ctx.translate(0, -1 / 10 * delta);

    //setTimeout(this._boundLoop, 1000)
    
    if (typeof requestAnimationFrame !== 'undefined') {
      //console.log(requestAnimationFrame);
      requestAnimationFrame(this._boundLoop)
    }else{
      setTimeout(this._boundLoop, 16)
    }
		//this._renderer.render( this._scene, this._camera )
		//this._camera.position.y += 1 / 10 * delta
	}
}

const Roll = new RollClass("roll_canvas")

export {Roll}