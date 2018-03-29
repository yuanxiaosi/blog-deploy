// https://trac.webkit.org/browser/trunk/Source/WebCore/platform/graphics/UnitBezier.h
// http://yiminghe.iteye.com/blog/1762706
//（webkit内核贝塞尔曲线计算函数）
// B(t) = P0(1-t)^3 + 3P1t(1-t)^2 + 3P2t^2(1-t) + P3(t)^3
// x = 3p1x(1-t)^2 + 3p2xt^2*(1-t) + t^3
// y = 3p1y(1-t)^2 + 3p2yt^2*(1-t) + t^3
// x= ((ax * t + bx) * t + cx ) * t  
// y= ((ay * t + by) * t + cy ) * t  
(function(w){
  var ax = 0;
  var bx = 0;
  var cx = 0;
  var ay = 0;
  var by = 0;
  var cy = 0;
  
  function sampleCurveX(t){
    return ((ax * t + bx) * t + cx) * t;
  }
  function sampleCurveY(t){
    return ((ay * t + by) * t + cy) * t;
  }
  function sampleCurveDerivativeX(t){
    return (3.0 * ax * t + 2.0 * bx) * t + cx;
  }
  function solveCurveX(x, epsilon){

    var t0 = 0;
    var t1 = 0;
    var t2 = 0;
    var x2 = 0;
    var d2 = 0;
    var i = 0;

    for (t2 = x, i = 0; i < 8; i++) {
      x2 = sampleCurveX(t2) - x;

      if (Math.abs(x2) < epsilon)
        return t2;
      d2 = sampleCurveDerivativeX(t2);
      if (Math.abs(d2) < 1e-6)
        break;
      t2 = t2 - x2 / d2;
    }

    t0 = 0.0;
    t1 = 1.0;
    t2 = x;

    if (t2 < t0)
      return t0;
    if (t2 > t1)
      return t1;

    while (t0 < t1) {
      x2 = sampleCurveX(t2);
      if (Math.abs(x2 - x) < epsilon){
        return t2;
      }
        
      if (x > x2)
        t0 = t2;
      else
        t1 = t2;

      t2 = (t1 - t0) * .5 + t0;
    }

    return t2;
  }
  function solve(x, epsilon){
    epsilon = 1e-6;
    var y = sampleCurveY(solveCurveX(x, epsilon));
    return y;
  }
  function UnitBezier(p1x, p1y, p2x, p2y) {
    cx = 3.0 * p1x;
    bx = 3.0 * (p2x - p1x) - cx;
    ax = 1.0 - cx -bx;
     
    cy = 3.0 * p1y;
    by = 3.0 * (p2y - p1y) - cy;
    ay = 1.0 - cy - by;

  }

  w.Bezier = function(){
    this.UnitBezier = UnitBezier;
    this.Solve = solve
  }
})(window)


































  /*var p1x = 1;
  var p1y = 0;
  var p2x = 0;
  var p2y = 1;

  var ax = 3 * p1x - 3 * p2x + 1,  
        bx = 3 * p2x - 6 * p1x,  
        cx = 3 * p1x;  */
    

  //4t*t*t - 6t*t  + 3*t


  //x = ((ax * t + bx) * t + cx ) * t 

  /*var ay = 3 * p1y - 3 * p2y + 1,  
  by = 3 * p2y - 6 * p1y,  
  cy = 3 * p1y;  

  y= ((ay * t + by) * t + cy ) * t  */