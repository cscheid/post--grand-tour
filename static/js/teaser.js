const teaserFigure = document.querySelector("d-figure.teaser");
var teaser;

teaserFigure.addEventListener("ready", function() {
  console.log('teaserFigure ready');
  var epochs = d3.range(0,100,1);
  var urls = utils.getTeaserDataURL();

  var [gl, programs] = utils.initGL(
    '#teaser', 
    [['shaders/teaser_vertex.glsl', 'shaders/teaser_fragment.glsl']]
  );

  var kwargs = {
    epochs: epochs, 
    shouldAutoNextEpoch: true
  };
  teaser = new TeaserRenderer(gl, programs[0], kwargs);
  allViews.push(teaser);
  // teaser.overlay = new TeaserOverlay(teaser);
  
  teaser.overlay.fullScreenButton.remove();
  teaser.overlay.modeOption.remove();
  // teaser.overlay.grandtourButton.remove();
  
  teaser = utils.loadDataToRenderer(urls, teaser);
  

  utils.addDatasetListener(function(){
    var urls = utils.getTeaserDataURL();
    
    teaser = utils.loadDataToRenderer(urls, teaser);
    teaser.overlay.initLegend(utils.baseColors.slice(0,10), utils.getLabelNames());
    teaser.overlay.resize();

    if(utils.getDataset() == 'cifar10'){
      teaser.setColorFactor(0.0);
    }else{
      teaser.setColorFactor(utils.COLOR_FACTOR);
    }

  });
  
  window.addEventListener('resize', ()=>{
    teaser.overlay.resize();
    teaser.setFullScreen(teaser.isFullScreen);
  });

});

teaserFigure.addEventListener("onscreen", function() {
  console.log('onscreen');
  if(teaser && teaser.play){
    teaser.shouldRender = true;
    teaser.play();
  }
  for(let view of allViews){
    if(view !== teaser && view.pause){
      view.pause();
    }
  }
});

teaserFigure.addEventListener("offscreen", function() {
  console.log('offscreen');
  if(teaser && teaser.pause){
    teaser.pause();
  }
});    