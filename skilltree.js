var SkillTree = function(tree){
        this.tree = tree;
        this.paths = [];
        
        this.getTree=function(){
            return this.tree;
        }
        
        this.getTreeElementNames=function(){
            return Object.keys(this.getTree());
        }
        
        this.getTreeElement=function(name){
            var tmp = this.getTree();
            if (name in tmp){
                return new TreeElement(tmp[name]);
            }else{
                return null;
            }
        }
        
        this.addPathToSkill=function(name, pathId){
            if (this.paths[name] == null || this.paths[name].indexOf(pathId) == -1){
                var tmp = (this.paths[name] == null)?[]:this.paths[name];
                tmp.push(pathId);
                this.paths[name] = tmp;
            }
        }
        
        this.getSkillPaths = function(){
            return this.paths;
        }
        
        this.highlight=function(name, latch=false){
            //use latch for a "show all dependencies" button
            
            var allPaths = this.getSkillPaths();
            var allTree = this.getTree();
            var svg = document.getElementById("svg1");
            
            for (var idx in allTree){
                
                var currElement = new TreeElement(allTree[idx]);
                
                var dependencies = currElement.getDependencies();
                dependencies = (dependencies==null)?[]:dependencies;
                
                var bg = "steelblue";
                var path = "black";
                var depbg = "orange";
                
                if (idx == name){
                    bg = "limegreen";
                    path = "orange";
                    
                    for (var dep in dependencies){
                        document.getElementById(dependencies[dep]).style.backgroundColor = depbg;
                    }
                    
                }
                
                
                
                for (var pathIdx in allPaths[idx]){
                    var currPath = document.getElementById(allPaths[idx][pathIdx]);
                    if (currPath != null){
                        currPath.setAttributeNS(null, "stroke", path); 
                        currPath = svg.removeChild(currPath);
                        svg.prepend(currPath);
                    }
                }
                //Prevent unselected state from overriding dependency state colouring.
                if (dependencies.indexOf(idx) == -1){
                    //colour if unselected AND not a dependency
                    if (latch == false) document.getElementById(idx).style.backgroundColor = bg;
                }
            }
        }
        
        
        this.draw = function(reducedSet, priorDrawn, priorToDrawCount){
            
            document.getElementById("main").innerHTML = "";
            
            var drawn = [];
            var toDraw = [];
            
            //account for the possibility that this is a recurse, set the given variables in that instant
            if (reducedSet != null){
                toDraw = reducedSet;
            }else toDraw = this.getTreeElementNames();
            
            if (priorDrawn != null) drawn = priorDrawn;
            
            var toDrawCount = toDraw.length;
            
            //detect and break an infinite recursion.
            if (priorToDrawCount != null && priorToDrawCount == toDrawCount){
                throw "Did not reduce set whilst recursing:\n"+priorToDrawCount+"\n"+reducedSet+" remaining to draw.";
            }
            
            var i = 0;
            
            //loop over the elements to draw and draw the drawables
            for(var nameIdx in toDraw){
                var name = toDraw[nameIdx];
                var curr = this.getTreeElement(name);
                var canDraw = true;
                
                var deps = curr.getDependencies();
                
                for (var dep in deps){
                    if (drawn.indexOf(deps[dep]) == -1){
                        canDraw = false;
                    }
                }
                
                if (canDraw){
                    
                    this.drawElement(name, curr.getDescription(), (priorToDrawCount!=null)?priorToDrawCount+i:i);
                    
                    var pathIdx = 0;
                    
                    for (var dep in deps){
                        this.drawLinks(deps[dep], name, pathIdx++);
                    }
                    
                    drawn.push(name);
                }
                
                i++;
            }
            
            //remove the drawn elements from the remaining set
            var a = 0;
            for (var tmp in toDraw){
                if (toDraw[tmp] in drawn){
                    toDraw.splice(a, 1);
                }
                a++;
            }
            
            //recursion ensures the order of objects in the tree data does not matter.
            if (toDraw.length > 0 && drawn.length != toDrawCount){
                this.draw(toDraw, drawn, toDrawCount);
            }
            
        }
        
        this.drawElement=function(name, desc, number){
            var content = document.getElementById("main");
            var elem = document.createElement("div");
            elem.setAttribute("onmouseover", "mySkillTree.highlight(this.id)");
            elem.className = "skill";
            elem.style="margin-top:"+(10*number).toString()+"px";
            elem.id = name;
            var title = document.createElement("h1");
            title.innerHTML = name;
            var description = document.createElement("p");
            description.innerHTML = desc;
            
            elem.appendChild(title);
            elem.appendChild(description);
            
            content.appendChild(elem);
        }
        
        this.drawLinks=function(dep, name, idx){
            //function from svgDraw
            var pathId = name+"Path"+idx;
            var path = createPath(pathId, "0.3em");
            var svg = document.getElementById("svg1");
            
            this.addPathToSkill(name, pathId);
            
            svg.appendChild(path);
            
            connectElements(svg, document.getElementById(pathId), document.getElementById(name),   document.getElementById(dep));
        }
   
    
}

var TreeElement = function(elem){
    //"Computing":{"dependencies":["Basic Arithmetic"], "description":"", "equipment":["Computer"]},
    this.elem = elem;
    
    this.getElement=function(){
        return this.elem;
    }
    
    this.getDependencies=function(){
        var tmp = this.getElement();
        if ("dependencies" in tmp){
            return tmp["dependencies"];
        }else{
            return null;
        }
    }
    
    this.getDescription=function(){
        var tmp = this.getElement();
        if ("description" in tmp){
            return tmp["description"];
        }else{
            return null;
        }
    }
    
    this.getEquipment=function(){
        var tmp = this.getElement();
        if ("equipment" in tmp){
            return tmp["equipment"];
        }else{
            return null;
        }
    }
    
}