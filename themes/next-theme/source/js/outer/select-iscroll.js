(function(w){
  var IScroll = function(id, cb){
    var me = this;
    me.id = id.substr(1, id.length);
   
    init()

    

    me.wrapper.addEventListener('touchstart', startEvent)
    me.wrapper.addEventListener('touchmove', moveEvent)
    me.wrapper.addEventListener('touchend', endEvent)

    me.wrapper.addEventListener('mousedown', startEvent)
    document.body.addEventListener('mousemove', moveEvent)
    me.wrapper.addEventListener('mouseup', endEvent)

    var down = false;
    function startEvent(e){
      down = true;
      var clientY = e.pageY || e.touches[0].clientY;
      me.limitY = 0;
      for(var i=0; i<me.scrollerLiLen; i++){
        me.scrollerLi[i].style.color = '#ccc'
      }
      me.startY = clientY;
      me.startTime = new Date().getTime();
      scrollStart();
      return false;
    }
    function moveEvent(e){
      if(!down) return;
      var clientY = e.pageY || e.touches[0].clientY;
      me.moveY = clientY - me.startY;
      me.y = me.transY + me.moveY
      if(me.y>0){
        if(me.limitY==0){
          me.limitY = me.moveY
        }
        me.y = 0 + (me.moveY-me.limitY)/4;
      }
      if(me.y<me.maxScrollY){
        if(me.limitY==0){
          me.limitY = me.moveY
        }
        me.y = me.maxScrollY + (me.moveY-me.limitY)/4;
      }
      scrollMove(me.y)
      return false;
    }
    function endEvent(e){
      down = false;
      me.endTime = new Date().getTime();
      me.moveTime = me.endTime - me.startTime;
      var momenValue = false;
      if(me.moveTime < 150){
        momenValue = momentum(me.y, me.transY, me.moveTime, me.maxScrollY, me.wrapperHeight)
      }
      me.y = me.transY + me.moveY
      scrollEnd(me.y)
      if(momenValue){
        transEnd(momenValue)
        scrollEnd(momenValue.destination)
      }else{
        scrollBack()
      }
      return false;
    }


    function scrollStart(){
      me.scrollerStyle.webkitTransitionDuration = "0ms";
    }
    function scrollMove(y){
      me.scrollerStyle.webkitTransform = "translateY("+y+"px)";
    }
    function scrollEnd(y){
      me.transY = y;
    }
    function transEnd(momenValue){
      me.scrollerStyle.webkitTransitionTimingFunction = "cubic-bezier(0.1, 0.57, 0.1, 1)";
      me.scrollerStyle.webkitTransitionDuration = momenValue.duration+"ms";
      me.scrollerStyle.webkitTransform = "translateY("+momenValue.destination+"px)";
      setTimeout(function(){
        scrollBack(); //超出回滚
      }, momenValue.duration)
      
    }
    function scrollBack(){
      if(me.transY > 0){
        me.scrollerIndex = 2;
        me.scrollerLi[me.scrollerIndex].style.color = '#000'
        me.scrollerStyle.webkitTransitionTimingFunction = "cubic-bezier(0.175, 0.885, 0.32, 1.275)";
        me.scrollerStyle.webkitTransitionDuration = "500ms";
        me.scrollerStyle.webkitTransform = "translateY(0px)";
        me.transY = 0;
        if(cb) 
          cb();
        return;
      }
      if(me.transY < me.maxScrollY){
        me.scrollerIndex = me.scrollerLiLen-3;
        me.scrollerLi[me.scrollerIndex].style.color = '#000'
        me.scrollerStyle.webkitTransitionTimingFunction = "cubic-bezier(0.175, 0.885, 0.32, 1.275)";
        me.scrollerStyle.webkitTransitionDuration = "500ms";
        me.scrollerStyle.webkitTransform = "translateY("+ me.maxScrollY +"px)";
        me.transY = me.maxScrollY;
        if(cb) 
          cb();
        return;
      }

      var mid = Math.round(me.transY/me.scrollerLiHeight);
      var index = Math.abs(mid);
      me.scrollerIndex = index+2
      me.scrollerLi[me.scrollerIndex].style.color = '#000'
      me.transY = mid*me.scrollerLiHeight;
      me.scrollerStyle.webkitTransitionTimingFunction = "cubic-bezier(0.175, 0.885, 0.32, 1.275)";
      me.scrollerStyle.webkitTransitionDuration = "500ms";
      me.scrollerStyle.webkitTransform = "translateY("+ me.transY +"px)";
      if(cb) 
        cb();
    }
    function momentum(current, start, time, lowerMargin, wrapperSize, deceleration) {//吊炸天的计算，可惜不是我写的，我也看不懂%……&%……%￥%……￥%……￥%
      var distance = current - start,
        speed = Math.abs(distance) / time,
        destination,
        duration;

      deceleration = deceleration === undefined ? 0.0006 : deceleration; //摩擦因素

      destination = current + ( speed * speed ) / ( 2 * deceleration ) * ( distance < 0 ? -1 : 1 );

      duration = speed / deceleration;

      if ( destination < lowerMargin ) {
        destination = wrapperSize ? lowerMargin - ( wrapperSize / 2.5 * ( speed / 8 ) ) : lowerMargin;
        distance = Math.abs(destination - current);
        duration = distance / speed;
      } else if ( destination > 0 ) {
        destination = wrapperSize ? wrapperSize / 2.5 * ( speed / 8 ) : 0;
        distance = Math.abs(current) + destination;
        duration = distance / speed;
      }

      return {
        destination: Math.round(destination),
        duration: duration
      };
    };

    function init() {
      me.wrapper = document.getElementById(me.id);
      me.scroller = me.wrapper.querySelector(".scroller");
      me.scrollerLi = me.scroller.getElementsByTagName('li');
      me.scrollerLiLen = me.scrollerLi.length;
      me.scrollerLiHeight = me.scrollerLi[0].clientHeight;

      me.scrollerWidth = me.scroller.clientWidth;
      me.scrollerHeight = me.scroller.clientHeight;
      me.wrapperWidth = me.wrapper.clientWidth;
      me.wrapperHeight = me.wrapper.clientHeight;
      me.maxScrollY = me.wrapperHeight - me.scrollerHeight;
      me.scrollerStyle = me.scroller.style;
      me.startY = 0;
      me.moveY = 0;
      me.transY = 0;
      me.limitY = 0;
      me.startTime = 0;
      me.moveTime = 0;
      me.endTime = 0;
      me.y = 0;

      for(var i=0; i<me.scrollerLiLen; i++){
        me.scrollerLi[i].style.color = '#ccc'
      }

      me.scrollerIndex = 2;
      me.scrollerLi[me.scrollerIndex].style.color = '#000'
      me.scrollerStyle.webkitTransitionTimingFunction = "cubic-bezier(0.175, 0.885, 0.32, 1.275)"
      me.scrollerStyle.webkitTransitionDuration = "0ms";
      me.scrollerStyle.webkitTransform = "translateY(0px)";
      me.transY = 0;
    }


    me.getIndex = function(){
      return me.scrollerIndex-2;
    }
    me.setIndex = function(index){
      me.scrollerIndex = index+2;
      me.scrollerLi[me.scrollerIndex].style.color = '#000'
      me.scrollerStyle.webkitTransitionTimingFunction = "cubic-bezier(0.175, 0.885, 0.32, 1.275)"
      me.scrollerStyle.webkitTransitionDuration = "0ms";
      me.transY = -index*me.scrollerLiHeight;
      me.scrollerStyle.webkitTransform = "translateY("+me.transY+"px)";
    }
    me.init = init;


  }


  w.IScroll = IScroll

})(window)