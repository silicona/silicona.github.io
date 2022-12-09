import { Cookies } from "./cookies.js";
import { Login } from "./login.js";
import { NavHtml } from "./nav.html.js";
import { Scores } from "./scores.js";
export class Nav {
}
Nav.logout = () => {
    Cookies.delete_current_cookie();
    Login.set_view();
};
Nav.set_name_gamer = () => {
    let current = Cookies.get_current_cookie();
    if (!current || $.isEmptyObject(current)) {
        Login.set_view();
    }
    else {
        $("#nav_name").html(Scores.capitalize(current.name));
    }
    return true;
};
Nav.set_view = () => {
    $("#div_nav").html(NavHtml);
    Nav.set_view_links();
    Nav.set_name_gamer();
};
Nav.set_view_links = () => {
    $("#logout_btn").on("click", Nav.logout);
};
