class Vehicle{

    static debug = false;
    constructor(x,y){
        this.pos = createVector(x,y);
        this.vel = createVector(0,0);
        this.acc = createVector(0,0);
        // vitesse max du vehicule
        this.maxSpeed = 10;
        // force max applique au vehicule 
        this.maxForce = 0.6;
        this.color = "white";
        this.rayonZoneDeFreinage = 100;
        this.r_dessin = 20;

        this.r = this.r_dessin*3;
        // zone Evitement d'obstacle
        this.ZoneEvitement = this.r/2;

        // trainee du vehicule
        this .path = [];
        // le taille max de la trainee

        this .pathMaximumLength = 40;

    }

    applyBehaviors(target,obstacles){

        let seekForce = this.seek(target,true);
        //let arriveForce = this.arrive(target);
        let avoidForce = this.avoid(obstacles);
        let separateForce = this.separate(vehicules);
        let boundariesForce = this.boundaries();
        

        seekForce.mult(0.2);
        //arriveForce.mult(18 );
        avoidForce.mult(3);
        separateForce.mult(0.2);
        boundariesForce.mult(3);

        //this.applyForce(arriveForce);
        this.applyForce(seekForce);
        this.applyForce(avoidForce);
        this.applyForce(separateForce);
        this.applyForce(boundariesForce);
        
    }

    avoid(obstacles){
        // vecteur devant la vehicule 
        let ahead = this.vel.copy();
        // anticiper la position du vehicule 50 frame avant
        ahead.mult(50); 
        // vecteur devant la vehicule au milieu du ahead
        // on multiplie ahead par 0.5
        let aheadMiddle = ahead.copy().mult(0.5); 
        
        // TODO : Why draw it here 
        if(Vehicle.debug){
            this.drawVector(this.pos,ahead,"red");
            this.drawVector(this.pos,aheadMiddle,"green");
        }
        // calcul de des position des deux points au bout de ahead1 et ahead2
        let aheadPosition = this.pos.copy().add(ahead);
        let aheadMiddlePosition = this.pos.copy().add(aheadMiddle);

        // calcul de l'obstacle le plus proche
        let closestObstacle = this.getClosestObstacle(obstacles);

        if(closestObstacle == undefined){
            return createVector(0,0);
        }

        
        // On calcule la distance entre l'obstacle le plus proche et ahead 
        let distanceAheadPoint = aheadPosition.dist(closestObstacle.pos);
        let distanceAheadMiddlePoint = aheadMiddlePosition.dist(closestObstacle.pos);
        let distance = min(distanceAheadPoint,distanceAheadMiddlePoint);

        // si la distance est plus petite que la zone Evitement plus le rayon d'obstacle le plus proche 
        // la collision est possible
        if (distance < this.ZoneEvitement + closestObstacle.r) {
            

            // On calcule la force de d'evitement
            // la force est un vecteur qui va du centre de l'obstacle vers le bout du vecteur ahead1
            let force;
            if(distanceAheadPoint < distanceAheadMiddlePoint){
                force= p5.Vector.sub(aheadPosition,closestObstacle.pos);
            }
            else{
                force= p5.Vector.sub(aheadMiddlePosition,closestObstacle.pos);
            }

            // ON dessine la force en Jaune.
            this.drawVector(closestObstacle,force,"yellow");
            
            // On limite la force a maxSpeed
            // force est la vitesse desiree
            force.setMag(this.maxSpeed);
            force.sub(this.vel);
            // On limite la force maxForce  
            force.limit(this.maxForce);
            return force;    

        }
        else{
            return createVector(0,0);
        }

    }

    // fonction qui retourne la vehicule le plus proche 
    getClosestVehicle(vehicles) {
        // Initialiser la distance au max et l'obstacle le plus proche
        let closestDistance = 100000000;
        let closestVehicle = undefined;

        vehicles.forEach((vehicle) => { 
            // calcul de la distance entre la vehicule et l'obstacle
            let distance = this.pos.dist(vehicle.pos);
            // si la distance est plus petite que la distance actuelle
            if (distance < closestDistance) {
                // la distance la plus proche devient la distance actuelle et l'obstacle le plus proche 
                // devient l'obstacle actuelle 
                closestDistance = distance;
                closestVehicle = vehicle;
            }

        });

        return closestVehicle;

    }

    arrive(target, d=0){
        // true pour activer l'arrivee
        return this.seek(target,true,d);
    }

    seek(target, arrival, d = 0) {
        let desiredSpeed = p5.Vector.sub(target, this.pos);
        let desiredSpeedMagnitude = this.maxSpeed;
    
        if (arrival) {
          // on dessine un cercle de rayon 100 
          // centré sur le point d'arrivée
    
          if (Vehicle.debug) {
            noFill();
            stroke("white")
            circle(target.x, target.y, this.rayonZoneDeFreinage)
          }
          
          // on calcule la distance du véhicule
          // par rapport au centre du cercle
          const dist = p5.Vector.dist(this.pos, target);
    
          if (dist < this.rayonZoneDeFreinage) {
            // on va diminuer de manière proportionnelle à
            // la distance, la vitesse
            // on va utiliser la fonction map(...) de P5
            // qui permet de modifier une valeur dans un 
            // intervalle initial, vers la même valeur dans un
            // autre intervalle
            // newVal = map(value, start1, stop1, start2, stop2, [withinBounds])
            desiredSpeedMagnitude = map(dist, d, this.rayonZoneDeFreinage, 0, this.maxSpeed)
          }
        }
           // equation force = vitesseDesiree - vitesseActuelle
    desiredSpeed.setMag(desiredSpeedMagnitude);
    let force = p5.Vector.sub(desiredSpeed, this.vel);
    // et on limite la force
    force.limit(this.maxForce);
    return force;
    }
    // TODO : it's never called 

    flee(target){
        
        return this.seek(target).mult(-1);
    }

    // TODO: it's never called

    pursue(vehicle){
        let target = vehicle.pos.copy();
        let prediction = vehicle.pos.copy();
        // on multiple la vitesse de prediction par 10
        prediction.mult(10);
        target.add(prediction);
        fill(0,255,0);
        circle(target.x,target.y,16);
        return this.seek(target);  
    }

    



    // fonction qui retourne l'obstacle le plus proche 

    getClosestObstacle(obstacles) {
        // Initialiser la distance au max et l'obstacle le plus proche
        let closestDistance = 100000000;
        let closestObstacle = undefined;

        obstacles.forEach((obstacle) => {
            // calcul de la distance entre la vehicule et l'obstacle
            let distance = this.pos.dist(obstacle.pos);
            // si la distance est plus petite que la distance actuelle
            if (distance < closestDistance) {
                // la distance la plus proche devient la distance actuelle et l'obstacle le plus proche 
                // devient l'obstacle actuelle 
                closestDistance = distance;
                closestObstacle = obstacle;
            }

        });

        // On retourne le dernier obstacle le plus proche.
        return closestObstacle;
    }

    // methode qui permet  d'appliquer une force au vehicule  
    applyForce(force) {
        this.acc.add(force);
    }

    update(){
        // On ajoute l'acceleration au vitesse
        this.vel.add(this.acc);
        // On limite la vitesse
        this.vel.limit(this.maxSpeed);
        // On met a jour la position, en ajoutant la vitesse
        this.pos.add(this.vel);
        // remetrre l'acceleration a zero  
        this.acc.set(0);
        // mise a jour du path 
        this.addPosToPath();
        
    }

    // Ajour de la position actuelle du vehicule 
    addPosToPath() {
        // add the current position to the path
        this.path.push(this.pos.copy());

        // if the path is too big, remove the first element
        if (this.path.length > this.pathMaximumLength) {
            this.path.shift();
        }

    }  
    
    separate(boids){

        let desiredSeparation = this.r;
        let steer = createVector(0,0,0);
        let count = 0;
        
        boids.forEach((boid) => {
            // distance entre la vehicule et le vehicule actuelle 
            let d = p5.Vector.dist(this.pos,boid.pos);

            if (d > 0 && d < desiredSeparation) {
                let diff = p5.Vector.sub(this.pos,boid.pos);
                diff.normalize()
                diff.div(d * d);
                steer.add(diff);
                count++;
            }
        });

        // moyenne en fonction des voisins 
        if (count > 0) {        
            steer.div(count);
       }
       
       // si la force est plus grande que 0
       if(steer.mag() > 0){
        steer.normalize();
        steer.mult(this.maxSpeed);
        steer.sub(this.vel);
        steer.limit(this.maxForce);
        
       }

       return steer;
}


    // renvoyer vers le centre de canvas si le vehicule se rapproche d'une distance de 25 les bords du canvas
    boundaries(){
       const d = 25;
       let desired = null;

       // trop a gauche ou trop a drote
       if(this.pos.x < d){
           desired = createVector(this.maxSpeed,this.vel.y);
       }else if(this.pos.x > width - d){
           desired = createVector(-this.maxSpeed,this.vel.y);
       }

       if(this.pos.y < d){
        desired = createVector(this.vel.x,this.maxSpeed);  
    }else if(this.pos.y>height-d){
        desired = createVector(this.vel.x,-this.maxSpeed);

    }

    if (desired!==null){
        desired.normalize();
            desired.mult(this.maxSpeed);
            const steer = p5.Vector.sub(desired,this.vel);
            // On limite la force a la force max
            steer.limit(this.maxForce);
            return steer;  
    
    
    }
    // Sinon on retourn un vecteur nul
    return createVector(0,0);
}

drawVehicle() {
    // formes fil de fer en blanc
    stroke(255);
    // épaisseur du trait = 2
    strokeWeight(2);
  
    // formes pleines
    fill(this.color);
  
    // sauvegarde du contexte graphique (couleur pleine, fil de fer, épaisseur du trait, 
    // position et rotation du repère de référence)
    push();
    // on déplace le repère de référence.
    translate(this.pos.x, this.pos.y);
    // et on le tourne. heading() renvoie l'angle du vecteur vitesse (c'est l'angle du véhicule)
    rotate(this.vel.heading());
  
    // Dessin d'un véhicule sous la forme d'un triangle. Comme s'il était droit, avec le 0, 0 en haut à gauche
    triangle(-this.r_pourDessin, -this.r_pourDessin / 2, -this.r_pourDessin, this.r_pourDessin / 2, this.r_pourDessin, 0);
    //this.edges();
  
    // cercle pour le debug
    if (Vehicle.debug) {
      stroke(255);
      noFill();
      circle(0, 0, this.r);
    }
  
    // draw velocity vector
    pop();
    this.drawVector(this.pos, this.vel, color(255, 0, 0));
  
    // Cercle pour évitement entre vehicules et obstacles
    if (Vehicle.debug) {
      stroke(255);
      noFill();
      circle(this.pos.x, this.pos.y, this.r);
    }
  }

drawPath() {
    push();
    stroke(255);
    noFill();
    strokeWeight(1);
  
    fill(this.color);
    // dessin du chemin
    this.path.forEach((p, index) => {
      if (!(index % 5)) {
  
        circle(p.x, p.y, 1);
      }
    });
    pop();
  }
show() {
    // dessin du chemin
    this.drawPath();
    // dessin du vehicule
    this.drawVehicle();
  }
    // fonction du dessin des vecteurs
    drawVector(position, v,color) {

        // Enreegistrer le style actuelle
        push();
        strokeWeight(3);
        stroke(color);
        line(position.x, position.y, position.x + v.x, position.y + v.y);
        // petite fleche au bout du vecteur vitesse
        let arrowSize = 5;
        translate(position.x + v.x, position.y + v.y);
        rotate(v.heading());
        translate(-arrowSize / 2, 0);
        triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
        pop();
    }
}