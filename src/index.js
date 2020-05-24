import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import "./index.css";
import ChatApp from "./examples/ChatApp";
import FoodDeliveryApp from "./examples/FoodDeliveryApp";
import SocialMediaProfileApp from "./examples/SocialMediaProfileApp";

function HomeScreen() {
  return (
    <div style={{ padding: 20 }}>
      <h1>UI Experiments</h1>
      <ul>
        <li>
          <Link to="/chat-app">Chat App</Link>
        </li>
        <li>
          <Link to="/food-delivery-app">Food Delivery App</Link>
        </li>
        <li>
          <Link to="/social-media-profile-app">Social Media Profile App</Link>
        </li>
      </ul>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/chat-app" component={ChatApp} />
        <Route path="/food-delivery-app" component={FoodDeliveryApp} />
        <Route
          path="/social-media-profile-app"
          component={SocialMediaProfileApp}
        />
        <Route path="/" component={HomeScreen} />
      </Switch>
    </Router>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
