// pages/piano/piano.js
//const THREE = require('../../utils/three.min.js')

const ROLL = require('../../utils/Roll.js')
const RollNote = require('../../utils/RollNote.js')

const MidiConvert = require('../../utils/midiconvert/MidiConvert.js')

const MidiParser = require('../../utils/midiparser.js')

import { Track } from '../../utils/midiconvert/Track'

import Util from '../../utils/midiconvert/Util'
//import MidiConvert from 'utils/MidiConvert'
//const Tone = require("../../utils/sound/Tone.min.js")

//import { Sound } from '../../utils/sound/Sound'

//const geometry = new THREE.PlaneBufferGeometry(1, 1, 1)
//const material = new THREE.MeshBasicMaterial({ color: 0x1FB7EC, side: THREE.BackSide })
//const aiMaterial = new THREE.MeshBasicMaterial({ color: 0xFFB729, side: THREE.BackSide })
const aiNotes = {}
const notes = {}
const key_boxes = {}

const app = getApp()
var audios = {}

var ai_midi
var ai_track
var ai_sendTimeout = -1

const ai_heldNotes = {}

var ai_lastPhrase = -1

var ai_aiEndTime = 0
//const sound = new Sound()

var toneStartTime = 0;


var demoPlaying = false;
var currentDemoTrack = [];


const beat = 0.4
const testMelody = [
  {
    note: 60,
    time: beat * 0,
    duration: beat
  },
  {
    note: 62,
    time: beat * 1,
    duration: beat
  },
  {
    note: 64,
    time: beat * 2,
    duration: beat
  },
  {
    note: 64,
    time: beat * 3,
    duration: beat * 0.5
  },
  {
    note: 62,
    time: beat * 3.6,
    duration: beat * 0.5
  },
  {
    note: 60,
    time: beat * 4,
    duration: beat * 0.5
  },
  {
    note: 60,
    time: beat * 5,
    duration: beat
  }
]

Page({

  /**
   * 页面的初始数据
   */
  data: {
    keys: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // const offsets = [0, 0.5, 1, 1.5, 2, 3, 3.5, 4, 4.5, 5, 5.5, 6];
    // const keyWidth = (1 / 7) / 2;
    // var style_width = `${keyWidth * 100}%`
    // var keys = [];
    // for(var i=48; i<72; i++){
    //   var isSharp = ([1, 3, 6, 8, 10].indexOf(i % 12) !== -1);
    //   var sharpClass = isSharp ? 'black' : 'white';

    //   var noteOctave = Math.floor(i / 12) - Math.floor(48 / 12);
    //   var offset = offsets[i % 12] + noteOctave * 7;

    //   var style_left = `${offset * keyWidth * 100}%`;

    //   var keyE = {
    //     class: 'key ' + sharpClass,
    //     id: i.toString(),
    //     style: `width: ${style_width}; left: ${style_left};`,
    //     fills: [{
    //       name: 'div',
    //       attrs: {
    //         class: 'highlight active'
    //       }
    //     }]
    //   }
    //   keys.push(keyE);
    // }

    // this.setData({
    //   keys: keys
    // })
    //console.log(app.globalData.audios)
    if (app.globalData.audios == undefined) {
      //console.log(app.globalData.audios)
      wx.reLaunch({
        url: '../index/index'
      })
    }
    
    audios = app.globalData.audios

    var res = wx.getSystemInfoSync();

    this.setData({
      roll_width: res.windowWidth,
      roll_height: res.windowHeight - 130
    })

    wx.createSelectorQuery().selectAll("#keyboard #fill").boundingClientRect(function (box) {
      //console.log(box);
      for(var i=0; i< box.length; i++){
        key_boxes[i+48]=box[i];
      }
    }).exec();

    wx.createSelectorQuery().select("#roll_canvas").boundingClientRect(function (box) {
      //ROLL.Roll.setBox(box);
      //console.log(ROLL);
      ROLL.Roll.startRoll(box);
    }).exec();
    
    //  for (var i=36; i<=72; i++){
    //    var ctx = wx.createInnerAudioContext()
    //    ctx.src = 'http://192.168.123.120:8080/audio/note_sampler/'+i+'.mp3'
    //    ctx.onCanplay(function(e){
    //      //console.log(ctx);
    //    })
    //    audios[i.toString()] = ctx
    //  }
    
    

    ai_midi = new MidiConvert.create()
    ai_track = ai_midi.track()
    toneStartTime = Date.now();

    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var page = this;
    const now = this.toneTime() + 0.05;
    setTimeout(function(){
      var lastNote;
      //track.noteTask = []
      testMelody.forEach((note) => {
        var t_on = setTimeout(function () {
          page.keyDown(note.note);
          setTimeout(function () {
            page.keyUp(note.note);
          }, note.duration * 1000)
        }, note.time * 1000)

        lastNote = note;
      })

      wx.showToast({
        title: '当你弹奏一段旋律时',
        icon: 'none',
        duration: 3000
      })

      setTimeout(function () {
        wx.showToast({
          title: 'AI会响应你一段旋律',
          icon: 'none',
          duration: 3000
        })
      }, (lastNote.time + lastNote.duration) * 1000)
    },500)

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    return {
      title: '和人工智能一起弹奏一首乐曲',
      path: '/pages/index/index'
    }
  },

  toneTime: function(){
    return (Date.now() - toneStartTime)/1000;
  },

  touchstart: function(e) {
    const noteNum = parseInt(e.target.id.split('_')[1])
    this.keyDown(noteNum, false)


    //this.emit('keyDown', noteNum)
    //this._pointersDown[e.pointerId] = true
  },

  touchend: function (e) {
    const noteNum = parseInt(e.target.id.split('_')[1])
    this.keyUp(noteNum, false)
  },
  
  touchmove: function (e) {
    //console.log(e)
  },

  playDemo: function(){
    if(demoPlaying){
      return;
    }
    wx.showNavigationBarLoading()
    var page = this;
    var request = new MidiConvert.create()
    wx.request({
      url: 'https://piano.panxinmiao.com/demo/game_of_thrones.mid',
      method: 'GET',
      header: {
        'content-type': 'text/plain;charset=UTF-8'
      },
      responseType: 'arraybuffer',
      success: function (res) {
        wx.hideNavigationBarLoading()
        wx.showToast({
          title: 'Game of Thrones',
          icon: 'none',
          duration: 5000
        })
        var response = page.decode(res.data, request);
        demoPlaying = true;
        currentDemoTrack = response.tracks;
        response.tracks.forEach((track) => {
          page.playTrack(track);
          console.log(track)
        })
        
      }
    })
  },

  cancelPlayDemo: function(){
    currentDemoTrack.forEach((track) => {
      track.noteTask.forEach((task) => {
        clearTimeout(task);
      })
    })
    demoPlaying = false;
  },

  keyDown(noteNum, ai = false, vol = 1) {
    

    //audios[noteNum].volume = 1;
    if (audios[noteNum]){
      //audios[noteNum].volume = vol
      audios[noteNum].play();
    }else{
      console.log(`note: ${noteNum} no mp3 source.`)
    }

    if (noteNum < 48 || noteNum > 71) {
      console.log(`note: ${noteNum} out range.`)
      return;
    }

    var box = key_boxes[noteNum]
    if(!box){
      return;
    }
    var rollnote = new RollNote.RollNote(box, ai);
    const noteArray = ai ? aiNotes : notes
    if (!noteArray[noteNum]) {
      noteArray[noteNum] = []
    }
    noteArray[noteNum].push(rollnote)

    var dataObj = {}
    dataObj['fill_' + noteNum] = {
      show: true,
      ai: ai
    }
    this.setData(dataObj);
    
    if(this.data.ai_turn != ai){
      this.setData({
        ai_turn: ai
      })
    }

    if(!ai){
      this.ai_keyDown(noteNum, this.toneTime());
      this.cancelPlayDemo()
    }
  },

  ai_keyDown(note, time = this.toneTime()){
    if (ai_track.length === 0 && ai_lastPhrase === -1) {
      //console.log('-------------ai_lastPhrase------:' + ai_lastPhrase);
      ai_lastPhrase = Date.now()
    }
    ai_track.noteOn(note, time)
    clearTimeout(ai_sendTimeout)
    ai_heldNotes[note] = true
  },  

  keyUp(noteNum, ai = false) {
    if (audios[noteNum]) {
      //audios[noteNum].play();
      setTimeout(function () {
        // audios[noteNum].volume = 0.05;
        // setTimeout(function(){
        //   audios[noteNum].stop();
        // },200)
        audios[noteNum].stop();
      }, 300);
    } else {
      console.log(`note: ${noteNum} no mp3 source.`)
    }

    if (noteNum < 48 || noteNum > 71) {
      console.log(`note: ${noteNum} out range.`)
      return;
    }

    const noteArray = ai ? aiNotes : notes
    if (!(noteArray[noteNum] && noteArray[noteNum].length)) {
      // throw new Error('note off without note on')
      // setTimeout(() => this.keyUp.bind(this, noteNum, ai), 100)
      console.warn('note off before note on')
    } else {
       var note = noteArray[noteNum].shift();
       //console.log(note);
       note.noteOff()
    }

    var dataObj = {}
    dataObj['fill_' + noteNum] = {
      show: false
    }

    this.setData(dataObj);

    //this.fadeout(audios[noteNum]);
    
    //audios['48'].volume = 0.2;
    //audios['48'].play();

    if (!ai) {
      this.ai_keyUp(noteNum, this.toneTime())
    }
  },

  _newTrack() {
    ai_midi = new MidiConvert.create()
    ai_track = ai_midi.track()
  },

  decode(bytes, request) {
    if (bytes instanceof ArrayBuffer) {
      var byteArray = new Uint8Array(bytes)
      bytes = String.fromCharCode.apply(null, byteArray)
    }

    const midiData = MidiParser(bytes);
    //console.log(midiData)

    function parseHeader(midiJson) {
      var ret = {
        PPQ: midiJson.header.ticksPerBeat
      }
      for (var i = 0; i < midiJson.tracks.length; i++) {
        var track = midiJson.tracks[i]
        for (var j = 0; j < track.length; j++) {
          var datum = track[j]
          if (datum.type === "meta") {
            if (datum.subtype === "timeSignature") {
              ret.timeSignature = [datum.numerator, datum.denominator]
            } else if (datum.subtype === "setTempo") {
              if (!ret.bpm) {
                ret.bpm = 60000000 / datum.microsecondsPerBeat
              }
            }
          }
        }
      }
      ret.bpm = ret.bpm || 120
      return ret
    }

    request.header = parseHeader(midiData)

    //replace the previous tracks
    request.tracks = []

    midiData.tracks.forEach((trackData) => {

      const track = new Track()
      request.tracks.push(track)

      let absoluteTime = 0
      trackData.forEach((event) => {
        absoluteTime += Util.ticksToSeconds(event.deltaTime, request.header)
        if (event.type === 'meta' && event.subtype === 'trackName') {
          track.name = Util.cleanName(event.text)
        } else if (event.subtype === 'noteOn') {
          track.noteOn(event.noteNumber, absoluteTime, event.velocity / 127)
        } else if (event.subtype === 'noteOff') {
          track.noteOff(event.noteNumber, absoluteTime)
        } else if (event.subtype === 'controller' && event.controllerType) {
          track.cc(event.controllerType, absoluteTime, event.value / 127)
        } else if (event.type === 'meta' && event.subtype === 'instrumentName') {
          track.instrument = event.text
        } else if (event.type === 'channel' && event.subtype === 'programChange') {
          track.patch(event.programNumber)
        }
      })
    })
    return request;
  },

  playTrack(track){
    if (!track.notes || track.notes.length ==0 ){
      return;
    }
    var page = this;
    track.ai_aiEndTime = 0;
    const now = page.toneTime() + 0.05;
    var lastNote;
    track.noteTask = []
    track.notes.forEach((note) => {
      if (note.noteOn + now >= track.ai_aiEndTime) {
        //console.log(note);
        track.ai_aiEndTime = note.noteOn + now

        //page.keyDown(note.midi, true)

        //console.log(note.noteOn + now);

        var t_on = setTimeout(function () {
          page.keyDown(note.midi, true, note.velocity);
          setTimeout(function () {
            page.keyUp(note.midi, true);
          }, note.duration * 1000)
        }, note.noteOn * 1000)

        track.noteTask.push(t_on);

        // var t_off = setTimeout(function () {
        //   page.keyUp(note.midi, true);
        // }, note.noteOff * 1000)

        //track.noteTask.push(t_off);

        lastNote = note;
      }
    })

    //console.log(lastNote)

    setTimeout(function () {
      page.setData({
        ai_turn: false
      })
      demoPlaying = false;
    }, lastNote.noteOff * 1000)

  },

  send() {
    //trim the track to the first note
    if (ai_track.length) {
      
      let request = ai_midi.slice(ai_midi.startTime)
      this._newTrack()
      let endTime = request.duration
      //shorten the request if it's too long
      if (endTime > 10) {
        request = request.slice(request.duration - 15)
        endTime = request.duration
      }
      let additional = endTime
      additional = Math.min(additional, 8)
      additional = Math.max(additional, 1)
      var duration = endTime + additional;
      var page = this;
      console.log(request);
      wx.request({
        url: 'https://piano.panxinmiao.com/predict?duration=' + duration, 
        method: 'POST',
        data: JSON.stringify(request.toArray()),
        header: {
          'content-type': 'text/plain;charset=UTF-8'
        },
        responseType: 'arraybuffer',
        success: function (res) {
          var response = page.decode(res.data, request);

          page.setData({
            ai_turn: true
          })
          page.playTrack(response.slice(endTime / 2).tracks[1]);

        }
      })

      ai_lastPhrase = -1
      //this.emit('sent')
    }
  },

  ai_keyUp(note, time = this.toneTime()){
    ai_track.noteOff(note, time)
    delete ai_heldNotes[note]
    // send something if there are no events for a moment
    if (Object.keys(ai_heldNotes).length === 0) {
      if (ai_lastPhrase !== -1 && Date.now() - ai_lastPhrase > 3000) {
        //just send it
        this.send()
      } else {
        ai_sendTimeout = setTimeout(this.send.bind(this), 600 + (time - this.toneTime()) * 1000)
      }
    }
  }

  // fadeout(ctx, time=200){
  //    var start = new Date().getTime();
  //    //var delta = 1/time;

  //    var volumeDown = function () {
  //      var now = new Date().getTime();
  //      var delta = (now - start) / time;
  //      console.log(ctx.volume);
  //      if (1 > delta) {
  //        ctx.volume = 1 - delta;
  //        setTimeout(volumeDown, 50)
  //      }else{
  //        ctx.stop()
  //      }
  //    }

  //    setTimeout(volumeDown, 10);

  //  }

})