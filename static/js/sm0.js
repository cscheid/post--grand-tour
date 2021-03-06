function createSmallMultiple(
  figureId='#smallmultiple0', 
  epochs=[0,1,2,3], 
  methods=['tsne', 'dynamic_tsne', 'umap'],
  dataset=undefined,
  responsiveLegend=false,
  annotate=undefined){

  const smFigure0 = document.querySelector("d-figure"+figureId);
  const canvasId = d3.select(smFigure0).select('canvas').attr('id');
  let sm0;

  smFigure0.addEventListener("ready", ()=>{
    console.log('smFigure0 ready');
    let [gl, programs] = utils.initGL(
      '#' + canvasId, 
      [['shaders/smallmultiple_vertex.glsl', 'shaders/smallmultiple_fragment.glsl']]
    );
    let kwargs = { 
      epochs: epochs, 
      methods: methods,
    };
    let urls = utils.getSmallMultipleDataURL(kwargs.methods, dataset);

    sm0 = new SmallMultipleRenderer(gl, programs[0], kwargs);
    sm0.overlay = new SmallMultipleOverlay(sm0, dataset, responsiveLegend);
    sm0 = utils.loadDataToRenderer(urls, sm0);

    //TODO draw other in-figure annotations
    if(annotate !== undefined){
      annotate(sm0);
    }

    window[canvasId] = sm0;
    
    if(dataset==undefined){
      utils.addDatasetListener(function(){
        let urls = utils.getSmallMultipleDataURL(kwargs.methods, dataset);
        sm0.isDataReady = false;
        for(let k of sm0.methods){
          sm0.dataObj[k] = undefined;
        }
        sm0 = utils.loadDataToRenderer(urls, sm0);
        sm0.overlay.initLegend(utils.baseColors.slice(0,10), utils.getLabelNames());
      });
    }
    
    window.addEventListener('resize', ()=>{
      sm0.resize();
      sm0.overlay.resize();
    });
  }); 

  smFigure0.addEventListener("onscreen", function() {
    for(let view of allViews){
      if(view !== sm0 && view.pause){
        view.pause();
      }
    }
  });

  return sm0;
}


function onHighlightButtonClick(d, buttons, overlay, shouldTurnOffOthers=false){
    d.isOn = !d.isOn;
    if(d.isOn){
      if(shouldTurnOffOthers){
        // turn off other buttons
        buttons.filter(e=>e!=d)
        .each(d=>d.isOn=false)
        .style('background', '#eee');
      }
      // turn on this one
      d3.select(this).style('background', '#2196F3');
      d.action[0](d.action[1]);

    }else{
      d3.select(this).style('background', '#eee');
      overlay.clearBrushButton.on('click')();
    }
}

function highlight_digits(renderer){
  let figure = d3.select(d3.select('#'+renderer.gl.canvas.id).node().parentNode);//d-figure node
  let overlay = renderer.overlay;

  overlay.annotationGroup = figure.selectAll('.annotation-group')
  .data([0])
  .enter()
  .append('div')
  .attr('class', 'annotation-group');
  overlay.annotations = {};
  overlay.annotationGroup = figure.selectAll('.annotation-group');

  let data = [
    {text:'Highlight digit 1', action: [overlay.onSelectLegend.bind(overlay), 1]},
    {text:'Highlight digit 7', action: [overlay.onSelectLegend.bind(overlay), 7]},
  ];

  let buttons = overlay.annotationGroup.selectAll('button')
  .data(data)
  .enter()
  .append('button');
  buttons = overlay.annotationGroup.selectAll('button').text('a');

  let margin = 5;
  let buttonHeight = parseFloat(buttons.style('height'));
  let sy = d3.scaleLinear().domain([0,1]).range([0,(buttonHeight+margin)*(data.length-1)]);
  
  buttons.data(data)
  .style('display', 'block')
  .style('position', 'absolute')
  .style('top', (d,i)=>`calc(40% + ${sy(i)}px`)
  .style('left', (d,i)=>'calc(100% - 0px)')
  .style('width', '120px')
  .text(d=>d.text)
  .on('click', function(d){
    onHighlightButtonClick.bind(this)(d, buttons, overlay, shouldTurnOffOthers=true);
  });

  overlay.annotations.buttons = buttons;

}




function highlight_shoes(renderer){
  let figure = d3.select(d3.select('#'+renderer.gl.canvas.id).node().parentNode);//d-figure node
  let overlay = renderer.overlay;

  overlay.annotationGroup = figure.selectAll('.annotation-group')
  .data([0])
  .enter()
  .append('div')
  .attr('class', 'annotation-group');
  overlay.annotations = {};
  overlay.annotationGroup = figure.selectAll('.annotation-group');

  let data = [
    {text:'Highlight shoes', isOn: true, action: [overlay.onSelectLegend.bind(overlay), [5,7,9]]},
  ];

  buttons = overlay.annotationGroup.selectAll('button')
  .data(data)
  .enter()
  .append('button');
  buttons = overlay.annotationGroup.selectAll('button')
  .style('height', '33px');

  let buttonHeight = parseFloat(buttons.style('height'));
  let sy = d3.scaleLinear().domain([0,2]).range([0,buttonHeight*data.length*1.1]);
  
  buttons.data(data)
  .style('position', 'absolute')
  .style('top', (d,i)=>`calc(40% + ${sy(i)}px`)
  .style('left', (d,i)=>'calc(100% - 0px)')
  .style('width', '120px')
  .style('background', d=> d.isOn?'#2196F3':'#eee')
  .text(d=>d.text)
  .on('click', function(d){
    onHighlightButtonClick.bind(this)(d, buttons, overlay, shouldTurnOffOthers=true);
  });

  window.setTimeout(()=>{
    overlay.onSelectLegend([5,7,9]);
  }, 2000);
  
  overlay.annotations.buttons = buttons;
}



