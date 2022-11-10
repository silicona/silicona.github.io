import { Login } from "./login.js";
export class Game {
}
Game.choices = ["paper", "stone", "scissors"];
Game.init_game = () => {
    Login.set_view();
};
