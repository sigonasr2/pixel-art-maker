var mouseState = -1;
var selectedColor = "black";
var selectedColorBorder = "2px red solid";
var unselectedColorBorder = "2px black solid";
var ROWS = 30;
var COLS = 30;
var customColorToolbar=false;


document.addEventListener("DOMContentLoaded",()=>{
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
	var canvas = document.getElementsByClassName("canvas")[0];
	var toolbar = document.getElementsByClassName("toolbar")[0];
	var MouseListener = (e)=>{
		e.preventDefault();
		if (mouseState>=0) {
			if (mouseState<2 && e.target.tagName==="TH") {
				e.target.style.background=selectedColor;
			} else {
				e.target.style.background="white";
			}
		}
	}
	var MouseClickListener = (e)=>{
		e.preventDefault();
	}
	var MouseStateUp = (e)=>{
		e.preventDefault();
		mouseState = -1;
	}
	var MouseStateDown = (e)=>{
		e.preventDefault();
		mouseState = e.button;
		if (e.target.tagName==="TH") {
			if (e.button===0) {
				e.target.style.background=selectedColor;
			} else {
				e.target.style.background="white";
			}
		}
	}
	
	var colorPixelBasedOnID = (x,y,color)=>{
		var cell = document.getElementById("pos_"+x+"_"+y);
		cell.style.background=color;
	}
	
	var generateTable = (columns,rows)=>{
		var table = document.createElement("table");
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
		table.addEventListener("mouseup",MouseStateUp);
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
		customColorContainer.classList.add("toolbar")
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
		//console.log(JSON.stringify(finalData))
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