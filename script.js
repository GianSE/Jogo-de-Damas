const board = document.getElementById("board");
const squares = [];
let selectedPiece = null;
let turn = "red";
let canContinueCapturing = false; // Permite capturas consecutivas

// Cria o tabuleiro
for (let row = 0; row < 8; row++) {
  for (let col = 0; col < 8; col++) {
    const square = document.createElement("div");
    square.classList.add("square");

    if ((row + col) % 2 === 0) {
      square.classList.add("white");
    } else {
      square.classList.add("black");

      if (row < 3) {
        const piece = document.createElement("div");
        piece.classList.add("piece", "red");
        piece.setAttribute("draggable", true);
        square.appendChild(piece);
      } else if (row > 4) {
        const piece = document.createElement("div");
        piece.classList.add("piece", "blue");
        piece.setAttribute("draggable", true);
        square.appendChild(piece);
      }
    }

    square.dataset.row = row;
    square.dataset.col = col;
    square.addEventListener("click", onSquareClick);
    board.appendChild(square);
    squares.push(square);
  }
}

function onSquareClick(e) {
  const square = e.target.closest(".square");

  // Se uma peça já estiver selecionada, tenta mover
  if (selectedPiece) {
    movePiece(square);
  } else {
    // Seleciona a peça
    if (square.children.length && square.children[0].classList.contains(turn)) {
      selectPiece(square.children[0]);
    }
  }
}

function selectPiece(piece) {
  selectedPiece = piece;
  piece.classList.add("selected");
}

// Função para resetar o jogo
function resetGame() {
  // Limpa o tabuleiro removendo todas as peças
  squares.forEach(square => {
    if (square.children.length) {
      square.removeChild(square.children[0]);
    }
  });

  // Reposiciona as peças vermelhas e azuis nas linhas iniciais
  squares.forEach(square => {
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);

    if (row < 3 && (row + col) % 2 !== 0) {
      const piece = document.createElement("div");
      piece.classList.add("piece", "red");
      piece.setAttribute("draggable", true);
      square.appendChild(piece);
    } else if (row > 4 && (row + col) % 2 !== 0) {
      const piece = document.createElement("div");
      piece.classList.add("piece", "blue");
      piece.setAttribute("draggable", true);
      square.appendChild(piece);
    }
  });

  // Limpa a mensagem de vitória
  const message = document.getElementById("message");
  message.textContent = "";

  // Reseta a vez para o jogador vermelho
  turn = "red";
  selectedPiece = null;
  canContinueCapturing = false;
}

// Exibe o diálogo de confirmação
function showConfirmation() {
  document.getElementById("confirmation").style.display = "block";
}

// Oculta o diálogo de confirmação
function hideConfirmation() {
  document.getElementById("confirmation").style.display = "none";
}

// Adiciona o evento de clique ao botão de resetar
document.getElementById("resetButton").addEventListener("click", showConfirmation);

// Adiciona o evento para o botão "Sim"
document.getElementById("confirmYes").addEventListener("click", () => {
  resetGame(); // Reseta o jogo
  hideConfirmation(); // Oculta a confirmação
});

// Adiciona o evento para o botão "Não"
document.getElementById("confirmNo").addEventListener("click", hideConfirmation);


// Função para verificar o vencedor
function checkForWinner() {
  const redPieces = document.querySelectorAll(".piece.red").length;
  const bluePieces = document.querySelectorAll(".piece.blue").length;
  const message = document.getElementById("message");

  if (redPieces === 0) {
    message.innerHTML = "Vencedor Azul";
  } else if (bluePieces === 0) {
    message.innerHTML = "Cada segundo que passo ao seu lado me deixa<br> mais crente que existem anjos na Terra.<br> Amo você, minha namorada linda sz<br><br> Ass: Teu namorado Gian kkkk<br> Para: Thalia S2";
  }
}

// Chame a função após cada movimento de peça, capturando ou não
function movePiece(square) {
  // Verifica se o quadrado já contém uma peça
  if (square.children.length) {
    deselectPiece();
    return;
  }

  const row = parseInt(square.dataset.row);
  const col = parseInt(square.dataset.col);
  const selectedRow = parseInt(selectedPiece.parentNode.dataset.row);
  const selectedCol = parseInt(selectedPiece.parentNode.dataset.col);

  // Verifica se a peça é uma dama
  const isDama = selectedPiece.classList.contains("dama");

  if (isDama) {
    // Verifica se o movimento da dama é válido (pode capturar)
    if (validDamaMove(selectedRow, selectedCol, row, col)) {
      // Variáveis para capturar uma peça
      let captured = false;

      // Verifica se há uma captura no caminho
      const rowDirection = row > selectedRow ? 1 : -1;
      const colDirection = col > selectedCol ? 1 : -1;

      let middleRow = selectedRow + rowDirection;
      let middleCol = selectedCol + colDirection;

      while (middleRow !== row && middleCol !== col) {
        const middleSquare = squares.find(sq => sq.dataset.row == middleRow && sq.dataset.col == middleCol);

        if (middleSquare.children.length && !middleSquare.children[0].classList.contains(turn)) {
          // Remove a peça capturada
          middleSquare.removeChild(middleSquare.children[0]);
          captured = true; // Marca que uma peça foi capturada
        }

        middleRow += rowDirection;
        middleCol += colDirection;
      }

      // Move a dama
      square.appendChild(selectedPiece);
      selectedPiece.classList.remove("selected");

      // Se a dama capturou uma peça, verifica se pode capturar mais
      if (captured && canCaptureMore(row, col)) {
        canContinueCapturing = true; // Permite capturas consecutivas
        selectPiece(selectedPiece); // Mantém a peça selecionada
      } else {
        selectedPiece = null;
        canContinueCapturing = false;
        turn = turn === "red" ? "blue" : "red"; // Alterna a vez
        checkForWinner(); // Verifica se há um vencedor após o movimento
      }
    } else {
      deselectPiece();
    }
  } else {
    // Regras para peças normais
    if (!canContinueCapturing) {
      // Restrições de movimento para peças normais (não podem mover para trás)
      if (selectedPiece.classList.contains("red") && row <= selectedRow) {
        deselectPiece();
        return;
      }
      if (selectedPiece.classList.contains("blue") && row >= selectedRow) {
        deselectPiece();
        return;
      }
    }

    // Verifica se o movimento é uma captura (duas casas de distância)
    if (Math.abs(row - selectedRow) === 2 && Math.abs(col - selectedCol) === 2) {
      const middleRow = (row + selectedRow) / 2;
      const middleCol = (col + selectedCol) / 2;
      const middleSquare = squares.find(sq => sq.dataset.row == middleRow && sq.dataset.col == middleCol);

      // Verifica se há uma peça inimiga para capturar
      if (middleSquare.children.length && !middleSquare.children[0].classList.contains(turn)) {
        // Remove a peça capturada
        middleSquare.removeChild(middleSquare.children[0]);

        // Move a peça
        square.appendChild(selectedPiece);
        selectedPiece.classList.remove("selected");

        // Checa se a peça se torna dama
        promoteToDamaIfNeeded(square);

        // Verifica se há mais peças para capturar
        if (canCaptureMore(row, col)) {
          canContinueCapturing = true; // Permite capturar mais peças
          selectPiece(selectedPiece); // Mantém a peça selecionada
        } else {
          // Alterna a vez, se não houver mais capturas disponíveis
          selectedPiece = null;
          canContinueCapturing = false;
          turn = turn === "red" ? "blue" : "red";
          checkForWinner(); // Verifica se há um vencedor após o movimento
        }
      } else {
        deselectPiece();
      }
    }
    // Verifica se o movimento é válido (uma casa de distância)
    else if (Math.abs(row - selectedRow) === 1 && Math.abs(col - selectedCol) === 1 && !canContinueCapturing) {
      square.appendChild(selectedPiece);
      selectedPiece.classList.remove("selected");
      promoteToDamaIfNeeded(square);
      selectedPiece = null;
      turn = turn === "red" ? "blue" : "red";
      checkForWinner(); // Verifica se há um vencedor após o movimento
    } else {
      deselectPiece();
    }
  }
}


// Função para verificar se o movimento da dama é válido, com limite ao capturar
function validDamaMove(selectedRow, selectedCol, targetRow, targetCol) {
  const rowDiff = Math.abs(targetRow - selectedRow);
  const colDiff = Math.abs(targetCol - selectedCol);

  // Verifica se o movimento está em uma diagonal
  if (rowDiff !== colDiff) {
    return false;
  }

  const rowDirection = targetRow > selectedRow ? 1 : -1;
  const colDirection = targetCol > selectedCol ? 1 : -1;

  let row = selectedRow + rowDirection;
  let col = selectedCol + colDirection;
  let enemyPieceCount = 0; // Para contar peças inimigas no caminho
  let capturedPieceRow = null;
  let capturedPieceCol = null;

  // Verifica cada casa entre a origem e o destino
  while (row !== targetRow && col !== targetCol) {
    const intermediateSquare = squares.find(sq => sq.dataset.row == row && sq.dataset.col == col);
    
    // Se houver uma peça inimiga
    if (intermediateSquare.children.length) {
      const piece = intermediateSquare.children[0];
      if (piece.classList.contains(turn)) {
        return false; // Se a peça no caminho é do próprio jogador
      } else {
        enemyPieceCount++;
        capturedPieceRow = row; // Armazena a posição da peça capturada
        capturedPieceCol = col;

        if (enemyPieceCount > 1) {
          return false; // Dama não pode pular mais de uma peça inimiga por vez
        }
      }
    }
    
    row += rowDirection;
    col += colDirection;
  }

  // Se capturou uma peça, a dama deve parar exatamente um quadrado após a peça
  if (enemyPieceCount === 1) {
    const stopRow = capturedPieceRow + rowDirection;
    const stopCol = capturedPieceCol + colDirection;

    if (stopRow === targetRow && stopCol === targetCol) {
      return true; // Movimento é válido se parar um quadrado após a captura
    } else {
      return false; // Movimento inválido se tentar continuar além do quadrado imediato
    }
  }

  // Permite movimento livre se não capturar
  return enemyPieceCount === 0;
}


function deselectPiece() {
  if (selectedPiece) {
    selectedPiece.classList.remove("selected");
    selectedPiece = null;
    canContinueCapturing = false;
  }
}

// Verifica se há mais peças para capturar ao redor da posição atual
function canCaptureMore(row, col) {
  const directions = [
    { row: 2, col: 2 },
    { row: 2, col: -2 },
    { row: -2, col: 2 },
    { row: -2, col: -2 }
  ];

  for (let dir of directions) {
    const newRow = row + dir.row;
    const newCol = col + dir.col;
    const middleRow = row + dir.row / 2;
    const middleCol = col + dir.col / 2;

    const middleSquare = squares.find(sq => sq.dataset.row == middleRow && sq.dataset.col == middleCol);
    const destinationSquare = squares.find(sq => sq.dataset.row == newRow && sq.dataset.col == newCol);

    // Verifica se há uma peça inimiga e se o quadrado de destino está vazio
    if (
      middleSquare && destinationSquare &&
      middleSquare.children.length && // Verifica se há uma peça no meio
      !middleSquare.children[0].classList.contains(turn) && // A peça no meio é do oponente
      !destinationSquare.children.length // O destino está vazio
    ) {
      return true; // Há mais capturas possíveis
    }
  }

  return false; // Não há mais capturas possíveis
}


// Função para promover a peça a dama se ela chegar à última linha
function promoteToDamaIfNeeded(square) {
    if (square.children.length && 
        ((square.children[0].classList.contains("red") && square.dataset.row == 7) ||
         (square.children[0].classList.contains("blue") && square.dataset.row == 0))) {
        
        const piece = square.children[0];
        piece.classList.add("dama");
        
        // Adiciona o círculo branco
        const innerCircle = document.createElement("div");
        innerCircle.classList.add("inner-circle");
        piece.appendChild(innerCircle);
    }
}

// Verifica se a peça é dama
function isDama(piece) {
  return piece.classList.contains("dama");
}