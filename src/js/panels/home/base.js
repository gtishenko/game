import React from 'react';
import {connect} from 'react-redux';

import {closePopout, goBack, openModal, openPopout, setPage} from '../../store/router/actions';

import {
    Div,
    Panel,
    PanelHeader,
    Snackbar
} from "@vkontakte/vkui";
import Matter from "matter-js";

import Icon16ErrorCircleFill from '@vkontakte/icons/dist/16/error_circle_fill';
import Icon20CheckCircleFillGreen from '@vkontakte/icons/dist/20/check_circle_fill_green';
import bridge from '@vkontakte/vk-bridge';
import { X, Y, Z } from '../../../App';

class HomePanelBase extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            snackbar: null
        };

        this.showError = this.showError.bind(this);
        this.showSuccess = this.showSuccess.bind(this);
    }

    showError(text) {
        if (this.state.snackbar) return;
        this.setState({ snackbar:
        <Snackbar
            layout="vertical"
            onClose={() => this.setState({ snackbar: null })}
            before={<Icon16ErrorCircleFill width={24} height={24} />}
        >
            {text}
        </Snackbar>
        });
    }

    showSuccess(text) {
        if (this.state.snackbar) return;
        this.setState({ snackbar:
        <Snackbar
            layout="vertical"
            onClose={() => this.setState({ snackbar: null })}
            before={<Icon20CheckCircleFillGreen width={24} height={24} />}
        >
            {text}
        </Snackbar>
        });
    }

    async componentDidMount() {
        //await bridge.send("VKWebAppStorageGet", {"keys": ["example", "example2", "example3"]});

        document.body.style = 'overflow: hidden';

        bridge.send("VKWebAppAccelerometerStart", {}).then((data) => {
            console.log(data);
        }).catch((error) => {
            console.log(error);
        })

        // module aliases
        var Engine = Matter.Engine,
        Render = Matter.Render,
        World = Matter.World,
        Events = Matter.Events,
        Bodies = Matter.Bodies;

        // create an engine
        var engine = Engine.create();

        var render = Render.create({
        element: this.refs.scene,
        engine: engine,
        options: {
            width: window.innerWidth,
            height: window.innerHeight,
            pixelRatio: 1,
            background: '#222',
            wireframeBackground: '#222',
            enabled: true,
            wireframes: false,
            showVelocity: false,
            showAngleIndicator: false,
            showCollisions: false
        }
        });

        //add the walls
        var offset = 5;
        World.add(engine.world, [
            Bodies.rectangle(400, -offset, 800 + 2 * offset, 50, {
                isStatic: true
            }),
            Bodies.rectangle(400, 600 + offset, 800 + 2 * offset, 50, {
                isStatic: true
            }),
            Bodies.rectangle(800 + offset, 300, 50, 600 + 2 * offset, {
                isStatic: true
            }),
            Bodies.rectangle(670 + offset, 470, 50, 100 + 2 * offset, {
                isStatic: true
            }),
            Bodies.rectangle(-offset, 300, 50, 600 + 2 * offset, {
                isStatic: true
            }),
            Bodies.rectangle(500, 410 + offset, 300 + 2 * offset, 50, {
                isStatic: true
            }),
            Bodies.rectangle(320 + offset, 370, 50, 100 + 2 * offset, {
                isStatic: true
            }),
            Bodies.rectangle(200, 210 + offset, 300 + 2 * offset, 50, {
                isStatic: true
            }),
        ]);

        // add some ramps to the world for the bodies to roll down
        World.add(engine.world, [
        //Bodies.rectangle(200, 150, 700, 20, { isStatic: true, angle: Math.PI * 0.06 }),
        /*Bodies.rectangle(600, 350, 700, 20, {
            isStatic: true,
            angle: -Math.PI * 0.1
        }),
        Bodies.rectangle(340, 580, 700, 20, {
            isStatic: true,
            angle: Math.PI * 0.06
        })*/
        ]);

        //adds some shapes
        //World.add(engine.world, Bodies.polygon(400, 200, 2+Math.ceil(Math.random()*7), 30));

        //add the player
        var player = Bodies.circle(100, 100, 25, {
        density: 0.001,
        friction: 0.7,
        frictionStatic: 0,
        frictionAir: 0.01,
        restitution: 0.5,
        ground: false,
        });

        //populate world
        World.add(engine.world, player);

        //37 -- лево, 39 -- право
        //looks for key presses and logs them
        var keys = [];

        document.body.addEventListener("touchstart", function (e) {
            keys[38] = true;
        });
        
        document.body.addEventListener("touchend", function (e) {
            keys[38] = false;
        });
        
        setInterval(() => {
            if(X < 0) {
                keys[37] = true;
                keys[39] = false;
            }
            if(X > 0) {
                keys[37] = false;
                keys[39] = true;
            }
        }, 100);

        //at the start of a colision for player
        Events.on(engine, "collisionStart", function (event) {
        var pairs = event.pairs
        for (var i = 0, j = pairs.length; i != j; ++i) {
            var pair = pairs[i];
            if (pair.bodyA === player) {
            player.ground = true;
            } else if (pair.bodyB === player) {
            player.ground = true;
            }
        }
        });
        //ongoing checks for collisions for player
        Events.on(engine, "collisionActive", function (event) {
        var pairs = event.pairs
        for (var i = 0, j = pairs.length; i != j; ++i) {
            var pair = pairs[i];
            if (pair.bodyA === player) {
            player.ground = true;
            } else if (pair.bodyB === player) {
            player.ground = true;
            }
        }
        });
        //at the end of a colision for player
        Events.on(engine, 'collisionEnd', function (event) {
        var pairs = event.pairs;
        for (var i = 0, j = pairs.length; i != j; ++i) {
            var pair = pairs[i];
            if (pair.bodyA === player) {
            player.ground = false;
            } else if (pair.bodyB === player) {
            player.ground = false;
            }
        }
        })

        //main engine update loop
        Events.on(engine, "beforeTick", function (event) {
            Render.lookAt(render, player, {x: 800, y: 600});//прикрепляем камеру к игроку
            //player.torque = 0.1;
            if(player.position.y > 600) {
                console.log('упал');
                //Render.stop();
                //Engine.stop();
            }
            if (keys[32]) {
                console.log(player)
            };
            //jump
            if (keys[38] && player.ground) {
                player.force = {
                x: 0,
                y: -0.05
                };
            }
            //spin left and right
            if (keys[37] && player.angularVelocity > -0.2) {
                player.torque = -0.1;
            } else {
                if (keys[39] && player.angularVelocity < 0.2) {
                    player.torque = 0.1;
                }
            }
        });

        var playerGround = false;
        Events.on(engine, "collisionStart", function (event) {
            //console.log(event.pairs)
            //var x = event.pairs[0].activeContacts[0].vertex.x
            //var y = event.pairs[0].activeContacts[0].vertex.y
            playerGround = true
        });

        // run the engine
        Engine.run(engine);

        // run the renderer
        Render.run(render);
    }

    render() {
        const {id, setPage, withoutEpic} = this.props;

        return (
            <Panel id={id}>
                <div ref="scene"/>
                {this.state.snackbar}
            </Panel>
        );
    }

}

const mapDispatchToProps = {
    setPage,
    goBack,
    openPopout,
    closePopout,
    openModal
};

export default connect(null, mapDispatchToProps)(HomePanelBase);
