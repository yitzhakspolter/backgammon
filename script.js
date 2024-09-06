const whitePiece = '<span class="whiteDot"></span>;'

const blackPiece = '<span class="blackDot"></span>;'

const board = document.getElementById('board');

const whiteDot = document.getElementsByClassName("whiteDot");
const blackDot = document.getElementsByClassName("blackDot");
const tempDot = document.getElementsByClassName("tempDot");
const dice1 = document.getElementById('dice1');
const dice2 = document.getElementById('dice2');
const text = document.getElementById('text');
const diceButton = document.getElementById('dice');
const botButton = document.getElementById('bot');
const diceSound = document.getElementById('dice-sound');
const piecePlacementSound = document.getElementById('piece-placement-sound');

const numPieces = 15;
const leftBoard = 6.7
const rightBoard = 53.4
const topBoard = 5.2
const bottomBoard = 89
const side_diff = 7;
const stack_diff = 5;
const trapLocationX = 48
const trapLocationY = (bottomBoard + topBoard) / 2;

let isWhite = true;
let pieceDirection = 1;
let x_coord = 0;
let y_coord = 0;
let direction = 0;
let y_direction = 0;

let new_i = 0;
let stack_size = 0;
let bot = false;
botButton.onclick = trueBot

function trueBot() {
  bot = true;
	botButton.innerText = 'human'
	botButton.onclick = falseBot
}

function falseBot() {
  bot = false;
	botButton.innerText = 'bot'
	botButton.onclick = trueBot
}

let whitePos = [0, 0, 0, 0, 0, 5,
		0, 3, 0, 0, 0, 0,
		5, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 2]

let blackPos = [2, 0, 0, 0, 0, 0,
								0, 0, 0, 0, 0, 5,
								0, 0, 0, 0, 3, 0,
							 	5, 0, 0, 0, 0, 0]


let whiteTrap = []
let blackTrap = []

function coords(i){
	// this function returns all relevant information for the placements of the pieces
	// i is the index of the piece
	// y_coord is the starting y coord of the piece
	// x_coord is the x coord of the piece
	// direction is the direction of the piece in the y axis
	y_coord = (i < 12) ? bottomBoard : topBoard;
	direction = (i < 12) ? -1 : 1;
	x_coord = ((i < 6) || (17 < i)) ? rightBoard : leftBoard;
	x_coord = (i < 12) ? x_coord + side_diff*5: x_coord;
	x_direction = (i < 12) ? -1 : 1;
	x_coord += x_direction*(i % 6) * side_diff
	return [y_coord, x_coord, direction];
}

function setUpBoard(dots, position) {
	let dotNum = 0
	let pieces = [[], [], [], [], [], [],
							 	[], [], [], [], [], [],
							 	[], [], [], [], [], [],
							 	[], [], [], [], [], []]
	for (let i = 0; i < position.length; i++) {
		[y_coord, x_coord, direction] = coords(i);
		if (position[i] > 0) {
			for (let k = 0; k < position[i]; k++) {
				dots[dotNum].style.top = (y_coord + direction * k * stack_diff) + "%"
				dots[dotNum].style.left = x_coord+ "%"
				pieces[i].push(dots[dotNum])
				dotNum++
				}
			}
	}
	return pieces
}

let whitePieces = setUpBoard(whiteDot, whitePos)
let blackPieces = setUpBoard(blackDot, blackPos)

let pieceInfo = {true: {pos: whitePos, pieces: whitePieces, traps: whiteTrap, firstIndex: 24, out: 0}, false: {pos: blackPos, pieces: blackPieces, traps: blackTrap, firstIndex: -1, out: 0}}

diceButton.onclick = function(){turn(isWhite)}

function getRandomInt(max) {
	return Math.floor(Math.random() * max)
}

function clearOnMouseEnter(isWhite){
	curPieces = pieceInfo[isWhite].pieces
	if (pieceInfo[isWhite].traps.length > 0){
		pieceInfo[isWhite].traps[pieceInfo[isWhite].traps.length - 1].onmouseenter = null
	}
	for (let i = 0; i < curPieces.length; i++) {
		if (curPieces[i].length > 0){
			curPieces[i][curPieces[i].length - 1].onmouseenter = null
		}
	}
}

function clearOnMouseLeave(isWhite){
	curPieces = pieceInfo[isWhite].pieces
	if (pieceInfo[isWhite].traps.length > 0){
		pieceInfo[isWhite].traps[pieceInfo[isWhite].traps.length - 1].onmouseleave = null
	}
	for (let i = 0; i < curPieces.length; i++) {
		if (curPieces[i].length > 0){
			curPieces[i][curPieces[i].length - 1].onmouseleave = null
		}
	}
}

function enableTmpDots(dotIndex, isWhite, dice){
	curPieces = pieceInfo[isWhite].pieces
	oppPieces = pieceInfo[!isWhite].pieces
	for(let i = 0; i < tempDot.length; i++){
		tempDot[i].onclick = function() {clickTmpDot(isWhite, dotIndex, tempDot[i], dice)}
	}
}

function clickTmpDot(isWhite, dotIndex, curTempDot, dice){
	piecePlacementSound.play()
	curPieces = pieceInfo[isWhite].pieces
	if ((dotIndex === -1) || (dotIndex === 24)){
		curPieceStack = pieceInfo[isWhite].traps
	}
	else{
		curPieceStack = curPieces[dotIndex]
	}
	oppPieces = pieceInfo[!isWhite].pieces
	if (curTempDot.style.getPropertyValue('--out') === '1'){
		piece = curPieceStack.pop()
		piece.style.display = "none"
		pieceInfo[isWhite].out += 1
		if (pieceInfo[isWhite].out === numPieces){
			color = isWhite ? "white" : "black"
			text.innerHTML = color + " wins"
			diceButton.onclick = null
			cleanTempDots()
			return
		}
	}
	else{
		new_index = curTempDot.style.getPropertyValue('--index')
		if (oppPieces[new_index].length > 0){
			oppPieces[new_index][oppPieces[new_index].length - 1].style.top = trapLocationY + '%'
			oppPieces[new_index][oppPieces[new_index].length - 1].style.left = trapLocationX + '%'
			pieceInfo[!isWhite].traps.push(oppPieces[new_index].pop())
		}
		[y_coord, x_coord, direction] = coords(new_index);
		curPieceStack[curPieceStack.length-1].style.top = (y_coord + direction * curPieces[new_index].length * stack_diff) + "%"
		curPieceStack[curPieceStack.length-1].style.left = x_coord+ "%"
		curPieces[new_index].push(curPieceStack.pop())
	}
	
	cleanTempDots()

	dieIndex = curTempDot.style.getPropertyValue('--dieIndex')
	dice.splice(dieIndex, 1);
	continueTurn(dice, isWhite)
}

function clickDot(dotIndex, isWhite, dice){
	let stay = false
	for (let i = 0; i < tempDot.length; i++){
			stay = stay || (tempDot[i].style.display != "none")
	}
	if (!stay){
		return
	}
	clearOnMouseEnter(isWhite)
	clearOnMouseLeave(isWhite)
	enableTmpDots(dotIndex, isWhite, dice)
	reclickDotFunction(dotIndex, isWhite, dice)
}

function reclickDotFunction(dotIndex, isWhite, dice){
	if ((dotIndex === -1) || (dotIndex === 24)){
		curPieceStack = pieceInfo[isWhite].traps
	}
	else{
		curPieceStack = curPieces[dotIndex]
	}
	piece = curPieceStack[curPieceStack.length-1]
	piece.onclick = function() {reclickDot(isWhite, dice, piece)}
}

function reclickDot(isWhite, dice, piece){
	piece.onclick = null
	cleanTempDots()
	continueTurn(dice, isWhite)
}

function pieceOptions(curPieces, isWhite, dice){
	if (!noMovesAvailable(isWhite, dice)){
		isWhite = !isWhite
		color = isWhite ? "white" : "black"
		text.innerText = 'cant move!'
		text.innerText += color + ", roll dice"
		diceButton.disabled = false;
		diceButton.onclick = function(){turn(isWhite)}
		return
	}
	trappedPieces = pieceInfo[isWhite].traps
	if (trappedPieces.length > 0){
		trappedPieces[trappedPieces.length - 1].onmouseenter = function(){displayTempDots(pieceInfo[isWhite].firstIndex, dice, isWhite)}
		trappedPieces[trappedPieces.length - 1].onmouseleave = cleanTempDots
		trappedPieces[trappedPieces.length - 1].onclick = function(){clickDot(pieceInfo[isWhite].firstIndex, isWhite, dice)}
	}
	else{
		for (let i = 0; i < curPieces.length; i++){
			if (curPieces[i].length > 0){
				curPieces[i][curPieces[i].length - 1].onmouseenter = function(){displayTempDots(i, dice, isWhite)}
				curPieces[i][curPieces[i].length - 1].onmouseleave = cleanTempDots
				curPieces[i][curPieces[i].length - 1].onclick = function(){clickDot(i, isWhite, dice)}
			}
		}
	}
}

function rollDice(){
	let dice = []
	dice.push(getRandomInt(6)+1)
	dice.push(getRandomInt(6)+1)
	if (dice[0] === dice[1]){
		dice.push(dice[0])
		dice.push(dice[0])
	}
	dice1.innerText = dice[0]
	dice2.innerText = dice[1]
	return dice
}

function turn(isWhite){
	diceSound.play()
	curPieces = pieceInfo[isWhite].pieces
	oppPieces = pieceInfo[!isWhite].pieces
	diceButton.disabled = true;
	dice = rollDice()
	color = isWhite ? "white" : "black"
	text.innerText = color + ", move your pieces"
	pieceOptions(curPieces, isWhite, dice)
}

function continueTurn(dice, isWhite){
	if (dice.length === 0){
		isWhite = !isWhite
		color = isWhite ? "white" : "black"
		text.innerText = color + ", roll dice"
		if (bot && !isWhite){
			botTurn()
		}
		else{
			diceButton.disabled = false;
			diceButton.onclick = function(){turn(isWhite)}
		}
	}
	else{
		curPieces = pieceInfo[isWhite].pieces
		pieceOptions(curPieces, isWhite, dice)
	}
}

function cleanTempDots(){
	for (let i = 0; i < tempDot.length; i++){
		tempDot[i].style.display = "none"
	}
}

function allInLastSection(isWhite){
	if (pieceInfo[isWhite].traps.length > 0){
		return false
	}
	let start = isWhite ? 6 : 0
	let end = isWhite ? 24 : 18
	for (let i = start; i < end; i++){
		if (pieceInfo[isWhite].pieces[i].length > 0){
			return false
		}
	}
	return true
}

function displayTempDots(i, dice, isWhite){
	if (isWhite){
		curPieces = whitePieces
		oppPieces = blackPieces
		pieceDirection = -1
	}
	else{
		curPieces = blackPieces
		oppPieces = whitePieces
		pieceDirection = 1
	}
	let endGame = allInLastSection(isWhite)
	for (let k = 0; k < dice.length; k++){
		new_i = i + pieceDirection * dice[k];
		[y_coord, x_coord, direction] = coords(new_i);
		if ((k > 0) && (dice[k] === dice[k-1])){
			continue
		}
		else if (endGame && ((new_i < 0) || (new_i > 23))){
			moveOut = canIMoveOut(i, isWhite, dice[k])
			if (moveOut){
				y_coord = (isWhite) ? bottomBoard : topBoard;
				x_coord = rightBoard + side_diff*6
				tempDot[k].style.top = y_coord + "%"
				tempDot[k].style.left = x_coord+ "%"
				tempDot[k].style.display = "inline-block"
				tempDot[k].style.setProperty('--out', 1)
				tempDot[k].style.setProperty('--dieIndex', k)
			}
			continue
		}
		else if ((new_i < 0) || (new_i > 23)){
			continue
		}
		else if (oppPieces[new_i].length > 1){
			continue
		}
		stack_size = Math.max(curPieces[new_i].length, oppPieces[new_i].length)
		tempDot[k].style.top = (y_coord + direction * stack_size * stack_diff) + "%"
		tempDot[k].style.left = x_coord + "%"
		tempDot[k].style.display = "inline-block"
		tempDot[k].style.setProperty('--index', new_i)
		tempDot[k].style.setProperty('--dieIndex', k)
		tempDot[k].style.setProperty('--out', 0)
	}
}


function canIMoveOut(i, isWhite, die){
	pieces = pieceInfo[isWhite].pieces
	if (isWhite){
		if (i === (die-1)){
			return true
		}
		for (let j = i+1; j < 6; j++){
			if (pieces[j].length > 0){
				return false
			}
		}
	}
	else{
		if (i + die === 24){
			return true
		}
		for (let j = i-1; j > 17; j--){
			if (pieces[j].length > 0){
				return false
			}
		}
	}
	return true
}

function noMovesAvailable(isWhite, dice){
	pieces = pieceInfo[isWhite].pieces
	oppPieces = pieceInfo[!isWhite].pieces
	direction = isWhite ? -1 : 1
	trap = pieceInfo[isWhite].traps
	endGame = allInLastSection(isWhite)
	if (trap.length > 0){
		firstIndex = pieceInfo[isWhite].firstIndex
		for (let j = 0; j < dice.length; j++){
			new_i = firstIndex + direction * dice[j];
			if (oppPieces[new_i] <= 1){
				return true
			}
		}
	}
	else{
		for (let i = 0; i < pieces.length; i++){
			if (pieces[i].length > 0){
				for (let j = 0; j < dice.length; j++){
					new_i = i + pieceDirection * dice[j];
					if ((endGame) && ((new_i < 0) || (new_i > 23))){
						return true
					}
					if ((new_i < 0) || (new_i > 23)){
						continue
					}
					if (oppPieces[new_i] <= 1){
						return true
					}
				}
			}
		}
	}
	return false
}

function huh(){
	
}

function botTurn(){
	diceSound.play()
	dice = rollDice()
	color = isWhite ? "white" : "black"
	text.innerText = color + ", move your pieces"
}