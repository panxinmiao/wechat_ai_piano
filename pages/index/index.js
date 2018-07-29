//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    percent: 0
  },
  //事件处理函数
  bindViewTap: function() {
    // app.globalData.audios.forEach((ctx) => {
    //   ctx.offCanplay();
    // })
    for (var i = 36; i <= 72; i++) {
      app.globalData.audios[i].offCanplay();
    }
    wx.navigateTo({
      url: '../piano/piano'
    })
  },
  onLoad: function () {
    var loadedCtx = 0;
    if (app.globalData.audios == undefined){
      var audios = {}
      app.globalData.audios = {}
    }
    var page = this;
    for (var i = 36; i <= 72; i++) {
      var ctx = app.globalData.audios[i.toString()]
      if(ctx == undefined){
        ctx = wx.createInnerAudioContext()
        ctx.src = 'https://piano.panxinmiao.com/audio/note_sampler/' + i + '.mp3'
        ctx.onCanplay(function (e) {
          loadedCtx++;
          //console.log(loadedCtx)
          page.setData({
            percent: loadedCtx * 100 / 37
          })
          if (loadedCtx >= 37) {
            page.setData({
              loaded: true
            })
          }
        })

        app.globalData.audios[i.toString()] = ctx;
      }else{
        console.log(ctx);
        loadedCtx++;
        //console.log(loadedCtx)
        page.setData({
          percent: loadedCtx * 100 / 37
        })
      }
      
    }
    if (loadedCtx >= 37) {
      page.setData({
        loaded: true
      })
    }
  }
})
