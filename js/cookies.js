export class Cookies {
}
Cookies.choices = ["paper", "stone", "scissors"];
Cookies.current_cookie = "PaperCurrentCookie";
Cookies.scores_cookie = "PaperScoreCookie";
Cookies.cookie_suf = "path=/;Samesite=Lax;";
Cookies.delete_cookie = function (name) {
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;" + Cookies.cookie_suf;
    return true;
};
Cookies.delete_current_cookie = () => {
    Cookies.update_scores_cookie(Cookies.get_current_cookie());
    Cookies.delete_cookie(Cookies.current_cookie);
};
Cookies.get_cookies = () => {
    let cookies = {};
    for (let cook of document.cookie.split(";")) {
        const arr = cook.split("=");
        const name = arr[0].trim();
        if (name == Cookies.current_cookie || name == Cookies.scores_cookie) {
            let val = arr[1].trim();
            cookies[name] = val != '' ? JSON.parse(val) : {};
        }
    }
    return cookies;
};
Cookies.set_cookie = function (name, value, exdays = 1) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 12 * 30 * 24 * 60 * 60 * 1000));
    const data = [
        name + "=" + JSON.stringify(value),
        "expires=" + d.toUTCString(),
        Cookies.cookie_suf,
    ];
    document.cookie = data.join(";");
    return true;
};
Cookies.get_current_basic = (name) => {
    let stats = {};
    for (const choice of Cookies.choices) {
        stats[choice] = 0;
    }
    let roboitems = {};
    for (const choice of Cookies.choices) {
        roboitems[choice] = false;
    }
    // for (const choice of Game.choices){ stats[choice] = 0; }
    return {
        name: name,
        score: 0,
        stats: stats,
        roboscore: 0,
        roboitems: roboitems
    };
};
Cookies.get_current_cookie = () => {
    return Cookies.get_cookies()[Cookies.current_cookie];
};
Cookies.get_scores_cookie = () => {
    return Cookies.get_cookies()[Cookies.scores_cookie];
};
Cookies.is_robo_player = () => {
    let autorized = true;
    const cur = Cookies.get_current_cookie();
    for (let item in cur.roboitems) {
        if (!cur.roboitems[item]) {
            autorized = false;
        }
    }
    return autorized && cur.score > 0;
};
Cookies.set_current_cookie = (name) => {
    let current = Cookies.get_current_cookie();
    if (!current || current.name != name) {
        current = Cookies.get_current_basic(name);
    }
    return Cookies.set_cookie(Cookies.current_cookie, current);
};
Cookies.set_scores_cookie = (scores) => {
    return Cookies.set_cookie(Cookies.scores_cookie, scores);
};
Cookies.set_scores_test = () => {
    return {
        admin: {
            name: "admin",
            score: 0,
            stats: { paper: 5, stone: 0, scissors: 2 },
            roboscore: 0,
            roboitems: { paper: true, stone: true, scissors: true }
        }
    };
};
Cookies.update_current_cookie = (current) => {
    Cookies.set_cookie(Cookies.current_cookie, current);
    return Cookies.update_scores_cookie(current);
};
Cookies.update_scores_cookie = (current) => {
    let scores = (Cookies.get_cookies()[Cookies.scores_cookie] || {});
    scores[current.name] = current;
    Cookies.set_scores_cookie(scores);
    return true;
};
