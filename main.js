let activeResonators = [];
let selectedIndex;
let tempData;
let sideButtons = [];
let frequency = [];
let maxFrequency = 1000;
let minFrequency = 5;
let df = 10;
let highlightBox;
let impedancePlot;
let absorptionPlot;
let clearAllButton;
let resultsSlider;
let zoomScale = 1000;
let zoomDelta = 0.75;
let inputParameters = [];
let mainFont = 'Consolas';
let topWindow = {
    width: 600,
    height: 300,
    position: {
        x: 50,
        y: 25,
    }
};
let chartType = 0;
let resultsOption = 0;
let impedanceMax = 1;
let currentMaximumSize = {
    x: 0.1,
    y: 0.15
};
let graph = {
    position: {
        top: '380px',
        left: '100px'
    },
    size: {
        width: '500px',
        height: '250px'
    }
};

let propertyBarParameters = {
    width: 0,
    height: 0,
    position: {
        x: 0,
        y: 0
    },
    inputBox: {
        size: {
            width: 0,
            height: 0,
        },
        position: {
            cavity: {
                x: [0.225, 0.225, 0.225],
                y: [0.455, 0.505, 0.555]
            },
            neck: {
                x: [0.675, 0.675, 0.675],
                y: [0.455, 0.505, 0.555]
            },
            absorber: {
                x: [0.6, 0.6],
                y: [0.7, 0.75]
            }
        },        
        
    },
    text: {
        width: 0.8,
        fontSize: 12,
        position: {
            cavity: {
                x: [0.05, 0.05, 0.05, 0.05],
                y: [0.375, 0.435, 0.485, 0.535]
            },
            neck: {
                x: [0.5, 0.5, 0.5, 0.5],
                y: [0.375, 0.435, 0.485, 0.535]
            },
            absorber: {
                x: [0.05, 0.05, 0.05],
                y: [0.625, 0.675, 0.725]
            },
        }
    }
    
};


let img = [];
let imgRatio = 480/600;
function preload() {
    for(let idx = 0; idx < 4; idx ++)
        img.push(loadImage('figures/coupled_resonators_'+idx+'.svg'));
}

function setup(){
    createCanvas(windowWidth,windowHeight); 
    textFont(mainFont);
    Chart.defaults.global.defaultFontFamily = mainFont;
    Chart.defaults.global.tooltips.enabled = false;
    Chart.defaults.global.defaultFontColor = 'black';
    Chart.defaults.global.title.fontColor = 'black';
    Chart.defaults.global.legend.labels.boxWidth = 2;
    textSize(16);
    text('COUPLED ACOUSTIC RESONATORS', topWindow.position.x,topWindow.position.y/2);
    frequency = Array(Math.ceil((maxFrequency - minFrequency) / df)).fill(minFrequency).map((x, y) => x + y * df)
    start();
}

function start(){
    drawRenderWindow();
    createTopBar();
    createMainButtons();
    drawResultsWindow();
    drawInfoText('initial');
    impedancePlot = createChart('chartImpedance',"impedance",{min:-impedanceMax, max:impedanceMax});
    absorptionPlot = createChart('chartAbsorption',"alpha",{min:0, max:1});
    setChartType();
}

function drawInfoText(option){
    let lineSize = 60;
    let arrowSize = 5;
    let arrowPosition = {
        x: topWindow.position.x + topWindow.width*0.4,
        y: topWindow.position.y + topWindow.height*0.45
    };
    let textPosition = {
        x: topWindow.position.x + topWindow.width*0.3,
        y: topWindow.position.y + topWindow.height*0.5
    }
    stroke(0);
    
    switch(option){
        case 'initial':
            noStroke();
            text("Choose an initial resonator type",
                textPosition.x, textPosition.y,
                topWindow.width*0.25);
            stroke(0);
            strokeWeight(2);
            line(arrowPosition.x,arrowPosition.y,
                arrowPosition.x, arrowPosition.y - lineSize);
            triangle(arrowPosition.x, arrowPosition.y - lineSize,
                arrowPosition.x + arrowSize, arrowPosition.y - lineSize+ arrowSize,
                arrowPosition.x - arrowSize, arrowPosition.y - lineSize + arrowSize,
                )
        break;
        case 'coupled':
            noStroke();
            text("Choose another resonator to be coupled to the previous one(s)",
                textPosition.x, textPosition.y,
                topWindow.width*0.25);
            stroke(0);
            strokeWeight(2);
            line(arrowPosition.x,arrowPosition.y,
                arrowPosition.x, arrowPosition.y - lineSize);
            triangle(arrowPosition.x, arrowPosition.y - lineSize,
                arrowPosition.x + arrowSize, arrowPosition.y - lineSize+ arrowSize,
                arrowPosition.x - arrowSize, arrowPosition.y - lineSize + arrowSize,
                );
        break;
    }
    

}

function drawRenderWindow(){
    fill(255);
    strokeWeight(2);
    rect(topWindow.position.x,topWindow.position.y,topWindow.width,topWindow.height);
    
    fill(245);
    rect(topWindow.position.x,topWindow.position.y,0.5*topWindow.width,topWindow.height*0.2);

    fill(0);
    // strokeWeight(0.5);
    noStroke();
    textSize(14);
    textAlign(CENTER);
    text("+ RESONATOR",
        topWindow.position.x + topWindow.width*0.1,
        topWindow.position.y + topWindow.height*0.12);
}

function drawResultsWindow(){
    fill(255);
    stroke(0);
    strokeWeight(2);
    rect(topWindow.position.x,
        topWindow.position.y + topWindow.height,
        topWindow.width, topWindow.height*1.25);
    fill(0);
    noStroke();
    textSize(14);
    textAlign(CENTER);
    text("RESULTS:",
    topWindow.position.x + 50,
        topWindow.position.y + topWindow.height*1.1);
    text("impedance",
    topWindow.position.x + 200,
        topWindow.position.y + topWindow.height*1.1);
    text("absorption",
    topWindow.position.x + 335,
        topWindow.position.y + topWindow.height*1.1);
    text("impedance range: ",
    topWindow.position.x + 125,
        topWindow.position.y + topWindow.height*2.075);

    
}

function redrawResonators(){
    let parent = activeResonators[0];
    parent.addGUIElement(parent.GUIElementPosition,zoomScale);
    for(let index = 1; index < activeResonators.length; index++){
        let previousPosition = {
            x: activeResonators[index-1].GUIElementPosition.x + 
            activeResonators[index-1].cavity.depth*zoomScale,
            y: activeResonators[index-1].GUIElementPosition.y
        };
        activeResonators[index].addGUIElement(previousPosition,zoomScale);
        activeResonators[index].computeResonance();
    }
    
    // parent.addGUIElement(parent.GUIElementPosition,zoomScale);
    // parent.children.forEach(child => {
    //     child.addGUIElement(child.GUIElementPosition,zoomScale);
    // });
    // activeResonators.forEach(resonator => {
    //     resonator.addGUIElement(resonator.GUIElementPosition,zoomScale);
    // });

}

function updateGUIElements(){
    drawRenderWindow();
    drawResultsWindow();
    drawPlaneWave();
    sideButtons.forEach(element => element.highlightButton(mouseX,mouseY));
    hideInputElements();
    resetAutomaticZoom();
    redrawResonators();
    updatePropertyBar(activeResonators[selectedIndex]);
}

function clearAll(){
    activeResonators = [];
    selectedIndex = -1;
    tempData = [];
    sideButtons = [];
    resultsSlider.remove();
    zoomScale = 1000;
    currentMaximumSize = {
        x: 0.1,
        y: 0.15
    };
    // zoomMinusButton.remove();
    // zoomPlusButton.remove();
    clearAllButton.remove();
    if(impedancePlot){
        impedancePlot.clear();
    }
    if(absorptionPlot){
        absorptionPlot.clear();
    }        
    inputParameters.forEach(index => {
        index.cavity.forEach(element => element.remove());
        index.neck.forEach(element => element.remove());
        index.absorber.forEach(element => element.remove());
    }
    );
    inputParameters = [];
    start();
}

function createMainButtons() {
    
    //// zoom
    // zoomMinusButton = createButton('-');
    // zoomMinusButton.position(topWindow.position.x + topWindow.width*0.05, 
    //     topWindow.position.y + topWindow.height*0.925);
    // zoomMinusButton.mousePressed(reduceZoom);
    // zoomMinusButton.style('font-family',mainFont);
    // zoomMinusButton.style('color','white');
    // zoomMinusButton.style('background-color','rgb(80,80,80)');

    // zoomPlusButton = createButton('+');
    // zoomPlusButton.position(topWindow.position.x + topWindow.width*0.135 , 
    //     topWindow.position.y + topWindow.height*0.925);
    // zoomPlusButton.mousePressed(increaseZoom);
    // zoomPlusButton.style('font-family',mainFont);
    // zoomPlusButton.style('color','white');
    // zoomPlusButton.style('background-color','rgb(80,80,80)');

    //// clear selected

    //// clear all button
    clearAllButton = createButton('CLEAR ALL');
    clearAllButton.position(topWindow.position.x + topWindow.width*0.05, 
        topWindow.position.y + topWindow.height*0.925);
    clearAllButton.mousePressed(clearAll);
    clearAllButton.style('font-family',mainFont);
    clearAllButton.style('color','white');
    clearAllButton.style('background-color','rgb(80,80,80)');

    resultsSlider = createSlider(0,1,0,1);
    resultsSlider.position(topWindow.position.x + 250,
                topWindow.position.y + topWindow.height*1.075);
    resultsSlider.style('width','40px');
    resultsSlider.input(setChartType);
    resultsSlider.class('switch');

    maxImpedanceInput = createInput(impedanceMax.toString());
    maxImpedanceInput.position(topWindow.position.x + 200,
        topWindow.position.y + topWindow.height*2.05);
    maxImpedanceInput.style('font-family',mainFont);
    maxImpedanceInput.style('width','50px');
    maxImpedanceInput.input(setMaxImpedance);

    exportButton = createButton('EXPORT RESULTS');
    exportButton.style('font-family',mainFont);
    exportButton.style('background-color', color(80,255));
    exportButton.style('color', color(255));
    exportButton.position(topWindow.position.x + 415,
        topWindow.position.y + topWindow.height*2.05);
    exportButton.mousePressed(exportCSVTables);
}

function setMaxImpedance(){
    impedanceMax = parseFloat(this.value());
    if(!chartType){
        updateChart(impedancePlot,"impedance",{min:-impedanceMax,max:impedanceMax});
    }    
}

function setChartType(){
    chartType = resultsSlider.value();
    let impChart = document.getElementById("chartImpedance");
    let absChart = document.getElementById("chartAbsorption");
    // drawResultsWindow();
    if(!chartType){
        impChart.style.visibility = "visible";
        absChart.style.visibility = "hidden";
    } else {
        impChart.style.visibility = "hidden";
        absChart.style.visibility = "visible";
    }

}

function highlightResultsOption(option){
    if(option){
        fill(150);
    }
    else {
        fill(0,0,50);
    }
}

function resetAutomaticZoom(){
    if(activeResonators.length){
        let maxGUISize, maxX = 0, maxY, tempY = [];
        activeResonators.forEach(resonator => {
            maxX += resonator.cavity.depth;
            tempY.push(resonator.cavityDimension);
        });
        // console.log('y array: ' + tempY);
        maxY = tempY.reduce(function(a, b) {
            return Math.max(a, b);
        });
        // console.log('max value: ' + maxY);
        maxGUISize = {x: maxX, y: maxY};
        if(maxGUISize.x > currentMaximumSize.x){
            zoomDelta = currentMaximumSize.x/maxGUISize.x;
            setZoom(zoomDelta);
            currentMaximumSize.x = maxGUISize.x;
            currentMaximumSize.y /= zoomDelta;
        }
        if(maxGUISize.y > currentMaximumSize.y){
            zoomDelta = currentMaximumSize.y/maxGUISize.y;
            setZoom(zoomDelta);
            currentMaximumSize.x /= zoomDelta;
            currentMaximumSize.y = maxGUISize.y;
        }
    }
}

function setZoom(delta) {
    if(activeResonators.length){
        zoomScale *= delta;
    }
}

function mouseMoved () {
    sideButtons.forEach(element => element.highlightButton(mouseX,mouseY));
}

function mousePressed(){
    sideButtons.forEach(element => element.clicked(mouseX,mouseY));
    activeResonators.forEach(element => element.clicked(mouseX,mouseY));
}

function runComputation(){
    activeResonators[0].computeImpedance(frequency);
    activeResonators[0].computeAbsorption();
    updateChart(impedancePlot,"impedance",{min:-impedanceMax, max:impedanceMax}); 
    updateChart(absorptionPlot,"alpha",{min:0, max:1}); 
}

function drawPlaneWave() {
    let position = {x: topWindow.position.x + topWindow.width*0.1, 
                    y: topWindow.position.y + topWindow.height*0.5};
    let spacing = topWindow.width*0.025;
    let waveDimension  = topWindow.height*0.25;
    let numberOfLines = 3;
    let triangleSize = topWindow.height*0.02;

    
    stroke(color(0,120,240,170));
    strokeWeight(2);
    let dx = 0;
    for(let n = 0; n < numberOfLines; n++){
        line(position.x + dx, 
            position.y - waveDimension*0.5,
            position.x + dx,
            position.y + waveDimension*0.5);
        dx += spacing;
    }

    stroke(0);
    line(position.x - spacing,position.y,position.x+numberOfLines*spacing,position.y);
    
    noStroke();
    fill(0);
    textAlign(LEFT);
    textSize(12);
    text("plane wave",position.x - spacing*numberOfLines/2,position.y + waveDimension*0.5+ spacing,position.x+numberOfLines*spacing);
    
    position.x *= 1.01
    triangle(position.x+numberOfLines*spacing-triangleSize,
            position.y + triangleSize,position.x+numberOfLines*spacing,
            position.y,position.x+numberOfLines*spacing-triangleSize,
            position.y - triangleSize
            )


}

function createTopBar(){
    let buttonSize = topWindow.width*0.05;
    let x0 = topWindow.position.x + topWindow.width*0.225;
    let y0 = topWindow.position.y + topWindow.height*0.1;
    let dx = topWindow.width*0.075;
    let buttonPosition = {
        x: [x0, x0 - buttonSize/2  + dx,
            x0 - buttonSize/2  + 2*dx, x0 + 3*dx],
        y: [y0, y0 - buttonSize/2 ,
            y0 - buttonSize/2 , y0]
    };
    
    sideButtons.push(new ElementButton(
        "cylindrical-cylindrical",
        createVector(buttonPosition.x[0],buttonPosition.y[0]),
        buttonSize
        ));
    sideButtons.push(new ElementButton(
        "cylindrical-rectangular",
        createVector(buttonPosition.x[1],buttonPosition.y[1]),
        buttonSize
        ));
    sideButtons.push(new ElementButton(
        "rectangular-rectangular",
        createVector(buttonPosition.x[2],buttonPosition.y[2]),
        buttonSize
        ));
    sideButtons.push(new ElementButton(
        "rectangular-cylindrical",
        createVector(buttonPosition.x[3],buttonPosition.y[3]),
        buttonSize
        ))
}

function createPropertyBar(resonator) {
    
    inputParameters.push({cavity:[],neck:[],absorber:[], resonance:[]});
    propertyBarParameters.width = topWindow.width*0.5;
    propertyBarParameters.fontSize = 12;
    propertyBarParameters.position = {
        x: topWindow.position.x + topWindow.width - propertyBarParameters.width, 
        y: topWindow.position.y 
    };
    // propertyBarParameters.inputBox.position.x = topWindow.position.x + topWindow.width - 0.25*propertyBarParameters.width;
    propertyBarParameters.inputBox.size.width = propertyBarParameters.width*0.15;
    propertyBarParameters.inputBox.size.height = propertyBarParameters.text.fontSize;

    let inputPosition = propertyBarParameters.inputBox.position;

    stroke(0);
    fill(0);
    // strokeWeight(0.5);
    textSize(propertyBarParameters.text.fontSize);

    switch(resonator.cavity.type){
        case "rectangular":
            
            inputParameters[selectedIndex].cavity.push(createInput(resonator.cavity.depth.toString()));
            inputParameters[selectedIndex].cavity[0].position(propertyBarParameters.position.x + inputPosition.cavity.x[0]*propertyBarParameters.width,
                topWindow.position.y + topWindow.height*inputPosition.cavity.y[0]);
            inputParameters[selectedIndex].cavity[0].size(propertyBarParameters.inputBox.size.width, 
                propertyBarParameters.inputBox.size.height);
            inputParameters[selectedIndex].cavity[0].style('font-family',mainFont);
            inputParameters[selectedIndex].cavity[0].input(updateModel); 

            
            inputParameters[selectedIndex].cavity.push(createInput(resonator.cavity.width.toString()));
            inputParameters[selectedIndex].cavity[1].position(propertyBarParameters.position.x + inputPosition.cavity.x[1]*propertyBarParameters.width,
                topWindow.position.y + topWindow.height*inputPosition.cavity.y[1]);
            inputParameters[selectedIndex].cavity[1].size(propertyBarParameters.inputBox.size.width, 
                propertyBarParameters.inputBox.size.height);
            inputParameters[selectedIndex].cavity[1].style('font-family',mainFont);
            inputParameters[selectedIndex].cavity[1].input(updateModel);
            
            
            inputParameters[selectedIndex].cavity.push(createInput(resonator.cavity.height.toString()));
            inputParameters[selectedIndex].cavity[2].position(propertyBarParameters.position.x + inputPosition.cavity.x[2]*propertyBarParameters.width,
                topWindow.position.y + topWindow.height*inputPosition.cavity.y[2]);
            inputParameters[selectedIndex].cavity[2].size(propertyBarParameters.inputBox.size.width, 
                propertyBarParameters.inputBox.size.height);
            inputParameters[selectedIndex].cavity[2].style('font-family',mainFont);
            inputParameters[selectedIndex].cavity[2].input(updateModel);

        break;
        case "cylindrical":
            
            inputParameters[selectedIndex].cavity.push(createInput(resonator.cavity.depth.toString()));
            inputParameters[selectedIndex].cavity[0].position(propertyBarParameters.position.x + inputPosition.cavity.x[0]*propertyBarParameters.width,
                topWindow.position.y + topWindow.height*inputPosition.cavity.y[0]);
            inputParameters[selectedIndex].cavity[0].size(propertyBarParameters.inputBox.size.width, 
                propertyBarParameters.inputBox.size.height);
            inputParameters[selectedIndex].cavity[0].style('font-family',mainFont);
            inputParameters[selectedIndex].cavity[0].input(updateModel); 

            
            inputParameters[selectedIndex].cavity.push(createInput(resonator.cavity.radius.toString()));
            inputParameters[selectedIndex].cavity[1].position(propertyBarParameters.position.x + inputPosition.cavity.x[1]*propertyBarParameters.width,
                topWindow.position.y + topWindow.height*inputPosition.cavity.y[1]);
            inputParameters[selectedIndex].cavity[1].size(propertyBarParameters.inputBox.size.width, 
                propertyBarParameters.inputBox.size.height);
            inputParameters[selectedIndex].cavity[1].style('font-family',mainFont);
            inputParameters[selectedIndex].cavity[1].input(updateModel);
            
        break;
    }
    //// neck properties
    
    switch(resonator.neck.type){
        case "rectangular":
            
            inputParameters[selectedIndex].neck.push(createInput(resonator.neck.thickness.toString()));
            inputParameters[selectedIndex].neck[0].position(propertyBarParameters.position.x + inputPosition.neck.x[0]*propertyBarParameters.width,
                topWindow.position.y + topWindow.height*inputPosition.neck.y[0]);
            inputParameters[selectedIndex].neck[0].size(propertyBarParameters.inputBox.size.width, 
                propertyBarParameters.inputBox.size.height);
            inputParameters[selectedIndex].neck[0].style('font-family',mainFont);
            inputParameters[selectedIndex].neck[0].input(updateModel);

            
            inputParameters[selectedIndex].neck.push(createInput(resonator.neck.a.toString()));
            inputParameters[selectedIndex].neck[1].position(propertyBarParameters.position.x + inputPosition.neck.x[1]*propertyBarParameters.width,
                topWindow.position.y + topWindow.height*inputPosition.neck.y[1]);
            inputParameters[selectedIndex].neck[1].size(propertyBarParameters.inputBox.size.width, 
                propertyBarParameters.inputBox.size.height);
            inputParameters[selectedIndex].neck[1].style('font-family',mainFont);
            inputParameters[selectedIndex].neck[1].input(updateModel);

            
            inputParameters[selectedIndex].neck.push(createInput(resonator.neck.b.toString()));
            inputParameters[selectedIndex].neck[2].position(propertyBarParameters.position.x + inputPosition.neck.x[2]*propertyBarParameters.width,
                topWindow.position.y + topWindow.height*inputPosition.neck.y[2]);
            inputParameters[selectedIndex].neck[2].size(propertyBarParameters.inputBox.size.width, 
                propertyBarParameters.inputBox.size.height);
            inputParameters[selectedIndex].neck[2].style('font-family',mainFont);
            inputParameters[selectedIndex].neck[2].input(updateModel);
            
        break;
        case "cylindrical":
            
            inputParameters[selectedIndex].neck.push(createInput(resonator.neck.thickness.toString()));
            inputParameters[selectedIndex].neck[0].position(propertyBarParameters.position.x + inputPosition.neck.x[0]*propertyBarParameters.width,
                topWindow.position.y + topWindow.height*inputPosition.neck.y[0]);
            inputParameters[selectedIndex].neck[0].size(propertyBarParameters.inputBox.size.width, 
                propertyBarParameters.inputBox.size.height);
            inputParameters[selectedIndex].neck[0].style('font-family',mainFont);
            inputParameters[selectedIndex].neck[0].input(updateModel);

            
            inputParameters[selectedIndex].neck.push(createInput(resonator.neck.radius.toString()));
            inputParameters[selectedIndex].neck[1].position(propertyBarParameters.position.x + inputPosition.neck.x[1]*propertyBarParameters.width,
                topWindow.position.y + topWindow.height*inputPosition.neck.y[1]);
            inputParameters[selectedIndex].neck[1].size(propertyBarParameters.inputBox.size.width, 
                propertyBarParameters.inputBox.size.height);
            inputParameters[selectedIndex].neck[1].style('font-family',mainFont);
            inputParameters[selectedIndex].neck[1].input(updateModel);

        break;
    }
    //// absorber properties
    
    inputParameters[selectedIndex].absorber.push(createInput(resonator.absorber.resistivity.toString()));
    inputParameters[selectedIndex].absorber[0].position(propertyBarParameters.position.x + inputPosition.absorber.x[0]*propertyBarParameters.width,
        topWindow.position.y + topWindow.height*inputPosition.absorber.y[0]);
    inputParameters[selectedIndex].absorber[0].size(propertyBarParameters.inputBox.size.width, 
        propertyBarParameters.inputBox.size.height);
    inputParameters[selectedIndex].absorber[0].style('font-family',mainFont);
    inputParameters[selectedIndex].absorber[0].input(updateModel);

    
    inputParameters[selectedIndex].absorber.push(createInput((resonator.absorber.thickness*100).toString()));
    inputParameters[selectedIndex].absorber[1].position(propertyBarParameters.position.x + inputPosition.absorber.x[1]*propertyBarParameters.width,
        topWindow.position.y + topWindow.height*inputPosition.absorber.y[1]);
    inputParameters[selectedIndex].absorber[1].size(propertyBarParameters.inputBox.size.width, 
        propertyBarParameters.inputBox.size.height);
    inputParameters[selectedIndex].absorber[1].style('font-family',mainFont);
    inputParameters[selectedIndex].absorber[1].input(updateModel);

    // inputParameters[selectedIndex].resonance = createInput(resonator.resonance.ToFixed(2));
    // inputParameters[selectedIndex].resonance[1].position(propertyBarParameters.position.x + inputPosition.absorber.x[1]*propertyBarParameters.width,
    //     topWindow.position.y + topWindow.height*inputPosition.absorber.y[1]);
    // inputParameters[selectedIndex].absorber[1].size(propertyBarParameters.inputBox.size.width, 
    //     propertyBarParameters.inputBox.size.height);
    // inputParameters[selectedIndex].absorber[1].style('font-family',mainFont);
    // inputParameters[selectedIndex].absorber[1].input(updateModel);
    

}

function updatePropertyBar(resonator) {

    let barWidth = propertyBarParameters.width;
    let barPosition = propertyBarParameters.position;
    let imgSize = 100;

    stroke(0);
    fill(255);
    strokeWeight(2);
    rect(barPosition.x,barPosition.y,barWidth,topWindow.height);
    fill(0);
    // strokeWeight(0.5);
    noStroke();
    textSize(propertyBarParameters.text.fontSize*1.25);
    textAlign(LEFT);
    text("PROPERTIES RESONATOR " + resonator.name,barPosition.x + barWidth*0.1,
        topWindow.position.y + barWidth*0.1,
        barWidth*0.35);
    
    textSize(propertyBarParameters.text.fontSize);
    let imgIdx;
    if(resonator.cavity.type == "cylindrical" && resonator.neck.type == "cylindrical")
        imgIdx = 0;
    else if(resonator.cavity.type == "rectangular" && resonator.neck.type == "cylindrical")
        imgIdx = 1;
    else if(resonator.cavity.type == "rectangular" && resonator.neck.type == "rectangular")
        imgIdx = 2;
    else if(resonator.cavity.type == "cylindrical" && resonator.neck.type == "rectangular")
        imgIdx = 3;
    else 
        console.log("NON-EXISTING RESONATOR TYPE!");    
    
    image(img[imgIdx],barPosition.x + barWidth*0.5,
        topWindow.position.y+ barWidth*0.05,imgSize,imgSize*imgRatio);

    //// cavity properties
    text("CAVITY:",barPosition.x + barWidth*propertyBarParameters.text.position.cavity.x[0],
    topWindow.position.y + topWindow.height*propertyBarParameters.text.position.cavity.y[0],
    barWidth*propertyBarParameters.text.width);
    switch(resonator.cavity.type){
        case "rectangular":
            text("d[m]:",barPosition.x + barWidth*propertyBarParameters.text.position.cavity.x[1],
            topWindow.position.y + topWindow.height*propertyBarParameters.text.position.cavity.y[1],
            barWidth*propertyBarParameters.text.width);
            inputParameters[selectedIndex].cavity[0].show();

            text("w[m]:",barPosition.x + barWidth*propertyBarParameters.text.position.cavity.x[2],
            topWindow.position.y + topWindow.height*propertyBarParameters.text.position.cavity.y[2],
            barWidth*propertyBarParameters.text.width);      
            inputParameters[selectedIndex].cavity[1].show();
            
            text("h[m]:",barPosition.x + barWidth*propertyBarParameters.text.position.cavity.x[3],
            topWindow.position.y + topWindow.height*propertyBarParameters.text.position.cavity.y[3],
            barWidth*propertyBarParameters.text.width);
            inputParameters[selectedIndex].cavity[2].show();

        break;
        case "cylindrical":
            text("d[m]:",barPosition.x + barWidth*propertyBarParameters.text.position.cavity.x[1],
            topWindow.position.y + topWindow.height*propertyBarParameters.text.position.cavity.y[1],
            barWidth*propertyBarParameters.text.width);
            inputParameters[selectedIndex].cavity[0].show();

            text("R[m]:",barPosition.x + barWidth*propertyBarParameters.text.position.cavity.x[2],
            topWindow.position.y + topWindow.height*propertyBarParameters.text.position.cavity.y[2],
            barWidth*propertyBarParameters.text.width);            
            inputParameters[selectedIndex].cavity[1].show();
            
        break;
    }

    //// neck properties
    text("NECK/HOLE:",barPosition.x + barWidth*propertyBarParameters.text.position.neck.x[0],
    topWindow.position.y + topWindow.height*propertyBarParameters.text.position.neck.y[0],
    barWidth*propertyBarParameters.text.width);
    switch(resonator.neck.type){
        case "rectangular":
            text("t[m]:",barPosition.x + barWidth*propertyBarParameters.text.position.neck.x[1],
            topWindow.position.y + topWindow.height*propertyBarParameters.text.position.neck.y[1],
            barWidth*propertyBarParameters.text.width);
            inputParameters[selectedIndex].neck[0].show();

            text("a[m]:",barPosition.x + barWidth*propertyBarParameters.text.position.neck.x[2],
            topWindow.position.y + topWindow.height*propertyBarParameters.text.position.neck.y[2],
            barWidth*propertyBarParameters.text.width);            
            inputParameters[selectedIndex].neck[1].show();

            text("b[m]:",barPosition.x + barWidth*propertyBarParameters.text.position.neck.x[3],
            topWindow.position.y + topWindow.height*propertyBarParameters.text.position.neck.y[3],
            barWidth*propertyBarParameters.text.width);
            inputParameters[selectedIndex].neck[2].show();
            
        break;
        case "cylindrical":
            text("t[m]:",barPosition.x + barWidth*propertyBarParameters.text.position.neck.x[1],
            topWindow.position.y + topWindow.height*propertyBarParameters.text.position.neck.y[1],
            barWidth*propertyBarParameters.text.width);
            inputParameters[selectedIndex].neck[0].show();

            text("r[m]:",barPosition.x + barWidth*propertyBarParameters.text.position.neck.x[2],
            topWindow.position.y + topWindow.height*propertyBarParameters.text.position.neck.y[2],
            barWidth*propertyBarParameters.text.width);            
            inputParameters[selectedIndex].neck[1].show();

        break;
    }
    //// absorber properties
    text("ABSORBER LAYER:",barPosition.x + barWidth*propertyBarParameters.text.position.absorber.x[0],
    topWindow.position.y + topWindow.height*propertyBarParameters.text.position.absorber.y[0],
    barWidth*propertyBarParameters.text.width);
    
    text("resistivity[Pa.s/m²]:",barPosition.x + barWidth*propertyBarParameters.text.position.absorber.x[1],
    topWindow.position.y + topWindow.height*propertyBarParameters.text.position.absorber.y[1],
    barWidth*propertyBarParameters.text.width);    
    inputParameters[selectedIndex].absorber[0].show();

    text("thickness[%]:",barPosition.x + barWidth*propertyBarParameters.text.position.absorber.x[2],
    topWindow.position.y + topWindow.height*propertyBarParameters.text.position.absorber.y[2],
    barWidth*propertyBarParameters.text.width);    
    inputParameters[selectedIndex].absorber[1].show();

    text("RESONANCE FREQUENCY [Hz]: " + resonator.resonance.toFixed(2),barPosition.x + barWidth*0.05,
        topWindow.position.y + barWidth*0.9,
        barWidth*0.8);
}

function hideInputElements() {
    let index = 0;
    inputParameters.forEach(resonator => {
        if(index != selectedIndex){
            resonator.cavity.forEach(element => element.hide());
            resonator.neck.forEach(element => element.hide());
            resonator.absorber.forEach(element => element.hide());
        }
        index += 1;
    });
}

function updateParameters(){
    let resonator = activeResonators[selectedIndex];
    
    //// update cavity parameters
    switch(resonator.cavity.type){
        case "rectangular":
            resonator.cavity.depth = parseFloat(inputParameters[selectedIndex].cavity[0].value());
            resonator.cavity.width = parseFloat(inputParameters[selectedIndex].cavity[1].value());
            resonator.cavity.height = parseFloat(inputParameters[selectedIndex].cavity[2].value());
        break;
        case "cylindrical":
            resonator.cavity.depth = parseFloat(inputParameters[selectedIndex].cavity[0].value());
            resonator.cavity.radius = parseFloat(inputParameters[selectedIndex].cavity[1].value());
        break;
    }

    //// update neck parameters
    switch(resonator.neck.type){
        case "rectangular":
            resonator.neck.thickness = parseFloat(inputParameters[selectedIndex].neck[0].value());
            resonator.neck.a = parseFloat(inputParameters[selectedIndex].neck[1].value());
            resonator.neck.b = parseFloat(inputParameters[selectedIndex].neck[2].value());
        break;
        case "cylindrical":
            resonator.neck.thickness = parseFloat(inputParameters[selectedIndex].neck[0].value());
            resonator.neck.radius = parseFloat(inputParameters[selectedIndex].neck[1].value());
        break;
    }

    //// update absorber parameters
    let resValue = parseFloat(inputParameters[selectedIndex].absorber[0].value());
    let thickValue = parseFloat(inputParameters[selectedIndex].absorber[1].value())*0.01;
    if(resValue <= 0)
        resValue = 0.001;
    
    if(thickValue <=0)
        thickValue = 0.0001;
    else if(thickValue > 1)
        thickValue = 1;

    resonator.absorber.resistivity = resValue;
    resonator.absorber.thickness = thickValue;

    resonator.computeResonance();
    updatePropertyBar(resonator);
}

function updateModel(){ 
    updateParameters();
    updateGUIElements();
    runComputation();
}

function createChart(canvasId,plotOption,range){
    let datasets;
    let legendFlag;
    let yLabel;
    switch(plotOption) {
        case "alpha":
            legendFlag = false;
            tempData = [];
            // for(let i = 0 ; i < frequency.length ; i++){
            //     tempData.push({x: frequency[i], y: parentHHR.alpha[i]});
            // };
            datasets = [{
                data: tempData,
                showLine: true,
                borderWidth: 2,
                backgroundColor: 'rgba(0,0,0,0)',
                borderColor: 'rgba(0,200,40,1)',
                pointRadius: 0,
            }];
            yLabel = 'absorption coefficient';
        break;
        case "impedance":
            tempData = [[],[],[]];
            legendFlag = true;
            // for(let i = 0 ; i < frequency.length ; i++){
            //     tempData[0].push({
            //         x: frequency[i], 
            //         y: parentHHR.Impedance.real[i]/(parentHHR.density*parentHHR.speedOfSound)});
            //     tempData[1].push({
            //         x: frequency[i], 
            //         y: parentHHR.Impedance.imag[i]/(parentHHR.density*parentHHR.speedOfSound)});
            //     tempData[2].push({
            //         x: frequency[i], 
            //         y: parentHHR.Impedance.abs[i]/(parentHHR.density*parentHHR.speedOfSound)});
            // };
            datasets = [{
                data: tempData[0],
                showLine: true,
                borderWidth: 2,
                backgroundColor: 'rgba(0,100,240,0)',
                borderColor: 'rgba(0,100,240,1)',
                pointRadius: 0,
                label: 'real'
            },
            {
                data: tempData[1],
                showLine: true,
                borderWidth: 2,
                backgroundColor: 'rgba(0,0,0,0)',
                borderColor: 'rgba(240,0,40,1)',
                pointRadius: 0,
                label: 'imaginary'
            },
            {
                data: tempData[2],
                showLine: true,
                borderWidth: 2,
                backgroundColor: 'rgba(0,0,0,0)',
                borderColor: 'rgba(10,100,20,1)',
                pointRadius: 0,
                label: 'amplitude'
            },
        ];
        yLabel = 'Norm. Acoustic Impedance';
        break;
    }
    let ctx = document.getElementById(canvasId).getContext('2d');;
    let tempChart = new Chart(ctx, {
      type: 'scatter',
      data: {
          datasets: datasets
      },
      options: {
        scales: {
            xAxes: [{
                type: 'linear',
                ticks: {
                    min: minFrequency,
                    max: maxFrequency
                },
                scaleLabel: {
                  labelString: 'Frequency [Hz]',
                  display: true,
                }
            }],
            yAxes: [{
                ticks: {
                    min: range.min,
                    max: range.max
                },
                scaleLabel: {
                  labelString: yLabel,
                  display: true,
                }
            }]
        },
        legend: {
            display: legendFlag,
            position:'top'
        },
        aspectRatio: 1,
        maintainAspectRatio: false
    }
    }
    );
    tempChart.canvas.parentNode.style.left = graph.position.left;
    tempChart.canvas.parentNode.style.top = graph.position.top;
    tempChart.canvas.parentNode.style.width = graph.size.width;
    tempChart.canvas.parentNode.style.height = graph.size.height;
    return tempChart;
}

function updateChart(chart,plotOption,range){
    switch(plotOption) {
        case "alpha":
            tempData = [];
            for(let i = 0 ; i < frequency.length ; i++){
                tempData.push({x: frequency[i], y: activeResonators[0].alpha[i]});
            };
            chart.data.datasets[0].data = tempData;
        break;
        case "impedance":
            tempData = [[],[],[]];
            for(let i = 0 ; i < frequency.length ; i++){
                tempData[0].push({
                    x: frequency[i], 
                    y: activeResonators[0].Impedance.real[i]/(activeResonators[0].density*activeResonators[0].speedOfSound)});
                tempData[1].push({
                    x: frequency[i], 
                    y: activeResonators[0].Impedance.imag[i]/(activeResonators[0].density*activeResonators[0].speedOfSound)});
                tempData[2].push({
                    x: frequency[i], 
                    y: activeResonators[0].Impedance.abs[i]/(activeResonators[0].density*activeResonators[0].speedOfSound)});
            };
            chart.data.datasets[0].data = tempData[0];
            chart.data.datasets[1].data = tempData[1];
            chart.data.datasets[2].data = tempData[2];
            chart.options.scales.yAxes[0].ticks.min = range.min;
            chart.options.scales.yAxes[0].ticks.max = range.max;
        break;
    }
    chart.update();
}


function exportCSVTables(){
    if(activeResonators.length){
        let tableImpedance = new p5.Table();
        let tableAbsorption = new p5.Table();
        let tableResonators = new p5.Table();

        tableImpedance.addColumn('Frequency [Hz]');
        tableImpedance.addColumn('Real [Pa.s/m]');
        tableImpedance.addColumn('Imag [Pa.s/m]');
        tableImpedance.addColumn('Abs [Pa.s/m]');

        tableAbsorption.addColumn('Frequency [Hz]');
        tableAbsorption.addColumn('Absorption Coefficient [-]');
    
    
        for(let idx = 0; idx < frequency.length; idx++){
            let newRowImpedance = tableImpedance.addRow();
            let newRowAbsorption = tableAbsorption.addRow();
            
            newRowImpedance.setNum('Frequency [Hz]',frequency[idx]);
            newRowImpedance.setNum('Real [Pa.s/m]', activeResonators[0].Impedance.real[idx]/(activeResonators[0].density*activeResonators[0].speedOfSound));
            newRowImpedance.setNum('Imag [Pa.s/m]', activeResonators[0].Impedance.imag[idx]/(activeResonators[0].density*activeResonators[0].speedOfSound));
            newRowImpedance.setNum('Abs [Pa.s/m]', activeResonators[0].Impedance.abs[idx]/(activeResonators[0].density*activeResonators[0].speedOfSound));
            
            newRowAbsorption.setNum('Frequency [Hz]',frequency[idx]);
            newRowAbsorption.setNum('Absorption Coefficient [-]', activeResonators[0].alpha[idx]);
        }
    
        saveTable(tableImpedance, 'impedance_results.csv');
        saveTable(tableAbsorption, 'absorption_results.csv');
    }
  }