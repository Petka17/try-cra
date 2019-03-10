import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import Signin from "components/Signin";

function Index(): React.ReactElement {
  return <h2>Home</h2>;
}

function About(): React.ReactElement {
  return <h2>About</h2>;
}

function Users(): React.ReactElement {
  return <h2>Users</h2>;
}

class App extends React.Component {
  render(): React.ReactElement {
    return (
      <Router>
        <div>
          <nav>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/about/">About</Link>
              </li>
              <li>
                <Link to="/users/">Users</Link>
              </li>
              <li>
                <Link to="/signin/">Signin</Link>
              </li>
            </ul>
          </nav>

          <Route path="/" exact component={Index} />
          <Route path="/about/" component={About} />
          <Route path="/users/" component={Users} />
          <Route path="/signin/" component={Signin} />
        </div>
      </Router>
    );
  }
}

export default App;
