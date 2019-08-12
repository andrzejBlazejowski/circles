require.config({
    baseUrl: './scripts',
    packages: [
        {
            name: 'physicsjs',
            location : '../../node_modules/physicsjs/dist',
            main: 'physicsjs',
        }
    ]
});


requirejs(['physicsjs',
    'physicsjs/bodies/circle',
    'physicsjs/bodies/rectangle',
    'physicsjs/renderers/canvas',
    'physicsjs/behaviors/body-collision-detection',
    'physicsjs/behaviors/edge-collision-detection',
    'physicsjs/behaviors/newtonian',
    'physicsjs/behaviors/attractor',
    'physicsjs/behaviors/constant-acceleration',
    'physicsjs/behaviors/body-impulse-response',
    'physicsjs/behaviors/interactive',
    'physicsjs/behaviors/sweep-prune'
    ]
    ,function (Physics) {
        Physics(function(world){
            // bounds of the window
            var viewportBounds = Physics.aabb(0, 0, window.innerWidth, window.innerHeight)
                ,edgeBounce
                ,renderer
                ;
            // create a renderer
            renderer = Physics.renderer('canvas', {
                el: 'viewport'
            });

            // add the renderer
            world.add(renderer);
            // render on each step
            world.on('step', function () {
                world.render();
            });

            // constrain objects to these bounds
            edgeBounce = Physics.behavior('edge-collision-detection', {
                aabb: viewportBounds
                ,restitution: 1
                ,cof: 0
            });

            // resize events
            window.addEventListener('resize', function () {

                // as of 0.7.0 the renderer will auto resize... so we just take the values from the renderer
                viewportBounds = Physics.aabb(0, 0, renderer.width, renderer.height);
                // update the boundaries
                edgeBounce.setAABB(viewportBounds);

            }, true);

            // create some bodies
            for( let i = 0; i<=40; i++ ){
                let velocityX =  Math.floor((Math.random() /4 - 0.125 )*10)/10;
                let velocityY =  Math.floor((Math.random() /4 - 0.125 )*10)/10;
                console.log( velocityX, velocityY );
                world.add( Physics.body('circle', {
                    x: renderer.width * Math.random()
                    ,y: renderer.height * Math.random()
                    // ,vx: velocityX
                    // ,vy: velocityY
                    // ,mass: 1
                    ,restitution: 1
                    ,cof: 0
                    ,radius: Math.floor(Math.random() * (60 - 40 + 1) + 40)
                    ,styles: {
                        fillStyle: '#6c71c4'
                        ,angleIndicator: '#3b3e6b'
                    }
                }));
            }

            // add some fun interaction
            var attractor = Physics.behavior('attractor', {
                order: 0,
                strength: 0.002
            });
            world.on({
                'interact:poke': function( pos ){
                    world.wakeUpAll();
                    attractor.position( pos );
                    world.add( attractor );
                }
                ,'interact:move': function( pos ){
                    attractor.position( pos );
                }
                ,'interact:release': function(){
                    world.wakeUpAll();
                    world.remove( attractor );
                }
            });

            // add things to the world
            world.add([
                Physics.behavior('interactive', { el: renderer.container })
                ,Physics.behavior('constant-acceleration')
                ,Physics.behavior('body-impulse-response')
                ,Physics.behavior('sweep-prune')
                ,Physics.behavior('body-collision-detection', { checkAll: false })
                ,edgeBounce
            ]);

            // subscribe to ticker to advance the simulation
            Physics.util.ticker.on(function( time ) {
                world.step( time );
            });
            Physics.util.ticker.start();
        });
    });