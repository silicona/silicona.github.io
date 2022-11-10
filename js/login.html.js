export const LoginHtml = `
<section id="login">
  <article id="login_title" class="login_part">
    <h2>Identify, human!</h2>
  </article>
  <article id="login_form" class="login_part">
    <form>
      <div id="div_name" class="form_part">
        <label>Nombre:</label>
        <input type="text" id="login_name"/>
      </div>
      <div id="div_pass" class="form_part">
        <label>Password:</label>
        <input type="text" id="login_pass"/>
      </div>
      <div id="div_resp" class="form_part">
        <div id="login_resp"></div>
      </div>
      <div id="div_button" class="form_part">
        <button id="login_btn">Join the league</button>
      </div>
    </form>
  </article>
</section>
`;
