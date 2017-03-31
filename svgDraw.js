//helper functions, it turned out chrome doesn't support Math.sgn() 
function signum(x) {
    return (x < 0) ? -1 : 1;
}
function absolute(x) {
    return (x < 0) ? -x : x;
}

function drawPath(svg, path, startX, startY, endX, endY) {
    // get the path's stroke width (if one wanted to be  really precize, one could use half the stroke size)
    var stroke =  parseFloat(path.getAttribute("stroke-width"));
    // check if the svg is big enough to draw the path, if not, set heigh/width
    if (svg.getAttribute("height") <  endY)                 svg.setAttribute("height", endY);
    if (svg.getAttribute("width" ) < (startX + stroke) )    svg.setAttribute("width", (startX + stroke));
    if (svg.getAttribute("width" ) < (endX   + stroke) )    svg.setAttribute("width", (endX   + stroke));
    
    var deltaX = (endX - startX) * 0.15;
    var deltaY = (endY - startY) * 0.15;
    // for further calculations which ever is the shortest distance
    var delta  =  deltaY < absolute(deltaX) ? deltaY : absolute(deltaX);

    // set sweep-flag (counter/clock-wise)
    // if start element is closer to the left edge,
    // draw the first arc counter-clockwise, and the second one clock-wise
    var arc1 = 0; var arc2 = 1;
    if (startX > endX) {
        arc1 = 1;
        arc2 = 0;
    }
    // draw tha pipe-like path
    // 1. move a bit down, 2. arch,  3. move a bit to the right, 4.arch, 5. move down to the end 
    path.setAttribute("d",  "M"  + startX + " " + startY +
                    " V" + (startY + delta) +
                    " A" + delta + " " +  delta + " 0 0 " + arc1 + " " + (startX + delta*signum(deltaX)) + " " + (startY + 2*delta) +
                    " H" + (endX - delta*signum(deltaX)) + 
                    " A" + delta + " " +  delta + " 0 0 " + arc2 + " " + endX + " " + (startY + 3*delta) +
                    " V" + endY );
}

function connectElements(svg, path, startElem, endElem) {

    // if first element is lower than the second, swap!
    if(getElementOffset(startElem).top > getElementOffset(endElem).top){
        var temp = startElem;
        startElem = endElem;
        endElem = temp;
    }

    // get (top, left) corner coordinates of the svg container   
    var svgTop  = getElementOffset(document.getElementById("svgContainer")).top;
    var svgLeft = getElementOffset(document.getElementById("svgContainer")).left;

    // get (top, left) coordinates for the two elements
    var startCoord = getElementOffset(startElem);
    var endCoord   = getElementOffset(endElem);

    // calculate path's start (x,y)  coords
    // we want the x coordinate to visually result in the element's mid point
    var startX = startCoord.left + 0.5*startElem.offsetWidth - svgLeft;    // x = left offset + 0.5*width - svg's left offset
    var startY = startCoord.top  + startElem.offsetHeight - svgTop;        // y = top offset + height - svg's top offset

        // calculate path's end (x,y) coords
    var endX = endCoord.left + 0.5*endElem.offsetWidth - svgLeft;
    var endY = endCoord.top  - svgTop;

    // call function for drawing the path
    drawPath(svg, path, startX, startY, endX, endY);

}

function getElementOffset(elem)
{
    var de = document.documentElement;
    var box = {left: 0, top: 0};
    try{
        box = elem.getBoundingClientRect();
    }catch(e){
        console.log(e);
    }
    var marginTop = 0;
    var marginLeft = 0;
    
    if (elem.marginTop != null){
        //Only supports px margins
        if (elem.marginTop.toString().indexOf("px") != -1){
            marginTop = parseFloat(elem.marginTop.toString().replace("px", ""));
        }
    }
    
    if (elem.marginLeft != null){
        //Only supports px margins
        if (elem.marginLeft.toString().indexOf("px") != -1){
            marginLeft = parseFloat(elem.marginLeft.toString().replace("px", ""));
        }
    }
    
    var top = box.top + window.pageYOffset - de.clientTop;
    var left = box.left + window.pageXOffset - de.clientLeft;
    return { top: top, left: left };
}

function createPath(id, width, style){
    
    newpath = document.createElementNS('http://www.w3.org/2000/svg', "path");  
    newpath.setAttributeNS(null, "id", id);  
    newpath.setAttributeNS(null, "d", "M0 0");  
    newpath.setAttributeNS(null, "stroke", "black"); 
    newpath.setAttributeNS(null, "stroke-width", width);  
    newpath.setAttributeNS(null, "opacity", 1);  
    newpath.setAttributeNS(null, "fill", "none");
    
    return newpath;
}