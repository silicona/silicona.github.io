var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { BoardBackToHuman, BoardHtml, BoardPlay, BoardRoboItems, BoardRoboPlay, BoardRoboScore } from "./board.html.js";
import { Cookies } from "./cookies.js";
import { Game } from "./game.js";
import { Nav } from "./nav.js";
import { Scores } from "./scores.js";
export class Board {
    static update_scores(score, roboscore) {
        Board.set_score(score);
        $("#roboscore").html(String(roboscore));
    }
}
Board.add_penalty = (p_choice) => {
    if ($("#sel_league").val() == "robot") {
        let current = Cookies.get_current_cookie();
        current.score -= 1;
        current.roboitems[p_choice] = false;
        $("#btn_" + p_choice).remove();
        $("#div_resp").append("<h3>You lost a roboitem</h3>");
        Board.update_scores(current.score, current.roboscore);
        Cookies.update_current_cookie(current);
    }
    return true;
};
Board.add_reward = (p_choice) => {
    let dif = +($("#sel_dif").val() || 0);
    let current = Cookies.get_current_cookie();
    current.stats[p_choice] += 1;
    switch ($("#sel_league").val()) {
        case "robot":
            current.score += dif > 1 ? 4 : 3;
            current.roboscore += 1;
            break;
        default:
            current.score += dif > 1 ? 2 : 1;
    }
    Board.update_scores(current.score, current.roboscore);
    Cookies.update_current_cookie(current);
    return true;
};
Board.buy_roboitems = (e) => {
    let cur = Cookies.get_current_cookie();
    for (let line of $(".roboitem")) {
        cur.score -= 2;
        cur.roboitems[String($(line).attr("choice"))] = true;
    }
    Cookies.update_current_cookie(cur);
    Board.set_score(cur.score);
    Board.set_board_roboplay();
    Board.set_view_links();
};
Board.check_win = (player, machine) => {
    if (player == machine) {
        return 0;
    }
    else if ((player == "stone" && machine == "scissors") ||
        (player == "paper" && machine == "stone") ||
        (player == "scissors" && machine == "paper")) {
        return 1;
    }
    else {
        return 2;
    }
};
Board.get_play_choice = (e) => __awaiter(void 0, void 0, void 0, function* () {
    Board.hide_last_choice();
    Board.set_resp("");
    let $boton = $(e.currentTarget);
    $boton.addClass("marked");
    let player = String($boton.attr("choice"));
    // let league = $("#sel_league").val() || "human"
    let dif = +($("#sel_dif").val() || 0);
    let choice = "";
    switch (dif) {
        case 2:
            if (Math.floor(Math.random() * 101) > 80) {
                choice = Board.get_winner_choice(player);
                break;
            }
        case 1:
            let current = Cookies.get_current_cookie();
            // console.log(current.stats)
            let max = 0;
            for (let item in current.stats) {
                if (current.stats[item] >= max) {
                    max = current.stats[item];
                    choice = Board.get_winner_choice(item);
                }
            }
            break;
        default:
            choice = Game.choices[Math.floor(Math.random() * (Game.choices.length - 1))];
    }
    yield Board.sleep();
    $("#fondo_" + choice).addClass("show");
    switch (Board.check_win(player, choice)) {
        case 1:
            Board.set_resp("You win!");
            Board.add_reward(player);
            break;
        case 2:
            Board.set_resp("You lose!");
            Board.add_penalty(player);
            break;
        default:
            Board.set_resp("Draw");
    }
    // await Board.sleep();
    setTimeout(() => {
        Board.hide_last_choice($boton);
    }, 1500);
    setTimeout(() => {
        Board.set_resp("");
    }, 2000);
});
Board.get_winner_choice = (player) => {
    switch (player) {
        case "stone":
            return "paper";
        case "scissors":
            return "stone";
        default:
            return "scissors";
    }
};
Board.hide_last_choice = (one = false) => {
    one ? $(one).removeClass("marked") : $(".btn_choice").removeClass("marked");
    // $(".btn_choice").removeClass("marked");
    $(".bender_choice").removeClass("show");
};
Board.init_robo_league = (e) => {
    let league = $(e.currentTarget).val();
    if (league == "robot") {
        Board.set_board_roboplay();
    }
    else {
        Board.set_board_play(BoardPlay);
        Board.set_robo_score(false);
    }
    Board.set_view_links();
};
Board.sleep = (ms = 1000) => __awaiter(void 0, void 0, void 0, function* () { return new Promise((r) => setTimeout(r, ms)); });
Board.set_board_play = (html) => {
    $("#board_play").html(html);
};
Board.set_board_roboitems = () => {
    const cur = Cookies.get_current_cookie();
    let items = [];
    for (let item in cur.roboitems) {
        if (!cur.roboitems[item]) {
            items.push(item);
        }
    }
    if (cur.score == 0 || cur.score < items.length * 2) {
        let msg;
        if (items.length > 0) {
            msg = String(items.length * 2 - cur.score) + " more score to buy roboitems for";
        }
        else {
            msg = "1 more score to play in";
        }
        // let rest = items.length * 2 - cur.score;
        $("#board_play").html(BoardBackToHuman.replace("ReplaceBack", msg));
        // $("#board_play").html(BoardBackToHuman.replace("ReplaceBack", String(rest == 0 ? 1 : rest)));
    }
    else {
        $("#board_play").html(BoardRoboItems);
        for (let line of $(".roboitem")) {
            if (!items.includes(String($(line).attr("choice")))) {
                $(line).remove();
            }
        }
        $("#btn_buy_roboitems").append(" by " + items.length * 2 + " points");
        $("#btn_buy_roboitems").on("click", Board.buy_roboitems);
    }
};
Board.set_board_roboplay = () => {
    if (Cookies.is_robo_player()) {
        Board.set_board_play(BoardRoboPlay);
        Board.set_robo_score();
    }
    else {
        Board.set_board_roboitems();
    }
};
Board.set_resp = (msg) => {
    $("#div_resp").html(msg != "" ? "<h3>" + msg + "</h3>" : msg);
};
Board.set_robo_score = (on = true) => {
    if (on) {
        $("#roboscore_title").html(BoardRoboScore);
        $("#roboscore").html(Cookies.get_current_cookie().roboscore);
    }
    else {
        $("#roboscore_title").html("");
    }
};
Board.set_score = (score) => {
    $("#score").html(score);
};
Board.set_view = () => {
    Nav.set_view();
    $("#div_content").html(BoardHtml);
    const current = Cookies.get_current_cookie();
    Board.set_board_play(BoardPlay);
    Board.set_score(current.score);
    Board.set_view_links();
    Cookies.update_scores_cookie(current);
};
Board.set_view_links = () => {
    $("#board_btn_scores").on("click", Scores.set_view);
    $(".play_part .btn_choice").on("click", Board.get_play_choice);
    $("#sel_league").on("change", Board.init_robo_league);
};
