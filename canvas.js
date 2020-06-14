var mouseState = -1;
var selectedColor = "black";
var selectedColorBorder = "2px red solid";
var unselectedColorBorder = "2px black solid";
var ROWS = 30;
var COLS = 30;
var customColorToolbar=false;
var fillTool = false;

var changedPixels = {}; //pixel data for all changed pixels in this step.
/*
STEPTYPE: 
ADD //Pixel was added. Remove all pixels in this object.
	//Each pixel will have an old_pos_X_Y indicating their old color. Do the reverse to undo. The pixel list itself will be in "PIXELS": X,Y,X2,Y2,X3,Y3, etc.
FILL //Fill was done. A color is provided by "backcolor" and a pixel containing the click and source color. To undo it, fill with the backcolor instead of the source color.
*/

var pixelStates = []; //Last 20 pixel states stored here.
var currentPixelState = -1; //Which pixel state we're on. Max out at 20.

document.addEventListener("DOMContentLoaded",()=>{
	var undoButton = document.createElement("button")
	var redoButton = document.createElement("button")
	
	class Coordinate{
		constructor(box) {
			var idParse=box.id.split("_");
			this.x = idParse[1];
			this.y = idParse[2];
		}
	}
	class PixelCoordinate extends Coordinate{
		constructor(x,y) {
			this.x = x;
			this.y = y;
		}
	}
	
	//Returns a coordinate class.
	var getCoordinates = (box)=>{
		return new Coordinate(box);
	}
	
	function insertAfter(newNode, existingNode) {
    existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
	}
	function componentToHex(c) {
	  var hex = c.toString(16);
	  return hex.length == 1 ? "0" + hex : hex;
	}
	function rgbToHex(rgbvalue) {
		var rawColors = rgbvalue.replace("rgb(","").replace(")","").split(",");
	  return "#" + componentToHex(Number(rawColors[0])) + componentToHex(Number(rawColors[1])) + componentToHex(Number(rawColors[2]));
	}
	
	function Undo() {
		//Execute the reverse.
		var state = pixelStates[--currentPixelState];
		console.log("Undo "+currentPixelState)
		//console.log("Undo "+JSON.stringify(state))
		switch (state["STEPTYPE"]) {
			case "ADD":{
				//Take each pixel and color it its previous color.
				var pixels = state["PIXELS"].split(",")
				for (var i=0;i<pixels.length;i+=2) {
					var pixelX = pixels[i];
					var pixelY = pixels[i+1];
					var oldColor = state["old_pos_"+pixelX+"_"+pixelY]
					var cell = document.getElementById("pos_"+pixelX+"_"+pixelY)
					cell.style.background = oldColor;
				}
			}break;
			case "FILL":{
				floodFill(state["PIXELX"],state["PIXELY"],document.getElementById("pos_"+state["PIXELX"]+"_"+state["PIXELY"]).style.background,state["backcolor"])
			}break;
		}
		redoButton.disabled = false;
		undoButton.disabled = true;
		if (currentPixelState>0) {
			//currentPixelState--;
			undoButton.disabled = false;
		}
	}
	
	function Redo() {
		//Execute the re-reverse.
		console.log("Redo "+currentPixelState)
		var state = pixelStates[currentPixelState++];
		//console.log("Redo "+JSON.stringify(state))
		switch (state["STEPTYPE"]) {
			case "ADD":{
				//Take each pixel and color it its previous color.
				var pixels = state["PIXELS"].split(",")
				for (var i=0;i<pixels.length;i+=2) {
					var pixelX = pixels[i];
					var pixelY = pixels[i+1];
					var newColor = state["pos_"+pixelX+"_"+pixelY]
					var cell = document.getElementById("pos_"+pixelX+"_"+pixelY)
					cell.style.background = newColor;
				}
			}break;
			case "FILL":{
				floodFill(state["PIXELX"],state["PIXELY"],document.getElementById("pos_"+state["PIXELX"]+"_"+state["PIXELY"]).style.background,state["newcolor"])
			}break;
		}
		redoButton.disabled = true;
		undoButton.disabled = false;
		if (currentPixelState<pixelStates.length) {
			redoButton.disabled = false;
		}
	}
	
	var canvas = document.getElementsByClassName("canvas")[0];
	var toolbar = document.getElementsByClassName("toolbar")[0];
	
	

	document.addEventListener("mousemove",(e)=>{
		if (toolbar.style.visibility === "hidden" &&
		e.target.tagName[0]!== "T" &&
		e.target.tagName[0]!== "D") {
			toolbar.style.visibility = "visible";
			mouseState = -1;
		}
	})
	
	var MouseListener = (e)=>{
		e.preventDefault();
		if (!fillTool) {
			if (e.target.tagName==="TH") {
				if (mouseState>=0) {
					var mycoords = getCoordinates(e.target)
					if (!(e.target.id in changedPixels)) {
						if ("PIXELS" in changedPixels) {
							changedPixels["PIXELS"]+=","+mycoords.x+","+mycoords.y
						} else {
							changedPixels["PIXELS"]=mycoords.x+","+mycoords.y
						}
						changedPixels["old_"+e.target.id]=e.target.style.background;
						if (mouseState<2) {
							e.target.style.background=selectedColor;
							changedPixels[e.target.id]=selectedColor;
						} else {
							e.target.style.background="white";
							changedPixels[e.target.id]="white";
						}
						changedPixels["STEPTYPE"]="ADD"
					}
				}
			}
		}
	}
	var MouseClickListener = (e)=>{
		e.preventDefault();
	}
	var MouseStateUp = (e)=>{
		e.preventDefault();
		mouseState = -1;
		if (fillTool) {
			if (e.target.tagName==="TH") {
				var coords = getCoordinates(e.target)
				floodFill(coords.x,coords.y,e.target.style.background,selectedColor)
				/*changedPixels["STEPTYPE"]="FILL"
				changedPixels["backcolor"]=e.target.style.background
				changedPixels["newcolor"]=selectedColor
				changedPixels["PIXELX"]=coords.x
				changedPixels["PIXELY"]=coords.y*/
			}
		}
		toolbar.style.visibility = "visible";
		//console.log(changedPixels);
		if ("STEPTYPE" in changedPixels) {
			//Add changedPixels to the current pixelState.
			if (currentPixelState!==-1 && currentPixelState!==pixelStates.length-1) {
				//Delete everything after this.
				if (currentPixelState===0) {
					pixelStates = [];
				} else {
					pixelStates = pixelStates.slice(0,currentPixelState+1)
				}
				redoButton.disabled = true;
			}
			
			if (pixelStates.length<20) {
				pixelStates.push(changedPixels);
				undoButton.disabled = false;
				redoButton.disabled = true;
			} else {
				pixelStates = pixelStates.slice(1)
				pixelStates.push(changedPixels)
			}
			changedPixels = {}
			console.log(pixelStates)
			currentPixelState = pixelStates.length;
		}
	}
	var MouseStateDown = (e)=>{
		e.preventDefault();
		mouseState = e.button;
		if (!fillTool) {
			if (e.target.tagName==="TH") {
				var mycoords = getCoordinates(e.target)
				if (!(e.target.id in changedPixels)) {
					if ("PIXELS" in changedPixels) {
						changedPixels["PIXELS"]+=","+mycoords.x+","+mycoords.y
					} else {
						changedPixels["PIXELS"]=mycoords.x+","+mycoords.y
					}
					changedPixels["old_"+e.target.id]=e.target.style.background;
					if (e.button===0) {
						e.target.style.background=selectedColor;
						changedPixels[e.target.id]=selectedColor;
					} else {
						e.target.style.background="white";
						changedPixels[e.target.id]="white";
					}
					changedPixels["STEPTYPE"]="ADD"
				}
			}
		}
		toolbar.style.visibility = "hidden";
	}
	
	var colorPixelBasedOnID = (x,y,color)=>{
		var cell = document.getElementById("pos_"+x+"_"+y);
		cell.style.background=color;
	}
	
	var generateTable = (columns,rows)=>{
		var table = document.createElement("table");
		table.style.border="1px gray dashed";
		for (var i=0;i<rows;i++) {
			var row = document.createElement("tr");
			for (var j=0;j<columns;j++) {
				var col = document.createElement("th");
				col.style.background="white";
				col.id="pos_"+j+"_"+i;
				row.appendChild(col);
			}
			table.appendChild(row);
		}
		
		table.addEventListener("click",MouseClickListener);
		table.addEventListener("mouseover",MouseListener);
		document.addEventListener("mouseup",MouseStateUp);
		table.addEventListener("mousedown",MouseStateDown);
		
		canvas.appendChild(table);
	}
	
	var createCustomColorInput = (customColorContainer,dot)=>{
		var customColorInput = document.createElement("input");
		customColorInput.type="color"
		customColorInput.value="#222222"
		customColorInput.classList.add("customColor")
		customColorInput.id="customColor"
		insertAfter(customColorInput,dot);
		customColorInput.addEventListener("change",(e)=>{
			dot.style.background=e.target.value
			selectedColor=e.target.value
		})
		dot.src="transparent.png";
		dot.style.background=customColorInput.value;
		customColorToolbar=true;
	}
	
	var generateColors = (simple)=>{
		for (var i=0;i<CSS_COLOR_NAMES.length;i++) {
			var dot = document.createElement("span")
			dot.classList.add("dot")
			if (CSS_COLOR_NAMES[i]===selectedColor) {
				dot.style.border=selectedColorBorder;
			}
			dot.style.background=CSS_COLOR_NAMES[i];
			dot.addEventListener("mousedown",(e)=>{
				e.preventDefault();
				var otherDots = document.getElementsByClassName("dot");
				for (var i=0;i<otherDots.length;i++) {
					var dot = otherDots[i];
					dot.style.border=unselectedColorBorder;
				}
				e.target.style.border=selectedColorBorder;
				selectedColor = e.target.style.background;
			})
			toolbar.appendChild(dot);
		}		
		var customColorContainer = document.createElement("div");
		//customColorContainer.classList.add("toolbar")
		var dot = document.createElement("img")
		dot.classList.add("dot")
		dot.classList.add("inline")
		dot.src="colorwheel.png"
		customColorContainer.append(dot);
		toolbar.appendChild(customColorContainer);
		customColorContainer.addEventListener("click",(e)=>{
			if (customColorToolbar) {
				var otherDots = document.getElementsByClassName("dot");
				for (var i=0;i<otherDots.length;i++) {
					var dot2 = otherDots[i];
					dot2.style.border=unselectedColorBorder;
				}
				dot.style.border=selectedColorBorder;
				selectedColor=e.target.style.background
			} else {
				createCustomColorInput(customColorContainer,dot);
			}
		})
	}
	
	var ModifyRows = (e)=>{
		var table = document.getElementsByTagName("table")[0];
		if (e.target.value>table.getElementsByTagName("tr").length) {
			//Add a new row.
			//To add a new row, just append a new row and a new set of cells.
			var newcells = 0;
			while (table.getElementsByTagName("tr").length<e.target.value) {
				//CREATE X amount of new rows.
				var newrow = document.createElement("tr");
				for (var i=0;i<COLS;i++){
					var col = document.createElement("th");
					col.style.background="white";
					col.style.border=document.querySelector("table").style.border;
					col.id="pos_"+i+"_"+(Number(ROWS)+Number(newcells));
					newrow.appendChild(col);
				}
				newcells++;
				table.appendChild(newrow);
			}
		} else {
			//Remove the last row.
			while (table.getElementsByTagName("tr").length>e.target.value) {
				//REMOVE X amount of rows.
				var lastrow = table.getElementsByTagName("tr")[table.getElementsByTagName("tr").length-1]
				lastrow.remove();
			}
		}
		ROWS = e.target.value;
	}
	
	var ModifyCols = (e)=>{
		var table = document.getElementsByTagName("table")[0];
		if (e.target.value>COLS) {
			//console.log("In here.")
			while (e.target.value>COLS) {
				for (var i=0;i<table.getElementsByTagName("tr").length;i++) {
					var row = table.getElementsByTagName("tr")[i]
					var col = document.createElement("th");
					col.style.background="white";
					col.style.border=document.querySelector("table").style.border;
					col.id="pos_"+COLS+"_"+i;
					row.appendChild(col);
				}
				COLS++;
			}
		} else {
			while (e.target.value<COLS) {
				for (var i=0;i<table.getElementsByTagName("tr").length;i++) {
					var row = table.getElementsByTagName("tr")[i];
					var col = row.getElementsByTagName("th")[row.getElementsByTagName("th").length-1]
					col.remove();
				}
				COLS--;
			}
		}
	}
	
	var LoadData = ()=>{
		var data = JSON.parse(localStorage.getItem("save_pixelart"))
		
		var ROWSDATA = document.getElementById("rowcontrol")
		ROWSDATA.value=data["ROWS"]
		ModifyRows({"target":ROWSDATA});
		var COLSDATA = document.getElementById("colcontrol")
		COLSDATA.value=data["COLS"]
		ModifyCols({"target":COLSDATA});
		if ("CUSTOMCOLOR" in data) {
			if (!customColorToolbar) {
				var customColorContainer = document.getElementsByClassName("toolbar")[0];
				var dot = document.getElementsByTagName("img")[0];
				createCustomColorInput(customColorContainer,dot);
			}
			
			document.getElementsByTagName("img")[0].style.background = data["CUSTOMCOLOR"];
			document.getElementById("customColor").value = rgbToHex(data["CUSTOMCOLOR"]);
		}
		
		for (var i=0;i<ROWS;i++) {
			for (var j=0;j<COLS;j++) {
				var posKey = "pos_"+j+"_"+i;
				var cell = document.getElementById(posKey);
				cell.style.background=data[posKey]
			}
		}
		var consoleText = document.createElement("span")
		consoleText.innerHTML = "Loaded!"
		consoleText.classList.add("console")
		toolbar.appendChild(consoleText);
		setTimeout(()=>{
			var consoleText = document.getElementsByClassName("console")[0];
			consoleText.remove();
		},2000)
		
		undoButton.disabled=true;
		redoButton.disabled=true;
		pixelStates = []
		currentPixelState = -1;
	}
	
	var SaveData = ()=>{
		var finalData = {};
		for (var i=0;i<ROWS;i++) {
			for (var j=0;j<COLS;j++) {
				var posKey = "pos_"+j+"_"+i;
				var cell = document.getElementById(posKey);
				finalData[posKey]=cell.style.background
			}
		}
		finalData["ROWS"]=ROWS;
		finalData["COLS"]=COLS;
		finalData["CUSTOMCOLOR"]=document.getElementsByTagName("img")[0].style.background;
		console.log(JSON.stringify(finalData))
		localStorage.setItem("save_pixelart",JSON.stringify(finalData))
		var consoleText = document.createElement("span")
		consoleText.innerHTML = "Saved!"
		consoleText.classList.add("console")
		toolbar.appendChild(consoleText);
		setTimeout(()=>{
			var consoleText = document.getElementsByClassName("console")[0];
			consoleText.remove();
		},2000)
	}
	
	var generateControls = ()=>{
		var rowsLabel = document.createElement("label")
		rowsLabel.innerHTML = "Rows"
		rowsLabel.classList.add("tinylabel")
		var rowsControl = document.createElement("input")
		rowsControl.type = "number"
		rowsControl.classList.add("inline")
		rowsControl.classList.add("small")
		rowsControl.id = "rowcontrol"
		rowsControl.value = ROWS;
		rowsControl.addEventListener("change",ModifyRows)
		toolbar.appendChild(rowsLabel);
		toolbar.appendChild(rowsControl);
		var colsLabel = document.createElement("label")
		colsLabel.innerHTML = "Cols"
		colsLabel.classList.add("tinylabel")
		var colsControl = document.createElement("input")
		colsControl.type = "number"
		colsControl.classList.add("inline")
		colsControl.classList.add("small")
		colsControl.id = "colcontrol"
		colsControl.value = COLS;
		colsControl.addEventListener("change",ModifyCols)
		toolbar.appendChild(colsLabel);
		toolbar.appendChild(colsControl);
		var loadButton = document.createElement("button")
		loadButton.type = "button"
		loadButton.innerText = "Load"
		loadButton.classList.add("loadbutton")
		loadButton.addEventListener("click",LoadData)
		var saveButton = document.createElement("button")
		saveButton.type = "button"
		saveButton.innerText = "Save"
		saveButton.classList.add("savebutton")
		saveButton.addEventListener("click",SaveData)
		toolbar.appendChild(loadButton);
		toolbar.appendChild(saveButton);
		undoButton.type = "button"
		undoButton.innerText = "Undo"
		undoButton.classList.add("undobutton")
		undoButton.disabled = true
		undoButton.addEventListener("click",Undo)
		redoButton.type = "button"
		redoButton.innerText = "Redo"
		redoButton.classList.add("redobutton")
		redoButton.addEventListener("click",Redo)
		redoButton.disabled = true
		toolbar.appendChild(undoButton);
		toolbar.appendChild(redoButton);
		var toggleGridButton = document.createElement("img");
		toggleGridButton.src = "gridtoggle.png";
		toggleGridButton.classList.add("tinybutton");
		toggleGridButton.addEventListener("click",()=>{
			var elements = document.querySelectorAll("table,tr,th")
			if (document.querySelector("body > div.container > div > table").style.border.includes("1px")) {
				for (var item of elements) {
					item.style.border = "0px";
				}
			} else {
				for (var item of elements) {
					item.style.border = "1px gray dashed";
				}
			}
		})
		toolbar.appendChild(toggleGridButton);
		var fillToolButton = document.createElement("img");
		fillToolButton.src = "filltool.png"
		fillToolButton.classList.add("tinybutton")
		fillToolButton.addEventListener("click",()=>{
			fillTool = !fillTool
			if (fillTool) {
				fillToolButton.style.border = "2px red solid"
			} else {
				fillToolButton.style.border = "2px black solid"
			}
		})
		toolbar.appendChild(fillToolButton);
	}
	
	var floodFill = (startx,starty,baseColor,newColor,force=false)=>{
		//console.log("Flood fill at "+startx+","+starty)
		//Start a flood fill in 4 cardinations directions and the current spot.
		//Set the base color to what the dot currently is. Then all around this spot, fill in any dots that are also this color. Don't spread the dot if there's not a color of that type.
		if (baseColor===newColor) {
			return
		}
		startx = Number(startx)
		starty = Number(starty)
		if (document.getElementById("pos_"+(startx)+"_"+(starty)).style.background===baseColor) {
			var target = document.getElementById("pos_"+(startx)+"_"+(starty));
			if (!(target.id in changedPixels)) {
				var mycoords = getCoordinates(target)
				if ("PIXELS" in changedPixels) {
					changedPixels["PIXELS"]+=","+mycoords.x+","+mycoords.y
				} else {
					changedPixels["PIXELS"]=mycoords.x+","+mycoords.y
				}
				changedPixels["old_"+target.id]=target.style.background;
				changedPixels[target.id]=newColor
				changedPixels["STEPTYPE"]="ADD"
			}
			target.style.background = newColor
			floodFill(startx,starty,baseColor,newColor,force)
		}
		if (startx+1 < COLS && document.getElementById("pos_"+(startx+1)+"_"+(starty+0)).style.background===baseColor) {
			var target = document.getElementById("pos_"+(startx+1)+"_"+(starty));
			if (!(target.id in changedPixels)) {
				var mycoords = getCoordinates(target)
				if ("PIXELS" in changedPixels) {
					changedPixels["PIXELS"]+=","+mycoords.x+","+mycoords.y
				} else {
					changedPixels["PIXELS"]=mycoords.x+","+mycoords.y
				}
				changedPixels["old_"+target.id]=target.style.background;
				changedPixels[target.id]=newColor
				changedPixels["STEPTYPE"]="ADD"
			}
			target.style.background = newColor
			floodFill(startx+1,starty,baseColor,newColor,force)
		}
		if (startx-1 >= 0 && document.getElementById("pos_"+(startx-1)+"_"+(starty+0)).style.background===baseColor) {
			var target = document.getElementById("pos_"+(startx-1)+"_"+(starty));
			if (!(target.id in changedPixels)) {
				var mycoords = getCoordinates(target)
				if ("PIXELS" in changedPixels) {
					changedPixels["PIXELS"]+=","+mycoords.x+","+mycoords.y
				} else {
					changedPixels["PIXELS"]=mycoords.x+","+mycoords.y
				}
				changedPixels["old_"+target.id]=target.style.background;
				changedPixels[target.id]=newColor
				changedPixels["STEPTYPE"]="ADD"
			}
			target.style.background = newColor
			floodFill(startx-1,starty,baseColor,newColor,force)
		}
		if (starty+1 < ROWS && document.getElementById("pos_"+(startx)+"_"+(starty+1)).style.background===baseColor) {
			var target = document.getElementById("pos_"+(startx)+"_"+(starty+1));
			if (!(target.id in changedPixels)) {
				var mycoords = getCoordinates(target)
				if ("PIXELS" in changedPixels) {
					changedPixels["PIXELS"]+=","+mycoords.x+","+mycoords.y
				} else {
					changedPixels["PIXELS"]=mycoords.x+","+mycoords.y
				}
				changedPixels["old_"+target.id]=target.style.background;
				changedPixels[target.id]=newColor
				changedPixels["STEPTYPE"]="ADD"
			}
			target.style.background = newColor
			floodFill(startx,starty+1,baseColor,newColor,force)
		}
		if (starty-1 >= 0 && document.getElementById("pos_"+(startx)+"_"+(starty-1)).style.background===baseColor) {
			var target = document.getElementById("pos_"+(startx)+"_"+(starty-1));
			if (!(target.id in changedPixels)) {
				var mycoords = getCoordinates(target)
				if ("PIXELS" in changedPixels) {
					changedPixels["PIXELS"]+=","+mycoords.x+","+mycoords.y
				} else {
					changedPixels["PIXELS"]=mycoords.x+","+mycoords.y
				}
				changedPixels["old_"+target.id]=target.style.background;
				changedPixels[target.id]=newColor
				changedPixels["STEPTYPE"]="ADD"
			}
			target.style.background = newColor
			floodFill(startx,starty-1,baseColor,newColor,force)
		}
	}
	
	generateTable(ROWS,COLS);
	canvas.appendChild(document.createElement("br"))
	generateColors(false);
	generateControls();
	
	document.addEventListener("scroll",()=>{
		toolbar.style.position="absolute";
		toolbar.style.left=window.scrollX+"px";
		toolbar.style.bottom=-window.scrollY+"px";
	})
})