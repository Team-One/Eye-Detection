
		var initialized = false;
		function button_callback() {
			/*
				(0) check whether we're already running face detection
			*/
			if(initialized)
				return; // if yes, then do not initialize everything again
			/*
				(1) initialize the pico.js face detector
			*/
			var update_memory = pico.instantiate_detection_memory(5); // we will use the detecions of the last 5 frames
			var facefinder_classify_region = function(r, c, s, pixels, ldim) {return -1.0;};
			var cascadeurl = 'https://raw.githubusercontent.com/nenadmarkus/pico/c2e81f9d23cc11d1a612fd21e4f9de0921a5d0d9/rnt/cascades/facefinder';
			fetch(cascadeurl).then(function(response) {
				response.arrayBuffer().then(function(buffer) {
					var bytes = new Int8Array(buffer);
					facefinder_classify_region = pico.unpack_cascade(bytes);
					console.log('* facefinder loaded');
				})
			})
			/*
				(2) initialize the lploc.js library with a pupil localizer
			*/
			var do_puploc = function(r, c, s, nperturbs, pixels, nrows, ncols, ldim) {return [-1.0, -1.0];};
			//var puplocurl = '../puploc.bin';
			var puplocurl = 'https://f002.backblazeb2.com/file/tehnokv-www/posts/puploc-with-trees/demo/puploc.bin'
			fetch(puplocurl).then(function(response) {
				response.arrayBuffer().then(function(buffer) {
					var bytes = new Int8Array(buffer);
					do_puploc = lploc.unpack_localizer(bytes);
					console.log('* puploc loaded');
				})
			})
			/*
				(3) get the drawing context on the canvas and define a function to transform an RGBA image to grayscale
			*/
			var ctx = document.getElementsByTagName('canvas')[0].getContext('2d');
			function rgba_to_grayscale(rgba, nrows, ncols) {
				var gray = new Uint8Array(nrows*ncols);
				for(var r=0; r<nrows; ++r)
					for(var c=0; c<ncols; ++c)
						// gray = 0.2*red + 0.7*green + 0.1*blue
						gray[r*ncols + c] = (2*rgba[r*4*ncols+4*c+0]+7*rgba[r*4*ncols+4*c+1]+1*rgba[r*4*ncols+4*c+2])/10;
				return gray;
			}
			/*
				(4) this function is called each time a video frame becomes available
			*/
			var processfn = function(video, dt) {
				// render the video frame to the canvas element and extract RGBA pixel data
				ctx.drawImage(video, 0, 0);
				var rgba = ctx.getImageData(0, 0, 640, 480).data;
				// prepare input to `run_cascade`
				image = {
					"pixels": rgba_to_grayscale(rgba, 480, 640),
					"nrows": 480,
					"ncols": 640,
					"ldim": 640
				}
				params = {
					"shiftfactor": 0.1, // move the detection window by 10% of its size
					"minsize": 100,     // minimum size of a face
					"maxsize": 1000,    // maximum size of a face
					"scalefactor": 1.1  // for multiscale processing: resize the detection window by 10% when moving to the higher scale
				}
				// run the cascade over the frame and cluster the obtained detections
				// dets is an array that contains (r, c, s, q) quadruplets
				// (representing row, column, scale and detection score)
				dets = pico.run_cascade(image, facefinder_classify_region, params);
				dets = update_memory(dets);
				dets = pico.cluster_detections(dets, 0.2); // set IoU threshold to 0.2
				// draw detections
				for(i=0; i<dets.length; ++i)
					// check the detection score
					// if it's above the threshold, draw it
					// (the constant 50.0 is empirical: other cascades might require a different one)
					if(dets[i][3]>50.0)
					{
						var r, c, s;
						//
						ctx.beginPath();
						ctx.arc(dets[i][1], dets[i][0], dets[i][2]/2, 0, 2*Math.PI, false);
						ctx.lineWidth = 3;
						ctx.strokeStyle = 'red';
						ctx.stroke();
						//
						// find the eye pupils for each detected face
						// starting regions for localization are initialized based on the face bounding box
						// (parameters are set empirically)
						// first eye
						r = dets[i][0] - 0.075*dets[i][2];
						c = dets[i][1] - 0.175*dets[i][2];
						s = 0.35*dets[i][2];
						[r, c] = do_puploc(r, c, s, 63, image)
						if(r>=0 && c>=0)
						{
							ctx.beginPath();
							ctx.arc(c, r, 1, 0, 2*Math.PI, false);
							ctx.lineWidth = 3;
							ctx.strokeStyle = 'red';
							ctx.stroke();
						}
						// second eye
						r = dets[i][0] - 0.075*dets[i][2];
						c = dets[i][1] + 0.175*dets[i][2];
						s = 0.35*dets[i][2];
						[r, c] = do_puploc(r, c, s, 63, image)
						if(r>=0 && c>=0)
						{
							ctx.beginPath();
							ctx.arc(c, r, 1, 0, 2*Math.PI, false);
							ctx.lineWidth = 3;
							ctx.strokeStyle = 'red';
							ctx.stroke();
						}
						console.log("face found!"); // debugging
						displayText(); 
						//setTimeout(function(button_callback){ }, 9000);
					}
			}
			/*
				(5) instantiate camera handling (see https://github.com/cbrandolino/camvas)
			*/
			var mycamvas = new camvas(ctx, processfn);
			/*
				(6) it seems that everything went well
			*/
			initialized = true;
		}

		function displayText() 
		{ 
			console.log("in text function");

			var text = document.getElementById("textBox");
			
				setTimeout(function(){ text.value="The human nose can detect about 1 trillion smells" }, 1000);
				setTimeout(function(){ text.value="The olfactory system is the first sense to develop" }, 6000);
				setTimeout(function(){ text.value="because of this, smell has the strongest ties to memory." }, 12000);
				setTimeout(function(){ document.getElementById("labnol").reset(); }, 18000);
			console.log('I\'m done!');

		}

		
		
