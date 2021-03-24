function loadBoard() {
  const board = document.getElementById('board')
  const pieceWhite = document.getElementById('pieceWhite').value
  const pieceBlack = document.getElementById('pieceBlack').value
  const squareWhite = document.getElementById('squareWhite').value
  const squareBlack = document.getElementById('squareBlack').value

  let html = ''

  for (let rank = 7; rank >= 0; rank--) {
    html += `<div class="row">`
    for (let file = 0; file < 8; file++) {
      const squareClass = (file + rank) % 2 === 0 ? 'black-square' : 'white-square' 
      html += `<div class="square ${squareClass}">`
      if (rank === 0) {
        switch (file) {
          case 0:
          case 7:
            html += `<p class="piece white-piece">&#9814;</p>`
            break
          case 1:
          case 6:
            html += `<p class="piece white-piece">&#9816;</p>`
            break
          case 2:
          case 5:
            html += `<p class="piece white-piece">&#9815;</p>`
            break
          case 3:
            html += `<p class="piece white-piece">&#9813;</p>`
            break
          case 4:
            html += `<p class="piece white-piece">&#9812;</p>`
            break
          default:
            break
        }
      } else if (rank === 1) {
        html += `<p class="piece white-piece">&#9817;</p>`
      } else if (rank === 6) {
        html += `<p class="piece black-piece">&#9823;</p>`
      } else if (rank === 7) {
        switch (file) {
          case 0:
          case 7:
            html += `<p class="piece black-piece">&#9820;</p>`
            break
          case 1:
          case 6:
            html += `<p class="piece black-piece">&#9822;</p>`
            break
          case 2:
          case 5:
            html += `<p class="piece black-piece">&#9821;</p>`
            break
          case 3:
            html += `<p class="piece black-piece">&#9819;</p>`
            break
          case 4:
            html += `<p class="piece black-piece">&#9818;</p>`
            break
          default:
            break
        }
      }
      html += `</div>`
    }
    html += `</div>`
  }

  board.innerHTML = html

  resizeBoard()
  theme()
}

function resizeBoard() {
  const board = document.getElementById('board')
  const squares = document.getElementsByClassName('square')
  const pieces = document.getElementsByClassName('piece')

  const squareWidth = Math.floor(board.offsetWidth / 8)

  for (square of squares) {
    square.style.width = `${squareWidth}px`
    square.style.height = `${squareWidth}px`
  }

  for (piece of pieces) {
    piece.style.fontSize = `${Math.floor(100 * squareWidth / 159)}px`
  }
}

function theme() {
  const board = document.getElementById('board')
  const whiteSquares = document.getElementsByClassName('white-square')
  const whitePieces = document.getElementsByClassName('white-piece')
  const blackSquares = document.getElementsByClassName('black-square')
  const blackPieces = document.getElementsByClassName('black-piece')
  const pieceWhite = document.getElementById('pieceWhite').value
  const pieceBlack = document.getElementById('pieceBlack').value
  const squareWhite = document.getElementById('squareWhite').value
  const squareBlack = document.getElementById('squareBlack').value

  document.getElementById('board-container').style.backgroundImage = `linear-gradient(${squareWhite}, ${squareBlack})`
  document.getElementById('pieceWhiteColor').innerHTML = pieceWhite
  document.getElementById('pieceBlackColor').innerHTML = pieceBlack
  document.getElementById('squareWhiteColor').innerHTML = squareWhite
  document.getElementById('squareBlackColor').innerHTML = squareBlack

  for (square of whiteSquares) {
    square.style.backgroundColor = squareWhite
  }

  for (square of blackSquares) {
    square.style.backgroundColor = squareBlack
  }

  for (piece of whitePieces) {
    piece.style.color = pieceWhite
  }

  for (piece of blackPieces) {
    piece.style.color = pieceBlack
  }
}
