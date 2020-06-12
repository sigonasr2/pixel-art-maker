var mouseState = -1;
var selectedColor = "black";
var selectedColorBorder = "2px red solid";
var unselectedColorBorder = "2px black solid";

document.addEventListener("DOMContentLoaded",()=>{
	var canvas = document.getElementsByClassName("canvas")[0];
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
			canvas.appendChild(dot);
		}		
	}
	
	generateTable(20,20);
	canvas.appendChild(document.createElement("br"))
	generateColors(false);
})