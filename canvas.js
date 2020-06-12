var mouseState = -1;
var selectedColor = "black";
var selectedColorBorder = "2px red solid";
var unselectedColorBorder = "2px black solid";

document.addEventListener("DOMContentLoaded",()=>{
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
	
	var generateTable = (columns,rows)=>{
		var table = document.createElement("table");
		for (var i=0;i<rows;i++) {
			var row = document.createElement("tr");
			for (var j=0;j<columns;j++) {
				var col = document.createElement("th");
				col.style.background="white";
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
		var customColorToolbar=false;
		var dot = document.createElement("img")
		dot.classList.add("dot")
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
			} else {
				var customColorInput = document.createElement("input");
				customColorInput.type="color"
				customColorInput.value="#222222"
				customColorInput.classList.add("customColor")
				customColorContainer.appendChild(customColorInput);
				customColorInput.addEventListener("change",(e)=>{
					dot.style.background=e.target.value
					selectedColor=e.target.value
				})
				dot.src="transparent.png";
				dot.style.background=customColorInput.value;
				customColorToolbar=true;
			}
		})
	}
	
	generateTable(30,30);
	canvas.appendChild(document.createElement("br"))
	generateColors(false);
	
	document.addEventListener("scroll",()=>{
		toolbar.style.position="absolute";
		toolbar.style.left=window.scrollX+"px";
		toolbar.style.bottom=-window.scrollY+"px";
	})
})