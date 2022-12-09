Array.prototype.numRange = function (start, end, step = 1) {
  var a = [start], b = start;
  while (b < end) {
    a.push(b += step || 1);
  }
  return a;
}

Array.prototype.shuffle = function () {
  for (let i = this.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [this[i], this[j]] = [this[j], this[i]];
  }
  return this;
}

Array.prototype.add = function (adds) {
  if(!Array.isArray(adds)) { adds = [adds]; }
  for(const item of adds){
    if(!this.includes(item)) { this.push(item); }
  }
  return this;
}

export const Sudoku = {

  vals: [1, 2, 3, 4, 5, 6, 7, 8, 9],

  add_error_board: function (boards_ko, error_board) {

    let all = [];
    for (let i = 0; i < boards_ko.length; i++) {
      if (i > 0) {
        const line = error_board[i] || [];

        if (line.length > 0 && !boards_ko[i].includes(line)) {
          boards_ko[i].push(line)
        }
      }
      all.push(boards_ko[i])
    }

    return all;

    // Enum.map(Enum.with_index(boards_ko), fn {lines_ko, index} = _item ->
    //   case index do
    //     0 ->
    //       Enum.at(boards_ko, 0)

    //     _ ->
    //       line = Enum.at(error_board, index) || []

    //       if Enum.empty?(line) || Enum.member?(lines_ko, line),
    //         do: lines_ko,
    //         else: lines_ko ++ [line]
    //   end
    // end)
  },

  flat_combis: function (aux, lines_ko = [], acc = []) {

    if (Number.isInteger(aux[0]) && aux.length == 9 && !lines_ko.includes(aux)) {
      acc.push(aux);
    } else if (Array.isArray(aux[0])) {
      acc = aux.reduce(function (acu, sub_aux) {
        acc.push(Sudoku.flat_combis(sub_aux, lines_ko, acu))
        return acc;
      }, acc)
    }

    return acc;

    // cond do
    //   is_integer(Enum.at(aux, 0)) && Enum.count(aux) == 9 && !Enum.member?(lines_ko, aux) ->
    //     acc ++ [aux]

    //   is_list(Enum.at(aux, 0)) ->
    //     Enum.reduce(aux, acc, fn sub_aux, acc ->
    //       flat_combis(sub_aux, lines_ko, acc)
    //     end)

    //   true ->
    //     acc
    // end
  },

  get_all_combis: function (posibles) {
    var xs = posibles.reduce(productAdd).filter(unico);

    return xs;

    function unico(str) {
      //console.log(str)
      for (var i=0; i<str.length; i++) {
        if(str.indexOf(str[i]) !== str.lastIndexOf(str[i])){ return false; }
      }
      return true;
      // var filtrado = str.split("").filter((item, index, ref_aux) => ref_aux.indexOf(item) == index)
      // return str.length == filtrado.length
    }

    function productAdd(xs, ys) {
      return product(add, xs, ys);
    }

    function add(a, b) {
      return String(a) + String(b);
    }

    function product(f, xs, ys) {
      var zs = [];

      var m = xs.length;
      var n = ys.length;

      for (var i = 0; i < m; i++) {
        var x = xs[i];

        for (var j = 0; j < n; j++) {
          var y = ys[j];
          var z = f(x, y);
          zs.push(z);
        }
      }

      return zs;
    }
  },

  get_board: function (inicial, boards_ko = [], combi_group = null) {

    const res = this.get_lines(inicial, boards_ko, combi_group);

    if (res.state) {
      return res.tablero;
    } else {
      const boards_ko_post = Sudoku.add_error_board(boards_ko, res.tablero)

      if(boards_ko_post[1].length > 10){
        return null;
      } else {
        return Sudoku.get_board(inicial, boards_ko_post, Sudoku.reset_combi_group(res.combi_group))
      }

    }
    // case get_lines(inicial, boards_ko, combi_group) do
    //   {:ok, tablero} ->
    //     tablero

    //   {:ko, {tablero, combi_group}} ->

    //     boards_ko_post = add_error_board(boards_ko, tablero)

    //     if Enum.count(Enum.at(boards_ko_post, 1)) > 10 do
    //       nil
    //     else
    //       get_board(inicial, boards_ko_post, reset_combi_group(combi_group))
    //     end
    // end
  },

  get_col_mem: function (tablero) {
    return tablero.reduce(function (acc, fila, index) {
      return fila.reduce(function (acc2, val, i) {
        let aux_mem = acc2[i];

        if (aux_mem) {
          aux_mem.push(val);
          acc2[i] = aux_mem;
        } else {
          acc2[i] = [val];
        }

        return acc2;
      }, acc);
    }, []);
  },

  get_cuadrado_cell: function (id_fila, id_col) {
    return Math.floor(id_fila / 3) * 3 + (Math.floor(id_col / 3) + 1);
    // def get_cuadrado_cell(id_fila, id_col), do: floor(id_fila / 3) * 3 + (floor(id_col / 3) + 1)
  },

  get_cuadrado_mem: function (tablero) {
    //console.log(tablero)
    return tablero.reduce(function (acc, fila, id_fila) {
      // console.log(acc, fila)
      var x = fila.reduce(function (acc2, val, id_col) {
        var id_cua = Sudoku.get_cuadrado_cell(id_fila, id_col) - 1
        var aux_mem = acc2[id_cua];
        // console.log(acc2, val, id_fila, id_col, id_cua, aux_mem)
        //console.log(aux_mem, id_cua)
        if (aux_mem) {
          aux_mem.push(val);
          acc2[id_cua] = aux_mem;
        } else {
          //aux_mem = [val];
          acc2[id_cua] = [val];
        }
        // console.log(acc2)
        return acc2;
      }, acc);
      // console.log(x)
      return x
    }, []);
    //   Enum.reduce(Enum.with_index(tablero), [], fn {fila, id_fila}, acc ->
    // Enum.reduce(Enum.with_index(fila), acc, fn {val, id_col}, acc2 ->
    //   id_cua = get_cuadrado_cell(id_fila, id_col) - 1
    //   aux_mem = Enum.at(acc2, id_cua)

    //   if !is_nil(aux_mem),
    //     do: List.replace_at(acc2, id_cua, aux_mem ++ [val]),
    //   else: List.insert_at(acc2, id_cua, [val])
    //     end)
    // end)
  },

  get_group_ko: function (tablero) {
    return [].numRange(0, 8).map(function (item, i) {

      return i == 0 ? tablero[0] : [];
    })
    // Enum.map(Enum.to_list(0..8), fn i ->    //  if i == 0, do: List.first(tablero), else: []    //end)
  },

  get_lines: function (tablero, group_ko, combi_group = null) {

    let [current_line, posibles] = this.get_posibles(tablero);
    const lines_ko = group_ko[current_line].map(function(item){ return item.join(""); });
    
    if (!combi_group) { combi_group = Sudoku.get_group_ko(tablero); }
    // console.log(combi_group, current_line)
    // [current_line, posibles] = get_posibles(tablero)
    // lines_ko = Enum.at(group_ko, current_line)

    // combi_group =
    //   if is_nil(combi_group) do
    //     get_group_ko(tablero)
    //   else
    //     combi_group
    //   end

    var combis = combi_group[current_line];
    if (!combis || combis.length == 0) { combis = this.get_all_combis(posibles); }
    combis = combis.filter(function(item){
      //console.log(item)
      return !lines_ko.includes(item);
    })
    //console.log(combis, lines_ko)
    // combis = Sudoku.flat_combis(combis, lines_ko);
    combi_group[current_line] = combis;
    // combis =
    //   if Enum.empty?(Enum.at(combi_group, current_line)) do
    //     get_all_combis(posibles)
    //   else
    //     Enum.at(combi_group, current_line)
    //   end

    // combis = flat_combis(combis, lines_ko)
    // combi_group = List.replace_at(combi_group, current_line, combis)

    const res = this.get_line_vals(combis);
    if (res.state) {
      var line = res.data.map((i) => parseInt(i));
      tablero.push(line);
      group_ko[current_line].push(line);

      if (tablero.length == 9) {
        return {
          state: true,
          tablero: tablero
        };
      } else {
        return this.get_lines(tablero, group_ko, combi_group)
      }

    } else {
      if (res.data.length == 0) {
        return {
          state: false,
          tablero: tablero,
          combi_group: combi_group
        }
      } else {
        console.log("Nunca debería pasar por aqui porque get_line_vals da lineas enteras por las combis")
      }
    }
    // case get_line_vals(combis) do
    //   {:ok, line} ->
    //     tablero = tablero ++ [line]

    //     if Enum.count(tablero) == 9,
    //       do: {:ok, tablero},
    //       else: get_lines(tablero, group_ko, combi_group)

    //   {:ko, line} ->
    //     cond do
    //       Enum.empty?(line) ->
    //         {:ko, {tablero, combi_group}}

    //       true ->
    //         raise ArgumentError,
    //           message:
    //             "Nunca debería pasar por aqui porque get_line_vals da lineas enteras por las combis"
    //     end
    // end
  },

  get_line_vals: function (combis) {
    if (combis.length > 0) {
      return {
        state: true,
        data: combis[Math.floor(Math.random() * combis.length)].split("")
        //data: combis.random()
      }
    } else {
      return { state: false, data: [] }
    }

    //     if !Enum.empty?(combis) do
    //   {:ok, Enum.random(combis)}
    // else
    //   {:ko, []}
    // end
  },

  get_posibles: function (tablero) {
    const mem = Sudoku.get_col_mem(tablero)
    const mem_cua = Sudoku.get_cuadrado_mem(tablero)

    //console.log(mem, mem_cua)

    return [tablero.length, Sudoku.get_valores_posibles(mem, mem_cua)]
    // mem = get_col_mem(tablero)
    // mem_cua = get_cuadrado_mem(tablero)

    // posibles = get_valores_posibles(mem, mem_cua)
    // current_line = Enum.count(tablero)

    // [current_line, posibles]
  },

  get_sudoku: function () {
    const inicial = this.vals.shuffle();
    
    return Sudoku.get_board([inicial], Sudoku.get_group_ko(inicial))
    //    inicial = [Enum.shuffle(@vals)]
    //get_board(inicial, get_group_ko(inicial))
  },

  get_sudoku_blank: function () {
    return Array(9).fill(Array(9).fill(""))
  },

  get_valores_posibles: function (cols, mem_cua) {
    let posibles = [];
    for (let id_col = 0; id_col < cols.length; id_col++) {

      const id_cell = Sudoku.get_cuadrado_cell(cols[id_col].length, id_col) - 1;
      const cua = [...(mem_cua[id_cell] || [])]
      cua.add(cols[id_col]);
      const uniq = cua.filter((item, index, ref) => ref.indexOf(item) == index);
      let valores = [...Sudoku.vals];
      for (var i = 0; i < valores.length; i++) {

        if (uniq.includes(valores[i])) {
          valores.splice(i, 1);
          i--;
        }
      }

      posibles.push(valores);

    }
    return posibles;

    // Enum.map(Enum.with_index(cols), fn {col, id_col} ->
    //   Enum.count(col)
    //    |> (&get_cuadrado_cell(&1, id_col) - 1).()
    //    |> (&Enum.at(mem_cua, &1) || []).()
    //    |> (&Enum.uniq(&1 ++ col)).()
    //    |> (&@vals -- &1).()
    // end)
  },

  reset_combi_group: function (group) {
    let combi = [];
    for (let i = 0; i < group.length; i++) {
      combi.push(i < 2 ? group[i] : [])
    }

    return combi;
    //Enum.map(Enum.with_index(group), fn {step, i} ->
    // if i < 2, do: step, else: []
    //end)
  },
}

//module.exports = { Sudoku };
// export { Sudoku };