
/*
 *
 */
var ChipmunkDebugDraw = function(platino, chipmunk, game, scene, options) {

    var pDebugCanvas = {};
    var pConstraintDebugCanvas = {};
    var pConstraintJointDebugCanvas = {};
    var pBodies      = [];

    var cpBodyEachBodyCallbackContainer = new chipmunk.cpBodyCallbackContainer();
    var cpBodyEachConstraintCallbackContainer = new chipmunk.cpBodyCallbackContainer();

    if (options === null || options === undefined) {
        options = {};
    }
    if (options.BB     === undefined) options.BB     = true;
    if (options.Circle === undefined) options.Circle = true;
    if (options.Poly   === undefined) options.Poly   = false;
    if (options.Vertex === undefined) options.Vertex = false;
    if (options.z      === undefined) options.z      = 9999;

    // Stroke Width
    if (options.stroke === undefined) options.stroke = 2;

    // Stroke Color
    if (options.red    === undefined) options.red    = 0;
    if (options.green  === undefined) options.green  = 1;
    if (options.blue   === undefined) options.blue   = 0;

    if (options.dotsize === undefined) options.dotsize = 2;
    if (options.Constraint === undefined) options.Constraint = false;
    if (options.ConstraintConnection === undefined) options.ConstraintConnection = false;

    options.strokex2  = (options.stroke  * 2);
    options.dotsizex2 = (options.dotsize * 2);
    options.dotsizex4 = (options.dotsize * 4);

    // chipmunk y-coordinates are reverse value of platino's, so use the following
    // function to convert chipmunk y-coordinate values to platino y-coordinates and vice versa
    function cpY(y) {
        return game.screen.height - y;
    }
    
    // convert chipmunk angle (radians) to platino angles (degrees)
    function cpAngle(angle) {
        return -(angle) * 180 / Math.PI;
    }

    function toRad(angle) {
        return -(angle) * Math.PI / 180;
    }

    function empty(value) {
        return (value === null || value === undefined);
    }

    var drawBoundingBox = function(canvas) {
        if (!options.BB) return;
        canvas.setStrokeWidth(options.stroke);

        var start_x = canvas._start_x;
        var start_y = canvas._start_y;
        var width  = canvas._width;
        var height = canvas._height;

        canvas.drawRect(start_x, start_y, width, height);
    };

    var getShapeBounding = function(shape) {
        return {width:Math.abs(shape.bb.r - shape.bb.l) + options.strokex2,
               height:Math.abs(shape.bb.t - shape.bb.b) + options.strokex2};
    };

    var drawCircle = function(canvas) {
        canvas.setStrokeWidth(options.stroke);
        canvas.drawCircle(canvas._local_center_x, canvas._local_center_y, canvas._width / 2);
    };

    var drawDot = function(canvas, x, y) {
        var w  = options.dotsizex4;
        var ww = w / 2;
        canvas.fillRect(canvas._local_center_x + x - ww, canvas._local_center_y + y - ww, w, w);
    };

    var cpBodyEachShapeDrawCallback = function(body, shape, data) {
        var canvas = pDebugCanvas[body.getCPtr()];
        if (empty(canvas)) return;

        var shapeType = chipmunk.cpShapeGetShapeType(shape);
        if (options.Circle && shapeType == chipmunk.CP_CIRCLE_SHAPE) {
            drawCircle(canvas);
        } else if ((options.Poly || options.Vertex) && shapeType == chipmunk.CP_POLY_SHAPE) {
            var numVerts = chipmunk.cpPolyShapeGetNumVerts(shape);
            var lastVert, vertStart;
            for (var i = 0; i < numVerts; i++) {
                var vert  = chipmunk.cpPolyShapeGetVert(shape, i);
                var point = {x:vert.x + canvas._local_center_x, y:canvas.height - (vert.y + canvas._local_center_y)};
                if (options.Vertex) {
                    canvas.drawCircle(point.x, point.y, options.dotsize);
                }
                if (options.Poly) {
                    if (i > 0) {
                        canvas.drawLine(lastVert.x, lastVert.y, point.x, point.y);
                    }
                    if (i === numVerts - 1) {
                        canvas.drawLine(point.x, point.y, vertStart.x, vertStart.y);
                    }
                }
                if (i === 0) vertStart = {x:point.x, y:point.y};
                lastVert = {x:point.x, y:point.y};
            }
        }
    };

    var cpBodyEachConstraintDrawCallback = function(body, constraint, data) {
        var ptr = body.getCPtr();
        var canvas = pConstraintDebugCanvas[ptr];

        var constraint_ptr = constraint.getCPtr();
        var joint_canvas = pConstraintJointDebugCanvas[constraint_ptr];

        var pos   = chipmunk.cpBodyGetPos(body); pos.y = cpY(pos.y);

        var anchr1 = null;
        var anchr2 = null;

        if (chipmunk.cpConstraintIsPinJoint(constraint)) {
            joint  = chipmunk.cpConstraintGetPinJoint(constraint);
            anchr1 = joint.anchr1;
            anchr2 = joint.anchr2;
        }

        if (!empty(canvas)) {
            var parent = pDebugCanvas[ptr];
            if (!empty(parent)) {
                canvas.x = parent.x;
                canvas.y = parent.y;
                canvas.anchorPoint = {x:0.5, y:0.5};
                canvas.angle = parent.angle;
            }

            if (canvas.shouldReload) {
                if (anchr1 !== null && constraint.a.equals(body)) {
                    drawDot(canvas, anchr1.x, -anchr1.y);
                }
                if (anchr2 !== null && constraint.b.equals(body)) {
                    drawDot(canvas, anchr2.x, -anchr2.y);
                }
                canvas.shouldReload = false;
                canvas.reload();
            }
        }

        if (!empty(joint_canvas) && constraint.b.equals(body)) {
            var posA = chipmunk.cpBodyGetPos(constraint.a);
            var posB = chipmunk.cpBodyGetPos(constraint.b);

            var c, s, rad;
            if (anchr1 !== null) {
                rad = chipmunk.cpBodyGetAngle(constraint.a);
                c = Math.cos(rad);
                s = Math.sin(rad);
                posA.x = posA.x + (anchr1.x * c - anchr1.y * s);
                posA.y = posA.y + (anchr1.x * s + anchr1.y * c);
            }
            if (anchr2 !== null) {
                rad = chipmunk.cpBodyGetAngle(constraint.b);
                c = Math.cos(rad);
                s = Math.sin(rad);
                posB.x = posB.x + (anchr2.x * c - anchr2.y * s);
                posB.y = posB.y + (anchr2.x * s + anchr2.y * c);
            }

            posA.y = cpY(posA.y);
            posB.y = cpY(posB.y);

            var distx = posB.x - posA.x;
            var disty = posB.y - posA.y;

            var distance = Math.sqrt(distx * distx + disty * disty);
            var angle    = cpAngle(Math.atan2(disty, distx)); angle = angle - (angle * 2);

            joint_canvas.width = distance;
            joint_canvas.x     = posA.x;
            joint_canvas.y     = posA.y;
            joint_canvas.angle = angle;
        }
    };

    var drawBody = function(body, reload) {
        var canvas = pDebugCanvas[body.getCPtr()];
        if (empty(canvas)) return;

        // If body keeps sleeping, stop reloading. If sleep status has been changed, reload.
        var sleeping = chipmunk.cpBodyIsSleeping(body);
        if (sleeping && canvas.sleeping) return;
        if (sleeping !== canvas.sleeping) reload = true;

        var pos   = chipmunk.cpBodyGetPos(body); pos.y = cpY(pos.y);
        var angle = cpAngle(chipmunk.cpBodyGetAngle(body));

        if (!sleeping) {
            canvas.color(options.red, options.green, options.blue);
            canvas.anchorPoint = {x:0.5, y:0.5};
            canvas.center = {x: pos.x, y:pos.y};
            canvas.angle = angle;
        } else {
            canvas.color(1, 1, 1);
        }

        if (reload) {
            drawBoundingBox(canvas);
            if (options.Circle || options.Poly || options.Vertex) {
                chipmunk.cpBodyEachShape(body, cpBodyEachShapeDrawCallback, cpBodyEachBodyCallbackContainer);
            }
            canvas.reload();
        }

        if (options.Constraint) {
            chipmunk.cpBodyEachConstraint(body, cpBodyEachConstraintDrawCallback, cpBodyEachConstraintCallbackContainer);
        }

        canvas.sleeping = sleeping;
    };

    var updateCanvasMetaInfo = function(canvas, shapeType) {
        if (shapeType == chipmunk.CP_POLY_SHAPE) {
            canvas.width  = Math.abs(canvas.v_xmax - canvas.v_xmin) + options.strokex2;
            canvas.height = Math.abs(canvas.v_ymax - canvas.v_ymin) + options.strokex2;
        }
        canvas._start_x = options.stroke;
        canvas._start_y = options.stroke;
        canvas._width  = canvas.width  - options.strokex2;
        canvas._height = canvas.height - options.strokex2;
        canvas._local_center_x = canvas.width  / 2;
        canvas._local_center_y = canvas.height / 2;        
        canvas._halfw = canvas._width  / 2;
        canvas._halfh = canvas._height / 2;
    };

    var copyCanvasProperty = function(from_canvas, to_canvas) {
        to_canvas.width  = from_canvas.width;
        to_canvas.height = from_canvas.height;

        to_canvas._start_x = from_canvas._start_x;
        to_canvas._start_y = from_canvas._start_y;
        to_canvas._width  = from_canvas._width;
        to_canvas._height = from_canvas._height;
        to_canvas._local_center_x = from_canvas._local_center_x;
        to_canvas._local_center_y = from_canvas._local_center_y;
        to_canvas._halfw = from_canvas._halfw;
        to_canvas._halfh = from_canvas._halfh;
    };

    var cpBodyEachShapeInitCallback = function(body, shape, data) {
        var ptr = body.getCPtr();
        var canvas = pDebugCanvas[ptr];
        if (empty(canvas)) {
            canvas = platino.createCanvasSprite(getShapeBounding(shape));
            canvas.z = options.z + pBodies.length;
            pDebugCanvas[ptr] = canvas;

            canvas.v_xmin =  Infinity;
            canvas.v_xmax = -Infinity;
            canvas.v_ymin =  Infinity;
            canvas.v_ymax = -Infinity;

            scene.add(canvas);
        }

        var shapeType = chipmunk.cpShapeGetShapeType(shape);
        if (shapeType == chipmunk.CP_POLY_SHAPE) {
            var numVerts = chipmunk.cpPolyShapeGetNumVerts(shape);
            for (var i = 0; i < numVerts; i++) {
                var vert  = chipmunk.cpPolyShapeGetVert(shape, i);
                canvas.v_xmin = Math.min(canvas.v_xmin, vert.x);
                canvas.v_xmax = Math.max(canvas.v_xmax, vert.x);
                canvas.v_ymin = Math.min(canvas.v_ymin, vert.y);
                canvas.v_ymax = Math.max(canvas.v_ymax, vert.y);
            }
        }

        updateCanvasMetaInfo(canvas, shapeType);
    };

    var cpBodyEachConstraintInitCallback = function(body, constraint, data) {
        var ptr = body.getCPtr();
        var canvas = pConstraintDebugCanvas[ptr];

        var constraint_ptr = constraint.getCPtr();
        var constraint_canvas = pConstraintJointDebugCanvas[constraint_ptr];

        var pos   = chipmunk.cpBodyGetPos(body); pos.y = cpY(pos.y);

        if (empty(canvas)) {
            canvas = platino.createCanvasSprite({width:options.dotsize, height:options.dotsize});
            canvas.color(options.red, options.green, options.blue);
            canvas.z = options.z + pBodies.length;
            canvas.shouldReload = true;
            pConstraintDebugCanvas[ptr] = canvas;

            var parent = pDebugCanvas[ptr];
            if (!empty(parent)) {
                copyCanvasProperty(parent, canvas);
            }

            scene.add(canvas);
        }

        if (empty(constraint_canvas) && options.ConstraintConnection) {
            constraint_canvas = platino.createSprite({width:options.dotsize, height:options.dotsize});
            canvas.anchorPoint = {x:0.5, y:0.5};
            canvas.center = {x: pos.x, y:pos.y};
            canvas.color(options.red, options.green, options.blue);
            canvas.z = options.z + pBodies.length;
            pConstraintJointDebugCanvas[constraint_ptr] = constraint_canvas;

            scene.add(constraint_canvas);
        }
    };

    var initDebugCanvas = function(body) {
        chipmunk.cpBodyEachShape(body, cpBodyEachShapeInitCallback, cpBodyEachBodyCallbackContainer);
        if (options.Constraint) {
            chipmunk.cpBodyEachConstraint(body, cpBodyEachConstraintInitCallback, cpBodyEachConstraintCallbackContainer);
        }
    };

    /* 
     * Public Methods
     */
    this.addBody = function(body) {
        pBodies.push(body);
        initDebugCanvas(body);
    };

    this.addBodies = function(bodies) {
        for (var i = 0; i < bodies.length; i++) {
            this.addBody(bodies[i]);
        }
    };

    this.update = function(reload) {
        for (var i = 0; i < pBodies.length; i++) {
            drawBody(pBodies[i], reload);
        }
    };
};

module.exports = ChipmunkDebugDraw;
