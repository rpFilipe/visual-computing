//////////////////////////////////////////////////////////////////////////////
//
//  WebGL_example_23.js 
//
//  Phong Illumination Model on the CPU
//
//  References: www.learningwebgl.com + E. Angel examples
//
//  J. Madeira - October 2015
//
//////////////////////////////////////////////////////////////////////////////


//----------------------------------------------------------------------------
//
// Global Variables
//

var gl = null; // WebGL context
var gl2 = null; // WebGL context

var shaderProgram = null;
var shaderProgram2 = null;

var VertexPositionBuffer = null;	
var VertexColorBuffer = null;


// The GLOBAL transformation parameters

var globalAngleYY = 0.0;

var globalTz = 0.0;

var velocity_norm = 0.01;
var velocity = vec3();
velocity[0] = Math.random();
velocity[1] = Math.random();
velocity[2] = 0.5;

// The local transformation parameters

// The translation vector

var tx1 = 0.0;
var ty1 = 0.0;
var tz1 = 0.0;

var tx2 = 0.0;
var ty2 = 0.0;
var tz2 = 0.0;

var txb = 0.0;
var tyb = 0.0;
var tzb = 2;

// The rotation angles in degrees

var angleXX = 0.0;
var angleYY = 0.0;
var angleZZ = 0.0;

// The scaling factors

var sx = 1;
var sy = 1;
var sz = 1;

// GLOBAL Animation controls

var globalRotationYY_ON = 1;

var globalRotationYY_DIR = 1;

var globalRotationYY_SPEED = 1;

// Local Animation controls

var rotationXX_ON = 1;

var rotationXX_DIR = 1;

var rotationXX_SPEED = 1;
 
var rotationYY_ON = 1;

var rotationYY_DIR = 1;

var rotationYY_SPEED = 1;
 
var rotationZZ_ON = 1;

var rotationZZ_DIR = 1;

var rotationZZ_SPEED = 1;
 
// To allow choosing the way of drawing the model triangles

var primitiveType = null;
 
// To allow choosing the projection type

var projectionType = 0;

// NEW --- Point Light Source Features

// Directional --- Homogeneous coordinate is ZERO

var pos_Light_Source = [ 0.0, 0.0, 1.0, 0.0 ];

// White light

var int_Light_Source = [ 1.0, 1.0, 1.0 ];

// Low ambient illumination

var ambient_Illumination = [ 0.2, 0.2, 0.2 ];

// NEW --- Model Material Features

// Ambient coef.

var kAmbi = [ 0.2, 0.2, 0.2 ];

// Difuse coef.

var kDiff = [ 0.0, 0.0, 0.6 ];

// Specular coef.

var kSpec = [ 0.7, 0.7, 0.7 ];

// Phong coef.

var nPhong = 100;



var normals = [

		// FRONTAL TRIANGLE
		 
		 0.0,  0.0,  1.0,
		 
		 0.0,  0.0,  1.0,
		 
		 0.0,  0.0,  1.0,
];

// Initial color values just for testing!!

// They are to be computed by the Phong Illumination Model


//----------------------------------------------------------------------------
//
// The WebGL code
//

//----------------------------------------------------------------------------
//
//  Rendering
//

// Handling the Vertex and the Color Buffers

function initBuffers(gl, coords, colors, shader) {	
	
	// Coordinates
		
	VertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, VertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coords), gl.STATIC_DRAW);
	VertexPositionBuffer.itemSize = 3;
	VertexPositionBuffer.numItems = coords.length / 3;			

	// Associating to the vertex shader
	
	gl.vertexAttribPointer(shader.vertexPositionAttribute, 
			VertexPositionBuffer.itemSize, 
			gl.FLOAT, false, 0, 0);
		
	VertexColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, VertexColorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
	VertexColorBuffer.itemSize = 3;
	VertexColorBuffer.numItems = colors.length / 3;			

	// Associating to the vertex shader
	
	gl.vertexAttribPointer(shader.vertexColorAttribute, 
			VertexColorBuffer.itemSize, 
			gl.FLOAT, false, 0, 0);
}

//----------------------------------------------------------------------------

//  Drawing the model

function drawGameArea(mvMatrix){

	var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	
	gl.uniformMatrix4fv(mvUniform, false, new Float32Array(flatten(mvMatrix)));

	initBuffers(gl, gameArea, gameAreaColors, shaderProgram);
	gl.cullFace( gl.FRONT );
	gl.disable(gl.BLEND);
	gl.drawArrays(primitiveType, 0, VertexPositionBuffer.numItems); 

	// canvas2
	var mvUniform = gl2.getUniformLocation(shaderProgram2, "uMVMatrix");
	
	gl2.uniformMatrix4fv(mvUniform, false, new Float32Array(flatten(mvMatrix)));

	initBuffers(gl2, gameArea, gameAreaColors, shaderProgram2);
	gl2.cullFace( gl2.FRONT );
	gl2.disable(gl2.BLEND);
	gl2.drawArrays(primitiveType, 0, VertexPositionBuffer.numItems);
}


function drawPlayer1(angleXX, angleYY, angleZZ, 
	sx, sy, sz,
	tx, ty, tz,
	mvMatrix,
	primitiveType){

		
	mvMatrix = mult( mvMatrix, translationMatrix( tx, ty, tz ) );
	mvMatrix = mult( mvMatrix, scalingMatrix( sx, sy, sz ) );


	var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	gl.uniformMatrix4fv(mvUniform, false, new Float32Array(flatten(mvMatrix)));

	initBuffers(gl, player1, player1Colors, shaderProgram);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
	gl.cullFace( gl.BACK);
	gl.drawArrays(primitiveType, 0, VertexPositionBuffer.numItems);

	//canvas2

	var mvUniform = gl2.getUniformLocation(shaderProgram2, "uMVMatrix");
	gl2.uniformMatrix4fv(mvUniform, false, new Float32Array(flatten(mvMatrix)));

	initBuffers(gl2, player1, player1Colors, shaderProgram2);
	gl2.enable(gl2.BLEND);
	gl2.blendFunc(gl2.SRC_ALPHA, gl2.ONE);
	gl2.cullFace( gl2.BACK);
	gl2.drawArrays(primitiveType, 0, VertexPositionBuffer.numItems);

}

function drawShadow(angleXX, angleYY, angleZZ, 
	sx, sy, sz,
	tx, ty, tz,
	mvMatrix,
	primitiveType){

	// mvmatrix2 é para o canvas2
	var mvMatrix2 = mult( mvMatrix, rotationYYMatrix(180));
	mvMatrix2 = mult( mvMatrix2, translationMatrix( tx, ty, tz ) );
	mvMatrix2 = mult( mvMatrix2, scalingMatrix( sx, sy, sz ) );
	mvMatrix2 = mult( mvMatrix2, translationMatrix( 0, 0, 17 ) );
	mvMatrix = mult( mvMatrix, translationMatrix( tx, ty, tz ) );
	mvMatrix = mult( mvMatrix, scalingMatrix( sx, sy, sz ) );


	var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	gl.uniformMatrix4fv(mvUniform, false, new Float32Array(flatten(mvMatrix)));
	gl.disable(gl.BLEND);
	initBuffers(gl, shadow, shadowColors, shaderProgram);
	gl.cullFace( gl.FRONT);
	gl.drawArrays(primitiveType, 0, VertexPositionBuffer.numItems);

	//canvas2

	var mvUniform = gl2.getUniformLocation(shaderProgram2, "uMVMatrix");
	gl2.uniformMatrix4fv(mvUniform, false, new Float32Array(flatten(mvMatrix2)));
	gl2.disable(gl2.BLEND);
	initBuffers(gl2, shadow, shadowColors, shaderProgram2);
	gl2.cullFace( gl2.FRONT);
	gl2.drawArrays(primitiveType, 0, VertexPositionBuffer.numItems);
}

function drawPlayer2(angleXX, angleYY, angleZZ, 
	sx, sy, sz,
	tx, ty, tz,
	mvMatrix,
	primitiveType){

	mvMatrix = mult( mvMatrix, translationMatrix( tx, ty, tz ) );
	mvMatrix = mult( mvMatrix, scalingMatrix( sx, sy, sz ) );


	var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	gl.uniformMatrix4fv(mvUniform, false, new Float32Array(flatten(mvMatrix)));
	gl.disable(gl.BLEND);
	initBuffers(gl, player2, player2Colors, shaderProgram);
	gl.cullFace( gl.BACK);
	gl.drawArrays(primitiveType, 0, VertexPositionBuffer.numItems);

	//canvas2

	var mvUniform = gl2.getUniformLocation(shaderProgram2, "uMVMatrix");
	gl2.uniformMatrix4fv(mvUniform, false, new Float32Array(flatten(mvMatrix)));
	gl2.disable(gl2.BLEND);
	initBuffers(gl2, player2, player2Colors, shaderProgram2);
	gl2.cullFace( gl2.BACK);
	gl2.drawArrays(primitiveType, 0, VertexPositionBuffer.numItems);

}

function drawBall(angleXX, angleYY, angleZZ, 
	sx, sy, sz,
	tx, ty, tz,
	mvMatrix,
	primitiveType){

	mvMatrix = mult( mvMatrix, translationMatrix( tx, ty, tz ) );
	mvMatrix = mult( mvMatrix, scalingMatrix( sx, sy, sz ) );


	var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	gl.uniformMatrix4fv(mvUniform, false, new Float32Array(flatten(mvMatrix)));
	gl.disable(gl.BLEND);
	initBuffers(gl, ball, ballColors, shaderProgram);
	gl.cullFace( gl.FRONT);
	gl.drawArrays(primitiveType, 0, VertexPositionBuffer.numItems);

	//canvas2
	var mvUniform = gl2.getUniformLocation(shaderProgram2, "uMVMatrix");
	gl2.uniformMatrix4fv(mvUniform, false, new Float32Array(flatten(mvMatrix)));
	gl2.disable(gl2.BLEND);
	initBuffers(gl2, ball, ballColors, shaderProgram2);
	gl2.cullFace( gl2.FRONT);
	gl2.drawArrays(primitiveType, 0, VertexPositionBuffer.numItems);

}

function drawModel( angleXX, angleYY, angleZZ, 
					sx, sy, sz,
					tx, ty, tz,
					mvMatrix,
					primitiveType ) {

	// The global model transformation is an input
	
	// Concatenate with the particular model transformations
	
    // Pay attention to transformation order !!
    
	mvMatrix = mult( mvMatrix, translationMatrix( tx, ty, tz ) );
						 
	mvMatrix = mult( mvMatrix, rotationZZMatrix( angleZZ ) );
	
	mvMatrix = mult( mvMatrix, rotationYYMatrix( angleYY ) );
	
	mvMatrix = mult( mvMatrix, rotationXXMatrix( angleXX ) );
	
	mvMatrix = mult( mvMatrix, scalingMatrix( sx, sy, sz ) );
						 
	// Passing the Model View Matrix to apply the current transformation
	
	var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	
	gl.uniformMatrix4fv(mvUniform, false, new Float32Array(flatten(mvMatrix)));
	
	// NEW --- Phong Illumination Model
	
	// TO BE COMPLETED STEP BY STEP !!
	
	// TEST THE AMBIENT ILLUMINATION FIRST !!
	
	// Clearing the gameAreaColors array

	//@colors
	//gameAreaColors.splice(0, gameAreaColors.length);
	
	 	
	// Compute the 3 components: AMBIENT, DIFFUSE and SPECULAR

    // INITIALIZE EACH COMPONENT, with the constant terms

	var ambientTerm = [ 0.0, 0.0, 0.0 ];
	
	var diffuseTerm = [ 0.0, 0.0, 0.0 ];
	
	var specularTerm = [ 0.0, 0.0, 0.0 ];
		
    for( var i = 0; i < 3; i++ )
    {
		// DO THE INITIALIZATION HERE !!
		ambientTerm[i] = kAmbi[i]*ambient_Illumination[i];
		diffuseTerm[i] = kDiff[i]*int_Light_Source[i];
		specularTerm[i] = kSpec[i]*pos_Light_Source[i];
    }
    
    // SMOOTH-SHADING 

    // Compute the illumination for every vertex

    // Iterate through the gameArea
    
    for( var vertIndex = 0; vertIndex < gameArea.length; vertIndex += 3 )
    {	
		// For every vertex
		
		// GET COORDINATES AND NORMAL VECTOR
		
		var auxP = gameArea.slice(vertIndex, vertIndex + 3);
		
		var auxN = normals.slice(vertIndex, vertIndex + 3);

        // CONVERT TO HOMOGENEOUS COORDINATES


		auxP.push(1.0);
		auxN.push(0.0);
		 
		
        // APPLY CURRENT TRANSFORMATION

        var pointP = multiplyPointByMatrix(mvMatrix, auxP);  

        var vectorN = multiplyVectorByMatrix(mvMatrix, auxN); 
        
        // NORMALIZE vectorN

		normalize(vectorN);
        
        // DIFFUSE ILLUMINATION
        
        // Check if light source is directional or not
        
		var vectorL = vec3();
		
		if(pos_Light_Source[3] == 0.0)
			vectorL = pos_Light_Source.slice(0,3);
		else
			for (var i = 0; i < array.length; i++)
				vectorL[i] =pos_Light_Source[i] - pointP[i] ;

		normalize(vectorL);
        // Compute the dot product

        var cosNL = dotProduct(vectorN, vectorL);
		if(cosNL < 0)
			cosNL = 0;

		//console.log("cosNL= " +  cosNL);
        // SEPCULAR ILLUMINATION 

		var vectorV = vec3();
		if(projectionType == 0)
			vectorV[2] = 1.0;
		else
			vectorV= symmetric(pointP);
		// Check the projection type
		
		 

        var vectorH = vec3();
        vectorH = add(vectorL, vectorV);
        normalize(vectorH);

        var cosNH;
		cosNH = dotProduct(vectorN, vectorH);

		// Compute the color values and store in the gameAreaColors array
		// Avoid exceeding 1.0		

		var lightRGB = vec3();
		for (var i = 0; i < 3 ; i++) {
			lightRGB[i] = ambientTerm[i] + diffuseTerm[i] * cosNL + specularTerm[i] * Math.pow(cosNH, nPhong);
			if( lightRGB[i] > 1)
				lightRGB[i] = 1;
		}

		//@colors
		//gameAreaColors.push(lightRGB[0], lightRGB[1], lightRGB[2]);
        
 
    }
	// Associating the data to the vertex shader
	
	// This can be done in a better way !!
	gl.disable(gl.BLEND);
	//initBuffers();
	
	// Drawing 
	
	// primitiveType allows drawing as filled triangles / wireframe / gameArea
	
	if( primitiveType == gl.LINE_LOOP ) {
		
		// To simulate wireframe drawing!
		
		// No faces are defined! There are no hidden lines!
		
		// Taking the gameArea 3 by 3 and drawing a LINE_LOOP
		
		var i;
		
		for( i = 0; i < VertexPositionBuffer.numItems / 3; i++ ) {
		
			gl.drawArrays( primitiveType, 3 * i, 3 ); 
		}
	}	
	else {
				
		gl.drawArrays(primitiveType, 0, VertexPositionBuffer.numItems); 
		
	}	
}


//----------------------------------------------------------------------------

//  Drawing the 3D scene

function drawScene() {
	
	var pMatrix;
	var pMatrix2;

	var mvMatrix = mat4();
	
	// Clearing the frame-buffer and the depth-buffer
	
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl2.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	// Computing the Projection Matrix

	pMatrix = perspective(90, 1, 1, 4.1);
	//pMatrix2 = perspective(90, 1, 5, 0);
	// Global transformation !!
	
	globalTz = -1;
	//globalTz = 0;

	
	// Passing the Projection Matrix to apply the current projection
	
	var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	var pUniform2 = gl2.getUniformLocation(shaderProgram2, "uPMatrix");
	
	gl.uniformMatrix4fv(pUniform, false, new Float32Array(flatten(pMatrix)));
	gl2.uniformMatrix4fv(pUniform2, false, new Float32Array(flatten(pMatrix)));
	
	// GLOBAL TRANSFORMATION FOR THE WHOLE SCENE
	
	mvMatrix = translationMatrix( 0, 0, globalTz );
	
	// Instantianting the current model

	drawGameArea(mvMatrix);

	drawPlayer2(angleXX, angleYY, angleZZ, 0.25, 0.25, sz, tx2, ty2, tz2, mvMatrix, primitiveType);

	drawShadow(angleXX, angleYY, angleZZ, 0.15, 0.15, 0.15, txb, -0.849 , tzb, mvMatrix, primitiveType);

	drawBall(angleXX, angleYY, angleZZ, 0.15, 0.15, 0.15, txb, tyb, tzb, mvMatrix, primitiveType);

	drawPlayer1(angleXX, angleYY, angleZZ, 0.25, 0.25, sz, tx1, ty1, tz1, mvMatrix, primitiveType);
		
	/*drawModel( angleXX, angleYY, angleZZ, 
	           sx, sy, sz,
	           tx, ty, tz,
	           mvMatrix,
	           primitiveType );*/
}

//----------------------------------------------------------------------------
//
//  NEW --- Animation
//

// Animation --- Updating transformation parameters

var lastTime = 0;

function animate() {

	
	var timeNow = new Date().getTime();

	/**
	 * define boundries here
	 * all the logic of ball bouncing
	 */
	
	if( lastTime != 0 ) {
		
		var elapsed = timeNow - lastTime;

		txb += velocity[0]*velocity_norm;
		tyb += velocity[1]*velocity_norm;
		tzb += velocity[2]*velocity_norm;
		
		//console.log(velocity);
		//console.log("x: " + txb);
		//console.log("y: " + tyb);
		//console.log("z: " + tzb);

		//console.log(velocity);
		// ball bouncing top/bottom
		if(tyb > 0.75)
		{
			tyb = 0.75;
			velocity = computeRefection(velocity, topNorm);
		}else if(tyb < -0.75)
		{
			tyb = -0.75;
			velocity = computeRefection(velocity, bottomNorm);
		}

		// ball bouncing left/right
		if(txb > 0.75)
		{
			txb = 0.75;
			velocity = computeRefection(velocity, rightNorm);

		}else if(txb < -0.75)
		{
			txb = -0.75;
			velocity = computeRefection(velocity, leftNorm);
		}

		/**
		 * ball councing front/back
		 * check if players catch the ball
		 */
		if(tzb > 0)
		{
			console.log("123");
			tzb = 0;
			velocity = computeRefection(velocity, frontNorm);
			velocity[0] = Math.random();
			velocity[1] = Math.random();
			console.log(velocity_norm);
			velocity_norm += 0.01;

		}else if(tzb < -2.75)
		{
			tzb = -2.75;
			velocity = computeRefection(velocity, backNorm);
			velocity[0] = Math.random();
			velocity[1] = Math.random();
			//velocity_norm++;
		}
		
	}
	
	lastTime = timeNow;
}


//----------------------------------------------------------------------------

// Timer

function tick() {
	
	requestAnimFrame(tick);
	
	animate();
	
	drawScene();
	
}




//----------------------------------------------------------------------------
//
//  User Interaction
//

function outputInfos(){
    
}

//----------------------------------------------------------------------------

function setEventListeners(){


	//player 1 controls
	// document.addEventListener('keypress', function(event){

	// 	var key = event.keyCode;

	// 	switch(key){
	// 		case 52:
	// 			if(tx1 > -0.75)
	// 				tx1 -= 0.05;
	// 			break;
	// 		case 56:
	// 			if(ty1 < 0.75)
	// 				ty1 += 0.05;
	// 			break;
	// 		case 54:
	// 			if(tx1 < 0.75)
	// 				tx1 += 0.05;
	// 			break;
	// 		case 53:
	// 			if(ty1 > -0.75)
	// 				ty1 -= 0.05;
	// 			break;

	// 		case 97:
	// 			if(tx2 > -0.75)
	// 				tx2 -= 0.05;
	// 			break;
	// 		case 119:
	// 			if(ty2 < 0.75)
	// 				ty2 += 0.05;
	// 			break;
	// 		case 100:
	// 			if(tx2 < 0.75)
	// 				tx2 += 0.05;
	// 			break;
	// 		case 115:
	// 			if(ty2 > -0.75)
	// 				ty2 -= 0.05;
	// 			break;
	// 	}
	// });

	var keys = {
		p1left: false,
		p1up:    false,
		p1right: false,
		p1down:  false,
		p2left:  false,
		p2up :  false,
		p2right:false,
		p2down: false,
	};
	
	$(document.body).keydown(function(event) {
	// save status of the button 'pressed' == 'true'
		if (event.keyCode == 65) {
			keys["p1left"] = true;
		} else if (event.keyCode == 87) {
			keys["p1up"] = true;
		} else if (event.keyCode == 68) {
			keys["p1right"] = true;
		} else if (event.keyCode == 83) {
			keys["p1down"] = true;
		} else if (event.keyCode == 52) {
			keys["p2left"] = true;
		} else if (event.keyCode == 56) {
			keys["p2up"] = true;
		} else if (event.keyCode == 54) {
			keys["p2right"] = true;
		} else if (event.keyCode == 53) {
			keys["p2down"] = true;
		}
		if (keys["p1up"]) {
			if(ty1<0.75)
				ty1 += 0.05;
		}
		if (keys["p1down"]) {
			if(ty1>-0.75)
				ty1 -= 0.05;
		}
		if (keys["p1right"]) {
			if(tx1<0.75)
				tx1 += 0.05;
		}
		if (keys["p1left"]) {
			if(tx1>-0.75)
				tx1 -= 0.05;
		}

		if (keys["p2up"]) {
			if(ty2<0.75)
				ty2 += 0.05;
		}
		if (keys["p2down"]) {
			if(ty2>-0.75)
				ty2 -= 0.05;
		}
		if (keys["p2right"]) {
			if(tx2<0.75)
				tx2 += 0.05;
		}
		if (keys["p2left"]) {
			if(tx2>-0.75)
				tx2 -= 0.05;
		}

	});
	
	$(document.body).keyup(function(event) {
		// reset status of the button 'released' == 'false'
		if (event.keyCode == 65) {
			keys["p1left"] = false;
		} else if (event.keyCode == 87) {
			keys["p1up"] = false;
		} else if (event.keyCode == 68) {
			keys["p1right"] = false;
		} else if (event.keyCode == 83) {
			keys["p1down"] = false;
		} else if (event.keyCode == 52) {
			keys["p2left"] = false;
		} else if (event.keyCode == 56) {
			keys["p2up"] = false;
		} else if (event.keyCode == 54) {
			keys["p2right"] = false;
		} else if (event.keyCode == 53) {
			keys["p2down"] = falses;
		}
	});
	
	//aux func
	document.getElementById("print-ball-matrix").onclick = function(){
		moveToSphericalSurface(shadow, shadowColors);
	}        
}

//----------------------------------------------------------------------------
//
// WebGL Initialization
//

function initWebGL(player, canvas ) {
	try {
		if(player == 1){
			// Create the WebGL context
			
			// Some browsers still need "experimental-webgl"
			
			gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
			
			// DEFAULT: The viewport occupies the whole canvas 
			
			// DEFAULT: The viewport background color is WHITE
			
			// NEW - Drawing the triangles defining the model
			
			primitiveType = gl.TRIANGLES;
			
			// DEFAULT: Face culling is DISABLED
			
			// Enable FACE CULLING
			
			gl.enable( gl.CULL_FACE );
			
			// DEFAULT: The BACK FACE is culled!!
			
			// The next instruction is not needed...
			
			// To see the inside of the game area
			gl.cullFace( gl.BACK );

			// Enable DEPTH-TEST
			
			gl.enable( gl.DEPTH_TEST );
		}else{
			gl2 = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
			primitiveType = gl2.TRIANGLES;
			gl2.enable( gl2.CULL_FACE );
			gl2.cullFace( gl2.BACK );
			gl2.enable( gl2.DEPTH_TEST );
		}
		        
	} catch (e) {
	}
	if (!gl) {
		alert("Could not initialise WebGL, sorry! :-(");
	}        
}

//----------------------------------------------------------------------------

function runWebGL() {
	
	var canvas = document.getElementById("my-canvas");
	var canvas2 = document.getElementById("canvas2");
	console.log(canvas2);
	initWebGL(1, canvas );
	initWebGL(2, canvas2 );
	console.log(gl2);
	console.log(gl2);

	shaderProgram = initShaders( gl );

	shaderProgram2 = initShaders( gl2 );
	
	setEventListeners();
	
	//initBuffers();
	
	tick();		// NEW --- A timer controls the rendering / animation    

	outputInfos();
}

//funçao q usei p converter a bola para esfera, pode dar jeito dps, antes de entregar APAGAR!
function moveToSphericalSurface( coordsArray , colors ) {
	// Each vertex is moved to the spherical surface of radius 1
    // and centered at (0,0,0)
    
    // This is done by handling each vertex as if it were a prosition vector,
    // and normalizing
	
	// TO BE DONE !!

	centroidRefinement( coordsArray, colors, 3 );

	for (var index = 0; index < coordsArray.length; index+=3) {
		
		var v = [ coordsArray[index], coordsArray[index+1], coordsArray[index+2]];
		//console.log(v[0] + " " + v[1] + " "+ v[2]);
		normalize(v);
		//console.log(v);
		coordsArray[index] = v[0];
		coordsArray[index+1] = v[1];
		coordsArray[index+2] = v[2];
	}
	
// 	var ball = "var ball = [\n";
 	var ball = "var shadow = [\n";
	for (var index = 0; index < coordsArray.length; index+=3) {
		ball += coordsArray[index] + "," + coordsArray[index+1] + "," + coordsArray[index+2] + ",\n";
	}
	ball += "\n]\n\n";
	console.log(ball);


// 	var colors = "var ballColors = [\n";
 	var colors = "var shadowColors = [\n";
	for (var index = 0; index < ballColors.length; index+=3) {
		colors += ballColors[index] + "," + ballColors[index+1] + "," + ballColors[index+2] + ",\n";
	}
	colors += "\n]";
	console.log(colors);
}



