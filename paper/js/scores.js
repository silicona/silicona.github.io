import { Board } from "./board.js";
import { Cookies } from "./cookies.js";
import { Nav } from "./nav.js";
import { ScoresHtml, ScoresOneHtml } from "./scores.html.js";
export class Scores {
}
Scores.capitalize = (str) => {
    const arr = str.split(" ").map((word) => {
        return word[0].toUpperCase() + word.substring(1);
    });
    return arr.join(" ");
};
Scores.clean_scores = (e) => {
    let current = Cookies.get_current_cookie();
    if (current.name == "admin") {
        let scores = { "admin": Cookies.get_scores_cookie()["admin"] };
        Cookies.set_scores_cookie(scores);
        Scores.set_view();
        $("#scores_footer").prepend('<div id="clean-ok" class="cleaner">Scores cleaned</div>');
        setTimeout(() => { $("#clean-ok").hide(700).remove(); }, 1500);
    }
    else {
        $(e.currentTarget.parentElement).prepend('<div id="clean-warning" class="cleaner">Only for admins</div>');
        setTimeout(() => { $("#clean-warning").hide(700).remove(); }, 1500);
    }
};
Scores.set_view = () => {
    Nav.set_view();
    $("#div_content").html(ScoresHtml);
    Scores.get_scores();
    Scores.set_view_links();
};
Scores.set_view_links = () => {
    $("#scores_btn_board").on("click", Board.set_view);
    $("#scores_btn_clean").on("click", Scores.clean_scores);
};
Scores.get_scores = () => {
    let scores = Cookies.get_scores_cookie();
    for (let player of Object.keys(scores)) {
        // let name = scores[player].name[0].toUpperCase() + scores[player].name.substring(1)
        let roboplayer = true;
        for (let item in scores[player].roboitems) {
            if (!scores[player].roboitems[item]) {
                roboplayer = false;
            }
        }
        roboplayer = roboplayer && scores[player].score > 0;
        let name = Scores.capitalize(scores[player].name);
        name += roboplayer ? " (RoboPlayer)" : " (flesh player)";
        let html = ScoresOneHtml.replace("ReplaceMe", name);
        html = html.replace("ReplaceScore", scores[player].score);
        html = html.replace("ReplaceRoboScore", scores[player].roboscore);
        $("#scores_list").append(html);
    }
};
