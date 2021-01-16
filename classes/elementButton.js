class ElementButton {
    constructor(type,position,scale) {
            this.type = type;
            this.position = position;
            this.scale = scale;
            this.ratio = 0.2;
            this.fillColor = 230;
            this.center = {x: 0, y: 0};
            this.drawButton();         
    }

    drawButton(){
        stroke(20);
        strokeWeight(2);
        fill(this.fillColor);
        switch(this.type){
            case "cylindrical-rectangular":
                rect(this.position.x,this.position.y,this.scale); 
                this.center.x = this.position.x + this.scale/2;
                this.center.y = this.position.y + this.scale/2;
                ellipse(this.center.x,this.center.y,this.scale*this.ratio);
            break;
            case "rectangular-cylindrical":
                ellipse(this.position.x,this.position.y,this.scale);
                this.center.x = this.position.x - this.scale*this.ratio/2;
                this.center.y = this.position.y - this.scale*this.ratio/2;
                rect(this.center.x,this.center.y,this.scale*this.ratio);
            break;
            case "cylindrical-cylindrical":
                ellipse(this.position.x,this.position.y,this.scale);
                this.center.x = this.position.x;
                this.center.y = this.position.y;
                ellipse(this.position.x,this.position.y,this.scale*this.ratio);
            break;
            case "rectangular-rectangular":
                rect(this.position.x,this.position.y,this.scale);
                this.center.x = this.position.x + this.scale*(0.5 - this.ratio/2);
                this.center.y = this.position.y + this.scale*(0.5 - this.ratio/2);
                rect(this.center.x,this.center.y,this.scale*this.ratio);
            break;
        }
    
    }

    highlightButton(px,py){
        let d = dist(px,py,this.center.x,this.center.y);
        if (d < this.scale/2){
            this.fillColor = color(20,160,240);
            this.drawButton();
        } else {
            this.fillColor = 230;
            this.drawButton();
        }
    }

    clicked(px,py){
        let d = dist(px,py,this.center.x,this.center.y);
        if (d < this.scale/2){
            if(!activeResonators.length) {
                drawPlaneWave();
                activeResonators.push(this.createResonator("1",0));
                // activeResonators[0].isSelected = true;
                selectedIndex = 0;
                activeResonators[0].addGUIElement({x: topWindow.position.x + topWindow.width*0.2,
                    y: topWindow.position.y + topWindow.height*0.5},zoomScale);
                console.log("Parent resonator created!");
                createPropertyBar(activeResonators[0]);
                activeResonators[0].computeResonance();
                updateGUIElements();
                drawInfoText('coupled');
                runComputation();
                
            } else if (activeResonators.length < 3) {
                
                // let drawPosition = {
                //     x: activeResonators[selectedIndex].GUIElementPosition.x + 
                //         activeResonators[selectedIndex].cavity.depth*zoomScale,
                //     y: activeResonators[selectedIndex].GUIElementPosition.y,
                // };
                // activeResonators.push(this.createResonator("E"+(activeResonators.length).toString(),activeResonators.length));
                // activeResonators[selectedIndex].addChildResonator(this.createResonator((activeResonators.length+1).toString(),activeResonators.length));
                // activeResonators[selectedIndex].isSelected = false;
                // let childrenLength = activeResonators[selectedIndex].children.length;
                // activeResonators.push(activeResonators[selectedIndex].children[childrenLength-1]);
                // activeResonators[selectedIndex].isSelected = true;
                // selectedIndex += 1;
                // activeResonators[selectedIndex].addGUIElement({x:drawPosition.x,y: drawPosition.y},zoomScale);
                // activeResonators[selectedIndex].computeResonance();
                // createPropertyBar(activeResonators[selectedIndex]);
                
                let drawPosition = {
                    x: activeResonators[activeResonators.length - 1].GUIElementPosition.x + 
                        activeResonators[activeResonators.length - 1].cavity.depth*zoomScale,
                    y: activeResonators[activeResonators.length - 1].GUIElementPosition.y,
                };
                
                activeResonators[activeResonators.length - 1].addChildResonator(
                    this.createResonator((activeResonators.length+1).toString(),
                    activeResonators.length)
                    );
                // activeResonators[selectedIndex].isSelected = false;
                let childrenLength = activeResonators[activeResonators.length - 1].children.length;
                activeResonators.push(activeResonators[activeResonators.length - 1].children[childrenLength-1]);
                activeResonators[activeResonators.length - 1].isSelected = true;
                // selectedIndex += 1;
                selectedIndex = activeResonators.length - 1;
                activeResonators[activeResonators.length - 1].addGUIElement({
                    x: drawPosition.x,
                    y: drawPosition.y
                },zoomScale);
                activeResonators[activeResonators.length - 1].computeResonance();
                createPropertyBar(activeResonators[activeResonators.length - 1]);
                
                updateGUIElements();
                // hideInputElements();
                runComputation();
            }
        } 
    }

    createResonator(name,index){
        let resonator;
        let database = {
            neck: {
                cylindrical: {
                    type: "cylindrical",
                    thickness: 0.001,
                    radius: 0.0025
                },
                rectangular: {
                    type: "rectangular",
                    thickness: 0.001,
                    a: 0.0025,
                    b: 0.0025
                }
            },
            cavity: {
                cylindrical: {
                    type: "cylindrical",
                    depth: 0.025,
                    radius: 0.05
                },
                rectangular: {
                    type: "rectangular",
                    depth: 0.025,
                    width: 0.1,
                    height: 0.1
                }
            },
            absorber: {
                glasswool: {
                    resistivity: 5000,
                    thickness: 0.15
                }
                
            }
        };
        switch(this.type){
            case "cylindrical-rectangular":
                resonator = new Resonator(
                    database.neck.cylindrical,
                    database.cavity.rectangular,
                    database.absorber.glasswool,
                    name,index);
            break;
            case "rectangular-cylindrical":
                resonator = new Resonator(
                    database.neck.rectangular,
                    database.cavity.cylindrical,
                    database.absorber.glasswool,
                    name,index);
            break;
            case "cylindrical-cylindrical":
                resonator = new Resonator(
                    database.neck.cylindrical,
                    database.cavity.cylindrical,
                    database.absorber.glasswool,
                    name,index);
            break;
            case "rectangular-rectangular":
                resonator = new Resonator(
                    database.neck.rectangular,
                    database.cavity.rectangular,
                    database.absorber.glasswool,
                    name,index);
            break;
        }
        return resonator
    }

}

