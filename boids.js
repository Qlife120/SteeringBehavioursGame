class Boids{


    constructor(){
        
        this.pos = createVector(random(width), random(height));
        this.vel = p5.Vector.random2D();
        this.vel.setMag(random(2,4));
        this.acc = createVector();
        this.maxSpeed = 5;
        this.maxForce = 0.2;

    }
    
    // fonction edges: quand les vehicules sortent du canvas
    edges(){
        if(this.pos.x < 0){
            this.pos.x = width;
        }else if(this.pos.x > width){
            this.pos.x = 0;
        }
        if(this.pos.y < 0){
            this.pos.y = height;
        }else if(this.pos.y > height){
            this.pos.y = 0;
        }
    }

    align(boids){
        // On definit un rayon de perception
        let perceptionRadius = 25;
        let steering = createVector();
        let total = 0;
        for(let other of boids){
            let d = dist(this.pos.x,this.pos.y,other.pos.x,other.pos.y);
            if (other != this && d < perceptionRadius){
                steering.add(other.vel);
                total++;
            }
        }

        if(total > 0){
            // On divise par la total pour avoir la moyenne
            steering.div(total);
            steering.setMag(this.maxSpeed);
            steering.sub(this.vel);
            // On limite la force
            steering.limit(this.maxForce);
            
        }

        return steering;
            
    }

    separation(boids) {
        let perceptionRadius = 24;
    
        let steering = createVector();
        let total = 0;
        
        for (let other of boids) {
          let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
          if (other != this && d < perceptionRadius) {
            let diff = p5.Vector.sub(this.pos, other.pos);
            diff.div(d * d);
            steering.add(diff);
            total++;
          }
        }
        if (total > 0) {
          steering.div(total);
          steering.setMag(this.maxSpeed);
          steering.sub(this.velocity);
          steering.limit(this.maxForce);
        }
        return steering;
      }
    

    cohesion (boids){
        // On definit un rayon de perception
        let perceptionRadius = 25;
        let steering = createVector();
        let total = 0;
        for(let other of boids){
            let d = dist(this.pos.x,this.pos.y,other.pos.x,other.pos.y);
            if (other != this && d < perceptionRadius){
                steering.add(other.pos);
                total++;
            }
        }

        if(total > 0){
            // On divise par la total pour avoir la moyenne
            steering.div(total);
            steering.sub(this.pos);
            steering.setMag(this.maxSpeed);
            steering.sub(this.vel);
            // On limite la force
            steering.limit(this.maxForce);
            
        }

        return steering;
}

    flock(boids){   
        let alignment = this.align(boids);
        let cohesion = this.cohesion(boids);
        let separation = this.separation(boids);

        alignment.mult(alignSlider.value());
        cohesion.mult(cohesionSlider.value());
        separation.mult(separationSlider.value());

        this.acc.add(alignment);
        this.acc.add(cohesion);
        this.acc.add(separation);
}

    update(){
        // On ajoute l'acceleration au vitesse
        this.vel.add(this.acc);
        // On limite la vitesse
        this.vel.limit(this.maxSpeed);
        // On met a jour la position, en ajoutant la vitesse
        this.pos.add(this.vel);
        // remetrre l'acceleration a zero  
        this.acc.set(0,0);
    }

    show(){
        stroke(255);
        strokeWeight(6);
        point(this.pos.x, this.pos.y);
    }

}