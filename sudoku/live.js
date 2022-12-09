import { Sudoku } from './sudoku.js';

export const Live = {
  val_ko_visible: 10,
  val_ko: 20,
  val_ok: 90,
  dif: 100,
  difs: {
    "Chônin": 70,
    "Daimio": 50,
    "Samurai": 35,
    "Shögun": 25
  },
  posibles: false,
  corregir: false,

  spinner: "<div id=\"spinner\"><div class=\"lds-grid\"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div>",

  add_value_to_sudoku: function (id_line, id_col, value) {
    var valor = parseInt(value);

    if (isNaN(valor) || valor <= 0) {
      valor = 0;
    } else {
      // var ko_visible = Live.is_ko_visible(Live.board, valor, id_line, id_col)
      // var value_ok = Live.sudoku[id_line][id_col] == valor

      // valor = value_ok ? valor + Live.val_ok : valor + Live.val_ko
      // valor = ko_visible ? valor - Live.val_ko_visible : valor

      if (Live.sudoku[id_line][id_col] == valor) {
        valor = valor + Live.val_ok
      } else {
        if (Live.is_ko_visible(Live.board, valor, id_line, id_col)) {
          valor = valor + Live.val_ko_visible
        } else {
          valor = valor + Live.val_ko
        }
      }
    }

    Live.board[id_line][id_col] = valor;

    return Live.board
  },

  blur_sudoku: function (e) {
    var $cell = $(e.currentTarget)
    if ($cell.hasClass("base")) { return false; }

    var id_line = parseInt($cell.attr("data-line")),
      id_col = parseInt($cell.attr("data-col")),
      value = $cell.val();

    Live.board = Live.add_value_to_sudoku(id_line, id_col, value);
    Live.set_board(Live.board);
    Live.set_resp(Live.check_end());
  },

  change_corregir: function (e) {
    Live.corregir = this.checked;
    var msg = false;
    if (Live.corregir) {
      msg = "Corrección activada";
      $("#board").addClass("corregir");
    } else {
      msg = "Corrección desactivada";
      $("#board").removeClass("corregir");
    }

    Live.set_resp(msg);
  },

  change_posibles: function (e) {
    Live.posibles = this.checked;

    Live.set_resp(Live.posibles ? "Posibilidades automáticas activada" : false);
  },

  check_end: function () {
    var acc = { fin: true, board_c: [] };

    for (const line of Live.board) {
      line.reduce(function (acc_fin, cell, i) {
        if (cell == 0 || (cell > 9 && cell < Live.val_ok)) {
          return false
        } else {
          acc_fin;
        }
      }, acc.fin);

      if (acc.fin) {
        acc.board_c.push(line.map((x) => x % 10))
      } else {
        break;
      }
    };

    var fin_ok = acc.fin && acc.board_c.reduce(function (acu, line, i) {
      return acu && line.reduce(function (int_acu, val, j) {
        return int_acu && val == Live.sudoku[i][j]
      }, true);
    }, true)

    return fin_ok ? "Has terminado el sudoku, chapa blanda" : Live.check_false_end();
  },

  check_false_end: function () {

    var wrongs = Live.board.flat()
      .filter((val) => val == 0 || (val > Live.val_ko_visible && val < Live.val_ok))

    if (!wrongs.includes(0) && wrongs.length > 0) {
      return "Parece que algo está mal en el sudoku, simio dominante";
    }

    return false;
  },

  click_cell: function (e) {
    var $cell = $(e.currentTarget)

    if ($cell.hasClass("base")) { $cell.trigger("blur"); }

    var id_line = parseInt($cell.attr("data-line")),
      id_col = parseInt($cell.attr("data-col")),
      value = $cell.val();

    if (value != "") { $cell.trigger("select"); }

    var msg = Live.get_posibilidades(id_line, id_col);
    Live.set_resp(msg);
  },

  click_iniciar: function (e) {

    var dif = $("#sel_dif").val();

    Live.dif = dif;
    var board = Live.spinner;
    var title_dif = Object.keys(Live.difs).filter(key => Live.difs[key] == dif)[0];
    var msg = "Preparando Sudoku " + title_dif;

    $("#btn_iniciar").attr("disabled", true);
    $("#board").html(board);
    Live.set_resp(msg);

    setTimeout(function(){
      try {

        Live.sudoku = Sudoku.get_sudoku();
        Live.board = Live.delete_vals(Live.sudoku, Live.dif);
        board = Live.board;
        msg = "Sudoku " + title_dif + " preparado, human@!!";
      } catch {
        board = Sudoku.get_sudoku_blank();
        msg = "Me has provocado un error, human@!!<br>Inténtalo de nuevo.";
      }
  
      Live.set_resp(msg)
      Live.set_board(board);
      $("#btn_iniciar").attr("disabled", false);
    }, 0);
  },


  delete_vals: function (sudoku, dif) {
    return sudoku.map(function (line) {
      return line.map(function (val) {
        return Math.floor(Math.random() * 101) / dif >= 1 ? 0 : val;
      });
    });
  },

  get_posibilidades: function (id_line, id_col) {

    let msg = false;
    if (Live.posibles) {
      var board = [...Live.board]
      var line = [...board[id_line]]
      line.add(Sudoku.get_col_mem(board)[id_col]);
      var l = line.add(Sudoku.get_col_mem(board)[id_col]);

      var x = Sudoku.get_cuadrado_mem(board)[Sudoku.get_cuadrado_cell(id_line, id_col) - 1]

      line.add(x)
      board[id_line] = line;

      var vals = board[id_line].reduce(function (acc, val) {
        val = val % 10;
        if (val > 0 && val < 10) {
          acc.add(val);
        }

        return acc;
      }, [])
        .filter((item, i, arr) => arr.indexOf(item) == i);

      if (vals.length > 0) {
        var filtered = Array(9).fill(null)
          .map((it, i) => i + 1)
          .filter((val) => !vals.includes(val))
          .join(", ")
        msg = "Los valores posibles son: " + filtered;
      }
    }

    return msg;
  },

  init_sudoku: function () {

    Live.dif = this.difs["Daimio"];

    this.set_difs(Live.dif);
    // Live.sudoku = [
    //   [9, 1, 8, 2, 6, 7, 4, 3, 5],
    //   [6, 3, 2, 4, 5, 1, 9, 8, 7],
    //   [5, 7, 4, 3, 9, 8, 1, 6, 2],
    //   [1, 8, 6, 9, 3, 2, 5, 7, 4],
    //   [4, 2, 3, 7, 8, 5, 6, 1, 9],
    //   [7, 5, 9, 1, 4, 6, 3, 2, 8],
    //   [2, 6, 1, 5, 7, 4, 8, 9, 3],
    //   [8, 9, 5, 6, 2, 3, 7, 4, 1],
    //   [3, 4, 7, 8, 1, 9, 2, 5, 6]
    // ];

    // Live.board2 = [
    //   [0, 1, 8, 2, 6, 7, 4, 3, 5],
    //   [6, 3, 2, 4, 5, 1, 9, 8, 7],
    //   [5, 7, 4, 3, 9, 8, 1, 6, 2],
    //   [1, 8, 6, 9, 3, 2, 5, 7, 4],
    //   [4, 2, 3, 7, 8, 5, 6, 1, 9],
    //   [7, 5, 9, 1, 4, 6, 3, 2, 8],
    //   [2, 6, 1, 5, 7, 4, 8, 9, 3],
    //   [8, 9, 5, 6, 2, 3, 7, 4, 1],
    //   [3, 4, 7, 8, 1, 9, 2, 5, 6]
    // ];
    // Live.board = [
    //   [0, 1, 8, 2, 0, 0, 0, 3, 5],
    //   [6, 3, 2, 0, 5, 1, 9, 0, 0],
    //   [5, 7, 4, 3, 0, 8, 1, 6, 0],
    //   [1, 8, 6, 0, 0, 2, 5, 0, 0],
    //   [4, 0, 3, 0, 8, 0, 0, 0, 0],
    //   [7, 0, 9, 1, 4, 6, 0, 2, 0],
    //   [2, 6, 1, 0, 7, 4, 0, 0, 3],
    //   [8, 0, 5, 0, 0, 3, 0, 4, 0],
    //   [3, 0, 7, 0, 0, 9, 0, 0, 6]
    // ]

    this.set_board(Sudoku.get_sudoku_blank());
    $(".cell-input").addClass("base");

    $("#check_corregir").prop("checked", false).on("click", Live.change_corregir);
    $("#check_posibles").prop("checked", false).on("click", Live.change_posibles);

    this.set_resp("Pulsa el botón para comenzar, bípedo dominante");

    $("#btn_iniciar").on("click", this.click_iniciar);
  },

  is_ko_visible: function (board, val, id_line, id_col) {

    const id_cua = Sudoku.get_cuadrado_cell(id_line, id_col) - 1;
    if (Live.is_value_repeat(board[id_line], val, id_col)) {
      return true;
    } else if (Live.is_value_repeat(Sudoku.get_col_mem(board)[id_col], val, id_line)) {
      return true;
    } else if (Live.is_value_repeat(Sudoku.get_cuadrado_mem(board)[id_cua], val)) {
      return true;
    } else {
      return false;
    }
  },

  is_value_repeat: function (line, val, id_ref = null) {
    var arr_check = line.flat().filter(function (cell, i, arr) {
      return id_ref && i == id_ref && cell == val ? false : cell == val;
    })

    return arr_check.length > 0;
  },

  set_board: function (board) {
    var html = board.reduce(function (acc, line, i) {
      acc += "<div class=\"line\">"
      acc += line.reduce(function (acc2, cell, j) {
        var cell_id = "c-" + i + "-" + j
        acc2 += "<div class=\"cell\" id=" + cell_id + ">"
        switch (true) {
          case cell > Live.val_ok:
            var cell_val = cell - Live.val_ok;
            acc2 += "<input type=\"text\" class=\"cell-input ok\" maxlength=\"1\" phx-blur=\"sudoku-blur\" "
            acc2 += "data-line=" + i + " data-col=" + j + " value=" + cell_val + ">"
            break;
          case cell > (Live.val_ok - Live.val_ko_visible):
            var cell_val = cell - (Live.val_ok - Live.val_ko_visible);
            acc2 += "<input type=\"text\" class=\"cell-input ok ko-visible\" maxlength=\"1\" phx-blur=\"sudoku-blur\" "
            acc2 += "data-line=" + i + " data-col=" + j + " value=" + cell_val + ">"
            break;
          case cell > Live.val_ko:
            var cell_val = cell - Live.val_ko;
            acc2 += "<input type=\"text\" class=\"cell-input ko\" maxlength=\"1\" phx-blur=\"sudoku-blur\" "
            acc2 += "data-line=" + i + " data-col=" + j + " value=" + cell_val + ">"
            break;
          case cell > Live.val_ko_visible:
            var cell_val = cell - Live.val_ko_visible;
            acc2 += "<input type=\"text\" class=\"cell-input ko ko-visible\" maxlength=\"1\" phx-blur=\"sudoku-blur\" "
            acc2 += "data-line=" + i + " data-col=" + j + " value=" + cell_val + ">"
            break;
          case cell > 0 || cell === "":
            acc2 += "<span class=\"cell-input base\">" + cell + "</span>"
            break;
          default:
            var cell_val = cell - Live.val_ko_visible;
            acc2 += "<input type=\"text\" class=\"cell-input\" maxlength=\"1\" phx-blur=\"sudoku-blur\" "
            acc2 += "data-line=" + i + " data-col=" + j + ">"
        }
        acc2 += "</div>";
        return acc2;
      }, "");
      acc += "</div>"

      return acc;
    }, "");

    $("#board").html(html);

    $(".cell-input").on("blur", Live.blur_sudoku)
    $(".cell-input").on("click", Live.click_cell)
  },

  set_difs: function (dif = false) {
    var html = [];
    for (let title in Live.difs) {
      var sel = (dif == Live.difs[title]) ? "selected=selected" : "";
      html.push("<option value=" + Live.difs[title] + " " + sel + ">" + title + "</option>")
    }
    $("#sel_dif").html(html.join(""));
  },

  set_resp: function (msg = false) {
    var resp_msg = msg ? "<h3>" + msg + "</h3>" : "";
    $("#resp").html(resp_msg);
  },
};
