const board = (() => {
  let fields = [];

  const reset = () => {
    fields = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  };

  const draw = () => {
    document.getElementById("board").className = "";
    const rows = [];
    rows[0] =
      "<tr><td class = 'field' fieldNumber = '0'>" +
      fields[0] +
      "</td><td class = 'field' fieldNumber = '1'>" +
      fields[1] +
      "</td><td class = 'field' fieldNumber = '2'>" +
      fields[2] +
      "</td></tr>";
    rows[1] =
      "<tr><td class = 'field' fieldNumber = '3'>" +
      fields[3] +
      "</td><td class = 'field' fieldNumber = '4'>" +
      fields[4] +
      "</td><td class = 'field' fieldNumber = '5'>" +
      fields[5] +
      "</td></tr>";
    rows[2] =
      "<tr><td class = 'field' fieldNumber = '6'>" +
      fields[6] +
      "</td><td class = 'field' fieldNumber = '7'>" +
      fields[7] +
      "</td><td class = 'field' fieldNumber = '8'>" +
      fields[8] +
      "</td></tr>";
    document.getElementById("board").innerHTML = rows.join("");
    const fs = document.getElementsByClassName("field");
    for (let i = 0; i < 9; i++) {
      fs[i].addEventListener("click", _update);
    }
  };

  const _update = evt => {
    const fieldNumber = parseInt(evt.target.getAttribute("fieldNumber"));
    let updateSuccessful = false;

    // Update only if there is not winner yet and the board is not full
    if (
      game.players[0].winner === false &&
      game.players[1].winner === false &&
      full() === false
    ) {
      // Check if the move is valid i.e. the field has not yet been clicked
      if (fields[fieldNumber] === "X" || fields[fieldNumber] === "O") {
        alert("Invalid move! Try again.");
      } else {
        fields[fieldNumber] = game.players[0].turn ? "X" : "O";
        updateSuccessful = true;
      }
    }

    if (updateSuccessful) {
      draw();
      game.checkWinner();
      game.nextMove();
    }
  };

  const full = () => {
    // Check if the board is full
    return fields.every(field => {
      return field === "X" || field === "O";
    });
  };

  const indexField = char => {
    // return an array of all field indices with 'X' or 'O'
    const iF = [];
    fields.forEach((field, index) => {
      if (field === char) {
        iF.push(index + 1);
      }
    });
    return iF;
  };

  const emptyFields = () => {
    // return an array of all field indices without 'X' or 'O'
    const eF = [];
    fields.forEach((field, index) => {
      if (field !== "X" && field !== "O") {
        eF.push(index);
      }
    });
    return eF;
  };

  const occupy = (index, char) => {
    fields[index] = char;
  };

  const checkForTwo = char => {
    // Find the first winCombinations in which two fields are occupied by char and one is empty
    // Return the index of the empty field
    // If no such combination exists, return -1;
    let i = 0;
    while (i < game.winCombinations.length) {
      let oneOccupied = false;
      let twoOccupied = false;
      let j = 0;
      while (j < 3) {
        if (
          fields[game.winCombinations[i][j] - 1] === char &&
          oneOccupied === false
        ) {
          oneOccupied = true;
        } else if (
          fields[game.winCombinations[i][j] - 1] === char &&
          oneOccupied === true
        ) {
          twoOccupied = true;
        }
        j++;
      }
      if (oneOccupied && twoOccupied) {
        const index = game.winCombinations[i].filter(index => {
          return fields[index - 1] !== "X" && fields[index - 1] !== "O";
        });
        if (index) {
          return index - 1;
        }
      }
      i++;
    }
    return -1;
  };

  return {
    reset,
    draw,
    full,
    indexField,
    emptyFields,
    occupy,
    checkForTwo
  };
})();

const Player = (name, turn, computer = false, winner = false) => {
  return { name, turn, winner, computer };
};

const game = (() => {
  const winCombinations = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [1, 4, 7],
    [2, 5, 8],
    [3, 6, 9],
    [1, 5, 9],
    [3, 5, 7]
  ];
  const players = [];
  let name1 = "";
  let name2 = "";
  let computer = false;

  const initialize = () => {
    name1 = document.getElementsByName("name1")[0].value;
    name2 = document.getElementsByName("name2")[0].value;
    computer = document.getElementById("computer").checked;

    if (name1 === "") {
      name1 = "Player1";
    }
    if (name2 === "") {
      name2 = "Player2";
    }
    _start();
  };

  const _showForm = () => {
    document.getElementById("formContainer").className = "";
    document.getElementById("restart").className = "invisible";
    document.getElementById("message").className = "invisible";
    document.getElementById("start2").className = "invisible";
    document.getElementById("board").className = "invisible";
  };

  const _start = () => {
    players[0] = Player(name1, true);
    players[1] = Player(name2, false, computer);
    board.reset();
    board.draw();
    document.getElementById("formContainer").className = "invisible";
    document.getElementById("message").className = "";
    document.getElementById("restart").className = "visible";
    document.getElementById("start2").className = "visible";
    document.getElementById("restart").addEventListener("click", _start);
    document.getElementById("start2").addEventListener("click", _showForm);
    document.getElementById("message").style.color = "green";
    document.getElementById("message").innerHTML =
      "It is " +
      (players[0].turn === true ? players[0].name : players[1].name) +
      "'s turn. To make a move click on the board.";
  };

  const checkWinner = () => {
    // Check if one winning combination is reached
    const _combiInArray = (combi, arr) => {
      return combi.every(number => {
        return arr.indexOf(number) !== -1;
      });
    };

    let winCombi = [];
    winCombinations.forEach((combi, index) => {
      if (_combiInArray(combi, board.indexField("X"))) {
        players[0].winner = true;
        winCombi = winCombinations[index];
      }
      if (_combiInArray(combi, board.indexField("O"))) {
        players[1].winner = true;
        winCombi = winCombinations[index];
      }
    });
    if (winCombi !== []) {
      winCombi.forEach(number => {
        const string = '[fieldNumber="' + (number - 1) + '"]';
        document.querySelectorAll(string)[0].style.backgroundColor = "blue";
      });
    }
  };

  const nextMove = () => {
    // Change whose turn it is and check if there is a winner or the board is full
    if (
      players[0].winner === false &&
      players[1].winner === false &&
      board.full() === false
    ) {
      if (players[0].turn === true) {
        players[0].turn = false;
        players[1].turn = true;
      } else {
        players[0].turn = true;
        players[1].turn = false;
      }

      document.getElementById("message").innerHTML =
        "It is " +
        (players[0].turn === true ? players[0].name : players[1].name) +
        "'s turn";
      if (players[1].turn === true && players[1].computer === true) {
        _computerMove();
        board.draw();
        checkWinner();
        nextMove();
      }
    } else if (players[0].winner === true) {
      document.getElementById("message").innerHTML =
        players[0].name + " is the winner. Game over!";
      document.getElementById("message").style.color = "blue";
      document.getElementById("formContainer").className = "";
      document.getElementById("restart").className = "invisible";
      document.getElementById("start2").className = "invisible";
    } else if (players[1].winner === true) {
      document.getElementById("message").innerHTML =
        players[1].name + " is the winner. Game over!";
      document.getElementById("message").style.color = "blue";
      document.getElementById("formContainer").className = "";
      document.getElementById("restart").className = "invisible";
      document.getElementById("start2").className = "invisible";
    } else if (board.full() === true) {
      document.getElementById("message").innerHTML =
        "The board is full. There is no winner. Game over!";
      document.getElementById("message").style.color = "red";
      document.getElementById("formContainer").className = "";
      document.getElementById("restart").className = "invisible";
      document.getElementById("start2").className = "invisible";
    }
  };

  const _computerMove = () => {
    const index1 = board.checkForTwo("X");
    const index2 = board.checkForTwo("O");
    // 1) Check if Player 1 has occupied two fields from a winning combination and occupy the third formContainer
    // 2) Check if the computer has occupied two fields from a winning combination and occupy the third formContainer
    // 3) Make a random move
    if (index1 !== -1) {
      board.occupy(index1, "O");
    } else if (index2 !== -1) {
      board.occupy(index2, "O");
    } else {
      const emptyFields = board.emptyFields();
      const index = Math.floor(Math.random() * emptyFields.length);
      board.occupy(emptyFields[index], "O");
    }
  };

  return {
    initialize,
    players,
    nextMove,
    checkWinner,
    winCombinations
  };
})();

document.getElementById("start").addEventListener("click", game.initialize);
