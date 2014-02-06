/**
 AffineTransform 
 @author Vladu Bogdan Daniel
 Copyright (c) 2013 VLADU BOGDAN DANIEL PFA
 
 */


/*creates an identity transform*/
exports.AffineTransform = function () {
  
  this.a = 1.0;
  this.b = 0.0;
  this.c = 0.0;
  this.d = 1.0;
  this.tx = 0.0;
  this.ty = 0.0;
};




AffineTransformMake = function(a, b, c, d, tx, ty)
{
	var Transform = require('animo/AffineTransform').AffineTransform;
	var t = new Transform();
	t.a = a; 
	t.b = b; 
	t.c = c; 
	t.d = d; 
	t.tx = tx; 
	t.ty = ty;
	return t;
};


AffineTransformMakeIdentity = function()
{
    return AffineTransformMake(1.0, 0.0, 0.0, 1.0, 0.0, 0.0);
}

AffineTransformTranslate = function (t, tx, ty)
{
    return AffineTransformMake(t.a, t.b, t.c, t.d, t.tx + t.a * tx + t.c * ty, t.ty + t.b * tx + t.d * ty);
};


AffineTransformRotate = function(t, anAngle)
{
    var fSin = Math.sin(anAngle);
    var fCos = Math.cos(anAngle);

    return AffineTransformMake(   t.a * fCos + t.c * fSin,
                                    t.b * fCos + t.d * fSin,
                                    t.c * fCos - t.a * fSin,
                                    t.d * fCos - t.b * fSin,
                                    t.tx,
                                    t.ty);
};

PointApplyAffineTransform = function(pointX, pointY, t)
{
  	var pX = (t.a * pointX + t.c * pointY + t.tx);
  	var pY = (t.b * pointX + t.d * pointY + t.ty);
  	return [pX, pY];
}
