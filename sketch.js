let pursuer1, pursuer2;
let target;
let obstacles = [];
let vehicules = [];
let bounds;
const flock = [];
let alignSlider, cohesionSlider, separationSlider;
let difficultySelect;
// distance de collision (beginner par defaut)
let collisionThreshold = 50;

let mode = "normal";

function createDifficultSelector(){

    // Create a select dropdown for difficulty
    difficultySelect = createSelect();
    difficultySelect.position(windowWidth - 100, 30);
    difficultySelect.option('Beginner');
    difficultySelect.option('Intermediate'); 
    difficultySelect.option('Hard'); 
    difficultySelect.changed(updateDifficulty);
    // diffculty =  'Beginner' par default
    difficultySelect.value('Beginner');
    // On met a jour la difficulte
    updateDifficulty(); 

    

}

// fonction pour mettre a jour la difficulté et donc la distance de collision
function updateDifficulty() {
  const selectedDifficulty = difficultySelect.value();

  // Set the collision threshold based on the selected difficulty
  if (selectedDifficulty === 'Beginner') {
    collisionThreshold = 20; // Easier, large distance
  } else if (selectedDifficulty === 'Intermediate') {
    collisionThreshold = 10; // Medium difficulty
  } else if (selectedDifficulty === 'Hard') {
    collisionThreshold = 5; // Harder, small distance
  }
}


// La difficulté est mise a jour au changement de la valeur du select
// la difficulté est base sur la distance entre le boid et la vehicule
// fonction pour detecter les collisions entre vehicules et boids 
function checkCollision(vehicle, boid) {
  // On calcule la distance entre  vehicule et boid
  let distance = dist(vehicle.pos.x, vehicle.pos.y, boid.pos.x, boid.pos.y);

  // Si la distance est inferieur a 50px

  // any boid close to one of the vehiclue is a collision.
  if (distance < collisionThreshold) {
    // On retourne true
    return true;
  }

}

// fonction pour creer les sliders comme ci-dessous
// sonction qui retourne le slider et le label
function createMySlider(labelText, x, y, min, max, initial, step, width) {
  // Create the slider
  let slider = createSlider(min, max, initial, step);
  slider.position(x, y);
  slider.style('width', `${width}px`);

  // Create the label
  let label = createP(labelText);
  label.style('color', 'white');
  label.style('margin', '0');
  label.position(x, y-20); // Position label above the slider

  return { slider, label };
}



function setup() {
  createDifficultSelector();

  const align = createMySlider("Alignment", 10, 50, 0, 1, 0, 0.01, width);
  const cohesion = createMySlider("Cohesion", 10, 90, 0, 1, 0, 0.01, width);
  const separation = createMySlider("Separation", 10, 140, 0, 1, 0, 0.01, width);
  
  // pour acceder a la valeur du slider
  alignSlider = align.slider;
  cohesionSlider = cohesion.slider;
  separationSlider = separation.slider;

  createCanvas(windowWidth, windowHeight);
  pursuer1 = new Vehicle(100, 100);
  pursuer2 = new Vehicle(random(width), random(height));

  vehicules.push(pursuer1);

  // add boids to the screen
  for (let i = 0; i < 200; i++) {
    let b = new Boids();
    flock.push(b);
  }

  //TODO:  this is dumb and should be changed 
  bounds = {
    left: 0,
    right: width,
    top: 0,
    bottom: height
}

  // On cree un obstace au milieu de l'écran
  // un cercle de rayon 100px
  // TODO
  //obstacles.push(new Obstacle(width / 2, height / 2, 100, "white"));
}

function draw() {
  // changer le dernier param (< 100) pour effets de trainée
  background(0, 0, 0, 100);

  target = createVector(mouseX, mouseY);

  fill(255); // Ensure text color is set to white
  textSize(14); // Adjust the text size
  text(`Alignment: ${alignSlider.value()}`, 10, height - 65);
  text(`Cohesion: ${cohesionSlider.value()}`, 10, height - 45);
  text(`Separation: ${separationSlider.value()}`, 10, height - 25);


  // Dessin de la cible qui suit la souris
  // Dessine un cercle de rayon 32px à la position de la souris
  fill(255, 0, 0);
  noStroke();
  circle(target.x, target.y, 32);

  // Check collisions and update boids
  for (let i = flock.length - 1; i >= 0; i--) {
    let boid = flock[i];
    boid.edges();
    boid.flock(flock);
    boid.update();
    boid.show();

    // Check collision with vehicles
    for (let vehicle of vehicules) {
      // we delete the boid if it collides with a vehicle
      if (checkCollision(vehicle, boid)) {
        flock.splice(i, 1); // Remove the boid from the array
        break; // No need to check other vehicles for this boid
      }
    }
  }



  // dessin des obstacles
  obstacles.forEach(o => {
    o.update(bounds);
    o.show();
  });

  if( mode=="snake"){

    vehicules.forEach((v, index, vehicles) => {

      if(index === 0) {
        // on a le premier véhicule
        // il suite la cible controlée par la souris
        steeringForce = v.arrive(target,0);
      } else {
        // Le vehicule d'index "index" suit le véhicule précédent
        let vehiculePrecedent = vehicles[index - 1];
        steeringForce = v.arrive(vehiculePrecedent.pos,10);

        // Je relie les véhicules entre eux avec une ligne
        //stroke(255);
        //strokeWeight(vehicle.r*2);
        //line(vehiculePrecedent.pos.x, vehiculePrecedent.pos.y, vehicle.pos.x, vehicle.pos.y);
      }

      v.applyForce(steeringForce);
      v.update();
      v.show();
      
    })



  }else if(mode="normal "){
  vehicules.forEach(v => {
    
    // pursuer = le véhicule poursuiveur, il vise un point devant la cible
    v.applyBehaviors(target, obstacles, vehicules);

    // déplacement et dessin du véhicule et de la target
    v.update();
    v.show();
  });
}
  fill(255); 
  textSize(16); 
  // le nombre de boids restant
  text(`Boids left: ${flock.length}`, windowWidth - 150, height - 20); // bottom left of the canvas
  text(
    `Controls: s (Snake), d (Debug), n (Normal), f (Add 10 Vehicles)`,
    windowWidth - 650,
    height - 20
  );
    
}


// en cliquant sur la souris, on ajoute un obstacle de rayon et couleur aléatoire a la position de la souris
function mousePressed() {
  // TODO : ajouter un obstacle de taille aléatoire à la position de la souris
  obstacles.push(new Obstacle(mouseX, mouseY, random(10, 100), color(random(255), random(255), random(255)), random(1, 3), random(1, 3)));

}

function keyPressed() {

  if (key == "s") {
    mode = "snake";
  }
  else if (key == "n") {
    mode = "normal ";
  }
  if (key == "v") {
    vehicules.push(new Vehicle(random(width), random(height)));
  }
  if (key == "d") {
    Vehicle.debug = !Vehicle.debug;
  } else if (key == "f") {
    // on crée 10 véhicules à des position random espacées de 50px
    // en x = 20, y = hauteur du  canvas sur deux
    for (let i = 0; i < 10; i++) {
      let v = new Vehicle(20, 300 )
      // vitesse aléatoire
      v.vel = new p5.Vector(random(1, 5), random(1, 5));
      vehicules.push(v);
    }
  }
}