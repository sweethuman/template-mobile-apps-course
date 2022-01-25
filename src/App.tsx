import { IonApp, IonRouterOutlet, IonSplitPane, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Redirect, Route } from "react-router-dom";
import Menu from "./components/Menu";
import Page from "./pages/Page";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./theme/variables.css";
import { ItemProvider } from "./core/item/provider";
import ItemDetails from "./pages/ItemDetails";
import ItemsList from "./pages/ItemsList";
import { AuthProvider } from "./core/auth/provider";
import { Login } from "./pages/Login";
import { PrivateRoute } from "./components/auth/PrivateRoute";

setupIonicReact();

const App: React.FC = () => {
  return (
    <IonApp>
      <IonReactRouter>
        <AuthProvider>
          <IonSplitPane contentId="main">
            <Menu />
            <IonRouterOutlet id="main">
              <Route path="/" exact={true}>
                <Redirect to="/page/Inbox" />
              </Route>
              <Route path="/page/:name" exact={true}>
                <Page />
              </Route>
              <Route path="/login" component={Login} exact={true} />
              <ItemProvider>
                <PrivateRoute path="/assignments" component={ItemsList} exact={true} />
                <PrivateRoute path="/assignment" component={ItemDetails} exact={true} />
                <PrivateRoute path="/assignment/:id" component={ItemDetails} exact={true} />
              </ItemProvider>
              <Route exact path="/" render={() => <Redirect to="/assignments" />} />
            </IonRouterOutlet>
          </IonSplitPane>
        </AuthProvider>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
