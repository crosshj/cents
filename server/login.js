//TODO: this should probably just be handled in the client

const login = (req, res) => {
  res.header('Content-Type', 'text/html').send(`
    <h3>Log in :</h3>
    <form action="./login" method="post">
      <p>TODO: make this look nice</p>
      <input name="username" id="username" type="text" placeholder="Your username" />
      <input name="password" id="password" type="password" placeholder="Your password"/>
      <input type="submit" />
    </form>
  `);
};

module.exports = login;
