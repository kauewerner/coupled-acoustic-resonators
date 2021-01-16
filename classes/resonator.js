class Resonator {
    constructor(neck,cavity,absorber,name,index){
        
        this.neck = neck;
        this.cavity = cavity;
        this.absorber = absorber;
        this.density = 1.21;
        this.viscosity = 1.81e-5;
        this.kinematicViscosity = 15.0e-6;
        this.speedOfSound = 340;
        this.children = [];
        this.frequency = [];
        this.GUIElementPosition = {x: 0, y:0};
        this.isSelected = false;
        this.name = name;
        this.index = index;
        
        this.initImpedance();
        this.initLumpedElements();
        // console.log("( R - rho*c0 ) = " + (this.R - this.density*this.speedOfSound).toFixed(4));
    }

    addChildResonator(newChild) {
        this.children.push(newChild);
    }

    computeImpedance(frequency) {
        
        this.initImpedance();
        this.initLumpedElements();
        this.frequency = frequency;
        let ZTemp = {real: [] , imag: []};
        let x = {real:0 , imag:0};
        let y = {real:0 , imag:0};
        
        if(this.children.length){
            for(let i = 0; i < frequency.length; i++){
                let sumReal = 0;
                let sumImag = 0;
                for(let n = 0; n < this.children.length; n++){
                    this.children[n].computeImpedance(frequency);
                    sumReal += (this.children[n].Impedance.real[i]/(this.children[n].Impedance.abs[i]**2));
                    sumImag -= (this.children[n].Impedance.imag[i]/(this.children[n].Impedance.abs[i]**2)); 
                }
                ZTemp.real.push(sumReal);
                ZTemp.imag.push(sumImag);
            }
        }

        for(let i = 0; i < frequency.length; i++){
            let w = 2*Math.PI*frequency[i];
            // let viscosityReactancefactor = (1/this.neck.radius)*Math.sqrt(this.viscosity/(this.density*w))/this.neckArea;
            // viscosityReactancefactor = 0;
            let resistanceFactor = 0.00083*Math.sqrt(w/(2*Math.PI));
            // let resistanceFactor = 0;
            let mFactor = Math.sqrt((8*this.kinematicViscosity/w)*(1 + (this.neck.thickness/(2*this.holeDimension))));
            
            
            x.real = (1 - (w**2)*this.L*(1 + (mFactor/(this.density/this.eps)))*this.C);
            x.imag = (w*this.R*(1 + resistanceFactor/this.R)*this.C);
            
            if(this.children.length){
                y.real = ZTemp.real[i];
                y.imag = (w*this.C + ZTemp.imag[i]);
            } else {
                y.real = 0;
                y.imag = (w*this.C);
            }
                
            this.Impedance.real.push(this.complexDivision(x,y).real);
            this.Impedance.imag.push(this.complexDivision(x,y).imag);
            
            this.Impedance.abs.push(Math.sqrt(this.Impedance.real[i]**2 + this.Impedance.imag[i]**2));
            this.Impedance.phase.push(Math.atan2(this.Impedance.imag[i],this.Impedance.real[i]));
        }
    }

    computeResonance(){
        this.initLumpedElements();
        this.resonance = (this.speedOfSound/(2*Math.PI))*Math.sqrt(this.neckArea/(this.cavityVolume*this.adjustedNeckThickness));
        // console.log('Resonance frequency: ' + this.resonance.toFixed(2) + 'Hz');
    }

    computeAbsorption(){
        this.alpha = [];
        if(!this.Impedance.real.length){
            this.computeImpedance(this.frequency);
        }
        for(let i = 0; i < this.frequency.length; i++){
            this.alpha.push(
                    4*(this.Impedance.real[i] / (this.density*this.speedOfSound) ) /
                ( 
                    ( (this.Impedance.real[i] / (this.density*this.speedOfSound) ) + 1)**2 + 
                    ( (this.Impedance.imag[i] / (this.density*this.speedOfSound) )**2 )
                )
            ); 
        }   
        // for(let i = 0; i < this.frequency.length; i++){
        //     this.alpha.push(
        //             4*(this.Impedance.real[i] ) /
        //         ( 
        //             ( (this.Impedance.real[i] ) + (this.density*this.speedOfSound))**2 + 
        //             ( (this.Impedance.imag[i] )**2 )
        //         )
        //     ); 
        // }       
    }

    computeC(){
        switch(this.cavity.type){
            case "cylindrical":
                this.cavityDimension = 2*this.cavity.radius;
                this.cavityArea = Math.PI*(this.cavity.radius**2);
                this.cavityVolume = Math.PI*(this.cavity.radius**2)*this.cavity.depth;
                break;
            case "rectangular":
                this.cavityDimension = this.cavity.height;
                this.cavityArea = this.cavity.width*this.cavity.height;
                this.cavityVolume =this.cavity.width*this.cavity.height*this.cavity.depth;
                break;
            // case "spherical":
            //     this.cavityVolume = (4/3)*Math.PI*(this.cavity.radius**3);

        }
        this.C = 1/(this.density*this.speedOfSound*(this.speedOfSound/(this.cavity.depth)));
    }

    computeL(){
        
        switch(this.neck.type){
            case "cylindrical":
                this.holeDimension = this.neck.radius;
                this.neckArea = Math.PI*(this.neck.radius**2);
                this.eps = this.neckArea/this.cavityArea;
                this.endCorrection = 0.8*(1 - (1.47*Math.sqrt(this.eps)) + (0.47*Math.sqrt(this.eps)));
                this.adjustedNeckThickness = (this.neck.thickness + 2*this.endCorrection*this.neck.radius);
                break;
            case "rectangular":
                this.holeDimension = this.neck.a/2;
                this.neckArea = (this.neck.a*this.neck.b);
                this.eps = this.neckArea/this.cavityArea;
                this.endCorrection = 0.85*(1 - (1.25*Math.sqrt(this.eps)));
                this.adjustedNeckThickness = (this.neck.thickness + 2*this.endCorrection*this.neck.a);
                break;
            case "slot":
                this.holeDimension = this.neck.height/2;
                this.neckArea = (this.neck.width*this.neck.height);
                this.eps = this.neckArea/this.cavityArea;
                this.endCorrection = (-1/Math.PI)*Math.log(Math.sin(0.5*Math.PI.this.eps));
                this.adjustedNeckThickness = (this.neck.thickness + 2*this.endCorrection*this.neck.width);
            default:
                console.error("cavity type not defined or non-existing");
        }
        // this.extEndCorrection = 0.48*Math.sqrt(this.neckArea);
        this.L = (this.density/this.eps)*this.adjustedNeckThickness;
        
    }
    
    computeR(){
        let factorR = this.density*this.speedOfSound;
        // let factorR = 1;
        this.R = this.absorber.resistivity*this.cavity.depth*this.absorber.thickness/this.eps/factorR;
        
    }

    complexDivision(numerator,denominator){
        let result = {real: 0, imag: 0}; 
        let squareNorm = (denominator.real**2) + (denominator.imag**2);
        result.real = ( ( numerator.real*denominator.real ) + ( numerator.imag*denominator.imag ) )/squareNorm;
        result.imag = ( ( numerator.imag*denominator.real ) - ( numerator.real*denominator.imag ) )/squareNorm;
        return result; 
    }

    initImpedance(){
        this.Impedance = {
            real: [], 
            imag: [],
            abs: [],
            phase: []
        };
    }

    initLumpedElements() {
        this.computeC();
        this.computeL();
        this.computeR();
    }

    addGUIElement(position,scale) {
        this.GUIElementPosition.x = position.x;
        this.GUIElementPosition.y = position.y;
        this.GUIscale = scale;
        let holeSize;
        let cavitySize;

        switch(this.neck.type){
            case "cylindrical":
                holeSize = this.neck.radius;
            break;
            case "rectangular":
                holeSize = this.neck.b;
            break;
        }

        switch(this.cavity.type){
            case "cylindrical":
                cavitySize = this.cavity.radius;
            break;
            case "rectangular":
                cavitySize = this.cavity.height/2;
            break;
        }
  
        //// draw cavity
        // strokeWeight(scale*this.neck.thickness);
        strokeWeight(2);
        stroke(45)
        noFill();
        rect(position.x,position.y-scale*cavitySize,
            scale*this.cavity.depth,scale*cavitySize*2)
        
        //// draw neck
        noStroke();
        fill(255);
        rect(position.x-10,position.y-(scale*holeSize),
        20,scale*holeSize*2);    

        //// draw absorption layer
        // let alphaLevel = this.absorber.resistivity*255/5000;
        let alphaLevel = 180;
        fill(color(255,30,140,alphaLevel));
        rect(position.x,position.y-scale*cavitySize,
            scale*this.cavity.depth*this.absorber.thickness,scale*cavitySize*2)
        
        // //// highlight selected the resonator
        if(this.index == selectedIndex){
            
            stroke(color(0,255,0,60));
            strokeWeight(8);
            noFill();
            rect(position.x,position.y-scale*cavitySize,scale*this.cavity.depth,scale*cavitySize*2);
            //// display resonator name
            strokeWeight(4);
            fill(0);
            // textSize(0.25*cavitySize*scale);
            text(this.name,position.x + 0.25*scale*this.cavity.depth,position.y + (scale*cavitySize*1.4)); 
        }
    }

    clicked(px,py){
        let center = {
                    x: this.GUIElementPosition.x + (this.cavity.depth*0.5*this.GUIscale),
                    y: this.GUIElementPosition.y + (this.cavityDimension*0.25*this.GUIscale)
                };
        // let center = {
        //     x: this.GUIElementPosition.x + (this.cavity.depth*0.5*this.GUIscale),
        //     y: this.GUIElementPosition.y
        // };
        let d = dist(px,py,center.x,center.y);
        if (d < (this.cavity.depth*0.5*this.GUIscale)){
            selectedIndex = this.index;
            this.isSelected = true;
            console.log(selectedIndex);
            // hideInputElements();
            updateGUIElements();
        }

    }

    
    // computeBessel(order,x) {
    //     let factorial = [0, 1, 2, 6, 24, 120, 720, 5040, 
    //         40320, 362880, 3628800, 39916800, 
    //         479001600, 6227020800, 87178291200];
    //     let sum = 0;
    //     let M = 5;
    //     if(order > (factorial.length - 2 - M))
    //         order = (factorial.length - 2) - M;
        
    //     for(let m = 0; m < M; m++){
    //         idx = m + order + 1;
    //         sum += ( ( (-1)**m )/ (factorial[m]*factorial[idx - 1]) ) * ( (x / 2)**(2*m + order) );
    //     }
    //     return 
    // }

    // computeEndCorrection(){
    //     let delta = 0.48*Math.sqrt(this.neckArea);
    //     let A0 = this.neckArea;
        
    //     if(this.neck.type == "cylindrical" && this.cavity.type == "cylindrical") {
    //         let factor = Math.sqrt(A0)*4/(Math.sqrt(Math.PI)*eps);
    //         let a = this.neck.cavityCenterDistance;
    //         let m = 10;
    //         let n = 10;
            
    //         // let sum = 
            

    //     } else if (this.neck.type == "cylindrical" && this.cavity.type == "rectangular") {

    //     } else if (this.neck.type == "rectangular" && this.cavity.type == "rectangular") {

    //     } else {
    //         console.error("unknown end correction combination: "  + this.neck.type + "+" + this.cavity.type);
    //     }
    //     return delta;
    // }

}